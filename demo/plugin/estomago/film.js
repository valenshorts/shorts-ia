// Tu estómago se renueva cada pocos días
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = { acido: cue(0, 'ácido'), carne: cue(0, 'carne'), deshace: cue(1, 'deshace'), dos: cue(2, 'dos'), moco: cue(3, 'moco'), renueva: cue(4, 'renueva'),
    dias: cue(4, 'días'), dania: cue(5, 'daña'), nuevas: cue(5, 'nuevas'), nuevo: cue(6, 'nuevo'), semana: cue(6, 'semana') };
  function stomach(ctx, x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const pts = [[-60, -300], [40, -300], [60, -180], [220, -140], [300, 20], [220, 220], [0, 260], [-160, 180], [-140, 40], [-200, -60], [-80, -120]];
    G.poly(ctx, pts, { fill: '#F08A9A', lw: 8, seed: 1 });
    G.poly(ctx, pts.map(([px, py]) => [px * 0.78 + 10, py * 0.78 + 10]), { fill: o.inner || '#7A2A3A', lw: 0, seed: 2 });
    if (o.mucus) G.poly(ctx, pts.map(([px, py]) => [px * 0.78 + 10, py * 0.78 + 10]), { fill: 'rgba(0,0,0,0)', stroke: '#DFF5C8', lw: 26 * o.mucus, seed: 3 });
    const lvl = o.acid ?? 0.5;
    ctx.save(); ctx.beginPath(); ctx.rect(-400, 260 - 420 * lvl + Math.sin(t * 3) * 8, 800, 600); ctx.clip();
    G.poly(ctx, pts.map(([px, py]) => [px * 0.72 + 10, py * 0.72 + 14]), { fill: '#B8E04A', lw: 0, seed: 4 });
    for (let i = 0; i < 8; i++) { const p = ((t * 0.7 + i / 8) % 1); G.ellipse(ctx, -120 + (i * 53) % 280, 200 - p * 200, 10, 10, { fill: '#E8FF9A', lw: 2, seed: 10 + i, alpha: 1 - p }); }
    ctx.restore();
    if (o.cells) for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = 200; const fresh = (Math.floor(t * 2 + i * 0.37) % 3) === 0;
      G.ellipse(ctx, Math.cos(a) * r * 1.05 + 30, Math.sin(a) * r * 1.0 + 10, 26, 22, { fill: fresh ? '#FFD22E' : '#F8B8C4', lw: 3, seed: 30 + i }); }
    ctx.restore();
  }
  function steak(ctx, x, y, s, melt) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 - 0.6 * melt), s * (1 - 0.3 * melt));
    G.ellipse(ctx, 0, 0, 120, 80, { fill: '#B8463A', lw: 6, seed: 40, alpha: 1 - melt * 0.6 }); G.ellipse(ctx, 30, -10, 40, 22, { fill: '#F4E0D0', lw: 4, seed: 41, alpha: 1 - melt });
    ctx.restore();
  }
  C.film([
    function acido(ctx, t, a) {
      C.bg(ctx, '#2A3A0E', '#5A6A1E');
      stomach(ctx, CX, 950, 1.2 * pop(t, a, 0.5), t, { acid: 0.55 });
      steak(ctx, CX, 1000, 0.9, out(t, ev.carne + 0.2, 1.4));
      C.pill(ctx, t, ev.acido, 'ácido muy fuerte', CX, 600, '#B8E04A');
      return ['El ácido de tu estómago', 'puede deshacer la *carne*'];
    },
    function porque(ctx, t, a) {
      C.bg(ctx, '#3A1E2A', '#7A3B4A');
      stomach(ctx, CX, 950, 1.2, t, { acid: 0.55 });
      const p = pop(t, ev.deshace - 0.2, 0.4);
      C.text(ctx, '?', CX + 300, 760, { size: 260 * p, color: '#FFD22E', stroke: '#0b1030', strokeW: 16 });
      return ['¿Por qué no se deshace', 'el *estómago*?'];
    },
    function formas(ctx, t, a) {
      C.bg(ctx, '#0E2A3A', '#1E5A6A');
      const k1 = pop(t, ev.dos - 0.1), k2 = pop(t, ev.dos + 0.3);
      ctx.save(); ctx.translate(320, 960); ctx.scale(k1, k1); G.ellipse(ctx, 0, 0, 170, 170, { fill: '#DFF5C8', lw: 7, seed: 50 }); C.text(ctx, '1', 0, 40, { size: 160, color: '#2A5A1A' }); ctx.restore();
      ctx.save(); ctx.translate(760, 960); ctx.scale(k2, k2); G.ellipse(ctx, 0, 0, 170, 170, { fill: '#FFD22E', lw: 7, seed: 51 }); C.text(ctx, '2', 0, 40, { size: 160, color: '#5A3A00' }); ctx.restore();
      return ['Porque se protege', 'de *dos formas*'];
    },
    function moco(ctx, t, a) {
      C.bg(ctx, '#0E2A3A', '#1E5A6A');
      stomach(ctx, CX, 950, 1.2, t, { acid: 0.5, mucus: out(t, ev.moco - 0.3, 0.8) });
      C.pill(ctx, t, ev.moco, 'capa de moco espeso', CX, 1300, '#DFF5C8');
      return ['Primero', 'una capa de *moco* espeso'];
    },
    function renueva(ctx, t, a) {
      C.bg(ctx, '#2A1A3A', '#5A3A6A');
      stomach(ctx, CX, 950, 1.2, t, { acid: 0.45, cells: true, mucus: 0.6 });
      C.pill(ctx, t, ev.dias, 'cada pocos días', CX, 1300, '#FFD22E');
      return ['Y segundo', 'se *renueva* todo el tiempo'];
    },
    function danio(ctx, t, a) {
      C.bg(ctx, '#2A1A3A', '#5A3A6A');
      const k = out(t, ev.nuevas - 0.2, 0.5);
      for (let i = 0; i < 7; i++) { const x = 160 + i * 127, broken = i === 2 || i === 4;
        G.rrect(ctx, x - 55, 900, 110, 220, 30, { fill: broken ? (k > 0.5 ? '#FFD22E' : '#8A5A6A') : '#F8B8C4', lw: 5, seed: 60 + i });
        if (broken && k < 0.5) G.line(ctx, [[x - 30, 940], [x + 10, 1000], [x - 20, 1060]], { color: '#3a1a1a', lw: 6, seed: 70 + i }); }
      for (let i = 0; i < 6; i++) { const p = ((t * 0.8 + i / 6) % 1); G.ellipse(ctx, 200 + i * 130, 820 - p * 120, 12, 12, { fill: '#B8E04A', lw: 2, seed: 80 + i, alpha: 1 - p }); }
      C.pill(ctx, t, ev.nuevas, 'ya hay nuevas listas', CX, 1250, '#FFD22E');
      return ['Si el ácido daña algunas', 'ya hay *otras nuevas*'];
    },
    function nuevo(ctx, t, a) {
      C.bg(ctx, '#3A2A0E', '#7A5A1E');
      stomach(ctx, CX, 950, 1.2, t, { acid: 0.4, inner: '#FFB8C8', mucus: 0.5 });
      for (let i = 0; i < 8; i++) G.star(ctx, CX + Math.cos(i * 0.8 + t) * 330, 950 + Math.sin(i * 0.8 + t) * 330, 18 + 6 * Math.sin(t * 4 + i), { fill: '#FFD22E', rot: t + i });
      C.pill(ctx, t, ev.semana, 'casi cada semana', CX, 1300, '#FFD22E');
      return ['Tu estómago por dentro', 'es *nuevo* casi cada semana'];
    },
  ]);
})();
