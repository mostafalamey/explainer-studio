{
  const K = '#151515';
  const PAL = { pink: '#f9c3d2', mint: '#a9e5d0', lilac: '#cbb8f4', butter: '#fff0a6', cream: '#fff8ec', magenta: '#ff4f9b', blue: '#2b62ff', yellow: '#ffd02e', teal: '#00b2a0', red: '#ff5a3c' };

  // filled + outlined + hard drop shadow
  const solid = (c, path, fill, sh = 10, lw = 5) => {
    c.save(); c.translate(sh, sh); c.fillStyle = K; c.fill(path); c.restore();
    c.fillStyle = fill; c.fill(path); c.lineWidth = lw; c.strokeStyle = K; c.lineJoin = 'round'; c.stroke(path);
  };
  const squigglePath = (x, y, len, amp, waves, ang, ph = 0, frac = 1) => {
    const p = new Path2D(), ca = Math.cos(ang), sa = Math.sin(ang);
    for (let i = 0; i <= Math.round(80 * frac); i++) {
      const u = i / 80, lx = u * len, ly = Math.sin(u * waves * Math.PI * 2 + ph) * amp;
      const X = x + lx * ca - ly * sa, Y = y + lx * sa + ly * ca;
      i ? p.lineTo(X, Y) : p.moveTo(X, Y);
    }
    return p;
  };
  const zigzagPath = (x, y, len, amp, n, ang, frac = 1) => {
    const p = new Path2D(), ca = Math.cos(ang), sa = Math.sin(ang), f = frac * n;
    for (let i = 0; i <= Math.ceil(f); i++) { const ii = Math.min(i, f), i0 = Math.floor(ii), fr = ii - i0, ya = i0 % 2 ? -amp : amp, yb = (i0 + 1) % 2 ? -amp : amp; const lx = (ii / n) * len, ly = ya + (yb - ya) * fr; const X = x + lx * ca - ly * sa, Y = y + lx * sa + ly * ca; i ? p.lineTo(X, Y) : p.moveTo(X, Y); }
    return p;
  };
  const strokeOutlined = (c, path, col, w, ow = 4, sh = 8) => {
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.save(); c.translate(sh, sh); c.strokeStyle = K; c.lineWidth = w + ow * 2; c.stroke(path); c.restore();
    c.strokeStyle = K; c.lineWidth = w + ow * 2; c.stroke(path);
    c.strokeStyle = col; c.lineWidth = w; c.stroke(path);
  };
  const terrazzo = (c, path, seed, base = PAL.cream) => {
    c.save(); c.clip(path); c.fillStyle = base; c.fillRect(0, 0, 1280, 720);
    const r = H.rng(seed), cols = [PAL.magenta, PAL.blue, PAL.yellow, PAL.teal, K, PAL.pink, PAL.lilac, PAL.red];
    const bb = { x0: 0, y0: 0, x1: 1280, y1: 720 };
    for (let i = 0; i < 2400; i++) {
      const x = r.range(bb.x0, bb.x1), y = r.range(bb.y0, bb.y1);
      if (!c.isPointInPath(path, x*RES, y*RES)) continue;
      const s = r.range(3, 11) * (r() < 0.08 ? 2 : 1), n = r.int(3, 6), a0 = r.range(0, 7);
      c.fillStyle = r.pick(cols); c.beginPath();
      for (let k = 0; k < n; k++) { const a = a0 + (k / n) * Math.PI * 2 + r.range(-0.3, 0.3), rr = s * r.range(0.5, 1); k ? c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      c.closePath(); c.fill();
    }
    c.restore();
  };

  // ===================== EXPLAINER: "How does AI learn?" =====================
  // Memphis cut-out animation on twos: scenes change with a striped band that swipes across, arrows are fat
  // outlined shapes, counters are stickers that pop, emphasis is a spiky starburst.
  const roundRect = (x, y, w, h, r) => { const p = new Path2D(); p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r); p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); return p; };
  const bubble = (w, h, tail) => { // tail: [x, y] of the tip relative to centre
    const p = new Path2D(), r = 34, x = -w / 2, y = -h / 2;
    p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r);
    if (tail) { p.lineTo(tail[0] + 40, y + h); p.lineTo(tail[0], tail[1]); p.lineTo(tail[0] - 10, y + h); }
    p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); return p;
  };
  const burst = (n, r0, r1) => { const p = new Path2D(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, r = i % 2 ? r0 : r1; i ? p.lineTo(Math.cos(a) * r, Math.sin(a) * r) : p.moveTo(Math.cos(a) * r, Math.sin(a) * r); } p.closePath(); return p; };
  const fatArrow = (c, x0, y0, x1, y1, p, col, w = 22) => { // outlined chunky arrow with hard shadow
    if (p <= 0) return; const a = Math.atan2(y1 - y0, x1 - x0), l = Math.hypot(x1 - x0, y1 - y0) * p, hw = w * 1.3, hl = w * 1.6;
    const path = new Path2D(); path.moveTo(0, -w / 2); path.lineTo(Math.max(0, l - hl), -w / 2); path.lineTo(Math.max(0, l - hl), -hw); path.lineTo(l, 0); path.lineTo(Math.max(0, l - hl), hw); path.lineTo(Math.max(0, l - hl), w / 2); path.lineTo(0, w / 2); path.closePath();
    c.save(); c.translate(x0, y0); c.rotate(a); solid(c, path, col, 6, 4); c.restore();
  };
  const tag = (c, txt, x, y, col, size = 22, rot = 0, halo = 0) => { c.save(); c.translate(x, y); c.rotate(rot); c.font = `700 ${size}px "Fredoka"`; const w = c.measureText(txt).width + size; if (halo) { const hp = roundRect(-w / 2 - halo, -size * 0.75 - halo, w + halo * 2, size * 1.5 + halo * 2, size * 0.75 + halo); solid(c, hp, PAL.cream, 6, 3); } const p = roundRect(-w / 2, -size * 0.75, w, size * 1.5, size * 0.75); solid(c, p, col, 4, 3); c.fillStyle = K; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 0, 1); c.restore(); };
  const chunky = (c, txt, x, y, size, col, ls = -4) => { c.save(); c.font = `400 ${size}px "Rubik Mono One"`; c.letterSpacing = ls + 'px'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.fillStyle = K; c.fillText(txt, x + size * 0.07, y + size * 0.07); c.lineWidth = Math.max(4, size * 0.09); c.strokeStyle = K; c.strokeText(txt, x, y); c.fillStyle = col; c.fillText(txt, x, y); c.restore(); c.letterSpacing = '0px'; };
  // static per-scene ground: pastel split, bacterio dashes at hero strength, and a decor layer (terrazzo quarter-disc,
  // dot-grid card, confetti, a squiggle) kept to corners and edges that no story element uses. Built once per scene.
  const GROUNDS = {};let RES=1;
  const setScale=v=>{if(v!==RES){RES=v;for(const k of Object.keys(GROUNDS))delete GROUNDS[k];}};
  const confetti = (c, r, spots) => spots.forEach(([x, y], i) => {
    const s = r.range(10, 17), kind = i % 4, col = [PAL.magenta, PAL.blue, PAL.yellow, PAL.teal, PAL.red, K][(i * 5 + 1) % 6];
    c.save(); c.translate(x, y); c.rotate(r.range(0, 7)); const p = new Path2D();
    if (kind <= 1) { p.moveTo(0, -s); p.lineTo(s * 0.9, s * 0.6); p.lineTo(-s * 0.9, s * 0.6); p.closePath(); c.fillStyle = col; c.fill(p); c.lineWidth = 3; c.strokeStyle = K; c.stroke(p); }
    else if (kind === 2) { c.fillStyle = col; c.fillRect(-s * 0.9, -3.5, s * 1.8, 7); }
    else { c.beginPath(); c.arc(0, 0, s * 0.45, 0, 7); c.fillStyle = col; c.fill(); c.lineWidth = 3; c.strokeStyle = K; c.stroke(); }
    c.restore();
  });
  const dotCard = (c, x, y, w, h, col, rot = 0) => { c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(rot); const p = new Path2D(); p.rect(-w / 2, -h / 2, w, h); solid(c, p, col, 8, 4); c.save(); c.clip(p); c.fillStyle = K; for (let yy = -h / 2 + 14; yy < h / 2 - 6; yy += 16) for (let xx = -w / 2 + 14; xx < w / 2 - 6; xx += 16) { c.beginPath(); c.arc(xx, yy, 3, 0, 7); c.fill(); } c.restore(); c.restore(); };
  const quarter = (c, cx, cy, R, a0, seed) => { const p = new Path2D(); p.moveTo(cx, cy); p.arc(cx, cy, R, a0, a0 + Math.PI / 2); p.closePath(); c.save(); c.translate(10, 10); c.fillStyle = K; c.fill(p); c.restore(); terrazzo(c, p, seed); c.lineWidth = 5; c.strokeStyle = K; c.stroke(p); };
  const gridCard = (c, x, y, w, h, col, rot) => { c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(rot); const p = new Path2D(); p.rect(-w / 2, -h / 2, w, h); solid(c, p, col, 8, 4); c.save(); c.clip(p); c.strokeStyle = 'rgba(21,21,21,0.5)'; c.lineWidth = 2; for (let xx = -w / 2; xx < w / 2; xx += 24) { c.beginPath(); c.moveTo(xx, -h / 2); c.lineTo(xx, h / 2); c.stroke(); } for (let yy = -h / 2; yy < h / 2; yy += 24) { c.beginPath(); c.moveTo(-w / 2, yy); c.lineTo(w / 2, yy); c.stroke(); } c.restore(); c.lineWidth = 4; c.strokeStyle = K; c.stroke(p); c.restore(); };
  function sceneGround(scene, grounds, W, HH) {
    const key = scene + ':' + W + 'x' + HH;
    if (GROUNDS[key]) return GROUNDS[key];
    const L = H.layer(W*RES, HH*RES), c = L.getContext('2d');c.scale(RES,RES);
    c.fillStyle = grounds[0]; c.fillRect(0, 0, W, HH);
    c.fillStyle = grounds[1]; c.beginPath(); c.moveTo(860, 0); c.lineTo(W, 0); c.lineTo(W, HH); c.lineTo(600, HH); c.closePath(); c.fill();
    const rb = H.rng(3 + scene); c.fillStyle = 'rgba(21,21,21,0.55)';
    for (let i = 0; i < 260; i++) { const x = rb.range(0, W), y = rb.range(0, HH), a = rb.range(0, Math.PI); c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.ellipse(0, 0, rb.range(3, 7), 1.6, 0, 0, 7); c.fill(); c.restore(); }
    const r = H.rng(40 + scene);
    c.lineCap = 'round'; c.lineJoin = 'round';
    if (scene === 1) {
      quarter(c, 0, HH, 165, -Math.PI / 2, 21);
      dotCard(c, 1010, 638, 240, 62, PAL.butter, -0.02);
      strokeOutlined(c, squigglePath(430, 688, 230, 9, 3.5, -0.03), PAL.blue, 8, 3, 5);
      confetti(c, r, [[40, 170], [78, 300], [36, 430], [1240, 40], [1150, 70], [1250, 150], [470, 40], [600, 640], [1260, 400]]);
    } else if (scene === 2) {
      quarter(c, W, HH, 165, Math.PI, 22);
      dotCard(c, 1132, 22, 128, 84, PAL.pink, 0.04);
      strokeOutlined(c, squigglePath(620, 690, 240, 10, 3, -0.04), PAL.magenta, 8, 3, 5);
      c.strokeStyle = K; c.lineWidth = 6; c.stroke(zigzagPath(48, 200, 300, 10, 9, Math.PI / 2));
      confetti(c, r, [[40, 640], [110, 690], [380, 670], [900, 640], [880, 40], [1060, 40], [1250, 210], [1240, 300], [440, 40]]);
    } else if (scene === 3) {
      quarter(c, W, HH, 150, Math.PI, 23);
      gridCard(c, 430, 30, 230, 96, PAL.butter, -0.03);
      strokeOutlined(c, squigglePath(30, 680, 210, 9, 3, -0.03), PAL.teal, 8, 3, 5);
      confetti(c, r, [[720, 50], [780, 120], [1250, 60], [1180, 40], [40, 200], [60, 330], [850, 690], [700, 690]]);
    } else {
      quarter(c, W, 0, 160, Math.PI / 2, 24);
      dotCard(c, 560, 652, 240, 50, PAL.mint, 0.02);
      c.strokeStyle = K; c.lineWidth = 6; c.stroke(squigglePath(52, 190, 300, 12, 3, Math.PI / 2));
      confetti(c, r, [[860, 40], [960, 90], [1210, 260], [1240, 380], [1210, 520], [40, 60 + 560], [470, 690], [1240, 660], [760, 40]]);
    }
    GROUNDS[key] = L; return L;
  }


  function wipe(c,W,HH,u){if(u<=0||u>=1)return;
      const x = H.lerp(-2300, W + 900, u);
      c.save(); c.translate(x, HH / 2); c.rotate(-0.35);
      const band = new Path2D(); band.rect(0, -1400, 1700, 2800);
      c.save(); c.translate(14, 14); c.fillStyle = K; c.fill(band); c.restore();
      c.save(); c.clip(band); const cols = [PAL.magenta, PAL.yellow, PAL.blue, PAL.mint, PAL.red];
      for (let i = 0; i < 20; i++) { c.fillStyle = cols[i % cols.length]; c.fillRect(i * 85, -1400, 86, 2800); c.fillStyle = K; for (let y = -1400; y < 1400; y += 40) { c.beginPath(); c.arc(i * 85 + 42, y + (i % 2) * 20, 5, 0, 7); c.fill(); } }
      c.restore(); c.lineWidth = 6; c.strokeStyle = K; c.stroke(band); c.restore();

  }
  function soundKit(k){
      // rubbery sticker pop (kept low)
      const pop = (t, f, g, p, minor = true) => k.play('pop', t, { f, gain: g, pan: p, minor });
      // springy boing: quick upward bend that sags back
      const boing = (t, f, g, p, minor = true) => { k.tone(t, { f: [[0, f], [0.04, f * 2.4], [0.3, f * 1.3]], type: 'triangle', dur: 0.32, gain: 0.12 * g, a: 0.003, pan: p, minor }); k.tone(t, { f: [[0, f * 2], [0.05, f * 3.5], [0.2, f * 2.2]], dur: 0.2, gain: 0.03 * g, pan: p, minor }); };
      // bright 80s synth stab (detuned saws through a closing filter)
      const stab = (t, notes, g, p, minor) => notes.forEach((n, i) => { for (const det of [-10, 10])
        k.tone(t, { f: n, type: 'sawtooth', detune: det, dur: 0.28, gain: 0.03 * g, a: 0.004, hold: 0.05, filter: 'lowpass', f2: [[0, 2600], [0.25, 700]], q: 2, pan: p + (i - 1) * 0.15, verb: 0.2, minor }); });
      // the striped band: a fluttering zip as ~20 stripes rush past, left to right
      const zip = (b) => {
        const d = 0.85;
        k.tone(b + 0.1, { f: [[0, 160], [d - 0.15, 520]], type: 'sawtooth', dur: d - 0.1, gain: 0.04, a: 0.25, filter: 'lowpass', f2: 1200, q: 3 });
        for (let x = 0.08; x < d - 0.05; x += 1 / 28) { const e = Math.sin((x / d) * Math.PI);
          k.noise(b + x, { dur: 0.025, filter: 'bandpass', f: 800 + e * 700, q: 1.5, gain: 0.16 * e, a: 0.002, pan: (x / d - 0.5) * 1.4 }); }
      };
      // a cartoon hand clap
      const clap = (t, g, p) => [0, 0.012, 0.022].forEach((o) => k.noise(t + o, { dur: 0.05, filter: 'bandpass', f: 1300, q: 1.1, gain: 0.22 * g, a: 0.001, pan: p }));

    return {pop,boing,stab,zip,clap};}
  window.STYLE_PACKS=window.STYLE_PACKS||{};STYLE_PACKS['memphis-group']={K,PAL,solid,squigglePath,zigzagPath,strokeOutlined,terrazzo,roundRect,bubble,burst,fatArrow,tag,chunky,sceneGround,confetti,dotCard,quarter,gridCard,setScale,wipe,soundKit};
}
