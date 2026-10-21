(() => {
  const M=STYLE_PACKS['bauhaus-poster'],{C}=M;
  const prog=(t,a,d)=>H.clamp((t-a)/d,0,1);
  function text(c,s,x,y,size=32,col=C.black,font='Space Grotesk',weight=700,align='left'){c.fillStyle=col;c.font=`${weight} ${size}px "${font}"`;c.textAlign=align;c.textBaseline='middle';const w=c.measureText(s).width,m=c.getTransform(),left=x-(align==='center'?w/2:0),a=m.a*left+m.e,b=a+m.a*w;if(a>=0&&b<=c.canvas.width)c.fillText(s,x,y);}
  function circle(c,x,y,r,col){if(r<=0)return;c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
  function stamp(c,t,a,x,y,fn,d=.4){const u=prog(t,a,d);if(u<=0)return;c.save();c.translate(x,y-70*(1-H.ease.back(u)));fn();c.restore();}
  function person(c,x,y){
    circle(c,x,y-99,31,C.yellow);
    c.fillStyle=C.red;c.beginPath();c.arc(x,y+20,61,Math.PI,0);c.lineTo(x+61,y+54);c.lineTo(x-61,y+54);c.closePath();c.fill();
    c.fillStyle=C.black;c.fillRect(x-38,y+54,24,76);c.fillRect(x+14,y+54,24,76);
    c.fillRect(x-48,y+117,34,13);c.fillRect(x+14,y+117,42,13);
    c.save();c.translate(x+57,y-11);c.rotate(-.55);c.fillStyle=C.red;c.fillRect(0,0,23,75);c.restore();
  }
  function kiosk(c,t,e){
    c.fillStyle=C.blue;c.fillRect(-88,-146,176,264);
    c.fillStyle=C.cream;c.fillRect(-66,-122,132,87);
    text(c,'Ticket',0,-77,30,C.black,'Space Grotesk',700,'center');
    circle(c,0,-6,15,C.red);c.fillStyle=C.black;c.fillRect(-51,34,102,13);
    if(t>e.ticket){c.fillStyle=C.cream;c.fillRect(-31,47,62,46*H.ease.out(prog(t,e.ticket,.25)));}
    c.fillStyle=C.black;c.fillRect(-105,118,210,17);
  }
  function ticket(c,t,e){
    c.fillStyle=C.yellow;c.fillRect(-187,-105,374,210);
    c.fillStyle=C.black;c.fillRect(-187,-105,374,50);
    text(c,t>=e.call?'Now calling':'Reception ticket',0,-80,30,C.cream,'Space Grotesk',700,'center');
    text(c,'G-001',0,13,88,C.black,'Space Grotesk',700,'center');
    c.fillStyle=C.black;for(let i=0;i<22;i++)c.fillRect(-137+i*13,72,(i%3)+2,15);
    const ring=prog(t,e.call,.37);if(ring>0){c.strokeStyle=C.red;c.lineWidth=11;c.beginPath();c.ellipse(0,4,220,142,-.045,-Math.PI/2,-Math.PI/2+Math.PI*2*ring);c.stroke();}
  }
  function desk(c){
    circle(c,47,-137,29,C.yellow);
    c.fillStyle=C.blue;c.beginPath();c.arc(47,-60,45,Math.PI,0);c.lineTo(92,-20);c.lineTo(2,-20);c.closePath();c.fill();
    c.fillStyle=C.red;c.fillRect(-165,-10,330,116);
    c.fillStyle=C.black;c.fillRect(-180,-30,360,20);
    c.fillStyle=C.blue;c.fillRect(-120,-116,103,72);
    c.fillStyle=C.black;c.fillRect(-76,-44,15,14);
    c.fillStyle=C.yellow;c.fillRect(-135,20,270,56);
  }
  window.film={
    draw(ctx,t,p,media){
      M.setScale(p.width/1280);const e=Object.assign({},...p.beats.map(b=>b.events));
      const pan=840*H.ease.inOut(prog(t,e.pan,.95));
      ctx.drawImage(M.exPaper(1280,720),0,0,1280,720);const c=M.plateCtx(1280,720);
      c.save();c.translate(-pan,0);
      // Continuous baseline and ruled construction sheet, drawn from the opening cue.
      c.fillStyle=C.black;c.fillRect(70,640,2050*H.ease.out(prog(t,e.hook,.65)),12);
      c.fillRect(70,254,7,386*H.ease.out(prog(t,e.hook,.65)));
      c.fillStyle=C.red;c.fillRect(70,244,2050,5);
      stamp(c,t,e.kiosk,465,442,()=>kiosk(c,t,e));
      if(pan<380)M.exTag(c,'Kiosk',465,612,prog(t,e.kiosk,.3),32);
      const walk=H.ease.inOut(prog(t,e.pan,.95));
      stamp(c,t,e.patient,228+pan+472*walk,434,()=>person(c,0,0));
      const ticketX=H.lerp(950,1070,H.ease.inOut(prog(t,e.pan,.95)));
      stamp(c,t,e.ticket,ticketX,440,()=>ticket(c,t,e),.32);
      M.exArrow(c,600,463,705,463,H.ease.out(prog(t,e.ticket,.3)),14,C.black);
      stamp(c,t,e.reception,1840,465,()=>desk(c),.3);
      if(pan>680)M.exTag(c,'Reception',1840,610,prog(t,e.reception,.3),34);
      M.exArrow(c,1310,583,1510,583,H.ease.out(prog(t,e.travel,.6)),14,C.red);
      c.restore();
      // Fixed editorial heading stays legible during the camera's travel along the sheet.
      c.fillStyle=C.black;c.fillRect(70,36,7,158*H.ease.out(prog(t,e.hook,.5)));
      const intro=H.ease.out(prog(t,e.hook,.4));
      c.save();c.translate(105,100-22*(1-intro));c.globalAlpha=intro;
      text(c,'kiosk to',0,0,64,C.black,'Syne',800);
      text(c,'reception',0,77,64,C.black,'Syne',800);c.restore();
      // Primary geometry establishes the poster's asymmetrical balance.
      circle(c,972,149,64*H.ease.back(prog(t,e.hook,.6)),C.red);
      c.fillStyle=C.blue;c.fillRect(1056,86,94*intro,126);
      c.fillStyle=C.yellow;c.beginPath();c.moveTo(1056,212);c.lineTo(1150,212);c.lineTo(1150,118);c.closePath();c.fill();
      // Original brand artwork stays outside the colour plate proxy to preserve its real colours.
      M.finish(ctx,1280,720,t);
      if(media.logo)ctx.drawImage(media.logo,970,27,38,44);
      ctx.fillStyle=C.black;ctx.font='700 28px "Space Grotesk"';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText('Smart Queue',1022,50);
    },
    scoreSound(k,p){
      const e=Object.assign({},...p.beats.map(b=>b.events)),s=M.soundKit(k);
      s.sort(e.hook+.08,.6,-.5);s.sort(e.hook+.22,.5,-.3);
      s.block(e.patient+.148,220,.6,-.55,true);s.block(e.kiosk+.148,260,.7,-.2,true);
      s.numb(e.ticket+.1184,.8,.45);k.play('paper',e.ticket,{gain:.25,minor:true});
      s.mar(e.call,'C5',.5,.4,false);s.mar(e.call+.12,'E5',.35,.4,true);
      k.noise(e.call,{dur:.37,color:'pink',filter:'bandpass',f:1100,gain:.07,minor:true});
      s.slide(e.pan,.95,.6,true);s.block(e.reception+.111,280,.55,.5,true);
    }
  };
})();
