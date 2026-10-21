"""Bundle a local explainer project into offline player and storyboard HTML."""
from pathlib import Path
import argparse,base64,html,json,math,mimetypes,sys
sys.path.insert(0,str(Path(__file__).resolve().parent))
from choices import resolve, FORMATS

SKILL=Path(__file__).resolve().parents[1]
def data(path):
    if not path:return ""
    return "data:"+ (mimetypes.guess_type(path)[0] or "application/octet-stream")+";base64,"+base64.b64encode(Path(path).read_bytes()).decode()
def js_json(value):
    return json.dumps(value,ensure_ascii=False).replace("<","\\u003c").replace("\u2028","\\u2028").replace("\u2029","\\u2029")
def script(code):
    return "<script>"+code.replace("</script","<\\/script")+"</script>"
def validate(p):
    assert isinstance(p["duration"],(float,int)) and math.isfinite(p["duration"]) and p["duration"]>0,"Invalid duration"
    assert p.get("fps",30) in (24,25,30,50,60),"Unsupported fps"
    w,h=p.get("width",1920),p.get("height",1080)
    assert w>0 and h>0 and w%2==0 and h%2==0 and any(abs(w/h-d[0]/d[1])<.001 for d in FORMATS.values()),"Use even dimensions in 16:9, 9:16 or 1:1"
    end=0;ids=set()
    for b in p["beats"]:
        assert b["id"] not in ids,"Duplicate beat id"
        ids.add(b["id"])
        assert abs(b["start"]-end)<.001 and b["end"]>b["start"],"Beats must cover timeline without gaps/overlaps"
        assert all(math.isfinite(t) and b["start"]<=t<=b["end"] for t in b.get("events",{}).values()),"Event outside beat"
        assert b["start"]<=b.get("frame",b["end"]-.25)<=b["end"],"Storyboard frame outside beat"
        end=b["end"]
    assert abs(end-p["duration"])<.001,"Final beat must end at duration"
def build(project,overwrite=False,choice=None):
    root=project.resolve().parent;p=json.loads(project.read_text(encoding="utf-8"))
    catalog=json.loads((SKILL/"assets/styles/catalog.json").read_text())
    p=resolve(p,json.loads(choice.read_text(encoding="utf-8")) if choice else None,catalog);validate(p)
    style=catalog[p["style"]]
    targets=[root/"animation.html",root/"storyboard.html"]
    if not overwrite and any(x.exists() for x in targets):raise FileExistsError("Generated HTML exists; use --overwrite")
    audio=data(root/p["audio"]) if p.get("audio") and p["settings"]["narration"]["enabled"] else ""
    music=data(root/p["musicAudio"]) if p.get("musicAudio") and p["settings"]["music"]["enabled"] else ""
    logo=data(root/p["logo"]) if p.get("logo") else ""
    title=html.escape(p["title"])
    style_css=(SKILL/"assets/styles"/style["css"]).read_text() if style.get("css") else ""
    head='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>'''+title+'''</title><style>'''+(SKILL/"assets/shared/fonts.css").read_text()+'''
    '''+style_css+'''
    *{box-sizing:border-box}body{margin:0;background:#101522;color:#ecf2ff;font:15px Inter,sans-serif;padding:18px}h1{font-size:22px}
    .player{max-width:1280px;margin:auto}canvas{display:block;width:100%;aspect-ratio:ASPECT_RATIO}#film{max-height:calc(100vh - 160px);object-fit:contain;background:#080c18}
    .controls{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:12px}button,.file{background:#24344d;border:1px solid #647a99;color:white;padding:9px 13px;border-radius:7px;cursor:pointer}button:focus-visible,input:focus-visible{outline:3px solid #7be6ff}
    #scrub{flex:1;min-width:100px}#load{width:1px;height:1px;position:absolute;opacity:0}#status{color:#b2c1d8;font-size:12px}
    #board:not([hidden]){display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,500px),1fr));gap:20px}article{background:#1a2537;border-radius:12px;overflow:hidden}article div{padding:10px 18px}p{line-height:1.5}[hidden]{display:none!important}
    </style><h1>'''+title+'''</h1><div class="player"><canvas id="film" width="'''+str(p.get("width",1920))+'''" height="'''+str(p.get("height",1080))+'''"></canvas><div class="controls"><button id="play" disabled>Play</button><input id="scrub" aria-label="Playback position" type="range" min="0" step=".01" value="0"><span id="clock"></span><button id="sound" aria-pressed="true">Sound on</button><label><input id="loop" type="checkbox" checked> Loop</label><label class="file">Load voiceover<input id="load" type="file" accept="audio/*"></label><button id="clear">Remove voiceover</button></div><p id="status">Loading</p></div><main id="board" hidden></main><audio id="voice" preload="auto"'''+(' src="'+audio+'"' if audio else '')+'''></audio>'''
    head=head.replace("ASPECT_RATIO",str(p["width"])+"/"+str(p["height"]))
    head+='<audio id="music" preload="auto"'+(' src="'+music+'"' if music else '')+'></audio>'
    code=""
    for f in ["assets/shared/harness.js","assets/shared/sound.js","assets/styles/"+style["runtime"]]:
        code+=script((SKILL/f).read_text(encoding="utf-8"))
    code+=script("window.PROJECT="+js_json(p)+";const LOGO_DATA="+js_json(logo)+";const FONT_SPECS="+js_json(style["fonts"])+";")
    code+=script((root/p["scene"]).read_text(encoding="utf-8"))
    for target,board in zip(targets,[False,True]):
        target.write_text(head+script("const STORYBOARD="+str(board).lower()+";")+code+script((SKILL/"assets/player/player.js").read_text())+"</html>",encoding="utf-8")
    print(json.dumps({"style":p["style"],"duration":p["duration"],"outputs":[str(t) for t in targets]}))
if __name__=="__main__":
    ap=argparse.ArgumentParser();ap.add_argument("project",type=Path);ap.add_argument("--overwrite",action="store_true");ap.add_argument("--choice",type=Path);a=ap.parse_args();build(a.project,a.overwrite,a.choice)
