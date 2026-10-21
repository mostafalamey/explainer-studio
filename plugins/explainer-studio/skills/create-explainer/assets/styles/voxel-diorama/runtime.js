{
  // ---------- voxel helpers: ortho dimetric projection, face culling, vertex AO, ray-marched shadows ----------
  const ELEV = Math.PI / 6;
  let ca = Math.cos(0.62), sa = Math.sin(0.62);
  const sP = Math.sin(ELEV), cP = Math.cos(ELEV);
  const setYaw = (y) => { ca = Math.cos(y); sa = Math.sin(y); };
  const makeProj = (cx, cy, s) => (x, y, z) => [cx + (x * ca - y * sa) * s, cy + (x * sa + y * ca) * sP * s - z * cP * s];
  const depthOf = (x, y, z) => (x * sa + y * ca) * cP + z * sP;
  const K = (x, y, z) => ((z + 8) * 128 + (y + 32)) * 128 + (x + 32);
  const FACES = [
    { n: [0, 0, 1], o: [0, 0, 1], t1: [1, 0, 0], t2: [0, 1, 0], light: 1.0, tint: [1.0, 0.98, 0.93] },
    { n: [0, 1, 0], o: [0, 1, 0], t1: [1, 0, 0], t2: [0, 0, 1], light: 0.8, tint: [0.97, 0.95, 1.0] },
    { n: [1, 0, 0], o: [1, 0, 0], t1: [0, 1, 0], t2: [0, 0, 1], light: 0.64, tint: [0.92, 0.92, 1.04] },
  ];

  // opts.at(v) -> appear time; voxels drop in from above over DROP seconds. Only landed voxels occlude / cast AO.
  const DROP = 0.32;
  function drawVoxels(ctx, V0, P, s, opts = {}) {
    const t = opts.t ?? 99;
    let V = V0;
    const falling = [];
    if (opts.at) {
      V = new Map();
      for (const [k, v] of V0) {
        const a = opts.at(v);
        if (t >= a + DROP) V.set(k, v);
        else if (t > a) { const q = (t - a) / DROP; falling.push({ ...v, z: v.z + (1 - H.ease.out(q)) * 7, fall: true }); }
      }
    }
    const has = (x, y, z) => V.has(K(x, y, z));
    const L = [-0.42, -0.62, 0.66]; // toward light (back-left, high)
    const shadowed = (px, py, pz) => {
      for (let i = 1; i < 44; i++) {
        const x = px + L[0] * i * 0.5, y = py + L[1] * i * 0.5, z = pz + L[2] * i * 0.5;
        if (z > 40) return 0;
        if (has(Math.floor(x), Math.floor(y), Math.floor(z))) return 1;
      }
      return 0;
    };
    const list = [...V.values(), ...falling];
    list.sort((a, b) => depthOf(a.x, a.y, a.z) - depthOf(b.x, b.y, b.z));
    const N = 4;
    const glows = [];
    for (let v of list) {
      const v0 = v;
      if (opts.cull) { const c = P(v.x + 0.5, v.y + 0.5, v.z + 0.5); if (c[0] < -s * 2 || c[0] > opts.cull[0] + s * 2 || c[1] < -s * 2 || c[1] > opts.cull[1] + s * 2) continue; }
      for (const F of FACES) {
        v = v0;
        const fx = v.x + F.n[0], fy = v.y + F.n[1], fz = v.z + F.n[2];
        if (!v.fall && has(fx, fy, fz)) continue;
        const O = [v.x + F.o[0], v.y + F.o[1], v.z + F.o[2]];
        const p0 = P(...O), p1 = P(O[0] + F.t1[0], O[1] + F.t1[1], O[2] + F.t1[2]), p3 = P(O[0] + F.t2[0], O[1] + F.t2[1], O[2] + F.t2[2]);
        const e1 = [p1[0] - p0[0], p1[1] - p0[1]], e2 = [p3[0] - p0[0], p3[1] - p0[1]];
        if (v.e && opts.power === false) v = { ...v, e: false, c: [70, 66, 88] };
        if (v.fall) {
          const c = v.c.map((ch, i) => ch * F.light * F.tint[i]);
          const st = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
          ctx.fillStyle = st; ctx.strokeStyle = st; ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p0[0] + e1[0], p0[1] + e1[1]); ctx.lineTo(p0[0] + e1[0] + e2[0], p0[1] + e1[1] + e2[1]); ctx.lineTo(p0[0] + e2[0], p0[1] + e2[1]); ctx.closePath(); ctx.fill(); ctx.stroke();
          continue;
        }
        if (v.e) {
          const c = H.mix(v.c, [255, 255, 255], F === FACES[0] ? 0.25 : 0.05);
          const st = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
          ctx.fillStyle = st; ctx.strokeStyle = st; ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p0[0] + e1[0], p0[1] + e1[1]); ctx.lineTo(p0[0] + e1[0] + e2[0], p0[1] + e1[1] + e2[1]); ctx.lineTo(p0[0] + e2[0], p0[1] + e2[1]); ctx.closePath(); ctx.fill(); ctx.stroke();
          if (F === FACES[0] || F === FACES[1]) glows.push([p0[0] + (e1[0] + e2[0]) / 2, p0[1] + (e1[1] + e2[1]) / 2, v.c]);
          continue;
        }
        // vertex AO
        const occ = (a, b) => has(fx + a[0] + b[0], fy + a[1] + b[1], fz + a[2] + b[2]) ? 1 : 0;
        const neg = (a) => [-a[0], -a[1], -a[2]], Z = [0, 0, 0];
        const ao = [];
        for (const [i, j] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
          const d1 = i ? F.t1 : neg(F.t1), d2 = j ? F.t2 : neg(F.t2);
          const s1 = occ(d1, Z), s2 = occ(d2, Z), cc = occ(d1, d2);
          ao.push(s1 && s2 ? 3 : s1 + s2 + cc);
        }
        // shadow
        const cx = O[0] + (F.t1[0] + F.t2[0]) / 2 + F.n[0] * 0.01, cy = O[1] + (F.t1[1] + F.t2[1]) / 2 + F.n[1] * 0.01, cz = O[2] + (F.t1[2] + F.t2[2]) / 2 + F.n[2] * 0.01;
        const facing = F.n[0] * L[0] + F.n[1] * L[1] + F.n[2] * L[2];
        const sh = facing > 0 ? shadowed(cx, cy, cz) : 0;
        let base = v.c.map((ch, i) => ch * F.light * F.tint[i]);
        if (sh) base = H.mix(base.map(ch => ch * 0.7), [96, 84, 150], 0.18);
        // underside of island gets darker with depth (bounce light falloff)
        if (opts.depthDark && v.z < 8) base = H.mix(base, [70, 50, 70], H.clamp((8 - v.z) / 16) * 0.5);
        const any = ao[0] + ao[1] + ao[2] + ao[3];
        const darkAt = (u, w) => { const a = H.lerp(H.lerp(ao[0], ao[1], u), H.lerp(ao[2], ao[3], u), w); return 1 - a * 0.13; };
        if (!any) {
          const st = `rgb(${base[0] | 0},${base[1] | 0},${base[2] | 0})`;
          ctx.fillStyle = st; ctx.strokeStyle = st; ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p0[0] + e1[0], p0[1] + e1[1]); ctx.lineTo(p0[0] + e1[0] + e2[0], p0[1] + e1[1] + e2[1]); ctx.lineTo(p0[0] + e2[0], p0[1] + e2[1]); ctx.closePath(); ctx.fill(); ctx.stroke();
        } else {
          for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) {
            const k = darkAt((a + 0.5) / N, (b + 0.5) / N);
            const c = H.mix(base.map(ch => ch * k), [80, 60, 110], (1 - k) * 0.35);
            const st = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
            const u0 = a / N, u1 = (a + 1) / N, w0 = b / N, w1 = (b + 1) / N;
            ctx.fillStyle = st; ctx.strokeStyle = st; ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p0[0] + e1[0] * u0 + e2[0] * w0, p0[1] + e1[1] * u0 + e2[1] * w0);
            ctx.lineTo(p0[0] + e1[0] * u1 + e2[0] * w0, p0[1] + e1[1] * u1 + e2[1] * w0);
            ctx.lineTo(p0[0] + e1[0] * u1 + e2[0] * w1, p0[1] + e1[1] * u1 + e2[1] * w1);
            ctx.lineTo(p0[0] + e1[0] * u0 + e2[0] * w1, p0[1] + e1[1] * u0 + e2[1] * w1);
            ctx.closePath(); ctx.fill(); ctx.stroke();
          }
        }
      }
    }
    return glows;
  }

  // ================= EXPLAINER: one long voxel island; the camera trucks along it and each zone is built from falling voxels =================
  const SPR = {
    cat: ['X...X', 'XXXXX', 'XoXoX', 'XXnXX', '.XXX.'],
    dog: ['.XXX.', 'EXXXE', 'EoXoE', 'XXnXX', '.XXX.'],
    x: ['X...X', '.X.X.', '..X..', '.X.X.', 'X...X'],
    ok: ['....X', '...X.', 'X.X..', '.X...', '.....'],
  };
  function vxBlockTag(ctx, x, y, text, o = {}) {
    ctx.save();
    ctx.font = o.font || '400 28px "Silkscreen"';
    const fsz = parseInt((ctx.font.match(/(\d+)px/) || [0, 22])[1]);
    const w = Math.ceil(ctx.measureText(text).width) + fsz * 1.3, h = o.h || Math.round(fsz * 1.8), k = o.k ?? 1, d = o.d ?? 5;
    ctx.translate(Math.round(x), Math.round(y)); ctx.scale(k, k);
    const bg = H.hex(o.bg || '#fff4e2');
    ctx.fillStyle = H.rgba(bg.map(c => c * 0.62)); ctx.beginPath(); ctx.moveTo(w / 2, -h / 2); ctx.lineTo(w / 2 + d, -h / 2 + d); ctx.lineTo(w / 2 + d, h / 2 + d); ctx.lineTo(w / 2, h / 2); ctx.fill();
    ctx.fillStyle = H.rgba(bg.map(c => c * 0.78)); ctx.beginPath(); ctx.moveTo(-w / 2, h / 2); ctx.lineTo(w / 2, h / 2); ctx.lineTo(w / 2 + d, h / 2 + d); ctx.lineTo(-w / 2 + d, h / 2 + d); ctx.fill();
    // soft cast shadow (front face only) so tags read as floating UI above the diorama
    ctx.save(); ctx.shadowColor = `rgba(90,50,30,${0.35 * (ctx.globalAlpha ?? 1)})`; ctx.shadowBlur = 12 * k; ctx.shadowOffsetY = 6 * k; ctx.shadowOffsetX = 2 * k;
    ctx.fillStyle = H.rgba(bg); ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
    ctx.fillStyle = H.rgba(bg); ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(-w / 2, -h / 2, w, 2); ctx.fillRect(-w / 2, -h / 2, 2, h);
    ctx.fillStyle = o.col || '#74432d'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 1);
    ctx.restore();
  }
  let VX_TEXT = null, VX_SH = null, VX_GR = null;
  function vxRaster(str) {
    if (!VX_TEXT) VX_TEXT = {};
    if (!VX_TEXT[str]) {
      const c = H.layer(200, 12), x = c.getContext('2d', { willReadFrequently: true });
      x.font = '400 8px "Silkscreen"'; x.textBaseline = 'top'; x.fillStyle = '#000'; x.fillText(str, 0, 1);
      const d = x.getImageData(0, 0, 200, 12).data, px = []; let maxX = 0;
      for (let yy = 0; yy < 12; yy++) for (let xx = 0; xx < 200; xx++) if (d[(yy * 200 + xx) * 4 + 3] > 110) { px.push([xx, yy]); maxX = Math.max(maxX, xx); }
      VX_TEXT[str] = { px, w: maxX + 1 };
    }
    return VX_TEXT[str];
  }
  function vxPixelText(ctx, str, cx, cy, ts, colTop, colBot, align = 'center', prog = 1) {
    // rasterise Silkscreen 8px and extrude each pixel as a block (oblique), like the still's title
    const T = vxRaster(str);
    const ox = align === 'center' ? cx - T.w * ts / 2 : cx, oy = cy - 5 * ts;
    const set = new Set(T.px.map(p => p[0] + ',' + p[1]));
    const dx = ts * 0.42;
    const vis = T.px.filter(p => p[0] <= T.w * prog);
    for (const [x, y] of vis) {
      const sx = ox + x * ts, sy = oy + y * ts, c = H.mix(colTop, colBot, y / 9);
      if (!set.has((x + 1) + ',' + y)) { ctx.fillStyle = H.rgba(c.map(v => v * 0.62)); ctx.beginPath(); ctx.moveTo(sx + ts, sy); ctx.lineTo(sx + ts + dx, sy + dx); ctx.lineTo(sx + ts + dx, sy + ts + dx); ctx.lineTo(sx + ts, sy + ts); ctx.fill(); }
      if (!set.has(x + ',' + (y + 1))) { ctx.fillStyle = H.rgba(c.map(v => v * 0.78)); ctx.beginPath(); ctx.moveTo(sx, sy + ts); ctx.lineTo(sx + ts, sy + ts); ctx.lineTo(sx + ts + dx, sy + ts + dx); ctx.lineTo(sx + dx, sy + ts + dx); ctx.fill(); }
    }
    for (const [x, y] of vis) {
      const sx = ox + x * ts, sy = oy + y * ts, c = H.mix(colTop, colBot, y / 9);
      ctx.fillStyle = H.rgba(c); ctx.fillRect(sx - 0.3, sy - 0.3, ts + 0.6, ts + 0.6);
      if (!set.has(x + ',' + (y - 1))) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(sx, sy, ts, Math.max(1, ts * 0.14)); }
    }
    return T.w * ts;
  }

  function finish(ctx,W,H_) {
    H.vignette(ctx,W,H_,0.18,'120,60,40');
    const scale=ctx.canvas.width/W, w=Math.round(W*scale), h=Math.round(H_*scale);
    if(!VX_GR || VX_GR.width!==w){
      VX_GR=H.layer(w,h); const gc=VX_GR.getContext('2d'),id=gc.createImageData(w,h),d=id.data,gr=H.rng(3);
      for(let i=0;i<d.length;i+=4){const n=(gr()-.5)*.025*255,v=n>0?255:0;d[i]=d[i+1]=d[i+2]=v;d[i+3]=Math.min(255,Math.abs(n)*(n>0?5:1.1));}
      gc.putImageData(id,0,0);
    }
    ctx.drawImage(VX_GR,0,0,W,H_);
  }
  window.STYLE_PACKS=window.STYLE_PACKS||{};
  STYLE_PACKS['voxel-diorama']={K,setYaw,makeProj,depthOf,drawVoxels,vxBlockTag,vxRaster,vxPixelText,finish};
}
