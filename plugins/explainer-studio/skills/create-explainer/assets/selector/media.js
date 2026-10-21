
// Small previews are silent loops. Narrated playback has a separate, always-closable viewer.
(()=>{
 const videos=[...document.querySelectorAll('.grid-preview')],viewer=document.getElementById('preview-viewer'),shell=document.getElementById('preview-shell'),player=document.getElementById('narrated-player'),close=document.getElementById('preview-close'),full=document.getElementById('preview-fullscreen'),status=document.getElementById('preview-status');
 const visible=new Set();let wasNarrating=false,opener=null;
 const playSmall=v=>{if(!viewer.open&&!document.hidden&&visible.has(v)){v.muted=true;v.defaultMuted=true;v.loop=true;v.controls=false;v.play().catch(()=>{})}else v.pause()};
 for(const v of videos){v.muted=true;v.defaultMuted=true;v.loop=true;v.controls=false;v.addEventListener('error',()=>v.parentElement.classList.add('has-error'))}
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting)visible.add(e.target);else visible.delete(e.target);playSmall(e.target)}},{threshold:.12});videos.forEach(v=>observer.observe(v))}else{videos.forEach(v=>visible.add(v));videos.forEach(playSmall)}
 async function closeViewer(){
  player.pause();player.muted=true;
  if(document.fullscreenElement===shell)try{await document.exitFullscreen()}catch{}
  if(viewer.open)viewer.close();
 }
 function cleanup(){player.pause();player.muted=true;player.removeAttribute('src');player.load();document.body.classList.remove('preview-open');videos.forEach(playSmall);opener?.focus({preventScroll:true});opener=null}
 function openViewer(index,button){
  const small=videos[index];opener=button;videos.forEach(v=>v.pause());
  document.getElementById('preview-title').textContent=styles[index].name;player.setAttribute('aria-label',styles[index].name+' narrated preview');
  player.src=small.currentSrc||small.getAttribute('src');player.poster=small.poster;player.loop=true;player.muted=false;player.defaultMuted=false;player.volume=1;status.hidden=true;
  if(!viewer.open)viewer.showModal();document.body.classList.add('preview-open');close.focus({preventScroll:true});
  player.play().catch(()=>{status.textContent='Press Play in the player to start the narrated preview.';status.hidden=false});
 }
 document.querySelectorAll('.preview').forEach(b=>b.addEventListener('click',()=>openViewer(Number(b.dataset.index),b)));
 close.addEventListener('click',closeViewer);viewer.addEventListener('cancel',e=>{e.preventDefault();closeViewer()});viewer.addEventListener('close',cleanup);
 if(!shell.requestFullscreen)full.hidden=true;
 full.addEventListener('click',async()=>{try{if(document.fullscreenElement===shell)await document.exitFullscreen();else await shell.requestFullscreen()}catch{status.textContent='Full screen is unavailable here. The large preview is ready; Close preview returns to the styles.';status.hidden=false}});
 document.addEventListener('fullscreenchange',()=>{full.textContent=document.fullscreenElement===shell?'Exit full screen':'Full screen'});
 player.addEventListener('error',()=>{if(viewer.open){status.textContent='This preview could not load. Close preview to return to the styles.';status.hidden=false}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){videos.forEach(v=>v.pause());wasNarrating=viewer.open&&!player.paused;player.pause()}else if(viewer.open){if(wasNarrating)player.play().catch(()=>{})}else videos.forEach(playSmall)});
})();
