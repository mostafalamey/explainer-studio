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
    def test_existing_fixed_port_is_reused(self):
        with patch.object(launcher, 'healthy', return_value=True) as health, \
             patch.object(launcher, 'start_server') as start, \
             patch.object(launcher.webbrowser, 'open') as browser, \
             redirect_stdout(io.StringIO()) as output:
            launcher.main(['--no-browser'])
        health.assert_called_once_with(7719)
        self.assertEqual(output.getvalue().strip(), 'http://127.0.0.1:7719/style-selector.html')
        start.assert_not_called()
        browser.assert_not_called()

    def test_other_ports_are_rejected(self):
        with patch.object(launcher, 'healthy') as health, \
             patch.object(launcher, 'start_server') as start, \
             patch('sys.stderr', new_callable=io.StringIO):
            with self.assertRaises(SystemExit):
                launcher.main(['--port', '8899', '--no-browser'])
        health.assert_not_called()
        start.assert_not_called()

    def test_health_bypasses_proxy(self):
        with health_server({'application': 'explainer-studio', 'version': launcher.VERSION}) as port, \
             patch.dict(os.environ, {'HTTP_PROXY': 'http://127.0.0.1:1',
                                     'http_proxy': 'http://127.0.0.1:1', 'NO_PROXY': '', 'no_proxy': ''}):
            self.assertTrue(launcher.healthy(port))

    def test_wrong_identity_version_shape_and_redirect_are_rejected(self):
        for payload in ({'application': 'other', 'version': launcher.VERSION},
                        {'application': 'explainer-studio', 'version': '0.1'}, []):
            with self.subTest(payload=payload), health_server(payload) as port:
                self.assertFalse(launcher.healthy(port))
        with health_server({}, redirect=True) as port:
            self.assertFalse(launcher.healthy(port))

    def test_occupied_port_fails_without_starting_or_choosing_another(self):
        with health_server({'application': 'other'}) as port, \
             patch.object(launcher, 'SELECTOR_PORT', port), \
             patch.object(launcher.subprocess, 'Popen') as spawn:
            with self.assertRaisesRegex(SystemExit, 'No alternate port'):
                launcher.start_server(Path('unused-config'))
        spawn.assert_not_called()

    def test_fresh_start_only_after_fixed_port_health_fails(self):
        calls = []
        with patch.object(launcher, 'healthy', side_effect=lambda p: calls.append(p) or False), \
             patch.object(launcher, 'start_server', side_effect=lambda f: calls.append('start')), \
             redirect_stdout(io.StringIO()) as output:
            launcher.main(['--no-browser'])
        self.assertEqual(calls, [7719, 'start'])
        self.assertEqual(output.getvalue().strip(), 'http://127.0.0.1:7719/style-selector.html')

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
                with patch.object(launcher.subprocess, 'Popen', side_effect=capture), \
                     patch.object(launcher, 'SELECTOR_PORT', port):
                    started = launcher.start_server(Path(folder))
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
                launcher.start_server(Path(folder))
        self.assertEqual(spawn.call_count, 1)
        child.terminate.assert_called_once()
        child.wait.assert_called_once()


if __name__ == '__main__':
    unittest.main()
