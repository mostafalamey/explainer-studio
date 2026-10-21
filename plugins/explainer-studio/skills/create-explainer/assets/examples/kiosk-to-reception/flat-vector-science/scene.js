{
const S=STYLE_PACKS['flat-vector-science'],C=S.C;
const ease=(t,a,d)=>H.ease.inOut(H.clamp((t-a)/d));
const pop=(t,a,d=.45)=>S.back(H.clamp((t-a)/d),1.25);
function shape(c,x,y,w,h,pal,r=24){
 c.save();S.rr(c,x-w/2,y-h/2,w,h,r);c.clip();
 const g=c.createLinearGradient(x-w/2,y-h/2,x+w/2,y+h/2);g.addColorStop(0,pal[0]);g.addColorStop(.45,pal[1]);g.addColorStop(1,pal[2]);c.fillStyle=g;c.fillRect(x-w/2,y-h/2,w,h);
 c.fillStyle=H.rgba(pal[2],.45);c.beginPath();c.moveTo(x+w/2,y-h/2);c.lineTo(x+w/2,y+h/2);c.lineTo(x-w/2,y+h/2);c.quadraticCurveTo(x+w*.42,y+h*.43,x+w/2,y-h/2);c.fill();
 const rim=new Path2D();rim.rect(x-w/2-2,y-h/2-2,w+4,h+4);rim.roundRect(x-w/2+5,y-h/2+5,w,h,r);c.fillStyle='rgba(255,255,255,.35)';c.fill(rim,'evenodd');c.restore();
}
function person(c,x,y,t,scale=1,staff=false){
 c.save();c.translate(x,y);c.scale(scale,scale);
 const pal=staff?['#d6beff','#9f7bff','#4d3c9e']:C.teal;
 shape(c,-19,65,28,70,['#7474c7','#454d9f','#242654'],14);
 shape(c,19,65,28,70,['#7474c7','#454d9f','#242654'],14);
 shape(c,-44,15,25,69,pal,13);shape(c,44,15,25,69,pal,13);
 S.ball(c,0,15,49,pal,{sh:.26});
 S.ball(c,0,-58,38,C.tan,{sh:.23});
 const o={look:[.65,0],blink:S.blinkAt(t,staff?1.6:.1)};
 S.eye(c,-12,-61,11,o);S.eye(c,13,-61,11,o);
 c.strokeStyle=C.ink;c.lineWidth=3;c.lineCap='round';c.beginPath();c.arc(2,-43,9,.1,Math.PI-.1);c.stroke();
 if(staff){shape(c,24,7,23,29,['#fff','#e4ebff','#b3b9dc'],5);}
 c.restore();
}
function appear(c,x,y,k,draw,rot=0){if(k<=0)return;c.save();c.translate(x,y);c.rotate(rot);c.scale(k,k);draw(c);c.restore();}
function camera(t,p){
 const ti=p.beats[1].events.ticket,call=p.beats[2].events.call;
 const a=ease(t,ti,.9),b=ease(t,call,.4);
 return {x:H.lerp(H.lerp(300,525,a),640,b),y:430,z:H.lerp(H.lerp(1.18,1.06,a),1,b)};
}
window.film={
draw(c,t,p,m){
 const st=p.beats[0].start,ki=p.beats[0].events.kiosk,ti=p.beats[1].events.ticket,call=p.beats[2].events.call,go=p.beats[2].events.reception;
 const cam=camera(t,p);S.sky(c,1280,720,t,{x:cam.x-300+t*5,z:cam.z});
 // Camera pullbacks reveal one connected journey; the star field moves at depth.
 c.save();c.translate(640,430);c.scale(cam.z,cam.z);c.translate(-cam.x,-cam.y);
 const k=pop(t,st,.7),ticket=pop(t,ti,.5),called=pop(t,call,.5),travel=ease(t,go,1.2),px=130+735*travel;
 S.glow(c,300,420,270,C.cyan,.18);S.glow(c,1040,450,270,C.violet,.16*called);
 for(const [x,w,a] of [[300,115,k],[px,55,k],[1040,145,called]]){c.fillStyle=H.rgba('#080823',.5*Math.min(1,a));c.beginPath();c.ellipse(x,590,w,12,0,0,Math.PI*2);c.fill();}
 appear(c,300,400,k,a=>{
  shape(a,0,130,142,27,C.teal,14);shape(a,0,93,43,70,C.teal,20);
  shape(a,0,-8,190,240,C.teal,42);
  shape(a,0,-32,144,132,['#34366f','#202653','#101638'],26);
  S.text(a,'Ticket',0,-48,30,'#fff');
  S.pill(a,0,3,'START',28,{bg:C.yellow});
  shape(a,0,83,96,13,['#1b245d','#0f143e','#090b2c'],7);
 });
 S.pill(c,300,626,'Kiosk',30,{bg:C.cyan,s:k});
 if(ticket>0){
  S.arrow(c,[[414,401],[432,356],[451,356],[470,382]],ease(t,ti,.6),C.cyan,10,{dots:true});
  const ex=H.lerp(336,640,ease(t,ti,.55)),ey=H.lerp(475,390,ease(t,ti,.55));
  appear(c,ex,ey,ticket,a=>{
   shape(a,0,0,270,205,['#fff5ca','#ffdb6b','#e89935'],28);
   S.text(a,'RECEPTION',0,-60,29,C.ink,{shadow:'rgba(0,0,0,0)'});
   S.text(a,'G-001',0,6,76,C.ink,{shadow:'rgba(130,61,20,.15)'});
   a.strokeStyle='rgba(114,62,28,.3)';a.lineWidth=3;a.setLineDash([5,9]);a.beginPath();a.moveTo(-106,67);a.lineTo(106,67);a.stroke();
  },-.04);
  S.pill(c,640,558,'Reception ticket',28,{s:ticket,bg:'#fff4cb'});
 }
 if(called>0){
  appear(c,1040,452,called,a=>{
   person(a,35,-14,t,.76,true);
   shape(a,0,69,270,123,['#c8a3ff','#8b5cff','#44318f'],30);
   shape(a,0,5,292,26,['#ede1ff','#c29dff','#7d53c0'],13);
   S.text(a,'Reception',0,67,34,'#fff');
  });
  appear(c,1040,273,called,a=>{
   S.glow(a,0,0,160,C.yellow,.12+.04*Math.sin(t*3));
   shape(a,0,0,265,144,['#fff0a3','#ffd23f','#dc8a24'],32);
   S.text(a,'Now calling',0,-38,28,C.ink,{shadow:'rgba(0,0,0,0)'});
   S.text(a,'G-001',0,27,64,C.ink,{shadow:'rgba(0,0,0,.1)'});
  });
 }
 if(t>=go)S.arrow(c,[[790,386],[820,335],[865,335],[899,373]],ease(t,go,.55),C.yellow,11,{dots:true});
 person(c,px,483-Math.sin(travel*Math.PI)*13+Math.sin(t*2)*2,t,k);
 c.restore();
 const head=t<ti?'Start at the kiosk':t<call?'Take a reception ticket':'When called, go to reception';
 S.text(c,head,640,140,54,t>=call?C.yellow:'#fff');
 S.text(c,'SMART QUEUE',118,53,28,'#fff',{align:'left'});
 S.text(c,'PATIENT ARRIVAL',1218,53,28,'#bfccff',{align:'right',w:700});
 // Preserve both source finishing layers at their original strength on every frame.
 S.finish(c,1280,720,t);if(m.logo)c.drawImage(m.logo,53,27,52,52);
},
scoreSound(k,p){
 const st=p.beats[0].start,ti=p.beats[1].events.ticket,call=p.beats[2].events.call,go=p.beats[2].events.reception;
 function pluck(t,n,g,pan){const f=k.hz(n);k.tone(t,{f,dur:.65,gain:.2*g,a:.003,pan,minor:true});k.tone(t,{f:f*4,dur:.09,gain:.04*g,a:.001,pan,minor:true});}
 pluck(st,'C4',.6,-.4);pluck(ti,'E4',.7,0);pluck(call,'G4',.8,.5);
 k.tone(ti,{f:[[0,330],[.07,478],[.16,429]],dur:.2,gain:.07,a:.008,minor:true});
 k.play('ding',call,{gain:.17,f:'G5',pan:.6});
 for(const at of [ti,call,go])k.noise(at,{dur:.7,color:'pink',filter:'bandpass',f:[[0,260],[.4,1100],[.7,340]],gain:.035,a:.3,minor:true});
}
};
}
