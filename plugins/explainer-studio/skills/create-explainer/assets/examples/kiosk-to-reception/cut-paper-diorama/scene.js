{
const S=STYLE_PACKS['cut-paper-diorama'];
const ink='#2b2d5a',cream='#f3ecdc',teal='#2f7f86',gold='#f2b545',red='#d9473b';
const ease=(t,a,d=.6)=>H.ease.inOut(H.clamp((t-a)/d));
function shape(c,pts,col,seed=12){c.fillStyle=col;c.beginPath();S.poly(c,S.cutLines(H.rng(seed),[...pts,pts[0]],18,.65));c.fill();}
function disc(c,x,y,r,col){c.fillStyle=col;c.beginPath();S.poly(c,S.circPts(H.rng(29),x,y,r));c.fill();}
function label(c,str,x,y,px=30,col=ink,back=cream,rot=0){S.put(c,S.wordSpr(str,px,col,back,8),x,y,{rot,d:.35,sa:.24});}
function person(col){return S.cache('person'+col,()=>S.compose(130,240,[
 [c=>{shape(c,[[45,152],[61,153],[56,220],[33,220]],ink);shape(c,[[71,151],[87,150],[100,219],[77,219]],ink)},.3],
 [c=>shape(c,[[39,74],[84,73],[99,161],[30,162]],col),.8],
 [c=>{shape(c,[[38,77],[47,92],[24,141],[10,130]],col);shape(c,[[84,80],[95,77],[119,126],[104,137]],col)},.7],
 [c=>disc(c,63,48,25,'#e5b58f'),.8],
 [c=>shape(c,[[37,39],[44,22],[67,19],[85,29],[87,43],[66,35],[44,43]],ink),.5]
]));}
function kiosk(){return S.cache('kiosk',()=>S.compose(210,320,[
 [c=>shape(c,[[43,282],[172,282],[189,301],[26,302]],ink),.4],
 [c=>shape(c,[[76,170],[134,169],[146,287],[65,287]],teal),.5],
 [c=>shape(c,[[30,22],[180,18],[184,211],[25,215]],gold),1],
 [c=>shape(c,[[48,40],[160,38],[162,147],[46,151]],cream),.4],
 [c=>{shape(c,[[69,63],[143,63],[143,76],[69,76]],teal);shape(c,[[66,92],[144,92],[144,124],[65,124]],red);shape(c,[[69,175],[145,173],[145,184],[68,186]],ink)},.35]
]));}
function ticket(){return S.cache('ticket',()=>S.compose(290,150,[
 [c=>shape(c,[[14,11],[274,8],[276,138],[15,141],[20,126],[13,113],[20,100],[13,87],[20,73],[13,60],[20,48],[13,35]],cream),.4],
 [c=>{c.fillStyle=ink;c.textAlign='center';c.font='400 22px "Archivo Black"';c.fillText('RECEPTION TICKET',145,43);c.font='400 60px "Archivo Black"';c.fillText('G-001',145,109)},.15]
]));}
window.film={
draw(c,t,p,m){
 window.PAPER_SCALE=c.canvas.width/1280;
 const ti=p.beats[1].events.ticket,call=p.beats[2].events.call,go=p.beats[2].events.reception,travel=ease(t,go,1.35);
 const back=S.cache('back',()=>S.paperize(1280,720,x=>{x.fillStyle=cream;x.fillRect(0,0,1280,720)},{rim:false,tex:.7}));
 S.shadowDraw(c,back,0,0,0);
 // The room is a stack of separate scissor-cut sheets with parallax.
 c.save();c.translate(-travel*7,0);
 const room=S.cache('room',()=>S.compose(1210,430,[
 [x=>shape(x,[[17,15],[1193,12],[1187,418],[21,412]],ink),.8],
 [x=>shape(x,[[42,36],[1168,33],[1164,304],[44,309]],'#86bccd'),.7],
 [x=>shape(x,[[44,309],[1164,304],[1181,398],[26,397]],'#e8c56b'),.65],
 [x=>{shape(x,[[576,51],[1088,53],[1086,263],[574,266]],'#b9d3c4');shape(x,[[592,65],[1070,66],[1068,249],[591,250]],cream)},.5],
 [x=>{shape(x,[[632,86],[1026,86],[1026,94],[632,94]],'#b9d3c4');shape(x,[[632,116],[875,116],[875,123],[632,123]],'#b9d3c4')},.1]
 ]));
 S.put(c,room,640,426,{d:.4,sa:.22});
 S.put(c,kiosk(),220,434,{d:.7});
 // Receptionist stands behind a layered paper counter.
 S.put(c,person(teal),1036,407,{s:.76,d:.5});
 const desk=S.cache('desk',()=>S.compose(340,157,[
 [x=>shape(x,[[22,35],[319,32],[315,146],[26,147]],teal),.6],
 [x=>shape(x,[[13,17],[325,16],[330,42],[10,45]],cream),.65],
 [x=>shape(x,[[47,63],[291,61],[288,130],[47,129]],'#86bccd'),.4]
 ]));
 S.put(c,desk,1000,520,{d:1});
 label(c,'RECEPTION',1000,523,29,ink,null);
 const startX=410+ease(t,0,1)*30,px=H.lerp(startX,815,travel);
 S.put(c,person(red),px,460,{rot:travel>0&&travel<1?Math.sin(t*14)*.035:0,d:1});
 label(c,'KIOSK',218,270,30,ink,cream,-.025);
 c.restore();
 // Paper title, brand and labels stay readable while the set travels.
 if(m.logo)c.drawImage(m.logo,49,22,50,50);
 label(c,'SMART QUEUE',242,49,27,ink,null);
 label(c,'PATIENT ARRIVAL',1060,49,24,teal,null);
 const heading=t<ti?'START AT THE KIOSK':t<call?'TAKE A RECEPTION TICKET':'YOUR NUMBER IS CALLED';
 label(c,heading,640,141,45,ink,cream,-.008);
 if(t>=ti){
  const drop=S.dropIn(t,ti,.45,30);
  S.put(c,ticket(),242,573+drop.dy,{s:drop.s,a:drop.a,rot:-.04,d:drop.d,sa:.28});
 }
 if(t>=call){
  const drop=S.dropIn(t,call,.4,38);
  c.save();c.globalAlpha=drop.a;
  const callCard=S.cache('callcard',()=>S.paperize(285,152,x=>shape(x,[[11,12],[271,8],[276,139],[15,143]],red)));
  S.put(c,callCard,995,245+drop.dy,{s:drop.s,d:drop.d,rot:.025});
  label(c,'NOW CALLING',995,216+drop.dy,25,cream,null,.025);
  label(c,'G-001',995,270+drop.dy,55,cream,null,.025);c.restore();
 }
 if(t>=go){
  // Revealing a cached cut-paper arrow avoids creating textures every frame.
  const ar=S.cache('route',()=>S.paperize(370,95,x=>shape(x,[[10,44],[295,44],[292,14],[357,52],[291,85],[295,60],[10,60]],red)));
  c.save();c.beginPath();c.rect(474,564,370*ease(t,go,.9),95);c.clip();S.shadowDraw(c,ar,474,564,.5,.25);c.restore();
 }
 label(c,t<go?'TAKE A TICKET. WAIT FOR YOUR CALL.':'WHEN CALLED, GO TO RECEPTION.',640,683,27,ink,null);
},
scoreSound(k,p){
 k.play('pop',p.beats[0].events.kiosk,{gain:.23,f:420,minor:true});
 k.play('tock',p.beats[1].events.ticket,{gain:.3,f:360,minor:true});
 k.play('ding',p.beats[2].events.call,{gain:.24,f:'G5'});
 k.noise(p.beats[2].events.reception,{dur:1.2,color:'pink',filter:'lowpass',f:500,gain:.02,a:.2,minor:true});
}
};
}
