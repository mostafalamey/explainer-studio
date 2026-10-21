"""User-local service credentials. Keys are never printed or stored in the plugin."""
from pathlib import Path
import argparse,base64,ctypes,hashlib,json,os,re,subprocess,sys,uuid
from urllib.parse import urlparse

def config_dir():
    if os.environ.get('EXPLAINER_STUDIO_CONFIG_DIR'): return Path(os.environ['EXPLAINER_STUDIO_CONFIG_DIR']).expanduser()
    if os.name=='nt': return Path(os.environ.get('LOCALAPPDATA',Path.home()/'AppData/Local'))/'ExplainerStudio'
    return Path(os.environ.get('XDG_CONFIG_HOME',Path.home()/'.config'))/'explainer-studio'

class StoreError(Exception): pass

class Vault:
    def __init__(self,folder=None): self.folder=Path(folder) if folder else config_dir();self.path=self.folder/'services.dat'
    def _crypt(self,data,decrypt=False):
        from ctypes import wintypes
        class Blob(ctypes.Structure): _fields_=[('cbData',wintypes.DWORD),('pbData',ctypes.POINTER(ctypes.c_ubyte))]
        buf=ctypes.create_string_buffer(data);src=Blob(len(data),ctypes.cast(buf,ctypes.POINTER(ctypes.c_ubyte)));out=Blob()
        crypt=ctypes.WinDLL('crypt32',use_last_error=True);kernel=ctypes.WinDLL('kernel32',use_last_error=True)
        function=crypt.CryptUnprotectData if decrypt else crypt.CryptProtectData
        function.argtypes=[ctypes.POINTER(Blob),ctypes.c_void_p,ctypes.c_void_p,ctypes.c_void_p,ctypes.c_void_p,wintypes.DWORD,ctypes.POINTER(Blob)];function.restype=wintypes.BOOL
        kernel.LocalFree.argtypes=[ctypes.c_void_p];kernel.LocalFree.restype=ctypes.c_void_p
        if not function(ctypes.byref(src),None,None,None,None,1,ctypes.byref(out)): raise StoreError('The operating system could not unlock the credential store.')
        try:return ctypes.string_at(out.pbData,out.cbData)
        finally:kernel.LocalFree(out.pbData)
    def _keyring(self):
        try:
            import keyring
            backend=keyring.get_keyring()
            candidates=getattr(backend,'backends',[backend])
            secure_modules=('keyring.backends.macOS','keyring.backends.SecretService','keyring.backends.kwallet','keyring.backends.Windows')
            for candidate in candidates:
                if type(candidate).__module__.startswith(secure_modules) and candidate.priority>0:return candidate
            raise ImportError()
        except Exception: raise StoreError('An OS credential backend is required. Install Python keyring and configure Keychain or Secret Service, then restart the selector.') from None
    def _account(self): return hashlib.sha256(str(self.folder.resolve()).encode()).hexdigest()
    def read(self):
        try:
            if os.name=='nt': raw=self._crypt(self.path.read_bytes(),True).decode() if self.path.exists() else None
            else:raw=self._keyring().get_password('ExplainerStudio',self._account())
            value=json.loads(raw) if raw else {'services':[]}
            if not isinstance(value.get('services'),list):raise ValueError()
            return value
        except StoreError:raise
        except Exception:raise StoreError('The credential store could not be read. No stored keys were changed.') from None
    def write(self,value):
        try:
            raw=json.dumps(value).encode()
            if os.name=='nt':
                self.folder.mkdir(parents=True,exist_ok=True);temp=self.path.with_suffix('.tmp');temp.write_bytes(self._crypt(raw));os.replace(temp,self.path)
            else:self._keyring().set_password('ExplainerStudio',self._account(),raw.decode())
        except StoreError:raise
        except Exception:raise StoreError('The operating system could not save the credential.') from None
    def status(self):return [{'id':x['id'],'name':x['name'],'docsUrl':x.get('docsUrl',''),'hasKey':bool(x.get('apiKey'))} for x in self.read()['services']]
    def save(self,payload):
        name=payload.get('name','');key=payload.get('apiKey','');docs=payload.get('docsUrl','');ident=payload.get('id')
        if not isinstance(name,str) or not name.strip() or len(name)>120 or any(ord(c)<32 for c in name):raise ValueError('Enter a service name of 1 to 120 characters.')
        if not isinstance(key,str) or len(key)>8192 or any(c in key for c in '\r\n\x00'):raise ValueError('Enter a valid single-line API key.')
        if not isinstance(docs,str) or len(docs)>2000 or (docs and (urlparse(docs).scheme!='https' or not urlparse(docs).netloc)):raise ValueError('The optional API documentation link must use HTTPS.')
        value=self.read();items=value['services'];current=next((x for x in items if x['id']==ident),None)
        if ident and current is None:raise ValueError('The service no longer exists. Refresh the list.')
        if any(x['name'].casefold()==name.strip().casefold() and x is not current for x in items):raise ValueError('That service name already exists. Edit its saved entry.')
        if not key.strip() and current is None:raise ValueError('Enter an API key for this new service.')
        item={'id':current['id'] if current else str(uuid.uuid4()),'name':name.strip(),'docsUrl':docs.strip(),'apiKey':key.strip() or current['apiKey']}
        if current:items[items.index(current)]=item
        else:items.append(item)
        self.write(value)
    def delete(self,ident):
        value=self.read();value['services']=[x for x in value['services'] if x['id']!=ident];self.write(value)
    def get(self,name):
        match=next((x for x in self.read()['services'] if x['id']==name or x['name'].casefold()==name.casefold()),None)
        if not match:raise StoreError('No saved credential matches this service.')
        return match['apiKey']

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--config-dir',type=Path);sub=p.add_subparsers(dest='action',required=True);sub.add_parser('status');run=sub.add_parser('run');run.add_argument('--service',required=True);run.add_argument('--env',required=True);run.add_argument('command',nargs=argparse.REMAINDER);args=p.parse_args();vault=Vault(args.config_dir)
    try:
        if args.action=='status':print(json.dumps({'services':vault.status()}));return
        if not re.fullmatch(r'[A-Z][A-Z0-9_]{0,100}',args.env):raise ValueError('Use a valid environment-variable name.')
        command=args.command[1:] if args.command[:1]==['--'] else args.command
        if not command:raise ValueError('Supply a generation command after --.')
        env=os.environ.copy();env[args.env]=vault.get(args.service);raise SystemExit(subprocess.run(command,env=env).returncode)
    except (StoreError,ValueError) as e:print(str(e),file=sys.stderr);raise SystemExit(1)
    except OSError:print('The generation command could not be started.',file=sys.stderr);raise SystemExit(1)
if __name__=='__main__':main()
