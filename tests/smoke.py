from pathlib import Path
import hashlib,json,sys,re
r=Path(__file__).resolve().parents[1];plugin=r/'plugins/explainer-studio';s=plugin/'skills/create-explainer';sys.path.insert(0,str(s/'scripts'))
from choices import normalize_choice
manifest=json.loads((plugin/'.codex-plugin/plugin.json').read_text(encoding='utf-8'));market=json.loads((r/'.agents/plugins/marketplace.json').read_text(encoding='utf-8'));assert market['name']=='explainer-studio';assert (r/market['plugins'][0]['source']['path']).resolve()==plugin.resolve();assert manifest['name']==market['plugins'][0]['name']
catalog=json.loads((s/'assets/selector-catalog.json').read_text(encoding='utf-8'));styles=json.loads((s/'assets/styles/catalog.json').read_text(encoding='utf-8'));assert len(catalog['styles'])==len(styles)==18
media=0
for entry in catalog['styles']:
 assert entry['id'] in styles
 for kind in ['poster','video']:
  f=s/'assets'/entry[kind];assert f.is_file(),str(f)
  with f.open('rb') as stream:header=stream.read(140)
  assert not header.startswith(b'version https://git-lfs.github.com/spec/v1'),f'Run git lfs pull: {f}'
  if kind=='video':assert b'ftyp' in header[:32];media+=1
 for name in ['runtime.js']:
  assert (s/'assets/styles'/entry['id']/name).is_file()
provenance=json.loads((plugin/'SOURCE-NOTES.json').read_text(encoding='utf-8'))
for rel,digest in provenance['files'].items():assert hashlib.sha256((s/rel).read_bytes()).hexdigest()==digest,rel
for rel in ['SKILL.md','references/local-services.md','scripts/serve.py','scripts/credentials.py','scripts/launch_selector.py']:assert (s/rel).is_file()
for mode in ['automatic','user-created']:
 q=normalize_choice({'schemaVersion':2,'style':'tech-glow','settings':{'narration':{'mode':mode},'music':{'mode':mode}}},styles);assert q['settings']['narration']['mode']==mode
for f in [r/'README.md',r/'docs/INSTALL.md']:
 for target in re.findall(r'\]\(([^)]+)\)',f.read_text(encoding='utf-8')):
  if target.startswith(('http:','https:','#')):continue
  assert (f.parent/target.split('#')[0]).exists(),f'{f}: missing link {target}'
assert not list((r/'plugins').rglob('services.dat'))
print(json.dumps({'version':manifest['version'],'marketplace':market['name'],'styles':18,'hydratedPreviewVideos':media,'sourceHashes':'passed','audioModes':'passed','documentationLinks':'passed','credentialFiles':'excluded'}))
