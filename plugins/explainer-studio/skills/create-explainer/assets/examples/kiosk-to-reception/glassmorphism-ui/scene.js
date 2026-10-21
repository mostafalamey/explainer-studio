{
const S=STYLE_PACKS['glassmorphism-ui'],white='#fff',muted='#e1ddfa';
const prog=(t,a,d=.6)=>H.ease.out(H.clamp((t-a)/d));
function text(c,str,x,y,size=28,color=white,weight=600,align='left'){
 c.save();c.font=`${weight} ${size}px Inter`;c.fillStyle=color;c.textAlign=align;c.fillText(str,x,y);c.restore();
}
function person(c,x,y){
 c.save();c.translate(x,y);c.strokeStyle='#fff';c.lineWidth=4;c.lineCap='round';c.lineJoin='round';c.beginPath();c.arc(0,-24,12,0,7);c.stroke();c.beginPath();c.moveTo(-24,34);c.lineTo(-21,7);c.quadraticCurveTo(0,-10,21,7);c.lineTo(24,34);c.closePath();c.stroke();c.restore();
}
window.film={
draw(c,t,p,m){
 const ti=p.beats[1].events.ticket,call=p.beats[2].events.call,go=p.beats[2].events.reception,travel=H.ease.inOut(H.clamp((t-go)/1.3));
 const src=S.background(c,t),scale=c.canvas.width/1280;
 if(m.logo)c.drawImage(m.logo,48,27,54,54);
 text(c,'SMART QUEUE',119,65,28);text(c,'PATIENT ARRIVAL',1225,65,28,muted,600,'right');
 const headline=t<ti?'Start at the kiosk.':t<call?'Your reception ticket.':'Your number is called.';
 const grad=c.createLinearGradient(60,0,900,0);grad.addColorStop(0,'#fff');grad.addColorStop(1,'#ffc6f0');
 text(c,headline,64,171,52,grad,800);
 const e=prog(t,0,.6),dy=(1-e)*38;
 c.save();c.globalAlpha=e;
 S.glass(c,src,64,245+dy,694,362,30,{tint:.09});
 text(c,'Kiosk to reception',94,298+dy,30);
 // Rounded UI illustrations share the frosted dashboard.
 c.save();c.translate(0,dy);
 c.strokeStyle='rgba(255,255,255,.88)';c.lineWidth=4;c.lineJoin='round';
 S.rr(c,132,350,104,142,17);c.stroke();S.rr(c,150,369,68,70,7);c.stroke();
 c.beginPath();c.moveTo(161,463);c.lineTo(207,463);c.moveTo(184,493);c.lineTo(184,518);c.moveTo(150,519);c.lineTo(218,519);c.stroke();
 c.fillStyle='#7ad7ff';S.rr(c,165,400,38,17,5);c.fill();
 text(c,'Kiosk',184,563,28,white,600,'center');
 // Reception counter and staff.
 person(c,651,387);
 S.rr(c,574,427,145,86,12);c.stroke();
 c.beginPath();c.moveTo(566,426);c.lineTo(726,426);c.stroke();
 text(c,'Reception',646,563,28,white,600,'center');
 if(t>=go)S.glowLine(c,[289,493],[431,540],[552,493],prog(t,go,1.3),'#7ad7ff','#4dffa6',4,3,t-go);
 const px=H.lerp(315,527,travel);
 person(c,px,425);
 c.restore();c.restore();
 // Reblur the completed dashboard for floating glass-over-glass tickets.
 const layered=S.blurOf(c.canvas,c.canvas.width,c.canvas.height,20*scale);
 const te=t>=ti?prog(t,ti,.45):e,ty=235+(1-te)*32;
 c.save();c.globalAlpha=te;
 S.glass(c,layered,812,ty,402,382,32,{tint:.12,shadow:42});
 text(c,t<ti?'Reception':t<call?'Reception ticket':'Now calling',846,ty+60,30);
 if(t<ti){
  text(c,'Take a ticket',846,ty+156,37,white,800);
  text(c,'Keep your number',846,ty+218,28,muted,400);
 }else{
  text(c,'G-001',1013,ty+178,88,white,800,'center');
  S.chipPill(c,1013,ty+245,t<call?'Waiting for your call':'Go to reception',{font:'600 28px Inter',h:52,dot:t<call?'#7ad7ff':'#4dffa6',bg:'rgba(10,8,32,.25)'});
  if(t>=call){
   const ce=prog(t,call,.45);
   c.save();c.globalAlpha=ce;c.strokeStyle='#4dffa6';c.lineWidth=3;
   S.rr(c,832,ty+18,362,344,23);c.stroke();c.restore();
  }
 }
 c.restore();
 if(t>=ti){
  const chipSrc=S.blurOf(c.canvas,c.canvas.width,c.canvas.height,16*scale);
  const cy=617+Math.sin(t*.8)*3;
  S.glass(c,chipSrc,392,cy,472,64,25,{tint:.12,shadow:22});
  text(c,t<go?'Take a ticket. Wait for your call.':'When called, go to reception.',628,cy+42,28,white,600,'center');
 }
},
scoreSound(k,p){
 k.play('click',p.beats[0].events.kiosk,{gain:.24,f:1100,minor:true});
 k.noise(p.beats[1].events.ticket,{dur:.45,color:'pink',filter:'bandpass',f:1000,gain:.024,a:.1,minor:true});
 k.play('pop',p.beats[1].events.ticket,{gain:.2,f:880,minor:true});
 k.play('ding',p.beats[2].events.call,{gain:.24,f:'G5'});
 k.noise(p.beats[2].events.reception,{dur:1.3,color:'pink',filter:'bandpass',f:550,gain:.016,a:.2,minor:true});
}
};
}
