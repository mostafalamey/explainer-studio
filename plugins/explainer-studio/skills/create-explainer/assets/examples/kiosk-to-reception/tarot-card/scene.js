{
const S=STYLE_PACKS['tarot-card'],ink='#2a1c15',cream='#eadcbc',teal='#7f9a8f';
const progress=(t,a,d=.5)=>H.clamp((t-a)/d);
function type(c,str,x,y,size=28,col=cream,align='center'){
 c.save();c.font=`600 ${size}px "Cormorant Garamond"`;c.textAlign=align;c.textBaseline='middle';c.fillStyle=col;c.fillText(str,x,y);c.restore();
}
function box(c,x,y,w,h,fill,r=6){S.rr(c,x,y,w,h,r);c.fillStyle=fill;c.fill();c.strokeStyle=ink;c.lineWidth=3;c.stroke();}
function human(c,x,y,scale,col=teal){
 c.save();c.translate(x,y);c.scale(scale,scale);c.lineWidth=3;c.strokeStyle=ink;
 c.beginPath();c.arc(0,-32,17,0,7);c.fillStyle='#d2ad83';c.fill();c.stroke();
 c.beginPath();c.moveTo(-16,-12);c.quadraticCurveTo(0,-23,16,-12);c.lineTo(28,49);c.lineTo(-28,49);c.closePath();c.fillStyle=col;c.fill();c.stroke();
 c.beginPath();c.moveTo(-12,49);c.lineTo(-15,80);c.moveTo(12,49);c.lineTo(15,80);c.lineWidth=8;c.stroke();c.restore();
}
window.film={
draw(c,t,p,m){
 window.TAROT_SCALE=c.canvas.width/1280;
 c.drawImage(S.velvet(c.canvas.width,c.canvas.height),0,0,1280,720);
 const ti=p.beats[1].events.ticket,call=p.beats[2].events.call,go=p.beats[2].events.reception;
 const sheen=.4+.6*Math.sin(t*.9);
 if(m.logo)c.drawImage(m.logo,48,24,52,52);
 type(c,'SMART QUEUE',120,51,28,'#ead8a3','left');type(c,'PATIENT ARRIVAL',1228,51,28,'#ead8a3','right');
 const head=t<ti?'Start at the kiosk':t<call?'Take a reception ticket':'When called, go to reception';
 type(c,head,640,124,52,'#f1e4c2');
 const cw=300,ch=440,cy=401;
 const art=[
  (a,aw,ah,s,G)=>{
   a.save();a.strokeStyle=G(-90,-100,90,100);a.lineWidth=5;a.beginPath();a.arc(0,-14,96,0,7);a.stroke();a.restore();
   box(a,-57,-106,114,158,teal,12);box(a,-42,-87,84,91,'#303951',5);
   box(a,-25,-68,50,12,G(-25,-68,25,-56),2);
   box(a,-23,-38,46,24,'#b58d54',2);
   a.strokeStyle=ink;a.lineWidth=6;a.beginPath();a.moveTo(-27,26);a.lineTo(27,26);a.stroke();
   box(a,-14,52,28,33,'#ac8e5b',3);box(a,-48,86,96,13,G(-48,86,48,99),3);
  },
  (a,aw,ah,s,G)=>{
   a.save();a.translate(0,-9);a.rotate(-.035);
   box(a,-102,-78,204,163,cream,9);
   a.strokeStyle=G(-90,-60,90,60);a.lineWidth=2;S.rr(a,-93,-69,186,145,5);a.stroke();
   type(a,'RECEPTION',0,-43,28,ink);type(a,'G-001',0,14,76,ink);
   a.strokeStyle='#937446';a.setLineDash([4,5]);a.beginPath();a.moveTo(-76,57);a.lineTo(76,57);a.stroke();a.restore();
   S.star(a,0,112,15,5,8,t*.08);a.fillStyle=G(-15,96,15,127);a.fill();a.strokeStyle=ink;a.lineWidth=2;a.stroke();
  },
  (a,aw,ah,s,G)=>{
   type(a,'NOW CALLING',0,-112,28,'#f0d68f');type(a,'G-001',0,-62,64,'#f0d68f');
   human(a,40,33,.7,teal);
   box(a,-9,51,116,66,'#b18a52',5);box(a,-17,46,130,12,G(-17,46,113,58),3);
   const travel=H.ease.inOut(progress(t,go,1.3));
   human(a,-83+travel*32,44,.65,'#a2615b');
   a.strokeStyle=G(-90,125,90,125);a.lineWidth=2;a.beginPath();a.moveTo(-95,125);a.lineTo(104,125);a.stroke();
  }
 ];
 const titles=['KIOSK','TICKET','RECEPTION'],nums=['I','II','III'],xs=[240,640,1040];
 for(let i=0;i<3;i++){
  const reveal=[0,ti-.23,call-.23][i],f=i===0?progress(t,0,.5):progress(t,reveal,.46);
  const e=H.ease.out(progress(t,0,.55)),y=cy+(1-e)*(190+i*30),rot=[-.035,.014,.035][i]*(1-.25*e);
  const face=cc=>S.tFace(cc,cw,ch,nums[i],titles[i],art[i],sheen);
  S.tCard(c,xs[i],y,cw,ch,rot,f,face,0,31+i);
 }
 if(t>=ti)S.gArrow(c,[399,394],[440,355],[481,394],progress(t,ti,.55));
 if(t>=go)S.gArrow(c,[799,394],[840,355],[881,394],progress(t,go,.75));
 S.plaque(c,640,673,810,60,[t<go?'Kiosk  →  Ticket  →  Reception':'Your number connects the journey'],[32],sheen);
},
scoreSound(k,p){
 for(const tm of [p.beats[0].start,p.beats[1].events.ticket,p.beats[2].events.call]){
  k.noise(tm,{dur:.23,color:'pink',filter:'bandpass',f:900,gain:.035,a:.02,minor:true});
  k.play('tock',tm,{gain:.15,f:310,minor:true});
 }
 k.play('ding',p.beats[2].events.call,{gain:.24,f:'G5'});
 k.noise(p.beats[2].events.reception,{dur:.8,color:'pink',filter:'bandpass',f:1300,gain:.014,a:.15,minor:true});
}
};
}
