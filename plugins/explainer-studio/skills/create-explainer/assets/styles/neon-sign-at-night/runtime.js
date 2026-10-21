{
  // ---------- neon sign on a night brick wall ----------
  const COL = {
    pink: { core: [255, 236, 246], tube: [255, 70, 165], glow: [255, 25, 125], dark: [52, 26, 40] },
    cyan: { core: [228, 255, 255], tube: [70, 228, 255], glow: [0, 150, 255], dark: [22, 38, 48] },
    warm: { core: [255, 250, 228], tube: [255, 196, 80], glow: [255, 120, 15], dark: [48, 38, 26] },
  };
  const WALL_BASE = 596;

  function mask(W, Hh, fn) {
    const c = H.layer(W, Hh), x = c.getContext('2d');
    x.fillStyle = '#fff'; x.strokeStyle = '#fff'; x.lineCap = 'round'; x.lineJoin = 'round';
    fn(x); return c;
  }
  function colorize(m, rgb, a = 1) {
    const c = H.layer(m.width, m.height), x = c.getContext('2d');
    x.drawImage(m, 0, 0); x.globalCompositeOperation = 'source-in';
    x.fillStyle = H.rgba(rgb, a); x.fillRect(0, 0, c.width, c.height); return c;
  }
  function erode(m, r) {
    const c = H.layer(m.width, m.height), x = c.getContext('2d');
    x.drawImage(m, 0, 0); x.globalCompositeOperation = 'destination-in';
    for (let a = 0; a < 8; a++) x.drawImage(m, Math.round(Math.cos(a * Math.PI / 4) * r), Math.round(Math.sin(a * Math.PI / 4) * r));
    return c;
  }
  // cheap big blur: downsample, blur, return small canvas (caller scales it back up)
  function blurSmall(src, px, s = 0.25) {
    const w = Math.ceil(src.width * s), h = Math.ceil(src.height * s), c = H.layer(w, h), x = c.getContext('2d');
    x.filter = `blur(${Math.max(0.5, px * s)}px)`; x.drawImage(src, 0, 0, w, h); return c;
  }
  function addBlur(g, src, px, a, W, Hh) {
    const s = px > 24 ? 0.125 : px > 8 ? 0.25 : 0.5;
    g.globalAlpha = a; g.drawImage(blurSmall(src, px, s), 0, 0, W, Hh);
  }

  // ================= EXPLAINER: camera pans along one long wall of neon signs =================
  const NX = { pink: [255, 70, 165], cyan: [70, 228, 255], warm: [255, 190, 70], red: [255, 48, 36], green: [90, 255, 120], violet: [175, 110, 255] };
  let RES=1;
  const setScale=v=>{if(RES===v)return false;RES=v;brickTile=edgeTiles=paveTile=null;TEXT.clear();return true;};
  let brickTile = null;
  function getBrickTile() {
    if (brickTile) return brickTile;
    const TW = 92 * 14 * RES, TH = 600 * RES, rowH = 30, brW = 92, mort = 5;
    const c = H.layer(TW, TH), x = c.getContext('2d'), img = x.createImageData(TW, TH), d = img.data;
    const R = H.rng(4401), nz = H.makeNoise(4402);
    const cols = [[230, 106, 76], [200, 90, 66], [245, 130, 92], [180, 96, 78], [220, 120, 90], [140, 76, 62]];
    const bh = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
    for (let iy = 0; iy < TH; iy++) { const y=iy/RES;
      const row = Math.floor(y / rowH), ly = y - row * rowH, off = (row % 2) * (brW / 2);
      for (let ix = 0; ix < TW; ix++) { const xx=ix/RES;
        const col = Math.floor((xx + off) / brW) % 14, lxp = (xx + off) % brW;
        const h1 = bh(row, col), h2 = bh(col + 9, row + 3), g = R() - 0.5;
        const ang = ix / TW * Math.PI * 2, st = nz.n3(Math.cos(ang) * 3, Math.sin(ang) * 3, y * 0.012) * 0.3;
        const ej = (bh(xx >> 2, row) - 0.5) * 2.2;
        let r, gg, b;
        if (ly < mort + ej * 0.5 || lxp < mort + ej * 0.6) { const m = 0.5 + g * 0.3; r = 190 * m; gg = 182 * m; b = 172 * m; }
        else {
          const c0 = cols[Math.floor(h1 * cols.length)];
          const k = (0.85 + h2 * 0.3 + st) * (1 + g * 0.3) * (bh(xx * 0.37 | 0, y * 0.41 | 0) > 0.985 ? 0.55 : 1) * (ly - mort < 3 ? 1.15 : rowH - ly < 3 ? 0.75 : 1);
          r = c0[0] * k; gg = c0[1] * k; b = c0[2] * k;
        }
        const i = (iy * TW + ix) * 4; d[i] = r; d[i + 1] = gg; d[i + 2] = b; d[i + 3] = 255;
      }
    }
    x.putImageData(img, 0, 0);
    return (brickTile = c);
  }
  // brick-edge masks matching getBrickTile(): top-edge and bottom-edge alpha, so the sign light can catch brick arrises
  let edgeTiles = null;
  function getEdgeTiles() {
    if (edgeTiles) return edgeTiles;
    const TW = 92 * 14 * RES, TH = 600 * RES, rowH = 30, brW = 92, mort = 5;
    const bh = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
    const mk = () => { const c = H.layer(TW, TH), x = c.getContext('2d'); return [c, x, x.createImageData(TW, TH)]; };
    const [tc, tcx, ti] = mk(), [bc, bcx, bi] = mk(), td = ti.data, bd = bi.data;
    for (let iy = 0; iy < TH; iy++) { const y=iy/RES;
      const row = Math.floor(y / rowH), ly = y - row * rowH, off = (row % 2) * (brW / 2);
      for (let ix = 0; ix < TW; ix++) { const xx=ix/RES;
        const lxp = (xx + off) % brW, ej = (bh(xx >> 2, row) - 0.5) * 2.2;
        if (ly < mort + ej * 0.5 || lxp < mort + ej * 0.6) continue;
        const top = ly - (mort + ej * 0.5), bot = rowH - ly, i = (iy * TW + ix) * 4;
        if (top < 3.5) { td[i] = td[i + 1] = td[i + 2] = 255; td[i + 3] = 255 * (1 - top / 3.5) * (lxp - mort < 2 ? 0.5 : 1); }
        if (bot < 3) { bd[i] = bd[i + 1] = bd[i + 2] = 255; bd[i + 3] = 255 * (1 - bot / 3); }
      }
    }
    tcx.putImageData(ti, 0, 0); bcx.putImageData(bi, 0, 0);
    tcx.globalAlpha = 0.55; tcx.drawImage(bc, 0, 0);
    return (edgeTiles = { both: tc });
  }
  // wet sidewalk tile (concrete, aggregate speckle) + puddle alpha, periodic in x so it pans with the wall
  let paveTile = null;
  function getPaveTile(W) {
    if (paveTile && paveTile.w === W) return paveTile;
    const PW = W * 2 * RES, PH = 120 * RES, nz = H.makeNoise(4410), R = H.rng(4411);
    const c = H.layer(PW, PH), x = c.getContext('2d'), img = x.createImageData(PW, PH), d = img.data;
    const p = H.layer(PW, PH), px = p.getContext('2d'), pimg = px.createImageData(PW, PH), pd = pimg.data;
    for (let iy = 0; iy < PH; iy++) for (let ix = 0; ix < PW; ix++) {const y=iy/RES,xx=ix/RES;
      const a = ix / PW * Math.PI * 2, cx0 = Math.cos(a), sx0 = Math.sin(a);
      const g = R() - 0.5, st = nz.n3(cx0 * 9, sx0 * 9, y * 0.06) * 0.5 + nz.n3(cx0 * 40, sx0 * 40, y * 0.25) * 0.3;
      let base = 22 + g * 12 + st * 9;
      if (y < 4) base = 54 + g * 14 - y * 3; else if (y < 12) base = 40 + g * 14 - (y - 4) * 1.6; // curb lip
      base *= 1 - iy / PH * 0.35;
      const i = (iy * PW + ix) * 4; d[i] = base * 0.92; d[i + 1] = base * 0.95; d[i + 2] = base * 1.1; d[i + 3] = 255;
      const v = nz.n3(cx0 * 4.5, sx0 * 4.5, y * 0.03 + 20) + 0.4 * nz.n3(cx0 * 12, sx0 * 12, y * 0.08);
      pd[i] = pd[i + 1] = pd[i + 2] = 255; pd[i + 3] = 255 * H.smooth(-0.12, 0.08, v) * H.smooth(6, 16, y);
    }
    x.putImageData(img, 0, 0); px.putImageData(pimg, 0, 0);
    // aggregate speckle catching light
    for (let k = 0; k < 1400; k++) { x.fillStyle = `rgba(200,200,220,${R() * 0.16})`; x.fillRect(R() * PW, (12 + Math.pow(R(), 0.8) * (120 - 12))*RES, (1 + R())*RES, RES); }
    return (paveTile = { w: W, c, p, PW:PW/RES });
  }
  const TEXT=new Map();
  // Cache complete native text stamps. Their glass tubes may naturally cross the
  // viewport during a wall pan without drawing glyphs outside a scratch canvas.
  function stamp(g,s,x,y,font,align,lw,col){
    const key=[s,font,lw,col,RES,g.globalCompositeOperation].join('|');let q=TEXT.get(key);
    if(!q){const mc=H.layer(1,1).getContext('2d');mc.font=font;const m=mc.measureText(s),pad=lw+4,left=-m.actualBoundingBoxLeft,top=-m.actualBoundingBoxAscent;
      const w=Math.ceil(m.actualBoundingBoxRight-left+2*pad),h=Math.ceil(m.actualBoundingBoxAscent+m.actualBoundingBoxDescent+2*pad),cv=H.layer(Math.ceil(w*RES),Math.ceil(h*RES)),z=cv.getContext('2d');z.scale(RES,RES);z.font=font;z.globalCompositeOperation=g.globalCompositeOperation;z.fillStyle=z.strokeStyle=col;z.lineWidth=lw;z.lineCap=z.lineJoin='round';z.fillText(s,pad-left,pad-top);z.strokeText(s,pad-left,pad-top);q={cv,w,h,dx:left-pad,dy:top-pad,advance:m.width};TEXT.set(key,q);
    }
    g.drawImage(q.cv,x+q.dx-(align==='center'?q.advance/2:align==='right'?q.advance:0),y+q.dy,q.w,q.h);
  }
  function render(ctx, W, Hh, t, paint, cam=0) {
    const hs = (n) => { const v = Math.sin(n * 91.731 + 7.13) * 43758.5453; return v - Math.floor(v); };
    const ign = (t0, len = 0.3) => t < t0 ? 0 : t - t0 > len ? 1 : (hs(Math.floor(t * 40) + t0 * 977) > 0.42 ? 1 : 0);
    const sm = H.smooth, E = H.ease;
    const col = H.layer(W*RES, Hh*RES), cx = col.getContext('2d');
    const txt = H.layer(W*RES, Hh*RES), tx = txt.getContext('2d');
    const txtB = H.layer(W*RES, Hh*RES), tbx = txtB.getContext('2d'); // fat script glyphs: eroded harder so the hot core stays thin
    const core = H.layer(W*RES, Hh*RES), kx = core.getContext('2d');
    const off = H.layer(W*RES, Hh*RES), ox = off.getContext('2d');
    [cx, tx, tbx, kx, ox].forEach((c) => { c.scale(RES,RES);c.lineCap = 'round'; c.lineJoin = 'round'; c.translate(-cam, 0); });
    // physical hardware (world coords): glass-tube clips, electrode housings, painted-out blockout runs
    const HW = { clips: [], elec: [] }, USED = { thin: null, fat: null };
    const clip = (x, y, a = 0) => HW.clips.push([x, y, a]);
    const elec = (x, y, a) => HW.elec.push([x, y, a]);
    const blockout = (pathFn, w = 7) => {
      ox.save(); ox.strokeStyle = 'rgb(13,11,14)'; ox.lineWidth = w; pathFn(ox); ox.stroke();
      ox.strokeStyle = 'rgba(150,110,130,0.28)'; ox.lineWidth = w * 0.28; ox.translate(-1, -1.5); pathFn(ox); ox.stroke(); ox.restore();
    };
    const quadPt = (x0, y0, qx, qy, x1, y1, u) => [(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * qx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * qy + u * u * y1];
    const ellClip = (ex, ey, rx, ry, a) => clip(ex + Math.cos(a) * rx, ey + Math.sin(a) * ry, Math.atan2(Math.cos(a) * ry, -Math.sin(a) * rx));
    // blockout run between two words of a lettered line: dips under the baseline, electrodes where it enters the glass
    const wordGap = (s, cxw, y, font, splitAt, dip = 30) => {
      tx.font = font; const wd = tx.measureText(s).width, x0 = cxw - wd / 2;
      const xa = x0 + tx.measureText(s.slice(0, splitAt)).width - 10, xb = x0 + tx.measureText(s.slice(0, splitAt + 1)).width + 10;
      blockout((g) => { g.beginPath(); g.moveTo(xa, y - 4); g.bezierCurveTo(xa + 6, y + dip, xb - 6, y + dip, xb, y - 4); });
      elec(xa, y - 4, -1.9); elec(xb, y - 4, -1.25);
      return [x0, x0 + wd];
    };
    cx.globalCompositeOperation = 'lighter'; kx.globalCompositeOperation = 'lighter';
    const tube = (pathFn, c, k, w = 7) => {
      ox.strokeStyle = 'rgb(44,36,48)'; ox.lineWidth = w; pathFn(ox); ox.stroke();
      ox.strokeStyle = 'rgba(170,160,180,0.2)'; ox.lineWidth = w * 0.3; ox.save(); ox.translate(-1, -1.5); pathFn(ox); ox.stroke(); ox.restore();
      if (k <= 0) return;
      cx.strokeStyle = H.rgba(c, k); cx.lineWidth = w; pathFn(cx); cx.stroke();
      kx.strokeStyle = H.rgba(H.mix(c, [255, 255, 255], 0.82), k); kx.lineWidth = w * 0.36; pathFn(kx); kx.stroke();
    };
    const ntext = (s, x, y, font, c, k, align = 'center', lw = 3, ghost = true) => {
      if (ghost) { ox.font = font; ox.textAlign = align; ox.lineWidth = lw; ox.fillStyle = ox.strokeStyle = 'rgb(44,36,48)'; stamp(ox,s,x,y,font,align,lw,'rgb(44,36,48)'); }
      if (k <= 0) return;
      const fat = font.includes('Gloria');
      { // screen-space bbox of the lit text, so the core erosion only touches that region
        tx.font = font; const fsz = +(font.match(/(\d+)px/) || [0, 60])[1], w = tx.measureText(s).width, pad = lw + 8;
        const x0 = (align === 'center' ? x - w / 2 : x) - cam - pad, b = [x0, y - fsz * 1.15 - pad, x0 + w + 2 * pad, y + fsz * 0.55 + pad];
        const key = fat ? 'fat' : 'thin', o = USED[key];
        USED[key] = o ? [Math.min(o[0], b[0]), Math.min(o[1], b[1]), Math.max(o[2], b[2]), Math.max(o[3], b[3])] : b;
      }
      for (const [g, cc] of [[cx, c], [fat ? tbx : tx, H.mix(c, [255, 255, 255], 0.85)]]) {
        g.font = font; g.textAlign = align; g.lineWidth = fat && g === cx ? lw + 3 : lw; g.fillStyle = g.strokeStyle = H.rgba(cc, k);
        stamp(g,s,x,y,font,align,g.lineWidth,H.rgba(cc,k));
      }
    };
    const wordByLetter = (s, x, y, font, c, t0, dt, align = 'center') => {
      tx.font = font; const wd = tx.measureText(s).width; let x0 = align === 'center' ? x - wd / 2 : x;
      for (let i = 0; i < s.length; i++) { if (s[i] !== ' ') ntext(s[i], x0 + tx.measureText(s.slice(0, i)).width, y, font, c, ign(t0 + i * dt), 'left'); }
    };
    // segmented chase arrow along a quadratic; draws on segment by segment
    const arrow = (x0, y0, qx, qy, x1, y1, c, prog, n = 12, w = 6) => {
      const P = (u) => [(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * qx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * qy + u * u * y1];
      for (let i = 0; i < n; i++) {
        const a = P(i / n + 0.012), b = P((i + 1) / n - 0.012);
        const lit = prog * n > i + 0.5 ? 0.45 + 0.55 * ((((i - t * 14) % 4) + 4) % 4 < 1.4 ? 1 : 0) : 0;
        tube((g) => { g.beginPath(); g.moveTo(...a); g.lineTo(...b); }, c, lit, w);
      }
      const e = P(1), pe = P(0.94), ang = Math.atan2(e[1] - pe[1], e[0] - pe[0]);
      tube((g) => { g.beginPath(); g.moveTo(e[0] + Math.cos(ang + 2.5) * 22, e[1] + Math.sin(ang + 2.5) * 22); g.lineTo(...e); g.lineTo(e[0] + Math.cos(ang - 2.5) * 22, e[1] + Math.sin(ang - 2.5) * 22); }, c, prog >= 1 ? 1 : 0, w);
    };
    const frame = (x, y, w, h, c, k) => tube((g) => { g.beginPath(); g.roundRect(x, y, w, h, 14); }, c, k, 6);
    paint({tube,ntext,wordByLetter,arrow,frame,clip,elec,blockout,wordGap,quadPt,ellClip,ign,NX});
    // ---------- compose: brick wall lit by the signs ----------
    kx.setTransform(1,0,0,1,0,0);
    for(const [m,r0,b] of [[txt,2,USED.thin],[txtB,5,USED.fat]]){
      if(!b)continue;const rr=r0*RES,x0=Math.max(rr,Math.floor(b[0]*RES)),y0=Math.max(rr,Math.floor(b[1]*RES)),x1=Math.min(W*RES-rr,Math.ceil(b[2]*RES)),y1=Math.min(Hh*RES-rr,Math.ceil(b[3]*RES));
      if(x1-x0<2||y1-y0<2)continue;const bw=x1-x0,bh=y1-y0,c=H.layer(bw,bh),e=c.getContext('2d');
      e.drawImage(m,x0,y0,bw,bh,0,0,bw,bh);e.globalCompositeOperation='destination-in';
      for(let a=0;a<8;a++){const dx=Math.round(Math.cos(a*Math.PI/4)*rr),dy=Math.round(Math.sin(a*Math.PI/4)*rr);e.drawImage(m,x0-dx,y0-dy,bw,bh,0,0,bw,bh);}kx.drawImage(c,x0,y0);
    }
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, Hh);
    const tile = getBrickTile(), tw = tile.width/RES, tx0 = -(((cam % tw) + tw) % tw);
    for (let x = tx0; x < W; x += tw) ctx.drawImage(tile, x, 0,tw,600);
    const LW8 = W / 8, LH8 = Hh / 8;
    const L = H.layer(LW8, LH8), lx = L.getContext('2d');
    lx.fillStyle = 'rgb(30,34,52)'; lx.fillRect(0, 0, LW8, LH8);
    lx.globalCompositeOperation = 'lighter';
    lx.filter = 'blur(10px)'; lx.drawImage(col, 0, 0, LW8, LH8); lx.drawImage(col, 0, 0, LW8, LH8);
    lx.filter = 'blur(3px)'; lx.globalAlpha = 0.9; lx.drawImage(col, 0, 0, LW8, LH8);
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(L, 0, 0, W, Hh); ctx.restore();
    { // brick arrises catch the sign light: top edges where the light is above, bottom edges where it is below
      const Ld = lx.getImageData(0, 0, LW8, LH8).data;
      const rimC = H.layer(LW8, LH8), ri = rimC.getContext('2d').createImageData(LW8, LH8);
      const lum = (x, y) => { const k = (H.clamp(y, 0, LH8 - 1) * LW8 + x) * 4; return Ld[k] + Ld[k + 1] + Ld[k + 2]; };
      for (let y = 0; y < LH8; y++) for (let x = 0; x < LW8; x++) {
        const k = (y * LW8 + x) * 4, dir = H.clamp((lum(x, y - 1) - lum(x, y + 1)) / 90, -1, 1);
        const up = 0.3 + Math.abs(dir) * 1.3;
        ri.data[k] = Math.max(0, Ld[k] - 30) * up; ri.data[k + 1] = Math.max(0, Ld[k + 1] - 34) * up; ri.data[k + 2] = Math.max(0, Ld[k + 2] - 52) * up; ri.data[k + 3] = 255;
      }
      rimC.getContext('2d').putImageData(ri, 0, 0);
      const et = getEdgeTiles(), rim = H.layer(W*RES,600*RES), rx = rim.getContext('2d');rx.scale(RES,RES);
      for (let x = tx0; x < W; x += tw) rx.drawImage(et.both, x, 0,tw,600);
      rx.globalCompositeOperation = 'source-in'; rx.drawImage(rimC, 0, 0, LW8, 600 / 8, 0, 0, W, 600);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(rim, 0, 0,W,600); ctx.restore();
    }
    // tubes stand ~4cm off the wall: soft contact shadow, then the glass itself
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.6;
    ctx.drawImage(blurSmall(off, 4*RES, 0.25), 5, 9, W, Hh); ctx.restore();
    ctx.drawImage(off, 0, 0,W,Hh);
    // electrode housings where runs dive into the wall
    ctx.save(); ctx.translate(-cam, 0);
    for (const [x, y, a] of HW.elec) {
      if (x - cam < -40 || x - cam > W + 40) continue;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.fillStyle = '#0d0c0f'; ctx.beginPath(); ctx.roundRect(-7, -6, 22, 12, 4); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-4, -5, 15, 2);
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(13, -4, 4, 8);
      ctx.restore();
    }
    ctx.restore();
    // wet sidewalk: concrete tile panned with the wall
    const pave = getPaveTile(W), px0 = -(((cam % pave.PW) + pave.PW) % pave.PW);
    for (let x = px0; x < W; x += pave.PW) ctx.drawImage(pave.c, x, 600,pave.PW,120);
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, 600, W, 3);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // halos are blurred at low res with extra saturation, so the glass rim stays deep colour around a thin hot core
    const blurSat = (src, px, sc, sat) => { const w = Math.ceil(src.width * sc), h = Math.ceil(src.height * sc), c = H.layer(w, h), x = c.getContext('2d'); x.filter = `blur(${Math.max(0.5, px * RES * sc)}px) saturate(${sat})`; x.drawImage(src, 0, 0, w, h); return c; };
    ctx.globalAlpha = 0.55; ctx.drawImage(blurSat(col, 60, 0.125, 1.6), 0, 0, W, Hh);
    ctx.globalAlpha = 0.75; ctx.drawImage(blurSat(col, 18, 0.25, 1.8), 0, 0, W, Hh);
    ctx.globalAlpha = 0.6; ctx.drawImage(blurSat(col, 5, 0.5, 2.2), 0, 0, W, Hh);
    ctx.globalAlpha = 1; ctx.drawImage(col, 0, 0,W,Hh); ctx.drawImage(core, 0, 0,W,Hh);
    ctx.globalAlpha = 0.5; ctx.drawImage(blurSmall(core, 2.5*RES, 0.5), 0, 0, W, Hh);
    ctx.restore();
    // mounting clips over the glass
    ctx.save(); ctx.translate(-cam, 0);
    for (const [x, y, a] of HW.clips) {
      if (x - cam < -20 || x - cam > W + 20) continue;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.fillStyle = 'rgba(30,28,34,0.92)'; ctx.beginPath(); ctx.roundRect(-2.5, -8, 5, 16, 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(-1.5, -7, 1, 14);
      ctx.restore();
    }
    ctx.restore();
    // reflection in the wet pavement: rippled mirror rows, vertical streak smear, full mirror only inside puddles
    {
      const RS = 0.25, src = blurSmall(col, 6*RES, RS), GH = Hh - 600, refl = H.layer(W*RES,GH*RES), rfx = refl.getContext('2d');rfx.scale(RES,RES);
      for (let y = 604; y < Hh; y += 2) {
        const gy = y - 600, sy = 600 - gy / 0.3;
        if (sy < 0) break;
        const offx = Math.sin(y * 0.35 + t * 6) * (1.5 + gy * 0.035) + Math.sin(y * 0.11 - t * 2.3 + 1.7) * (1 + gy * 0.03);
        rfx.drawImage(src, 0, sy * RES * RS, src.width, (2 / 0.3) * RES * RS, offx, gy, W, 2);
      }
      const smear = H.layer(W, 10), smx = smear.getContext('2d');
      smx.filter = 'blur(1.5px)'; smx.drawImage(refl, 0, 4*RES, W*RES, (GH - 4)*RES, 0, 0, W, 10);
      const rm = H.layer(W*RES,GH*RES), rmx = rm.getContext('2d');rmx.scale(RES,RES);
      for (let x = px0; x < W; x += pave.PW) rmx.drawImage(pave.p, x, 0,pave.PW,120);
      rmx.globalCompositeOperation = 'source-in'; rmx.drawImage(refl, 0, 0,W,GH);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.45; ctx.drawImage(smear, 0, 0, W, 10, 0, 604, W, GH - 4);
      ctx.globalAlpha = 0.22; ctx.drawImage(refl, 0, 600,W,GH);
      ctx.globalAlpha = 0.6; ctx.drawImage(rm, 0, 600,W,GH);
      ctx.restore();
    }
    H.vignette(ctx, W, Hh, 0.55, '4,2,10');
    H.grain(ctx, W, Hh, 0.045, 31 + Math.floor(t * 24), false);
  }

  function soundKit(k){
    const sm=H.smooth,E=H.ease;
    const hs = (n) => { const v = Math.sin(n * 91.731 + 7.13) * 43758.5453; return v - Math.floor(v); }; // = neonExplainer hs
    const when = (f, v, a, b) => { for (let t = a; t <= b; t += 0.001) if (f(t) >= v) return t; return b; };
    // contactor / relay click as a sign's circuit closes: dull, low, no ring
    const relay = (t, g = 1, pan = 0) => {
      k.noise(t, { dur: 0.022, filter: 'bandpass', f: 1300, q: 1.4, gain: 0.32 * g, a: 0.001, pan });
      k.tone(t, { f: [[0, 190], [0.04, 75]], dur: 0.06, gain: 0.2 * g, pan });
    };
    // one stretch of lit tube: 120 Hz gas buzz (bright band + body) with a tiny spark at the strike
    const buzzRun = (t, dur, g, pan, f = 120) => {
      k.tone(t, { f, type: 'sawtooth', dur: dur + 0.012, gain: 0.075 * g, a: 0.002, hold: dur * 0.85, filter: 'bandpass', f2: 1700, q: 2, pan });
      k.tone(t, { f, type: 'sawtooth', dur: dur + 0.02, gain: 0.06 * g, a: 0.002, hold: dur * 0.85, filter: 'lowpass', f2: 480, pan });
      k.noise(t, { dur: 0.008, filter: 'highpass', f: 2600, gain: 0.12 * g, a: 0.001, pan });
    };
    // ign(t0, len) from the explainer, reproduced slot by slot (40 slots/s): buzz while lit, silence while dark,
    // then the latch tail where the tube holds and the buzz settles into the hum.
    const ignite = (t0, o = {}) => {
      const len = o.len || 0.3, g = o.gain == null ? 1 : o.gain, pan = o.pan || 0, f = o.f || 120;
      if (!o.noClick) relay(t0, g * (o.click || 1), pan);
      let s = Math.floor(t0 * 40), run = null;
      const flush = (end) => { if (run != null && end - run > 0.004) buzzRun(run, end - run, g, pan, f); run = null; };
      for (; s / 40 < t0 + len; s++) {
        const a = Math.max(t0, s / 40), b = Math.min((s + 1) / 40, t0 + len), on = hs(s + t0 * 977) > 0.42;
        if (on && run == null) run = a; else if (!on) flush(a);
        if (b >= t0 + len) break;
      }
      flush(t0 + len);
      k.tone(t0 + len, { f, type: 'sawtooth', dur: o.tail || 0.35, gain: 0.06 * g, a: 0.004, filter: 'bandpass', f2: 900, q: 1.5, pan });
    };
    // chase-light arrow: one relay tick per segment that latches (segment i lit when prog*n > i+0.5), throttled
    const chase = (a, b, n, pan, gap = 0.08) => {
      let last = -1;
      for (let i = 0; i < n; i++) { const ti = when((t) => sm(a, b, t) * n, i + 0.5 + 1e-6, a, b + 0.01);
        if (ti - last >= gap) { k.noise(ti, { dur: 0.016, filter: 'bandpass', f: 1500 + i * 25, q: 2, gain: 0.22, a: 0.001, pan, minor: true }); last = ti; } }
      ignite(b, { len: 0.06, gain: 0.55, pan, noClick: true, tail: 0.18 }); // arrowhead latches when prog hits 1
    };

    return {relay,buzzRun,ignite,chase};
  }
  window.STYLE_PACKS=window.STYLE_PACKS||{};STYLE_PACKS['neon-sign-at-night']={setScale,render,NX,soundKit};
}
