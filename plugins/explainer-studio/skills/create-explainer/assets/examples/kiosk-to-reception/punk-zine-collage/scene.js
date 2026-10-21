{
const S=STYLE_PACKS['punk-zine-collage'];
const q=s=>Math.ceil((s-1e-6)*8)/8;
function person(c,x,y,scale=1){
 c.save();c.translate(x,y);c.scale(scale,scale);c.fillStyle='#161616';
 c.beginPath();c.arc(0,-70,24,0,Math.PI*2);c.fill();
 c.beginPath();c.moveTo(-25,-38);c.lineTo(25,-38);c.lineTo(43,50);c.lineTo(-42,50);c.closePath();c.fill();
 c.lineWidth=18;c.lineCap='square';c.beginPath();c.moveTo(-17,42);c.lineTo(-25,112);c.moveTo(17,42);c.lineTo(26,112);c.moveTo(-28,-25);c.lineTo(-53,37);c.moveTo(29,-25);c.lineTo(52,36);c.strokeStyle='#161616';c.stroke();c.restore();
}
window.film={
draw(c,t,p,m){
 const ti=q(p.beats[1].events.ticket),call=q(p.beats[2].events.call),go=q(p.beats[2].events.reception);
 S.render(c,1280,720,t,d=>{
 const {b,sp,ts,fr,scrap,typed,ransom,marker,curve,scrawl,tape,barScreen,slap,unslap}=d;
 const phase=ts<ti?0:ts<call?1:2,st=phase===0?0:phase===1?ti:call;
 b.fillStyle='#d4d2cb';b.fillRect(0,0,1280,720);
 // Three successive pasted spreads; each lands on the corresponding spoken event.
 scrap(9,640,365,1226,650,-.008,[1,1,1,1],'#f4f2ec');
 if(m.logo)b.drawImage(m.logo,48,24,52,52);
 typed('SMART QUEUE',118,62,28,0,1);typed('PATIENT ARRIVAL',882,62,28,.01,2);
 slap(st,640,370);
 scrap(71+phase,640,389,1150,468,phase===1?.018:-.014,[1,1,1,1],'#e8e6df');
 // Fluorescent overprint reads as ink, with actual registration drift in the renderer.
 sp.fillStyle=d.spotCol;sp.save();sp.translate(655,194);sp.rotate(-.025);sp.fillRect(-552,-27,1104,54);sp.restore();
 const title=phase===0?'START AT THE KIOSK':phase===1?'TAKE A TICKET':'GO TO RECEPTION';
 ransom(title,phase===0?110:phase===1?217:140,139,58,phase+90);
 if(phase<2){
  const poly=scrap(22,283,407,350,350,-.035,[1,0,1,0],'#f4f2ec');
  b.save();S.pathPoly(b,poly);b.clip();
  b.fillStyle='#151515';b.fillRect(194,286,163,207);b.fillRect(247,488,51,72);b.fillRect(210,554,132,17);
  b.fillStyle='#ddd';b.fillRect(215,308,123,116);b.fillStyle=barScreen(b);b.fillRect(215,308,123,116);
  b.fillStyle='#111';b.fillRect(230,324,91,14);b.fillRect(230,353,91,40);b.fillRect(230,449,94,12);b.restore();
  sp.fillStyle=d.spotCol;sp.fillRect(230,353,91,40);
  tape(265,239,128,-.1,12);
  typed('KIOSK',205,610,32,-.035,23);
  person(b,534,430,.8);
  typed('PATIENT',465,574,28,.025,24);
  if(phase===1){
   scrap(31,778,409,330,244,.04,[1,1,1,1],'#f5f3ed');
   typed('RECEPTION TICKET',628,346,28,.03,32);
   ransom('G-001',639,429,78,33,null,true);
   tape(792,283,112,.08,14);
   marker(sp,curve(354,465,480,645,632,474,47),d.prog(ti,.5),d.spotCol,8);
  }else{
   scrawl('ARRIVE.',699,369,58,-.045);
   typed('Take a reception ticket',643,451,28,.02,41);
   marker(sp,curve(718,496,595,628,377,503,45),d.prog(p.beats[0].events.kiosk,.5),d.spotCol,8);
  }
 }else{
  scrap(51,280,432,364,315,-.045,[1,0,1,1],'#f5f3ed');
  typed('YOUR TICKET',139,325,30,-.035,52);
  ransom('G-001',123,419,83,53,null,true);
  typed('KEEP YOUR NUMBER',119,526,28,-.02,54);
  tape(287,273,118,.04,15);
  // Reception uses a pasted black-and-white illustration with halftone surfaces.
  const panel=scrap(61,965,447,388,335,.025,[0,1,0,1],'#f4f2ec');
  b.save();S.pathPoly(b,panel);b.clip();person(b,1012,430,.7);
  b.fillStyle='#111';b.fillRect(807,449,324,110);b.fillStyle='#666';b.fillRect(821,464,296,80);
  b.fillStyle=barScreen(b);b.fillRect(821,464,296,80);
  b.fillStyle='#111';b.fillRect(914,398,71,48);b.fillRect(945,441,8,13);b.restore();
  typed('RECEPTION',843,590,32,.025,62);
  typed('NOW CALLING',831,279,30,-.03,63);
  ransom('G-001',841,328,64,64,null,true);
  const travel=H.ease.inOut(d.prog(go,1.25));
  person(b,560+travel*142,457,.7);
  marker(sp,curve(468,565,614,626,800,567,65),d.prog(go,1),d.spotCol,10);
  tape(1106,429,88,.18,16);
 }
 unslap();
 typed(phase<2?'01 / ARRIVAL   02 / TICKET':'03 / CALLED   04 / RECEPTION',332,680,28,-.008,8);
 return ts-st<.125;
 });
},
scoreSound(k,p){
 for(const st of [p.beats[0].start,p.beats[1].events.ticket,p.beats[2].events.call]){
  k.noise(q(st),{dur:.14,color:'pink',filter:'bandpass',f:1200,gain:.07,a:.005,minor:true});
  k.play('tock',q(st),{gain:.25,f:260,minor:true});
 }
 k.play('ding',q(p.beats[2].events.call),{gain:.24,f:'G5'});
 k.noise(q(p.beats[2].events.reception),{dur:1,color:'pink',filter:'bandpass',f:1800,gain:.016,a:.1,minor:true});
}
};
}
