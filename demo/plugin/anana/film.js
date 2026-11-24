// El ananá te come mientras lo comés
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = { come: cue(0, 'come'), proteinas: cue(1, 'proteínas'), lengua: cue(1, 'lengua'), hormigueo: cue(2, 'hormigueo'), repara: cue(3, 'repara'),
    estomago: cue(3, 'estómago'), carne: cue(4, 'carne'), cocido: cue(5, 'cocido'), pizzas: cue(5, 'pizzas'), pica: cue(5, 'pica') };
  function pine(ctx, x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    for (let i = 0; i < 7; i++) { const a = -1.2 + i * 0.4; G.poly(ctx, [[0, -150], [Math.cos(a - 1.57) * 30, -150], [Math.sin(a) * 180, -150 - Math.cos(a) * 220 + Math.sin(t * 2 + i) * 6]], { fill: '#4E8A3A', lw: 5, seed: 1 + i }); }
    G.ellipse(ctx, 0, 30, 150, 190, { fill: '#F2B42A', lw: 7, seed: 10 });
    for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) { const px = -90 + c * 60 + (r % 2) * 30, py = -110 + r * 60; G.line(ctx, [[px - 18, py], [px, py + 18], [px + 18, py]], { color: '#B87A1A', lw: 5, seed: 20 + r * 4 + c }); }
    if (o.face) { G.ellipse(ctx, -50, -10, 22, 26, { fill: '#fff', lw: 4, seed: 40 }); G.ellipse(ctx, 50, -10, 22, 26, { fill: '#fff', lw: 4, seed: 41 }); G.ellipse(ctx, -46, -6, 10, 12, { fill: '#111', lw: 0, seed: 42 }); G.ellipse(ctx, 54, -6, 10, 12, { fill: '#111', lw: 0, seed: 43 });
      const m = 0.4 + 0.6 * Math.abs(Math.sin(t * 6)); G.ellipse(ctx, 0, 70, 60, 34 * m, { fill: '#5a1a1a', lw: 5, seed: 44 }); G.poly(ctx, [[-40, 50], [-28, 74], [-16, 50]], { fill: '#fff', lw: 3, seed: 45 }); G.poly(ctx, [[16, 50], [28, 74], [40, 50]], { fill: '#fff', lw: 3, seed: 46 }); }
    ctx.restore();
  }
  function slice(ctx, x, y, s, r) { ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(s, s); G.poly(ctx, [[0, 0], [-90, -160], [90, -160]], { fill: '#FFE05A', lw: 5, seed: 50 }); G.rrect(ctx, -95, -180, 190, 30, 10, { fill: '#B87A1A', lw: 4, seed: 51 }); ctx.restore(); }
  function tongue(ctx, x, y, s, t, hurt) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    G.ellipse(ctx, 0, 0, 260, 320, { fill: '#F27A8A', lw: 7, seed: 60 }); G.line(ctx, [[0, -250], [0, 230]], { color: '#C85A6A', lw: 6, seed: 61 });
    for (let i = 0; i < 16; i++) { const px = -170 + (i % 4) * 110, py = -180 + Math.floor(i / 4) * 110; const on = hurt > i / 16;
      G.ellipse(ctx, px + Math.sin(t * 20 + i) * 3 * hurt, py, 14, 14, { fill: on ? '#FFD22E' : '#E06A7A', lw: 3, seed: 70 + i }); }
    ctx.restore();
  }
  C.film([
    function come(ctx, t, a) {
      C.bg(ctx, '#0E3A2A', '#2E7A5A');
      C.person(ctx, 280, 1330, 1.05, { eyes: t > ev.come ? 'wide' : 'happy', mouth: t > ev.come ? 'o' : 'open', handR: [150, -230], style: { shirt: '#19B8B2' } });
      slice(ctx, 450, 1030, 0.6, -0.4);
      pine(ctx, 780, 1080, 1.15 * pop(t, a + 0.3, 0.5), t, { face: t > ev.come - 0.2 });
      return ['Cuando comés ananá', 'el ananá *te come* a vos'];
    },
    function proteinas(ctx, t, a) {
      C.bg(ctx, '#3A1E2A', '#7A3B4A');
      tongue(ctx, CX, 1000, 1.05, t, 0);
      for (let i = 0; i < 10; i++) { const p = ((t * 0.4 + i / 10) % 1), ang = i * 0.63; const x = CX + Math.cos(ang) * (420 - 260 * p), y = 1000 + Math.sin(ang) * (420 - 260 * p);
        G.poly(ctx, [[x, y - 22], [x + 20, y], [x, y + 22], [x - 20, y]], { fill: '#FFD22E', lw: 3, seed: 80 + i, alpha: fade(t, ev.proteinas - 0.3) }); }
      C.pill(ctx, t, ev.proteinas, 'deshace proteínas', CX, 620, '#FFD22E');
      C.pill(ctx, t, ev.lengua, 'tu lengua es proteína', CX, 1300, '#ff5a3a');
      return ['Deshace proteínas', 'y tu *lengua* es proteína'];
    },
    function hormigueo(ctx, t, a) {
      C.bg(ctx, '#3A1E2A', '#7A3B4A');
      tongue(ctx, CX, 1000, 1.05, t, out(t, ev.hormigueo - 0.3, 1.2));
      return ['Si comés mucho', 'sentís un *hormigueo*'];
    },
    function repara(ctx, t, a) {
      C.bg(ctx, '#0E2A3A', '#1E5A6A');
      tongue(ctx, 330, 950, 0.6, t, 1 - out(t, ev.repara - 0.2, 1));
      for (let i = 0; i < 6; i++) G.star(ctx, 330 + Math.cos(i + t) * 200, 950 + Math.sin(i + t) * 230, 14, { fill: '#5CFF9A', rot: t });
      const k = fade(t, ev.estomago - 0.2);
      ctx.save(); ctx.globalAlpha = k; G.poly(ctx, [[700, 760], [790, 760], [800, 860], [940, 900], [980, 1040], [880, 1160], [720, 1150], [660, 1020], [700, 900]], { fill: '#F08A9A', lw: 6, seed: 90 });
      G.ellipse(ctx, 820, 1050, 110, 60, { fill: '#B8E04A', lw: 0, seed: 91 }); ctx.restore();
      C.pill(ctx, t, ev.estomago, 'el ácido la desactiva', 820, 1270, '#B8E04A');
      return ['Tranqui', 'tu boca se *repara* rápido'];
    },
    function ablandar(ctx, t, a) {
      C.bg(ctx, '#3A1A0E', '#7A3A1E');
      const k = out(t, ev.carne - 0.3, 1.2);
      ctx.save(); ctx.translate(CX, 1050); ctx.scale(1 + 0.15 * k, 1 - 0.25 * k);
      G.ellipse(ctx, 0, 0, 280, 170, { fill: k > 0.5 ? '#D4705A' : '#B8463A', lw: 7, seed: 100 }); G.ellipse(ctx, 80, -30, 80, 40, { fill: '#F4E0D0', lw: 5, seed: 101 }); ctx.restore();
      slice(ctx, 300, 820, 0.5, -0.5); slice(ctx, 780, 820, 0.5, 0.5);
      C.pill(ctx, t, ev.carne, 'ablanda la carne', CX, 1300, '#FFD22E');
      return ['Tan bueno que se usa', 'para *ablandar carne*'];
    },
    function pizzas(ctx, t, a) {
      C.bg(ctx, '#2A1A0E', '#6A3A1E');
      ctx.save(); ctx.translate(CX, 1000); ctx.rotate(t * 0.2); const s = pop(t, a, 0.5); ctx.scale(s, s);
      G.ellipse(ctx, 0, 0, 340, 340, { fill: '#E8B54A', lw: 7, seed: 110 }); G.ellipse(ctx, 0, 0, 300, 300, { fill: '#E8442A', lw: 0, seed: 111 }); G.ellipse(ctx, 0, 0, 290, 290, { fill: '#FFE08A', lw: 0, seed: 112, alpha: 0.85 });
      for (let i = 0; i < 9; i++) { const ang = i * 0.7, r = 80 + (i % 3) * 70; G.rrect(ctx, Math.cos(ang) * r - 30, Math.sin(ang) * r - 20, 60, 40, 8, { fill: '#FFD22E', lw: 4, seed: 120 + i }); }
      for (let i = 0; i < 6; i++) { const ang = i * 1.1 + 0.4, r = 150; G.rrect(ctx, Math.cos(ang) * r - 35, Math.sin(ang) * r - 22, 70, 44, 10, { fill: '#F4A0A0', lw: 4, seed: 130 + i }); } ctx.restore();
      for (let i = 0; i < 3; i++) { const p = ((t * 0.5 + i / 3) % 1); G.line(ctx, [[400 + i * 140, 700 - p * 100], [420 + i * 140, 650 - p * 100], [400 + i * 140, 600 - p * 100]], { color: '#fff', lw: 8, seed: 140 + i, alpha: 0.6 * (1 - p) }); }
      C.pill(ctx, t, ev.pica, 'cocido ya no pica', CX, 1300 + 40, '#5CFF9A');
      return ['Por eso el ananá cocido', 'como en las *pizzas*, ya no pica'];
    },
  ]);
})();
