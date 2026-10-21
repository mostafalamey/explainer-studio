const key='explainer-studio-video-choice';
let selected=-1,copyResetTimer=null;
const el=id=>document.getElementById(id);
function readSettings(){return {aspectRatio:document.querySelector('[name="aspect-ratio"]:checked').value,narration:{enabled:el('narration-enabled').checked,language:el('narration-language').value.trim()||'English',voice:el('narration-voice').value.trim()||'Auto — suit the story',mode:el('narration-source').value,provider:el('narration-source').value==='automatic'?'auto':'user-created',service:el('narration-service').value},music:{enabled:el('music-enabled').checked,mood:el('music-mood').value,mode:el('music-source').value,provider:el('music-source').value==='automatic'?'auto':'user-created',service:el('music-service').value,instrumental:true},soundEffects:{enabled:el('effects-enabled').checked}}}
function update(){
 const settings=readSettings();
 clearTimeout(copyResetTimer);el('copy-choice').textContent='Copy settings to clipboard';el('copy-status').textContent='';el('copy-fallback').hidden=true;
 const sourceName=track=>track.mode==='user-created'?'User-created':track.service==='auto'?'Automatic':'Automatic: '+track.service;
 const routes=[['narration',settings.narration],['music',settings.music]].filter(([,track])=>track.enabled);
 const instructions=routes.map(([name,track])=>track.mode==='user-created'?(name==='narration'?'Narration: you supply the recording.':'Music: you supply the track, for example from Suno.'):(name==='narration'?'Narration: generated automatically.':'Music: generated automatically.'));
 for(const [name,track] of [['narration',settings.narration],['music',settings.music]])el(name+'-service-field').hidden=track.mode!=='automatic';
 el('audio-production-note').textContent=instructions.join(' ');el('audio-production-note').hidden=!routes.length;
 el('narration-options').hidden=!settings.narration.enabled;el('silent-note').hidden=settings.narration.enabled;el('music-options').hidden=!settings.music.enabled;
 document.querySelectorAll('.toggle input').forEach(i=>i.nextElementSibling.textContent=i.checked?'On':'Off');
 const s=styles[selected];const choice={schemaVersion:2,...(s?{style:s.id,name:s.name}:{}),settings};
 try{localStorage.setItem(key,JSON.stringify(choice));if(s)localStorage.setItem('explainer-studio-style',s.id)}catch{}
 if(!s)return;
 el('selection-title').textContent=s.name+' selected';
 el('selection-copy').textContent=settings.aspectRatio+' · Narration '+(settings.narration.enabled?'on ('+sourceName(settings.narration)+')':'off')+' · Music '+(settings.music.enabled?'on ('+sourceName(settings.music)+')':'off')+' · Sound effects '+(settings.soundEffects.enabled?'on':'off');
 let request='Use $create-explainer with the '+s.name+' style, '+settings.aspectRatio+' aspect ratio, '+(settings.narration.enabled?settings.narration.language+' narration (voice preference: '+settings.narration.voice+')':'no narration; explain with on-screen text and reading time')+', '+(settings.music.enabled?settings.music.mood+' instrumental background music':'no background music')+', and '+(settings.soundEffects.enabled?'sound effects':'no sound effects')+'.';
 for(const [name,track] of routes){
  if(track.mode==='user-created')request+=name==='narration'?" Prepare the narration script and voice direction. I will create and supply the narration file; wait for it instead of generating narration.":" Prepare an instrumental music prompt. I will create the music in Suno or another service and supply the track; wait for my file instead of generating music.";
  else request+=' Generate '+name+' automatically using '+(track.service==='auto'?'a compatible connected tool or locally configured service':track.service)+" during approved production. If that service or API is unavailable, explain what is needed; do not silently switch providers.";
 }
 el('copy-choice').hidden=false;
 el('copy-choice').dataset.text=request+'\n\nVideo choices:\n```json\n'+JSON.stringify(choice,null,2)+'\n```';
}
function select(index){selected=index;document.querySelectorAll('.select').forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===index));b.firstChild.textContent=i===index?'Selected: '+styles[i].name:'Select '+styles[i].name;el('card-'+i).classList.toggle('chosen',i===index)});update()}
document.querySelectorAll('.card').forEach((card,index)=>card.addEventListener('click',()=>select(index)));
document.querySelectorAll('.preferences input,.preferences select,.toggle input,[name="aspect-ratio"]').forEach(i=>i.addEventListener('input',update));
el('copy-choice').onclick=async()=>{
 clearTimeout(copyResetTimer);
 const button=el('copy-choice'),text=button.dataset.text;
 if(!text)return;
 let copied=false;
 try{await navigator.clipboard.writeText(text);copied=true}catch{
  const field=document.createElement('textarea');field.value=text;field.setAttribute('aria-label','Video choices to copy');field.style.cssText='position:fixed;top:0;left:-9999px';document.body.append(field);field.select();
  try{copied=document.execCommand('copy')}catch{}finally{field.remove();button.focus()}
 }
 if(copied){button.textContent='Copied!';el('copy-status').textContent='Copied. Paste into your chat.';copyResetTimer=setTimeout(()=>{button.textContent='Copy settings to clipboard';el('copy-status').textContent=''},1200)}
 else{el('copy-fallback').hidden=false;el('copy-fallback-text').value=text;el('copy-fallback-text').focus();el('copy-fallback-text').select();el('copy-status').textContent='Clipboard access is unavailable. Copy the selected settings below, then paste into chat.'}
};

