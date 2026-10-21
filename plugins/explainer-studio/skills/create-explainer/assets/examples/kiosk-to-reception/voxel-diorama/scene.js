{
const S=STYLE_PACKS['voxel-diorama'],brown='#74432d',orange='#ff8a3d';
const smooth=(t,a,d=.5)=>H.ease.inOut(H.clamp((t-a)/d));
function txt(c,str,x,y,size=28,col=brown,align='center'){
 c.save();c.font=`600 ${size}px Fredoka`;c.textAlign=align;c.fillStyle=col;c.fillText(str,x,y);c.restore();
}
function world(t,p){
 const V=new Map(),at=new Map(),r=H.rng(23);
 const set=(x,y,z,col,a=-1,e=false)=>{const k=S.K(x,y,z);V.set(k,{x,y,z,c:Array.isArray(col)?col:H.hex(col),e});at.set(k,a);};
 const fill=(x0,x1,y0,y1,z0,z1,col,a=-1)=>{for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++)set(x,y,z,col,a);};
 const go=p.beats[2].events.reception,travel=smooth(t,go,1.3);
 // A warm floating hospital model, built from individual cubes.
 for(let x=0;x<=37;x++)for(let y=0;y<=15;y++){
  if((x<2||x>35)&&(y<2||y>13))continue;
  for(let z=2;z<=5;z++){
   if(z===2&&(x<2||x>35||y<2||y>13))continue;
   const col=z===5?H.mix('#eee5cd','#fff4e2',r()*.5):z===4?'#9fcb55':H.mix('#c27c4a','#a9653e',r());
   set(x,y,z,col,-.32+z*.025+r()*.12);
  }
 }
 // Raised rear wall and toy-scale planter.
 fill(21,36,1,1,6,9,'#c6dfb9',.12);
 fill(33,35,3,5,6,7,'#d08a4f',.15);fill(34,34,4,4,8,10,'#8a5a3b',.15);
 fill(33,35,3,5,10,12,'#86c35a',.2);fill(34,34,4,4,13,13,'#9fcb55',.22);
 // Kiosk: chunky body, inset screen, illuminated button and ticket slot.
 fill(4,8,8,11,6,6,'#4a4458',.12);
 fill(5,7,9,10,7,8,'#b9b3ad',.16);
 fill(4,8,8,10,9,16,'#ff8a3d',.2);
 fill(5,7,11,11,11,15,'#2b2d42',.25);
 fill(5,7,11,11,14,14,'#7fd6e3',.25);
 fill(6,6,11,11,12,12,'#9fcb55',.25);
 fill(5,7,11,11,10,10,'#4a4458',.25);
 // Reception staff is rendered before the counter through shared voxel sorting.
 function person(x,y,col,arrival=-1,step=0){
  fill(x,x+1,y,y+1,6,8,'#4a4458',arrival);
  fill(x+3,x+4,y+step,y+1+step,6,8,'#4a4458',arrival);
  fill(x,x+4,y,y+1,9,12,col,arrival);
  fill(x-1,x-1,y,y+1,9,11,col,arrival);fill(x+5,x+5,y,y+1,9,11,col,arrival);
  fill(x+1,x+3,y,y+2,13,15,'#edbd92',arrival);
  fill(x+1,x+3,y,y+2,16,16,'#4a4458',arrival);
  set(x+1,y+2,15,'#4a4458',arrival);set(x+3,y+2,15,'#4a4458',arrival);
 }
 person(26,4,'#60bba3',.2);
 fill(23,33,8,10,6,10,'#60bba3',.18);
 fill(22,34,7,11,11,11,'#fff4e2',.2);
 fill(24,27,9,9,12,14,'#4a4458',.3);fill(25,26,10,10,13,14,'#7fd6e3',.3);
 const px=12+Math.round(8*travel),py=11-Math.round(2*travel);
 person(px,py,orange,.38,travel>0&&travel<1?Math.floor(t*8)%2:0);
 // Pixel route assembles on the floor when the patient is called.
 if(t>=go){
  const n=Math.floor(smooth(t,go,1.1)*10);
  for(let i=0;i<n;i++)set(14+i,14,6,orange,-1);
  if(n===10){set(22,13,6,orange);set(22,15,6,orange);}
 }
 return {V,at};
}
window.film={
draw(c,t,p,m){
 const ti=p.beats[1].events.ticket,call=p.beats[2].events.call,go=p.beats[2].events.reception,travel=smooth(t,go,1.3);
 const bg=c.createLinearGradient(0,0,0,720);bg.addColorStop(0,'#fff2db');bg.addColorStop(1,'#e8ccae');c.fillStyle=bg;c.fillRect(0,0,1280,720);
 const g=c.createRadialGradient(640,380,50,640,380,640);g.addColorStop(0,'#fff9ec');g.addColorStop(1,'rgba(255,249,236,0)');c.fillStyle=g;c.fillRect(0,0,1280,720);
 S.setYaw(.53+travel*.055);
 const P0=S.makeProj(0,0,21),center=P0(18,8,5),P=(x,y,z)=>{const q=P0(x,y,z);return [640+q[0]-center[0],470+q[1]-center[1]];};
 c.save();c.fillStyle='rgba(105,61,37,.18)';c.filter='blur(24px)';c.beginPath();c.ellipse(690,611,410,58,.05,0,Math.PI*2);c.fill();c.restore();
 const {V,at}=world(t,p);
 S.drawVoxels(c,V,P,21,{depthDark:true,t,at:v=>at.get(S.K(v.x,v.y,v.z)),cull:[1280,720]});
 if(m.logo)c.drawImage(m.logo,48,25,53,53);
 txt(c,'SMART QUEUE',117,62,28,brown,'left');txt(c,'PATIENT ARRIVAL',1225,62,28,brown,'right');
 const title=t<ti?'START AT THE KIOSK':t<call?'TAKE A TICKET':'YOUR NUMBER IS CALLED';
 S.vxPixelText(c,title,640,128,7.4,H.hex('#8a5236'),H.hex('#74432d'));
 const kp=P(6,10,20);S.vxBlockTag(c,235,326,'KIOSK',{font:'600 28px Fredoka',d:5});
 const rp=P(29,10,8);S.vxBlockTag(c,rp[0]+20,rp[1]+45,'RECEPTION',{font:'600 28px Fredoka',d:5,bg:'#fff4e2'});
 if(t>=ti){
  const k=H.ease.back(H.clamp((t-ti)/.4));
  S.vxBlockTag(c,236,544,'RECEPTION TICKET',{k,font:'600 28px Fredoka',h:48,d:7});
  S.vxBlockTag(c,236,609,'G-001',{k,font:'400 64px Silkscreen',h:84,d:7});
 }
 if(t>=call){
  const k=H.ease.back(H.clamp((t-call)/.4));
  S.vxBlockTag(c,1060,215,'NOW CALLING',{k,font:'600 28px Fredoka',bg:orange,col:'#fff',h:48,d:7});
  S.vxBlockTag(c,1060,278,'G-001',{k,font:'400 64px Silkscreen',bg:orange,col:'#fff',h:84,d:7});
 }
 txt(c,t<go?'Take a ticket. Wait for your call.':'When called, go to reception.',640,695,30);
 S.finish(c,1280,720);
},
scoreSound(k,p){
 const start=p.beats[0].start;
 for(let i=0;i<5;i++)k.play('tock',start+.12+i*.12,{gain:.09,f:330+i*60,minor:true});
 k.play('pop',p.beats[0].events.kiosk,{gain:.22,f:500,minor:true});
 k.play('tock',p.beats[1].events.ticket,{gain:.3,f:600,minor:true});
 k.play('ding',p.beats[2].events.call,{gain:.24,f:'G5'});
 for(let i=0;i<6;i++)k.play('tock',p.beats[2].events.reception+i*.17,{gain:.06,f:480+i*30,minor:true});
}
};
}
