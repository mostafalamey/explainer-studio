"""Start or reuse the bundled local selector. No public hosting is required."""
from pathlib import Path
import argparse,json,os,socket,subprocess,sys,time,urllib.request,webbrowser
from credentials import config_dir
VERSION='0.22.0'
def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--port',type=int,default=8869);p.add_argument('--config-dir',type=Path);p.add_argument('--no-browser',action='store_true');args=p.parse_args();skill=Path(__file__).resolve().parents[1];folder=args.config_dir or config_dir();folder.mkdir(parents=True,exist_ok=True)
    for port in range(args.port,args.port+20):
        url=f'http://127.0.0.1:{port}'
        try:
            with urllib.request.urlopen(url+'/api/health',timeout=.5) as response:health=json.load(response)
            if health.get('application')=='explainer-studio' and health.get('version')==VERSION:
                print(url+'/style-selector.html',flush=True)
                if not args.no_browser:webbrowser.open(url+'/style-selector.html')
                return
        except Exception:pass
        try:
            with socket.socket() as sock:sock.bind(('127.0.0.1',port))
        except OSError:continue
        options={'creationflags':subprocess.CREATE_NO_WINDOW} if os.name=='nt' else {'start_new_session':True}
        with (folder/'selector.log').open('ab') as log:
            child=subprocess.Popen([sys.executable,str(skill/'scripts/serve.py'),str(skill/'assets'),'--port',str(port),'--config-dir',str(folder)],stdin=subprocess.DEVNULL,stdout=log,stderr=log,**options)
        for _ in range(40):
            if child.poll() is not None:break
            try:
                with urllib.request.urlopen(url+'/api/health',timeout=.25) as response:health=json.load(response)
                if health.get('version')==VERSION:
                    print(url+'/style-selector.html',flush=True)
                    if not args.no_browser:webbrowser.open(url+'/style-selector.html')
                    return
            except Exception:time.sleep(.1)
    raise SystemExit('No selector port is available. Check the local selector log.')
if __name__=='__main__':main()