try{
 let saved=JSON.parse(localStorage.getItem(key)||'null');if(!saved||![1,2].includes(saved.schemaVersion))saved={style:localStorage.getItem('explainer-studio-style')};
 const v=saved.settings||{};
 for(const name of ['narration','music']){
  const track=v[name]||{},legacy=track.provider??v.audioProduction;
  el(name+'-source').value=['automatic','user-created'].includes(track.mode)?track.mode:['google-ai-studio','user-created'].includes(legacy)?'user-created':'automatic';
  const service=typeof track.service==='string'&&track.service.length<=120?track.service:legacy==='elevenlabs'?'ElevenLabs':'auto';
  if(service!=='auto')el(name+'-service').add(new Option(service,service));el(name+'-service').value=service;
 }
 if(['16:9','9:16','1:1'].includes(v.aspectRatio))document.querySelector('[name="aspect-ratio"][value="'+v.aspectRatio+'"]').checked=true;
 for(const [name,id] of [['narration','narration-enabled'],['music','music-enabled'],['soundEffects','effects-enabled']])if(typeof v[name]?.enabled==='boolean')el(id).checked=v[name].enabled;
 if(['English','Arabic','French','German','Russian','Japanese','Chinese'].includes(v.narration?.language))el('narration-language').value=v.narration.language;
 if(typeof v.narration?.voice==='string')el('narration-voice').value=v.narration.voice.slice(0,200);
 if(['calm','upbeat','cinematic'].includes(v.music?.mood))el('music-mood').value=v.music.mood;
 const index=styles.findIndex(s=>s.id===(saved.style==='cosmic-star-chart'?'vintage-newsprint':saved.style));if(index>=0)select(index);
}catch{try{const i=styles.findIndex(s=>s.id===((localStorage.getItem('explainer-studio-style')==='cosmic-star-chart')?'vintage-newsprint':localStorage.getItem('explainer-studio-style')));if(i>=0)select(i)}catch{}}
update();

function refreshServiceOptions(services){
 for(const name of ['narration','music']){
  const select=el(name+'-service'),value=select.value||'auto';select.replaceChildren(new Option('Choose available service','auto'));
  for(const item of services)select.add(new Option(item.name,item.name));
  if(value!=='auto'&&!services.some(s=>s.name===value))select.add(new Option(value+' (not saved here)',value));
  select.value=value;
 }
}
