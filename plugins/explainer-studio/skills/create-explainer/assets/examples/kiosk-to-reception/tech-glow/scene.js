{
const S=STYLE_PACKS['tech-glow'],{C}=S;
const ease=(t,a,d=.45)=>H.ease.out(H.clamp((t-a)/d));
S.ICONS.kiosk=(c,u)=>{c.roundRect(-u*.65,-u,u*1.3,u*1.6,u*.12);c.moveTo(-u*.5,-u*.55);c.lineTo(u*.5,-u*.55);c.moveTo(-u*.3,u*.6);c.lineTo(-u*.5,u);c.lineTo(u*.5,u);c.lineTo(u*.3,u*.6)};
S.ICONS.patient=(c,u)=>{c.moveTo(u*.3,-u*.58);c.arc(0,-u*.58,u*.3,0,Math.PI*2);c.moveTo(-u*.6,u*.8);c.lineTo(-u*.6,u*.2);c.quadraticCurveTo(0,-u*.3,u*.6,u*.2);c.lineTo(u*.6,u*.8)};
S.ICONS.reception=(c,u)=>{c.moveTo(-u,-u*.15);c.lineTo(u,-u*.15);c.lineTo(u,u*.75);c.lineTo(-u,u*.75);c.closePath();c.moveTo(-u*.25,-u*.7);c.arc(0,-u*.7,u*.25,Math.PI,Math.PI*3);c.moveTo(-u*.5,-u*.15);c.lineTo(-u*.5,-u*.3);c.quadraticCurveTo(0,-u*.65,u*.5,-u*.3);c.lineTo(u*.5,-u*.15)};
function line(c,text,x,y,size,color=C.white,align='center'){
 c.save();c.font=`600 ${size}px Inter`;c.fillStyle=color;c.textAlign=align;c.fillText(text,x,y);c.restore();
}
window.film={
draw(c,t,p,m){
 const ticket=p.beats[1].events.ticket,call=p.beats[2].events.call,go=p.beats[2].events.reception;
 S.background(c,1280,720,t,t*5,1);
 c.save();if(m.logo)c.drawImage(m.logo,46,28,58,58);line(c,'SMART QUEUE',120,68,28,C.cyan,'left');
 line(c,'PATIENT ARRIVAL',1230,68,28,C.muted,'right');c.restore();
 S.gtext(c,t<ticket?'Start at the kiosk.':t<call?'Take a reception ticket.':'When called, go to reception.',60,164,52);
 const entry=ease(t,0),shift=(1-entry)*32;
 c.save();c.translate(0,shift);c.globalAlpha=entry;
 S.card(c,65,230,240,350);S.tile(c,185,338,110,'kiosk',{glow:1.3});
 line(c,'Kiosk',185,456,32);line(c,'Take a ticket',185,510,28,C.muted);
 const a=ease(t,ticket);c.save();c.globalAlpha*=a;c.translate(0,(1-a)*35);
 S.card(c,415,284,310,244,{flash:Math.max(0,1-(t-ticket)*2)});
 line(c,'RECEPTION TICKET',570,335,28,C.cyan);S.gtext(c,'G-001',570,425,76,{align:'center'});
 line(c,'Keep your number',570,479,28,C.muted);c.restore();
 const b=ease(t,call);c.save();c.globalAlpha*=b;
 S.card(c,835,230,375,350,{acc:[C.cyan,C.blue]});
 line(c,'NOW CALLING',1022,286,28,C.cyan);S.gtext(c,'G-001',1022,376,76,{align:'center'});
 S.tile(c,939,465,78,'reception');line(c,'Reception',1080,479,30);c.restore();
 const connector=(x0,x1,at)=>{const v=ease(t,at,.5);if(v>0){c.save();c.strokeStyle=C.cyan;c.lineWidth=3;c.globalAlpha=v;c.beginPath();c.moveTo(x0,405);c.lineTo(x0+(x1-x0)*v,405);c.stroke();S.glowDot(c,x0+(x1-x0)*v,405,C.cyan,5);c.restore()}};
 connector(320,400,ticket);connector(740,820,call);
 c.restore();
 const travel=ease(t,go,1.3),px=H.lerp(185,1020,travel);
 if(t>=go){c.save();c.globalAlpha=ease(t,go);S.tile(c,px,618,58,'patient',{glow:1.3});c.restore()}
 if(t<go)S.pill(c,640,638,'Take a ticket → Wait for your call',{size:28});
 S.bloom(c,1);H.vignette(c,1280,720,.45,'2,3,16');
},
scoreSound(k,p){
 k.play('pop',p.beats[0].events.kiosk,{gain:.25,minor:true});
 k.play('click',p.beats[1].events.ticket,{gain:.35,minor:true});
 k.play('ding',p.beats[2].events.call,{gain:.32});
 k.play('whoosh',p.beats[2].events.reception,{gain:.15,minor:true,dur:1});
}
};
}
