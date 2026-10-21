{
const S=STYLE_PACKS['claymation-set'];let A=null;
const cream='#f6efe3',yellow='#f2c14e',ink='#244e59';
function lump(key,w,h,color,seed,draw,extra={}){return S.bake(key,w,h,{color,seed,R:10,dome:1.2,lump:1.5,draw,fps:S.prn(seed,w,h,3,19),...extra});}
function oval(key,w,h,color,seed){return lump(key,w,h,color,seed,c=>S.lumpy(c,S.cnz(),w/2,h/2,w*.48,h*.48,seed,.065));}
function word(c,text,x,y,px=28,col=cream){
 const mc=S.mctx();mc.font=S.FR(px);const widths=[...text].map(ch=>mc.measureText(ch).width+px*.025);let at=x-widths.reduce((a,b)=>a+b,0)/2;
 [...text].forEach((ch,i)=>{if(ch!==' ')S.place(c,S.glyph(ch,px,col),at,y-px*.82,{rot:(H.rng(ch.charCodeAt(0)+i)()-.5)*.04,shadow:{a:.25,blur:3,dx:2,dy:3}});at+=widths[i];});
}
function coil(key,w,h){return lump(key,w,h,cream,64,c=>{
 c.lineWidth=12;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(12,h-16);c.quadraticCurveTo(w*.55,5,w-18,h*.48);c.stroke();
 c.beginPath();c.moveTo(w-37,h*.48-19);c.lineTo(w-12,h*.48+3);c.lineTo(w-43,h*.48+13);c.stroke();
 },{R:6,lump:.6,dome:1.3,fps:[]});}
function build(){return {
 kiosk:lump('kiosk',144,205,yellow,31,c=>{c.beginPath();c.roundRect(7,3,130,190,25);c.fill();},{marks:[[26,155,41,169,1.1],[106,157,114,183,.9]]}),
 base:oval('base',188,30,ink,22),screen:lump('screen',110,100,ink,23,c=>{c.beginPath();c.roundRect(0,0,110,100,16);c.fill();},{R:6,fps:[]}),
 button:oval('button',55,24,'#a8dd8a',26),slot:lump('slot',74,10,ink,27,c=>{c.beginPath();c.roundRect(0,0,74,10,5);c.fill();},{R:3,fps:[]}),
 ticket:lump('ticket',222,174,cream,42,c=>{c.beginPath();c.moveTo(7,6);c.lineTo(215,10);c.lineTo(211,164);for(let x=211;x>6;x-=16)c.lineTo(x,164+(x%32===19?6:0));c.lineTo(7,6);c.fill();},{R:7,marks:[[23,130,198,129,.7]],spec:.22}),
 desk:lump('desk',240,126,'#ef8fb0',51,c=>{c.beginPath();c.roundRect(4,0,230,123,19);c.fill();},{R:12,marks:[[25,89,74,92,1.2],[182,102,218,97,.8]]}),
 top:lump('top',265,27,cream,52,c=>{c.beginPath();c.roundRect(0,0,265,27,12);c.fill();},{R:8}),
 monitor:lump('monitor',72,51,ink,55,c=>{c.beginPath();c.roundRect(0,0,72,51,8);c.fill();},{R:5,fps:[]}),
 call:lump('call',252,122,yellow,61,c=>{c.beginPath();c.roundRect(2,2,247,116,22);c.fill();},{R:10}),
 torso:[0,1,2].map(b=>lump('body'+b,75,109,'#f07b5a',71,c=>S.lumpy(c,S.cnz(),37,57,35,51,71,.06),{boil:b,marks:[[28,69,47,75,.8]]})),
 head:oval('head',65,69,'#eab58b',72),hair:oval('hair',68,26,'#583c30',73),eye:oval('eye',7,8,ink,74),
 leg:oval('leg',21,62,ink,75),arm:oval('arm',22,67,'#f07b5a',76),hand:oval('hand',23,24,'#eab58b',77),
 staff:oval('staff',66,82,'#a8dd8a',78),arrow1:coil('coil1',113,55),arrow2:coil('coil2',250,64)
};}
function person(c,x,y,boil=0,staff=false,walk=0){
 c.save();c.translate(x,y);if(staff)c.scale(.8,.8);
 if(!staff){S.place(c,A.leg,-25,112,{rot:walk*.14});S.place(c,A.leg,6,112,{rot:-walk*.14});}
 S.place(c,staff?A.staff:A.torso[boil],-37,37,{rot:walk*.025});
 S.place(c,A.arm,-44,53,{rot:-.17+walk*.08});S.place(c,A.hand,-43,105);
 S.place(c,A.arm,23,48,{rot:-.45});S.place(c,A.hand,26,108);
 S.place(c,A.head,-33,-19);S.place(c,A.hair,-34,-22);S.place(c,A.eye,-13,9,{shadow:false});S.place(c,A.eye,9,9,{shadow:false});
 c.restore();
}
function pop(c,t,start,x,y,w,h,draw){if(t<start)return;const pose=S.SEQ.pop[Math.min(4,Math.floor((t-start)*12/2))];c.save();c.translate(x+w/2,y+h);c.scale(pose[0],pose[1]);c.translate(-w/2,-h);draw(c);c.restore();}
window.film={draw(c,t,p,m){
 if(S.setScale(c.canvas.width/1280))A=null;if(!A)A=build();
 const kiosk=p.beats[0].events.kiosk,ti=p.beats[1].events.ticket,call=p.beats[2].events.call,go=p.beats[2].events.reception;
 const fr=Math.floor(t*12),boil=Math.floor(fr/4)%3,move=H.ease.inOut(H.clamp(Math.floor(Math.max(0,t-go)*12)/12/1.35));
 S.background(c);
 word(c,'Smart Queue',218,66,28);word(c,'PATIENT ARRIVAL',1050,66,28);
 word(c,t<ti?'Start at the kiosk':t<call?'Take a reception ticket':'When called, go to reception',640,166,48);
 pop(c,t,kiosk,248,310,188,225,cc=>{S.place(cc,A.base,0,187);S.place(cc,A.kiosk,22,0);S.place(cc,A.screen,39,17);word(cc,'TICKET',94,55,28,cream);S.place(cc,A.button,67,78);S.place(cc,A.slot,57,157);});
 if(t>=kiosk)word(c,'Kiosk',342,590,32);
 pop(c,t,ti,530,300,222,174,cc=>{S.place(cc,A.ticket,0,0);word(cc,'Reception',111,42,28,ink);word(cc,'ticket',111,76,28,ink);word(cc,'G-001',111,140,64,ink);});
 if(t>=ti+.3)S.place(c,A.arrow1,412,383,{shadow:{a:.3,blur:6,dx:4,dy:6}});
 pop(c,t,call,923,251,265,279,cc=>{
  person(cc,151,135,0,true);S.place(cc,A.monitor,50,161);S.place(cc,A.desk,12,191);S.place(cc,A.top,0,181);
  S.place(cc,A.call,7,-10);word(cc,'Now calling',132,25,28,ink);word(cc,'G-001',132,90,64,ink);
 });
 if(t>=call)word(c,'Reception',1050,627,32);
 if(t>=go)S.place(c,A.arrow2,519,570,{sx:Math.min(1,.3+move),ax:0,shadow:{a:.3,blur:6,dx:4,dy:6}});
 const px=H.lerp(159,835,move),walk=t>=go&&move<1?(fr%4<2?1:-1):0;
 pop(c,t,0,px-50,382,100,174,cc=>person(cc,50,0,boil,false,walk));
 S.finish(c,1280,720,t);if(m.logo)c.drawImage(m.logo,53,27,47,53);
},scoreSound(k,p){
 const kiosk=p.beats[0].events.kiosk,ti=p.beats[1].events.ticket,call=p.beats[2].events.call,go=p.beats[2].events.reception;
 for(const [t,pan] of [[0,-.6],[kiosk,-.4],[ti,0],[call,.6]]){
  k.tone(t,{f:[[0,125],[.12,65]],dur:.15,gain:.06,pan,minor:true});
  k.noise(t,{dur:.15,color:'brown',filter:'lowpass',f:[[0,600],[.15,180]],gain:.09,a:.008,pan,minor:true});
 }
 k.play('ding',call,{f:'D5',gain:.14,pan:.5});
 k.noise(go,{dur:.65,color:'brown',filter:'lowpass',f:[[0,150],[.2,650],[.65,180]],gain:.045,a:.05,minor:true});
}};
}
