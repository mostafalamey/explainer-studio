from pathlib import Path
import sys,tempfile,subprocess,json,urllib.request,urllib.error,os
r=Path(__file__).resolve().parents[1];s=r/'plugins/explainer-studio/skills/create-explainer';sys.path.insert(0,str(s/'scripts'))
from credentials import Vault
from choices import settings
with tempfile.TemporaryDirectory(prefix='explainer-vault-test-',dir=r/'tests') as folder:
 assert Path(folder).resolve().is_relative_to((r/'tests').resolve())
 vault=Vault(folder);fake='test-only-not-a-real-api-key-7391';vault.save({'name':'Any Audio Service','apiKey':fake,'docsUrl':'https://example.com/docs'});assert vault.get('Any Audio Service')==fake
 assert fake not in json.dumps(vault.status());assert fake.encode() not in vault.path.read_bytes()
 row=vault.status()[0];vault.save({'id':row['id'],'name':'Renamed Service','apiKey':'','docsUrl':''});assert vault.get('Renamed Service')==fake
 result=subprocess.run([sys.executable,str(s/'scripts/credentials.py'),'--config-dir',folder,'run','--service','Renamed Service','--env','TEST_AUDIO_KEY','--',sys.executable,'-c',"import os;print('injected' if os.environ.get('TEST_AUDIO_KEY')=='test-only-not-a-real-api-key-7391' else 'missing')"],capture_output=True,text=True);assert result.returncode==0 and result.stdout.strip()=='injected' and fake not in result.stdout+result.stderr
 server=subprocess.Popen([sys.executable,str(s/'scripts/serve.py'),str(s/'assets'),'--port','0','--config-dir',folder],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
 try:
  line=server.stdout.readline().strip();base=line.split('Explainer Studio: ')[1].split('/style-selector.html')[0]
  def request(path,body=None,headers=None):
   req=urllib.request.Request(base+path,data=json.dumps(body).encode() if body is not None else None,headers=headers or {})
   try:
    with urllib.request.urlopen(req,timeout=5) as response:return response.status,response.read(),response.headers
   except urllib.error.HTTPError as e:return e.code,e.read(),e.headers
  code,raw,headers=request('/api/services');status=json.loads(raw);assert code==200 and fake not in raw.decode() and headers['Cache-Control']=='no-store'
  payload={'action':'save','name':'Second Service','apiKey':fake+'-2'}
  assert request('/api/services',payload,{'Content-Type':'application/json'})[0]==403
  auth={'Content-Type':'application/json','Origin':base,'X-Explainer-Token':status['token']}
  assert request('/api/services',payload,{**auth,'Origin':'https://evil.example'})[0]==403
  assert request('/api/services',payload,auth)[0]==200
  assert request('/api/services',headers={'Host':'evil.example'})[0]==403
  assert request('/api/keys')[0]==404
  assert request('/.env')[0]==404
  vault.delete(row['id']);assert len(vault.status())==1
 finally:server.terminate();server.wait(timeout=5)
# Reject plaintext and unknown keyring backends, including chain fallbacks.
import types
fake_module=types.ModuleType('keyring');old_module=sys.modules.get('keyring');sys.modules['keyring']=fake_module
plain=type('PlaintextKeyring',(),{'__module__':'keyrings.alt.file','priority':1})()
secure=type('Keyring',(),{'__module__':'keyring.backends.SecretService','priority':1})()
try:
 for candidate in [plain,type('Chainer',(),{'backends':[plain]})()]:
  fake_module.get_keyring=lambda:candidate
  try:Vault()._keyring()
  except Exception:pass
  else:raise AssertionError('Insecure keyring accepted')
 fake_module.get_keyring=lambda:type('Chainer',(),{'backends':[plain,secure]})()
 assert Vault()._keyring() is secure
finally:
 if old_module is None:sys.modules.pop('keyring',None)
 else:sys.modules['keyring']=old_module
for mode in ['automatic','user-created']:
 q=settings({'narration':{'mode':mode,'service':'Custom Service'},'music':{'mode':mode,'service':'Suno'}});assert q['narration']['mode']==q['music']['mode']==mode and q['music']['service']=='Suno'
assert settings({'narration':{'provider':'google-ai-studio'}})['narration']['mode']=='user-created'
assert settings({'narration':{'provider':'elevenlabs'}})['narration']['service']=='ElevenLabs'
for bad in [{'mode':'other'},{'mode':'automatic','service':''},{'mode':'user-created','service':'x'*121}]:
 try:settings({'narration':bad})
 except ValueError:pass
 else:raise AssertionError('Bad source accepted')
report={'secureKeyringSelection':True,'encryptedStorage':True,'metadataOnlyAPI':True,'childEnvironmentInjection':True,'blankKeyEdit':True,'csrfAndOrigin':True,'hostValidation':True,'noKeyReadEndpoint':True,'localModes':True,'legacyMigration':True};(r/'tests/local-services-contract-qa.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
