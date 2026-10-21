const canvas=document.getElementById('film'),ctx=canvas.getContext('2d');
const voice=document.getElementById('voice'),music=document.getElementById('music'),scrub=document.getElementById('scrub');
const playButton=document.getElementById('play'),soundButton=document.getElementById('sound');
const options=PROJECT.settings,media={logo:null};
let hasVoice=!!voice.getAttribute('src'),hasMusic=!!music.getAttribute('src'),playing=false,muted=false;
let currentT=0,origin=0,stopFX=null,objectURL=null,loop=true;
window.DURATION=PROJECT.duration;window.BEATS=PROJECT.beats;
const fmt=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
window.scoreSound=k=>{if(options.soundEffects.enabled)film.scoreSound?.({...k,music:()=>{}},PROJECT)};
function stopEffects(){if(stopFX){stopFX();stopFX=null}}
function startEffects(){stopEffects();if(!muted&&options.soundEffects.enabled)stopFX=SOUND.live(scoreSound,currentT,{voiceover:hasVoice})}
window.drawFrame=(cv,t)=>{
 const c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.filter='none';
 c.clearRect(0,0,cv.width,cv.height);c.save();c.scale(cv.width/PROJECT.logicalWidth,cv.height/PROJECT.logicalHeight);
 try{film.draw(c,Math.max(0,Math.min(DURATION,t)),PROJECT,media)}finally{c.restore()}
};
function musicLevel(){const fade=Math.min(1,currentT/.6,Math.max(0,(DURATION-currentT)/.8));music.volume=fade*(hasVoice?.12:.28)}
function paint(t){currentT=Math.max(0,Math.min(DURATION,t));drawFrame(canvas,currentT);musicLevel();scrub.value=currentT;document.getElementById('clock').textContent=`${fmt(currentT)} / ${fmt(DURATION)}`}
window.pauseAnimation=()=>{playing=false;voice.pause();music.pause();stopEffects();playButton.textContent='Play'};
function position(track){if(Number.isFinite(track.duration))track.currentTime=Math.min(currentT,track.duration)}
window.seek=t=>{
 stopEffects();currentT=Math.max(0,Math.min(DURATION,Number(t)||0));if(hasVoice)position(voice);if(hasMusic)position(music);
 origin=performance.now()/1000-currentT;paint(currentT);if(playing){startEffects();if(hasVoice&&currentT<voice.duration)voice.play().catch(showError);if(hasMusic&&currentT<music.duration)music.play().catch(showError)}
};
async function play(){
 if(currentT>=DURATION-.02)seek(0);
 try{if(hasVoice&&currentT<voice.duration){position(voice);await voice.play()}if(hasMusic&&currentT<music.duration){position(music);await music.play()}}
 catch(e){pauseAnimation();throw e}
 origin=performance.now()/1000-currentT;playing=true;playButton.textContent='Pause';startEffects();
}
function tick(){
 if(playing){
  let t=performance.now()/1000-origin;
  if(hasVoice&&!voice.ended&&currentT<voice.duration){t=voice.currentTime;origin=performance.now()/1000-t}
  if(hasMusic&&!music.paused&&!music.ended&&Math.abs(music.currentTime-t)>.2)music.currentTime=Math.min(t,music.duration);
  if(t>=DURATION){pauseAnimation();paint(DURATION);if(loop){seek(0);play().catch(showError)}}else paint(t);
 }requestAnimationFrame(tick);
}
function showError(e){document.getElementById('status').textContent=e.message||String(e)}
playButton.onclick=()=>playing?pauseAnimation():play().catch(showError);scrub.oninput=()=>seek(scrub.value);
soundButton.onclick=()=>{muted=!muted;voice.muted=music.muted=muted;soundButton.textContent=muted?'Sound off':'Sound on';soundButton.setAttribute('aria-pressed',String(!muted));if(muted)stopEffects();else if(playing)startEffects()};
document.getElementById('loop').onchange=e=>loop=e.target.checked;
function loadVoice(file){
 if(!file||!options.narration.enabled)return;pauseAnimation();if(objectURL)URL.revokeObjectURL(objectURL);
 objectURL=URL.createObjectURL(file);voice.src=objectURL;hasVoice=true;
 voice.onloadedmetadata=()=>{seek(0);document.getElementById('status').textContent='Replacement audio loaded. Existing visual timing is unchanged.'};
}
document.getElementById('load').onchange=e=>loadVoice(e.target.files[0]);
document.getElementById('clear').onclick=()=>{pauseAnimation();hasVoice=false;voice.removeAttribute('src');voice.load();seek(0);document.getElementById('status').textContent='Own clock active'};
document.addEventListener('dragover',e=>e.preventDefault());document.addEventListener('drop',e=>{e.preventDefault();loadVoice(e.dataTransfer.files[0])});
document.addEventListener('keydown',e=>{if(['INPUT','BUTTON','SELECT','TEXTAREA'].includes(e.target.tagName))return;if(e.code==='Space'){e.preventDefault();playButton.click()}if(e.code==='ArrowRight')seek(currentT+5);if(e.code==='ArrowLeft')seek(currentT-5)});
window.animationReady=(async()=>{
 if(!(film.aspectRatios||['16:9']).includes(options.aspectRatio))throw Error('This scene needs a '+options.aspectRatio+' composition. Re-stage the scene and declare film.aspectRatios before export.');
 if(LOGO_DATA){media.logo=new Image();media.logo.src=LOGO_DATA;await media.logo.decode()}
 await Promise.all(FONT_SPECS.map(f=>document.fonts.load(f)));await document.fonts.ready;
 await Promise.all([voice,music].filter(a=>a.getAttribute('src')).map(a=>a.readyState>=1?Promise.resolve():new Promise((resolve,reject)=>{a.addEventListener('loadedmetadata',resolve,{once:true});a.addEventListener('error',()=>reject(Error(a.id+' audio could not load')),{once:true})})));
 document.getElementById('load').parentElement.hidden=!options.narration.enabled;document.getElementById('clear').hidden=!options.narration.enabled;
 scrub.max=DURATION;paint(0);playButton.disabled=false;
 if(STORYBOARD){
  document.querySelector('.player').hidden=true;const grid=document.getElementById('board');grid.hidden=false;
  for(const beat of BEATS){
   const panel=document.createElement('article'),cv=document.createElement('canvas');cv.width=PROJECT.logicalWidth;cv.height=PROJECT.logicalHeight;drawFrame(cv,beat.frame??beat.end-.25);panel.append(cv);
   const info=document.createElement('div');
   for(const text of [`${beat.id} · ${beat.start.toFixed(2)}–${beat.end.toFixed(2)}s`,(beat.text||[]).join(' · '),`Transition: ${beat.transition||'Continuous'}`,`Narration: ${options.narration.enabled?(beat.narration||'Pending'):'Off'}`,`Music: ${options.music.enabled?options.music.mood:'Off'}`,`Sound effects: ${options.soundEffects.enabled?(beat.sounds||'None'):'Off'}`]){const p=document.createElement('p');p.textContent=text;info.append(p)}panel.append(info);grid.append(panel);
  }
  const note=document.createElement('p');note.textContent='Assumptions: '+(PROJECT.assumptions?.join('; ')||'None');grid.append(note);
 }
 const pending=[];if(options.narration.enabled&&!hasVoice)pending.push('narration');if(options.music.enabled&&!hasMusic)pending.push('music');
 document.getElementById('status').textContent=pending.length?'Storyboard preview — '+pending.join(' and ')+' audio pending':'Ready';requestAnimationFrame(tick);
 return {duration:DURATION,audioDuration:hasVoice?voice.duration:null,musicDuration:hasMusic?music.duration:null,width:canvas.width,height:canvas.height,fontsLoaded:FONT_SPECS.every(f=>document.fonts.check(f)),pendingAudio:pending};
})();
