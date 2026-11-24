// El monje dentro del Buda — cada cuadro es función pura de t, sincronizado con las palabras de la voz.
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, S = globalThis.SCORE, Studio = globalThis.Studio, Subs = globalThis.Subs;
  const { clamp, lerp, ease } = U;
  const W = G.W, H = G.H, SA = G.SAFE, ev = S.ev, sc = S.sc;
  const CX = W / 2;
  const GOLD = '#E8B54A', GOLD2 = '#C98E2B', XR = '#7FE3FF';
  const pop = (t, a, d = 0.35) => ease.outBack(clamp((t - a) / d), 2.2);
  const fade = (t, a, d = 0.3) => clamp((t - a) / d);
  const sceneAt = (t) => { let i = 0; for (let k = 0; k < sc.length; k++) if (t >= sc[k].a) i = k; return i; };

  // ---------- piezas
  function bg(ctx, top, bot) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot);
    ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400);
  }
  function temple(ctx, t) {
    bg(ctx, '#2A1410', '#5A2A18');
    for (let i = 0; i < 3; i++) { // columnas rojas
      const x = [120, CX, W - 120][i];
      if (i === 1) continue;
      G.rrect(ctx, x - 50, 520, 100, 900, 12, { fill: '#9C2F22', lw: 5, seed: 30 + i, hatch: { color: 'rgba(0,0,0,0.18)', gap: 10 } });
      G.rrect(ctx, x - 70, 500, 140, 40, 8, { fill: GOLD2, lw: 4, seed: 40 + i });
    }
    G.poly(ctx, [[-50, 1250], [W + 50, 1250], [W + 50, H + 50], [-50, H + 50]], { fill: '#3B1C12', lw: 5, seed: 5, hatch: { color: 'rgba(255,200,120,0.08)', gap: 14 } });
  }
  function candle(ctx, x, y, t, seed) {
    G.rrect(ctx, x - 14, y - 70, 28, 70, 6, { fill: '#F4E6C8', lw: 3.5, seed });
    const f = 1 + 0.15 * Math.sin(t * 13 + seed) + 0.08 * Math.sin(t * 29 + seed * 2);
    const gl = ctx.createRadialGradient(x, y - 95, 0, x, y - 95, 70 * f);
    gl.addColorStop(0, 'rgba(255,200,90,0.55)'); gl.addColorStop(1, 'rgba(255,200,90,0)');
    ctx.fillStyle = gl; ctx.fillRect(x - 80, y - 175, 160, 160);
    G.ellipse(ctx, x + Math.sin(t * 9 + seed) * 2, y - 92, 9 * f, 20 * f, { fill: '#FFC24A', lw: 2.5, seed: seed + 1 });
  }
  // Buda sentado; o.k = 0..1 cuánto del interior se ve (rayos X), o.scan = y de la línea de escaneo
  function buddha(ctx, x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const glow = ctx.createRadialGradient(0, -260, 0, 0, -260, 380);
    glow.addColorStop(0, 'rgba(255,210,110,0.35)'); glow.addColorStop(1, 'rgba(255,210,110,0)');
    ctx.fillStyle = glow; ctx.fillRect(-400, -650, 800, 800);
    const gold = o.xray ? '#1d3b5c' : GOLD, gold2 = o.xray ? '#163049' : GOLD2, line = o.xray ? XR : undefined;
    const st = (seed, extra = {}) => Object.assign({ fill: gold, lw: 5, seed, stroke: line }, extra);
    G.ellipse(ctx, 0, 40, 300, 60, st(1, { fill: gold2 }));               // flor de loto (base)
    for (let i = -4; i <= 4; i++) G.ellipse(ctx, i * 66, 28, 40, 26, st(2 + i, { fill: gold2 }));
    G.ellipse(ctx, 0, -20, 250, 70, st(12));                               // piernas cruzadas
    G.poly(ctx, [[-150, -40], [-110, -330], [110, -330], [150, -40]], st(13, { hatch: o.xray ? null : { color: 'rgba(120,70,10,0.18)', gap: 11 } })); // torso
    G.ellipse(ctx, 0, -50, 90, 26, st(14, { fill: gold2 }));               // manos
    G.ellipse(ctx, 0, -400, 82, 92, st(15));                               // cabeza
    G.ellipse(ctx, -84, -395, 18, 40, st(16)); G.ellipse(ctx, 84, -395, 18, 40, st(17));
    G.ellipse(ctx, 0, -500, 34, 30, st(18));                               // moño
    if (!o.xray) {
      G.line(ctx, [[-40, -405], [-14, -398]], { lw: 4, seed: 19 }); G.line(ctx, [[14, -398], [40, -405]], { lw: 4, seed: 20 });
      G.line(ctx, [[-16, -350], [0, -344], [16, -350]], { lw: 4, seed: 21 });
    }
    if (o.inside > 0) { // el monje adentro (silueta marrón o esqueleto)
      ctx.save();
      if (o.scan !== undefined) { ctx.beginPath(); ctx.rect(-400, -700, 800, o.scan + 700); ctx.clip(); }
      ctx.globalAlpha = o.inside;
      if (o.skeleton) skeleton(ctx, t); else mummy(ctx);
      ctx.restore();
    }
    ctx.restore();
  }
  function mummy(ctx) {
    G.ellipse(ctx, 0, -395, 58, 66, { fill: '#6B3E22', lw: 4, seed: 50 });
    G.poly(ctx, [[-100, -60], [-80, -310], [80, -310], [100, -60]], { fill: '#6B3E22', lw: 4, seed: 51 });
    G.ellipse(ctx, 0, -40, 170, 46, { fill: '#5A321B', lw: 4, seed: 52 });
    G.line(ctx, [[-26, -400], [-8, -400]], { lw: 5, seed: 53, color: '#2A160C' }); G.line(ctx, [[8, -400], [26, -400]], { lw: 5, seed: 54, color: '#2A160C' });
  }
  function skeleton(ctx, t) {
    const c = XR, lw = 7;
    ctx.save(); ctx.shadowColor = XR; ctx.shadowBlur = 18;
    G.ellipse(ctx, 0, -400, 54, 62, { fill: 'rgba(127,227,255,0.12)', stroke: c, lw, seed: 60 });
    G.ellipse(ctx, -20, -405, 13, 15, { fill: c, lw: 2, seed: 61 }); G.ellipse(ctx, 20, -405, 13, 15, { fill: c, lw: 2, seed: 62 });
    for (let i = 0; i < 9; i++) G.ellipse(ctx, 0, -320 + i * 30, 9, 10, { fill: c, lw: 2, seed: 63 + i });     // columna
    for (let i = 0; i < 5; i++) { const y = -300 + i * 36, w = 80 - Math.abs(i - 1.5) * 6;                   // costillas
      G.line(ctx, [[-6, y], [-w, y + 18], [-w + 10, y + 36]], { color: c, lw: 6, seed: 80 + i });
      G.line(ctx, [[6, y], [w, y + 18], [w - 10, y + 36]], { color: c, lw: 6, seed: 90 + i }); }
    G.line(ctx, [[-90, -310], [-150, -150], [-60, -60]], { color: c, lw, seed: 100 }); G.line(ctx, [[90, -310], [150, -150], [60, -60]], { color: c, lw, seed: 101 });
    G.line(ctx, [[-60, -40], [-190, -20], [-40, 0]], { color: c, lw, seed: 102 }); G.line(ctx, [[60, -40], [190, -20], [40, 0]], { color: c, lw, seed: 103 });
    G.ellipse(ctx, 0, -50, 70, 24, { fill: 'rgba(127,227,255,0.15)', stroke: c, lw: 5, seed: 104 });
    ctx.restore();
  }
  function scrap(ctx, x, y, r, s, seed) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(s, s);
    G.tornPaper(ctx, -55, -70, 110, 140, { fill: '#F1E2B8', seed });
    for (let i = 0; i < 4; i++) G.line(ctx, [[-30 + i * 18, -50], [-30 + i * 18 + (seed % 3) * 2, 50]], { color: '#5a3a1a', lw: 4, seed: seed + i, step: 18, amp: 2.5 });
    ctx.restore();
  }


  // ---------- textos con la letra y el estilo del canal (Montserrat, como en el motor propio)
  const YEL = '#FFD22E', TEAL = '#19B8B2', NAVY = 'rgba(8,13,43,0.82)';
  function font(ctx, size, w) { ctx.font = `${w} ${size}px M, sans-serif`; }
  function spaced(ctx, str, x, y, sp) { ctx.letterSpacing = sp + 'px'; ctx.fillText(str, x, y); ctx.letterSpacing = '0px'; }
  // h1: palabras entre *asteriscos* salen amarillas
  function head(ctx, t, kick, h1, a) {
    const p = fade(t, a, 0.3), dy = (1 - ease.outCubic(p)) * 24;
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = p; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    font(ctx, 40, 800); ctx.fillStyle = TEAL; spaced(ctx, kick.toUpperCase(), CX, 214 + dy, 3);
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
  function pill(ctx, t, t0, text, x, y, border) {
    const p = fade(t, t0, 0.3); if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = p; font(ctx, 32, 800); ctx.letterSpacing = '2px';
    const s = text.toUpperCase(), w = ctx.measureText(s).width + 44, h = 54;
    ctx.fillStyle = 'rgba(8,13,43,0.8)'; ctx.strokeStyle = border || TEAL; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 27); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y + 2); ctx.restore();
  }
  function captions(ctx, t) {
    const C = S.subtitles, c = C.find((x) => t >= x.t && t < x.end); if (!c) return;
    const p = ease.outCubic(clamp((t - c.t) / 0.14));
    ctx.save(); font(ctx, 58, 800); const sp = ctx.measureText(' ').width;
    const ws = c.words.map((w, i) => { const x = w.w.toUpperCase().replace(/[,;:]$/, '').replace(/\.$/, ''); return { x, t: w.t, k: c.k[i], ww: ctx.measureText(x).width }; });
    const lines = [[]]; let lw = 0;
    for (const w of ws) { if (lines[lines.length - 1].length && lw + sp + w.ww > 872) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += (lw ? sp : 0) + w.ww; }
    const widths = lines.map((ln) => ln.reduce((s, w) => s + w.ww, 0) + sp * (ln.length - 1));
    const bw = Math.max(...widths) + 68, lh = 65, bh = lines.length * lh + 42, top = 1390 + (1 - p) * 14;
    ctx.globalAlpha = p; ctx.fillStyle = NAVY; ctx.beginPath(); ctx.roundRect(CX - bw / 2, top, bw, bh, 26); ctx.fill();
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    lines.forEach((ln, li) => { let x = CX - widths[li] / 2; const y = top + 20 + 50 + li * lh;
      for (const w of ln) { ctx.globalAlpha = p * (t >= w.t - 0.04 ? 1 : 0.42); ctx.fillStyle = w.k ? YEL : '#FFFFFF'; ctx.fillText(w.x, x, y); x += w.ww + sp; } });
    ctx.restore();
  }

  // ---------- escenas
  const SC = [
    function estatua(ctx, t, a, b) {
      temple(ctx, t);
      candle(ctx, 250, 1240, t, 3); candle(ctx, W - 250, 1240, t, 7);
      const s = pop(t, a + 0.1, 0.6);
      const scanP = clamp((t - (ev.monje - 0.6)) / 1.4);
      buddha(ctx, CX, 1180, 1.25 * s, t, { inside: scanP > 0 ? 1 : 0, scan: lerp(-560, 80, scanP) });
      if (scanP > 0 && scanP < 1) { // la línea del escáner
        const y = 1180 + lerp(-560, 80, scanP) * 1.25;
        ctx.save(); ctx.shadowColor = XR; ctx.shadowBlur = 30; G.line(ctx, [[CX - 330, y], [CX + 330, y]], { color: XR, lw: 8, seed: 7 }); ctx.restore();
      }
      head(ctx, t, 'En 2015 escanearon', 'una estatua de *Buda*', a + 0.05);
      pill(ctx, t, ev.estatua + 0.6, 'casi 1.000 años', 780, 640, YEL);
    },
    function tomografo(ctx, t, a, b) {
      bg(ctx, '#0B1D33', '#14385C');
      for (let i = 0; i < 12; i++) G.line(ctx, [[0, 560 + i * 60], [W, 560 + i * 60]], { color: 'rgba(127,227,255,0.07)', lw: 2, seed: 200 + i });
      const k = fade(t, ev.esqueleto - 0.3, 0.6);
      buddha(ctx, CX, 1180, 1.2, t, { xray: true, inside: k, skeleton: true });
      const ringY = 1180 + lerp(-680, 60, ease.inOutCubic(clamp((t - a) / (ev.esqueleto - a + 0.4)))) + Math.sin(t * 2) * 8;
      G.ellipse(ctx, CX, ringY, 380, 70, { fill: 'rgba(0,0,0,0)', stroke: '#E9F2FF', lw: 26, seed: 210 });
      G.ellipse(ctx, CX, ringY, 380, 70, { fill: 'rgba(0,0,0,0)', stroke: XR, lw: 6, seed: 211 });
      const d = pop(t, ev.tomo - 0.1);
      Ch.person(ctx, { x: 150, y: 1330, pose: 'stand', s: 0.78 * d, gesture: 'point', look: 1, eyes: 'wide', mouth: 'o', style: { outfit: 'shirt', shirt: '#F4F7FB', hairStyle: 'short', glasses: true } });
      Ch.person(ctx, { x: W - 150, y: 1330, pose: 'stand', s: 0.78 * d, gesture: 'think', look: -1, eyes: 'wide', style: { outfit: 'shirt', shirt: '#F4F7FB', hairStyle: 'bun', skin: '#C68B5E' } });
      head(ctx, t, t < ev.esqueleto ? 'Los médicos usaron' : 'Y apareció', t < ev.esqueleto ? 'un *tomógrafo*' : 'un *esqueleto* completo', t < ev.esqueleto ? a + 0.05 : ev.esqueleto);
      pill(ctx, t, ev.meditacion - 0.2, 'meditando', 770, 700);
    },
    function maestro(ctx, t, a, b) {
      temple(ctx, t);
      Ch.person(ctx, { x: CX, y: 1180, pose: 'floor', s: 1.25 * pop(t, a, 0.5), eyes: 'closed', mouth: 'smile', blush: 0.3,
        style: { hairStyle: 'bald', outfit: 'kameez', shirt: '#D9822B', skin: '#C9925F' } });
      const u = ease.outCubic(clamp((t - (ev.liuquan - 0.3)) / 0.6));
      if (u > 0) { // pergamino que se desenrolla
        const w = 560 * u;
        G.tornPaper(ctx, CX - w / 2, 560, w, 150, { fill: '#F3E3BE', seed: 300 });
        G.rrect(ctx, CX - w / 2 - 24, 548, 30, 174, 12, { fill: '#8A4B22', lw: 4, seed: 301 });
        G.rrect(ctx, CX + w / 2 - 6, 548, 30, 174, 12, { fill: '#8A4B22', lw: 4, seed: 302 });
        if (u > 0.85) { ctx.save(); ctx.globalAlpha = (u - 0.85) / 0.15; font(ctx, 88, 900); ctx.fillStyle = '#8C1D12'; ctx.textAlign = 'center'; ctx.fillText('LIUQUAN', CX, 668); ctx.restore(); }
      }
      head(ctx, t, 'Se cree que era', 'el *maestro* Liuquan', a + 0.05);
    },
    function papeles(ctx, t, a, b) {
      bg(ctx, '#0A1626', '#12304E');
      const y0 = 1240;
      G.rrect(ctx, CX - 300, 520, 600, 760, 120, { fill: 'rgba(127,227,255,0.06)', stroke: XR, lw: 5, seed: 400 }); // silueta del torso
      for (let i = 0; i < 12; i++) G.ellipse(ctx, CX, 600 + i * 52, 12, 16, { fill: XR, lw: 2, seed: 410 + i });
      for (let i = 0; i < 6; i++) { const y = 640 + i * 70, w = 230 - Math.abs(i - 2) * 18;
        G.line(ctx, [[CX - 14, y], [CX - w, y + 30], [CX - w + 30, y + 64]], { color: XR, lw: 9, seed: 430 + i });
        G.line(ctx, [[CX + 14, y], [CX + w, y + 30], [CX + w - 30, y + 64]], { color: XR, lw: 9, seed: 440 + i }); }
      const gone = fade(t, ev.organos + 0.2, 0.6), beat = 1 + 0.08 * Math.max(0, Math.sin(t * 7));
      if (gone < 1) { ctx.save(); ctx.globalAlpha = 1 - gone;
        G.ellipse(ctx, CX - 110, 820, 90, 150, { fill: '#F08A9A', lw: 4, seed: 450 }); G.ellipse(ctx, CX + 110, 820, 90, 150, { fill: '#F08A9A', lw: 4, seed: 451 });
        G.heart(ctx, CX + 30, 900, 1.6 * beat); G.ellipse(ctx, CX, 1080, 150, 70, { fill: '#C9785A', lw: 4, seed: 452 }); ctx.restore(); }
      const SP = [[-150, 760, -0.3], [120, 720, 0.25], [-40, 900, 0.1], [160, 950, -0.2], [-170, 1060, 0.35], [60, 1120, -0.1], [-60, 680, -0.15]];
      SP.forEach((p, i) => {
        const tt = ev.papel - 0.35 + i * 0.12, u = ease.outBack(clamp((t - tt) / 0.45), 1.6);
        if (u <= 0) return;
        const fx = lerp(i % 2 ? W + 150 : -150, CX + p[0], u), fy = lerp(p[1] - 300, p[1], u) + Math.sin(t * 2 + i) * 6;
        scrap(ctx, fx, fy, p[2] + Math.sin(t * 1.5 + i) * 0.05, 1.05, 470 + i * 7);
      });
      head(ctx, t, t < ev.papel ? 'Lo más raro' : 'En lugar de órganos', t < ev.papel ? 'no estaban sus *órganos*' : '*papeles* con escrituras', t < ev.papel ? a + 0.05 : ev.papel);
    },
    function rezos(ctx, t, a, b) {
      temple(ctx, t);
      const k = fade(t, ev.adentro - 0.15, 0.5);
      buddha(ctx, CX, 1010, 0.9, t, { inside: k, scan: lerp(-560, 80, k) });
      for (let i = 0; i < 2; i++) { const x = [300, W - 300][i]; // humo de incienso
        G.line(ctx, Array.from({ length: 9 }, (_, j) => [x + Math.sin(t * 1.8 + j * 0.7 + i) * 18 * (j / 8), 1000 - j * 45]), { color: 'rgba(240,230,220,0.45)', lw: 6, seed: 500 + i }); }
      const bow = (j) => 0.5 + 0.5 * Math.sin(t * 2.2 + j * 0.9);
      for (let j = 0; j < 4; j++) Ch.person(ctx, { x: 170 + j * 247, y: 1330, pose: 'floor', s: 0.66, rot: 0, headY: 14 * bow(j), gesture: 'dua', eyes: 'closed', mouth: 'flat',
        style: { hairStyle: ['short', 'bun', 'buzz', 'long'][j], outfit: 'kameez', shirt: ['#3E6FB0', '#A23B3B', '#4E8A5A', '#7A4FA0'][j], skin: Ch.SKIN_TONES ? Ch.SKIN_TONES[j % Ch.SKIN_TONES.length] : undefined } });
      head(ctx, t, 'Durante siglos le rezaron', t < ev.adentro ? 'sin *saber*' : 'con alguien *adentro*', t < ev.adentro ? a + 0.05 : ev.adentro);
    },
  ];

  Studio.film({
    draw(ctx, t) {
      const i = sceneAt(t), s = sc[i];
      const d = clamp((t - s.a) / (s.b - s.a));
      const z = 1 + 0.06 * ease.inOutQuad(d);
      ctx.save();
      ctx.translate(CX + Math.sin(t * 1.1) * 8, H * 0.5 + Math.cos(t * 0.8) * 6); ctx.scale(z, z); ctx.translate(-CX, -H * 0.5);
      SC[i](ctx, t, s.a, s.b);
      ctx.restore();
      const fl = i > 0 ? 0.7 * Math.exp(-(t - s.a) * 10) : 0; // golpe de luz en cada corte
      if (fl > 0.01) { ctx.fillStyle = `rgba(255,248,230,${fl})`; ctx.fillRect(0, 0, W, H); }
      captions(ctx, t);
      G.decor(() => { ctx.save(); font(ctx, 28, 700); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.textAlign = 'center'; spaced(ctx, 'EL PORQUÉ DE TODO', CX, 124, 3.4); ctx.restore(); });
    },
    post: { paper: 0.35, vignette: 0.4, grain: 0.05 },
    fadeOut: 0,
    async init() { await Studio.loadFont('M', 'assets/Montserrat.ttf', '100 900'); },
  });
})();
