// A qué huele el espacio
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = { olor: cue(0, 'olor'), astronautas: cue(1, 'astronautas'), caminatas: cue(1, 'caminatas'), casco: cue(2, 'casco'), raro: cue(2, 'raro'), carne: cue(3, 'carne'),
    polvora: cue(4, 'pólvora'), metal: cue(4, 'metal'), estrellas: cue(5, 'estrellas'), pegan: cue(5, 'pegan'), restos: cue(6, 'restos') };
  const smell = (ctx, t, x, y, k, col = '#FFD22E') => { for (let i = 0; i < 3; i++) { const p = ((t * 0.6 + i / 3) % 1);
    G.line(ctx, [[x + i * 40 - 40, y - p * 200], [x + i * 40 - 20, y - 50 - p * 200], [x + i * 40 - 40, y - 100 - p * 200], [x + i * 40 - 20, y - 150 - p * 200]], { color: col, lw: 9, seed: 10 + i, alpha: k * (1 - p) }); } };
  function station(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    G.rrect(ctx, -400, -26, 800, 52, 20, { fill: '#C9D6E8', lw: 5, seed: 20 });
    for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) G.rrect(ctx, sx * (250 + k * 120) - 50, -170, 100, 340, 6, { fill: '#2A4A9A', lw: 5, seed: 21 + k + (sx > 0 ? 2 : 0) });
    G.rrect(ctx, -110, -70, 220, 140, 40, { fill: '#F4F7FB', lw: 6, seed: 25 }); ctx.restore();
  }
  C.film([
    function olor(ctx, t, a) {
      C.space(ctx, t);
      C.earth(ctx, CX, 1700, 600, t);
      const k = pop(t, ev.olor - 0.2, 0.5);
      ctx.save(); ctx.translate(CX, 900); ctx.scale(k, k); G.ellipse(ctx, 0, 0, 120, 90, { fill: '#E9B48A', lw: 6, seed: 30 }); G.ellipse(ctx, -50, 60, 30, 22, { fill: '#C98E66', lw: 4, seed: 31 }); G.ellipse(ctx, 50, 60, 30, 22, { fill: '#C98E66', lw: 4, seed: 32 }); ctx.restore();
      smell(ctx, t, CX, 840, fade(t, ev.olor));
      return ['', 'El espacio tiene *olor*'];
    },
    function astronautas(ctx, t, a) {
      C.space(ctx, t);
      station(ctx, CX, 760, 1.0);
      C.astronaut(ctx, 380 + Math.sin(t * 0.8) * 30, 1080 + Math.cos(t) * 20, 1.0 * pop(t, ev.astronautas - 0.2, 0.5), t, { rot: -0.2 });
      ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.setLineDash([12, 10]); ctx.beginPath(); ctx.moveTo(CX - 100, 800); ctx.quadraticCurveTo(450, 900, 400, 1020); ctx.stroke(); ctx.restore();
      return ['Los astronautas lo cuentan', 'después de *caminar afuera*'];
    },
    function trajes(ctx, t, a) {
      C.bg(ctx, '#1A2A4A', '#3A5A8A');
      G.rrect(ctx, 80, 560, 920, 760, 40, { fill: '#C9D6E8', lw: 7, seed: 40 });
      G.ellipse(ctx, 860, 720, 80, 80, { fill: '#05081f', lw: 6, seed: 41 });
      const off = out(t, ev.casco - 0.3, 0.6);
      C.astronaut(ctx, 420, 1050, 1.1, t, { helmet: off < 0.5, face: (c) => G.line(c, [[-20, -95], [0, -102], [20, -95]], { lw: 5, seed: 42 }) });
      if (off > 0) { ctx.save(); ctx.translate(780 - 60 * (1 - off), 1150); G.ellipse(ctx, 0, 0, 80, 80, { fill: '#F4F7FB', lw: 6, seed: 43 }); G.ellipse(ctx, 0, 2, 58, 50, { fill: '#1B2A55', lw: 5, seed: 44 }); ctx.restore(); }
      smell(ctx, t, 420, 960, fade(t, ev.raro - 0.2), '#B8E04A');
      C.pill(ctx, t, ev.raro, 'huelen raro', 420, 640, '#B8E04A');
      return ['Se sacan el casco', 'y el traje huele *raro*'];
    },
    function carne(ctx, t, a) {
      C.bg(ctx, '#3A1A0E', '#7A3A1E');
      G.rrect(ctx, 180, 1100, 720, 40, 10, { fill: '#333', lw: 5, seed: 50 });
      for (let i = 0; i < 6; i++) G.line(ctx, [[220 + i * 120, 1100], [220 + i * 120, 1140]], { color: '#555', lw: 6, seed: 51 + i });
      for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(320 + i * 220, 1050); G.ellipse(ctx, 0, 0, 90, 50, { fill: '#9A3A2A', lw: 5, seed: 60 + i }); G.line(ctx, [[-50, -10], [50, 10]], { color: '#3a1a0a', lw: 6, seed: 63 + i }); ctx.restore(); }
      for (let i = 0; i < 5; i++) G.poly(ctx, [[240 + i * 140, 1160], [270 + i * 140, 1100 - 40 * Math.abs(Math.sin(t * 7 + i))], [300 + i * 140, 1160]], { fill: '#FF8A2A', lw: 3, seed: 70 + i });
      smell(ctx, t, CX, 930, 1, '#fff');
      return ['Unos dicen', 'que huele a *carne asada*'];
    },
    function otros(ctx, t, a) {
      C.bg(ctx, '#1A1A2A', '#3A3A5A');
      const k1 = pop(t, ev.polvora - 0.2), k2 = pop(t, ev.metal - 0.2);
      ctx.save(); ctx.translate(320, 1000); ctx.scale(k1, k1); G.rrect(ctx, -70, -100, 140, 200, 20, { fill: '#5A5A6A', lw: 6, seed: 80 }); G.limb(ctx, [[0, -100], [30, -170], [10, -220]], { color: '#C9A36A', lw: 10, outline: '#5a3a1a' });
      if (Math.sin(t * 15) > 0) G.star(ctx, 10, -230, 26, { fill: '#FFD22E' }); ctx.restore();
      ctx.save(); ctx.translate(760, 1000); ctx.scale(k2, k2); C.glow(ctx, 0, 0, 180, '255,120,40', 0.5); G.rrect(ctx, -160, -40, 320, 80, 14, { fill: '#E86A2A', lw: 6, seed: 81 }); ctx.restore();
      C.pill(ctx, t, ev.polvora, 'pólvora', 320, 760, '#ff8a3a'); C.pill(ctx, t, ev.metal, 'metal caliente', 760, 760, '#ff5a3a');
      return ['Otros', 'a *pólvora* o metal caliente'];
    },
    function estrellas(ctx, t, a) {
      C.space(ctx, t, '#0A0520', '#2A0A3A');
      const p = clamp((t - ev.estrellas + 0.4) / 0.8);
      C.glow(ctx, CX, 860, 300 + 200 * p, '255,180,90', 0.6 * (1 - p * 0.5));
      G.star(ctx, CX, 860, 110 * (1 - p) + 20, { fill: '#FFD22E', rot: t });
      if (p > 0) for (let i = 0; i < 24; i++) { const ang = i * 0.26, r = 60 + p * 480 + (i % 3) * 20; G.ellipse(ctx, CX + Math.cos(ang) * r, 860 + Math.sin(ang) * r, 9, 9, { fill: ['#FFD22E', '#ff8a3a', '#fff'][i % 3], lw: 2, seed: 90 + i }); }
      return ['Partículas que quedan', 'cuando mueren las *estrellas*'];
    },
    function restos(ctx, t, a) {
      C.space(ctx, t, '#0A0520', '#2A0A3A');
      C.astronaut(ctx, CX, 1080, 1.3, t, { helmet: false, face: (c) => G.line(c, [[-20, -95], [0, -88], [20, -95]], { lw: 5, seed: 100 }) });
      for (let i = 0; i < 16; i++) { const ang = i * 0.39 + t * 0.4, r = 260 + (i % 4) * 40; G.star(ctx, CX + Math.cos(ang) * r, 1000 + Math.sin(ang) * r * 0.7, 10, { fill: '#FFD22E', rot: t + i }); }
      smell(ctx, t, CX, 900, 1, '#FFD22E');
      C.pill(ctx, t, ev.restos, 'restos de estrellas', CX, 640, '#FFD22E');
      return ['Cuando huele su traje', 'huele *restos de estrellas*'];
    },
  ]);
})();
