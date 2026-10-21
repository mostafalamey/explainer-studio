{
  // ---------- 1950s broadsheet front page on yellowed newsprint ----------
  const PAPER = [228, 214, 178];
  const INK = [30, 28, 27];
  const SYL = ['lo', 're', 'm', 'ip', 'sum', 'dol', 'or', 'sit', 'am', 'et', 'con', 'sec', 'te', 'tur', 'ad', 'pis', 'cing', 'el', 'it', 'sed', 'do', 'ei', 'us', 'mod', 'tem', 'por', 'in', 'ci', 'di', 'unt', 'ut', 'la', 'bo', 'ma', 'gna', 'ali', 'qua', 'en', 'im', 'mi', 'nim', 've', 'ni', 'quis', 'nos', 'tru', 'ex', 'er', 'ta', 'tion', 'ul', 'lam', 'co', 'nis', 'al', 'iq', 'uip', 'ea', 'com', 'mo', 'du', 'aut', 'ir', 'ure'];
  const L = 48, R = 1232, COLW = 184, GUT = 16;
  const colX = (c) => L + c * (COLW + GUT);

  const words = (r, n) => {
    const out = []; let cap = true;
    for (let i = 0; i < n; i++) {
      let w = ''; const k = r.chance(0.15) ? 1 : r.int(1, 3);
      for (let j = 0; j < k; j++) w += r.pick(SYL);
      if (r.chance(0.03)) w = String(r.int(2, 1957));
      if (cap) w = w[0].toUpperCase() + w.slice(1);
      cap = false;
      if (r.chance(0.09)) { w += '.'; cap = true; } else if (r.chance(0.07)) w += ',';
      out.push(w);
    }
    return out;
  };

  // justified greeked column text; returns y after
  const column = (x, r, cx, y0, y1, opts = {}) => {
    const lh = 12.6, wcache = {};
    x.font = '400 10.4px "Libre Baskerville"'; x.textBaseline = 'alphabetic'; x.textAlign = 'left';
    const sw = x.measureText(' ').width;
    const mw = (w) => wcache[w] ?? (wcache[w] = x.measureText(w).width);
    let y = y0 + lh, first = true, dlDone = false;
    let pool = [];
    while (y < y1) {
      if (opts.dateline && !dlDone) { dlDone = true;
        x.font = '700 10.4px "Libre Baskerville"'; const dl = opts.dateline; x.fillText(dl, cx + 10, y);
        const dw = x.measureText(dl).width; x.font = '400 10.4px "Libre Baskerville"';
        // continue same line
        let lineW = dw + 10 + sw, lw = [];
        if (pool.length < 30) pool = pool.concat(words(r, 60));
        while (pool.length && lineW + mw(pool[0]) <= COLW) { lw.push(pool.shift()); lineW += mw(lw[lw.length - 1]) + sw; }
        let xx = cx + 10 + dw + sw; const extra = (COLW - (lineW - sw)) / Math.max(1, lw.length);
        for (const w of lw) { x.fillText(w, xx, y); xx += mw(w) + sw + extra; }
        y += lh; first = false; continue;
      }
      const indent = first ? 10 : 0; first = false;
      if (pool.length < 30) pool = pool.concat(words(r, 60));
      const line = []; let lw = indent;
      while (pool.length && lw + mw(pool[0]) <= COLW) { const w = pool.shift(); line.push(w); lw += mw(w) + sw; }
      const endPara = r.chance(0.08) || (line.length && line[line.length - 1].endsWith('.') && r.chance(0.3));
      const natural = lw - sw;
      const gap = endPara ? sw : sw + (COLW - natural) / Math.max(1, line.length - 1);
      let xx = cx + indent;
      for (const w of line) { x.fillText(w, xx, y); xx += mw(w) + gap; }
      y += lh;
      if (endPara) { first = true; if (opts.subheads && r.chance(0.18) && y < y1 - 40) { x.font = '700 10.4px "Libre Baskerville"'; x.textAlign = 'center'; x.fillText(r.pick(['Calculates in Seconds', 'Tubes Glow All Night', 'Memory on Tape', 'Asks Its Own Questions']), cx + COLW / 2, y + 4); x.textAlign = 'left'; x.font = '400 10.4px "Libre Baskerville"'; y += lh + 6; } }
    }
    return y;
  };

  const rule = (x, x0, x1, y, h) => x.fillRect(x0, y, x1 - x0, h);

  let RES=1;
  const NE = H.ease, ncl = H.clamp, nseg = (t, a, b) => ncl((t - a) / (b - a));
  const nhash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  let NX = null;

  const graySrc = (w, h, fn, blur = 1.1) => { const c = H.layer(w, h), x = c.getContext('2d'); fn(x); const o = H.layer(w, h), ox = o.getContext('2d'); ox.filter = `blur(${blur}px)`; ox.drawImage(c, 0, 0); return { d: ox.getImageData(0, 0, w, h).data, w, h }; };
  // coarse 45° halftone of a grey source into page rect
  const halfDots = (k, src, x0, y0, dw, dh, cell = 4.6) => {
    const ca = Math.SQRT1_2, ext = Math.hypot(dw, dh);
    k.save(); k.beginPath(); k.rect(x0, y0, dw, dh); k.clip(); k.translate(x0, y0); k.fillStyle = '#000'; k.beginPath();
    for (let v = -ext; v < ext; v += cell) for (let u = -ext; u < ext; u += cell) {
      const px = (u - v) * ca, py = (u + v) * ca;
      if (px < -cell || py < -cell || px > dw + cell || py > dh + cell) continue;
      const sx = ncl(px * src.w / dw, 0, src.w - 1) | 0, sy = ncl(py * src.h / dh, 0, src.h - 1) | 0;
      const dark = 1 - ncl((src.d[(sy * src.w + sx) * 4] / 255 - 0.06) / 0.86);
      const rr = cell * 0.62 * Math.sqrt(Math.max(0, dark * 1.08 - 0.02)); if (rr < 0.3) continue;
      k.moveTo(px + rr, py); k.arc(px, py, rr, 0, Math.PI * 2);
    }
    k.fill(); k.restore(); k.lineWidth = 1; k.strokeRect(x0, y0, dw, dh);
  };
  // newspaper diagram arrow: hairline-crisp shaft, solid head, drawn on
  const npArrow = (k, p0, cp, p1, u, w = 3.5) => {
    if (u <= 0) return;
    const q = (s) => [(1 - s) * (1 - s) * p0[0] + 2 * (1 - s) * s * cp[0] + s * s * p1[0], (1 - s) * (1 - s) * p0[1] + 2 * (1 - s) * s * cp[1] + s * s * p1[1]];
    k.save(); k.lineWidth = w; k.lineCap = 'butt'; k.beginPath(); k.moveTo(p0[0], p0[1]); for (let i = 1; i <= 30 * u; i++) { const p = q(i / 30); k.lineTo(p[0], p[1]); }
    const e = q(u), b = q(Math.max(0, u - 0.04)), a = Math.atan2(e[1] - b[1], e[0] - b[0]); k.lineTo(e[0], e[1]); k.stroke();
    k.beginPath(); k.moveTo(e[0] + Math.cos(a) * 14, e[1] + Math.sin(a) * 14); k.lineTo(e[0] + Math.cos(a + 2.6) * 13, e[1] + Math.sin(a + 2.6) * 13); k.lineTo(e[0] + Math.cos(a - 2.6) * 13, e[1] + Math.sin(a - 2.6) * 13); k.closePath(); k.fill(); k.restore();
    return q;
  };
  const txt = (k, s, font, x, y, align = 'left', ls = 0) => { k.font = font; k.textAlign = align; k.textBaseline = 'alphabetic'; k.letterSpacing = ls + 'px'; k.fillText(s, x, y); k.letterSpacing = '0px'; };
  const reverseBar = (k, x0, y0, w, h, s) => { k.fillRect(x0, y0, w, h); k.save(); k.globalCompositeOperation = 'destination-out'; txt(k, s, '700 15px "Libre Baskerville"', x0 + 12, y0 + h / 2 + 5, 'left', 2); k.restore(); };

  const renderSheet = (W, H_, draw, t, cam) => {
    const [cx, cy, z] = cam;
    const PW=Math.round(W*RES),PH=Math.round(H_*RES);const ink = H.layer(PW, PH), k = ink.getContext('2d');
    k.setTransform(z*RES, 0, 0, z*RES, (W / 2 - cx * z)*RES, (H_ / 2 - cy * z)*RES);
    draw(k,t);
    const fd = k.getImageData(0, 0, PW, PH).data, bd = NX.back;
    const img = new ImageData(PW, PH), o = img.data, { low, GW, GH } = NX;
    const iz = 1 / z;
    for (let y = 0; y < PH; y++) {
      const py = cy + (y/RES - H_ / 2) * iz, ipy = py | 0;
      for (let x = 0; x < PW; x++) {
        const i = (y * PW + x) * 4, px = cx + (x/RES - W / 2) * iz, ipx = px | 0;
        if (px < 0 || py < 0 || px >= 1280 || py >= 720) {
          const dd = Math.max(-px, px - 1280, -py, py - 720), sh = 1 - 0.5 * Math.exp(-dd / 10);
          const n = (nhash(x, y, 3) - 0.5) * 6; o[i] = (38 + n) * sh; o[i + 1] = (32 + n) * sh; o[i + 2] = (28 + n) * sh; o[i + 3] = 255; continue;
        }
        const li = ((py * GH / 720) | 0) * GW + ((px * GW / 1280) | 0), m = low[li * 2], f = low[li * 2 + 1], hh = nhash(ipx, ipy, 1);
        const edge = Math.min(px, 1280 - px, py * 1.3, 720 - py) / 120, age = 0.07 * (1 - ncl(edge)) + m * 0.035 + f * 0.015;
        let r = PAPER[0] * (1 - age * 0.7) + (hh - 0.5) * 12, g = PAPER[1] * (1 - age) + (hh - 0.5) * 12, b = PAPER[2] * (1 - age * 1.6) + (hh - 0.5) * 12;
        if (nhash(ipx >> 1, ipy >> 1, 4) > 0.9975) { r -= 40; g -= 40; b -= 38; }
        const bt = (bd[ipy * 1280 + ipx] / 255) * 0.075; r *= 1 - bt; g *= 1 - bt * 1.05; b *= 1 - bt * 1.1;
        const a = fd[i + 3] / 255;
        if (a > 0) {
          let cov = ncl((a - (0.5 + (nhash(ipx, ipy, 2) - 0.5) * 0.35 + f * 0.15)) * 3 + 0.5) * 0.65 + a * 0.35;
          let dens = 0.86 + m * 0.12 + (nhash(ipx, ipy, 3) - 0.5) * 0.12; if (nhash(ipx, ipy, 5) < 0.025) dens *= 0.45;
          cov *= ncl(dens); r = r * (1 - cov) + INK[0] * cov; g = g * (1 - cov) + INK[1] * cov; b = b * (1 - cov) + INK[2] * cov;
        }
        o[i] = r; o[i + 1] = g; o[i + 2] = b; o[i + 3] = 255;
      }
    }
    const c = H.layer(PW, PH); c.getContext('2d').putImageData(img, 0, 0); return c;
  };
  // the reader's red grease pencil (sits on top of the print)
  const pencilRing = (ctx, cam, W, H_, cx, cy, rx, ry, u, seed) => {
    if (u <= 0) return;
    const [ccx, ccy, z] = cam, rr = H.rng(seed);
    ctx.save(); ctx.translate(W / 2 - ccx * z, H_ / 2 - ccy * z);ctx.scale(z,z); ctx.lineCap = 'round';
    for (let pass = 0; pass < 3; pass++) {
      ctx.strokeStyle = `rgba(196,38,34,${0.55 - pass * 0.12})`; ctx.lineWidth = 3.6 - pass * 0.8; ctx.beginPath();
      const jx = rr.range(-2, 2), jy = rr.range(-2, 2);
      for (let i = 0; i <= 64 * u; i++) { const a = -2.4 + (i / 64) * Math.PI * 2.25, wob = 1 + 0.04 * Math.sin(i * 0.7 + pass); const px = cx + jx + Math.cos(a) * rx * wob, py = cy + jy + Math.sin(a) * ry * wob; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
    }
    ctx.restore();
  };


  function initPaper(backDraw){
    if(NX)return;
    const nz=H.makeNoise(9),GW=320,GH=180,low=new Float32Array(GW*GH*2);
    for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){low[(y*GW+x)*2]=nz.fbm2(x*.03,y*.03,4);low[(y*GW+x)*2+1]=nz.fbm2(x*.125+50,y*.125,3)}
    const c=H.layer(1280,720),x=c.getContext('2d');x.translate(1280,0);x.scale(-1,1);backDraw(x);
    const b=H.layer(1280,720),bx=b.getContext('2d');bx.filter='blur(1.2px)';bx.drawImage(c,0,0);
    const d=bx.getImageData(0,0,1280,720).data,back=new Uint8Array(1280*720);for(let i=0;i<back.length;i++)back[i]=d[i*4+3];NX={low,GW,GH,back};
  }
  function soundKit(k){
      // the reader shifts the broadsheet: a soft, darker rustle (the paper really is being handled)
      const rustle = (t, d, g) => { k.play('paper', t, { dur: d, gain: 0.22 * g, minor: true }); k.noise(t, { minor: true, dur: d, color: 'pink', filter: 'lowpass', f: 900, gain: 0.08 * g, a: d * 0.4 }); };
      // knuckle / finger on the page: a soft papery knock
      const knock = (t, g, p, minor) => { k.tone(t, { minor: !!minor, f: [[0, 160], [0.06, 85]], dur: 0.1, gain: 0.32 * g, pan: p }); k.noise(t, { minor: !!minor, dur: 0.05, color: 'pink', filter: 'bandpass', f: 700, q: 0.9, gain: 0.3 * g, a: 0.002, pan: p }); };
      const tap = (t, g, p) => k.noise(t, { minor: true, dur: 0.03, filter: 'bandpass', f: 1100, q: 1.2, gain: 0.22 * g, a: 0.001, pan: p });
      const tick = (t, g, p) => k.noise(t, { minor: true, dur: 0.018, filter: 'bandpass', f: 2000, q: 1.6, gain: 0.22 * g, a: 0.001, pan: p });
      const rulePen = (t, d, g, p) => k.play('stroke', t, { material: 'pen', dur: d, gain: g * 1.5, pan: p, minor: true });
      const grease = (t, d, g, p) => k.play('stroke', t, { material: 'chalk', dur: d, gain: g, pan: p });

return {rustle,knock,tap,tick,rulePen,grease};}
  const setScale=v=>{RES=v};
window.STYLE_PACKS=window.STYLE_PACKS||{};STYLE_PACKS['vintage-newsprint']={PAPER,INK,words,column,rule,graySrc,halfDots,npArrow,txt,reverseBar,renderSheet,pencilRing,initPaper,setScale,soundKit};
}
