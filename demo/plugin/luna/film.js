// La Luna (versión puteada). Zona útil: y 560-1340.
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, pop, out, cue } = C;
  const ev = {
    yendo: cue(0, 'yendo'), aleja: cue(0, 'aleja'), ortiva: cue(0, 'ortiva'),
    cuatro: cue(1, 'cuatro'), unias: cue(1, 'uñas'),
    espejos: cue(2, 'espejos'), laser: cue(2, 'láser'), ciencia: cue(2, 'ciencia'),
    alargan: cue(3, 'alargan'), dinosaurios: cue(3, 'dinosaurios'),
    cara: cue(4, 'cara'), atras: cue(4, 'atrás'), boliche: cue(4, 'boliche'),
    falta: cue(5, 'falta'), pieza: cue(5, 'pieza'),
  };
  const BIG = (ctx, t, t0, s, x, y, color = '#FFD22E', size = 100) => { if (t > t0) C.text(ctx, s, x, y, { size: size * pop(t, t0, 0.35), color, stroke: '#0b1030', strokeW: 14 }); };
  function moon(ctx, x, y, r, t, o = {}) {
    C.glow(ctx, x, y, r * 1.5, '230,230,255', 0.25);
    G.ellipse(ctx, x, y, r, r, { fill: '#D8D8E0', lw: 6, seed: 800 });
    (o.face ? [[-0.42, 0.45, 0.1], [0.4, -0.5, 0.09]] : [[-0.3, -0.2, 0.22], [0.25, 0.1, 0.16], [-0.05, 0.38, 0.12], [0.35, -0.35, 0.1]]).forEach(([dx, dy, rr], i) => G.ellipse(ctx, x + dx * r, y + dy * r, rr * r, rr * r, { fill: '#B8B8C4', lw: 3, seed: 801 + i }));
    if (o.face) { G.ellipse(ctx, x - r * 0.3, y - r * 0.1, r * 0.08, r * 0.1, { fill: '#333', lw: 0, seed: 806 }); G.ellipse(ctx, x + r * 0.3, y - r * 0.1, r * 0.08, r * 0.1, { fill: '#333', lw: 0, seed: 807 });
      if (o.face === 'smug') G.line(ctx, [[x - r * 0.25, y + r * 0.3], [x + r * 0.25, y + r * 0.22]], { lw: 6, seed: 808 }); else G.line(ctx, [[x - r * 0.2, y + r * 0.28], [x, y + r * 0.36], [x + r * 0.2, y + r * 0.28]], { lw: 6, seed: 809 });
      if (o.blush) { G.ellipse(ctx, x - r * 0.45, y + r * 0.15, r * 0.12, r * 0.07, { fill: '#FF9AB4', lw: 0, seed: 810, alpha: 0.8 }); G.ellipse(ctx, x + r * 0.45, y + r * 0.15, r * 0.12, r * 0.07, { fill: '#FF9AB4', lw: 0, seed: 811, alpha: 0.8 }); } }
  }
  C.film([
    function hook(ctx, t, a) {
      C.space(ctx, t);
      C.earth(ctx, 260, 1080, Math.max(10, 170 * pop(t, a, 0.5)), t);
      const k = out(t, ev.aleja - 0.3, 3);
      moon(ctx, lerp(620, 860, k), lerp(900, 780, k), 80 * (1 - 0.25 * k), t, { face: t > ev.ortiva ? 'smug' : 'happy' });
      if (t > ev.aleja) { ctx.save(); ctx.setLineDash([16, 12]); ctx.strokeStyle = '#7FD4FF'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(440, 1000); ctx.lineTo(lerp(560, 780, k), lerp(940, 820, k)); ctx.stroke(); ctx.restore(); }
      C.pill(ctx, t, ev.ortiva, 'ortiva', 830, 1000, '#E8324A');
      return ['La Luna', '*se está yendo*'];
    },
    function cm(ctx, t, a) {
      C.space(ctx, t);
      moon(ctx, 820, 760, 110, t, { face: 'happy' });
      // regla
      ctx.save(); ctx.translate(CX, 1100); G.rrect(ctx, -380, -50, 760, 100, 12, { fill: '#FFE07A', lw: 6, seed: 820 });
      for (let i = 0; i <= 20; i++) G.line(ctx, [[-360 + i * 36, -50], [-360 + i * 36, i % 5 ? -20 : 0]], { lw: 4, seed: 821 + (i % 4) });
      const k = out(t, ev.cuatro - 0.2, 1); G.rrect(ctx, -360, 10, 720 * 0.2 * k * 5 / 5, 24, 8, { fill: '#E8324A', lw: 0, seed: 826 }); ctx.restore();
      C.count(ctx, t, ev.cuatro - 0.2, 4, 330, 760, { suf: ' CM/AÑO', size: 86 });
      if (t > ev.unias - 0.2) { ctx.save(); ctx.translate(330, 1270); const s = pop(t, ev.unias - 0.2, 0.4); ctx.scale(s, s);
        G.rrect(ctx, -50, -60, 100, 140, 40, { fill: '#E9B48A', lw: 6, seed: 827 }); G.rrect(ctx, -34, -56, 68, 50, 20, { fill: '#FFE4EC', lw: 4, seed: 828 }); ctx.restore(); C.pill(ctx, t, ev.unias, 'como tus uñas', 640, 1270, '#FF9AB4'); }
      return ['Se aleja', '*4 cm por año*'];
    },
    function laser(ctx, t, a) {
      C.space(ctx, t);
      C.earth(ctx, 220, 1150, 150, t);
      moon(ctx, 820, 720, 120, t);
      if (t > ev.espejos - 0.2) { ctx.save(); ctx.translate(800, 800); ctx.scale(pop(t, ev.espejos - 0.2, 0.4), pop(t, ev.espejos - 0.2, 0.4)); G.rrect(ctx, -30, -20, 60, 40, 6, { fill: '#BFE6FF', lw: 4, seed: 830 }); ctx.restore(); }
      if (t > ev.laser - 0.1) { const p = clamp((t - ev.laser + 0.1) / 0.6); ctx.save(); ctx.strokeStyle = '#3FE07A'; ctx.lineWidth = 8; ctx.shadowColor = '#3FE07A'; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.moveTo(300, 1060); ctx.lineTo(lerp(300, 790, Math.min(1, p * 2)), lerp(1060, 805, Math.min(1, p * 2))); if (p > 0.5) ctx.lineTo(lerp(790, 310, (p - 0.5) * 2), lerp(805, 1075, (p - 0.5) * 2)); ctx.stroke(); ctx.restore(); }
      C.pill(ctx, t, ev.espejos, 'espejos del Apolo', 760, 900, '#BFE6FF');
      C.pill(ctx, t, ev.ciencia, 'láser ida y vuelta', 330, 680, '#3FE07A');
      return ['La medimos', 'con un *láser*'];
    },
    function dias(ctx, t, a) {
      C.bg(ctx, '#BFE6C0', '#F4F0D8');
      G.poly(ctx, [[-60, 1240], [1140, 1220], [1140, 1360], [-60, 1360]], { fill: '#8CC66A', lw: 6, seed: 840 });
      // dinosaurio simple
      ctx.save(); ctx.translate(330, 1180); const s = pop(t, ev.dinosaurios - 0.3, 0.5); ctx.scale(s, s);
      G.ellipse(ctx, 0, 0, 170, 90, { fill: '#5AB05A', lw: 7, seed: 841 }); G.poly(ctx, [[-150, -10], [-330, 30], [-150, 40]], { fill: '#5AB05A', lw: 6, seed: 842 });
      G.limb(ctx, [[120, -40], [200, -200]], { color: '#5AB05A', lw: 56, ink: '#111', outline: 5, seed: 843 }); G.ellipse(ctx, 230, -220, 70, 46, { fill: '#5AB05A', lw: 6, seed: 844 }); G.ellipse(ctx, 250, -235, 9, 9, { fill: '#111', lw: 0, seed: 845 });
      for (const lx of [-90, 80]) G.limb(ctx, [[lx, 60], [lx + Math.sin(t * 6) * 10, 140]], { color: '#5AB05A', lw: 40, ink: '#111', outline: 5, seed: 846 + lx });
      ctx.restore();
      ctx.save(); ctx.translate(800, 900); G.ellipse(ctx, 0, 0, 160, 160, { fill: '#fff', lw: 8, seed: 850 }); const sp = (t - a) * 2;
      ctx.save(); ctx.rotate(sp); G.line(ctx, [[0, 0], [0, -120]], { lw: 9, seed: 851 }); ctx.restore(); ctx.save(); ctx.rotate(sp / 12); G.line(ctx, [[0, 0], [70, 0]], { lw: 12, seed: 852 }); ctx.restore(); ctx.restore();
      C.pill(ctx, t, ev.alargan, 'los días se alargan', 800, 690, '#FFD22E');
      if (t > ev.dinosaurios) C.count(ctx, t, ev.dinosaurios, 23, 800, 1150, { pre: '~', suf: ' H', size: 90 });
      return ['Con dinosaurios', 'el día *duraba menos*'];
    },
    function cara(ctx, t, a) {
      C.space(ctx, t);
      C.earth(ctx, CX, 980, 110, t);
      const ang = (t - a) * 0.8, mx = CX + Math.cos(ang) * 360, my = 980 + Math.sin(ang) * 200;
      // la cara siempre mira a la Tierra
      ctx.save(); ctx.translate(mx, my); ctx.rotate(ang + Math.PI / 2 + Math.PI); ctx.translate(-mx, -my); moon(ctx, mx, my, 80, t, { face: 'happy', blush: t > ev.boliche }); ctx.restore();
      C.pill(ctx, t, ev.cara, 'siempre la misma cara', CX, 680, '#BFE6FF');
      if (t > ev.boliche) C.pill(ctx, t, ev.boliche, 'tímida', CX, 780, '#FF9AB4');
      return ['Siempre te muestra', 'la *misma cara*'];
    },
    function cierre(ctx, t, a) {
      C.bg(ctx, '#1A1440', '#06041A');
      moon(ctx, 820, 650, 90, t, { face: 'smug' });
      // pieza desordenada
      G.rrect(ctx, 120, 900, 840, 340, 24, { fill: '#6A5A8A', lw: 7, seed: 860 });
      for (let i = 0; i < 9; i++) G.rrect(ctx, 170 + (i * 97) % 720, 940 + (i * 61) % 240, 70, 40, 8, { fill: ['#E8324A', '#FFD22E', '#19B8B2', '#fff'][i % 4], lw: 4, seed: 861 + i });
      C.person(ctx, 330, 1230, 0.85 * pop(t, a, 0.5), { pose: 'sit', eyes: 'sleep', mouth: 'flat', style: { shirt: '#3E6FB0' } });
      BIG(ctx, t, ev.pieza, 'ORDENÁ TU PIEZA', CX, 820, '#FFD22E', 84);
      return ['Tranqui, que', '*falta muchísimo*'];
    },
  ]);
})();
