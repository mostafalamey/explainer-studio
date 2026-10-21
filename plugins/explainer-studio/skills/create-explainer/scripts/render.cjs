// Render trusted, locally authored Canvas HTML; no server or fixed paths required.
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url'),{spawn}=require('child_process'),{once}=require('events');
const {chromium}=require(process.env.PW_MODULE_PATH||'playwright');
const [input,outArg,mode='qa']=process.argv.slice(2),overwrite=process.argv.includes('--overwrite');
if(!input||!outArg||!['qa','render'].includes(mode))throw Error('Usage: node render.cjs input.html output-directory qa|render [--overwrite]');
const out=path.resolve(outArg);fs.mkdirSync(out,{recursive:true});
async function run(args){
  const p=spawn('ffmpeg',['-hide_banner','-loglevel','error',...args],{windowsHide:true,stdio:['ignore','ignore','pipe']});
  let err='';p.stderr.on('data',d=>err+=d);const [code]=await once(p,'close');if(code!==0)throw Error(err||`ffmpeg exit ${code}`);
}
(async()=>{
 let browser;
 try{
  const channel=process.env.BROWSER_CHANNEL||'msedge';
  browser=await chromium.launch({headless:true,...(channel==='chromium'?{}:{channel}),args:['--autoplay-policy=no-user-gesture-required']});
  const page=await browser.newPage({viewport:{width:1400,height:950}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve(input)).href);
  const ready=await page.evaluate(()=>animationReady),project=await page.evaluate(()=>PROJECT);
  if(!ready.fontsLoaded)throw Error('Fonts did not load');
  console.log(JSON.stringify({ready,mode}));
  const saveFrame=async(t,name)=>{
    const b64=await page.evaluate(t=>{seek(t);return document.getElementById('film').toDataURL('image/png').split(',')[1]},t);
    fs.writeFileSync(path.join(out,name),Buffer.from(b64,'base64'));
  };
  if(mode==='qa'){
    if(fs.existsSync(path.join(out,'qa.json'))&&!overwrite)throw Error('QA exists; use --overwrite');
    await page.evaluate(()=>{
      window.textIssues=[];window.sampleT=0;window.checkText=true;
      const orig=CanvasRenderingContext2D.prototype.fillText;
      CanvasRenderingContext2D.prototype.fillText=function(text,x,y,...rest){
        if(checkText&&this.globalAlpha>.8){
          const m=this.getTransform(),z=this.measureText(text),left=x-(this.textAlign==='center'?z.width/2:this.textAlign==='right'?z.width:0);
          const pts=[[left,y-z.actualBoundingBoxAscent],[left+z.width,y+z.actualBoundingBoxDescent]].map(([a,b])=>[m.a*a+m.c*b+m.e,m.b*a+m.d*b+m.f]);
          if(pts.some(([a,b])=>a<-.5||a>this.canvas.width+.5||b<-.5||b>this.canvas.height+.5))textIssues.push({t:sampleT,text,pts});
        }return orig.call(this,text,x,y,...rest);
      };
    });
    const times=[0,project.duration-.05,...project.beats.flatMap(b=>[b.start+.2,b.frame??b.end-.2,...Object.values(b.events||{}).flatMap(t=>[Math.max(0,t-.1),Math.min(project.duration,t+.3)])])];
    const drawMs=[];
    for(const t of times)drawMs.push(await page.evaluate(t=>{sampleT=t;const start=performance.now();seek(t);return performance.now()-start},t));
    const determinism=await page.evaluate(()=>{seek(DURATION*.6);const a=canvas.toDataURL();seek(.1);seek(DURATION*.6);return a===canvas.toDataURL()});
    for(const [i,b]of project.beats.entries())await saveFrame(b.frame??b.end-.2,`beat-${i+1}.png`);
    await saveFrame(project.duration-.1,'ending.png');
    const issues=await page.evaluate(()=>{checkText=false;return textIssues});
    await page.evaluate(()=>{seek(.2);document.getElementById('loop').click()});
    await page.getByRole('button',{name:'Play',exact:true}).click();await page.waitForTimeout(350);
    const play=await page.evaluate(()=>({paused:voice.paused,t:voice.currentTime,visual:currentT}));
    await page.getByRole('button',{name:'Pause',exact:true}).click();
    const paused=await page.evaluate(()=>voice.paused);
    await page.getByRole('button',{name:'Sound on',exact:true}).click();
    const muted=await page.evaluate(()=>voice.muted);
    await page.evaluate(()=>seek(DURATION/2));
    const sync=await page.evaluate(()=>!hasVoice||Math.abs(voice.currentTime-DURATION/2)<.1);
    if(project.settings.narration.enabled)await page.getByRole('button',{name:'Remove voiceover',exact:true}).click();
    await page.getByRole('button',{name:'Play',exact:true}).click();await page.waitForTimeout(250);
    const ownClock=await page.evaluate(()=>currentT>.1);await page.getByRole('button',{name:'Pause',exact:true}).click();
    await page.setViewportSize({width:390,height:844});
    const mobile=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
    const report={ready,determinism,play,paused,muted,sync,ownClock,mobile,errors,textIssues:issues,samples:times.length,drawMs:{mean:drawMs.reduce((a,b)=>a+b)/drawMs.length,max:Math.max(...drawMs)},review:'Automated checks and sampled visual review; not a continuous human watch-through.'};
    fs.writeFileSync(path.join(out,'qa.json'),JSON.stringify(report,null,2));
    if(errors.length||issues.length||!determinism||!paused||!muted||!sync||!ownClock||!mobile)throw Error('QA failed; inspect qa.json');
    console.log(JSON.stringify(report));
  }else{
    if(ready.pendingAudio?.length)throw Error('Supply enabled audio before final export: '+ready.pendingAudio.join(', '));
    if(project.settings.music.enabled&&ready.musicDuration<project.duration-.1)throw Error('Music must cover the full video; edit or extend the track first');
    const final=path.join(out,'final.mp4');if(fs.existsSync(final)&&!overwrite)throw Error('Final video exists; use --overwrite');
    const frames=Math.round(project.duration*(project.fps||30)),picture=path.join(out,'picture.mp4');
    const ff=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate',String(project.fps||30),'-vcodec','mjpeg','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p',picture],{windowsHide:true,stdio:['pipe','ignore','pipe']});
    let fferr='';ff.stderr.on('data',d=>fferr+=d);ff.stdin.on('error',()=>{});const done=once(ff,'close');
    for(let i=0;i<frames;i++){
      const b64=await page.evaluate(t=>{seek(t);return canvas.toDataURL('image/jpeg',.97).split(',')[1]},i/(project.fps||30));
      if(ff.exitCode!==null)throw Error(fferr||'Encoder exited');
      if(!ff.stdin.write(Buffer.from(b64,'base64')))await once(ff.stdin,'drain');
      if(i%120===0)console.log(JSON.stringify({frame:i,frames}));
    }
    ff.stdin.end();if((await done)[0]!==0)throw Error(fferr);
    const fx=await page.evaluate(async()=>{window.fx=await SOUND.renderOffline(scoreSound,DURATION,48000,{voiceover:hasVoice});return {frames:fx.frames,sr:fx.sr,peak:fx.peak}});
    const wav=path.join(out,'effects.wav'),head=Buffer.alloc(44),bytes=fx.frames*8;
    head.write('RIFF');head.writeUInt32LE(bytes+36,4);head.write('WAVEfmt ',8);head.writeUInt32LE(16,16);head.writeUInt16LE(3,20);head.writeUInt16LE(2,22);head.writeUInt32LE(48000,24);head.writeUInt32LE(384000,28);head.writeUInt16LE(8,32);head.writeUInt16LE(32,34);head.write('data',36);head.writeUInt32LE(bytes,40);fs.writeFileSync(wav,head);
    await page.exposeFunction('writeFX',s=>fs.appendFileSync(wav,Buffer.from(s,'base64')));
    await page.evaluate(async()=>{const bytes=new Uint8Array(fx.inter.buffer);for(let i=0;i<bytes.length;i+=262144){const part=bytes.subarray(i,i+262144);let s='';for(let j=0;j<part.length;j+=8192)s+=String.fromCharCode(...part.subarray(j,j+8192));await writeFX(btoa(s))}});
    const tracks=await page.evaluate(()=>({voice:voice.getAttribute('src'),music:music.getAttribute('src')}));
    const args=['-y','-i',picture],filters=[],labels=[];let index=1;
    const addEmbedded=(data,name)=>{const match=data.match(/^data:([^;]+);base64,(.*)$/s);if(!match)throw Error('Expected embedded '+name);const file=path.join(out,name+'-source.bin');fs.writeFileSync(file,Buffer.from(match[2],'base64'));args.push('-i',file);return index++};
    const duration=project.duration;
    if(tracks.voice){
      const n=addEmbedded(tracks.voice,'voice');
      filters.push(`[${n}:a]loudnorm=I=-17:TP=-2:LRA=11,apad,atrim=duration=${duration}`+(tracks.music?',asplit=2[v][side]':'[v]'));labels.push('[v]');
    }
    if(project.settings.soundEffects.enabled){args.push('-i',wav);filters.push(`[${index++}:a]volume=0.35,apad,atrim=duration=${duration}[effects]`);labels.push('[effects]')}
    if(tracks.music){
      const n=addEmbedded(tracks.music,'music'),fade=Math.min(.8,duration/2),fadeIn=Math.min(.6,duration/2);
      filters.push(`[${n}:a]loudnorm=I=-20:TP=-2:LRA=11,volume=${tracks.voice?.28:.7},atrim=duration=${duration},afade=t=in:d=${fadeIn},afade=t=out:st=${duration-fade}:d=${fade}[bed]`);
      if(tracks.voice)filters.push('[bed][side]sidechaincompress=threshold=0.035:ratio=4:attack=20:release=300[music]');
      labels.push(tracks.voice?'[music]':'[bed]');
    }
    if(labels.length){
      filters.push(labels.join('')+`amix=inputs=${labels.length}:normalize=0:duration=longest,alimiter=limit=0.84:level=false[a]`);
      await run([...args,'-filter_complex',filters.join(';'),'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-ac','2','-t',String(duration),'-movflags','+faststart',final]);
    }else await run(['-y','-i',picture,'-map','0:v','-c:v','copy','-an','-movflags','+faststart',final]);
    fs.writeFileSync(path.join(out,'render-report.json'),JSON.stringify({settings:project.settings,width:project.width,height:project.height,duration,frames,audioTracks:labels.length,narration:!!tracks.voice,music:!!tracks.music,soundEffects:project.settings.soundEffects.enabled},null,2));
    await saveFrame(project.beats.at(-1).frame??project.duration-.2,'poster.png');
    if(errors.length)throw Error(errors.join('\n'));
    console.log(JSON.stringify({final,frames,fx,errors}));
  }
 }finally{await browser?.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
