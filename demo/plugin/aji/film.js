// Por qué pica el ají
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = { caliente: cue(0, 'caliente'), engania: cue(1, 'engaña'), sensores: cue(2, 'sensores'), calor: cue(2, 'calor'), quemando: cue(3, 'quemando'),
    sudas: cue(4, 'sudás'), rojo: cue(4, 'rojo'), pajaros: cue(5, 'pájaros'), semillas: cue(5, 'semillas'), mamiferos: cue(6, 'mamíferos'), solo: cue(6, 'solo') };
  function chili(ctx, x, y, s, r = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(s, s);
    G.poly(ctx, [[-30, -140], [40, -150], [70, -60], [60, 60], [20, 160], [-10, 190], [-20, 120], [-40, 0], [-50, -90]], { fill: '#E8302A', lw: 7, seed: 1, hatch: { color: 'rgba(120,0,0,0.15)', gap: 12 } });
    G.ellipse(ctx, 10, -150, 50, 22, { fill: '#4E8A3A', lw: 5, seed: 2 }); G.limb(ctx, [[10, -165], [20, -210], [50, -230]], { color: '#4E8A3A', lw: 16, outline: '#1a3a1a' });
    G.ellipse(ctx, -10, -60, 12, 40, { fill: 'rgba(255,255,255,0.5)', lw: 0, seed: 3 }); ctx.restore();
  }
  function bird(ctx, x, y, s, t, flap = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    G.ellipse(ctx, 0, 0, 90, 60, { fill: '#3E8AD8', lw: 5, seed: 10 }); G.ellipse(ctx, 70, -40, 45, 42, { fill: '#3E8AD8', lw: 5, seed: 11 });
    G.poly(ctx, [[110, -40], [150, -30], [110, -20]], { fill: '#FFB020', lw: 4, seed: 12 }); G.ellipse(ctx, 82, -48, 7, 8, { fill: '#111', lw: 0, seed: 13 });
    const w = Math.sin(t * 12) * 0.6 * flap; G.poly(ctx, [[-20, -10], [-120, -90 - 60 * w], [40, -20]], { fill: '#2A6AB8', lw: 5, seed: 14 });
    G.poly(ctx, [[-80, 0], [-150, -20], [-150, 30]], { fill: '#2A6AB8', lw: 4, seed: 15 }); ctx.restore();
  }
  C.film([
    function picante(ctx, t, a) {
      C.bg(ctx, '#3A0E0E', '#7A1E1E');
      chili(ctx, CX, 950, 2.2 * pop(t, a, 0.5), Math.sin(t * 1.5) * 0.1);
      const k = fade(t, ev.caliente - 0.2);
      ctx.save(); ctx.translate(820, 720); ctx.globalAlpha = k; G.rrect(ctx, -26, -140, 52, 220, 26, { fill: '#F4F7FB', lw: 5, seed: 20 }); G.ellipse(ctx, 0, 100, 50, 50, { fill: '#5fb8ff', lw: 5, seed: 21 }); G.rrect(ctx, -12, -40, 24, 130, 10, { fill: '#5fb8ff', lw: 0, seed: 22 }); ctx.restore();
      C.pill(ctx, t, ev.caliente, 'no está caliente', CX, 1300, '#5fb8ff');
      return ['El ají picante', 'no está *caliente*'];
    },
    function engania(ctx, t, a) {
      C.bg(ctx, '#1A0E3A', '#3A2A6A');
      chili(ctx, 300, 980, 1.4, -0.3 + Math.sin(t * 2) * 0.1);
      ctx.save(); ctx.translate(320, 860); G.rrect(ctx, -110, -26, 220, 52, 26, { fill: '#111', lw: 4, seed: 30 }); G.ellipse(ctx, -50, 0, 40, 26, { fill: '#222', lw: 3, seed: 31 }); G.ellipse(ctx, 50, 0, 40, 26, { fill: '#222', lw: 3, seed: 32 }); ctx.restore();
      G.ellipse(ctx, 720, 960, 170, 140, { fill: '#F2A0B8', lw: 6, seed: 33 });
      C.text(ctx, '?', 720, 1010, { size: 160 * pop(t, ev.engania, 0.4), color: '#FFD22E', stroke: '#0b1030', strokeW: 12 });
      return ['', '*Engaña* a tu cerebro'];
    },
    function sensores(ctx, t, a) {
      C.bg(ctx, '#3A1E2A', '#7A3B4A');
      G.ellipse(ctx, CX, 980, 400, 260, { fill: '#F08A9A', lw: 7, seed: 40 }); G.line(ctx, [[CX, 760], [CX, 1180]], { color: '#C85A6A', lw: 6, seed: 41 });
      for (let i = 0; i < 12; i++) { const x = CX - 300 + (i % 4) * 200, y = 860 + Math.floor(i / 4) * 120, on = t > ev.sensores + i * 0.06;
        G.ellipse(ctx, x, y, 26, 26, { fill: on ? '#FF6A2A' : '#E06A7A', lw: 4, seed: 50 + i }); if (on) C.glow(ctx, x, y, 60, '255,120,40', 0.5); }
      C.pill(ctx, t, ev.calor, 'sensores de calor', CX, 1300, '#ff5a3a');
      return ['Se pega a los sensores', 'que detectan el *calor*'];
    },
    function quemando(ctx, t, a) {
      C.bg(ctx, '#3A0E0E', '#7A1E1E');
      for (let i = 0; i < 9; i++) { const x = 120 + i * 105, h = 160 + 60 * Math.sin(t * 8 + i); G.poly(ctx, [[x - 50, 1260], [x, 1260 - h], [x + 50, 1260]], { fill: i % 2 ? '#FFB020' : '#FF5A2A', lw: 4, seed: 60 + i, alpha: fade(t, ev.quemando - 0.4) }); }
      C.person(ctx, CX, 1200, 1.15, { eyes: 'wide', mouth: 'open', brows: 'worried', blush: 1, style: { shirt: '#19B8B2' } });
      return ['Tu cerebro cree', 'que te estás *quemando*'];
    },
    function sudas(ctx, t, a) {
      C.bg(ctx, '#3A1E0E', '#8A3A1E');
      const red = fade(t, ev.rojo - 0.3, 0.6);
      C.person(ctx, CX, 1330, 1.35, { eyes: 'closed', mouth: { open: 0.6 + 0.3 * Math.abs(Math.sin(t * 10)), wide: 0.8 }, sweat: true, blush: 0.4 + 0.6 * red, style: { shirt: '#19B8B2' } });
      for (let i = 0; i < 6; i++) G.ellipse(ctx, CX - 150 + i * 60, 760 + ((t * 300 + i * 50) % 200), 9, 15, { fill: '#5fb8ff', lw: 2, seed: 70 + i });
      C.pill(ctx, t, ev.sudas, 'sudás', 250, 700, '#5fb8ff'); C.pill(ctx, t, ev.rojo, 'te ponés rojo', 820, 700, '#ff5a3a');
      return ['Por eso', 'sudás y te ponés *rojo*'];
    },
    function pajaros(ctx, t, a) {
      C.bg(ctx, '#1E5A8A', '#7AC0E0');
      G.limb(ctx, [[-50, 1150], [400, 1100], [1130, 1160]], { color: '#6A4A2A', lw: 40, outline: '#2a1a0a' });
      for (let i = 0; i < 4; i++) chili(ctx, 250 + i * 190, 1230, 0.45, 0.2);
      bird(ctx, 420, 1030 + Math.sin(t * 3) * 6, 1.2, t, 0.2); bird(ctx, 760, 820 + Math.sin(t * 2) * 30, 0.9, t, 1);
      const k = t > ev.semillas;
      if (k) for (let i = 0; i < 6; i++) { const p = ((t - ev.semillas) * 0.8 + i / 6) % 1; G.ellipse(ctx, 760 + p * 300, 860 + p * p * 500, 8, 10, { fill: '#F4E0A0', lw: 2, seed: 80 + i }); }
      C.pill(ctx, t, ev.pajaros + 0.3, 'no sienten nada', 420, 620, '#FFD22E');
      return ['Lo más curioso', 'los *pájaros* no sienten nada'];
    },
    function planta(ctx, t, a) {
      C.bg(ctx, '#0E3A1E', '#2E7A3E');
      G.limb(ctx, [[CX, 1300], [CX - 20, 1000], [CX, 760]], { color: '#4E8A3A', lw: 30, outline: '#1a3a1a' });
      for (let i = 0; i < 5; i++) { G.ellipse(ctx, CX + (i % 2 ? 110 : -110), 1180 - i * 100, 90, 40, { fill: '#5AAA4A', lw: 5, seed: 90 + i }); chili(ctx, CX + (i % 2 ? -90 : 90), 1150 - i * 90, 0.4, i % 2 ? 0.4 : -0.4); }
      ctx.save(); ctx.globalAlpha = fade(t, ev.mamiferos - 0.2); G.ellipse(ctx, 220, 1240, 90, 60, { fill: '#9A7A5A', lw: 5, seed: 99 });
      G.ellipse(ctx, 220, 1240, 130, 130, { fill: 'rgba(0,0,0,0)', stroke: '#ff5a3a', lw: 14, seed: 100 }); G.line(ctx, [[130, 1150], [310, 1330]], { color: '#ff5a3a', lw: 14, seed: 101 }); ctx.restore();
      bird(ctx, 860, 900, 0.8, t, 1);
      return ['La planta inventó el picante', 'para que coman *solo los pájaros*'];
    },
  ]);
})();
