(()=>{
 let token=null,services=[];
 const form=el('service-form'),status=el('service-status');
 function reset(){form.reset();el('service-id').value='';el('service-save').textContent='Save service';el('service-cancel').hidden=true;el('service-key').placeholder='Enter API key'}
 function render(){
  el('service-list').replaceChildren();
  for(const item of services){
   const row=document.createElement('div');row.className='service-row';
   const label=document.createElement('span');label.textContent=item.name+' · Key saved';row.append(label);
   const edit=document.createElement('button');edit.type='button';edit.textContent='Edit';edit.setAttribute('aria-label','Edit '+item.name);edit.onclick=()=>{el('service-id').value=item.id;el('service-name').value=item.name;el('service-docs').value=item.docsUrl||'';el('service-key').value='';el('service-key').placeholder='Leave blank to keep saved key';el('service-save').textContent='Update service';el('service-cancel').hidden=false;status.textContent='';el('service-name').focus()};
   const remove=document.createElement('button');remove.type='button';remove.textContent='Remove';remove.setAttribute('aria-label','Remove '+item.name);remove.onclick=async()=>{try{await mutate({action:'delete',id:item.id});reset();status.textContent='Service removed.'}catch(e){status.textContent=e.message}};
   row.append(edit,remove);el('service-list').append(row);
  }
  refreshServiceOptions(services);
 }
 async function mutate(body){
  if(!token)throw Error('Start the bundled local selector server to save API keys.');
  const response=await fetch('/api/services',{method:'POST',headers:{'Content-Type':'application/json','X-Explainer-Token':token},body:JSON.stringify(body)}),result=await response.json();
  if(!response.ok)throw Error(result.error||'The service could not be saved.');services=result.services;render();
 }
 form.onsubmit=async event=>{event.preventDefault();const button=el('service-save');button.disabled=true;
  try{await mutate({action:'save',id:el('service-id').value||undefined,name:el('service-name').value,apiKey:el('service-key').value,docsUrl:el('service-docs').value});reset();status.textContent='Saved on this computer. The key is not included in copied settings.'}
  catch(e){status.textContent=e.message}finally{el('service-key').value='';button.disabled=false}
 };
 el('service-cancel').onclick=()=>{reset();status.textContent=''};
 if(!/^https?:$/.test(location.protocol)){status.textContent='Open this selector with the bundled local server to manage API keys.';el('service-save').disabled=true;return}
 fetch('/api/services',{cache:'no-store'}).then(async response=>{const result=await response.json();if(!response.ok)throw Error(result.error||'Service settings unavailable.');token=result.token;services=result.services;render();el('service-storage').textContent='Storage: '+result.storage+'. Saved keys are never displayed again.'}).catch(error=>{status.textContent=error.message.includes('OS credential')?error.message:'Start or restart the bundled local selector server to manage API keys.';el('service-save').disabled=true});
})();
