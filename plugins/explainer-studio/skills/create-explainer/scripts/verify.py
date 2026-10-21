"""Decode and probe an exported video, measure audio and extract encoded QA frames."""
from pathlib import Path
import argparse,subprocess,json,re,hashlib
def verify(video,silent=False):
    p=json.loads(subprocess.check_output(["ffprobe","-v","error","-show_streams","-show_format","-of","json",str(video)],text=True))
    duration=float(p["format"]["duration"])
    decode=subprocess.run(["ffmpeg","-v","error","-i",str(video),"-f","null","-"],capture_output=True,text=True)
    has_audio=any(s['codec_type']=='audio' for s in p['streams'])
    report_path=video.parent/'render-report.json'
    if report_path.is_file():
        expected=json.loads(report_path.read_text())
        silent=expected['audioTracks']==0
        v=next(s for s in p['streams'] if s['codec_type']=='video')
        assert (v['width'],v['height'])==(expected['width'],expected['height']), 'Wrong output dimensions'
        assert abs(duration-expected['duration'])<.1, 'Wrong output duration'
    assert has_audio != silent, 'Audio presence does not match requested settings'
    levels=None
    if has_audio:
        loud=subprocess.run(["ffmpeg","-hide_banner","-i",str(video),"-af","loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json","-vn","-f","null","-"],capture_output=True,text=True,check=True)
        levels=json.loads(re.findall(r'\{[^{}]*"input_i"[^{}]*\}',loud.stderr)[-1])
    for name,t in [("encoded-middle",duration*.5),("encoded-ending",duration-.1)]:
        subprocess.run(["ffmpeg","-v","error","-y","-ss",str(t),"-i",str(video),"-frames:v","1",str(video.parent/(name+".png"))],check=True)
    streams=[{k:s.get(k) for k in ["codec_type","codec_name","width","height","r_frame_rate","duration","sample_rate","channels","nb_frames"]} for s in p["streams"]]
    report={"file":video.name,"bytes":video.stat().st_size,"sha256":hashlib.sha256(video.read_bytes()).hexdigest(),"duration":duration,"streams":streams,"decodeExit":decode.returncode,"decodeErrors":decode.stderr,"audio":levels,"review":"Automated decode/probe plus sampled frames; not a continuous human watch-through."}
    (video.parent/"verification.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
    assert decode.returncode==0 and not decode.stderr.strip(),decode.stderr
    if levels:
        assert float(levels["input_i"])<-8 and float(levels["input_tp"])<0,"Invalid loudness/peak"
        assert float(levels["input_i"])>float("-inf"),"Enabled audio is silent"
    print(json.dumps(report,indent=2))
if __name__=="__main__":
    ap=argparse.ArgumentParser();ap.add_argument("video",type=Path);ap.add_argument("--silent",action="store_true");a=ap.parse_args();verify(a.video.resolve(),a.silent)
