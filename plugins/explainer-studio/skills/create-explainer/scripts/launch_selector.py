"""Reuse or start the local selector on fixed port 7719."""
from pathlib import Path
import argparse
import http.client
import json
import os
import socket
import subprocess
import sys
import time
import urllib.request
import urllib.error
import webbrowser

from credentials import config_dir

VERSION = '0.22.0'
SELECTOR_PORT = 7719


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def healthy(port):
    # Local checks must not pass through HTTP_PROXY or follow another service's redirect.
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())
    try:
        with opener.open(f'http://127.0.0.1:{port}/api/health', timeout=.4) as response:
            health = json.loads(response.read(4096))
        return (isinstance(health, dict)
                and health.get('application') == 'explainer-studio'
                and health.get('version') == VERSION)
    except urllib.error.HTTPError as error:
        error.close()
        return False
    except (OSError, ValueError, http.client.HTTPException):
        return False


def start_server(folder):
    port = SELECTOR_PORT
    skill = Path(__file__).resolve().parents[1]
    try:
        with socket.socket() as sock:
            if os.name == 'nt':
                sock.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
            sock.bind(('127.0.0.1', port))
    except OSError:
        raise SystemExit(f'Port {port} is unavailable and no compatible selector responded. '
                         'Resolve the conflicting service or local connection restriction, '
                         'then retry. No alternate port was started.') from None
    folder.mkdir(parents=True, exist_ok=True)
    options = ({'creationflags': subprocess.CREATE_NO_WINDOW}
               if os.name == 'nt' else {'start_new_session': True})
    with (folder / 'selector.log').open('ab') as log:
        child = subprocess.Popen(
            [sys.executable, str(skill / 'scripts/serve.py'), str(skill / 'assets'),
             '--port', str(port), '--config-dir', str(folder)],
            stdin=subprocess.DEVNULL, stdout=log, stderr=log, **options)
    for _ in range(40):
        if healthy(port):
            return port
        if child.poll() is not None:
            break
        time.sleep(.1)
    if child.poll() is None:
        child.terminate()
        try:
            child.wait(timeout=3)
        except subprocess.TimeoutExpired:
            child.kill()
            child.wait()
    raise SystemExit('Selector failed its health check. Check selector.log; '
                     'do not start another server until the failure is resolved.')


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, choices=[SELECTOR_PORT], default=SELECTOR_PORT,
                        help='Fixed selector port (7719 only)')
    parser.add_argument('--config-dir', type=Path)
    parser.add_argument('--no-browser', action='store_true')
    args = parser.parse_args(argv)
    port = SELECTOR_PORT
    if not healthy(port):
        start_server(args.config_dir or config_dir())
    url = f'http://127.0.0.1:{port}/style-selector.html'
    print(url, flush=True)
    if not args.no_browser:
        webbrowser.open(url)


if __name__ == '__main__':
    main()
