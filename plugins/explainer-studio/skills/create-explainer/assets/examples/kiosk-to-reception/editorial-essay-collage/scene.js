{
const S=STYLE_PACKS['editorial-essay-collage'];let A=null;
const E=(t,a,d)=>H.ease.inOut(H.clamp((t-a)/d));
function plain(c,s,x,y,font,col=S.INK,align='center'){c.font=font;c.textAlign=align;c.textBaseline='middle';c.fillStyle=col;c.fillText(s,x,y);}
function figure(c,x,y,size,staff=false){
 c.save();c.translate(x,y);c.scale(size,size);
 c.fillStyle=S.gs(.2);c.fillRect(-18,71,13,68);c.fillRect(7,71,13,68);
 const jacket=c.createLinearGradient(-35,0,30,80);jacket.addColorStop(0,S.gs(staff?.94:.39));jacket.addColorStop(1,S.gs(staff?.62:.17));
 c.fillStyle=jacket;c.beginPath();c.moveTo(-29,7);c.quadraticCurveTo(0,-5,29,7);c.lineTo(36,81);c.lineTo(-35,81);c.closePath();c.fill();
 c.strokeStyle=S.gs(staff?.8:.3);c.lineWidth=15;c.lineCap='round';c.beginPath();c.moveTo(26,18);c.lineTo(47,49);c.lineTo(74,32);c.stroke();
 c.fillStyle=S.gs(.65);S.ell(c,76,30,9,6);c.fill();
 const face=c.createLinearGradient(-18,-43,20,-10);face.addColorStop(0,S.gs(.85));face.addColorStop(1,S.gs(.48));c.fillStyle=face;S.ell(c,0,-22,19,26);c.fill();
 c.fillStyle=S.gs(.12);c.beginPath();c.moveTo(-19,-20);c.bezierCurveTo(-28,-58,27,-59,20,-17);c.lineTo(13,-36);c.lineTo(-12,-34);c.fill();
 c.fillStyle=S.gs(.92);c.beginPath();c.moveTo(-12,3);c.lineTo(0,20);c.lineTo(12,3);c.lineTo(0,9);c.fill();
 if(staff){c.fillStyle=S.gs(.12);c.fillRect(10,34,16,20);c.fillStyle=S.gs(.85);c.fillRect(12,37,12,13);}
 c.restore();
}
function room(c,w,h){
 const bg=c.createLinearGradient(0,0,w,h);bg.addColorStop(0,S.gs(.93));bg.addColorStop(.65,S.gs(.7));bg.addColorStop(1,S.gs(.53));c.fillStyle=bg;c.fillRect(0,0,w,h);
 c.fillStyle=S.gs(.97);c.fillRect(17,15,84,h*.58);c.fillRect(112,15,84,h*.58);
 c.strokeStyle=S.gs(.52);c.lineWidth=2;for(let x=16;x<210;x+=32){c.beginPath();c.moveTo(x,15);c.lineTo(x,h*.63);c.stroke();}
 c.fillStyle=S.gs(.65);c.fillRect(0,h*.75,w,h*.25);c.strokeStyle=S.gs(.44);c.lineWidth=1;
 for(let x=-w;x<w*2;x+=64){c.beginPath();c.moveTo(w/2,h*.75);c.lineTo(x,h);c.stroke();}
}
function kioskGray(c,w,h){
 room(c,w,h);c.fillStyle=S.gs(.29);c.fillRect(220,224,32,40);c.fillRect(194,260,86,11);
 const g=c.createLinearGradient(185,30,293,240);g.addColorStop(0,S.gs(.92));g.addColorStop(.6,S.gs(.65));g.addColorStop(1,S.gs(.32));c.fillStyle=g;c.fillRect(184,28,108,208);
 c.fillStyle=S.gs(.22);c.fillRect(194,43,88,103);plain(c,'TICKET',238,76,'700 28px "Oswald"','#eee');
 c.fillStyle=S.gs(.8);c.fillRect(207,100,60,24);c.fillStyle=S.gs(.13);c.fillRect(207,190,60,8);
 figure(c,113,148,.78);c.fillStyle=S.gs(.97);c.save();c.translate(175,174);c.rotate(-.2);c.fillRect(-9,-14,18,28);c.restore();
}
function receptionGray(c,w,h){
 room(c,w,h);c.fillStyle=S.gs(.42);c.fillRect(244,28,72,38);c.fillStyle=S.gs(.7);c.fillRect(251,34,58,25);
 figure(c,236,118,.64,true);
 c.fillStyle=S.gs(.18);c.fillRect(204,126,56,38);c.fillRect(228,160,8,15);c.fillRect(214,172,37,5);
 const g=c.createLinearGradient(0,172,0,250);g.addColorStop(0,S.gs(.79));g.addColorStop(1,S.gs(.35));c.fillStyle=g;c.fillRect(142,176,194,105);
 c.fillStyle=S.gs(.21);c.fillRect(132,171,209,12);figure(c,83,142,.8);
}
function build(){
 const kiosk=S.makePrint(S.treat(340,290,307,kioskGray,{cell:4.6,blur:1.1,con:1.3}),31,[0,1,1,0],13,7);
 const desk=S.makePrint(S.treat(340,250,308,receptionGray,{cell:4.6,blur:1.1,con:1.3}),33,[1,0,1,1],13,7);
 const ticket=S.sprite(260,270,34,c=>{
  const poly=S.edgePoly(260,270,[0,1,1,1],91,5);S.shadowFill(c,poly,S.NEWS);S.texture(c,poly,.8,80,60);
  plain(c,'Reception',0,-91,'700 28px "Libre Baskerville"');plain(c,'ticket',0,-51,'italic 400 28px "Libre Baskerville"');
  c.fillStyle=S.INK;c.fillRect(-105,-25,210,2);c.fillRect(-105,112,210,1);
  plain(c,'G-001',0,44,'400 80px "Anton"');
 });
 const called=S.sprite(262,140,32,c=>{
  const poly=S.edgePoly(262,140,[0,0,1,0],98,4);S.shadowFill(c,poly,S.CARD);S.texture(c,poly,.45,150,40);
  plain(c,'NOW CALLING',0,-43,'700 28px "Oswald"');plain(c,'G-001',0,23,'400 64px "Anton"');
 });
 const strip=(t,size,seed,o={})=>S.makeStrip(t,`400 ${size}px "Anton"`,{seed,...o});
 return {kiosk,desk,ticket,called,
  h1:strip('START AT THE KIOSK',54,43,{bg:S.INK,fg:S.CARD}),
  h2:strip('TAKE A RECEPTION TICKET',54,44,{bg:S.INK,fg:S.CARD}),
  h3:strip('THEN GO TO RECEPTION',54,45,{bg:S.INK,fg:S.CARD}),
  k:strip('KIOSK',32,46),r:strip('RECEPTION',32,47),
 };
}
function shot(c,s,x,y,rot=0){c.save();c.translate(x,y);c.rotate(rot);S.drawSpr(c,s);c.restore();}
window.film={
draw(c,t,p,m){
 if(S.setScale(c.canvas.width/1280))A=null;if(!A)A=build();
 const st=p.beats[0].start,ti=p.beats[1].events.ticket,call=p.beats[2].events.call,go=p.beats[2].events.reception;
 // Align stepped arrivals to event time while retaining the reference's 12 fps steps.
 const step=(a)=>a+S.q12(Math.max(0,t-a));
 const cam={x:0,y:0,z:1+.014*E(t,st,p.duration)};
 S.bgPaper(c,cam);
 S.block(c,cam,.35,485,70,420,770,-.035,S.RED,12,[0,0,0,1]);
 S.block(c,cam,.45,-485,45,350,660,.05,'#d7c6aa',17,[0,1,0,0]);
 // The first print moves aside to make room for the ticket clipping.
 const move=E(S.q12(t),ti,.65),kx=H.lerp(-160,-380,move),ky=62;
 S.putSpr(c,cam,.85,A.kiosk,kx,ky,-.045,1,step(st),st,'drop',cc=>{
  if(t>=st+.25){S.tape(cc,-130,-153,100,28,-.18,1);S.tape(cc,120,-149,96,28,.3,2);}
 });
 S.putSpr(c,cam,.95,A.k,kx,260,.015,1,step(st),st,'drop');
 if(t>=ti){
  S.putSpr(c,cam,1,A.ticket,0,78,.025,1,step(ti),ti,'slideU',cc=>{
   S.hilite(cc,[-102,5,204,77],E(t,ti+.25,.55),61);if(t>=ti+.25)S.tape(cc,13,-133,112,27,-.08,6);
  });
  S.place(c,cam,1,-640,-360,0,1,cc=>S.inkArrow(cc,S.quadPts(452,431,478,398,499,425),E(t,ti+.3,.35),2.6));
 }
 if(t>=call){
  S.putSpr(c,cam,.9,A.desk,390,92,.035,1,step(call),call,'slideR',cc=>{if(t>=call+.25)S.tape(cc,110,-133,106,28,.18,3);});
  S.putSpr(c,cam,1.05,A.called,387,-83,-.035,1,step(call),call,'drop',cc=>{
   S.marker(cc,S.loopPts(0,26,107,42,2.3),E(t,call+.25,.5),S.RED,5);
  });
  S.putSpr(c,cam,.95,A.r,390,260,-.02,1,step(call),call,'drop');
 }
 if(t>=go)S.place(c,cam,1,-640,-360,0,1,cc=>S.inkArrow(cc,S.quadPts(788,468,818,423,848,451),E(t,go,.45),3,S.RED));
 // Stable header and one live headline; old strips exit before replacements.
 plain(c,'SMART QUEUE',116,50,'700 28px "Oswald"',S.INK,'left');
 plain(c,'PATIENT ARRIVAL',1220,50,'700 28px "Oswald"',S.INK,'right');
 c.fillStyle=S.INK;c.fillRect(55,86,1170,1.3);
 shot(c,t<ti?A.h1:t<call?A.h2:A.h3,640,151,-.012);
 S.finish(c,t,.24);if(m.logo)c.drawImage(m.logo,55,24,46,52);
},
scoreSound(k,p){
 const st=p.beats[0].start,ti=p.beats[1].events.ticket,call=p.beats[2].events.call,go=p.beats[2].events.reception;
 const put=(t,pan)=>{k.noise(t,{dur:.07,color:'brown',filter:'lowpass',f:650,gain:.09,a:.002,pan,minor:true});k.tone(t,{f:[[0,150],[.07,70]],dur:.09,gain:.025,pan,minor:true});};
 for(const [a,pan] of [[st,-.5],[ti,0],[call,.5]]){put(a,pan);k.noise(a,{dur:.25,color:'pink',filter:'lowpass',f:[[0,420],[.25,1100]],gain:.025,a:.08,pan,minor:true});k.play('tape',a+.25,{dur:.18,gain:.08,pan,minor:true});}
 k.play('stroke',ti+.25,{material:'sharpie',dur:.55,gain:.09,minor:true});
 k.play('stroke',call+.25,{material:'marker',dur:.5,gain:.10,pan:.5,minor:true});
 k.play('ding',call,{f:'D5',gain:.16,pan:.5});
 k.play('stroke',go,{material:'pen',dur:.45,gain:.11,pan:.3,minor:true});
}
};
}
