{
  const TAU = Math.PI * 2;
  const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const LIGHT = nrm([-0.5, -0.66, 0.58]);
  const HALF = nrm([LIGHT[0], LIGHT[1], LIGHT[2] + 1]);

  // lumpy closed shape from a centre + radius function
  const lumpy = (c, nz, cx, cy, rx, ry, seed, amp = 0.05, rot = 0) => {
    c.beginPath();
    const N = 72, cr = Math.cos(rot), sr = Math.sin(rot);
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * TAU, k = 1 + amp * nz.n2(Math.cos(a) * 1.3 + seed, Math.sin(a) * 1.3 + seed * 0.7);
      const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
      const px = cx + x * cr - y * sr, py = cy + x * sr + y * cr;
      i ? c.lineTo(px, py) : c.moveTo(px, py);
    }
    c.closePath();
    c.fill();
  };

  let WALL = null; // static set wall: identical every frame, rendered once
  const SEQ = {
    pop: [[0.5, 0.42], [1.16, 0.8], [0.9, 1.14], [1.04, 0.97], [1, 1]],
    lid: [[1, 0.12], [1, 0.38], [1, 0.66], [1, 0.9], [1, 1.05], [1, 1]],
  };
  // =====================================================================
  // EXPLAINER: a fixed clay set; every prop is a baked plasticine lump that
  // is placed, popped, slid and dropped on twos (12 fps) like a real animator
  // moving pieces between exposures. Sprites are baked once and cached.
  // =====================================================================
  const CLX = {};
  let RES=1;
  const setScale=s=>{if(s===RES)return false;RES=s;for(const k of Object.keys(CLX))delete CLX[k];return true;};
  const cnz = () => CLX.nz || (CLX.nz = H.makeNoise(8));
  // bake a clay lump; draw(c) paints the silhouette in local coords [0..w]x[0..h]
  const bake = (key, w, h, o) => {
    if (CLX[key]) return CLX[key];
    const logicalW=w,logicalH=h;w*=RES;h*=RES;
    o={...o,R:(o.R||14)*RES,lump:(o.lump??1.2)*RES,ox:(o.ox||0)*RES,oy:(o.oy||0)*RES,
       fps:(o.fps||[]).map(f=>[f[0]*RES,f[1]*RES,f[2]*RES,f[3]]),
       marks:(o.marks||[]).map(m=>m.map(v=>v*RES)),markW:(o.markW||3.2)*RES*RES};
    const nz = cnz(), R = o.R || 14, pad = Math.ceil(R * 2 + 6), ox = o.ox || 0, oy = o.oy || 0;
    const W2 = Math.ceil(w + pad * 2), H2 = Math.ceil(h + pad * 2);
    const M = H.layer(W2, H2), mc = M.getContext('2d', { willReadFrequently: true });
    mc.translate(pad, pad);mc.scale(RES,RES); mc.fillStyle = '#fff'; mc.strokeStyle = '#fff'; o.draw(mc);
    const ds = 3, sw = Math.ceil(W2 / ds), sh = Math.ceil(H2 / ds);
    const Bs = H.layer(sw, sh), bsc = Bs.getContext('2d'); bsc.filter = `blur(${R / ds}px)`; bsc.drawImage(M, 0, 0, sw, sh);
    const B = H.layer(W2, H2), bc = B.getContext('2d', { willReadFrequently: true }); bc.drawImage(Bs, 0, 0, W2, H2);
    const md = mc.getImageData(0, 0, W2, H2).data, bd = bc.getImageData(0, 0, W2, H2).data;
    const Hh = new Float32Array(W2 * H2), A = new Float32Array(W2 * H2), lump = o.lump ?? 1.2, seed = o.seed || 1;
    for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
      const i = y * W2 + x, a = bd[i * 4 + 3] / 255, ap = H.clamp((a - 0.42) / 0.58);
      A[i] = ap;
      if (!md[i * 4 + 3]) continue;
      const X = (x + ox)/RES, Y = (y + oy)/RES;
      Hh[i] = Math.sqrt(1 - (1 - ap) * (1 - ap)) * R * (o.dome ?? 1.1) + nz.n2(X * 0.025 + seed, Y * 0.025) * lump + nz.n2(X * 0.11 + (o.boil || 0) * 1.7, Y * 0.11 + seed) * (0.35*RES);
    }
    (o.fps || []).forEach((f) => {
      const R2 = f[2], ang = f[3], ca = Math.cos(ang), sa = Math.sin(ang);
      for (let y = Math.max(0, Math.floor(f[1] + pad - R2)); y <= Math.min(H2 - 1, f[1] + pad + R2); y++) for (let x = Math.max(0, Math.floor(f[0] + pad - R2)); x <= Math.min(W2 - 1, f[0] + pad + R2); x++) {
        const dx0 = x - pad - f[0], dy0 = y - pad - f[1], dx = dx0 * ca + dy0 * sa, dy = (-dx0 * sa + dy0 * ca) * 1.45, d = Math.hypot(dx, dy);
        if (d >= R2) continue;
        Hh[y * W2 + x] += Math.sin(d/RES * 1.6 + nz.n2(dx/RES * 0.06 + ang, dy/RES * 0.06) * 2.5) * (0.22*RES) * Math.pow(1 - d / R2, 1.5) * H.smooth(-0.6, 0.4, Math.cos(Math.atan2(dy, dx) - ang * 2));
      }
    });
    (o.marks || []).forEach((m) => {
      const [ax, ay, bx, by] = m.map((v, i) => (i < 4 ? v + pad : v)), vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy || 1, dep = m[4] || 1.2;
      for (let y = Math.max(0, Math.floor(Math.min(ay, by) - 9*RES)); y <= Math.min(H2 - 1, Math.max(ay, by) + 9*RES); y++) for (let x = Math.max(0, Math.floor(Math.min(ax, bx) - 9*RES)); x <= Math.min(W2 - 1, Math.max(ax, bx) + 9*RES); x++) {
        const u = H.clamp(((x - ax) * vx + (y - ay) * vy) / L2), d = Math.hypot(x - ax - vx * u, y - ay - vy * u);
        if (d > 8*RES) continue;
        Hh[y * W2 + x] += Math.sin(Math.PI * Math.min(1, u * 1.05 + 0.02)) * (-dep * Math.exp((-d * d) / (o.markW || 3.2)) + 0.4 * dep * Math.exp(-((d - 3.4*RES) ** 2) / (2*RES*RES)));
      }
    });
    const out = mc.createImageData(W2, H2), od = out.data, base = H.hex(o.color), sss = o.sss || [1.12, 0.92, 0.85];
    for (let y = 1; y < H2 - 1; y++) for (let x = 1; x < W2 - 1; x++) {
      const i = y * W2 + x, ma = md[i * 4 + 3];
      if (!ma) continue;
      const n = nrm([-(Hh[i + 1] - Hh[i - 1]) * 0.5, -(Hh[i + W2] - Hh[i - W2]) * 0.5, 1]);
      const diff = H.clamp((n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2] + 0.42) / 1.42);
      const spec = Math.pow(Math.max(0, n[0] * HALF[0] + n[1] * HALF[1] + n[2] * HALF[2]), 26) * (o.spec ?? 0.3);
      const k = (0.3 + 0.86 * diff) * (0.72 + 0.28 * Math.min(1, A[i] * 1.4)), sh2 = 1 - diff, k4 = i * 4;
      od[k4] = Math.min(255, base[0] * k * (1 + (sss[0] - 1) * sh2) + spec * 255);
      od[k4 + 1] = Math.min(255, base[1] * k * (1 + (sss[1] - 1) * sh2) + spec * 245);
      od[k4 + 2] = Math.min(255, base[2] * k * (1 + (sss[2] - 1) * sh2) + spec * 230);
      od[k4 + 3] = ma;
    }
    const O = H.layer(W2, H2); O.getContext('2d').putImageData(out, 0, 0); O.pad = pad/RES; O.w = logicalW; O.h = logicalH;O.scale=RES;
    return (CLX[key] = O);
  };
  // place a sprite: (x,y) = top-left of its shape box; anchor (ax,ay) in local coords for squash/rotate
  const place = (ctx, spr, x, y, o = {}) => {
    if (!spr) return;
    const ax = o.ax ?? spr.w / 2, ay = o.ay ?? spr.h;
    ctx.save();
    if (o.shadow !== false) { const s = o.shadow || {}; ctx.shadowColor = `rgba(40,20,10,${s.a ?? 0.4})`; ctx.shadowBlur = (s.blur ?? 10)*RES; ctx.shadowOffsetX = (s.dx ?? 6)*RES; ctx.shadowOffsetY = (s.dy ?? 7)*RES; }
    ctx.translate(x + ax, y + ay); if (o.rot) ctx.rotate(o.rot); ctx.scale(o.sx ?? 1, o.sy ?? 1); ctx.translate(-ax, -ay);
    ctx.drawImage(spr, -spr.pad, -spr.pad,spr.width/spr.scale,spr.height/spr.scale); ctx.restore();
  };
  const prn = (seed, w, h, n, R) => { const r = H.rng(seed); return Array.from({ length: n }, () => [r.range(w * 0.15, w * 0.85), r.range(h * 0.15, h * 0.85), R * r.range(0.7, 1.2), r() * 50]); };
  const FR = (px) => `700 ${px}px "Fredoka"`;
  const mctx = () => CLX.m || (CLX.m = H.layer(4, 4).getContext('2d'));
  const glyph = (ch, px, col) => {
    const c = mctx(); c.font = FR(px); const w = Math.ceil(c.measureText(ch).width) + 4, h = Math.ceil(px * 1.05);
    return bake('g' + ch + px + col, w, h, { R: Math.max(4, px * 0.075), dome: 1.3, lump: 0.8, seed: ch.charCodeAt(0), color: col, draw: (x) => { x.font = FR(px); x.fillText(ch, 2, px * 0.82); }, fps: px > 60 ? prn(ch.charCodeAt(0) + px, w, h, 1, px * 0.18) : [] });
  };
  const PAL = ['#f2c14e', '#f07b5a', '#f6efe3', '#ef8fb0', '#a8dd8a', '#7fd0e0'];


  const background=(ctx,W=1280,H_=720)=>{const nz=cnz();
    if (!CLX.bg) {
      const C = H.layer(Math.ceil(W*RES), Math.ceil(H_*RES)), c = C.getContext('2d');c.scale(RES,RES);
      c.fillStyle = '#3f8593'; c.fillRect(0, 0, W, H_);
      const wall = bake('wall', W, 520, { R: 4, dome: 0, lump: 3.2, seed: 3, color: '#4f9fae', spec: 0.12, draw: (x) => x.fillRect(-30, -30, W + 60, 580), fps: prn(11, W, 470, 12, 30), markW: 14 });
      c.save(); c.filter = `blur(${1.6*RES}px)`; c.drawImage(wall, -wall.pad, -wall.pad,wall.width/RES,wall.height/RES); c.restore();
      const g = c.createRadialGradient(620, 220, 30, 640, 300, 760); g.addColorStop(0, 'rgba(255,240,200,0.22)'); g.addColorStop(1, 'rgba(10,20,30,0.35)');
      c.fillStyle = g; c.fillRect(0, 0, W, H_);
      const tab = bake('table', W + 80, 240, { R: 22, dome: 1.0, lump: 2.4, seed: 80, color: '#d0703f', draw: (x) => { x.beginPath(); x.moveTo(0, 14); for (let X = 0; X <= W + 80; X += 20) x.lineTo(X, 6 + nz.n2(X * 0.01, 3) * 8); x.lineTo(W + 80, 300); x.lineTo(0, 300); x.closePath(); x.fill(); }, fps: prn(81, W, 200, 7, 30), marks: (() => { const r = H.rng(82); return Array.from({ length: 6 }, () => { const x = r.range(40, W), y = r.range(40, 200), a = r() * TAU, l = r.range(50, 110); return [x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, 1.2]; }); })(), markW: 16 });
      c.save(); c.shadowColor = 'rgba(40,20,10,0.35)'; c.shadowBlur = 30*RES; c.shadowOffsetY = -10*RES; c.drawImage(tab, -40 - tab.pad, 500 - tab.pad,tab.width/RES,tab.height/RES); c.restore();
      const g2 = c.createLinearGradient(0, 600, 0, H_); g2.addColorStop(0, 'rgba(60,20,10,0)'); g2.addColorStop(1, 'rgba(60,20,10,0.35)');
      c.fillStyle = g2; c.fillRect(0, 600, W, 120);
      CLX.bg = C;
    }
    ctx.drawImage(CLX.bg, 0, 0,W,H_);

  };

  const finish=(ctx,W,H_,t)=>{const fr=Math.floor(t*12);
    // ---------- lens finish ----------
    ctx.save(); ctx.globalCompositeOperation = 'soft-light';
    const gg = ctx.createLinearGradient(0, 0, W, H_); gg.addColorStop(0, 'rgba(255,220,170,0.5)'); gg.addColorStop(1, 'rgba(40,60,90,0.4)');
    ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H_); ctx.restore();
    H.vignette(ctx, W, H_, 0.42, '20,12,8');
    { const f = (H.rng(900 + fr)() - 0.5) * 0.06; ctx.fillStyle = f > 0 ? `rgba(255,240,220,${f})` : `rgba(0,0,0,${-f})`; ctx.fillRect(0, 0, W, H_); }
    H.grain(ctx, W, H_, 0.03, 4 + fr);
  };

  window.STYLE_PACKS=window.STYLE_PACKS||{};
  STYLE_PACKS['claymation-set']={setScale,cnz,lumpy,SEQ,bake,place,prn,FR,mctx,glyph,PAL,background,finish};
}
