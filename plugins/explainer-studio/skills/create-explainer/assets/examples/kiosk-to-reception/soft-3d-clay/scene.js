{
const S=STYLE_PACKS['soft-3d-clay'],P=S.PAL,ink='#4a3a8a',sprites={};
const T=(c,str,x,y,size=28,col=ink,weight=600)=>{c.font=`${weight} ${size}px "Fredoka"`;c.textAlign='center';c.textBaseline='middle';c.fillStyle=col;c.fillText(str,x,y);};
const E=(t,a,d=.5)=>H.ease.inOut(H.clamp((t-a)/d));
const spring=(t,a,d=.6)=>{const u=H.clamp((t-a)/d);return u<=0?0:u>=1?1:1-Math.exp(-6.5*u)*Math.cos(10*u);};
function box(c,x,y,w,h,pal,r=25,ext=[6,11],spec){S.clay(c,S.rrect(w,h,r),[-w/2,-h/2,w/2,h/2],x,y,pal,{ext,spec});}
function sprite(key,w,h,scale,draw){
 const k=key+':'+scale;if(sprites[k])return sprites[k];
 const l=H.layer(Math.ceil(w*scale),Math.ceil(h*scale)),c=l.getContext('2d');c.scale(scale,scale);c.translate(w/2,h/2);draw(c);return sprites[k]={l,w,h};
}
function show(c,sp,x,y,k=1,rot=0,squash=0){if(k<=.01)return;c.save();c.translate(x,y);c.rotate(rot);c.scale(k*(1+squash),k*(1-squash));c.drawImage(sp.l,-sp.w/2,-sp.h/2,sp.w,sp.h);c.restore();}
window.film={
draw(c,t,p,m){
 const scale=c.canvas.width/1280,st=p.beats[0].start,ki=p.beats[0].events.kiosk,ti=p.beats[1].events.ticket,call=p.beats[2].events.call,go=p.beats[2].events.reception;
 const bg=c.createLinearGradient(0,0,0,720);[[0,'#f3ecff'],[.5,'#e8dffb'],[.62,'#dccff5'],[.78,'#e6dcf9'],[1,'#efe7fe']].forEach(([a,col])=>bg.addColorStop(a,col));c.fillStyle=bg;c.fillRect(0,0,1280,720);
 const glow=c.createRadialGradient(640,252,40,640,252,700);glow.addColorStop(0,'rgba(255,250,255,.8)');glow.addColorStop(1,'rgba(255,250,255,0)');c.fillStyle=glow;c.fillRect(0,0,1280,720);
 // Native-resolution cached clay props retain all source extrusion and lighting passes.
 const kiosk=sprite('kiosk',250,360,scale,a=>{
  box(a,0,129,146,30,P.lav,15);box(a,0,91,50,71,P.lav,18);
  box(a,0,-23,166,224,P.mint,36,[9,14],[-45,-65,57,29]);
  box(a,0,-51,125,110,P.white,24,[3,5]);box(a,0,-73,80,15,P.lav,7,[2,3]);
  S.clayLabel(a,0,-32,'Ticket',P.butter,{font:'600 28px "Fredoka"',h:42,padX:28});
  box(a,0,47,86,14,P.lav,7,[2,3]);
 });
 const ticket=sprite('ticket',330,270,scale,a=>{
  box(a,0,0,266,190,P.white,32,[8,14],[-82,-58,77,25]);
  T(a,'RECEPTION',0,-56,28);
  box(a,0,17,222,89,P.butter,32,[4,8],[-65,-21,55,17]);T(a,'G-001',0,18,76,ink,700);
  a.fillStyle='#b8a5dd';for(let i=0;i<12;i++){a.beginPath();a.arc(-99+i*18,78,2,0,7);a.fill();}
 });
 const person=sprite('patient',130,200,scale,a=>{
  box(a,-19,64,24,58,P.lav,12,[3,5]);box(a,19,64,24,58,P.lav,12,[3,5]);
  box(a,-39,4,21,68,P.mint,11,[3,5]);box(a,39,4,21,68,P.mint,11,[3,5]);
  box(a,0,9,68,86,P.mint,26,[5,7],[-15,-24,24,15]);S.sphere(a,0,-62,27,...P.peach.face);
  box(a,-26,33,29,33,P.butter,10,[3,5]);
 });
 const desk=sprite('desk',340,290,scale,a=>{
  box(a,16,-20,65,77,P.blue,25,[5,8]);S.sphere(a,16,-84,25,...P.peach.face);
  box(a,0,57,260,105,P.lav,32,[10,15],[-80,-23,78,28]);
  box(a,0,-1,282,25,P.white,12,[6,9]);T(a,'Reception',0,61,34);
 });
 const callBadge=sprite('call',290,180,scale,a=>{box(a,0,0,244,131,P.butter,40,[7,12],[-65,-35,60,25]);T(a,'Now calling',0,-33,28);T(a,'G-001',0,25,64,ink,700);});
 const orb=sprite('orb',120,120,scale,a=>S.sphere(a,0,0,32,...P.pink.face));
 c.save();c.filter='blur(5px)';show(c,orb,70+Math.sin(t*.4)*12,262,1);show(c,orb,1198-Math.sin(t*.4)*8,413,.7);c.restore();
 const open=spring(t,st,.65),kk=spring(t,ki-.5,.5),tk=spring(t,ti-.18,.55),ck=spring(t,call-.18,.55),travel=E(t,go,1.2);
 const bob=Math.sin(t*1.6)*3,px=126+travel*714,py=479-Math.sin(travel*Math.PI)*11;
 S.contactShadow(c,290,554,100*Math.min(1,kk),16,.28,18);
 S.contactShadow(c,625,554,112*Math.min(1,tk),15,.22,18);
 S.contactShadow(c,1040,554,147*Math.min(1,open),18,.29,18);
 S.contactShadow(c,px,567,46*Math.min(1,open),9,.27,11);
 show(c,desk,1040,441+(1-Math.min(1,open))*-90,open);
 show(c,kiosk,290,400+bob+(1-Math.min(1,kk))*-90,kk,0,Math.sin(H.clamp((t-(ki-.5))/.5)*Math.PI*2)*.025*(1-H.clamp((t-(ki-.5))/.5)));
 const arrow1=sprite('arrow-1',140,110,scale,a=>S.clayTube(a,[-32,15],[7,-20],[30,-9],1,P.white,15));
 const arrow2=sprite('arrow-2',180,120,scale,a=>S.clayTube(a,[-54,15],[2,-33],[54,3],1,P.white,15));
 if(tk>.01){if(t>=ti+.45)show(c,arrow1,425,411);else S.clayTube(c,[393,426],[432,391],[455,402],E(t,ti,.45),P.white,15);show(c,ticket,625,378+Math.sin(t*1.6+1)*5,tk,-.045);}
 if(ck>.01)show(c,callBadge,1035,253+Math.sin(t*1.6+2)*3,ck);
 if(t>=go){if(t>=go+.5)show(c,arrow2,836,375);else S.clayTube(c,[782,390],[838,342],[890,378],E(t,go,.5),P.white,15);}
 show(c,person,px,py,open,-Math.sin(travel*Math.PI*8)*.035);
 const label1=sprite('label-k',210,90,scale,a=>S.clayLabel(a,0,0,'Kiosk',P.white,{font:'600 30px "Fredoka"'}));
 const label2=sprite('label-t',285,90,scale,a=>S.clayLabel(a,0,0,'Reception ticket',P.white,{font:'600 28px "Fredoka"'}));
 show(c,label1,290,612,kk);show(c,label2,625,612,tk);
 T(c,'SMART QUEUE',218,54,28);T(c,'PATIENT ARRIVAL',1097,54,28,ink,400);
 const head=t<ti?'Start at the kiosk':t<call?'Take a reception ticket':'When called, go to reception';T(c,head,640,143,56,ink,700);
 H.grain(c,1280,720,.018,9+Math.floor(t*12));if(m.logo)c.drawImage(m.logo,54,26,52,52);
},
scoreSound(k,p){
 const ki=p.beats[0].events.kiosk,ti=p.beats[1].events.ticket,call=p.beats[2].events.call,go=p.beats[2].events.reception;
 for(const [tm,pan] of [[ki-.5,-.55],[ti-.18,0],[call-.18,.6]]){k.play('pop',tm,{gain:.18,pan,minor:true});k.play('thud',tm+.16,{gain:.12,f:160,pan,minor:true});}
 k.play('ding',call,{gain:.19,f:'G5',pan:.6});k.noise(go,{dur:1.2,color:'pink',filter:'bandpass',f:500,gain:.015,a:.2,pan:.3,minor:true});
}
};
}
