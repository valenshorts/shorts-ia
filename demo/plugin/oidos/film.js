// Por qué se te tapan los oídos en el avión
(function () {
  const G = globalThis.G, Ch = globalThis.Ch, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const SKIN = '#E9B48A', SKIN2 = '#C98E66';
  const ev = { tubito: cue(0, 'tubito'), camara: cue(1, 'cámara'), conectada: cue(1, 'conectada'), sube: cue(2, 'sube'), afuera: cue(2, 'afuera'),
    adentro: cue(2, 'adentro'), empujado: cue(3, 'empujado'), tapa: cue(3, 'tapa'), tragas: cue(4, 'tragás'), pop: cue(4, 'pop'), bebes: cue(5, 'bebés') };

  function sky(ctx, t) {
    C.bg(ctx, '#2B6FD6', '#9FD3FF');
    for (let i = 0; i < 5; i++) { const x = ((i * 290 - t * 60) % 1500 + 1500) % 1500 - 200, y = 560 + (i % 3) * 230;
      G.ellipse(ctx, x, y, 120, 44, { fill: '#FFFFFF', lw: 4, seed: 10 + i }); G.ellipse(ctx, x + 70, y - 25, 80, 40, { fill: '#FFFFFF', lw: 4, seed: 20 + i }); }
  }
  function plane(ctx, x, y, s, r) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(s, s);
    G.poly(ctx, [[-60, 0], [-160, -120], [-110, -120], [20, 0]], { fill: '#C9D6E8', lw: 5, seed: 31 });
    G.rrect(ctx, -280, -48, 560, 96, 48, { fill: '#F4F7FB', lw: 6, seed: 30 });
    G.poly(ctx, [[-250, -40], [-300, -150], [-230, -150], [-180, -40]], { fill: '#19B8B2', lw: 5, seed: 32 });
    for (let i = 0; i < 7; i++) G.ellipse(ctx, -150 + i * 55, -12, 13, 16, { fill: '#2B4A7A', lw: 3, seed: 40 + i });
    G.poly(ctx, [[-40, 10], [60, 130], [120, 130], [60, 10]], { fill: '#C9D6E8', lw: 5, seed: 33 });
    ctx.restore();
  }
  // corte del oído: canal, tímpano (abombado b), cámara de aire, tubito hacia la garganta (abierto o)
  function ear(ctx, x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    G.rrect(ctx, -420, -300, 840, 600, 60, { fill: '#F2C6A4', lw: 6, seed: 50, hatch: { color: 'rgba(150,80,40,0.12)', gap: 12 } });
    G.rrect(ctx, -440, -70, 260, 120, 50, { fill: '#7A3B2E', lw: 5, seed: 51 });          // canal del oído
    const b = o.b || 0;
    G.line(ctx, [[-180, -90], [-180 + 40 * b, -10], [-180, 70]], { color: '#FF8A6A', lw: 16, seed: 52 }); // tímpano
    G.ellipse(ctx, -10, -10, 150, 120, { fill: o.air || '#BDE6FF', lw: 6, seed: 53 });      // cámara de aire
    for (let i = 0; i < 6; i++) G.ellipse(ctx, -60 + (i % 3) * 55 + Math.sin(t * 3 + i) * 6, -50 + Math.floor(i / 3) * 70, 12, 12, { fill: '#FFFFFF', lw: 2.5, seed: 60 + i, alpha: 0.85 });
    const w = 14 + 22 * (o.open || 0);
    G.limb(ctx, [[80, 60], [200, 160], [330, 260]], { color: o.hi ? '#FFD22E' : '#E58C6A', lw: w * 2, outline: '#5a2a1a' }); // tubito
    ctx.restore();
  }
  function head(ctx, x, y, s, o) {
    Ch.person(ctx, Object.assign({ x, y, pose: 'stand', s, style: { hairStyle: 'short', outfit: 'tee', shirt: '#3E6FB0' } }, o));
  }

  C.film([
    function avion(ctx, t, a) {
      sky(ctx, t);
      plane(ctx, CX + Math.sin(t * 0.9) * 20, 760 + Math.sin(t * 1.3) * 12, 1.25 * pop(t, a, 0.5), -0.08);
      const k = out(t, ev.tubito - 0.3, 0.5);
      if (k > 0) { // zoom al tubito escondido
        ctx.save(); ctx.globalAlpha = k;
        G.ellipse(ctx, CX, 1060, 300 * k, 230 * k, { fill: '#0F2448', lw: 7, seed: 70, stroke: '#FFD22E' });
        ear(ctx, CX, 1060, 0.42 * k, t, { hi: true });
        ctx.restore();
        C.pill(ctx, t, ev.tubito + 0.2, 'tubito escondido', CX + 160, 1290, '#FFD22E');
      }
      return ['Si se te tapan los oídos', 'la culpa es de un *tubito*'];
    },
    function camara(ctx, t, a) {
      C.bg(ctx, '#3A1E2A', '#7A3B4A');
      ear(ctx, CX, 950, 1.05 * pop(t, a, 0.5), t, { hi: t > ev.conectada - 0.2 });
      C.pill(ctx, t, ev.camara, 'cámara de aire', CX - 10, 760, '#5fb8ff');
      C.pill(ctx, t, ev.conectada, 'a la garganta', CX + 250, 1250, '#FFD22E');
      C.pill(ctx, t, a + 0.4, 'tímpano', CX - 300, 820);
      return ['Detrás de cada oído', 'una *cámara* de aire'];
    },
    function presion(ctx, t, a, b) {
      sky(ctx, t);
      const climb = ease.inOutCubic(clamp((t - a) / (b - a)));
      plane(ctx, lerp(200, 880, climb), lerp(1150, 650, climb), 0.7, -0.35);
      const pa = fade(t, ev.afuera - 0.2), pi = fade(t, ev.adentro - 0.2);
      for (let i = 0; i < 10; i++) { // flechas de presión de afuera: cambian rápido
        const ang = (i / 10) * Math.PI * 2 + t * 0.6, r = 330 + Math.sin(t * 9 + i) * 25 * pa;
        const x = CX + Math.cos(ang) * r, y = 1020 + Math.sin(ang) * r * 0.75;
        G.line(ctx, [[x, y], [x - Math.cos(ang) * 70, y - Math.sin(ang) * 52]], { color: '#ff5a3a', lw: 9, seed: 80 + i, alpha: pa });
      }
      G.ellipse(ctx, CX, 1020, 230, 175, { fill: 'rgba(189,230,255,0.85)', lw: 7, seed: 90, alpha: Math.max(pa, pi) });
      C.text(ctx, 'AIRE ADENTRO', CX, 1035, { size: 48, color: '#0F2448', alpha: pi, shadow: false });
      C.pill(ctx, t, ev.afuera, 'presión de afuera', CX, 700, '#ff5a3a');
      return ['Cuando el avión sube o baja', 'la *presión* cambia'];
    },
    function timpano(ctx, t, a) {
      C.bg(ctx, '#3A1E2A', '#7A3B4A');
      const b = out(t, ev.empujado - 0.2, 0.5) * (1 + 0.08 * Math.sin(t * 8));
      ear(ctx, CX + 120, 900, 0.95, t, { b: b * 2.2, air: '#9FCBE8' });
      head(ctx, 230, 1340, 0.75, { eyes: t > ev.tapa ? 'worried' : 'normal', mouth: t > ev.tapa ? 'wavy' : 'flat', brows: 'worried', gesture: t > ev.tapa ? 'facepalm' : undefined });
      C.pill(ctx, t, ev.empujado, 'tímpano empujado', CX + 60, 640, '#ff5a3a');
      return ['Entonces el tímpano', 'queda *empujado*'];
    },
    function pop_(ctx, t, a) {
      C.bg(ctx, '#3A1E2A', '#7A3B4A');
      const open = out(t, ev.pop - 0.35, 0.3);
      ear(ctx, CX + 120, 900, 0.95, t, { b: 2.2 * (1 - open), open, air: open > 0.5 ? '#BDE6FF' : '#9FCBE8', hi: open > 0 });
      head(ctx, 230, 1340, 0.75, { eyes: open > 0.5 ? 'happy' : 'closed', mouth: t > ev.tragas && t < ev.pop ? 'open' : 'smile' });
      const p = clamp((t - ev.pop) / 0.6);
      if (p > 0 && p < 1) { G.rays(ctx, CX + 120, 900, { n: 16, r0: 120 * p, r1: 260 + 200 * p, color: '#FFD22E', lw: 10, alpha: 1 - p }); }
      if (t > ev.pop) C.text(ctx, '¡POP!', CX + 140, 700, { size: 150 * (0.7 + 0.3 * ease.outBack(clamp((t - ev.pop) / 0.3), 2)), color: '#FFD22E', stroke: '#0b1030', strokeW: 14 });
      return ['Cuando tragás o bostezás', 'suena el famoso *pop*'];
    },
    function bebes(ctx, t, a) {
      C.bg(ctx, '#1F3B6A', '#4C7FC0');
      G.rrect(ctx, 140, 560, 800, 700, 60, { fill: '#2E4F86', lw: 6, seed: 100 });            // asiento
      G.rrect(ctx, 210, 620, 660, 330, 40, { fill: '#3E6FB0', lw: 5, seed: 101 });
      G.ellipse(ctx, 820, 700, 70, 90, { fill: '#CFE8FF', lw: 6, seed: 102 });                 // ventanilla
      const cry = Math.abs(Math.sin(t * 6));
      Ch.person(ctx, { x: CX, y: 1080, pose: 'sit', s: 0.62 * pop(t, a, 0.5), eyes: 'closed', mouth: { open: 0.6 + 0.4 * cry, wide: 0.6 }, brows: 'worried', blush: 0.9,
        style: { hairStyle: 'bald', outfit: 'tee', shirt: '#FFD22E', build: 'slim' } });
      G.rrect(ctx, 200, 1100, 680, 60, 30, { fill: '#2E4F86', lw: 6, seed: 103 });
      for (let i = 0; i < 2; i++) G.ellipse(ctx, CX + (i ? 45 : -45), 840 + ((t * 300 + i * 80) % 140), 10, 16, { fill: '#5fb8ff', lw: 2, seed: 110 + i });
      C.pill(ctx, t, ev.bebes + 0.3, 'no saben destaparse', CX, 600, '#FFD22E');
      return ['Por eso lloran tanto', 'los *bebés* en los aviones'];
    },
  ]);
})();
