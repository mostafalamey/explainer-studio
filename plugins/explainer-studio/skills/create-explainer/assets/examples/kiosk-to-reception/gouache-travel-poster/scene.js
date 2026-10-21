{
const S=STYLE_PACKS['gouache-travel-poster'],{navy,teal,orange,mustard,cream,rose}=S.PAL;
const poly=(c,pts)=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const text=(c,str,x,y,size=32,font='Oswald',align='left')=>{c.font=`400 ${size}px "${font}"`;c.textAlign=align;c.textBaseline='alphabetic';c.fillText(str,x,y);};
const progress=(t,start,d=.4)=>H.ease.inOut(H.clamp((t-start)/d));
function person(c,x,y,s){
 c.beginPath();c.arc(x,y-100*s,15*s,0,7);c.fill();
 poly(c,[[x-15*s,y-79*s],[x+15*s,y-79*s],[x+26*s,y-24*s],[x-26*s,y-24*s]]);
 c.fillRect(x-16*s,y-25*s,10*s,25*s);c.fillRect(x+6*s,y-25*s,10*s,25*s);
}
window.film={
draw(ctx,t,p,m){
 if(!window.gouachePrimed){window.gouachePrimed=true;for(const b of p.beats)window.film.draw(ctx,b.frame,p,m);}
 const board=S.poster(ctx.canvas.width,ctx.canvas.height),{paint,buf,cache}=board;
 const start=p.beats[0].start,ki=p.beats[0].events.kiosk,ti=p.beats[1].events.ticket,call=p.beats[2].events.call,go=p.beats[2].events.reception;
 const P=(a,d=.4)=>progress(t,a,d),opening=P(start,.7);
 // Permanent architecture, layered like a travel poster. Finished paint is cached before board grain.
 if(opening===1&&cache.BG.hospital)buf.set(cache.BG.hospital);
 else{
  paint(rose,[18,18,1262,190],c=>c.fillRect(20,20,1240,170),{p:opening,key:'background-1',edge:4,rag:.8});
  paint(S.tint(rose,.45),[18,175,1262,325],c=>c.fillRect(20,183,1240,142),{p:opening,key:'background-2',edge:4,rag:.8});
  paint(S.tint(mustard,.5),[18,310,1262,565],c=>c.fillRect(20,320,1240,245),{p:opening,key:'background-3',edge:4,rag:.8});
  paint(orange,[899,118,1117,337],c=>{c.beginPath();c.arc(1008,228,104,0,7);c.fill();},{p:opening,key:'background-4'});
  paint(S.tint(teal,.5),[18,285,1262,566],c=>poly(c,[[20,341],[325,297],[626,343],[921,283],[1260,316],[1260,566],[20,566]]),{p:opening,key:'background-5',dir:'d',rag:1,edge:3});
  paint(teal,[727,235,1262,566],c=>poly(c,[[740,290],[1076,252],[1260,295],[1260,564],[740,564]]),{p:opening,key:'background-6',dir:'v'});
  paint(cream,[805,260,1242,566],c=>{c.fillRect(820,310,414,254);poly(c,[[820,310],[1080,276],[1234,310]]);},{p:opening,key:'background-7',dir:'v',edge:2});
  paint(S.tint(teal,.22),[846,326,1217,566],c=>{c.fillRect(858,338,346,226);},{p:opening,key:'background-8',dir:'v'});
  paint(navy,[856,327,1220,352],c=>c.fillRect(858,336,346,10),{p:opening,key:'background-9',edge:1.2});
  paint(S.tint(teal,.15),[18,475,1262,576],c=>poly(c,[[20,485],[361,478],[716,516],[1260,495],[1260,576],[20,576]]),{p:opening,key:'background-10',edge:3,rag:1});
  paint(navy,[18,523,1262,710],c=>{poly(c,[[20,530],[416,551],[849,532],[1260,538],[1260,704],[20,704]]);},{p:opening,key:'background-11',edge:3});
  paint(mustard,[60,507,1170,567],c=>poly(c,[[65,534],[575,546],[1159,517],[1162,524],[577,562],[65,551]]),{p:opening,key:'background-12',edge:2,rag:.8});
  paint(navy,[20,20,1260,112],c=>{text(c,'SMART QUEUE',112,69,40,'Bebas Neue');text(c,'PATIENT ARRIVAL',1224,64,28,'Oswald','right');},{p:opening,key:'background-13',edge:.7,rag:.3});
  if(opening===1)cache.BG.hospital=buf.slice();
 }
 const kiosk=P(ki-.55,.55);
 paint(H.mix(teal,navy,.4),[150,183,385,530],c=>{poly(c,[[174,216],[332,191],[365,211],[365,468],[330,483],[174,464]]);c.fillRect(222,464,77,43);c.fillRect(185,501,152,17);},{p:kiosk,dir:'v',key:'kiosk-shadow'});
 paint(teal,[165,207,342,474],c=>c.fillRect(174,215,160,250),{p:kiosk,dir:'v',key:'kiosk-front'});
 paint(cream,[181,233,327,379],c=>c.fillRect(189,241,130,130),{p:kiosk,key:'screen'});
 paint(navy,[192,246,316,355],c=>{c.fillRect(201,253,106,17);text(c,'TICKET',254,307,34,'Bebas Neue','center');},{p:kiosk,edge:.8,rag:.4,key:'screen-label'});
 paint(orange,[203,318,306,351],c=>c.fillRect(210,326,88,18),{p:kiosk,edge:1,key:'button'});
 paint(navy,[193,401,316,430],c=>c.fillRect(202,408,105,13),{p:kiosk,edge:1,key:'slot'});
 paint(navy,[169,128,341,183],c=>text(c,'KIOSK',254,173,42,'Bebas Neue','center'),{p:kiosk,edge:.8,rag:.4,key:'kiosk-title'});
 // Ticket remains in the composition after it is issued.
 const ticket=P(ti-.18,.18);
 if(ticket>0){
  paint(navy,[424,240,731,481],c=>poly(c,[[444,258],[709,242],[721,459],[455,475]]),{p:ticket,edge:2,key:'ticket-shadow'});
  paint(cream,[415,231,719,467],c=>poly(c,[[434,246],[697,232],[710,448],[446,463]]),{p:ticket,edge:2,key:'ticket'});
  paint(navy,[444,249,699,440],c=>{
   c.save();c.translate(573,347);c.rotate(-.05);
   text(c,'RECEPTION',0,-45,30,'Oswald','center');text(c,'G-001',0,49,96,'Bebas Neue','center');
   for(let x=-96;x<100;x+=17)c.fillRect(x,76,9,3);c.restore();
  },{p:ticket,edge:.7,rag:.3,key:'ticket-text'});
  paint(orange,[349,351,431,400],c=>poly(c,[[351,367],[400,367],[400,354],[429,378],[400,399],[400,386],[351,386]]),{p:P(ti,.3),edge:1,rag:.5,key:'issue-arrow'});
 }
 // Reception is a painted destination, not the reference's industrial scenery.
 paint(navy,[1006,360,1115,493],c=>person(c,1060,481,.87),{p:opening,dir:'v',key:'staff'});
 paint(orange,[966,450,1199,531],c=>c.fillRect(976,458,214,65),{p:opening,dir:'v',key:'desk'});
 paint(mustard,[951,440,1210,466],c=>c.fillRect(958,444,245,14),{p:opening,edge:1,key:'desktop'});
 paint(cream,[980,466,1190,514],c=>text(c,'RECEPTION',1083,501,28,'Oswald','center'),{p:opening,edge:.7,rag:.3,key:'desk-label'});
 if(t>=call-.18){
  const q=P(call-.18,.18);
  paint(orange,[873,116,1227,324],c=>{
   c.beginPath();for(let i=0;i<32;i++){const a=i/32*Math.PI*2,r=i%2?79:100;c.lineTo(1048+Math.cos(a)*r*1.62,220+Math.sin(a)*r*.94);}c.closePath();c.fill();
  },{p:q,edge:1.5,rag:.5,key:'call-burst'});
  paint(navy,[919,162,1179,277],c=>{text(c,'NOW CALLING',1048,196,28,'Oswald','center');text(c,'G-001',1048,262,72,'Bebas Neue','center');},{p:q,edge:.7,rag:.3,key:'call-number'});
 }
 // Painted patient moves from kiosk toward reception; no new scene is required.
 const journey=P(go,1.2),px=115+journey*788,py=518;
 paint(orange,[px-30,py-121,px+30,py+4],c=>person(c,px,py,1),{p:opening,dir:'v',edge:1,rag:.4});
 paint(mustard,[px-32,py-63,px+5,py-29],c=>c.fillRect(px-25,py-57,24,23),{p:opening,edge:1,rag:.4});
 if(t>=go)paint(cream,[738,350,932,397],c=>poly(c,[[746,364],[895,364],[895,351],[929,374],[895,396],[895,383],[746,383]]),{p:P(go,.45),edge:1,rag:.5,key:'walk-arrow'});
 const head=t<ti?'YOUR VISIT STARTS HERE':t<call?'TAKE A RECEPTION TICKET':'CALLED? GO TO RECEPTION';
 paint(cream,[46,581,1232,690],c=>text(c,head,640,669,86,'Bebas Neue','center'),{p:opening,edge:1.2,rag:.6,key:'heading-'+head});
 // Hand-trimmed paper border plus the original matte board finishing pass.
 paint(cream,[0,0,1280,720],c=>{c.beginPath();c.rect(0,0,1280,720);c.moveTo(20,20);c.lineTo(20,700);c.lineTo(1260,700);c.lineTo(1260,20);c.closePath();c.fill('evenodd');c.fillRect(20,571,1240,8);},{edge:2,rag:.9,key:'border'});
 board.finish(ctx);
 if(m.logo)ctx.drawImage(m.logo,48,27,49,49);
},
scoreSound(k,p){
 const st=p.beats[0].start,ti=p.beats[1].events.ticket,call=p.beats[2].events.call,go=p.beats[2].events.reception;
 for(const [tm,d,pan] of [[st,.7,0],[p.beats[0].events.kiosk-.55,.55,-.65],[ti-.18,.3,-.1],[go,.45,.5]]){
  k.noise(tm,{dur:d,color:'pink',filter:'bandpass',f:950,gain:.045,a:.03,pan,minor:true});
 }
 k.play('tock',ti,{gain:.16,f:330,pan:-.2,minor:true});
 k.play('slap',call-.18,{gain:.18,pan:.65});
 k.play('ding',call,{gain:.2,f:'G5',pan:.65});
}
};
}
