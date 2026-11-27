// Cleopatra (versión puteada). Zona útil: y 560-1340.
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, pop, out, cue } = C;
  const ev = {
    cleopatra: cue(0, 'cleopatra'), vos: cue(0, 'vos'), piramides: cue(0, 'pirámides'),
    cuatro: cue(1, 'cuatro'), nacio: cue(1, 'nació'), banda: cue(1, 'banda'),
    cien: cue(2, 'cien'), viejas: cue(2, 'viejas'),
    turistica: cue(3, 'turística'), mirando: cue(3, 'mirando'),
    trescientos: cue(4, 'trescientos'), egipcio: cue(4, 'egipcio'), vagos: cue(4, 'vagos'),
    viejisimo: cue(5, 'viejísimo'), esto: cue(5, 'esto'),
  };
  const BIG = (ctx, t, t0, s, x, y, color = '#FFD22E', size = 100) => { if (t > t0) C.text(ctx, s, x, y, { size: size * pop(t, t0, 0.35), color, stroke: '#0b1030', strokeW: 14 }); };
  function desert(ctx) {
    C.bg(ctx, '#F2B060', '#FCE6B0');
    C.glow(ctx, 860, 700, 220, '255,230,140', 0.6); G.ellipse(ctx, 860, 700, 70, 70, { fill: '#FFE07A', lw: 5, seed: 400 });
    G.poly(ctx, [[-60, 1250], [1140, 1230], [1140, 1360], [-60, 1360]], { fill: '#E0B060', lw: 6, seed: 401 });
  }
  function pyramid(ctx, x, y, s, seed = 410) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    G.poly(ctx, [[-200, 0], [0, -230], [200, 0]], { fill: '#E8C070', lw: 7, seed });
    G.poly(ctx, [[0, -230], [200, 0], [60, 0]], { fill: '#C89A4A', lw: 0, seed: seed + 1, alpha: 0.6 });
    for (let i = 1; i < 5; i++) G.line(ctx, [[-200 + i * 40, -i * 46], [200 - i * 40, -i * 46]], { color: 'rgba(0,0,0,0.15)', lw: 4, seed: seed + 2 + i });
    ctx.restore();
  }
  function cleo(ctx, x, y, s, t, o = {}) {
    C.person(ctx, x, y, s, Object.assign({ pose: 'stand', eyes: 'happy', mouth: 'smile', style: { shirt: '#F4F0E0', hairStyle: 'long', hair: '#111' } }, o));
    G.poly(ctx, [[x - 46 * s, y - 470 * s], [x - 30 * s, y - 530 * s], [x, y - 495 * s], [x + 30 * s, y - 530 * s], [x + 46 * s, y - 470 * s]], { fill: '#FFD22E', lw: 4, seed: 420 });
  }
  function phone(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); G.rrect(ctx, -60, -110, 120, 220, 20, { fill: '#222', lw: 6, seed: 430 }); G.rrect(ctx, -48, -94, 96, 188, 12, { fill: '#5FB8FF', lw: 0, seed: 431 }); ctx.restore(); }
  function timeline(ctx, t, k1, k2) {
    G.line(ctx, [[110, 1100], [970, 1100]], { color: '#0b1030', lw: 10, seed: 440 });
    const pts = [[150, '2560 a.C.'], [640, '69 a.C.'], [930, 'HOY']];
    pts.forEach(([x, l], i) => { G.ellipse(ctx, x, 1100, 20, 20, { fill: ['#E8C070', '#FFD22E', '#5FB8FF'][i], lw: 5, seed: 441 + i }); C.text(ctx, l, x, 1170, { size: 34, color: '#0b1030', shadow: false }); });
    if (k1 > 0) { G.line(ctx, [[150, 1050], [lerp(150, 640, k1), 1050]], { color: '#E8324A', lw: 12, seed: 446 }); }
    if (k2 > 0) { G.line(ctx, [[640, 1050], [lerp(640, 930, k2), 1050]], { color: '#19B8B2', lw: 12, seed: 447 }); }
  }
  C.film([
    function hook(ctx, t, a) {
      desert(ctx);
      pyramid(ctx, 230, 1240, 1.1 * pop(t, ev.piramides - 0.3, 0.5));
      cleo(ctx, 600, 1260, 0.9 * pop(t, ev.cleopatra - 0.3, 0.5), t);
      if (t > ev.vos - 0.2) phone(ctx, 900, 1100, pop(t, ev.vos - 0.2, 0.4));
      if (t > ev.vos) { G.line(ctx, [[640, 760], [880, 760]], { color: '#19B8B2', lw: 10, seed: 450 }); C.pill(ctx, t, ev.vos, 'más cerca', 760, 700, '#19B8B2'); }
      return ['Cleopatra vivió más cerca', 'de vos que de *las pirámides*'];
    },
    function piramide(ctx, t, a) {
      desert(ctx);
      timeline(ctx, t, out(t, ev.nacio - 0.3, 1), 0);
      pyramid(ctx, 150, 980, 0.55);
      cleo(ctx, 640, 990, 0.5 * pop(t, ev.nacio - 0.3, 0.4), t);
      C.count(ctx, t, ev.cuatro - 0.2, 4500, 300, 690, { suf: ' AÑOS', size: 80, color: '#E8C070' });
      C.count(ctx, t, ev.nacio, 2500, 400, 1270, { pre: '+', suf: ' AÑOS', size: 72, color: '#E8324A' });
      return ['La pirámide tiene', '*4.500 años*'];
    },
    function hoy(ctx, t, a) {
      desert(ctx);
      timeline(ctx, t, 1, out(t, ev.cien - 0.3, 1));
      pyramid(ctx, 150, 980, 0.55); cleo(ctx, 640, 990, 0.5, t); phone(ctx, 930, 950, 0.6);
      C.count(ctx, t, ev.cien - 0.2, 2100, 780, 1270, { suf: ' AÑOS', size: 72, color: '#19B8B2' });
      if (t > ev.viejas) C.pill(ctx, t, ev.viejas, 'para ella ya eran viejas', CX, 700, '#E8C070');
      return ['De Cleopatra a hoy', '*2.100 años*'];
    },
    function turistas(ctx, t, a) {
      desert(ctx);
      pyramid(ctx, CX, 1150, 1.5 * pop(t, a, 0.5));
      for (let i = 0; i < 3; i++) C.person(ctx, 200 + i * 340, 1320, 0.7 * pop(t, ev.turistica - 0.3 + i * 0.15, 0.4), { pose: 'stand', eyes: 'focus', mouth: 'o', style: { shirt: ['#F4F0E0', '#C83A3A', '#3E6FB0'][i] } });
      C.pill(ctx, t, ev.turistica, 'atracción turística', CX, 680, '#FFD22E');
      if (t > ev.mirando) BIG(ctx, t, ev.mirando, 'PIEDRAS', CX, 800, '#fff', 90);
      return ['Ya era una', '*atracción turística*'];
    },
    function idioma(ctx, t, a) {
      desert(ctx);
      cleo(ctx, 330, 1280, 1.0 * pop(t, a, 0.5), t, { mouth: t > ev.egipcio ? 'open' : 'smile' });
      C.count(ctx, t, ev.trescientos - 0.2, 300, 760, 760, { suf: ' AÑOS', size: 96 });
      if (t > ev.egipcio - 0.2) { ctx.save(); ctx.translate(760, 1000); const s = pop(t, ev.egipcio - 0.2, 0.4); ctx.scale(s, s);
        G.rrect(ctx, -200, -100, 400, 200, 40, { fill: '#fff', lw: 7, seed: 460 }); G.poly(ctx, [[-170, 80], [-260, 160], [-110, 90]], { fill: '#fff', lw: 6, seed: 461 });
        G.ellipse(ctx, -110, 0, 50, 26, { fill: '#fff', lw: 6, seed: 462 }); G.ellipse(ctx, -110, 0, 14, 14, { fill: '#0b1030', lw: 0, seed: 463 });
        G.poly(ctx, [[-20, 30], [20, -40], [40, -20], [30, 30]], { fill: '#0b1030', lw: 0, seed: 464 });
        G.line(ctx, [[80, -30], [100, -10], [120, -30], [140, -10]], { color: '#0b1030', lw: 8, seed: 465 }); G.line(ctx, [[80, 20], [100, 40], [120, 20], [140, 40]], { color: '#0b1030', lw: 8, seed: 466 }); ctx.restore(); }
      if (t > ev.vagos) C.pill(ctx, t, ev.vagos, 'la primera en aprenderlo', 760, 1180, '#19B8B2');
      return ['La primera de su familia', 'en hablar *egipcio*'];
    },
    function cierre(ctx, t, a) {
      desert(ctx);
      if (t > ev.esto - 0.1) G.rays(ctx, CX, 1000, { n: 18, r0: 300, r1: 1300, color: '#FFD22E', lw: 10, alpha: 0.2, spin: t * 0.4 });
      pyramid(ctx, 250, 1240, 0.8); cleo(ctx, 560, 1260, 0.75, t, { eyes: 'happy', mouth: 'grin' }); phone(ctx, 850, 1150, 0.7);
      BIG(ctx, t, ev.viejisimo, '¿VIEJÍSIMO?', CX, 700, '#fff', 100);
      return ['¿Algo es viejísimo?', '*Acordate de esto*'];
    },
  ]);
})();
