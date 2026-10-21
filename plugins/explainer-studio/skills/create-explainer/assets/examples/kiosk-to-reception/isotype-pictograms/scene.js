{
const S=STYLE_PACKS['isotype-pictograms'];
const T=(c,str,x,y,size=28,col=S.INK,align='left',weight=700,track=.5)=>{
 c.fillStyle=col;c.font=`${weight} ${size}px "Space Grotesk"`;c.textBaseline='alphabetic';S.spaced(c,str,x,y,track,align);
};
// The first impression is quantized earlier than the spoken word, never later.
const onset=t=>Math.floor(t*12)/12;
function stamp(c,t,a,x,y,fn){
 const ts=Math.floor(t*12)/12;if(ts<a)return;
 c.save();if(ts<a+1/12){c.translate(x,y);c.scale(1.14,1.14);c.translate(-x,-y);c.globalAlpha=.8;}fn();c.restore();
}
function kiosk(c,x,y){
 c.fillStyle=S.RED;c.fillRect(x,y,76,104);c.fillRect(x+26,y+104,24,16);c.fillRect(x+10,y+116,56,6);
 c.fillStyle=S.PAPER;c.fillRect(x+10,y+12,56,51);c.fillRect(x+14,y+85,48,7);
 c.fillStyle=S.RED;c.fillRect(x+20,y+24,36,7);c.fillRect(x+26,y+43,24,9);
}
function ticket(c,x,y){
 c.fillStyle=S.RED;c.fillRect(x,y,150,95);
 c.fillStyle=S.PAPER;for(let k=1;k<6;k++){c.beginPath();c.arc(x,y+k*15,3,0,7);c.arc(x+150,y+k*15,3,0,7);c.fill();}
 c.fillRect(x+20,y+20,110,9);c.fillRect(x+20,y+42,75,7);
 for(let k=0;k<8;k++)c.fillRect(x+20+k*14,y+72,6,3);
}
function reception(c,x,y){
 c.fillStyle=S.RED;S.person(c,x+50,y,1.35);c.fillRect(x,y+50,146,12);c.fillRect(x+8,y+62,130,47);
 c.fillStyle=S.PAPER;c.fillRect(x+58,y+76,30,7);
}
window.film={
draw(out,t,p,m){
 const W=out.canvas.width,Hh=out.canvas.height,s=W/1280;
 out.drawImage(S.paper(W,Hh),0,0,1280,720);
 const layer=S.inkLayer(W,Hh),c=layer.getContext('2d');c.scale(s,s);
 const st=onset(p.beats[0].start),ki=onset(p.beats[0].events.kiosk),ti=onset(p.beats[1].events.ticket),call=onset(p.beats[2].events.call),go=onset(p.beats[2].events.reception);
 const ts=Math.floor(t*12)/12;
 T(c,'SMART QUEUE',110,58,28);T(c,'PATIENT ARRIVAL',1218,58,28,S.INK,'right',400);
 T(c,'KIOSK TO RECEPTION',64,133,54);
 c.fillStyle=S.INK;c.fillRect(64,158,1152,3);
 // One sheet, three process rows; identical people refer to the same patient.
 const ys=[204,346,488],starts=[st,ti,call],labels=[['ARRIVE'],['TAKE','TICKET'],['WHEN','CALLED']];
 for(let i=0;i<3;i++){
  const y=ys[i],a=starts[i];
  c.fillStyle='rgba(38,35,31,.17)';c.fillRect(64,y+129,1152,1);
  stamp(c,t,a,101,y+54,()=>{
   c.fillStyle=S.OCHRE;c.fillRect(64,y-5,74,116);T(c,String(i+1).padStart(2,'0'),101,y+65,40,S.INK,'center');
   labels[i].forEach((l,k)=>T(c,l,164,y+47+k*34,28));
  });
  const manStart=i===0?st:starts[i];
  stamp(c,t,manStart,383,y+51,()=>{c.fillStyle=S.BLUE;S.person(c,354,y+3,2.3);});
  const objStart=i===0?ki:i===1?ti:go;
  if(ts>=objStart){
   c.fillStyle=S.INK;S.flatArrow(c,446,y+54,540,y+54,14,H.clamp((ts-objStart+1/12)/.25));
   stamp(c,t,objStart,640,y+57,()=>{if(i===0)kiosk(c,602,y-7);else if(i===1)ticket(c,566,y+8);else reception(c,568,y+3);});
  }
  if(i===0&&ts>=ki)T(c,'KIOSK',852,y+65,36);
  if(i===1&&ts>=ti){T(c,'RECEPTION TICKET',852,y+25,28,S.INK,'left',400);stamp(c,t,ti,1000,y+75,()=>T(c,'G-001',852,y+95,64,S.RED));}
  if(i===2&&ts>=call){T(c,'NOW CALLING',852,y+25,28,S.INK,'left',400);stamp(c,t,call,1000,y+75,()=>T(c,'G-001',852,y+95,64,S.RED));}
 }
 c.fillStyle=S.BLUE;S.person(c,66,652,.75);
 T(c,'Same patient, shown at each step',108,681,28,S.INK,'left',400);
 T(c,'1 JOURNEY / 3 STEPS',1216,681,28,S.INK,'right');
 S.printInk(out,layer,W,Hh);
 out.save();out.setTransform(1,0,0,1,0,0);S.lithoFinish(out,W,Hh,2);H.grain(out,W,Hh,.05,9+Math.floor(t*8));out.restore();
 if(m.logo)out.drawImage(m.logo,58,23,42,42);
},
scoreSound(k,p){
 const ki=onset(p.beats[0].events.kiosk),ti=onset(p.beats[1].events.ticket),call=onset(p.beats[2].events.call),go=onset(p.beats[2].events.reception);
 k.noise(p.beats[0].start,{dur:.25,color:'pink',filter:'bandpass',f:700,gain:.025,a:.02,minor:true});
 for(const [tm,pan] of [[0,-.6],[ki,-.1],[ti,0],[call,.6],[go,.1]]){
  k.play('thud',tm,{gain:.2,f:160,pan,minor:true});k.play('tock',tm,{gain:.12,f:420,pan,minor:true});
 }
 k.play('ding',call,{gain:.18,f:'G5',pan:.6});
}
};
}
