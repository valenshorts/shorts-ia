// Tu cerebro gasta el 20% de tu energía
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = { pesa: cue(0, 'pesa'), dos: cue(0, 'dos'), veinte: cue(1, 'veinte'), sillon: cue(2, 'sillón'), maquina: cue(2, 'máquina'), respiracion: cue(2, 'respiración'),
    corazon: cue(2, 'corazón'), recuerdos: cue(2, 'recuerdos'), cansa: cue(3, 'cansa'), dormis: cue(4, 'dormís'), apaga: cue(4, 'apaga') };
  function brain(ctx, x, y, s, t, glow = 0) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (glow) C.glow(ctx, 0, 0, 300, '255,210,46', 0.45 * glow);
    G.ellipse(ctx, -75, 0, 145, 125, { fill: '#F2A0B8', lw: 6, seed: 10 }); G.ellipse(ctx, 75, 0, 145, 125, { fill: '#F2A0B8', lw: 6, seed: 11 });
    for (let i = 0; i < 7; i++) G.line(ctx, [[-190 + i * 62, -70 + (i % 2) * 30], [-160 + i * 62, 20], [-180 + i * 62, 80]], { color: '#B85A7A', lw: 6, seed: 12 + i });
    ctx.restore();
  }
  function battery(ctx, x, y, s, lvl, col) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    G.rrect(ctx, -90, -170, 180, 340, 26, { fill: '#1A2348', lw: 7, seed: 20 }); G.rrect(ctx, -36, -200, 72, 34, 8, { fill: '#1A2348', lw: 5, seed: 21 });
    const h = 300 * lvl; G.rrect(ctx, -70, 150 - h, 140, h, 14, { fill: col || (lvl > 0.3 ? '#5CFF9A' : '#ff5a3a'), lw: 0, seed: 22 }); ctx.restore();
  }
  C.film([
    function pesa(ctx, t, a) {
      C.bg(ctx, '#0E1A3A', '#22365E');
      C.person(ctx, 330, 1330, 1.25 * pop(t, a, 0.5), { eyes: 'normal', mouth: 'smile', style: { shirt: '#19B8B2' } });
      brain(ctx, 330, 640, 0.32 * pop(t, ev.pesa, 0.4), t);
      if (t > ev.pesa) G.line(ctx, [[330, 690], [330, 790]], { color: '#F2A0B8', lw: 5, seed: 33 });
      G.line(ctx, [[600, 1100], [980, 1100]], { color: '#C9D6E8', lw: 8, seed: 30 }); G.poly(ctx, [[790, 1100], [750, 1200], [830, 1200]], { fill: '#C9D6E8', lw: 5, seed: 31 });
      const k = fade(t, ev.dos - 0.2);
      G.rrect(ctx, 640, 960, 120, 140, 14, { fill: '#3E6FB0', lw: 5, seed: 32, alpha: k }); brain(ctx, 900, 1060, 0.18 * k, t);
      C.text(ctx, '2%', 900, 960, { size: 110, color: '#FFD22E', stroke: '#0b1030', strokeW: 12, alpha: k });
      return ['Tu cerebro pesa', 'el *2%* de tu cuerpo'];
    },
    function gasta(ctx, t, a) {
      C.bg(ctx, '#1A0E3A', '#3A2A6A');
      brain(ctx, CX, 780, 1.2 * pop(t, a, 0.5), t, fade(t, ev.veinte - 0.2));
      const k = out(t, ev.veinte - 0.3, 0.9);
      ctx.save(); ctx.translate(CX, 1230); G.rrect(ctx, -380, -30, 760, 60, 30, { fill: '#1A2348', lw: 6, seed: 40 }); G.rrect(ctx, -370, -20, 740 * 0.2 * k, 40, 20, { fill: '#FFD22E', lw: 0, seed: 41 }); ctx.restore();
      C.count(ctx, t, ev.veinte - 0.2, 20, CX, 1150, { size: 110, suf: '%' });
      C.pill(ctx, t, ev.veinte + 0.5, 'de toda tu energía', CX, 1310 - 4, '#FFD22E');
      return ['Pero gasta', 'el *20%* de tu energía'];
    },
    function sillon(ctx, t, a) {
      C.bg(ctx, '#2A1A3A', '#5A3A6A');
      G.rrect(ctx, 140, 1040, 800, 200, 60, { fill: '#A23B3B', lw: 6, seed: 50 }); G.rrect(ctx, 140, 880, 800, 200, 60, { fill: '#B84A4A', lw: 6, seed: 51 });
      C.person(ctx, 540, 1120, 0.95 * pop(t, a, 0.5), { pose: 'sit', eyes: 'sleep', mouth: 'smile', style: { shirt: '#19B8B2' } });
      brain(ctx, 560, 640, 0.6, t, 0.6 + 0.4 * Math.sin(t * 8));
      for (let i = 0; i < 3; i++) { const ang = t * 3 + i * 2.1; G.rrect(ctx, 560 + Math.cos(ang) * 230 - 18, 640 + Math.sin(ang) * 110 - 18, 36, 36, 6, { fill: '#5a6a8a', lw: 3, seed: 60 + i }); }
      C.pill(ctx, t, ev.respiracion, 'respiración', 250, 820, '#5fb8ff'); C.pill(ctx, t, ev.corazon, 'corazón', 830, 820, '#ff5a3a'); C.pill(ctx, t, ev.recuerdos, 'recuerdos', CX, 470 + 40, '#FFD22E');
      return ['Aunque estés tirado en el sillón', 'trabaja a *toda máquina*'];
    },
    function cansa(ctx, t, a) {
      C.bg(ctx, '#12304A', '#2A5A7A');
      G.rrect(ctx, 180, 1060, 720, 40, 10, { fill: '#8A5A3A', lw: 5, seed: 70 });
      for (let i = 0; i < 4; i++) G.rrect(ctx, 640 + i * 8, 980 - i * 40, 200, 40, 6, { fill: ['#3E6FB0', '#A23B3B', '#4E8A5A', '#FFD22E'][i], lw: 4, seed: 71 + i });
      C.person(ctx, 400, 1330, 1.1, { eyes: 'closed', mouth: 'wavy', brows: 'worried', sweat: true, gesture: 'think', style: { shirt: '#7A4FA0' } });
      battery(ctx, 860, 700, 0.6, 1 - 0.8 * out(t, ev.cansa - 0.4, 1.2));
      return ['Por eso pensar mucho', '*cansa* de verdad'];
    },
    function dormir(ctx, t, a) {
      C.bg(ctx, '#0E1430', '#1E2A5A');
      G.ellipse(ctx, 860, 540, 60, 60, { fill: '#F4E9B8', lw: 5, seed: 80 });
      C.person(ctx, 330, 1330, 1.1, { eyes: 'sleep', mouth: 'flat', brows: 'worried', style: { shirt: '#3E6FB0' } });
      const off = out(t, ev.apaga - 0.2, 0.4);
      brain(ctx, 720, 900, 0.75, t, 0);
      ctx.save(); ctx.globalAlpha = off * 0.65; ctx.fillStyle = '#05081f'; ctx.beginPath(); ctx.ellipse(720, 900, 240, 110, 0, 0, 7); ctx.fill(); ctx.restore();
      battery(ctx, 720, 1180, 0.35, 0.12);
      C.pill(ctx, t, ev.apaga, 'se apaga la cabeza', 720, 640, '#ff5a3a');
      return ['Cuando no dormís bien', 'se te *apaga* la cabeza'];
    },
  ]);
})();
