{
const S=STYLE_PACKS['neon-sign-at-night'];
const sans=n=>`400 ${n}px "Poiret One"`,script=n=>`400 ${n}px "Gloria Hallelujah"`;
function person(n,x,y,col,k,staff=false){
 n.tube(g=>{g.beginPath();g.arc(x,y,23,0,Math.PI*2);g.moveTo(x,y+26);g.lineTo(x,y+103);g.moveTo(x-36,y+50);g.lineTo(x,y+35);g.lineTo(x+39,y+62);if(!staff){g.moveTo(x,y+103);g.lineTo(x-29,y+159);g.moveTo(x,y+103);g.lineTo(x+26,y+159);}},col,k,7);
 n.clip(x,y-23);n.clip(x,y+84,Math.PI/2);if(!staff)n.elec(x-29,y+159,Math.PI/2);
}
window.film={draw(c,t,p,m){
 S.setScale(c.canvas.width/1280);
 const a=p.beats[0].events.kiosk,b=p.beats[1].events.ticket,d=p.beats[2].events.call,pan=p.beats[2].events.pan,go=p.beats[2].events.reception;
 const cam=880*H.ease.inOut(H.smooth(pan,pan+.88,t));
 S.render(c,1280,720,t,n=>{
  const C=n.NX;
  n.ntext('Smart Queue',cam+205,57,sans(32),C.cyan,1,'center',1.5);
  n.ntext('PATIENT ARRIVAL',cam+1055,57,sans(28),C.warm,1,'center',1.2);
  if(cam<820){
   n.wordByLetter(t<b?'Start at the kiosk':t<d?'Take a reception ticket':'When called',640,158,script(52),C.pink,t<b?0:t<d?b:d,.012);
   n.wordGap(t<b?'Start at the kiosk':t<d?'Take a reception ticket':'When called',640,158,script(52),t<b?5:t<d?4:4,22);
   person(n,121,335,C.warm,n.ign(0,.15));
   const kk=n.ign(a,.16);
   n.frame(246,264,137,216,C.cyan,kk);
   n.frame(263,287,103,94,C.warm,kk);
   n.tube(g=>{g.beginPath();g.moveTo(274,425);g.lineTo(354,425);g.moveTo(315,480);g.lineTo(315,516);g.moveTo(266,516);g.lineTo(364,516);},C.cyan,kk,6);
   n.ntext('TICKET',315,329,sans(28),C.warm,kk,'center',1);
   n.ntext('Kiosk',315,563,sans(32),C.cyan,kk,'center',1.6);
   n.clip(246,365,Math.PI/2);n.clip(383,365,Math.PI/2);n.elec(266,516,Math.PI);
   if(t>=b){
    n.tube(g=>{g.beginPath();g.moveTo(532,285);g.lineTo(764,285);g.lineTo(764,475);for(let i=0;i<=10;i++)g.lineTo(764-i*23.2,475+(i%2?10:0));g.closePath();},C.pink,n.ign(b,.16),7);
    n.ntext('Reception ticket',648,329,sans(28),C.cyan,n.ign(b,.16),'center',1.2);
    n.ntext('G-001',648,432,sans(64),C.warm,n.ign(b,.16),'center',3);
    n.arrow(408,378,460,357,510,378,C.warm,H.smooth(b,b+.4,t),7,5);
    n.clip(532,375,Math.PI/2);n.clip(764,375,Math.PI/2);n.elec(532,285,Math.PI);
   }
  }
  if(t>=d){
   n.frame(982,273,272,222,C.cyan,n.ign(d,.16));
   n.ntext('Now calling',1118,325,sans(34),C.cyan,n.ign(d,.16),'center',1.6);
   n.ntext('G-001',1118,429,sans(80),C.warm,n.ign(d,.16),'center',3);
   n.tube(g=>{g.beginPath();g.ellipse(1118,403,119,63,0,0,Math.PI*2);},C.pink,.82+.18*Math.sin(t*4),4);
   n.clip(982,375,Math.PI/2);n.clip(1254,375,Math.PI/2);n.elec(982,273,Math.PI);
  }
  if(cam>0){
   n.wordByLetter('Go to reception',1520,158,script(54),C.pink,pan,.012);
   const k=n.ign(go,.15);
   n.frame(1627,432,244,90,C.cyan,k);n.tube(g=>{g.beginPath();g.moveTo(1607,428);g.lineTo(1891,428);g.moveTo(1680,430);g.lineTo(1680,365);g.lineTo(1755,365);g.lineTo(1755,430);},C.cyan,k,6);
   person(n,1809,331,C.warm,k,true);n.ntext('Reception',1749,567,sans(40),C.cyan,k,'center',2);
   // A fixed tube silhouette shows the patient's destination; the route lights toward it.
   person(n,1501,352,C.pink,k);n.arrow(1286,410,1360,367,1434,410,C.warm,H.smooth(go,go+.4,t),9,6);
   n.clip(1627,480,Math.PI/2);n.clip(1871,480,Math.PI/2);n.elec(1607,428,Math.PI);
  }
 },cam);
 if(m.logo)c.drawImage(m.logo,48,19,43,49);
},scoreSound(k,p){
 const a=p.beats[0].events.kiosk,b=p.beats[1].events.ticket,d=p.beats[2].events.call,pan=p.beats[2].events.pan,go=p.beats[2].events.reception;
 const s=S.soundKit(k);
 k.withMinor(()=>{for(const [t,pa] of [[0,-.6],[a,-.4],[b,0],[d,.65],[go,.4]])s.ignite(t,{len:.16,gain:.25,pan:pa,tail:.18});s.chase(b,b+.4,7,0,.1);s.chase(go,go+.4,9,.3,.1);});
 k.play('ding',d,{f:'D5',gain:.14,pan:.5});
 k.noise(pan,{dur:.88,color:'pink',filter:'bandpass',f:[[0,260],[.44,1300],[.88,320]],gain:.04,a:.35,minor:true});
}};
}
