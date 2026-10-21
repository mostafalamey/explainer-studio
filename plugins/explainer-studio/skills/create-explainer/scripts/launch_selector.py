"""Find an existing local selector before starting one. No public hosting required."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import argparse
import http.client
import json
import os
import re
import socket
import subprocess
import sys
import time
import urllib.request
import urllib.error
import webbrowser

from credentials import config_dir

VERSION = '0.22.0'
DEFAULT_PORT = 8869
DISCOVERY_PORTS = range(DEFAULT_PORT, DEFAULT_PORT + 100)


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


def listening_ports():
    """Best-effort discovery of custom ports; bounded range remains a fallback."""
    try:
        result = subprocess.run(['netstat', '-an'], capture_output=True, text=True,
                                timeout=5, check=True,
                                **({'creationflags': subprocess.CREATE_NO_WINDOW}
                                   if os.name == 'nt' else {}))
    except (OSError, subprocess.SubprocessError):
        return []
    ports = set()
    for line in result.stdout.splitlines():
        if 'LISTEN' not in line.upper():
            continue
        for match in re.finditer(r'(?:127\.0\.0\.1|0\.0\.0\.0|\*|\[::\]|\[::1\]|::1)[:.](\d+)\b', line):
            port = int(match.group(1))
            if 0 < port <= 65535:
                ports.add(port)
    return sorted(ports)


def find_existing(preferred):
    # Complete discovery before looking for a free port. A free 8869 must not
    # hide an already-running selector at 8899 (or a custom listening port).
    candidates = list(dict.fromkeys([preferred, *DISCOVERY_PORTS, *listening_ports()]))
    with ThreadPoolExecutor(max_workers=16) as pool:
        results = list(pool.map(healthy, candidates))
    return next((port for port, ok in zip(candidates, results) if ok), None)


def start_server(preferred, folder):
    skill = Path(__file__).resolve().parents[1]
    folder.mkdir(parents=True, exist_ok=True)
    for port in range(preferred, min(preferred + 20, 65536)):
        try:
            with socket.socket() as sock:
                sock.bind(('127.0.0.1', port))
        except OSError:
            continue
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
            # Never leave a series of orphan servers after a failed health check.
            child.terminate()
            try:
                child.wait(timeout=3)
            except subprocess.TimeoutExpired:
                child.kill()
                child.wait()
        raise SystemExit('Selector failed its health check. Check selector.log; '
                         'do not start another server until the failure is resolved.')
    raise SystemExit('No selector port is available. Check the local selector log.')


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=DEFAULT_PORT,
                        help='Preferred existing/start port; all discovery ports are checked first')
    parser.add_argument('--config-dir', type=Path)
    parser.add_argument('--no-browser', action='store_true')
    args = parser.parse_args(argv)
    if not 1 <= args.port <= 65535:
        parser.error('--port must be between 1 and 65535')
    port = find_existing(args.port)
    if port is None:
        port = start_server(args.port, args.config_dir or config_dir())
    url = f'http://127.0.0.1:{port}/style-selector.html'
    print(url, flush=True)
    if not args.no_browser:
        webbrowser.open(url)


if __name__ == '__main__':
    main()
