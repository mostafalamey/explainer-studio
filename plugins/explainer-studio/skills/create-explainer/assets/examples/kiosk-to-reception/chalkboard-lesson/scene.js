{
const S=STYLE_PACKS['chalkboard-lesson'],X=S.XE;
function lesson(p,cx){
 const items=[],a=p.beats[0].events.kiosk,b=p.beats[1].events.ticket,d=p.beats[2].events.call,go=p.beats[2].events.reception;
 const line=(pts,role,w,a,b)=>items.push({k:'line',pts,role,w,a,b});
 const text=(s,x,y,size,font,role,a,b,inst=false)=>items.push({k:'text',s,x,y,size,font,role,a,b,rot:0,align:'center',inst});
 const arrow=(pts,role,a,b)=>{line(pts,role,3.5,a,b);line(X.head(pts,19),role,3.5,b,b+.05);};
 const person=(x,y,a,staff=false)=>{
  line(X.circ(x,y,22,25),'ink',3,a,a+.09);
  line([[x-28,y+42],[x,y+28],[x+27,y+42],[x+32,y+100],[x-31,y+100],[x-28,y+42]],'ink',3,a+.07,a+.15);
  line([[x-27,y+45],[x-44,y+80],[x-24,y+90]],'ink',3,a+.12,a+.2);
  line([[x+27,y+45],[x+46,y+76],[x+66,y+60]],'ink',3,a+.17,a+.25);
  if(!staff){line([[x-19,y+101],[x-20,y+155],[x-36,y+157]],'ink',3,a+.19,a+.27);line([[x+17,y+101],[x+22,y+155],[x+38,y+157]],'ink',3,a+.24,a+.32);}
 };
 text('Smart Queue',cx-440,72,28,'label','ink',0,0,true);
 text('PATIENT ARRIVAL',cx+430,72,28,'label','ink',0,0,true);
 text('Kiosk to reception',cx,157,56,'title','ink',0,.45);
 line([[cx-275,177],[cx+273,173]],'acc1',3,.43,.6);
 person(145,359,0);
 line(X.rrect(276,278,134,222,7),'ink',3.5,a,a+.18);
 line(X.rrect(294,299,98,88,5),'acc1',3,a+.08,a+.21);
 line([[306,437],[379,437]],'ink',4,a+.14,a+.23);
 line([[343,500],[343,526],[290,526],[397,526]],'ink',3.5,a+.2,a+.28);
 text('Ticket',343,350,28,'label','ink',a+.12,a+.28);
 text('Kiosk',343,573,32,'label','acc1',a,a+.22);
 // A tear edge and two short form rules make this a ticket, not a dashboard card.
 line([[614,282],[842,287],[837,491],[820,481],[802,492],[783,481],[764,491],[745,480],[724,492],[704,481],[683,491],[664,480],[642,492],[614,482],[614,282]],'ink',3.5,b,b+.2);
 text('Reception ticket',728,328,28,'label','ink',b,b+.25);
 text('G-001',728,432,69,'num','acc1',b+.15,b+.38);
 line([[641,454],[811,454]],'ink',1.8,b+.25,b+.4);
 arrow(X.quad([434,390],[505,353],[584,385]),'acc1',b+.05,b+.37);
 text('Now calling',1110,305,32,'label','ink',d,d+.16);
 text('G-001',1110,407,76,'num','acc1',d,d+.18);
 line(X.circ(1110,379,146,69,-2.6,4.0),'acc2',3.5,d+.18,d+.58);
 arrow(X.quad([865,400],[913,387],[948,402]),'acc1',d+.2,d+.48);
 person(1390,360,go);
 // Only the receptionist's visible upper body is sketched above the counter.
 line(X.circ(1660,348,22,25),'ink',3,go,go+.1);
 line([[1636,389],[1660,377],[1685,390],[1700,426]],'ink',3,go+.08,go+.2);
 line([[1626,389],[1617,425]],'ink',3,go+.13,go+.23);
 line(X.rrect(1531,440,218,94,3),'ink',3.5,go+.05,go+.25);
 line([[1515,438],[1764,438]],'ink',4,go+.2,go+.29);
 line(X.rrect(1550,379,72,54,3),'acc1',3,go+.15,go+.32);
 text('Reception',1640,580,34,'label','acc1',go,go+.35);
 arrow(X.quad([1265,447],[1318,429],[1351,450]),'acc1',go+.12,go+.42);
 return items;
}
window.film={draw(c,t,p,m){
 S.setScale(c.canvas.width/1280);
 const pan=p.beats[2].events.pan,cx=640+510*H.ease.inOut(H.smooth(pan,pan+1,t));
 S.render(c,1280,720,t,lesson(p,cx),[cx,360,1]);
 if(m.logo)c.drawImage(m.logo,49,31,39,44);
},scoreSound(k,p){
 const q=S.soundKit(k),items=lesson(p,640);
 for(const it of items){if(it.inst)continue;const x=it.k==='line'?it.pts[0][0]:it.x,pan=H.clamp((x-640)/900,-.65,.65);
  if(it.k==='text')q.write(it.s,it.a,it.b,.25,pan,true);else q.ch(it.a,it.b,.23,pan,true);
 }
 q.dust(p.beats[1].events.ticket+.4,.3,0);q.dust(p.beats[2].events.call+.58,.3,.4);
 k.play('ding',p.beats[2].events.call,{f:'D5',gain:.12,pan:.4});
}};
}
