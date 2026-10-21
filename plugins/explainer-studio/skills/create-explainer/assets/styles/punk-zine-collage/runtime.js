{
  const TAU = Math.PI * 2;
  const SPOT = [255, 47, 109]; // fluoro pink, the one spot ink

  const RANSOM_FONTS = [
    '400 S "Anton"', '400 S "Abril Fatface"', '400 S "Bebas Neue"', '400 S "Archivo Black"', '800 S "Playfair Display"',
    'italic 400 S "Playfair Display"', '400 S "Special Elite"', '400 S "Courier Prime"', '400 S "UnifrakturMaguntia"',
    '400 S "Rubik Mono One"', '400 S "Shrikhand"', '400 S "DM Serif Display"', '700 S "Oswald"', '400 S "Black Ops One"',
    '900 S "Fraunces"', '800 S "Inter"', '400 S "Limelight"',
  ];

  // rectangle -> polygon with torn (noisy) or scissor-cut edges
  const scrapPoly = (r, nz, cx, cy, w, h, rot, torn = [1, 1, 1, 1], amp = 4) => {
    const c = Math.cos(rot), s = Math.sin(rot);
    const corners = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
    const out = [];
    const seed = r() * 100;
    for (let e = 0; e < 4; e++) {
      const [ax, ay] = corners[e], [bx, by] = corners[(e + 1) % 4];
      const len = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / len, ny = (bx - ax) / len;
      const step = torn[e] ? 3 : 18;
      for (let d = 0; d < len; d += step) {
        const u = d / len;
        let off = 0;
        if (torn[e]) off = nz.fbm2(seed + e * 10 + d * 0.035, seed, 4) * amp * 2.2 + (r() - 0.5) * 1.6;
        else off = (r() - 0.5) * 1.2 + (d === 0 ? 0 : 0);
        const px = ax + (bx - ax) * u + nx * off, py = ay + (by - ay) * u + ny * off;
        out.push([cx + px * c - py * s, cy + px * s + py * c]);
      }
    }
    return out;
  };
  const pathPoly = (c, p) => { c.beginPath(); c.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) c.lineTo(p[i][0], p[i][1]); c.closePath(); };

  // masking tape (drawn after the copier crush so it stays translucent grey); knocks the spot plate back a little
  const maskTape = (b, sp, r, nz, cx, cy, w, h, rot) => {
    const p = scrapPoly(r, nz, cx, cy, w, h, rot, [0, 1, 0, 1], 2.2);
    b.save(); b.translate(2, 2); pathPoly(b, p); b.strokeStyle = 'rgba(0,0,0,0.5)'; b.lineWidth = 1.5; b.stroke(); b.restore();
    b.save(); pathPoly(b, p); b.fillStyle = 'rgba(120,116,105,0.42)'; b.fill(); b.clip();
    const tr = H.rng(Math.round(cx * 7 + cy));
    { // fibre speckle, batched into one light and one dark path
      const lt = new Path2D(), dk = new Path2D();
      for (let i = 0; i < 900; i++) { const pth = tr() < 0.5 ? lt : dk; pth.rect(cx - w / 1.4 + tr() * w * 1.4, cy - w / 1.4 + tr() * w * 1.4, 1.2, 1.2); }
      b.fillStyle = 'rgba(255,255,255,0.35)'; b.fill(lt); b.fillStyle = 'rgba(0,0,0,0.35)'; b.fill(dk);
    }
    for (let i = 0; i < 14; i++) { b.fillStyle = `rgba(255,255,255,${tr.range(0.05, 0.12)})`; b.save(); b.translate(cx, cy); b.rotate(rot); b.fillRect(-w, -h / 2 + tr() * h, w * 2, tr.range(1, 3)); b.restore(); }
    b.restore();
    sp.save(); sp.globalAlpha = 0.35; sp.globalCompositeOperation = 'destination-out'; pathPoly(sp, p); sp.fill(); sp.restore();
    return p;
  };

  // halftone render of a greyscale function g(u,v)->0..1 (1=white)
  const halftone = (w, h, cell, ang, g) => {
    const cv = H.layer(w, h), x = cv.getContext('2d'), img = x.createImageData(w, h), d = img.data;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
      const rx = px * ca + py * sa, ry = -px * sa + py * ca;
      const gx = (Math.floor(rx / cell) + 0.5) * cell, gy = (Math.floor(ry / cell) + 0.5) * cell;
      const dist = Math.hypot(rx - gx, ry - gy);
      const D = 1 - g(px / w, py / h);
      const rad = cell * 0.74 * Math.sqrt(Math.max(0, D));
      const ink = H.clamp(rad - dist + 0.5);
      const k = (py * w + px) * 4, v = 255 * (1 - ink);
      d[k] = d[k + 1] = d[k + 2] = v; d[k + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    return cv;
  };

  // =====================================================================
  // EXPLAINER: each beat is a new photocopied sheet slapped down over the
  // last (stop-motion at 8 fps). Arrows are marker, labels are typed strips
  // or ransom letters, numbers are re-cut ransom digits.
  // =====================================================================
  const ZC = {};
  // coarse 45-degree halftone screen (light dots) used to make solid fills read as printed matter
  const barScreen = (c) => {
    if (!ZC.scr) { const cv = H.layer(10, 10), x = cv.getContext('2d'); x.fillStyle = '#fff'; x.beginPath(); x.arc(5, 5, 1.45, 0, TAU); x.fill(); x.beginPath(); [[0, 0], [10, 0], [0, 10], [10, 10]].forEach(([a, bb]) => { x.moveTo(a + 1.45, bb); x.arc(a, bb, 1.45, 0, TAU); }); x.fill(); ZC.scr = cv; }
    return c.createPattern(ZC.scr, 'repeat'); // centre + corner dots = a 45-degree screen
  };
  const render = (ctx, W, H_, t, paint) => {
    const scale=ctx.canvas.width/W, logicalW=W, logicalH=H_;
    const PW=Math.round(W*scale),PH=Math.round(H_*scale);
    if(ZC.lastFrame===Math.floor(t*8)&&ZC.lastWidth===PW){ctx.drawImage(ZC.final,0,0,W,H_);return;}
    const nz = ZC.nz || (ZC.nz = H.makeNoise(13));
    const ts = Math.floor(t * 8) / 8, fr = Math.floor(t * 8), jr = H.rng(1000 + fr);
    const BW = ZC.BW && ZC.BW.width===PW ? ZC.BW : (ZC.BW=H.layer(PW,PH)), SPL = ZC.SPL && ZC.SPL.width===PW ? ZC.SPL : (ZC.SPL=H.layer(PW,PH));
    const b = BW.getContext('2d'), sp = SPL.getContext('2d');
    b.setTransform(1, 0, 0, 1, 0, 0); sp.setTransform(1, 0, 0, 1, 0, 0);
    sp.clearRect(0, 0, PW, PH);b.scale(scale,scale);sp.scale(scale,scale);
    const spotCol = H.rgba(SPOT, 1);
    const stepIn = (st) => ts + 1e-6 >= st;
    const prog = (a, d) => H.clamp((ts - a) / d);
    const occlude = (poly) => { sp.save(); sp.globalCompositeOperation = 'destination-out'; pathPoly(sp, poly); sp.fill(); sp.restore(); };
    // masking tape is laid on after the copier pass (like the still); a piece is dropped if a later scrap covers it
    const tapes = [];
    const pip = (x, y, P) => { let ins = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const xi = P[i][0], yi = P[i][1], xj = P[j][0], yj = P[j][1]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins; } return ins; };
    const cull = (poly) => {
      if (!tapes.length) return;
      const m = b.getTransform(), P = poly.map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
      for (let i = tapes.length - 1; i >= 0; i--) if (pip(tapes[i].dx, tapes[i].dy, P)) tapes.splice(i, 1);
    };
    const tape = (cx, cy, w, rot, seed, h = 30) => { const m = b.getTransform(); tapes.push({ m, cx, cy, w, h, rot, seed, dx: m.a * cx + m.c * cy + m.e, dy: m.b * cx + m.d * cy + m.f }); };
    const shadowP = (poly, dx = 2.5, dy = 2, a = 0.7) => { cull(poly); b.save(); b.translate(dx, dy); pathPoly(b, poly); b.fillStyle = `rgba(0,0,0,${a})`; b.fill(); b.restore(); };
    const both = (f) => { f(b); f(sp); };
    const slap = (st, cx, cy) => { const first = ts - st < 0.12, s1 = first ? 1.08 : 1, k = first ? 0.04 : 0; both((c) => { c.save(); c.translate(cx, cy); c.rotate(k); c.scale(s1, s1); c.translate(-cx, -cy); }); };
    const unslap = () => both((c) => c.restore());
    const scrap = (seed, cx, cy, w, h, rot, torn, fill) => { const r = H.rng(seed); const p = scrapPoly(r, nz, cx, cy, w, h, rot, torn, 4); shadowP(p); occlude(p); b.save(); pathPoly(b, p); b.fillStyle = fill || '#f4f2ec'; b.fill(); b.strokeStyle = 'rgba(0,0,0,0.75)'; b.lineWidth = 1.6; b.stroke(); b.restore(); return p; };
    const typed = (str, x, y, px = 26, rot = 0, seed = 1) => {
      b.save(); b.font = `400 ${px}px "Special Elite"`; const w = b.measureText(str).width; b.restore();
      const p = scrap(seed, x + w / 2 + 10, y - px * 0.3, w + 26, px * 1.5, rot, [0, 0, 0, 0], '#ece9e1');
      b.save(); b.translate(x + w / 2 + 10, y - px * 0.3); b.rotate(rot); b.fillStyle = '#151515'; b.font = `400 ${px}px "Special Elite"`; b.textBaseline = 'middle'; b.fillText(str, -w / 2, 2); b.restore();
      return p;
    };
    const ransom = (str, x, y, size, seed, stepStart = null, preserveCase = false) => {
      const rl = H.rng(seed); let cx = x, idx = 0;
      for (const ch0 of str) {
        if (ch0 === ' ') { cx += size * 0.35; continue; }
        const fnt = rl.pick(RANSOM_FONTS).replace('S', Math.round(size * rl.range(0.82, 1.1)) + 'px');
        const ch = rl.chance(0.25) && !preserveCase && /[A-Z]/.test(ch0) ? ch0.toLowerCase() : ch0;
        b.font = fnt;
        const m = b.measureText(ch), gw = m.width, asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
        const padX = rl.range(5, 10), padY = rl.range(5, 9), tw = gw + padX * 2, th = asc + desc + padY * 2;
        const style = rl.pick(['white', 'white', 'black', 'spot', 'white', 'black']);
        const rot = rl.range(-0.12, 0.12) + (jr() - 0.5) * 0.04;
        const tcx = cx + tw / 2 + (jr() - 0.5) * 2, tcy = y + rl.range(-6, 6) + (jr() - 0.5) * 2;
        const tile = scrapPoly(rl, nz, tcx, tcy, tw, th, rot, [0, 0, 0, 0]);
        const vis = stepStart == null || stepIn(stepStart + idx * 0.0625);
        idx++;
        if (vis) {
          shadowP(tile, 2, 2, 0.75);
          b.save(); pathPoly(b, tile); b.fillStyle = style === 'black' ? '#141414' : '#f6f4ee'; b.fill(); b.clip();
          b.translate(tcx, tcy); b.rotate(rot); b.fillStyle = style === 'black' ? '#f6f4ee' : '#111'; b.textBaseline = 'alphabetic';
          b.font = fnt; b.fillText(ch, -gw / 2, (asc - desc) / 2); b.restore();
          if (style === 'spot') { pathPoly(sp, tile); sp.fillStyle = spotCol; sp.fill(); } else occlude(tile);
        }
        cx += tw + rl.range(-3, 4);
      }
      return cx;
    };
    const marker = (c, pts, p, col, wdt = 7, head = true) => { // hand-drawn marker line, revealed in steps
      if (p <= 0) return;
      const n = Math.max(2, Math.ceil(pts.length * p));
      c.save(); c.strokeStyle = col; c.lineWidth = wdt; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); for (let i = 0; i < n; i++) { const [x, y] = pts[i]; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
      if (head && p >= 1) { const [x1, y1] = pts[pts.length - 1], [x0, y0] = pts[Math.max(0, pts.length - 3)], a = Math.atan2(y1 - y0, x1 - x0); c.beginPath(); c.moveTo(x1 + Math.cos(a + 2.5) * 26, y1 + Math.sin(a + 2.5) * 26); c.lineTo(x1, y1); c.lineTo(x1 + Math.cos(a - 2.5) * 26, y1 + Math.sin(a - 2.5) * 26); c.stroke(); }
      c.restore();
    };
    const curve = (ax, ay, cx, cy, bx, by, seed) => { const r = H.rng(seed), pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24; pts.push([(1 - u) * (1 - u) * ax + 2 * u * (1 - u) * cx + u * u * bx + (r() - 0.5) * 2, (1 - u) * (1 - u) * ay + 2 * u * (1 - u) * cy + u * u * by + (r() - 0.5) * 2]); } return pts; };
    const scrawl = (str, x, y, px, rot, col = '#111') => { b.save(); b.translate(x, y); b.rotate(rot); b.fillStyle = col; b.font = `400 ${px}px "Permanent Marker"`; b.fillText(str, 0, 0); b.restore(); };
    const flash=paint({b,sp,ts,fr,nz,spotCol,stepIn,prog,slap,unslap,scrap,typed,ransom,marker,curve,scrawl,tape,barScreen});
    W=PW;H_=PH;
    // ---- photocopier crush + spot grain (as in the still) ----
    b.setTransform(1, 0, 0, 1, 0, 0);
    { // toner smudges on the copier glass (same as the still)
      const rs = H.rng(909);
      for (let i = 0; i < 5; i++) {
        const x = rs.range(0, W), y = rs.range(0, H_), R0 = rs.range(30, 90);
        const g = b.createRadialGradient(x, y, 0, x, y, R0);
        g.addColorStop(0, 'rgba(0,0,0,0.32)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        b.fillStyle = g; b.fillRect(x - R0, y - R0, R0 * 2, R0 * 2);
      }
    }
    {
      const img = b.getImageData(0, 0, W, H_), d = img.data, rn = H.rng(31 + fr);
      // static part of the copier: low-frequency toner mottle, drum streaks, dark lead edges (cached once)
      const bias = ZC.bias && ZC.biasW === W ? ZC.bias : (ZC.biasW = W, ZC.bias = (() => {
        const s = new Float32Array(W), rs = H.rng(77); for (let i = 0; i < 9; i++) { const x0 = rs.int(0, W - 1), wdt = rs.int(1, 4), a = rs.range(0.05, 0.16); for (let k = 0; k < wdt; k++) if (x0 + k < W) s[x0 + k] += a; }
        const out = new Float32Array(W * H_);
        for (let y = 0; y < H_; y++) {
          const edge = Math.max(0, 1 - y / (40*scale)) * 0.25 + Math.max(0, (y - H_ + 50*scale) / (50*scale)) * 0.2;
          for (let x = 0; x < W; x++) out[y * W + x] = nz.n2(x / scale * 0.012, y / scale * 0.012) * 0.06 - s[x] - edge - Math.max(0, 1 - x / (30*scale)) * 0.3;
        }
        return out;
      })());
      for (let i = 0, k = 0, n = W * H_; i < n; i++, k += 4) {
        const L = d[k] / 255 + (rn() - 0.5) * 0.22 + bias[i];
        let v = H.smooth(0.32, 0.62, L);
        if (v > 0.6 && rn() < 0.0025) v = 0.1;
        if (v < 0.4 && rn() < 0.01) v = 0.7;
        v = 0.06 + v * 0.9;
        d[k] = 255 * v; d[k + 1] = 255 * v * 0.995; d[k + 2] = 255 * v * 0.975;
      }
      b.putImageData(img, 0, 0);
      const si = sp.getImageData(0, 0, W, H_), sd = si.data, rs2 = H.rng(55 + fr);
      for (let i = 3; i < sd.length; i += 4) { if (!sd[i]) continue; const x = ((i - 3) / 4) % W, y = ((i - 3) / 4 / W) | 0; sd[i] *= H.clamp(0.82 + nz.n2(x / scale * 0.02 + 40, y / scale * 0.02) * 0.2 + (rs2() - 0.5) * 0.35); }
      sp.putImageData(si, 0, 0);
    }

    for(const tp of tapes){
      b.setTransform(tp.m);sp.setTransform(tp.m);
      maskTape(b,sp,H.rng(tp.seed),nz,tp.cx,tp.cy,tp.w,tp.h,tp.rot);
    }
    b.setTransform(1,0,0,1,0,0);sp.setTransform(1,0,0,1,0,0);
    const final=ZC.final&&ZC.final.width===PW?ZC.final:(ZC.final=H.layer(PW,PH)),fc=final.getContext('2d');
    fc.clearRect(0,0,PW,PH);fc.drawImage(BW,0,0);
    const wob=H.rng(300+fr);
    fc.save();fc.globalCompositeOperation='multiply';fc.drawImage(SPL,(4+Math.round((wob()-.5)*2))*scale,(-3+Math.round((wob()-.5)*2))*scale);fc.restore();
    if(flash){fc.fillStyle='rgba(255,255,250,0.22)';fc.fillRect(0,0,PW,PH);}
    ZC.lastFrame=fr;ZC.lastWidth=PW;
    ctx.drawImage(final,0,0,logicalW,logicalH);
  };
  window.STYLE_PACKS=window.STYLE_PACKS||{};
  STYLE_PACKS['punk-zine-collage']={render,scrapPoly,pathPoly,maskTape,halftone,RANSOM_FONTS};
}
