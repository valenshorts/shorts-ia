// La miel (versión puteada). Zona útil: y 560-1340.
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, pop, out, cue } = C;
  const ev = {
    pudre: cue(0, 'pudre'), nunca: cue(0, 'nunca'),
    tumbas: cue(1, 'tumbas'), mil: cue(1, 'mil'), comible: cue(1, 'comible'), heladera: cue(1, 'heladera'),
    agua: cue(2, 'agua'), acida: cue(2, 'ácida'), mueren: cue(2, 'mueren'), fueron: cue(2, 'fueron'),
    enzima: cue(3, 'enzima'), oxigenada: cue(3, 'oxigenada'), desinfectante: cue(3, 'desinfectante'),
    kilo: cue(4, 'kilo'), millones: cue(4, 'millones'), super: cue(4, 'súper'),
    dura: cue(5, 'dura'), cristalizo: cue(5, 'cristalizó'), calentas: cue(5, 'calentás'), tires: cue(5, 'tires'),
  };
  const HON = '#F2A81E', HOND = '#C87A10';
  const BIG = (ctx, t, t0, s, x, y, color = '#FFD22E', size = 100) => { if (t > t0) C.text(ctx, s, x, y, { size: size * pop(t, t0, 0.35), color, stroke: '#0b1030', strokeW: 14 }); };
  function kitchen(ctx) { C.bg(ctx, '#FFE9C0', '#FFF6E2'); G.poly(ctx, [[-60, 1260], [1140, 1250], [1140, 1360], [-60, 1360]], { fill: '#C89A6A', lw: 6, seed: 500 }); }
  function jar(ctx, x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    G.rrect(ctx, -120, -230, 240, 260, 50, { fill: 'rgba(255,255,255,0.55)', lw: 7, seed: 510 });
    const lvl = o.lvl ?? 0.8; G.rrect(ctx, -110, -220 + 240 * (1 - lvl), 220, 240 * lvl, 44, { fill: o.cryst ? '#F6D27A' : HON, lw: 0, seed: 511 });
    if (o.cryst) for (let i = 0; i < 18; i++) G.ellipse(ctx, -90 + (i * 47) % 180, -150 + (i * 31) % 160, 6, 6, { fill: '#FFF4D0', lw: 0, seed: 512 + (i % 5) });
    G.rrect(ctx, -100, -280, 200, 60, 14, { fill: '#E8324A', lw: 6, seed: 518 });
    G.rrect(ctx, -70, -150, 140, 70, 10, { fill: '#FFF4D8', lw: 4, seed: 519 }); C.text(ctx, 'MIEL', 0, -100, { size: 40, color: HOND, shadow: false });
    ctx.restore();
  }
  function bee(ctx, x, y, s, t, seed = 520) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const f = Math.sin(t * 40) * 0.4;
    ctx.save(); ctx.rotate(-0.5 + f); G.ellipse(ctx, -6, -30, 18, 28, { fill: 'rgba(220,240,255,0.85)', lw: 3, seed }); ctx.restore();
    ctx.save(); ctx.rotate(0.5 - f); G.ellipse(ctx, 6, -30, 18, 28, { fill: 'rgba(220,240,255,0.85)', lw: 3, seed: seed + 1 }); ctx.restore();
    G.ellipse(ctx, 0, 0, 34, 24, { fill: '#FFD22E', lw: 4, seed: seed + 2 });
    G.line(ctx, [[-8, -22], [-8, 22]], { color: '#222', lw: 8, seed: seed + 3 }); G.line(ctx, [[10, -20], [10, 20]], { color: '#222', lw: 8, seed: seed + 4 });
    G.ellipse(ctx, 34, -4, 13, 13, { fill: '#222', lw: 0, seed: seed + 5 });
    ctx.restore();
  }
  C.film([
    function hook(ctx, t, a) {
      kitchen(ctx);
      if (t > ev.nunca - 0.1) G.rays(ctx, CX, 1000, { n: 18, r0: 280, r1: 1200, color: '#FFD22E', lw: 10, alpha: 0.22, spin: t * 0.3 });
      jar(ctx, CX, 1240, 1.4 * pop(t, a, 0.5), t);
      for (let i = 0; i < 3; i++) bee(ctx, CX + Math.cos(t * 1.4 + i * 2.1) * 330, 820 + Math.sin(t * 2 + i) * 90, 1.1, t, 530 + i * 7);
      BIG(ctx, t, ev.nunca, 'NUNCA', CX, 690, '#fff', 120);
      return ['La miel', '*no se pudre*'];
    },
    function tumba(ctx, t, a) {
      C.bg(ctx, '#4A3420', '#1E140A');
      G.rrect(ctx, 140, 640, 800, 600, 30, { fill: '#7A5A3A', lw: 7, seed: 540 });
      for (let i = 0; i < 4; i++) G.line(ctx, [[180, 700 + i * 140], [900, 700 + i * 140]], { color: 'rgba(0,0,0,0.25)', lw: 5, seed: 541 + i });
      C.glow(ctx, CX, 1050, 360, '255,200,90', 0.35);
      jar(ctx, CX, 1220, 1.0 * pop(t, ev.tumbas - 0.2, 0.5), t, { lvl: 0.7 });
      C.count(ctx, t, ev.mil - 0.3, 3000, CX, 760, { suf: ' AÑOS', size: 100 });
      if (t > ev.comible) C.pill(ctx, t, ev.comible, 'y seguía comible', CX, 870, '#3FE07A');
      return ['Miel de tumbas egipcias', 'de *3.000 años*'];
    },
    function bacterias(ctx, t, a) {
      kitchen(ctx);
      jar(ctx, CX, 1240, 1.6, t);
      for (let i = 0; i < 6; i++) { const t0 = ev.mueren + i * 0.12, dead = t > t0;
        const x = 250 + (i % 3) * 290, y = 660 + Math.floor(i / 3) * 170;
        ctx.save(); ctx.translate(x, y + (dead ? out(t, t0, 0.6) * 80 : Math.sin(t * 3 + i) * 10)); ctx.rotate(dead ? 1.2 : 0);
        G.ellipse(ctx, 0, 0, 46, 30, { fill: dead ? '#8A9A7A' : '#6ACB5A', lw: 5, seed: 550 + i });
        for (let k = 0; k < 5; k++) G.line(ctx, [[-40 + k * 20, 26], [-46 + k * 20, 46]], { lw: 4, seed: 556 + k });
        if (dead) { G.line(ctx, [[-20, -12], [-6, 2]], { lw: 5, seed: 560 }); G.line(ctx, [[-6, -12], [-20, 2]], { lw: 5, seed: 561 }); G.line(ctx, [[8, -12], [22, 2]], { lw: 5, seed: 562 }); G.line(ctx, [[22, -12], [8, 2]], { lw: 5, seed: 563 }); }
        ctx.restore(); }
      C.pill(ctx, t, ev.agua, 'casi sin agua', 270, 1000, '#7FD4FF');
      C.pill(ctx, t, ev.acida, 'muy ácida', 810, 1000, '#FFD22E');
      return ['Las bacterias', '*se mueren* adentro'];
    },
    function enzima(ctx, t, a) {
      kitchen(ctx);
      jar(ctx, 300, 1240, 1.1, t);
      bee(ctx, lerp(900, 380, out(t, ev.enzima - 0.4, 1)), 780, 1.8, t, 570);
      if (t > ev.oxigenada - 0.2) { ctx.save(); ctx.translate(780, 1080); const s = pop(t, ev.oxigenada - 0.2, 0.4); ctx.scale(s, s);
        G.rrect(ctx, -70, -150, 140, 220, 26, { fill: '#5A8ADA', lw: 6, seed: 580 }); G.rrect(ctx, -40, -190, 80, 50, 10, { fill: '#fff', lw: 5, seed: 581 });
        C.text(ctx, 'H₂O₂', 0, -30, { size: 46, color: '#fff', shadow: false }); ctx.restore(); }
      if (t > ev.desinfectante) for (let i = 0; i < 8; i++) { const p = ((t - ev.desinfectante) * 0.8 + i / 8) % 1; G.star(ctx, 600 + (i * 53) % 360, 1150 - p * 400, 14, { fill: '#fff', seed: 582 + i }); }
      C.pill(ctx, t, ev.desinfectante, 'desinfectante natural', 780, 680, '#3FE07A');
      return ['Las abejas le meten', 'un *desinfectante*'];
    },
    function flores(ctx, t, a) {
      C.bg(ctx, '#BFE6FF', '#E8F8D8');
      G.poly(ctx, [[-60, 1180], [1140, 1160], [1140, 1360], [-60, 1360]], { fill: '#7CC65A', lw: 6, seed: 590 });
      const n = t > ev.millones - 0.3 ? Math.round(18 * out(t, ev.millones - 0.3, 1.2)) : 4;
      for (let i = 0; i < n; i++) { const x = 70 + (i % 9) * 118, y = 1220 + Math.floor(i / 9) * 70;
        G.line(ctx, [[x, y], [x, y - 70]], { color: '#3F8A2A', lw: 6, seed: 600 + (i % 5) });
        for (let k = 0; k < 5; k++) G.ellipse(ctx, x + Math.cos(k * 1.256) * 20, y - 80 + Math.sin(k * 1.256) * 20, 14, 14, { fill: ['#FF8AB0', '#FFD22E', '#B07AFF'][i % 3], lw: 3, seed: 606 + k });
        G.ellipse(ctx, x, y - 80, 10, 10, { fill: '#F2A81E', lw: 2, seed: 612 }); }
      for (let i = 0; i < 4; i++) bee(ctx, ((t * 150 + i * 280) % 1300) - 100, 900 + Math.sin(t * 3 + i) * 70, 1, t, 620 + i * 7);
      C.count(ctx, t, ev.millones - 0.2, 2000000, CX, 700, { suf: '', size: 100 });
      C.pill(ctx, t, ev.millones, 'flores por medio kilo', CX, 800, '#FF8AB0');
      return ['Por medio kilo', '*2 millones de flores*'];
    },
    function cierre(ctx, t, a) {
      kitchen(ctx);
      const cr = t > ev.cristalizo - 0.2, heat = t > ev.calentas;
      if (heat) { G.rrect(ctx, CX - 260, 1250, 520, 40, 12, { fill: '#555', lw: 5, seed: 630 }); for (let i = 0; i < 5; i++) G.poly(ctx, [[CX - 160 + i * 80, 1250], [CX - 140 + i * 80, 1210 - Math.abs(Math.sin(t * 9 + i)) * 30], [CX - 120 + i * 80, 1250]], { fill: '#FF7A2A', lw: 0, seed: 631 + i }); }
      jar(ctx, CX, heat ? 1200 : 1240, 1.15 * pop(t, a, 0.5), t, { cryst: cr && !(heat && t > ev.calentas + 1.2) });
      C.pill(ctx, t, ev.cristalizo, 'no está podrida: cristalizó', CX, 640, '#FFD22E');
      BIG(ctx, t, ev.tires, '¡NO LA TIRES!', CX, 790, '#fff', 96);
      return ['¿Se puso dura?', '*Cristalizó*'];
    },
  ]);
})();
