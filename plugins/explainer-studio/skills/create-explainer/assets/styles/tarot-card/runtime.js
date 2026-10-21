{
  // ---------- ornate art-nouveau tarot card on velvet ----------
  const TAU = Math.PI * 2;
  const LINE = '#2a1c15';
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function gold(ctx, x0, y0, x1, y1, shift = 0) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    const s = (v) => H.clamp(v + shift, 0, 1);
    g.addColorStop(0, '#7a5a22'); g.addColorStop(s(0.25), '#c9a54e'); g.addColorStop(s(0.42), '#f3e3a0'); g.addColorStop(s(0.55), '#c39a44'); g.addColorStop(s(0.8), '#8d6a2a'); g.addColorStop(1, '#c4a050');
    return g;
  }
  function star(ctx, x, y, R, r, n = 4, rot = 0) {
    ctx.beginPath();
    for (let k = 0; k < n * 2; k++) { const a = rot + k * Math.PI / n - Math.PI / 2, q = k % 2 ? r : R; k ? ctx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : ctx.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
    ctx.closePath();
  }
  function crescent(ctx, x, y, R, off) {
    ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.arc(x + off, y - off * 0.3, R * 0.86, 0, TAU, true); ctx.closePath();
  }
  // thick outlined tube along a cubic (cable "hair")
  function cable(ctx, pts, w, col, gl) {
    const path = () => { ctx.beginPath(); ctx.moveTo(...pts[0]); for (let i = 1; i + 2 < pts.length + 0; i += 3) ctx.bezierCurveTo(...pts[i], ...pts[i + 1], ...pts[i + 2]); };
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    path(); ctx.strokeStyle = LINE; ctx.lineWidth = w + 4.4; ctx.stroke();
    path(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
    // flat highlight stripe
    ctx.save(); ctx.translate(-w * 0.18, -w * 0.18); path(); ctx.strokeStyle = 'rgba(255,240,210,0.22)'; ctx.lineWidth = w * 0.28; ctx.stroke(); ctx.restore();
    // gold bands
    ctx.lineCap = 'butt'; ctx.setLineDash([2.2, 46]); ctx.lineDashOffset = -12; path(); ctx.strokeStyle = LINE; ctx.lineWidth = w + 4.4; ctx.stroke(); ctx.setLineDash([2.2, 3, 2.2, 38.6]); ctx.lineDashOffset = -12; path(); ctx.strokeStyle = gl; ctx.lineWidth = w + 2; ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
  function cardBack(ctx, w, h, seed) {
    const r = H.rng(seed);
    ctx.save();
    rr(ctx, -w / 2, -h / 2, w, h, 16); ctx.fillStyle = '#1d2744'; ctx.fill();
    ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 16); ctx.clip();
    ctx.strokeStyle = gold(ctx, -w / 2, -h / 2, w / 2, h / 2); ctx.lineWidth = 3; rr(ctx, -w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 8); ctx.stroke();
    ctx.lineWidth = 1; rr(ctx, -w / 2 + 20, -h / 2 + 20, w - 40, h - 40, 6); ctx.stroke();
    ctx.fillStyle = '#b8954a';
    for (let y = -h / 2 + 40; y < h / 2 - 30; y += 34) for (let x = -w / 2 + 40 + ((y / 34) & 1) * 17; x < w / 2 - 30; x += 34) { star(ctx, x, y, 5, 1.6, 4); ctx.fill(); }
    ctx.beginPath(); ctx.arc(0, 0, 50, 0, TAU); ctx.fillStyle = '#1d2744'; ctx.fill(); ctx.strokeStyle = '#c4a050'; ctx.lineWidth = 2.5; ctx.stroke();
    star(ctx, 0, 0, 40, 10, 8); ctx.fillStyle = '#c4a050'; ctx.fill();
    ctx.restore(); ctx.restore();
  }

  // ===== EXPLAINER HELPERS =====
  let VELVET = null;
  function velvet(W, H_) {
    if (VELVET && VELVET.width===W && VELVET.height===H_) return VELVET;
    const nz = H.makeNoise(9), vw = 320, vh = 180, v = H.layer(vw, vh), vc = v.getContext('2d'), img = vc.createImageData(vw, vh), d = img.data;
    const dark = [18, 5, 14], mid = [74, 18, 44], hi = [150, 66, 98];
    for (let y = 0; y < vh; y++) for (let x = 0; x < vw; x++) {
      const X = x * 4, Y = y * 4, warp = nz.fbm2(X * 0.0018, Y * 0.0018, 3) * 2.4;
      const f = Math.sin(X * 0.0062 - Y * 0.0035 + warp) * 0.65 + Math.sin(X * 0.0024 + Y * 0.0078 + warp * 1.4) * 0.35;
      const ridge = Math.pow(1 - Math.abs(f), 1.6), mott = nz.fbm2(X * 0.02, Y * 0.02, 3), spot = Math.exp(-(((X - 640) / 700) ** 2 + ((Y - 360) / 460) ** 2));
      const b = H.clamp(0.1 + 0.55 * ridge * ridge * (0.5 + 0.5 * spot) + 0.14 * spot + 0.1 * mott);
      const c = b < 0.5 ? H.mix(dark, mid, b * 2) : H.mix(mid, hi, (b - 0.5) * 2);
      const i = (y * vw + x) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
    }
    vc.putImageData(img, 0, 0);
    const L = H.layer(W, H_), c = L.getContext('2d'); c.imageSmoothingQuality = 'high'; c.drawImage(v, 0, 0, W, H_); H.grain(c, W, H_, 0.07, 31, false);
    VELVET = L; return L;
  }
  const SKY = ['#2c3350', '#353a58', '#41405f', '#514765', '#62506a'];
  // the hero card's aging, built once at hero card proportions and stretched over each explainer face:
  // AGE = scuffs, foxing rings and worn edges (paper core showing, heavier at the corners); GRAIN = print tooth (overlay)
  let AGE = null, GRAIN = null;
  function ageLayers() {
    const scale=window.TAROT_SCALE||1;
    if (AGE && AGE.width===Math.ceil(400*scale)) return;
    const w = 400, h = 690, hw = w / 2, hh = h / 2, nz = H.makeNoise(9), sr = H.rng(4);
    AGE = H.layer(Math.ceil(w*scale), Math.ceil(h*scale)); const a = AGE.getContext('2d'); a.scale(scale,scale); a.translate(hw, hh);
    for (let k = 0; k < 6; k++) { const x = sr.range(-hw, hw), y = sr.range(-hh, hh), R = sr.range(12, 44); const g = a.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, 'rgba(150,110,60,0)'); g.addColorStop(0.85, 'rgba(150,105,55,0.13)'); g.addColorStop(1, 'rgba(150,105,55,0)'); a.fillStyle = g; a.beginPath(); a.arc(x, y, R, 0, TAU); a.fill(); }
    for (let k = 0; k < 22; k++) { const x = sr.range(-hw, hw), y = sr.range(-hh, hh), an = sr.range(0, TAU), l = sr.range(6, 30); a.strokeStyle = `rgba(245,236,214,${sr.range(0.15, 0.4)})`; a.lineWidth = sr.range(0.6, 1.3); a.beginPath(); a.moveTo(x, y); a.lineTo(x + Math.cos(an) * l, y + Math.sin(an) * l); a.stroke(); }
    for (let k = 0; k < 900; k++) {
      const u = k / 900, per = 2 * (w + h), d = u * per;
      let x, y;
      if (d < w) { x = -hw + d; y = -hh; } else if (d < w + h) { x = hw; y = -hh + d - w; } else if (d < 2 * w + h) { x = hw - (d - w - h); y = hh; } else { x = -hw; y = hh - (d - 2 * w - h); }
      const corner = Math.max(0, 1 - Math.min(Math.hypot(x - hw, y - hh), Math.hypot(x + hw, y - hh), Math.hypot(x - hw, y + hh), Math.hypot(x + hw, y + hh)) / 76);
      const wv = (0.5 + 0.5 * nz.n2(u * 90, 3)) * 3.2 + corner * 10 * (0.5 + 0.5 * nz.n2(u * 40, 7));
      if (wv < 1) continue;
      a.fillStyle = `rgba(246,238,220,${0.5 + corner * 0.4})`; a.beginPath(); a.arc(x, y, wv, 0, TAU); a.fill();
    }
    const pw=Math.ceil(w*scale),ph=Math.ceil(h*scale);
    GRAIN = H.layer(pw, ph); const g = GRAIN.getContext('2d'), img = g.createImageData(pw, ph), q = img.data, gr = H.rng(17);
    for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) { const i = (y * pw + x) * 4, n = 128 + (gr() - 0.5) * 30 + nz.n2(x / scale * 0.08, y / scale * 0.08) * 16; q[i] = n; q[i + 1] = n; q[i + 2] = n; q[i + 3] = 255; }
    g.putImageData(img, 0, 0);
  }
  const hashS = (str) => { let v = 7; for (const ch of str) v = (v * 31 + ch.charCodeAt(0)) | 0; return Math.abs(v); };
  // a full art-nouveau card face, centred at the origin
  function tFace(c, w, h, numeral, title, art, sheen = 0.4) {
    const hw = w / 2, hh = h / 2, s = w / 364;
    const G = (x0, y0, x1, y1) => gold(c, x0, y0, x1, y1, (sheen - 0.5) * 0.4);
    rr(c, -hw, -hh, w, h, 16 * s); c.fillStyle = '#eadcbc'; c.fill();
    c.save(); rr(c, -hw, -hh, w, h, 16 * s); c.clip();
    c.strokeStyle = LINE; c.lineWidth = 2 * s; rr(c, -hw + 9 * s, -hh + 9 * s, w - 18 * s, h - 18 * s, 9 * s); c.stroke();
    rr(c, -hw + 13 * s, -hh + 13 * s, w - 26 * s, h - 26 * s, 7 * s); c.fillStyle = '#4f6a63'; c.fill();
    c.strokeStyle = G(-hw, -hh, hw, hh); c.lineWidth = 2.4 * s; rr(c, -hw + 15 * s, -hh + 15 * s, w - 30 * s, h - 30 * s, 6 * s); c.stroke();
    c.fillStyle = G(-hw, -hh, hw, hh);
    for (let y = -hh + 50 * s; y < hh - 40 * s; y += 22 * s) [-hw + 21 * s, hw - 21 * s].forEach((x) => { c.beginPath(); c.moveTo(x, y - 5 * s); c.lineTo(x + 3 * s, y); c.lineTo(x, y + 5 * s); c.lineTo(x - 3 * s, y); c.closePath(); c.fill(); });
    // gold dot row along the top and bottom of the band, as on the hero card
    for (let x = -hw + 52 * s; x < hw - 44 * s; x += 22 * s) [-hh + 21 * s, hh - 21 * s].forEach((y) => { c.beginPath(); c.arc(x, y, 1.7 * s, 0, TAU); c.fill(); });
    rr(c, -hw + 28 * s, -hh + 28 * s, w - 56 * s, h - 56 * s, 4 * s); c.fillStyle = '#eadcbc'; c.fill(); c.strokeStyle = LINE; c.lineWidth = 1.8 * s; c.stroke();
    // art window with arch
    const AX = hw - 44 * s, AT = -hh + 92 * s, AB = hh - 92 * s;
    const win = () => { c.beginPath(); c.moveTo(-AX, AB); c.lineTo(-AX, AT + 30 * s); c.quadraticCurveTo(-AX, AT - 6 * s, -30 * s, AT); c.quadraticCurveTo(0, AT - 22 * s, 30 * s, AT); c.quadraticCurveTo(AX, AT - 6 * s, AX, AT + 30 * s); c.lineTo(AX, AB); c.closePath(); };
    c.save(); win(); c.clip(); SKY.forEach((col, i) => { c.fillStyle = col; c.fillRect(-AX, AT - 30 * s + i * (AB - AT + 30 * s) / 5, AX * 2, (AB - AT + 30 * s) / 5 + 1); });
    // the hero's sunburst: alternating wide/narrow wedges over the stepped sky, then scattered 4/8-point stars
    {
      const rcx = 0, rcy = (AT + AB) / 2 - 20 * s, RL = 520 * s;
      c.save(); c.globalAlpha = 0.55;
      for (let k = 0; k < 36; k++) { const a = k / 36 * TAU, ww = k % 2 ? 0.02 : 0.045; c.beginPath(); c.moveTo(rcx, rcy); c.lineTo(rcx + Math.cos(a - ww) * RL, rcy + Math.sin(a - ww) * RL); c.lineTo(rcx + Math.cos(a + ww) * RL, rcy + Math.sin(a + ww) * RL); c.closePath(); c.fillStyle = k % 2 ? '#7d6a55' : '#a78a52'; c.fill(); }
      c.restore();
      // the burst fades into a soft dark glow at its heart, so the card's emblem stands clear (the hero's halo does this)
      const hg = c.createRadialGradient(rcx, rcy, 0, rcx, rcy, 125 * s); hg.addColorStop(0, 'rgba(50,52,84,0.95)'); hg.addColorStop(0.55, 'rgba(56,56,88,0.75)'); hg.addColorStop(1, 'rgba(62,58,90,0)');
      c.fillStyle = hg; c.fillRect(rcx - 125 * s, rcy - 125 * s, 250 * s, 250 * s);
      const sr = H.rng(31 + hashS(numeral + title)); c.fillStyle = '#d9bd6a';
      for (let k = 0; k < 22; k++) { const x = sr.range(-AX + 8 * s, AX - 8 * s), y = sr.range(AT, AB - 20 * s), R = sr.range(3, 7) * s, eight = sr.chance(0.3); if (Math.hypot(x - rcx, y - rcy) < 120 * s) continue; star(c, x, y, R, 1.2 * s, eight ? 8 : 4); c.fill(); }
    }
    c.save(); c.translate(0, (AT + AB) / 2); art(c, AX * 2, AB - AT, s, G); c.restore(); c.restore();
    win(); c.strokeStyle = LINE; c.lineWidth = 2.4 * s; c.stroke();
    // numeral cartouche
    c.beginPath(); c.ellipse(0, -hh + 56 * s, 52 * s, 20 * s, 0, 0, TAU); c.fillStyle = '#eadcbc'; c.fill(); c.strokeStyle = LINE; c.lineWidth = 2 * s; c.stroke();
    c.beginPath(); c.ellipse(0, -hh + 56 * s, 47 * s, 15.5 * s, 0, 0, TAU); c.strokeStyle = G(-47 * s, -hh + 40 * s, 47 * s, -hh + 72 * s); c.lineWidth = 1.4 * s; c.stroke();
    // whiplash flourishes either side of the cartouche
    [-1, 1].forEach((sg) => { c.beginPath(); c.moveTo(sg * 58 * s, -hh + 60 * s); c.bezierCurveTo(sg * 80 * s, -hh + 74 * s, sg * 100 * s, -hh + 46 * s, sg * 118 * s, -hh + 60 * s); c.bezierCurveTo(sg * 128 * s, -hh + 68 * s, sg * 124 * s, -hh + 78 * s, sg * 114 * s, -hh + 74 * s); c.strokeStyle = LINE; c.lineWidth = 3.6 * s; c.stroke(); c.strokeStyle = '#c9a54e'; c.lineWidth = 1.6 * s; c.stroke(); });
    // corner celestial medallions
    [[-1, -1, 0], [1, -1, 1], [-1, 1, 2], [1, 1, 3]].forEach(([a, b, kind]) => {
      const x = a * (hw - 21 * s), y = b * (hh - 21 * s), R = 13 * s;
      c.beginPath(); c.arc(x, y, R, 0, TAU); c.fillStyle = '#2d3a52'; c.fill(); c.strokeStyle = G(x - R, y - R, x + R, y + R); c.lineWidth = 2.4 * s; c.stroke();
      c.fillStyle = '#d9bd6a';
      if (kind === 0) { c.beginPath(); c.arc(x, y, 4.5 * s, 0, TAU); c.fill(); }
      if (kind === 1) { crescent(c, x, y, 7 * s, 3.5 * s); c.fill(); }
      if (kind === 2) { star(c, x, y, 9 * s, 2.6 * s, 4); c.fill(); }
      if (kind === 3) { c.beginPath(); c.arc(x, y, 4 * s, 0, TAU); c.fill(); c.beginPath(); c.ellipse(x, y, 9 * s, 2.6 * s, -0.4, 0, TAU); c.strokeStyle = '#d9bd6a'; c.lineWidth = 1.2 * s; c.stroke(); }
    });
    c.fillStyle = LINE; c.font = `600 ${24 * s}px "Cormorant Garamond"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(numeral, 0, -hh + 57 * s);
    // name panel
    rr(c, -hw + 34 * s, hh - 82 * s, w - 68 * s, 46 * s, 5 * s); c.fillStyle = '#efe3c6'; c.fill(); c.strokeStyle = LINE; c.lineWidth = 2 * s; c.stroke();
    rr(c, -hw + 39 * s, hh - 77 * s, w - 78 * s, 36 * s, 3 * s); c.strokeStyle = G(-hw, hh - 80 * s, hw, hh); c.lineWidth = 1.3 * s; c.stroke();
    c.fillStyle = LINE; let fs = Math.max(28, 34 * s); c.font = `600 ${fs}px "Cormorant Garamond"`; while (c.measureText(title).width > w - 96 * s) { fs -= 1; c.font = `600 ${fs}px "Cormorant Garamond"`; }
    c.fillText(title, 0, hh - 58 * s);
    // age: yellowing + worn corners
    c.globalCompositeOperation = 'multiply';
    const yg = c.createRadialGradient(-hw * 0.2, -hh * 0.2, w * 0.3, 0, 0, Math.hypot(hw, hh)); yg.addColorStop(0, '#fff8e8'); yg.addColorStop(1, '#c8aa78');
    c.fillStyle = yg; c.fillRect(-hw, -hh, w, h); c.globalCompositeOperation = 'source-over';
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const g = c.createRadialGradient(a * hw, b * hh, 0, a * hw, b * hh, 14 * s); g.addColorStop(0, 'rgba(246,238,220,0.9)'); g.addColorStop(1, 'rgba(246,238,220,0)'); c.fillStyle = g; c.fillRect(a * hw - 14 * s, b * hh - 14 * s, 28 * s, 28 * s); });
    // scuffs, foxing and worn edges, then the print tooth
    ageLayers();
    c.drawImage(AGE, -hw, -hh, w, h);
    c.globalCompositeOperation = 'overlay'; c.globalAlpha = 0.55; c.drawImage(GRAIN, -hw, -hh, w, h); c.globalAlpha = 1;
    // glossy foil: a soft band of light slides across with the room's sheen
    c.globalCompositeOperation = 'lighter';
    const gx = H.lerp(-hw - 200 * s, hw + 200 * s, H.clamp((sheen + 0.2) / 1.2));
    const lg = c.createLinearGradient(gx - 80 * s, -hh * 0.4, gx + 80 * s, hh * 0.4); lg.addColorStop(0, 'rgba(255,240,200,0)'); lg.addColorStop(0.5, 'rgba(255,236,190,0.16)'); lg.addColorStop(1, 'rgba(255,240,200,0)');
    c.fillStyle = lg; c.fillRect(-hw, -hh, w, h);
    c.globalCompositeOperation = 'source-over';
    c.restore();
  }
  // card placed in the scene: position, rotation, flip (0 = back up, 1 = face up), lift
  function tCard(ctx, x, y, w, h, rot, flip, faceFn, lift = 0, seed = 7) {
    const fe = H.ease.inOut(H.clamp(flip)), sx = Math.max(0.02, Math.abs(Math.cos(fe * Math.PI))), up = Math.sin(fe * Math.PI) + lift;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.save(); ctx.filter = `blur(${10 + up * 12}px)`; ctx.fillStyle = `rgba(0,0,0,${0.62 - up * 0.2})`; ctx.scale(sx, 1); rr(ctx, -w / 2 + 8 + up * 24, -h / 2 + 14 + up * 26, w, h, 14); ctx.fill(); ctx.restore();
    ctx.scale(sx * (1 + up * 0.05), 1 + up * 0.05);
    if (fe < 0.5) cardBack(ctx, w, h, seed); else faceFn(ctx);
    ctx.restore();
  }
  function plaque(ctx, x, y, w, h, lines, sizes, sheen = 0.4) {
    ctx.save(); ctx.translate(x, y);
    ctx.save(); ctx.filter = 'blur(10px)'; ctx.fillStyle = 'rgba(0,0,0,0.6)'; rr(ctx, -w / 2 + 6, -h / 2 + 12, w, h, 12); ctx.fill(); ctx.restore();
    rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.fillStyle = '#1d2744'; ctx.fill();
    ctx.strokeStyle = gold(ctx, -w / 2, -h / 2, w / 2, h / 2, (sheen - 0.5) * 0.4); ctx.lineWidth = 3; rr(ctx, -w / 2 + 7, -h / 2 + 7, w - 14, h - 14, 8); ctx.stroke(); ctx.lineWidth = 1; rr(ctx, -w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 6); ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const tot = sizes.reduce((a, b) => a + b * 1.1, 0); let yy = -tot / 2;
    lines.forEach((l, i) => { const fs = sizes[i]; yy += fs * 0.55; ctx.font = `600 ${fs}px "Cormorant Garamond"`; ctx.fillStyle = gold(ctx, -w / 2, yy - fs / 2, w / 2, yy + fs / 2, (sheen - 0.5) * 0.4); ctx.fillText(l, 0, yy); yy += fs * 0.55; });
    ctx.restore();
  }
  // gold filigree arrow drawn on along a quadratic
  function gArrow(ctx, a, m, b, p, label) {
    if (p <= 0) return;
    const pts = []; const n = 40, k = Math.max(2, Math.round(n * Math.min(1, p)));
    for (let i = 0; i <= k; i++) { const t = i / n, u = 1 - t; pts.push([u * u * a[0] + 2 * u * t * m[0] + t * t * b[0], u * u * a[1] + 2 * u * t * m[1] + t * t * b[1]]); }
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const path = () => { ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); };
    path(); ctx.strokeStyle = LINE; ctx.lineWidth = 7; ctx.stroke(); path(); ctx.strokeStyle = gold(ctx, a[0], a[1], b[0], b[1]); ctx.lineWidth = 3.4; ctx.stroke();
    // little spiral flourishes along the shaft
    [0.3, 0.6].forEach((f) => { const i = Math.floor(f * n); if (i >= pts.length - 1) return; const q = pts[i]; ctx.beginPath(); ctx.arc(q[0], q[1] - 8, 6, Math.PI * 0.5, Math.PI * 2.2); ctx.strokeStyle = '#d9bd6a'; ctx.lineWidth = 1.8; ctx.stroke(); });
    if (p >= 1) { const q = pts[pts.length - 1], o = pts[pts.length - 3], an = Math.atan2(q[1] - o[1], q[0] - o[0]); ctx.beginPath(); ctx.moveTo(q[0] + Math.cos(an) * 10, q[1] + Math.sin(an) * 10); ctx.lineTo(q[0] + Math.cos(an + 2.5) * 16, q[1] + Math.sin(an + 2.5) * 16); ctx.lineTo(q[0] - Math.cos(an) * 4, q[1] - Math.sin(an) * 4); ctx.lineTo(q[0] + Math.cos(an - 2.5) * 16, q[1] + Math.sin(an - 2.5) * 16); ctx.closePath(); ctx.fillStyle = '#d9bd6a'; ctx.fill(); ctx.strokeStyle = LINE; ctx.lineWidth = 1.5; ctx.stroke(); }
    if (label && p > 0.6) { ctx.font = 'italic 600 28px "Cormorant Garamond"'; ctx.textAlign = 'center'; ctx.fillStyle = '#e8cf7a'; ctx.fillText(label, m[0], m[1] + (m[1] > a[1] ? 34 : -12)); }
    ctx.restore();
  }

  window.STYLE_PACKS=window.STYLE_PACKS||{};
  STYLE_PACKS['tarot-card']={rr,gold,star,crescent,cardBack,velvet,tFace,tCard,plaque,gArrow};
}
