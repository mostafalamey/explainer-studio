(() => {
  const M=STYLE_PACKS['memphis-group'],{PAL:P,K}=M;
  const clamp=v=>H.clamp(v,0,1),progress=(t,a,d)=>clamp((t-a)/d);
  const q=t=>Math.ceil(t*12-1e-6)/12;
  function at(c,t,a,x,y,fn,d=.3){const u=progress(t,a,d);if(u<=0)return;const k=H.ease.back(u);c.save();c.translate(x,y);c.scale(k,k);fn(u);c.restore();}
  function ellipse(c,x,y,rx,ry,col){const p=new Path2D();p.ellipse(x,y,rx,ry,0,0,Math.PI*2);M.solid(c,p,col,5,4);}
  function person(c,x,y,t,col){
    c.save();c.translate(x,y+Math.sin(t*2.4+.7)*3);
    const arm=new Path2D();arm.moveTo(-43,-38);arm.lineTo(-69,32);arm.moveTo(43,-38);arm.lineTo(72,-3);M.strokeOutlined(c,arm,P.cream,15,3,5);
    const legs=new Path2D();legs.moveTo(-22,47);legs.lineTo(-28,109);legs.lineTo(-46,109);legs.moveTo(23,47);legs.lineTo(30,109);legs.lineTo(49,109);M.strokeOutlined(c,legs,P.blue,18,3,5);
    M.solid(c,M.roundRect(-43,-55,86,116,22),col,7,5);
    ellipse(c,0,-100,31,34,P.butter);
    c.fillStyle=K;for(const x of [-10,10]){c.beginPath();c.arc(x,-103,2.8,0,7);c.fill();}
    c.strokeStyle=K;c.lineWidth=3;c.beginPath();c.arc(1,-95,9,.1,Math.PI-.1);c.stroke();c.restore();
  }
  function kiosk(c,t,ticketAge){
    M.solid(c,M.roundRect(-80,-143,160,250,20),P.lilac,12,5);
    M.solid(c,M.roundRect(-62,-120,124,101,12),P.cream,3,4);
    M.tag(c,'Ticket',0,-73,P.yellow,28);
    M.solid(c,M.roundRect(-48,8,96,15,6),K,0,3);
    if(ticketAge>0){c.save();c.beginPath();c.rect(-60,22,120,78);c.clip();M.solid(c,M.roundRect(-34,-50+H.ease.out(clamp(ticketAge/.25))*84,68,54,3),P.cream,3,3);c.restore();}
    M.solid(c,M.roundRect(-93,106,186,22,8),P.blue,6,4);
  }
  function ticket(c,t,call){
    c.save();c.rotate(-.045+Math.sin(t*2.4)*.008);
    M.solid(c,M.roundRect(-192,-111,384,222,20),P.cream,12,5);
    c.setLineDash([8,9]);c.strokeStyle=K;c.lineWidth=3;c.beginPath();c.moveTo(-164,51);c.lineTo(164,51);c.stroke();c.setLineDash([]);
    M.tag(c,call?'Now calling':'Reception ticket',0,-76,call?P.magenta:P.mint,32);
    M.chunky(c,'G-001',0,2,72,call?P.yellow:P.blue);
    for(let i=0;i<25;i++){c.fillStyle=K;c.fillRect(-135+i*11,73,2+(i%3),17);}
    c.restore();
  }
  function desk(c,t){
    c.save();c.translate(0,-76);ellipse(c,40,-82,27,30,P.butter);M.solid(c,M.roundRect(1,-48,82,83,18),P.magenta,6,4);c.restore();
    M.solid(c,M.roundRect(-155,-15,310,133,14),P.teal,12,5);
    c.save();c.clip(M.roundRect(-155,-15,310,133,14));c.strokeStyle=K;c.lineWidth=3;for(let x=-135;x<155;x+=26){c.beginPath();c.moveTo(x,52);c.lineTo(x+26,77);c.lineTo(x,102);c.stroke();}c.restore();
    M.solid(c,M.roundRect(-170,-28,340,26,9),P.yellow,8,4);
    M.solid(c,M.roundRect(-115,-115,98,74,8),P.blue,6,4);
    c.strokeStyle=K;c.lineWidth=8;c.beginPath();c.moveTo(-66,-40);c.lineTo(-66,-29);c.stroke();
  }
  function heading(c,t,final,hook){
    at(c,t,hook,640,150,()=>{c.rotate(-.028+Math.sin(t*2.4)*.005);M.solid(c,M.bubble(800,164,[255,116]),P.cream,13,6);M.chunky(c,final?'GO TO':'KIOSK TO',0,-34,54,P.magenta);M.chunky(c,'RECEPTION',0,32,54,P.blue);},.38);
  }
  window.film={
    draw(c,time,project,media){
      M.setScale(project.width/1280);
      const e=Object.assign({},...project.beats.map(b=>b.events)),t=Math.floor(time*12)/12;
      const wipe=progress(t,e.wipe,.85),final=t>=e.wipe+.42;
      c.drawImage(M.sceneGround(final?2:1,final?[P.butter,P.lilac]:[P.pink,P.mint],1280,720),0,0,1280,720);
      heading(c,t,final,e.hook);
      if(!final){
        at(c,t,e.patient,235,433,()=>person(c,0,0,t,P.teal));
        at(c,t,e.kiosk,472,425,()=>kiosk(c,t,t-e.ticket));
        if(t>=e.kiosk)M.tag(c,'Kiosk',472,598,P.yellow,32,-.04);
        at(c,t,e.ticket,925,430,()=>{
          if(t>=e.call){c.save();c.rotate((t-e.call)*.5);M.solid(c,M.burst(14,181,212),P.yellow,9,4);c.restore();}
          ticket(c,t,t>=e.call);
        });
        M.fatArrow(c,598,460,687,460,H.ease.out(progress(t,e.ticket,.25)),P.magenta,18);
      }else{
        c.save();c.translate(294,432);c.rotate((t-e.call)*.3);M.solid(c,M.burst(14,196,225),P.yellow,10,4);c.restore();
        c.save();c.translate(294,432);ticket(c,t,true);c.restore();
        const journey=H.ease.inOut(progress(t,e.travel,.85));person(c,H.lerp(630,740,journey),438,t,P.teal);
        at(c,t,e.reception,1030,460,()=>desk(c,t),.32);
        M.tag(c,'Reception',1030,616,P.cream,34,.025);
        M.fatArrow(c,532,588,728,588,H.ease.out(progress(t,e.travel,.5)),P.magenta,18);
      }
      M.wipe(c,1280,720,wipe);
      // Authentic project logo on a cream brand sticker, preserved through the wipe.
      c.save();M.solid(c,M.roundRect(28,19,266,55,13),P.cream,5,3);
      if(media.logo)c.drawImage(media.logo,38,24,42,42);
      c.font='700 28px "Fredoka"';c.textAlign='left';c.textBaseline='middle';c.fillStyle=K;c.fillText('Smart Queue',91,47);c.restore();
      H.grain(c,1280,720,.05,6+Math.floor(time*12),true);
    },
    scoreSound(k,p){
      const e=Object.assign({},...p.beats.map(b=>b.events)),s=M.soundKit(k),land=(a,d=.3)=>q(a+d*.37);
      s.pop(land(e.hook,.38),320,.65,0,true);s.boing(land(e.patient),180,.45,-.5,true);
      s.pop(land(e.kiosk),240,.7,-.2,true);s.boing(land(e.ticket),210,.5,.45,true);
      k.play('click',q(e.ticket),{gain:.35,pan:.3,minor:true});
      s.stab(q(e.call),['G4','C5','E5'],.65,.4,false);s.pop(q(e.call),480,.5,.4,true);
      s.zip(q(e.wipe));s.pop(land(e.reception,.32),280,.6,.5,true);
      s.boing(q(e.travel),160,.35,.2,true);
    }
  };
})();
