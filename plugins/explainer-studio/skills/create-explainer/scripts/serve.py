"""Loopback-only preview server with byte ranges for reliable MP4 seeking."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
import re,argparse,json,secrets,threading
from urllib.parse import urlsplit
from credentials import Vault,StoreError
parser=argparse.ArgumentParser();parser.add_argument('root',type=Path);parser.add_argument('--port',type=int,default=8869);parser.add_argument('--config-dir',type=Path);args=parser.parse_args();ROOT=args.root.resolve();VAULT=Vault(args.config_dir);TOKEN=secrets.token_urlsafe(32);LOCK=threading.RLock()
if VAULT.folder.resolve().is_relative_to(ROOT):raise SystemExit('Keep the credential directory outside the served assets.')
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
    def log_message(self,*args):pass
    def _trusted(self):
        return self.headers.get('Host') in (f'127.0.0.1:{self.server.server_port}',f'localhost:{self.server.server_port}')
    def _json(self,status,value):
        data=json.dumps(value).encode();self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(data)));self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.end_headers();self.wfile.write(data)
    def do_GET(self):
        if not self._trusted():return self._json(403,{'error':'Local requests only.'})
        route=urlsplit(self.path).path
        if route=='/api/health':return self._json(200,{'application':'explainer-studio','version':'0.22.0'})
        if route=='/api/services':
            try:
                with LOCK:services=VAULT.status()
                return self._json(200,{'services':services,'token':TOKEN,'storage':'Windows user encryption' if __import__('os').name=='nt' else 'OS credential store'})
            except StoreError as e:return self._json(503,{'error':str(e)})
        if route.startswith('/api/'):return self._json(404,{'error':'Unknown endpoint.'})
        target=Path(self.translate_path(self.path)).resolve()
        if not target.is_relative_to(ROOT) or any(x.startswith('.') for x in target.relative_to(ROOT).parts):return self._json(404,{'error':'Not found.'})
        return super().do_GET()
    def do_POST(self):
        if not self._trusted() or self.headers.get('Origin')!='http://'+self.headers.get('Host','') or not secrets.compare_digest(self.headers.get('X-Explainer-Token',''),TOKEN):return self._json(403,{'error':'Open the local selector and retry.'})
        if urlsplit(self.path).path!='/api/services':return self._json(404,{'error':'Unknown endpoint.'})
        if self.headers.get_content_type()!='application/json':return self._json(415,{'error':'JSON required.'})
        try:
            size=int(self.headers.get('Content-Length','0'))
            if not 0<size<=16384:return self._json(413,{'error':'Request too large or empty.'})
            payload=json.loads(self.rfile.read(size))
            if not isinstance(payload,dict):raise ValueError('Invalid request.')
            with LOCK:
                if payload.get('action')=='save':VAULT.save(payload)
                elif payload.get('action')=='delete' and isinstance(payload.get('id'),str):VAULT.delete(payload['id'])
                else:raise ValueError('Invalid service action.')
                services=VAULT.status()
            return self._json(200,{'services':services})
        except (ValueError,TypeError):return self._json(400,{'error':'Check the service name, API key and optional HTTPS documentation link.'})
        except StoreError as e:return self._json(503,{'error':str(e)})
    def send_head(self):
        self.byte_range=None
        value=self.headers.get("Range","")
        path=Path(self.translate_path(self.path))
        if not value or not path.is_file():return super().send_head()
        size=path.stat().st_size
        match=re.fullmatch(r"bytes=(\d*)-(\d*)",value)
        if not match:return super().send_head()
        first,last=match.groups()
        start=int(first) if first else max(0,size-int(last or size))
        end=min(size-1,int(last)) if first and last else size-1
        if start>=size or end<start:
            self.send_response(416);self.send_header("Content-Range",f"bytes */{size}");self.end_headers();return None
        f=path.open("rb");f.seek(start)
        self.send_response(206)
        self.send_header("Content-Type",self.guess_type(str(path)))
        self.send_header("Content-Length",str(end-start+1))
        self.send_header("Accept-Ranges","bytes")
        self.send_header("Content-Range",f"bytes {start}-{end}/{size}")
        self.end_headers();self.byte_range=(start,end);return f
    def copyfile(self,src,dst):
        try:
            if self.byte_range is None:return super().copyfile(src,dst)
            remain=self.byte_range[1]-self.byte_range[0]+1
            while remain:
                chunk=src.read(min(256*1024,remain))
                if not chunk:break
                dst.write(chunk);remain-=len(chunk)
        except (BrokenPipeError,ConnectionResetError,ConnectionAbortedError):pass
server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
print(f'Explainer Studio: http://127.0.0.1:{server.server_port}/style-selector.html',flush=True)
server.serve_forever()
