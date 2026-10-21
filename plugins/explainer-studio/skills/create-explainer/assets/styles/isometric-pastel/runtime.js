{
  // ---------- isometric helpers ----------
  const C30 = Math.cos(Math.PI / 6);
  const makeIso = (ox, oy, s) => (x, y, z = 0) => [ox + (x - y) * C30 * s, oy + (x + y) * 0.5 * s - z * s];
  const SHADE_DARK = [92, 88, 150];
  const shade = (base, k = 1) => ({
    top: H.rgba(H.mix(base, '#ffffff', 0.42 * k)),
    left: H.rgba(H.mix(base, '#ffffff', 0.08)),
    right: H.rgba(H.mix(base, SHADE_DARK, 0.28 * k)),
    edge: H.rgba(H.mix(base, '#ffffff', 0.75), 0.9),
  });
  function poly(ctx, pts, fill) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  }
  function box(ctx, P, x, y, z, w, d, h, c, edges = true) {
    const px = P(x, y, 0)[1] - P(x, y, 1)[1], hp = h * px;   // pixels per unit, face height in px
    // ambient-occlusion contact strip where a box stands on the floor (faces drawn next cover its inner half)
    if (Math.abs(z) < 0.01 && hp > 6) {
      const a = P(x, y + d, 0), b = P(x + w, y + d, 0), e = P(x + w, y, 0);
      ctx.save(); ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
      for (const [lw, al] of [[Math.min(12, px * 0.3), 0.07], [Math.min(6, px * 0.15), 0.1], [Math.min(3, px * 0.07), 0.14]]) {
        ctx.strokeStyle = `rgba(60,50,110,${al})`; ctx.lineWidth = lw;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(e[0], e[1]); ctx.stroke();
      }
      ctx.restore();
    }
    poly(ctx, [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)], c.right);
    poly(ctx, [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)], c.left);
    // tonal falloff on the side faces: a touch lighter at the top edge, darker toward the floor
    if (hp > 10) {
      const t0 = P(x + w, y + d, z + h), b0 = P(x + w, y + d, z);
      const g = ctx.createLinearGradient(0, t0[1], 0, b0[1]);
      g.addColorStop(0, 'rgba(255,255,255,0.13)'); g.addColorStop(0.4, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(60,50,110,0.10)');
      ctx.beginPath();
      const f1 = [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)], f2 = [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)];
      for (const f of [f1, f2]) { ctx.moveTo(f[0][0], f[0][1]); for (let i = 1; i < 4; i++) ctx.lineTo(f[i][0], f[i][1]); ctx.closePath(); }
      ctx.fillStyle = g; ctx.fill();
    }
    poly(ctx, [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], c.top);
    if (edges) {
      ctx.strokeStyle = c.edge; ctx.lineWidth = 1; ctx.lineJoin = 'round';
      ctx.beginPath();
      const a = P(x, y + d, z + h), b = P(x + w, y + d, z + h), e = P(x + w, y, z + h), f = P(x + w, y + d, z);
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(e[0], e[1]);
      ctx.moveTo(b[0], b[1]); ctx.lineTo(f[0], f[1]);
      ctx.stroke();
    }
  }
  // convex hull (monotone chain) of 2D world points
  function hull(pts) {
    pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    up.pop(); lo.pop(); return lo.concat(up);
  }
  function cylinder(ctx, P, s, cx, cy, z, r, h, base) {
    const b = P(cx, cy, z), tp = P(cx, cy, z + h);
    const rx = 1.2247 * r * s, ry = 0.7071 * r * s;
    const g = ctx.createLinearGradient(b[0] - rx, 0, b[0] + rx, 0);
    g.addColorStop(0, H.rgba(H.mix(base, '#ffffff', 0.15)));
    g.addColorStop(0.35, H.rgba(H.mix(base, '#ffffff', 0.3)));
    g.addColorStop(0.55, H.rgba(base));
    g.addColorStop(1, H.rgba(H.mix(base, SHADE_DARK, 0.32)));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(b[0], b[1], rx, ry, 0, 0, Math.PI); ctx.lineTo(tp[0] - rx, tp[1]);
    ctx.ellipse(tp[0], tp[1], rx, ry, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
    ctx.fillStyle = H.rgba(H.mix(base, '#ffffff', 0.5));
    ctx.beginPath(); ctx.ellipse(tp[0], tp[1], rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    return { b, tp, rx, ry };
  }

  // ================= EXPLAINER: "How does AI learn?" as one long isometric factory the camera travels along =================
  function petFace(c, kind, x, y, r, col, ink) {
    c.save(); c.translate(x, y);
    c.fillStyle = col;
    if (kind === 'cat') {
      for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 0.85 * r, -0.2 * r); c.lineTo(sx * 0.62 * r, -1.15 * r); c.lineTo(sx * 0.12 * r, -0.78 * r); c.closePath(); c.fill(); }
    } else {
      c.fillStyle = H.rgba(H.mix(col, ink, 0.35));
      for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * 0.88 * r, 0.05 * r, 0.32 * r, 0.62 * r, sx * 0.35, 0, 7); c.fill(); }
      c.fillStyle = col;
    }
    c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
    c.fillStyle = ink;
    for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * 0.36 * r, -0.12 * r, r * 0.12, 0, 7); c.fill(); }
    if (kind === 'cat') {
      c.beginPath(); c.moveTo(-0.1 * r, 0.18 * r); c.lineTo(0.1 * r, 0.18 * r); c.lineTo(0, 0.3 * r); c.closePath(); c.fill();
      c.strokeStyle = ink; c.lineWidth = Math.max(0.6, r * 0.05);
      c.beginPath(); for (const sx of [-1, 1]) for (const dy of [0.22, 0.36]) { c.moveTo(sx * 0.3 * r, dy * r); c.lineTo(sx * 0.85 * r, (dy - 0.06) * r); } c.stroke();
    } else {
      c.beginPath(); c.ellipse(0, 0.32 * r, 0.2 * r, 0.14 * r, 0, 0, 7); c.fill();
    }
    c.restore();
  }
  const wallX = (ctx, p) => ctx.transform(C30, 0.5, 0, 1, p[0], p[1]);        // plane facing +y (lower-left), px units
  const floorX = (ctx, p) => ctx.transform(C30, 0.5, -C30, 0.5, p[0], p[1]);  // floor plane, px units
  function tag(ctx, x, y, text, o = {}) {
    ctx.save();
    ctx.font = o.font || '600 13px "Inter"';
    const fsz = parseInt((ctx.font.match(/(\d+)px/) || [0, 14])[1]);
    const w = ctx.measureText(text).width + (o.icon ? fsz * 2.4 : fsz * 1.4), h = o.h || Math.round(fsz * 1.75);
    const k = o.k ?? 1;
    ctx.translate(x, y); ctx.scale(k, k);
    ctx.shadowColor = 'rgba(80,70,140,0.2)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
    ctx.fillStyle = o.bg || '#ffffff'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fill();
    ctx.shadowColor = 'transparent';
    if (o.icon) { ctx.fillStyle = o.iconCol || '#ff6b5b'; ctx.beginPath(); ctx.arc(-w / 2 + fsz * 0.9, 0, fsz * 0.3, 0, 7); ctx.fill(); }
    ctx.fillStyle = o.col || '#2d3058'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, o.icon ? fsz * 0.5 : 0, 1);
    ctx.restore();
  }
  function numberTag(ctx, x, y, num, label, o = {}) {
    const k = o.k ?? 1; if (k <= 0.01) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.font = '800 66px "Inter"'; const nw = ctx.measureText(num).width;
    ctx.font = '600 24px "Inter"'; const lw = ctx.measureText(label).width;
    const w = Math.max(nw, lw) + 56, h = 118;
    ctx.shadowColor = 'rgba(80,70,140,0.25)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 6;
    ctx.fillStyle = o.bg || '#ffffff'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 26); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = o.sub || '#7b7aa3'; ctx.fillText(label, 0, -h / 2 + 34);
    ctx.font = '800 66px "Inter"'; ctx.fillStyle = o.col || '#2d3058'; ctx.fillText(num, 0, h / 2 - 18);
    ctx.restore();
  }
  function arrow(ctx, pts, prog, col, dash, w = 2) {
    // pts: quadratic [a, ctrl, b] in screen space, drawn on up to prog
    if (prog <= 0) return;
    const [a, c, b] = pts;
    const q = (u) => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); const n = 30; for (let i = 1; i <= n; i++) { const p = q(prog * i / n); ctx.lineTo(p[0], p[1]); } ctx.stroke();
    ctx.setLineDash([]);
    const e = q(prog), e0 = q(Math.max(0, prog - 0.04)), ang = Math.atan2(e[1] - e0[1], e[0] - e0[0]);
    ctx.fillStyle = col; ctx.translate(e[0], e[1]); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-7, -5.5); ctx.lineTo(-7, 5.5); ctx.closePath(); ctx.fill();
    ctx.restore();
    return q;
  }

window.STYLE_PACKS=window.STYLE_PACKS||{};window.STYLE_PACKS["isometric-pastel"]={makeIso,shade,poly,box,cylinder,hull,tag,numberTag,arrow,wallX,floorX};
}
