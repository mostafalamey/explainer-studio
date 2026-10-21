(()=>{
 const S=STYLE_PACKS['vintage-newsprint'],cache={};
 const ease=(t,a,b)=>H.ease.out(H.clamp((t-a)/(b-a))),seg=(t,a,b)=>H.clamp((t-a)/(b-a));
 function person(x,cx,base,scale=1){x.save();x.translate(cx,base);x.scale(scale,scale);x.fillStyle='#cfcfcf';x.beginPath();x.arc(0,-85,15,0,7);x.fill();x.fillStyle='#3a3a3a';x.beginPath();x.arc(0,-89,15,Math.PI,Math.PI*2);x.fill();x.fillStyle='#9b9b9b';x.beginPath();x.moveTo(-18,-64);x.lineTo(18,-64);x.lineTo(23,-20);x.lineTo(-23,-20);x.closePath();x.fill();x.strokeStyle='#272727';x.lineWidth=9;x.lineCap='round';x.beginPath();x.moveTo(-11,-20);x.lineTo(-13,0);x.moveTo(11,-20);x.lineTo(13,0);x.stroke();x.lineWidth=7;x.beginPath();x.moveTo(-18,-57);x.lineTo(-28,-28);x.moveTo(18,-57);x.lineTo(30,-35);x.stroke();x.restore()}
 function photos(){
  if(cache.kiosk)return;
  cache.kiosk=S.graySrc(240,220,x=>{
   let g=x.createLinearGradient(0,0,0,220);g.addColorStop(0,'#999');g.addColorStop(.7,'#d8d8d8');g.addColorStop(.71,'#999');g.addColorStop(1,'#777');x.fillStyle=g;x.fillRect(0,0,240,220);
   x.fillStyle='#555';x.fillRect(154,184,60,10);g=x.createLinearGradient(130,0,205,0);g.addColorStop(0,'#eee');g.addColorStop(1,'#999');x.fillStyle=g;x.fillRect(140,30,62,156);x.fillStyle='#262626';x.fillRect(147,41,48,64);x.fillStyle='#aaa';x.fillRect(152,47,38,50);x.fillStyle='#444';x.fillRect(154,123,34,5);x.fillStyle='#eee';x.fillRect(157,129,28,24);person(x,69,204,1.35);
  });
  cache.reception=S.graySrc(280,220,x=>{
   let g=x.createLinearGradient(0,0,0,220);g.addColorStop(0,'#c9c9c9');g.addColorStop(1,'#8a8a8a');x.fillStyle=g;x.fillRect(0,0,280,220);
   x.fillStyle='#aaa';x.fillRect(8,16,92,54);x.strokeStyle='#777';x.strokeRect(8,16,92,54);person(x,204,173,1.2);
   x.fillStyle='#333';x.fillRect(108,81,66,51);x.fillRect(136,132,10,18);x.fillStyle='#aaa';x.fillRect(114,87,54,37);x.fillStyle='#555';x.fillRect(73,151,199,13);g=x.createLinearGradient(0,163,0,220);g.addColorStop(0,'#ddd');g.addColorStop(1,'#aaa');x.fillStyle=g;x.fillRect(83,164,179,56);x.fillStyle='#666';x.fillRect(75,165,8,55);
  });
  cache.patient=S.graySrc(80,118,x=>{x.fillStyle='#fff';x.fillRect(0,0,80,118);person(x,40,110,1)});
 }
 function back(k){k.fillStyle='#000';S.txt(k,'SMART QUEUE','700 54px "Oswald"',640,92,'center');k.fillRect(48,112,1184,2);for(let i=0;i<6;i++)S.column(k,H.rng(77+i),48+i*200,126,710)}
 function ink(k,t,p){
  const ev=Object.assign({},...p.beats.map(b=>b.events)),ticket=ease(t,ev.ticket,ev.ticket+.28),call=ease(t,ev.call,ev.call+.3),kiosk=ease(t,ev.kiosk,ev.kiosk+.25),reception=ease(t,ev.reception,ev.reception+.25);
  k.fillStyle='#000';k.strokeStyle='#000';
  S.txt(k,'SMART QUEUE','700 28px "Oswald"',48,34);S.txt(k,'PATIENT ARRIVAL','700 28px "Oswald"',1232,34,'right');
  k.fillRect(48,52,76,72);S.txt(k,'The Smart Queue Times','400 78px "UnifrakturMaguntia"',700,113,'center');S.rule(k,48,1232,132,3.2);S.rule(k,48,1232,139,1);
  S.txt(k,'PATIENT JOURNEY','700 28px "Oswald"',48,172);S.txt(k,'KIOSK TO RECEPTION','700 28px "Oswald"',1232,172,'right');S.rule(k,48,1232,184,1.5);
  S.txt(k,t>=ev.call?'WHEN CALLED, GO TO RECEPTION':'TAKE A RECEPTION TICKET','700 64px "Oswald"',640,255,'center');S.rule(k,48,1232,274,1.3);
  if(kiosk>0){k.save();k.globalAlpha=kiosk;S.halfDots(k,cache.kiosk,58,306,240,220,4.6);S.txt(k,'KIOSK','700 34px "Oswald"',178,566,'center');k.restore()}
  if(ticket>0){k.save();k.globalAlpha=ticket;S.txt(k,t>=ev.call?'NOW CALLING':'RECEPTION TICKET','700 34px "Oswald"',622,323,'center');k.lineWidth=2;k.strokeRect(452,346,340,176);S.txt(k,'G-001','700 108px "Oswald"',622,479,'center');S.rule(k,472,772,500,1);S.npArrow(k,[318,416],[375,401],[424,416],ticket,3.5);k.restore()}
  if(reception>0){k.save();k.globalAlpha=reception;S.halfDots(k,cache.reception,902,306,280,220,4.6);S.txt(k,'RECEPTION','700 34px "Oswald"',1042,566,'center');k.restore()}
  if(call>0)S.npArrow(k,[808,416],[846,401],[878,416],ease(t,ev.call,ev.reception),3.5);
  const r=ease(t,ev.travel,ev.travel+.85),cx=340+500*H.ease.inOut(r),py=659;
  if(t>=ev.patient){
   if(t>=ev.call)S.npArrow(k,[340,615],[590,598],[840,615],ease(t,ev.travel,ev.travel+.85),2.5);
   k.save();k.globalCompositeOperation='destination-out';k.fillRect(cx-46,py-120,92,126);k.restore();S.halfDots(k,cache.patient,cx-40,py-118,80,118,3.2);
  }
  // Decorative newspaper columns are visual texture, not content or quantitative claims.
  S.column(k,H.rng(19),48,596,710);S.column(k,H.rng(44),1048,596,710);
  if(t>=ev.call)S.txt(k,'One ticket. One clear next step.','italic 400 32px "Playfair Display"',640,688,'center');
 }
 window.film={aspectRatios:['16:9'],draw(c,t,p,media){
  const ev=Object.assign({},...p.beats.map(b=>b.events));S.setScale(p.width/1280);photos();S.initPaper(back);
  const z=1+.018*H.ease.inOut(seg(t,ev.kiosk,p.duration)),cam=[640,360,z];
  const page=S.renderSheet(1280,720,(k,tt)=>ink(k,tt,p),t,cam);
  c.fillStyle='#171411';c.fillRect(0,0,1280,720);
  const u=ease(t,ev.hook,ev.settle);c.save();c.translate(640,360);c.rotate((1-u)*-Math.PI*4.2);c.scale(.04+.96*u,.04+.96*u);c.translate(-640,-360);
  c.drawImage(page,0,0,1280,720);
  if(t>=ev.call)S.pencilRing(c,cam,1280,720,622,435,154,90,seg(t,ev.call,ev.call+.36),7);
  // Preserve authentic logo artwork on the printed dark masthead panel.
  if(media.logo){c.save();c.translate(640-cam[0]*z,360-cam[1]*z);c.scale(z,z);c.drawImage(media.logo,62,58,46,58);c.restore()}
  c.restore();
 },scoreSound(k,p){const a=S.soundKit(k),ev=Object.assign({},...p.beats.map(b=>b.events));k.play('paper',ev.hook,{dur:.5,gain:.4});a.knock(ev.settle,.45,0);a.tap(ev.kiosk,.7,-.6);a.rulePen(ev.ticket,.28,.7,-.2);a.knock(ev.ticket,.5,0,true);a.knock(ev.call,.7,0);a.grease(ev.call,.36,.55,0);a.tap(ev.reception,.6,.6);a.rulePen(ev.travel,.85,.55,.2);a.tap(ev.travel+.85,.7,.5)}};
})();
