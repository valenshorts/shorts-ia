// Librería de la tanda: textos con la letra y el estilo del canal + armado común (cámara, cortes, subtítulos, marca).
(function () {
  const U = globalThis.U, G = globalThis.G, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { clamp, lerp, ease } = U;
  const W = G.W, H = G.H, CX = W / 2, sc = S.sc;
  const YEL = '#FFD22E', TEAL = '#19B8B2';
  const font = (ctx, size, w) => { ctx.font = `${w} ${size}px M, sans-serif`; };
  const spaced = (ctx, str, x, y, sp) => { ctx.letterSpacing = sp + 'px'; ctx.fillText(str, x, y); ctx.letterSpacing = '0px'; };
  const fade = (t, a, d = 0.3) => clamp((t - a) / d);
  const pop = (t, a, d = 0.35) => ease.outBack(clamp((t - a) / d), 2.2);
  const ramp = (t, a, d = 0.35) => ease.outCubic(clamp((t - a) / d));
  // titular: palabras entre *asteriscos* en amarillo
  function head(ctx, t, kick, h1, a) {
    const p = fade(t, a, 0.3), dy = (1 - ease.outCubic(p)) * 24;
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = p; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    font(ctx, 40, 800); ctx.fillStyle = TEAL; spaced(ctx, kick.toUpperCase(), CX, 214 + dy, 3);
    font(ctx, 96, 900);
    const words = h1.toUpperCase().split(' ').map((w) => ({ w: w.replace(/\*/g, ''), y: /\*/.test(w) }));
    const lines = [[]]; let lw = 0; const sp = ctx.measureText(' ').width;
    for (const w of words) { const ww = ctx.measureText(w.w).width; if (lines[lines.length - 1].length && lw + sp + ww > 960) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ ...w, ww }); lw += (lw ? sp : 0) + ww; }
    ctx.textAlign = 'left'; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 6;
    lines.forEach((ln, li) => {
      const tw = ln.reduce((s, w) => s + w.ww, 0) + sp * (ln.length - 1); let x = CX - tw / 2; const y = 308 + li * 94 + dy;
      for (const w of ln) { ctx.fillStyle = w.y ? YEL : '#FFFFFF'; ctx.fillText(w.w, x, y); x += w.ww + sp; }
    });
    ctx.restore();
  }
  // dos titulares en la misma escena: cambia en el segundo b
  const head2 = (ctx, t, a, k1, h1, b, k2, h2) => (t < b ? head(ctx, t, k1, h1, a) : head(ctx, t, k2, h2, b));
  function pill(ctx, t, t0, text, x, y, border, d) {
    const p = fade(t, t0, 0.3) * (d ? 1 - fade(t, d, 0.3) : 1); if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = p; font(ctx, 32, 800); ctx.letterSpacing = '2px';
    const s = text.toUpperCase(), w = ctx.measureText(s).width + 44, h = 54, k = 0.85 + 0.15 * ease.outBack(clamp((t - t0) / 0.3), 2);
    ctx.translate(x, y); ctx.scale(k, k);
    ctx.fillStyle = 'rgba(8,13,43,0.85)'; ctx.strokeStyle = border || TEAL; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 27); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 2); ctx.restore();
  }
  // cifra grande amarilla (ej: "20%")
  function big(ctx, t, t0, text, x, y, size, color) {
    const p = pop(t, t0, 0.4); if (t < t0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p); font(ctx, size || 150, 900); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 14; ctx.strokeStyle = '#1a0d08'; ctx.strokeText(text, 0, 0); ctx.fillStyle = color || YEL; ctx.fillText(text, 0, 0); ctx.restore();
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
    ctx.globalAlpha = p; ctx.fillStyle = 'rgba(8,13,43,0.82)'; ctx.beginPath(); ctx.roundRect(CX - bw / 2, top, bw, bh, 26); ctx.fill();
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    lines.forEach((ln, li) => { let x = CX - widths[li] / 2; const y = top + 70 + li * lh;
      for (const w of ln) { ctx.globalAlpha = p * (t >= w.t - 0.04 ? 1 : 0.42); ctx.fillStyle = w.k ? YEL : '#FFFFFF'; ctx.fillText(w.x, x, y); x += w.ww + sp; } });
    ctx.restore();
  }
  function bg(ctx, top, bot) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot);
    ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400);
  }
  function glow(ctx, x, y, r, rgb, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  function arrow(ctx, x0, y0, x1, y1, color, lw, seed) {
    const a = Math.atan2(y1 - y0, x1 - x0), h = 26;
    G.line(ctx, [[x0, y0], [x1, y1]], { color, lw: lw || 8, seed: seed || 1 });
    G.line(ctx, [[x1 - h * Math.cos(a - 0.5), y1 - h * Math.sin(a - 0.5)], [x1, y1], [x1 - h * Math.cos(a + 0.5), y1 - h * Math.sin(a + 0.5)]], { color, lw: lw || 8, seed: (seed || 1) + 1 });
  }
  const sceneAt = (t) => { let i = 0; for (let k = 0; k < sc.length; k++) if (t >= sc[k].a) i = k; return i; };
  // arma la película: scenes[i](ctx, t, a, b) dibuja la escena i (sin textos de abajo ni marca)
  function film(scenes, opts = {}) {
    Studio.film({
      draw(ctx, t) {
        const i = sceneAt(t), s = sc[i], d = clamp((t - s.a) / (s.b - s.a)), z = 1 + 0.06 * ease.inOutQuad(d);
        ctx.save();
        ctx.translate(CX + Math.sin(t * 1.1) * 8, H * 0.5 + Math.cos(t * 0.8) * 6); ctx.scale(z, z); ctx.translate(-CX, -H * 0.5);
        scenes[i](ctx, t, s.a, s.b);
        ctx.restore();
        const fl = i > 0 ? 0.6 * Math.exp(-(t - s.a) * 10) : 0;
        if (fl > 0.01) { ctx.fillStyle = `rgba(255,248,230,${fl})`; ctx.fillRect(0, 0, W, H); }
        captions(ctx, t);
        G.decor(() => { ctx.save(); font(ctx, 28, 700); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.textAlign = 'center'; spaced(ctx, 'EL PORQUÉ DE TODO', CX, 124, 3.4); ctx.restore(); });
      },
      post: opts.post || { paper: 0.35, vignette: 0.4, grain: 0.05 },
      fadeOut: 0,
      async init() { await Studio.loadFont('M', 'assets/Montserrat.ttf', '100 900'); },
    });
  }
  globalThis.L = { W, H, CX, YEL, TEAL, font, fade, pop, ramp, head, head2, pill, big, captions, bg, glow, arrow, film, clamp, lerp, ease, cue: S.cue };
})();
