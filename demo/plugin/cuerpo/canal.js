// canal.js — estilo de El Porqué de Todo para los videos con el plugin animation-studio:
// letra Montserrat, kicker turquesa, titular blanco con palabra amarilla, etiquetas, subtítulos en caja azul,
// cámara que nunca queda quieta, golpe de luz en cada corte. Cada video solo escribe sus escenas en film.js:
//   C.film([escena0, escena1, ...])  con  escena(ctx, t, a, b, d) -> [kicker, 'titular con *palabra* amarilla', aparece]
(function () {
  const U = globalThis.U, G = globalThis.G, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { clamp, lerp, ease } = U;
  const W = G.W, H = G.H, CX = W / 2, sc = S.sc;
  const YEL = '#FFD22E', TEAL = '#19B8B2', NAVY = 'rgba(8,13,43,0.82)';
  const C = {
    W, H, CX, YEL, TEAL, clamp, lerp, ease, cue: S.cue, sc,
    pop: (t, a, d = 0.35) => ease.outBack(clamp((t - a) / d), 2.2),
    fade: (t, a, d = 0.3) => clamp((t - a) / d),
    out: (t, a, d = 0.4) => ease.outCubic(clamp((t - a) / d)),
    wob: (t, f = 1, a = 1, ph = 0) => Math.sin(t * f + ph) * a,
  };
  function font(ctx, size, w) { ctx.font = `${w} ${size}px M, sans-serif`; }
  C.font = font;
  C.bg = (ctx, top, bot) => {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot);
    ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
  };
  C.glow = (ctx, x, y, r, rgb = '255,210,110', a = 0.4) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  };
  // texto con la letra del canal (para números o carteles dibujados dentro de la escena)
  C.text = (ctx, str, x, y, o = {}) => {
    ctx.save(); font(ctx, o.size || 60, o.w || 900); ctx.fillStyle = o.color || '#fff'; ctx.textAlign = o.align || 'center';
    ctx.textBaseline = o.base || 'alphabetic'; ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
    if (o.ls) ctx.letterSpacing = o.ls + 'px';
    if (o.shadow !== false) { ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 4; }
    if (o.stroke) { ctx.lineWidth = o.strokeW || 10; ctx.strokeStyle = o.stroke; ctx.lineJoin = 'round'; ctx.strokeText(str, x, y); }
    ctx.fillText(str, x, y); ctx.restore();
  };
  // etiqueta tipo píldora (como las del motor propio)
  C.pill = (ctx, t, t0, text, x, y, border) => {
    const p = clamp((t - t0) / 0.3); if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = p; font(ctx, 32, 800); ctx.letterSpacing = '2px';
    const s = text.toUpperCase(), w = ctx.measureText(s).width + 44, h = 54;
    ctx.translate(x, y); ctx.scale(0.8 + 0.2 * ease.outBack(p, 2), 0.8 + 0.2 * ease.outBack(p, 2));
    ctx.fillStyle = 'rgba(8,13,43,0.85)'; ctx.strokeStyle = border || TEAL; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 27); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 2); ctx.restore();
  };
  // número grande que cuenta (ej: 100.000)
  C.count = (ctx, t, t0, to, x, y, o = {}) => {
    const p = ease.outCubic(clamp((t - t0) / (o.dur || 0.9))); if (t < t0) return;
    const v = Math.round(to * p).toLocaleString('es-AR');
    C.text(ctx, (o.pre || '') + v + (o.suf || ''), x, y, { size: o.size || 120, color: o.color || YEL, stroke: '#0b1030', strokeW: 12 });
  };
  // ---------- piezas que se repiten entre videos
  C.person = (ctx, x, y, s, o = {}) => globalThis.Ch.person(ctx, Object.assign({ x, y, pose: 'stand', s }, o, { style: Object.assign({ hairStyle: 'short', outfit: 'tee', shirt: '#3E6FB0' }, o.style || {}) }));
  C.space = (ctx, t, top = '#05081f', bot = '#141a52') => {
    C.bg(ctx, top, bot);
    for (let i = 0; i < 90; i++) { const x = (i * 137.5) % W, y = (i * 263.7) % H, r = 1 + (i % 4) * 0.7;
      ctx.globalAlpha = 0.35 + 0.35 * Math.sin(t * 2 + i); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
  };
  C.earth = (ctx, x, y, r, t) => {
    C.glow(ctx, x, y, r * 1.35, '120,190,255', 0.35);
    G.ellipse(ctx, x, y, r, r, { fill: '#2F7BD8', lw: 6, seed: 900 });
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r - 3, 0, 7); ctx.clip();
    const o = ((t * 18) % (r * 4));
    for (let k = -1; k < 2; k++) { const bx = x - r * 2 + o + k * r * 4;
      G.poly(ctx, [[bx, y - r * .5], [bx + r * .6, y - r * .7], [bx + r * .9, y - r * .2], [bx + r * .5, y + r * .3], [bx + r * .1, y + r * .1]], { fill: '#4FB06A', lw: 4, seed: 901 });
      G.poly(ctx, [[bx + r * 1.4, y + r * .1], [bx + r * 2, y - r * .1], [bx + r * 2.2, y + r * .6], [bx + r * 1.6, y + r * .8]], { fill: '#4FB06A', lw: 4, seed: 902 }); }
    ctx.restore();
  };
  C.astronaut = (ctx, x, y, s, t, o = {}) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
    G.limb(ctx, [[-45, -10], [-90, 40 + Math.sin(t * 2) * 10]], { color: '#EEF2F8', lw: 42, outline: '#3a4a68' });
    G.limb(ctx, [[45, -10], [90, 40 - Math.sin(t * 2) * 10]], { color: '#EEF2F8', lw: 42, outline: '#3a4a68' });
    G.limb(ctx, [[-28, 90], [-40, 190]], { color: '#EEF2F8', lw: 46, outline: '#3a4a68' });
    G.limb(ctx, [[28, 90], [40, 190]], { color: '#EEF2F8', lw: 46, outline: '#3a4a68' });
    G.rrect(ctx, -70, -60, 140, 170, 50, { fill: '#F4F7FB', lw: 6, seed: 910 });
    G.rrect(ctx, -40, 0, 80, 50, 12, { fill: '#19B8B2', lw: 4, seed: 911 });
    if (o.helmet !== false) { G.ellipse(ctx, 0, -120, 80, 80, { fill: '#F4F7FB', lw: 6, seed: 912 }); G.ellipse(ctx, 0, -118, 58, 50, { fill: '#1B2A55', lw: 5, seed: 913 });
      G.ellipse(ctx, -18, -132, 14, 9, { fill: 'rgba(255,255,255,0.6)', lw: 0, seed: 914 }); }
    else { G.ellipse(ctx, 0, -120, 62, 66, { fill: '#E9B48A', lw: 5, seed: 915 }); G.ellipse(ctx, 0, -168, 60, 26, { fill: '#3a2a20', lw: 4, seed: 916 });
      G.ellipse(ctx, -20, -125, 6, 8, { fill: '#222', lw: 0, seed: 917 }); G.ellipse(ctx, 20, -125, 6, 8, { fill: '#222', lw: 0, seed: 918 });
      if (o.face) o.face(ctx); }
    ctx.restore();
  };
  function head(ctx, t, kick, h1, a) {
    const p = clamp((t - a) / 0.3), e = ease.outCubic(p), dy = (1 - e) * 24;
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = p; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    font(ctx, 40, 800); ctx.fillStyle = TEAL; ctx.letterSpacing = '3px'; ctx.fillText(kick.toUpperCase(), CX, 214 + dy); ctx.letterSpacing = '0px';
    font(ctx, 96, 900);
    const words = h1.toUpperCase().split(' ').map((w) => ({ w: w.replace(/\*/g, ''), y: /\*/.test(w) }));
    const lines = [[]]; let lw = 0; const sp = ctx.measureText(' ').width;
    for (const w of words) { const ww = ctx.measureText(w.w).width; if (lines[lines.length - 1].length && lw + sp + ww > 960) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ ...w, ww }); lw += (lw ? sp : 0) + ww; }
    lines.forEach((ln, li) => {
      const tw = ln.reduce((s, w) => s + w.ww, 0) + sp * (ln.length - 1); let x = CX - tw / 2; const y = 308 + li * 94 + dy;
      ctx.textAlign = 'left'; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 6;
      for (const w of ln) { ctx.fillStyle = w.y ? YEL : '#FFFFFF'; ctx.fillText(w.w, x, y); x += w.ww + sp; }
    });
    ctx.restore();
  }
  function captions(ctx, t) {
    const c = S.subtitles.find((x) => t >= x.t && t < x.end); if (!c) return;
    const p = ease.outCubic(clamp((t - c.t) / 0.14));
    ctx.save(); font(ctx, 58, 800); const sp = ctx.measureText(' ').width;
    const ws = c.words.map((w, i) => { const x = w.w.toUpperCase().replace(/[,;:]$/, '').replace(/\.$/, ''); return { x, t: w.t, k: c.k[i], ww: ctx.measureText(x).width }; });
    const lines = [[]]; let lw = 0;
    for (const w of ws) { if (lines[lines.length - 1].length && lw + sp + w.ww > 872) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += (lw ? sp : 0) + w.ww; }
    const widths = lines.map((ln) => ln.reduce((s, w) => s + w.ww, 0) + sp * (ln.length - 1));
    const bw = Math.max(...widths) + 68, lh = 65, bh = lines.length * lh + 42, top = 1390 + (1 - p) * 14;
    ctx.globalAlpha = p; ctx.fillStyle = NAVY; ctx.beginPath(); ctx.roundRect(CX - bw / 2, top, bw, bh, 26); ctx.fill();
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    lines.forEach((ln, li) => { let x = CX - widths[li] / 2; const y = top + 70 + li * lh;
      for (const w of ln) { ctx.globalAlpha = p * (t >= w.t - 0.04 ? 1 : 0.42); ctx.fillStyle = w.k ? YEL : '#FFFFFF'; ctx.fillText(w.x, x, y); x += w.ww + sp; } });
    ctx.restore();
  }
  C.film = (scenes, opts = {}) => {
    Studio.film({
      draw(ctx, t) {
        let i = 0; for (let k = 0; k < sc.length; k++) if (t >= sc[k].a) i = k;
        const s = sc[i], d = clamp((t - s.a) / (s.b - s.a)), z = 1 + (opts.zoom ?? 0.06) * ease.inOutQuad(d);
        ctx.save();
        ctx.translate(CX + Math.sin(t * 1.1) * 9, H * 0.5 + Math.cos(t * 0.8) * 7); ctx.scale(z, z); ctx.translate(-CX, -H * 0.5);
        const hd = scenes[i](ctx, t, s.a, s.b, d) || null;
        ctx.restore();
        const fl = i > 0 ? 0.7 * Math.exp(-(t - s.a) * 10) : 0;
        if (fl > 0.01) { ctx.fillStyle = `rgba(255,248,230,${fl})`; ctx.fillRect(0, 0, W, H); }
        if (hd) { // franja oscura arriba para que el titular se lea sobre cualquier fondo
          const g = ctx.createLinearGradient(0, 0, 0, 560); g.addColorStop(0, 'rgba(8,13,43,0.88)'); g.addColorStop(0.7, 'rgba(8,13,43,0.5)'); g.addColorStop(1, 'rgba(8,13,43,0)');
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, 560);
          head(ctx, t, hd[0], hd[1], hd[2] === undefined ? s.a + 0.05 : hd[2]);
        }
        captions(ctx, t);
        G.decor(() => { ctx.save(); font(ctx, 28, 700); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.textAlign = 'center'; ctx.letterSpacing = '3.4px'; ctx.fillText('EL PORQUÉ DE TODO', CX, 124); ctx.restore(); });
      },
      post: { paper: 0.35, vignette: 0.4, grain: 0.05 },
      fadeOut: 0,
      async init() { await Studio.loadFont('M', 'assets/Montserrat.ttf', '100 900'); },
    });
  };
  globalThis.C = C;
})();
