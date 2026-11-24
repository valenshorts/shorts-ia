// Por qué la sal derrite el hielo
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = { sal: cue(0, 'sal'), derrite: cue(0, 'derrite'), mezcla: cue(1, 'mezcla'), dificil: cue(1, 'difícil'), cero: cue(2, 'cero'), salada: cue(2, 'salada'),
    ciudades: cue(3, 'ciudades'), calles: cue(3, 'calles'), limite: cue(4, 'límite'), veintiun: cue(4, 'veintiún'), congela: cue(5, 'congela') };
  function ice(ctx, x, y, s, melt, seed = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const h = 200 * (1 - 0.6 * melt);
    G.rrect(ctx, -110, -h, 220, h, 26, { fill: 'rgba(200,240,255,0.85)', lw: 6, seed, stroke: '#7ACBEA' });
    G.line(ctx, [[-60, -h + 30], [-20, -h + 60]], { color: '#FFFFFF', lw: 8, seed: seed + 1 });
    if (melt > 0) G.ellipse(ctx, 0, 8, 150 + 120 * melt, 24 + 10 * melt, { fill: 'rgba(95,184,255,0.6)', lw: 4, seed: seed + 2 });
    ctx.restore();
  }
  function thermo(ctx, x, y, lvl, label, col = '#ff5a3a') {
    G.rrect(ctx, x - 30, y - 300, 60, 330, 30, { fill: '#F4F7FB', lw: 6, seed: 20 }); G.ellipse(ctx, x, y + 40, 55, 55, { fill: col, lw: 6, seed: 21 });
    G.rrect(ctx, x - 14, y - 300 * lvl, 28, 300 * lvl + 30, 14, { fill: col, lw: 0, seed: 22 });
    C.text(ctx, label, x, y - 330, { size: 60, color: '#FFFFFF', stroke: '#0b1030', strokeW: 10 });
  }
  const salt = (ctx, t, t0, x, y, n = 30) => { for (let i = 0; i < n; i++) { const p = clamp((t - t0 - i * 0.03) / 0.7); if (p <= 0) continue;
    G.rrect(ctx, x - 120 + (i * 37) % 240, y - 300 + p * 300 - ((i * 13) % 40), 12, 12, 2, { fill: '#FFFFFF', lw: 2, seed: 30 + i }); } };
  C.film([
    function derrite(ctx, t, a) {
      C.bg(ctx, '#0E2A4A', '#3A7AB0');
      ice(ctx, CX, 1150, 1.6 * pop(t, a, 0.5), out(t, ev.derrite, 1.4));
      salt(ctx, t, ev.sal - 0.2, CX, 830);
      G.rrect(ctx, CX - 60, 520, 120, 150, 20, { fill: '#F4F7FB', lw: 6, seed: 40, alpha: fade(t, ev.sal - 0.6) });
      C.pill(ctx, t, ev.derrite, 'se derrite', CX, 1300, '#5fb8ff');
      return ['Echás sal sobre el hielo', 'y se *derrite*'];
    },
    function mezcla(ctx, t, a) {
      C.bg(ctx, '#0E2A4A', '#2A5A8A');
      G.ellipse(ctx, CX, 950, 380, 380, { fill: 'rgba(95,184,255,0.25)', lw: 6, seed: 50 });
      for (let i = 0; i < 14; i++) { const ang = i * 0.9 + t * 0.6, r = 120 + (i * 37) % 200, x = CX + Math.cos(ang) * r, y = 950 + Math.sin(ang) * r;
        G.ellipse(ctx, x, y, 34, 34, { fill: '#5fb8ff', lw: 4, seed: 60 + i }); G.ellipse(ctx, x - 28, y - 20, 14, 14, { fill: '#F4F7FB', lw: 3, seed: 80 + i }); G.ellipse(ctx, x + 28, y - 20, 14, 14, { fill: '#F4F7FB', lw: 3, seed: 100 + i }); }
      const k = fade(t, ev.mezcla - 0.2);
      for (let i = 0; i < 8; i++) { const ang = i * 1.7 - t * 0.8, r = 80 + (i * 53) % 220; G.rrect(ctx, CX + Math.cos(ang) * r - 16, 950 + Math.sin(ang) * r - 16, 32, 32, 4, { fill: '#FFFFFF', lw: 3, seed: 120 + i, alpha: k, stroke: '#ff5a3a' }); }
      C.pill(ctx, t, ev.dificil, 'le cuesta congelarse', CX, 1310, '#FFD22E');
      return ['La sal se mezcla con el agua', 'y le cuesta *congelarse*'];
    },
    function cero(ctx, t, a) {
      C.bg(ctx, '#0E1A3A', '#22365E');
      thermo(ctx, 330, 1150, 0.55, '0 °C', '#5fb8ff');
      ctx.save(); ctx.globalAlpha = fade(t, ev.salada - 0.2); thermo(ctx, 750, 1150, 0.2, '-21 °C', '#19B8B2'); ctx.restore();
      C.pill(ctx, t, a + 0.3, 'agua pura', 330, 1290, '#5fb8ff'); C.pill(ctx, t, ev.salada, 'agua salada', 750, 1290, '#19B8B2');
      return ['El agua salada', 'necesita *mucho más frío*'];
    },
    function ciudades(ctx, t, a) {
      C.bg(ctx, '#2A3A5A', '#6A8AB0');
      for (let i = 0; i < 5; i++) G.rrect(ctx, 60 + i * 200, 620 + (i % 2) * 80, 170, 600, 10, { fill: ['#3A4A6A', '#4A5A7A'][i % 2], lw: 5, seed: 130 + i });
      G.poly(ctx, [[-50, 1220], [1130, 1220], [1130, 1400], [-50, 1400]], { fill: '#E8F2FF', lw: 5, seed: 140 });
      const x = lerp(-200, 1200, ((t - a) * 0.18) % 1);
      G.rrect(ctx, x - 160, 1080, 320, 140, 20, { fill: '#FFB020', lw: 6, seed: 141 }); G.ellipse(ctx, x - 90, 1220, 40, 40, { fill: '#222', lw: 4, seed: 142 }); G.ellipse(ctx, x + 90, 1220, 40, 40, { fill: '#222', lw: 4, seed: 143 });
      for (let i = 0; i < 12; i++) G.rrect(ctx, x - 200 - i * 30, 1200 + (i % 3) * 10, 10, 10, 2, { fill: '#FFFFFF', lw: 2, seed: 150 + i });
      for (let i = 0; i < 20; i++) G.star(ctx, (i * 97 + t * 30) % 1080, (i * 151 + t * 90) % 700 + 400, 6, { fill: '#FFFFFF' });
      return ['Por eso con nieve', 'tiran sal en las *calles*'];
    },
    function limite(ctx, t, a) {
      C.bg(ctx, '#0A1430', '#1A2A5A');
      thermo(ctx, CX, 1150, 1 - out(t, ev.veintiun - 0.3, 1), '-21 °C', '#19B8B2');
      for (let i = 0; i < 16; i++) G.star(ctx, (i * 131) % 1080, (i * 211) % 600 + 500, 10, { fill: '#BDE6FF', rot: t + i });
      C.pill(ctx, t, ev.limite, 'hay un límite', CX, 1300, '#ff5a3a');
      return ['Pero hay un límite', 'a *-21 °C* ni la sal sirve'];
    },
    function congela(ctx, t, a) {
      C.bg(ctx, '#0A1430', '#1A2A5A');
      const k = out(t, ev.congela - 0.2, 0.8);
      ice(ctx, CX, 1150, 1.6, 1 - k);
      for (let i = 0; i < 10; i++) G.star(ctx, CX + Math.cos(i * 0.63) * 330 * k, 1000 + Math.sin(i * 0.63) * 260 * k, 16 * k, { fill: '#BDE6FF', rot: t });
      C.pill(ctx, t, ev.congela, 'también se congela', CX, 1300, '#5fb8ff');
      return ['Ahí el agua salada', 'también se *congela*'];
    },
  ]);
})();
