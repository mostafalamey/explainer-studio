const fs=require('fs'),path=require('path'),os=require('os'),{spawn}=require('child_process'),{once}=require('events'),{chromium}=require('playwright');
(async()=>{
 const root=path.resolve(__dirname,'..'),skill=path.join(root,'plugins/explainer-studio/skills/create-explainer'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'explainer-docs-')),output=path.join(__dirname,'screenshots');
 let server,browser;
 try{
  server=spawn(process.env.PYTHON||'python',[path.join(skill,'scripts/serve.py'),path.join(skill,'assets'),'--port','0','--config-dir',temp],{windowsHide:true,stdio:['ignore','pipe','pipe']});
  const base=await new Promise((resolve,reject)=>{let text='';const timer=setTimeout(()=>reject(Error('Selector startup timeout')),15000);server.stdout.on('data',chunk=>{text+=chunk;const match=text.match(/Explainer Studio: (http:\/\/127\.0\.0\.1:\d+)\//);if(match){clearTimeout(timer);resolve(match[1])}});server.on('error',reject);server.on('exit',code=>{clearTimeout(timer);reject(Error('Selector exited: '+code))})});
  const channel=process.env.BROWSER_CHANNEL||(process.platform==='win32'?'msedge':'chromium');browser=await chromium.launch({headless:true,...(channel==='chromium'?{}:{channel})});const page=await browser.newPage({viewport:{width:1440,height:1100}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/style-selector.html');await page.getByRole('button',{name:'Select Isometric Pastel',exact:true}).click();await page.locator('#music-enabled').check();await page.locator('#music-source').selectOption('user-created');await page.locator('#narration-language').selectOption('Arabic');await page.locator('.api-settings summary').click();await page.waitForFunction(()=>document.querySelector('#service-storage').textContent.includes('Storage:'));
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(output,'video-settings.png')});
  await page.locator('.api-settings summary').click();await page.locator('.grid').scrollIntoViewIfNeeded();const gridTop=await page.locator('.grid').evaluate(e=>e.getBoundingClientRect().top+scrollY);await page.evaluate(y=>scrollTo(0,y),gridTop);
  await page.evaluate(async()=>{for(const v of [...document.querySelectorAll('.grid-preview')].slice(0,4)){if(v.readyState<1)await new Promise(r=>v.addEventListener('loadedmetadata',r,{once:true}));v.pause();await new Promise(r=>{v.addEventListener('seeked',r,{once:true});v.currentTime=5})}});
  await page.screenshot({path:path.join(output,'style-library.png')});
  await page.getByRole('button',{name:'Preview Tech Glow',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#narrated-player').currentTime>0);await page.locator('#narrated-player').evaluate(async v=>{v.pause();await new Promise(r=>{v.addEventListener('seeked',r,{once:true});v.currentTime=5})});await page.screenshot({path:path.join(output,'narrated-player.png')});
  if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({screenshots:3,errors}));
 }finally{if(browser)await browser.close();if(server&&server.exitCode===null){server.kill();await once(server,'exit')}const resolved=path.resolve(temp);if(!resolved.startsWith(path.resolve(os.tmpdir())+path.sep))throw Error('Unexpected temporary path');fs.rmSync(resolved,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exitCode=1});
