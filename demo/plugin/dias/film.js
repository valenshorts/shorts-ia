// Los días eran más cortos
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = { dinosaurios: cue(0, 'dinosaurios'), veinticuatro: cue(0, 'veinticuatro'), setenta: cue(1, 'setenta'), veintitres: cue(1, 'veintitrés'), luna: cue(2, 'luna'),
    mar: cue(3, 'mar'), frena: cue(3, 'frena'), freno: cue(3, 'freno'), siglo: cue(4, 'siglo'), alarga: cue(4, 'alarga'), veinticinco: cue(5, 'veinticinco') };
  function dino(ctx, x, y, s, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    G.limb(ctx, [[-60, -40], [-200, -60], [-300, -20]], { color: '#4E9A5A', lw: 60, outline: '#1a3a1a' });
    G.ellipse(ctx, 0, -60, 150, 100, { fill: '#5AAA6A', lw: 6, seed: 1 });
    G.limb(ctx, [[100, -100], [170, -260 + Math.sin(t * 2) * 10], [190, -380]], { color: '#5AAA6A', lw: 60, outline: '#1a3a1a' });
    G.ellipse(ctx, 220, -400, 70, 45, { fill: '#5AAA6A', lw: 6, seed: 2 }); G.ellipse(ctx, 240, -415, 8, 9, { fill: '#111', lw: 0, seed: 3 });
    for (const lx of [-70, 60]) G.limb(ctx, [[lx, 0], [lx, 120]], { color: '#4E9A5A', lw: 46, outline: '#1a3a1a' });
    ctx.restore();
  }
  function clock(ctx, x, y, r, t, label, speed = 1) {
    G.ellipse(ctx, x, y, r, r, { fill: '#F4F7FB', lw: 8, seed: 10 });
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; G.line(ctx, [[x + Math.cos(a) * r * 0.82, y + Math.sin(a) * r * 0.82], [x + Math.cos(a) * r * 0.92, y + Math.sin(a) * r * 0.92]], { color: '#0b1030', lw: 6, seed: 11 + i }); }
    const h = t * 0.6 * speed, m = t * 7 * speed;
    G.line(ctx, [[x, y], [x + Math.sin(h) * r * 0.5, y - Math.cos(h) * r * 0.5]], { color: '#0b1030', lw: 12, seed: 30 }); G.line(ctx, [[x, y], [x + Math.sin(m) * r * 0.75, y - Math.cos(m) * r * 0.75]], { color: '#ff5a3a', lw: 7, seed: 31 });
    if (label) C.text(ctx, label, x, y + r + 90, { size: 76, color: '#FFD22E', stroke: '#0b1030', strokeW: 10 });
  }
  C.film([
    function dinosaurios(ctx, t, a) {
      C.bg(ctx, '#E8823A', '#F4C46A');
      G.ellipse(ctx, 840, 620, 90, 90, { fill: '#FFF0A0', lw: 5, seed: 40 });
      G.poly(ctx, [[-50, 1150], [300, 1000], [700, 1080], [1130, 980], [1130, 2000], [-50, 2000]], { fill: '#8A5A2A', lw: 6, seed: 41 });
      dino(ctx, 420, 1130, 1.05 * pop(t, a, 0.5), t);
      clock(ctx, 850, 880, 120 * pop(t, ev.veinticuatro - 0.3), t * 2);
      C.pill(ctx, t, ev.veinticuatro, 'menos de 24 horas', 850, 1060, '#ff5a3a');
      return ['En la época de los dinosaurios', 'el día duraba *menos*'];
    },
    function hace(ctx, t, a) {
      C.bg(ctx, '#0E1A3A', '#22365E');
      clock(ctx, CX, 920, 230 * pop(t, a, 0.5), t, t > ev.veintitres ? '23,5 HORAS' : '', 2);
      C.pill(ctx, t, ev.setenta, 'hace 70 millones de años', CX, 560 + 60, '#19B8B2');
      return ['Hace 70 millones de años', 'el día duraba *23,5 horas*'];
    },
    function luna(ctx, t, a) {
      C.space(ctx, t);
      C.earth(ctx, 360, 1000, 220, t);
      const k = pop(t, ev.luna - 0.2, 0.6);
      ctx.save(); ctx.translate(820, 760); ctx.scale(k, k); C.glow(ctx, 0, 0, 200, '230,230,255', 0.4); G.ellipse(ctx, 0, 0, 100, 100, { fill: '#D8D8E0', lw: 6, seed: 50 });
      G.ellipse(ctx, -30, -20, 20, 18, { fill: '#B8B8C4', lw: 3, seed: 51 }); G.ellipse(ctx, 30, 30, 26, 22, { fill: '#B8B8C4', lw: 3, seed: 52 }); ctx.restore();
      return ['La razón', 'es la *Luna*'];
    },
    function freno(ctx, t, a) {
      C.space(ctx, t);
      const spin = t * (1.4 - 0.5 * out(t, ev.frena - 0.2, 1.5));
      C.earth(ctx, 400, 1000, 230, spin * 2);
      G.ellipse(ctx, 400, 1000, 290, 250, { fill: 'rgba(95,184,255,0.18)', lw: 0, seed: 60 }); // el mar estirado
      ctx.save(); ctx.translate(880, 760); G.ellipse(ctx, 0, 0, 90, 90, { fill: '#D8D8E0', lw: 6, seed: 61 }); ctx.restore();
      for (let i = 0; i < 3; i++) { const p = ((t * 0.8 + i / 3) % 1); G.line(ctx, [[820 - p * 200, 800 + p * 80], [780 - p * 200, 790 + p * 80]], { color: '#B8E0FF', lw: 8, seed: 62 + i, alpha: 1 - p }); }
      const fk = fade(t, ev.freno - 0.2);
      ctx.save(); ctx.translate(820, 1180); ctx.globalAlpha = fk; ctx.rotate(-0.4 + 0.3 * Math.sin(t * 2)); G.rrect(ctx, -20, -160, 40, 200, 16, { fill: '#ff5a3a', lw: 6, seed: 63 }); G.ellipse(ctx, 0, 40, 60, 40, { fill: '#333', lw: 5, seed: 64 }); ctx.restore();
      C.pill(ctx, t, ev.freno, 'como un freno de mano', 760, 1340, '#ff5a3a');
      return ['Tira del mar y frena a la Tierra', 'como un *freno de mano*'];
    },
    function siglo(ctx, t, a, b) {
      C.bg(ctx, '#1A1440', '#3A2A7A');
      const p = clamp((t - a) / (b - a));
      G.rrect(ctx, 140, 920, 800, 60, 30, { fill: '#2A2A5A', lw: 5, seed: 70 });
      G.rrect(ctx, 150, 930, 780 * (0.6 + 0.3 * p), 40, 20, { fill: '#FFD22E', lw: 0, seed: 71 });
      C.text(ctx, '+ 1,7 milisegundos por siglo', CX, 1100, { size: 44, color: '#fff', alpha: fade(t, ev.alarga) });
      clock(ctx, CX, 700, 130, t, '', 1);
      return ['Cada siglo', 'el día se *alarga* un poquito'];
    },
    function futuro(ctx, t, a) {
      C.space(ctx, t);
      C.earth(ctx, CX, 1050, 260, t * 0.4);
      clock(ctx, CX, 640, 120, t * 0.5);
      C.count(ctx, t, ev.veinticinco - 0.4, 25, CX, 1330 - 20, { size: 120, suf: ' HORAS' });
      return ['Dentro de millones de años', 'el día va a durar *25 horas*'];
    },
  ]);
})();
