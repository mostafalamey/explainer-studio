{
  const TAU = Math.PI * 2;

  const poly = (c, pts) => {
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.closePath();
  };
  // scissor-cut circle: slightly faceted, slightly wobbly
  const circPts = (r, cx, cy, R, seg = 15, jit = 0.6) => {
    const n = Math.max(18, Math.round((TAU * R) / seg)), a0 = r() * TAU, out = [];
    for (let i = 0; i < n; i++) {
      const a = a0 + ((i + r.range(-0.2, 0.2)) / n) * TAU, rr = R + r.gauss() * jit;
      out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    return out;
  };
  // scissor-cut edge following y=f(x): short straight-ish snips
  const ridge = (r, x0, x1, f, sMin = 12, sMax = 30, jit = 0.6) => {
    const out = [];
    let x = x0;
    while (x < x1) { out.push([x, f(x) + r.gauss() * jit]); x += r.range(sMin, sMax); }
    out.push([x1, f(x1)]);
    return out;
  };
  // straight cut between points with tiny wobbles
  const cutLines = (r, pts, seg = 22, jit = 0.7) => {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / seg));
      for (let k = 0; k < n; k++) {
        const u = k / n;
        out.push([ax + (bx - ax) * u + (k ? r.gauss() * jit : 0), ay + (by - ay) * u + (k ? r.gauss() * jit : 0)]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  };

  // tileable paper fibre texture (alpha-only light/dark flecks)
  const makeTex = (seed) => {
    const S = 512, cv = H.layer(S, S), x = cv.getContext('2d'), r = H.rng(seed), nz = H.makeNoise(seed + 1);
    // low-res tileable mottle
    const M = 64, mc = H.layer(M, M), mx = mc.getContext('2d'), mi = mx.createImageData(M, M), f = 5 / M;
    for (let j = 0; j < M; j++) for (let i = 0; i < M; i++) {
      const n = (a, b) => nz.fbm2(a * f, b * f, 3);
      const v = (n(i, j) * (M - i) * (M - j) + n(i - M, j) * i * (M - j) + n(i, j - M) * (M - i) * j + n(i - M, j - M) * i * j) / (M * M);
      const k = (j * M + i) * 4, a = Math.min(255, Math.abs(v) * 120);
      mi.data[k] = mi.data[k + 1] = mi.data[k + 2] = v > 0 ? 255 : 0; mi.data[k + 3] = a;
    }
    mx.putImageData(mi, 0, 0);
    x.imageSmoothingEnabled = true;
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) x.drawImage(mc, ox * S, oy * S, S, S);
    // fine grain
    const g = x.getImageData(0, 0, S, S), d = g.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = r() - 0.5;
      if (r() < 0.5) continue;
      const a = Math.abs(n) * 60;
      // blend fleck over mottle
      const c = n > 0 ? 255 : 0, aa = a / 255, oa = d[i + 3] / 255, na = aa + oa * (1 - aa);
      if (na > 0) {
        d[i] = (c * aa + d[i] * oa * (1 - aa)) / na; d[i + 1] = d[i]; d[i + 2] = d[i];
        d[i + 3] = na * 255;
      }
    }
    x.putImageData(g, 0, 0);
    // fibres
    x.lineCap = 'round';
    for (let n = 0; n < 1100; n++) {
      const px = r() * S, py = r() * S, len = r.range(4, 22), a = r() * TAU, bend = r.range(-5, 5);
      const light = r() < 0.55;
      x.strokeStyle = light ? `rgba(255,255,255,${r.range(0.08, 0.22)})` : `rgba(0,0,0,${r.range(0.05, 0.14)})`;
      x.lineWidth = r.range(0.4, 1.1);
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        const sx = px + ox * S, sy = py + oy * S;
        if (sx < -30 || sx > S + 30 || sy < -30 || sy > S + 30) continue;
        x.beginPath(); x.moveTo(sx, sy);
        x.quadraticCurveTo(sx + Math.cos(a) * len * 0.5 - Math.sin(a) * bend, sy + Math.sin(a) * len * 0.5 + Math.cos(a) * bend, sx + Math.cos(a) * len, sy + Math.sin(a) * len);
        x.stroke();
      }
    }
    return cv;
  };

  // =====================================================================
  // EXPLAINER: "How does AI learn?" told as one long paper diorama that
  // the camera pans along (parallax), with paper sprites cached once.
  // =====================================================================
  const PK = {};
  const resolution = () => window.PAPER_SCALE || 1;
  const lw = img => img.paperWidth || img.width;
  const lh = img => img.paperHeight || img.height;
  const pkTex = () => PK.tex || (PK.tex = makeTex(77));
  const paperize = (w, h, paint, o = {}) => {
    const L = H.layer(Math.ceil(w*resolution()), Math.ceil(h*resolution())), c = L.getContext('2d');L.paperWidth=w;L.paperHeight=h;c.scale(resolution(),resolution());
    paint(c);
    const r = H.rng(o.seed || 7);
    const pat = c.createPattern(pkTex(), 'repeat');
    pat.setTransform(new DOMMatrix().translateSelf(r() * 512, r() * 512).rotateSelf(r.range(-30, 30)));
    c.save(); c.globalCompositeOperation = 'source-atop'; c.globalAlpha = o.tex ?? 1; c.fillStyle = pat; c.fillRect(0, 0, w, h); c.restore();
    const edge = (col, dx, dy) => {
      const T = H.layer(L.width, L.height), tc = T.getContext('2d');tc.scale(resolution(),resolution());
      tc.drawImage(L, 0, 0, w, h); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = col; tc.fillRect(0, 0, w, h);
      tc.globalCompositeOperation = 'destination-out'; tc.drawImage(L, dx, dy, w, h);
      c.save(); c.globalCompositeOperation = 'source-atop'; c.drawImage(T, 0, 0, w, h); c.restore();
    };
    if (o.rim !== false) { edge(`rgba(255,247,232,${o.hi ?? 0.38})`, 1.3, 1.6); edge(`rgba(0,0,0,${o.lo ?? 0.28})`, -1.1, -1.3); }
    return L;
  };
  const shadowDraw = (ctx, img, x, y, d = 1, sa = 0.5) => {
    ctx.save();
    if (d > 0) {
      ctx.shadowColor = `rgba(14,10,30,${sa})`; ctx.shadowBlur = (6 + d * 7)*resolution(); ctx.shadowOffsetX = (1.5 + d * 2.4)*resolution(); ctx.shadowOffsetY = (2 + d * 3.6)*resolution();
      ctx.drawImage(img, x, y, lw(img), lh(img));
      ctx.shadowColor = 'rgba(10,6,20,0.38)'; ctx.shadowBlur = 2.5*resolution(); ctx.shadowOffsetX = 0.8*resolution(); ctx.shadowOffsetY = 1.4*resolution();
    }
    ctx.drawImage(img, x, y, lw(img), lh(img)); ctx.restore();
  };
  const put = (ctx, spr, cx, cy, o = {}) => {
    ctx.save(); ctx.translate(cx, cy);
    if (o.rot) ctx.rotate(o.rot);
    if (o.sx != null || o.s != null) ctx.scale(o.sx ?? o.s ?? 1, o.sy ?? o.s ?? 1);
    if (o.a != null) ctx.globalAlpha = o.a;
    shadowDraw(ctx, spr, -lw(spr) / 2, -lh(spr) / 2, o.d ?? 1, o.sa ?? 0.5);
    ctx.restore();
  };
  const compose = (w, h, layers) => {
    const C = H.layer(Math.ceil(w*resolution()), Math.ceil(h*resolution())), c = C.getContext('2d');C.paperWidth=w;C.paperHeight=h;c.scale(resolution(),resolution());
    layers.forEach(([paint, d, o], i) => shadowDraw(c, paperize(w, h, paint, { seed: 30 + i * 7, ...(o || {}) }), 0, 0, d, 0.4));
    return C;
  };
  const cache = (k, f) => {const key=resolution()+':'+k;return PK[key] || (PK[key]=f());};
  const AF = (px) => `400 ${px}px "Archivo Black"`;
  const measure = (str, font) => { const c = H.layer(4, 4).getContext('2d'); c.font = font; return c.measureText(str).width; };
  // cut letters (or a word) on a cut-around backing
  const wordSpr = (str, px, col, back = '#f3ecdc', bw = 18) => cache('w' + str + px + col + back, () => {
    const font = AF(px), tw = measure(str, font), w = tw + bw * 2 + 16, h = px * 1.35 + bw * 2;
    const by = h / 2 + px * 0.36;
    const layers = [];
    if (back) layers.push([(c) => { c.font = font; c.lineJoin = 'round'; c.lineWidth = bw * 1.6; c.strokeStyle = back; c.fillStyle = back; c.strokeText(str, bw + 8, by); c.fillText(str, bw + 8, by); }, 0]);
    layers.push([(c) => { c.font = font; c.fillStyle = col; c.fillText(str, bw + 8, by); }, back ? 0.45 : 0]);
    return compose(w, h, layers);
  });
  const blobPath = (c, parts) => { c.beginPath(); parts.forEach((p) => poly(c, p)); };
  // little cut-paper picture cards with a tag that names them
  const cardSpr = (kind) => cache('card' + kind, () => {
    const r = H.rng(kind === 'cat' ? 11 : 12);
    const cat = kind === 'cat';
    return compose(140, 176, [
      [(c) => { c.fillStyle = '#f3ecdc'; c.beginPath(); poly(c, cutLines(r, [[8, 8], [132, 8], [132, 168], [8, 168], [8, 8]], 20, 0.5)); c.fill(); }, 0],
      [(c) => { c.fillStyle = cat ? '#86bccd' : '#e8c56b'; c.fillRect(20, 20, 100, 94); }, 0.3],
      [(c) => {
        c.fillStyle = cat ? '#e8874c' : '#6e4428';
        c.beginPath();
        if (cat) { poly(c, [[44, 58], [50, 26], [66, 48]]); poly(c, [[96, 58], [90, 26], [74, 48]]); }
        else { c.ellipse(42, 66, 11, 24, 0.3, 0, TAU); c.ellipse(98, 66, 11, 24, -0.3, 0, TAU); }
        c.fill();
      }, 0.3],
      [(c) => { c.fillStyle = cat ? '#f09a5c' : '#b07a4c'; c.beginPath(); poly(c, circPts(r, 70, 70, 29, 10, 0.5)); c.fill(); }, 0.45],
      [(c) => {
        c.fillStyle = cat ? '#fbe3c8' : '#f3dfc2'; c.beginPath(); c.ellipse(70, 84, cat ? 13 : 16, cat ? 9 : 12, 0, 0, TAU); c.fill();
        c.fillStyle = '#2b2033'; c.beginPath(); c.arc(59, 64, 4, 0, TAU); c.arc(81, 64, 4, 0, TAU); c.fill();
        c.fillStyle = cat ? '#e0607a' : '#2b2033'; c.beginPath(); c.ellipse(70, 79, cat ? 4 : 6, cat ? 3 : 4.5, 0, 0, TAU); c.fill();
      }, 0.25],
      [(c) => { c.fillStyle = '#fbf6ea'; c.beginPath(); poly(c, [[30, 128], [100, 128], [114, 145], [100, 162], [30, 162]]); c.fill(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(103, 145, 4, 0, TAU); c.fill(); }, 0.55],
      [(c) => { c.font = AF(24); c.fillStyle = cat ? '#d9473b' : '#2f7f86'; c.fillText(kind, 38, 154); }, 0.12],
    ]);
  });
  const brainSpr = () => cache('brain', () => {
    const r = H.rng(21), parts = [], inner = [];
    [[-90, 10, 58], [-50, -50, 62], [15, -68, 64], [80, -40, 58], [104, 22, 50], [50, 50, 60], [-30, 52, 62], [-10, 0, 70]].forEach(([x, y, rr]) => parts.push(circPts(r, 160 + x, 128 + y, rr, 12, 0.6)));
    [[-60, -10, 26], [-20, -40, 24], [30, -30, 26], [70, 0, 22], [20, 25, 24], [-30, 30, 22]].forEach(([x, y, rr]) => inner.push(circPts(r, 160 + x, 128 + y, rr, 10, 0.5)));
    return compose(330, 260, [
      [(c) => { c.fillStyle = '#e8839a'; blobPath(c, parts); c.fill(); }, 0],
      [(c) => { c.strokeStyle = '#f3a7b6'; c.lineWidth = 13; c.lineCap = 'round'; c.lineJoin = 'round';
        [[[70, 120], [95, 80], [130, 95], [120, 60]], [[70, 170], [110, 150], [100, 120]], [[195, 60], [230, 80], [210, 110], [245, 130]], [[190, 180], [225, 150], [255, 175]], [[115, 205], [140, 180]], [[205, 210], [240, 200]]].forEach((ln) => { c.beginPath(); ln.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); });
      }, 0.35],
      [(c) => { c.fillStyle = '#c95f7a'; c.fillRect(156, 52, 8, 150); }, 0.2],
    ]);
  });
  const panelSpr = () => cache('panel', () => compose(300, 96, [
    [(c) => { c.fillStyle = '#2f7f86'; c.beginPath(); poly(c, cutLines(H.rng(4), [[6, 6], [294, 6], [294, 90], [6, 90], [6, 6]], 24, 0.5)); c.fill(); }, 0],
    [(c) => { c.fillStyle = '#f3ecdc'; [70, 150, 230].forEach((x) => { c.beginPath(); poly(c, circPts(H.rng(x), x, 48, 28, 10, 0.4)); c.fill(); }); }, 0.45],
  ]));
  const pointerSpr = () => cache('ptr', () => paperize(16, 56, (c) => { c.fillStyle = '#d9473b'; c.beginPath(); poly(c, [[8, 2], [14, 30], [10, 54], [6, 54], [2, 30]]); c.fill(); }, { seed: 5 }));
  const bubbleSpr = (txt) => cache('bub' + txt, () => {
    const r = H.rng(txt.length + 3);
    return compose(230, 150, [
      [(c) => { c.fillStyle = '#fbf6ea'; c.beginPath(); c.ellipse(118, 64, 100, 54, 0, 0, TAU); c.moveTo(40, 92); c.lineTo(18, 140); c.lineTo(78, 112); c.fill(); }, 0],
      [(c) => { c.font = AF(46); c.fillStyle = txt === 'cat' ? '#2f7f86' : '#2b2d5a'; const w = measure(txt, AF(46)); c.fillText(txt, 118 - w / 2, 82); }, 0.35],
    ]);
  });
  const crossSpr = () => cache('x', () => paperize(110, 110, (c) => { c.fillStyle = '#d9473b'; c.save(); c.translate(55, 55); c.rotate(0.785); c.fillRect(-48, -11, 96, 22); c.fillRect(-11, -48, 22, 96); c.restore(); }, { seed: 9 }));
  const checkSpr = () => cache('ok', () => paperize(120, 110, (c) => { c.fillStyle = '#5fae6a'; c.beginPath(); poly(c, [[8, 58], [26, 40], [46, 62], [96, 10], [114, 28], [46, 98]]); c.fill(); }, { seed: 10 }));
  const ringSpr = () => cache('ring', () => paperize(300, 230, (c) => { c.fillStyle = '#f2b545'; c.beginPath(); c.ellipse(150, 115, 145, 110, 0, 0, TAU); c.ellipse(150, 115, 125, 92, 0, 0, TAU); c.fill('evenodd'); }, { seed: 12 }));
  const burstSpr = () => cache('burst', () => paperize(340, 340, (c) => { c.fillStyle = '#f2b545'; c.beginPath(); for (let i = 0; i < 32; i++) { const a = (i / 32) * TAU, rr = i % 2 ? 100 : 168; const x = 170 + Math.cos(a) * rr, y = 170 + Math.sin(a) * rr; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); c.fill(); }, { seed: 13 }));
  const digitSpr = (ch, px, col) => wordSpr(ch, px, col, '#f3ecdc', 10);
  // cut-paper arrow (strip + head) revealed along a quadratic path
  const arrow = (ctx, ax, ay, cx, cy, bx, by, p, col, seed) => {
    if (p <= 0) return;
    const pts = [];
    for (let i = 0; i <= 40 * p; i++) { const u = i / 40; pts.push([(1 - u) * (1 - u) * ax + 2 * u * (1 - u) * cx + u * u * bx, (1 - u) * (1 - u) * ay + 2 * u * (1 - u) * cy + u * u * by]); }
    if (pts.length < 2) return;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
    x0 -= 34; y0 -= 34; x1 += 34; y1 += 34;
    const [ex, ey] = pts[pts.length - 1], [px, py] = pts[pts.length - 2], a = Math.atan2(ey - py, ex - px);
    const L = paperize(x1 - x0, y1 - y0, (c) => {
      c.translate(-x0, -y0); c.strokeStyle = col; c.lineWidth = 13; c.lineCap = 'butt'; c.lineJoin = 'round';
      c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x - Math.cos(a) * 12 * (i === pts.length - 1), y - Math.sin(a) * 12 * (i === pts.length - 1)) : c.moveTo(x, y))); c.stroke();
      c.fillStyle = col; c.beginPath(); c.moveTo(ex + Math.cos(a) * 14, ey + Math.sin(a) * 14);
      c.lineTo(ex + Math.cos(a + 2.5) * 22, ey + Math.sin(a + 2.5) * 22); c.lineTo(ex + Math.cos(a - 2.5) * 22, ey + Math.sin(a - 2.5) * 22); c.fill();
    }, { seed });
    shadowDraw(ctx, L, x0, y0, 0.6);
  };
  const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const numberRow = (ctx, str, x, y, px, col, o = {}) => {
    let cx = x;
    for (const ch of str) {
      const s = digitSpr(ch, px, col), w = lw(s) - 22;
      const jr = H.rng(ch.charCodeAt(0) * 13 + Math.round(cx));
      put(ctx, s, cx + w / 2, y, { rot: (jr() - 0.5) * 0.08, d: o.d ?? 0.7 });
      cx += w - 2;
    }
    return cx;
  };
  // drop-in animation helper (paper falls on, overshoots, settles; shadow is lifted while in the air)
  const dropIn = (t, st, du = 0.4, dist = 60) => {
    const u = H.clamp((t - st) / du);
    if (u <= 0) return null;
    const e = H.ease.back(u), lift = 1 - H.ease.out(u);
    return { dy: -(1 - e) * dist, s: 1 + lift * 0.08, d: lift * 3, a: H.clamp(u * 4) };
  };


window.STYLE_PACKS=window.STYLE_PACKS||{};window.STYLE_PACKS["cut-paper-diorama"]={poly,circPts,ridge,cutLines,makeTex,paperize,shadowDraw,put,compose,cache,wordSpr,numberRow,arrow,dropIn,burstSpr,ringSpr,lw,lh};
}
