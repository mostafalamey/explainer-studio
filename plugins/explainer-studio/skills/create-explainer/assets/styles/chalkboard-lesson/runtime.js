// Chalkboard — dusty chalk lesson on green slate.
{
  const seg = (pts, step = 2.5) => {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
      for (let j = 0; j < n; j++) out.push([x0 + (x1 - x0) * j / n, y0 + (y1 - y0) * j / n]);
    }
    out.push(pts[pts.length - 1]);
    return out;
  };
  const normals = (P) => P.map((p, i) => {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    return [-dy / d, dx / d];
  });
  const wob = (pts, nz, seed, amp = 1.5, freq = 0.012) => {
    const N = normals(pts); let L = 0;
    return pts.map((p, i) => {
      if (i) L += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
      const o = nz.n2(L * freq + seed * 1.37, seed * 0.71) * amp + nz.n2(L * freq * 6 + seed, seed + 3.3) * amp * 0.25;
      return [p[0] + N[i][0] * o, p[1] + N[i][1] * o];
    });
  };
  const ell = (cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2) => {
    const n = Math.max(10, Math.ceil(Math.abs(a1 - a0) * Math.max(rx, ry) / 2.5)), out = [];
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    return out;
  };
  const quad = (p0, p1, p2, n = 40) => {
    const out = [];
    for (let i = 0; i <= n; i++) { const t = i / n, m = 1 - t; out.push([m * m * p0[0] + 2 * m * t * p1[0] + t * t * p2[0], m * m * p0[1] + 2 * m * t * p1[1] + t * t * p2[1]]); }
    return out;
  };

  const XC={},GLYPHS=new Map();let RES=1;
  const setScale=v=>{if(v===RES)return false;RES=v;for(const k of Object.keys(XC))delete XC[k];GLYPHS.clear();return true;};
  const XE=(()=>{
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const win = (t, a, b) => clamp((t - a) / (b - a));
    const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const camAt = (keys, t) => {
      if (t <= keys[0][0]) return keys[0].slice(1);
      for (let i = 0; i < keys.length - 1; i++) {
        const a = keys[i], b = keys[i + 1];
        if (t <= b[0]) {
          const u = eio((t - a[0]) / Math.max(1e-6, b[0] - a[0]));
          return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, Math.exp(Math.log(a[3]) + (Math.log(b[3]) - Math.log(a[3])) * u)];
        }
      }
      return keys[keys.length - 1].slice(1);
    };
    const circ = (x, y, rx, ry, a0 = 0, a1 = Math.PI * 2, n = 0) => {
      n = n || Math.max(12, Math.ceil(Math.abs(a1 - a0) * Math.max(rx, ry) / 6)); const o = [];
      for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([x + Math.cos(a) * rx, y + Math.sin(a) * ry]); }
      return o;
    };
    const quad = (p0, p1, p2, n = 30) => { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, m = 1 - t; o.push([m * m * p0[0] + 2 * m * t * p1[0] + t * t * p2[0], m * m * p0[1] + 2 * m * t * p1[1] + t * t * p2[1]]); } return o; };
    const cubic = (p0, p1, p2, p3, n = 40) => { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, m = 1 - t; o.push([m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0], m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1]]); } return o; };
    const rrect = (x, y, w, h, r) => {
      const o = [[x + r, y], [x + w - r, y]]; o.push(...circ(x + w - r, y + r, r, r, -Math.PI / 2, 0, 5).slice(1));
      o.push([x + w, y + h - r]); o.push(...circ(x + w - r, y + h - r, r, r, 0, Math.PI / 2, 5).slice(1));
      o.push([x + r, y + h]); o.push(...circ(x + r, y + h - r, r, r, Math.PI / 2, Math.PI, 5).slice(1));
      o.push([x, y + r]); o.push(...circ(x + r, y + r, r, r, Math.PI, Math.PI * 1.5, 5).slice(1));
      o.push([x + r + 6, y - 1]); return o;
    };
    const head = (P, len = 20, spread = 0.5) => {
      const a = P[P.length - 1], b = P[Math.max(0, P.length - 4)], an = Math.atan2(a[1] - b[1], a[0] - b[0]);
      return [[a[0] - Math.cos(an - spread) * len, a[1] - Math.sin(an - spread) * len], a, [a[0] - Math.cos(an + spread) * len, a[1] - Math.sin(an + spread) * len]];
    };
    // the 'tip' of whatever is currently being drawn (for the hand/tool)
    const tipOf = (items, t, measure) => {
      let tip = null;
      for (const it of items) {
        if (it.inst || it.k === 'dot') continue;
        const p = win(t, it.a, it.b);
        if (p > 0 && p < 1) {
          if (it.k === 'line') { const P = it.pts; tip = P[Math.min(P.length - 1, Math.floor(p * (P.length - 1)))]; }
          else tip = measure ? measure(it, p) : [it.x, it.y];
        }
      }
      return tip;
    };
    return {clamp,win,eio,camAt,circ,quad,cubic,rrect,head,tipOf};})();
  // A native glyph plate avoids clipping text scratch draws during camera travel.
  function glyph(c,ch,x,y){
    if(!ch.trim())return;
    const key=[ch,c.font,c.fillStyle,RES].join('|');let q=GLYPHS.get(key);
    if(!q){const m=c.measureText(ch),pad=3,left=-m.actualBoundingBoxLeft,top=-m.actualBoundingBoxAscent,w=Math.max(1,Math.ceil(m.actualBoundingBoxRight-left+pad*2)),h=Math.max(1,Math.ceil(m.actualBoundingBoxAscent+m.actualBoundingBoxDescent+pad*2));
      const cv=H.layer(Math.ceil(w*RES),Math.ceil(h*RES)),g=cv.getContext('2d');g.scale(RES,RES);g.font=c.font;g.fillStyle=c.fillStyle;g.fillText(ch,pad-left,pad-top);q={cv,w,h,x:left-pad,y:top-pad};GLYPHS.set(key,q);
    }c.drawImage(q.cv,x+q.x,y+q.y,q.w,q.h);
  }
  function render(ctx,W,H_,t,items,cam=[640,360,1]){
      const nz = H.makeNoise(31);
      const COL = { ink: [240, 242, 236], acc1: [246, 222, 120], acc2: [244, 150, 175], acc3: [205, 250, 190] };
      const FONT = { title: '700 KPX "Kalam"', label: '400 KPX "Patrick Hand"', num: '700 KPX "Kalam"' };
      const fontOf = (it) => FONT[it.font].replace('KPX', (it.size * (it.font === 'label' ? 1.08 : 1)).toFixed(1) + 'px');
      const z = cam[2];
      const apply = (c) => { c.translate(W / 2, H_ / 2); c.scale(z, z); c.translate(-cam[0], -cam[1]); };
      const toS = ([x, y]) => [(x - cam[0]) * z + W / 2, (y - cam[1]) * z + H_ / 2];

      // ---------- long slate (world texture at 1:1, built once) ----------
      // world extent: x -200..4600, y -200..1200. The low-frequency slate mottle is the half-res H.paper base,
      // everything on top of it (eraser swirls, felt streaks, ghost lesson, settled dust) is drawn at full resolution.
      if (!XC.slate) {
        const SW = 4800, SH = 1400, OX = 200, OY = 200, sl = H.layer(SW*RES, SH*RES), sc = sl.getContext('2d');sc.scale(RES,RES);
        // soft half-res layer: slate mottle, ghost lessons and eraser swirls (all blurred anyway)
        const base = H.layer(2400, 700), bc = base.getContext('2d'); H.paper(bc, 2400, 700, '#2c4639', 17, 0.05);
        const rr = H.rng(12);
        { // ghost text drawn unfiltered, then blurred in a single pass
          const gl = H.layer(2400, 700), gc = gl.getContext('2d'); gc.fillStyle = gc.strokeStyle = '#e8eee6'; gc.font = '400 20px "Kalam"';
          [['Arrival', 800, 120], ['Queue', 860, 190], ['Next', 120, 610], ['Reception', 2560, 250], ['Arrival', 1500, 1010],
            ['Queue', 3200, 300], ['Next', 4300, 1020], ['Reception', 4240, 260]].forEach(([s2, x, y]) => gc.fillText(s2, (x + OX) / 2, (y + OY) / 2));
          gc.lineWidth = 3; gc.beginPath(); gc.arc((1080 + OX) / 2, (330 + OY) / 2, 35, 0, 7); gc.stroke();
          gc.beginPath(); gc.moveTo((2950 + OX) / 2, (1020 + OY) / 2); gc.lineTo((3150 + OX) / 2, (1000 + OY) / 2); gc.lineTo((3060 + OX) / 2, (880 + OY) / 2); gc.closePath(); gc.stroke();
          bc.save(); bc.filter = 'blur(1.3px)'; bc.globalAlpha = 0.08; bc.drawImage(gl, 0, 0); bc.restore();
        }
        // eraser swipes: arcs and figure-eights plus straight passes, softened
        const sm = H.layer(2400, 700), smc = sm.getContext('2d'); smc.lineCap = 'round';
        for (let i = 0; i < 150; i++) {
          const x = rr.range(0, 2400), y = rr.range(0, 700), R = rr.range(30, 85), a0 = rr.range(0, 6.28);
          smc.strokeStyle = `rgba(215,228,215,${rr.range(0.035, 0.075)})`; smc.lineWidth = rr.range(20, 38);
          smc.beginPath(); smc.ellipse(x, y, R, R * rr.range(0.3, 0.7), rr.range(-0.4, 0.4), a0, a0 + rr.range(1.5, 3.5)); smc.stroke();
        }
        for (let i = 0; i < 60; i++) {
          const x = rr.range(0, 2300), y = rr.range(20, 680);
          smc.strokeStyle = `rgba(215,228,215,${rr.range(0.03, 0.05)})`; smc.lineWidth = rr.range(25, 35);
          smc.beginPath(); smc.moveTo(x, y); smc.lineTo(x + rr.range(75, 190), y + rr.range(-10, 10)); smc.stroke();
        }
        bc.filter = 'blur(3.5px)'; bc.drawImage(sm, 0, 0); bc.filter = 'none';
        sc.imageSmoothingEnabled = true; sc.drawImage(base, 0, 0, SW, SH);
        // crisp full-res felt streaks inside the smears: fine parallel lines left by the eraser
        sc.lineCap = 'round';
        for (let i = 0; i < 1700; i++) {
          const x = rr.range(0, SW), y = rr.range(0, SH);
          sc.strokeStyle = `rgba(220,230,220,${rr.range(0.01, 0.025)})`; sc.lineWidth = rr.range(0.8, 2);
          sc.beginPath(); sc.moveTo(x, y); sc.quadraticCurveTo(x + 40, y + rr.range(-6, 6), x + rr.range(60, 140), y + rr.range(-8, 8)); sc.stroke();
        }
        // settled chalk dust specks
        for (let i = 0; i < 3500; i++) {
          sc.fillStyle = `rgba(235,240,232,${rr.range(0.04, 0.2)})`;
          sc.fillRect(rr.range(0, SW), rr.range(0, SH), rr.range(0.8, 1.8), rr.range(0.8, 1.8));
        }
        XC.slate = sl;
        // fine slate tooth: a seamless 256px tile of 1-2px light/dark grain, laid over the board in world space
        const TS = 256, tile = H.layer(TS, TS), tc = tile.getContext('2d'), img = tc.createImageData(TS, TS), d = img.data, r2 = H.rng(21);
        const coarse = new Float32Array(64 * 64); for (let i = 0; i < coarse.length; i++) coarse[i] = r2() - 0.5;
        for (let y = 0, p = 0; y < TS; y++) for (let x = 0; x < TS; x++, p++) {
          const v = (r2() - 0.5) * 0.9 + coarse[((y >> 2) & 63) * 64 + ((x >> 2) & 63)] * 0.7 + coarse[((y >> 1) & 63) * 64 + ((x * 3 >> 3) & 63)] * 0.4;
          const i = p * 4, on = v > 0 ? 255 : 0; d[i] = on; d[i + 1] = on; d[i + 2] = on; d[i + 3] = Math.min(255, Math.abs(v) * 24);
        }
        tc.putImageData(img, 0, 0);
        XC.tooth = tile;
      }
      ctx.save(); apply(ctx);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(XC.slate, -200, -200, 4800, 1400);
      ctx.fillStyle = XC.toothPat || (XC.toothPat = ctx.createPattern(XC.tooth, 'repeat')); ctx.fillRect(-200, -200, 4800, 1400);
      ctx.restore();
      // classroom light: warm hot-spot upper-left of centre, darker falloff to the edges (as in the still)
      {
        const lit = ctx.createRadialGradient(560, 260, 100, 640, 360, 900);
        lit.addColorStop(0, 'rgba(120,150,130,0.10)'); lit.addColorStop(1, 'rgba(0,10,5,0.35)');
        ctx.fillStyle = lit; ctx.fillRect(0, 0, W, H_);
      }

      // ---------- chalk ----------
      const CL = H.layer(W*RES,H_*RES), c = CL.getContext('2d');c.scale(RES,RES);
      c.lineCap = 'round'; c.lineJoin = 'round';
      const chalk = (P, rgb, w, seed, prog) => {
        if (prog < 1) P = P.slice(0, Math.max(2, Math.ceil(P.length * prog)));
        const rr = H.rng(seed), N = normals(P);
        for (let k = 0; k < 4; k++) {
          const off = (k / 3 - 0.5) * w * 0.7 + rr.range(-0.5, 0.5), a = 0.9 * rr.range(0.75, 1);
          c.lineWidth = w * rr.range(0.5, 0.72);
          for (let i = 0; i < P.length - 1; i += 6) {
            c.strokeStyle = H.rgba(rgb, Math.min(1, a * (0.7 + 0.3 * nz.n2(i * 0.04 + k, seed * 0.17))));
            c.beginPath();
            for (let j = i; j <= Math.min(P.length - 1, i + 6); j++) { const x = P[j][0] + N[j][0] * off, y = P[j][1] + N[j][1] * off; j === i ? c.moveTo(x, y) : c.lineTo(x, y); }
            c.stroke();
          }
        }
      };
      const measure = (it, p) => {
        c.save(); c.font = fontOf(it); const w = c.measureText(it.s).width, x0 = it.align === 'center' ? it.x - w / 2 : it.x;
        const w2 = c.measureText(it.s.slice(0, Math.ceil(it.s.length * p))).width; c.restore();
        return [x0 + w2, it.y - it.size * 0.3];
      };
      c.save(); apply(c);
      for (const it of items) {
        const p = it.inst ? 1 : XE.win(t, it.a, it.b);
        if (p <= 0) continue;
        const rgb = COL[it.role];
        if (it.k === 'line') {
          const seed = ((it.pts[0][0] * 13 + it.pts[0][1] * 7) | 0) + 3;
          chalk(wob(seg(it.pts, 2.5), nz, seed % 89, it.inst ? 0.5 : 1.3), rgb, it.w * 1.45, seed, p);
        } else if (it.k === 'dot') {
          c.fillStyle = H.rgba(rgb, 0.9); c.beginPath(); c.arc(it.x, it.y, it.r * 1.1, 0, 7); c.fill();
        } else {
          c.save(); c.font = fontOf(it);
          const wAll = c.measureText(it.s).width, x0 = it.align === 'center' ? it.x - wAll / 2 : it.x;
          c.translate(x0, it.y); c.rotate(it.rot);
          const rr = H.rng((it.s.length * 31 + (it.x | 0)) % 991), n = Math.ceil(it.s.length * p);
          let px = 0;
          for (let i = 0; i < n; i++) {
            const ch = it.s[i], w = c.measureText(ch).width;
            c.fillStyle = H.rgba(rgb, 0.95 * rr.range(0.8, 1));
            c.save(); c.translate(px, rr.range(-1.5, 1.5)); c.rotate(rr.range(-0.04, 0.04)); glyph(c,ch,0,0);
            if (it.font === 'num' && it.role === 'acc3') { c.fillStyle = H.rgba([228, 255, 215], 0.9); glyph(c,ch,.8,-.6); } // final result: pressed harder, a second pass of chalk
            c.restore();
            px += w;
          }
          c.restore();
        }
      }
      c.restore();
      // grain anchored to the board: chalk only catches the slate's high points
      {
        const id = c.getImageData(0, 0, W*RES, H_*RES), d = id.data, iz = 1 / z;
        for (let i = 0, p = 0; i < d.length; i += 4, p++) {
          const a = d[i + 3] / 255; if (!a) continue;
          const x = (p % (W*RES))/RES, y = Math.floor(p/(W*RES))/RES;
          const wx = ((x - W / 2) * iz + cam[0]) * 1.1 | 0, wy = ((y - H_ / 2) * iz + cam[1]) * 1.1 | 0;
          let h = Math.imul(wx, 374761393) + Math.imul(wy, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); h = ((h ^ (h >>> 16)) >>> 0) / 4294967296;
          const h2 = nz.n2(wx * 0.18, wy * 0.18) * 0.5 + 0.5;
          const g = h * 0.5 + h2 * 0.5;
          d[i + 3] = 255 * Math.min(1, a * 1.15) * H.clamp((g - (1 - a) * 0.95 - 0.06) * 3.0);
        }
        c.putImageData(id, 0, 0);
      }
      ctx.save(); ctx.filter = `blur(${4*RES}px)`; ctx.globalAlpha = 0.22; ctx.drawImage(CL, 0, 0,W,H_); ctx.restore();
      ctx.drawImage(CL, 0, 0,W,H_);

      // ---------- chalk tray along the bottom of the board ----------
      ctx.save(); apply(ctx);
      const ty = 646;
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(-300, ty - 8, 5000, 8);
      if (!XC.tray) { // oak ledge with grain, a chalk-dust drift and specks, built once at 1:1
        const TW = 5000, TH = 90, tr = H.layer(TW*RES,TH*RES), tc = tr.getContext('2d'), r4 = H.rng(55);tc.scale(RES,RES);
        const tg2 = tc.createLinearGradient(0, 0, 0, TH);
        tg2.addColorStop(0, '#9a6a3c'); tg2.addColorStop(0.35, '#7a4f2a'); tg2.addColorStop(0.36, '#5e3a1c'); tg2.addColorStop(1, '#3e2510');
        tc.fillStyle = tg2; tc.fillRect(0, 0, TW, TH);
        for (let i = 0; i < 90; i++) {
          const o = r4() * TH, dark = r4.chance(0.6), fq = r4.range(0.002, 0.008), amp = r4.range(0.5, 2.5), ph = r4.range(0, 6);
          tc.strokeStyle = dark ? `rgba(50,28,10,${r4.range(0.12, 0.35)})` : `rgba(210,160,100,${r4.range(0.06, 0.16)})`; tc.lineWidth = r4.range(0.6, 2);
          tc.beginPath(); for (let x = 0; x <= TW; x += 20) { const y = o + Math.sin(x * fq + ph) * amp + nz.n2(x * 0.004, i) * 2; x ? tc.lineTo(x, y) : tc.moveTo(x, y); } tc.stroke();
        }
        tc.fillStyle = 'rgba(255,230,190,0.28)'; tc.fillRect(0, 31, TW, 1.5); // front lip highlight
        const dg = tc.createLinearGradient(0, 0, 0, 30); dg.addColorStop(0, 'rgba(235,235,225,0.34)'); dg.addColorStop(1, 'rgba(235,235,225,0.07)');
        tc.fillStyle = dg; tc.fillRect(0, 0, TW, 30);
        for (let i = 0; i < 26; i++) { const x = r4.range(0, TW), g3 = tc.createRadialGradient(x, 15, 2, x, 15, 70); g3.addColorStop(0, 'rgba(240,240,230,0.22)'); g3.addColorStop(1, 'rgba(240,240,230,0)'); tc.fillStyle = g3; tc.fillRect(x - 70, 0, 140, 30); }
        for (let i = 0; i < 5000; i++) { tc.fillStyle = `rgba(245,245,238,${r4.range(0.1, 0.5)})`; tc.fillRect(r4.range(0, TW), Math.pow(r4(), 1.6) * 28, r4.range(0.8, 2.2), r4.range(0.8, 1.6)); }
        XC.tray = tr;
      }
      ctx.drawImage(XC.tray, -300, ty,5000,90);
      [[230, 90, [242, 242, 236], -0.03], [380, 46, [246, 220, 110], 0.05], [1250, 60, [242, 150, 172], -0.02], [1380, 40, [150, 205, 238], 0.08]].forEach(([x, len, col, rot]) => {
        ctx.save(); ctx.translate(x, ty + 11); ctx.rotate(rot);
        ctx.fillStyle = 'rgba(30,15,5,0.35)'; ctx.beginPath(); ctx.ellipse(len / 2 + 3, 8, len / 2 + 2, 4, 0, 0, 7); ctx.fill();
        const g2 = ctx.createLinearGradient(0, -8, 0, 8); g2.addColorStop(0, H.rgba(H.mix(col, '#ffffff', 0.5))); g2.addColorStop(0.4, H.rgba(col)); g2.addColorStop(1, H.rgba(H.mix(col, '#000000', 0.35)));
        ctx.fillStyle = g2; ctx.beginPath(); ctx.roundRect(0, -8, len, 16, 7); ctx.fill();
        ctx.fillStyle = H.rgba(H.mix(col, '#ffffff', 0.3)); ctx.beginPath(); ctx.ellipse(len - 2, 0, 3, 8, 0, 0, 7); ctx.fill();
        ctx.restore();
      });
      ctx.restore();

      ctx.save();
      ctx.drawImage(XC.tray,0,32*RES,1280*RES,16*RES,0,0,W,18);
      ctx.translate(0,18);ctx.rotate(Math.PI/2);ctx.drawImage(XC.tray,0,32*RES,720*RES,16*RES,0,-18,H_,18);ctx.restore();
      ctx.save();ctx.translate(W,18);ctx.rotate(Math.PI/2);ctx.drawImage(XC.tray,0,32*RES,720*RES,16*RES,0,0,H_,18);ctx.restore();
      // ---------- air dust + chalk stick ----------
      const rr = H.rng(90);
      for (let i = 0; i < 60; i++) {
        const x0 = rr.range(0, W), sp = rr.range(8, 22), ph = rr.range(0, 800);
        const y = ((ph + t * sp) % 760) - 20, x = x0 + Math.sin(t * 0.8 + i) * 8;
        ctx.fillStyle = `rgba(240,244,236,${rr.range(0.1, 0.3)})`; ctx.beginPath(); ctx.arc(x, y, rr.range(0.6, 1.4), 0, 7); ctx.fill();
      }
      H.vignette(ctx, W, H_, 0.35, '0,8,4');
      const tp = XE.tipOf(items, t, measure);
      if (tp) {
        const [tx, ty2] = toS(tp), ang = 0.8;
        for (let i = 0; i < 22; i++) {
          const r3 = H.rng(Math.floor(t * 30) * 100 + i);
          ctx.fillStyle = `rgba(240,244,236,${r3.range(0.15, 0.5)})`;
          ctx.fillRect(tx + r3.range(-12, 12), ty2 + r3.range(0, 30), r3.range(0.8, 2), r3.range(0.8, 2));
        }
        ctx.save();
        ctx.save(); ctx.filter = `blur(${6*RES}px)`; ctx.fillStyle = 'rgba(0,10,5,0.4)'; ctx.translate(tx + 16, ty2 + 20); ctx.rotate(ang); ctx.fillRect(4, -7, 80, 14); ctx.restore();
        ctx.translate(tx, ty2); ctx.rotate(ang);
        const g2 = ctx.createLinearGradient(0, -8, 0, 8); g2.addColorStop(0, '#ffffff'); g2.addColorStop(0.45, '#ecece4'); g2.addColorStop(1, '#a9aaa2');
        ctx.fillStyle = g2; ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(6, -8); ctx.lineTo(86, -8); ctx.lineTo(86, 8); ctx.lineTo(6, 8); ctx.lineTo(0, 4); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      H.grain(ctx, W, H_, 0.03, 5 + (Math.floor(t * 12) % 4));
    }

  function soundKit(k){
      // the stick meets the slate: a dull knock with a little classroom air
      const knock = (t, g = 1, pan = 0, minor = true) => {
        k.tone(t, { f: [[0, 150], [0.05, 90]], dur: 0.07, gain: 0.1 * g, pan, minor, verb: 0.12 });
        k.noise(t, { dur: 0.025, filter: 'bandpass', f: 900, q: 1.2, gain: 0.15 * g, a: 0.001, pan, minor, verb: 0.12 });
      };
      // one chalk line: knock, then the drag for the whole draw-on
      const LV = 0.45; // drawing sits well under the hits
      const ch = (a, b, g = 1, pan = 0, minor = true) => {
        const d = Math.max(0.03, b - a); g *= LV;
        knock(a, g, pan, minor);
        k.play('stroke', a, { material: 'chalk', dur: d, gain: 0.95 * g, pan, minor });
      };
      // handwriting: one chalk stroke per word, timed by character position like the explainer's per-letter reveal
      const write = (s, a, b, g = 0.9, pan = 0, minor = true) => {
        const n = s.length, re = /\S+/g; let m;
        while ((m = re.exec(s))) ch(a + (b - a) * m.index / n, a + (b - a) * (m.index + m[0].length) / n, g, pan, minor);
      };
      const tap = (t, g = 1, pan = 0) => { k.noise(t, { dur: 0.02, filter: 'bandpass', f: 1500, q: 1.4, gain: 0.25 * g, a: 0.001, pan, minor: true }); k.tone(t, { f: 180, dur: 0.035, gain: 0.07 * g, pan, minor: true }); };
      // chalk dust drifting off the board after a hard stroke (soft, slow, low)
      const dust = (t, g = 1, pan = 0) => k.noise(t, { dur: 0.45, color: 'pink', filter: 'bandpass', f: 1400, q: 0.5, gain: 0.05 * g, a: 0.12, pan, minor: true });


 return {knock,ch,write,tap,dust};}
window.STYLE_PACKS=window.STYLE_PACKS||{};STYLE_PACKS['chalkboard-lesson']={setScale,render,XE,seg,wob,ell,quad,soundKit};
}
