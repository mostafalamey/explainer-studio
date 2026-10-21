"""Selector lifecycle regressions; isolated HTTP fixtures never use real credentials."""
from contextlib import contextmanager, redirect_stdout
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import io
import json
import os
import subprocess
import sys
import tempfile
import threading
import unittest
from unittest.mock import patch, Mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1] /
                     'plugins/explainer-studio/skills/create-explainer/scripts'))
import launch_selector as launcher


@contextmanager
def health_server(payload, redirect=False):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def do_GET(self):
            if redirect:
                self.send_response(302)
                self.send_header('Location', '/redirected')
                self.end_headers()
                return
            self.send_response(200)
            self.end_headers()
            self.wfile.write(json.dumps(payload).encode())
    server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield server.server_port
    finally:
        server.shutdown()
        server.server_close()
        thread.join()


class LauncherTests(unittest.TestCase):
    def test_existing_8899_is_reused_before_starting_at_free_default(self):
        with patch.object(launcher, 'listening_ports', return_value=[]), \
             patch.object(launcher, 'healthy', side_effect=lambda port: port == 8899), \
             patch.object(launcher, 'start_server') as start, \
             patch.object(launcher.webbrowser, 'open') as browser, \
             redirect_stdout(io.StringIO()) as output:
            launcher.main(['--no-browser'])
        self.assertEqual(output.getvalue().strip(), 'http://127.0.0.1:8899/style-selector.html')
        start.assert_not_called()
        browser.assert_not_called()

    def test_known_port_wins_when_multiple_servers_exist(self):
        with patch.object(launcher, 'listening_ports', return_value=[]), \
             patch.object(launcher, 'healthy', side_effect=lambda port: port in (8869, 8899)):
            self.assertEqual(launcher.find_existing(8899), 8899)

    def test_custom_listener_is_discovered_with_real_health_request(self):
        with health_server({'application': 'explainer-studio', 'version': launcher.VERSION}) as port, \
             patch.object(launcher, 'listening_ports', return_value=[port]), \
             patch.object(launcher, 'DISCOVERY_PORTS', []), \
             patch.dict(os.environ, {'HTTP_PROXY': 'http://127.0.0.1:1',
                                     'http_proxy': 'http://127.0.0.1:1', 'NO_PROXY': '', 'no_proxy': ''}):
            self.assertEqual(launcher.find_existing(port), port)

    def test_wrong_identity_version_shape_and_redirect_are_rejected(self):
        for payload in ({'application': 'other', 'version': launcher.VERSION},
                        {'application': 'explainer-studio', 'version': '0.1'}, []):
            with self.subTest(payload=payload), health_server(payload) as port:
                self.assertFalse(launcher.healthy(port))
        with health_server({}, redirect=True) as port:
            self.assertFalse(launcher.healthy(port))

    def test_listener_formats_and_missing_netstat(self):
        sample = ('TCP 127.0.0.1:8899 0.0.0.0:0 LISTENING\n'
                  'tcp 0 0 127.0.0.1:9234 0.0.0.0:* LISTEN\n'
                  'tcp4 0 0 *.9345 *.* LISTEN\n'
                  'TCP [::]:9456 [::]:0 LISTENING\n'
                  'TCP 127.0.0.1:9999 0.0.0.0:0 ESTABLISHED\n')
        with patch.object(launcher.subprocess, 'run', return_value=Mock(stdout=sample)):
            self.assertEqual(launcher.listening_ports(), [8899, 9234, 9345, 9456])
        with patch.object(launcher.subprocess, 'run', side_effect=FileNotFoundError):
            self.assertEqual(launcher.listening_ports(), [])

    def test_fresh_start_only_after_discovery_finds_none(self):
        calls = []
        with patch.object(launcher, 'find_existing', side_effect=lambda p: calls.append('discover')), \
             patch.object(launcher, 'start_server', side_effect=lambda p, f: calls.append('start') or 8899), \
             redirect_stdout(io.StringIO()):
            launcher.main(['--no-browser'])
        self.assertEqual(calls, ['discover', 'start'])

    def test_real_fresh_server_is_healthy_and_outlives_launcher_function(self):
        children = []
        real_popen = subprocess.Popen

        def capture(*args, **kwargs):
            child = real_popen(*args, **kwargs)
            children.append(child)
            return child

        with tempfile.TemporaryDirectory() as folder:
            try:
                with launcher.socket.socket() as sock:
                    sock.bind(('127.0.0.1', 0))
                    port = sock.getsockname()[1]
                with patch.object(launcher.subprocess, 'Popen', side_effect=capture):
                    started = launcher.start_server(port, Path(folder))
                self.assertTrue(launcher.healthy(started))
                self.assertIsNone(children[0].poll())
            finally:
                for child in children:
                    child.terminate()
                    child.wait(timeout=5)

    def test_failed_health_check_stops_only_spawned_child_without_retry_storm(self):
        child = Mock()
        child.poll.return_value = None
        with tempfile.TemporaryDirectory() as folder, \
             patch.object(launcher.socket, 'socket'), \
             patch.object(launcher, 'healthy', return_value=False), \
             patch.object(launcher.time, 'sleep'), \
             patch.object(launcher.subprocess, 'Popen', return_value=child) as spawn:
            with self.assertRaisesRegex(SystemExit, 'failed its health check'):
                launcher.start_server(8869, Path(folder))
        self.assertEqual(spawn.call_count, 1)
        child.terminate.assert_called_once()
        child.wait.assert_called_once()


if __name__ == '__main__':
    unittest.main()
