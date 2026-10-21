{
const S=STYLE_PACKS['isometric-pastel'];
const INK='#32334f',CORAL='#ef786b',MINT='#86d6c4',LAV='#c7c0ef';
const smooth=(t,a,d=.5)=>H.ease.inOut(H.clamp((t-a)/d));
function text(c,s,x,y,size=28,color=INK,align='center'){
 c.save();c.fillStyle=color;c.font=`600 ${size}px Inter`;c.textAlign=align;c.fillText(s,x,y);c.restore();
}
function person(c,P,x,y,col,t,walk=false){
 const [px,py]=P(x,y,0),s=33,step=walk?Math.sin(t*13)*4:0;
 c.save();c.translate(px,py);
 c.fillStyle='rgba(81,70,122,.14)';c.beginPath();c.ellipse(7,3,21,7,-.2,0,7);c.fill();
 c.strokeStyle='#514a6c';c.lineWidth=8;c.lineCap='round';c.beginPath();c.moveTo(-6,-24);c.lineTo(-7+step,0);c.moveTo(7,-24);c.lineTo(8-step,0);c.stroke();
 c.fillStyle=col;c.beginPath();c.roundRect(-15,-61,30,40,11);c.fill();
 c.strokeStyle=col;c.lineWidth=8;c.beginPath();c.moveTo(-13,-53);c.lineTo(-21-step,-30);c.moveTo(13,-53);c.lineTo(20+step,-32);c.stroke();
 c.fillStyle='#f3cab1';c.beginPath();c.arc(0,-76,12,0,7);c.fill();
 c.fillStyle='#4b4055';c.beginPath();c.arc(0,-80,11,Math.PI,Math.PI*2);c.fill();c.restore();
}
window.film={
draw(c,t,p,m){
 const ticket=p.beats[1].events.ticket,call=p.beats[2].events.call,go=p.beats[2].events.reception;
 const travel=smooth(t,go,1.3),rise=H.ease.out(H.clamp(t/.7));
 const bg=c.createLinearGradient(0,0,1280,720);bg.addColorStop(0,'#faf5f2');bg.addColorStop(1,'#ebe8fa');c.fillStyle=bg;c.fillRect(0,0,1280,720);
 if(m.logo)c.drawImage(m.logo,48,25,58,58);text(c,'SMART QUEUE',123,66,28,INK,'left');text(c,'PATIENT ARRIVAL',1225,66,28,'#77748d','right');
 text(c,t<ticket?'Start at the kiosk.':t<call?'Take a reception ticket.':'When called, go to reception.',64,153,48,INK,'left');
 // One shared world; focal position moves gently toward reception.
 const scale=30+travel*1.5,P=S.makeIso(485-travel*23,255+(1-rise)*90,scale);
 c.save();c.globalAlpha=rise;
 const shadow=[P(0,0),P(18,0),P(18,8),P(0,8)].map(([x,y])=>[x+35,y+20]);
 c.save();c.filter='blur(18px)';S.poly(c,shadow,'rgba(78,59,116,.14)');c.restore();
 S.box(c,P,0,0,-.55,18,8,.55,S.shade('#d8d3ee'));
 // Rear low wall, mint reception counter, screen and attendant.
 S.box(c,P,9,0,0,9,.35,3.7,S.shade('#dfd6ef'));
 for(let i=0;i<3;i++){S.box(c,P,6+i*1.4,.8,0,1,.9,.8,S.shade('#e6c8b4'));S.box(c,P,6+i*1.4,.8,.8,1,.18,.9,S.shade('#eddbc8'))}
 person(c,P,13.5,1.8,'#ae9bd4',t);
 S.box(c,P,11,2.8,0,5.3,2,2.25,S.shade(MINT));
 S.box(c,P,10.8,2.6,2.25,5.7,2.4,.22,S.shade('#f8eee5'));
 S.box(c,P,13.4,3.25,2.47,1.35,.25,1.15,S.shade('#555675'));
 S.tag(c,1000,510,'Reception',{font:'600 28px "Inter"',col:INK});
 // Kiosk uses the reference's three-face boxes and contact occlusion.
 S.box(c,P,2,4.5,0,1.9,1.3,.28,S.shade('#a6a1bc'));
 S.box(c,P,2.35,4.7,.28,1.15,.8,1.65,S.shade('#c1b7dc'));
 S.box(c,P,1.9,4.45,1.93,2.05,1.35,3.15,S.shade(LAV));
 const screen=P(1.9,5.8,4.75);
 c.save();S.wallX(c,screen);c.fillStyle='#faf7ff';c.beginPath();c.roundRect(7,0,50,56,4);c.fill();c.fillStyle=CORAL;c.fillRect(17,12,30,5);c.fillStyle='#aaa0c3';c.fillRect(17,25,30,3);c.fillRect(17,34,22,3);c.restore();
 const kp=P(2.4,5,5.5);S.tag(c,kp[0]-110,kp[1]+25,'Kiosk',{font:'600 28px "Inter"'});
 // A coral path highlights the patient's route only when their number is called.
 const a=P(4.6,6.5,.03),b=P(11.7,5.8,.03),ctrl=[(a[0]+b[0])/2,(a[1]+b[1])/2+20];
 if(t>=go)S.arrow(c,[a,ctrl,b],smooth(t,go,1.3),CORAL,[7,9],3);
 person(c,P,H.lerp(4.6,11.7,travel),H.lerp(6.5,5.8,travel),CORAL,t,travel>0&&travel<1);
 c.restore();
 if(t>=ticket){
  const pop=H.ease.back(H.clamp((t-ticket)/.45));c.save();c.globalAlpha=H.clamp(pop);c.translate(252,498);c.scale(Math.max(.01,pop),Math.max(.01,pop));
  c.shadowColor='rgba(80,70,130,.15)';c.shadowBlur=24;c.shadowOffsetY=10;c.fillStyle='white';c.beginPath();c.roundRect(-146,-73,292,146,16);c.fill();c.shadowColor='transparent';
  text(c,'RECEPTION TICKET',0,-29,28,'#77718e');text(c,'G-001',0,42,64,INK);c.restore();
 }
 if(t>=call){
  const pop=H.ease.back(H.clamp((t-call)/.4));c.save();c.globalAlpha=H.clamp(pop);c.translate(1012,308);c.scale(Math.max(.01,pop),Math.max(.01,pop));
  c.fillStyle=CORAL;c.beginPath();c.roundRect(-146,-82,292,164,18);c.fill();text(c,'NOW CALLING',0,-36,28,'#fffaf6');text(c,'G-001',0,40,70,'#fffaf6');c.restore();
 }
 S.tag(c,640,669,t<go?'Take a ticket → Wait for your call':'Your number is called → Reception',{font:'600 28px "Inter"',col:INK});
 H.vignette(c,1280,720,.035,'90,65,120');
},
scoreSound(k,p){
 k.play('pop',p.beats[0].events.kiosk,{gain:.3,f:460,minor:true});
 k.play('tock',p.beats[1].events.ticket,{gain:.35,f:430,minor:true});
 k.play('ding',p.beats[2].events.call,{gain:.28,f:'G5'});
 k.noise(p.beats[2].events.reception,{dur:1.3,color:'pink',filter:'lowpass',f:400,gain:.018,a:.3,minor:true});
}
};
}
