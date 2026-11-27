// Mitos que te creíste (versión puteada). Zona útil: y 560-1340.
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, pop, out, cue } = C;
  const ev = {
    mentira: cue(0, 'mentira'), una: cue(0, 'una'),
    diez: cue(1, 'diez'), todo: cue(1, 'todo'),
    chicle: cue(2, 'chicle'), siete: cue(2, 'siete'), dias: cue(2, 'días'),
    ciegos: cue(3, 'ciegos'), eco: cue(3, 'eco'), anteojos: cue(3, 'anteojos'),
    rayo: cue(4, 'rayo'), dos: cue(4, 'dos'), empire: cue(4, 'empire'), veinte: cue(4, 'veinte'),
    giladas: cue(5, 'giladas'), mandaselo: cue(5, 'mandáselo'),
  };
  const BIG = (ctx, t, t0, s, x, y, color = '#FFD22E', size = 100) => { if (t > t0) C.text(ctx, s, x, y, { size: size * pop(t, t0, 0.35), color, stroke: '#0b1030', strokeW: 14 }); };
  // sello rojo de MITO / FALSO
  function stamp(ctx, t, t0, x, y, txt = 'MITO') {
    if (t < t0) return; const k = clamp((t - t0) / 0.25), s = lerp(2.2, 1, k);
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.18); ctx.scale(s, s); ctx.globalAlpha = k;
    ctx.strokeStyle = '#E8324A'; ctx.lineWidth = 12; ctx.beginPath(); ctx.roundRect(-190, -70, 380, 140, 20); ctx.stroke();
    C.text(ctx, txt, 0, 34, { size: 96, color: '#E8324A', shadow: false }); ctx.restore();
  }
  const paper = (ctx) => { C.bg(ctx, '#2E3A6A', '#141C3A'); };
  C.film([
    function hook(ctx, t, a) {
      paper(ctx);
      const items = ['🧠', '🍬', '🦇', '⚡'];
      const draw = [(x, y) => G.ellipse(ctx, x, y, 80, 64, { fill: '#FF9AB4', lw: 6, seed: 700 }), (x, y) => G.rrect(ctx, x - 70, y - 30, 140, 60, 20, { fill: '#FF8AD0', lw: 6, seed: 701 }),
        (x, y) => { G.ellipse(ctx, x, y, 34, 40, { fill: '#5A4A6A', lw: 5, seed: 702 }); G.poly(ctx, [[x - 30, y - 10], [x - 120, y - 50], [x - 90, y + 20]], { fill: '#5A4A6A', lw: 5, seed: 703 }); G.poly(ctx, [[x + 30, y - 10], [x + 120, y - 50], [x + 90, y + 20]], { fill: '#5A4A6A', lw: 5, seed: 704 }); },
        (x, y) => G.poly(ctx, [[x + 10, y - 90], [x - 50, y + 10], [x, y + 10], [x - 20, y + 90], [x + 60, y - 20], [x + 10, y - 20]], { fill: '#FFD22E', lw: 5, seed: 705 })];
      draw.forEach((f, i) => { const s = pop(t, a + i * 0.2, 0.4); if (s <= 0) return; ctx.save(); const x = 280 + (i % 2) * 520, y = 760 + Math.floor(i / 2) * 330; ctx.translate(x, y); ctx.scale(2 * s, 2 * s); ctx.translate(-x, -y); f(x, y); ctx.restore(); });
      stamp(ctx, t, ev.mentira, CX, 925, 'MENTIRA');
      return ['Cosas que te creíste', 'y son *mentira*'];
    },
    function cerebro(ctx, t, a) {
      paper(ctx);
      ctx.save(); ctx.translate(CX, 960); const s = pop(t, a, 0.5); ctx.scale(s, s);
      G.ellipse(ctx, 0, 0, 300, 220, { fill: '#FF9AB4', lw: 8, seed: 710 });
      const lit = t > ev.todo - 0.2 ? 1 : 0.1;
      ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 296, 216, 0, 0, 7); ctx.clip(); ctx.fillStyle = 'rgba(255,230,80,0.55)'; ctx.fillRect(-300, -220, 600 * lit, 440); ctx.restore();
      for (let i = 0; i < 6; i++) G.line(ctx, [[-240 + i * 90, -150], [-200 + i * 90, -50], [-250 + i * 90, 50], [-210 + i * 90, 150]], { color: '#C85A7A', lw: 7, seed: 711 + i });
      ctx.restore();
      C.count(ctx, t, ev.diez - 0.2, 10, 250, 680, { suf: ' %', size: 96 });
      stamp(ctx, t, ev.diez + 0.6, 250, 800);
      if (t > ev.todo) C.count(ctx, t, ev.todo, 100, 820, 680, { suf: ' %', size: 96, color: '#3FE07A' });
      return ['¿Usás solo', 'el *10 %* del cerebro?'];
    },
    function chicle(ctx, t, a) {
      paper(ctx);
      C.person(ctx, 330, 1320, 1.25 * pop(t, a, 0.5), { pose: 'stand', eyes: 'wide', mouth: 'o', style: { shirt: '#19B8B2' } });
      // chicle que baja y sale
      const k = out(t, ev.dias - 0.5, 1.6);
      if (t > ev.chicle - 0.2) G.ellipse(ctx, 330, lerp(860, 1180, k), 22, 16, { fill: '#FF8AD0', lw: 4, seed: 720 });
      C.count(ctx, t, ev.siete - 0.2, 7, 780, 760, { suf: ' AÑOS', size: 96 });
      stamp(ctx, t, ev.siete + 0.7, 780, 880);
      if (t > ev.dias) C.pill(ctx, t, ev.dias, 'sale en unos días', 780, 1030, '#3FE07A');
      return ['¿El chicle queda', '*7 años* en la panza?'];
    },
    function murcielago(ctx, t, a) {
      C.bg(ctx, '#1A1440', '#06041A');
      C.glow(ctx, 860, 680, 160, '255,250,200', 0.4); G.ellipse(ctx, 860, 680, 70, 70, { fill: '#F4F0D0', lw: 5, seed: 730 });
      const x = lerp(220, 520, clamp((t - a) / 4)), fl = Math.sin(t * 12) * 0.5;
      ctx.save(); ctx.translate(x, 960); const s = 1.6 * pop(t, a, 0.5); ctx.scale(s, s);
      ctx.save(); ctx.rotate(fl); G.poly(ctx, [[-20, 0], [-150, -60], [-120, 0], [-150, 40]], { fill: '#5A4A6A', lw: 5, seed: 731 }); ctx.restore();
      ctx.save(); ctx.rotate(-fl); G.poly(ctx, [[20, 0], [150, -60], [120, 0], [150, 40]], { fill: '#5A4A6A', lw: 5, seed: 732 }); ctx.restore();
      G.ellipse(ctx, 0, 0, 40, 50, { fill: '#6A5A7A', lw: 5, seed: 733 }); G.poly(ctx, [[-26, -40], [-18, -78], [-6, -44]], { fill: '#6A5A7A', lw: 4, seed: 734 }); G.poly(ctx, [[26, -40], [18, -78], [6, -44]], { fill: '#6A5A7A', lw: 4, seed: 735 });
      G.ellipse(ctx, -14, -14, 9, 9, { fill: '#fff', lw: 0, seed: 736 }); G.ellipse(ctx, 14, -14, 9, 9, { fill: '#fff', lw: 0, seed: 737 }); G.ellipse(ctx, -14, -14, 4, 4, { fill: '#111', lw: 0, seed: 738 }); G.ellipse(ctx, 14, -14, 4, 4, { fill: '#111', lw: 0, seed: 739 });
      ctx.restore();
      if (t > ev.eco - 0.2) for (let i = 0; i < 4; i++) { const p = ((t - ev.eco + 0.2) * 0.9 + i / 4) % 1; ctx.save(); ctx.globalAlpha = 1 - p; ctx.strokeStyle = '#7FD4FF'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x + 80, 960, 40 + p * 360, -0.6, 0.6); ctx.stroke(); ctx.restore(); }
      stamp(ctx, t, ev.ciegos, 780, 1240, 'CIEGOS');
      C.pill(ctx, t, ev.eco, 'ven y usan el eco', 300, 1250, '#7FD4FF');
      return ['¿Los murciélagos', 'son *ciegos*?'];
    },
    function rayo(ctx, t, a) {
      C.bg(ctx, '#2A2E4A', '#0E1022');
      ctx.save(); ctx.translate(CX, 1340); const s = pop(t, a, 0.5); ctx.scale(s, s);
      G.rrect(ctx, -90, -560, 180, 560, 8, { fill: '#8A92A8', lw: 7, seed: 740 }); G.rrect(ctx, -50, -700, 100, 150, 8, { fill: '#8A92A8', lw: 7, seed: 741 }); G.line(ctx, [[0, -700], [0, -820]], { lw: 8, seed: 742 });
      for (let r = 0; r < 9; r++) for (let c = 0; c < 3; c++) G.rrect(ctx, -66 + c * 48, -530 + r * 58, 30, 36, 4, { fill: '#FFE89A', lw: 0, seed: 743 });
      ctx.restore();
      const strike = (t0) => { const d = t - t0; if (d < 0 || d > 0.35) return; ctx.save(); ctx.globalAlpha = 1 - d / 0.35; G.poly(ctx, [[CX + 40, 560], [CX - 30, 640], [CX + 20, 640], [CX - 20, 700], [CX + 10, 700]], { fill: '#FFF6A0', lw: 0, seed: 744 }); G.line(ctx, [[CX + 60, 560], [CX - 10, 620], [CX + 20, 640], [CX - 10, 700], [CX, 520 + 180]], { color: '#FFF6A0', lw: 14, seed: 745 }); ctx.restore(); ctx.fillStyle = `rgba(255,255,220,${0.25 * (1 - d / 0.35)})`; ctx.fillRect(0, 0, 1080, 1920); };
      strike(ev.rayo); strike(ev.dos); strike(ev.dos + 0.6); if (t > ev.veinte) strike(ev.veinte + ((t - ev.veinte) % 1.2 < 0.35 ? Math.floor((t - ev.veinte) / 1.2) * 1.2 : -9));
      C.count(ctx, t, ev.veinte - 0.2, 20, 830, 760, { suf: '/AÑO', size: 90 });
      C.pill(ctx, t, ev.empire, 'empire state', 250, 760, '#7FD4FF');
      return ['El rayo', '*sí cae* dos veces en el mismo lugar'];
    },
    function cierre(ctx, t, a) {
      paper(ctx);
      if (t > ev.mandaselo - 0.1) G.rays(ctx, CX, 1000, { n: 18, r0: 300, r1: 1300, color: '#FFD22E', lw: 10, alpha: 0.2, spin: t * 0.4 });
      C.person(ctx, 330, 1320, 1.1 * pop(t, a, 0.5), { pose: 'stand', eyes: 'focus', mouth: 'smirk', style: { shirt: '#3E6FB0' } });
      ctx.save(); ctx.translate(780, 1040); const s = pop(t, ev.mandaselo - 0.2, 0.4); ctx.scale(s, s);
      G.rrect(ctx, -90, -170, 180, 340, 26, { fill: '#222', lw: 6, seed: 750 }); G.rrect(ctx, -76, -150, 152, 300, 16, { fill: '#5FB8FF', lw: 0, seed: 751 });
      G.poly(ctx, [[-40, 20], [50, -30], [20, 60]], { fill: '#fff', lw: 0, seed: 752 }); ctx.restore();
      BIG(ctx, t, ev.giladas, 'BASTA DE GILADAS', CX, 700, '#fff', 84);
      return ['Al que se las sabe todas', '*mandáselo*'];
    },
  ]);
})();
