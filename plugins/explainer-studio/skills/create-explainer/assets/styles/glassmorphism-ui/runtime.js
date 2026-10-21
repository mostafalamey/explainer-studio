{
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
  let NOISE = null;
  function noisePattern(ctx) {
    if (!NOISE) {
      NOISE = H.layer(160, 160);
      const nc = NOISE.getContext('2d'), id = nc.createImageData(160, 160), r = H.rng(99);
      for (let i = 0; i < id.data.length; i += 4) { const v = r() < 0.5 ? 0 : 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = r() * 60; }
      nc.putImageData(id, 0, 0);
    }
    return ctx.createPattern(NOISE, 'repeat');
  }
  // Frosted glass panel: shadow -> blurred backdrop (clipped) -> tint -> grain -> sheen -> 1px gradient border
  function glass(ctx, src, x, y, w, h, r, o = {}) {
    const tint = o.tint ?? 0.1;
    ctx.save();
    ctx.shadowColor = 'rgba(8,4,30,0.45)'; ctx.shadowBlur = o.shadow ?? 50; ctx.shadowOffsetY = (o.shadow ?? 50) * 0.4;
    ctx.fillStyle = 'rgba(20,10,50,1)'; rr(ctx, x, y, w, h, r); ctx.fill();
    ctx.restore();
    ctx.save(); rr(ctx, x, y, w, h, r); ctx.clip();
    { const M = ctx.getTransform(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(src, 0, 0, ctx.canvas.width, ctx.canvas.height); ctx.setTransform(M); }
    const tg = ctx.createLinearGradient(x, y, x + w * 0.6, y + h);
    tg.addColorStop(0, `rgba(255,255,255,${tint + 0.08})`); tg.addColorStop(1, `rgba(255,255,255,${tint * 0.5})`);
    ctx.fillStyle = tg; ctx.fillRect(x, y, w, h);
    { const A = ctx.globalAlpha; ctx.globalAlpha = A * 0.22; ctx.fillStyle = noisePattern(ctx); ctx.fillRect(x, y, w, h); ctx.globalAlpha = A; }
    // diagonal specular sheen
    const sg = ctx.createLinearGradient(x, y, x + w * 0.55, y + h * 0.55);
    sg.addColorStop(0, 'rgba(255,255,255,0.16)'); sg.addColorStop(0.45, 'rgba(255,255,255,0.04)'); sg.addColorStop(0.46, 'rgba(255,255,255,0.0)');
    ctx.fillStyle = sg; ctx.fillRect(x, y, w, h);
    ctx.restore();
    // 1px light border, brighter top-left
    ctx.save();
    const bg = ctx.createLinearGradient(x, y, x + w, y + h);
    bg.addColorStop(0, 'rgba(255,255,255,0.65)'); bg.addColorStop(0.35, 'rgba(255,255,255,0.18)'); bg.addColorStop(0.7, 'rgba(255,255,255,0.08)'); bg.addColorStop(1, 'rgba(255,255,255,0.32)');
    ctx.strokeStyle = bg; ctx.lineWidth = 1; rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r); ctx.stroke();
    // inner top highlight
    const hg = ctx.createLinearGradient(x, 0, x + w, 0);
    hg.addColorStop(0, 'rgba(255,255,255,0)'); hg.addColorStop(0.3, 'rgba(255,255,255,0.55)'); hg.addColorStop(0.7, 'rgba(255,255,255,0.15)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = hg; ctx.beginPath(); ctx.moveTo(x + r, y + 1.5); ctx.lineTo(x + w - r, y + 1.5); ctx.stroke();
    ctx.restore();
  }
  function blurOf(srcCanvas, W, Hh, px) {
    const L = H.layer(W, Hh), c = L.getContext('2d');
    c.filter = `blur(${px}px) saturate(150%)`;
    c.drawImage(srcCanvas, 0, 0, W, Hh);
    return L;
  }
  function orb(ctx, x, y, r, c1, c2, c3) {
    const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.45, r * 0.05, x, y, r);
    g.addColorStop(0, c1); g.addColorStop(0.55, c2); g.addColorStop(1, c3);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }

  // ================= EXPLAINER: the camera glides across one big frosted-glass dashboard; panels blur the live blobs behind them =================
  function chipPill(ctx, x, y, text, o = {}) {
    ctx.save(); ctx.font = o.font || '600 13px "Inter"';
    const w = ctx.measureText(text).width + (o.dot ? 40 : 26), h = o.h || 26, k = o.k ?? 1;
    ctx.globalAlpha *= Math.min(1, k * 1.5); ctx.translate(x, y); ctx.scale(0.85 + 0.15 * k, 0.85 + 0.15 * k);
    if (o.grad) { const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, o.grad[0]); g.addColorStop(1, o.grad[1]); ctx.fillStyle = g; ctx.shadowColor = o.glow || 'rgba(255,60,200,0.4)'; ctx.shadowBlur = 16; }
    else ctx.fillStyle = o.bg || 'rgba(255,255,255,0.16)';
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1, h / 2); ctx.stroke();
    if (o.dot) { ctx.fillStyle = o.dot; ctx.beginPath(); ctx.arc(-w / 2 + 14, 0, 4, 0, 7); ctx.fill(); }
    ctx.fillStyle = o.col || '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, o.dot ? 8 : 0, 1);
    ctx.restore();
  }
  function glowLine(ctx, a, c, b, prog, col1, col2, w = 3, dots = 0, t = 0) {
    if (prog <= 0) return null;
    const q = (u) => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
    const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]); g.addColorStop(0, col1); g.addColorStop(1, col2);
    ctx.save(); ctx.strokeStyle = g; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.shadowColor = col2; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); for (let i = 1; i <= 40; i++) { const p = q(prog * i / 40); ctx.lineTo(p[0], p[1]); } ctx.stroke();
    const e = q(prog), e0 = q(Math.max(0, prog - 0.03)), ang = Math.atan2(e[1] - e0[1], e[0] - e0[0]);
    ctx.translate(e[0], e[1]); ctx.rotate(ang); ctx.fillStyle = col2; ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-8, -7); ctx.lineTo(-5, 0); ctx.lineTo(-8, 7); ctx.closePath(); ctx.fill();
    ctx.restore();
    for (let i = 0; i < dots; i++) { const uu = ((t * 0.7 + i / dots) % 1) * prog; const p = q(uu); ctx.fillStyle = '#ffffff'; ctx.shadowColor = col2; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(p[0], p[1], 3.2, 0, 7); ctx.fill(); ctx.shadowBlur = 0; }
    return q;
  }

  function background(ctx,t,W=1280,H_=720){
    const scale=ctx.canvas.width/W, PW=ctx.canvas.width,PH=ctx.canvas.height;
    const BG=H.layer(PW,PH), b=BG.getContext('2d');b.scale(scale,scale);
    const base=b.createLinearGradient(0,0,W,H_);base.addColorStop(0,'#0c0a24');base.addColorStop(1,'#170f3a');b.fillStyle=base;b.fillRect(0,0,W,H_);
    const d=(p,a)=>Math.sin(t*.5+p)*a;
    const blob=(x,y,r,col,a)=>{const g=b.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,H.rgba(col,a));g.addColorStop(.5,H.rgba(col,a*.55));g.addColorStop(1,H.rgba(col,0));b.fillStyle=g;b.fillRect(x-r,y-r,r*2,r*2);};
    blob(930+d(0,30),230+d(1,20),330,'#ff2bd6',.95);
    blob(1180+d(2,20),600,300,'#ff7a1a',.95);
    blob(620,640+d(3,20),320,'#2b6bff',.9);
    blob(260+d(4,30),170,330,'#7a2bff',.85);
    blob(120,640,250,'#00d1ff',.6);blob(760,380,200,'#ff4d6d',.5);
    orb(b,1090+d(5,10),170,118,'#ffd2f4','#ff4fc1','#6a1497');
    orb(b,585,575+d(6,8),86,'#c7f2ff','#3aa0ff','#1a2a8a');
    orb(b,1215,520,46,'#ffe3b8','#ff8a2a','#9a2f12');
    b.save();b.translate(780,120);b.rotate(-.4);const rg=b.createLinearGradient(-90,0,90,0);rg.addColorStop(0,'#7af0ff');rg.addColorStop(1,'#8a5bff');b.strokeStyle=rg;b.lineWidth=22;b.beginPath();b.ellipse(0,0,92,40,0,0,7);b.stroke();b.restore();
    b.strokeStyle='rgba(255,255,255,0.035)';b.lineWidth=1;b.beginPath();
    for(let x=0;x<=W;x+=48){b.moveTo(x+.5,0);b.lineTo(x+.5,H_);}
    for(let y=0;y<=H_;y+=48){b.moveTo(0,y+.5);b.lineTo(W,y+.5);}b.stroke();
    b.globalAlpha=.05;b.fillStyle=noisePattern(b);b.fillRect(0,0,W,H_);b.globalAlpha=1;
    ctx.drawImage(BG,0,0,W,H_);
    return blurOf(BG,PW,PH,26*scale);
  }
  window.STYLE_PACKS=window.STYLE_PACKS||{};
  STYLE_PACKS['glassmorphism-ui']={rr,noisePattern,glass,blurOf,orb,chipPill,glowLine,background};
}
