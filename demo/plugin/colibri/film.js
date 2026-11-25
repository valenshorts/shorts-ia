// El colibrí vive acelerado (versión puteada)
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = {
    cafes: cue(0, 'cafés'), manija: cue(0, 'manija'), colibri: cue(0, 'colibrí'), puto: cue(0, 'puto'),
    mil: cue(1, 'mil'), setenta: cue(1, 'setenta'), jubilado: cue(1, 'jubilado'),
    cincuenta: cue(2, 'cincuenta'), zumban: cue(2, 'zumban'),
    atras: cue(3, 'atrás'), fiat: cue(3, 'fiat'), boludo: cue(3, 'boludo'),
    comer: cue(4, 'comer'), diez: cue(4, 'diez'), angurriento: cue(4, 'angurriento'),
    noche: cue(5, 'noche'), apaga: cue(5, 'apaga'), temperatura: cue(5, 'temperatura'),
    despierta: cue(6, 'despierta'), arranca: cue(6, 'arranca'), enfermo: cue(6, 'enfermo'),
  };
  const GREEN = '#2FB87A', GD = '#145A3A';
  const shake = (t, t0, amp = 22, d = 0.45) => { const k = clamp(1 - (t - t0) / d); return t >= t0 && k > 0 ? [Math.sin(t * 70) * amp * k, Math.cos(t * 61) * amp * k] : [0, 0]; };
  function garden(ctx, t, top = '#5AB8E8', bot = '#BFE8F8') {
    C.bg(ctx, top, bot);
    for (let i = 0; i < 4; i++) { const x = ((i * 330 + t * 25) % 1500) - 200; G.ellipse(ctx, x, 560 + i * 70, 130, 44, { fill: 'rgba(255,255,255,0.8)', lw: 0, seed: 500 + i }); }
    G.poly(ctx, [[-60, 1500], [1140, 1480], [1140, 2000], [-60, 2000]], { fill: '#5AAF4A', lw: 6, seed: 510 });
  }
  function flower(ctx, x, y, s, t, col = '#E8324A', seed = 1) {
    const sw = Math.sin(t * 1.5 + seed) * 0.08;
    ctx.save(); ctx.translate(x, y); ctx.rotate(sw); ctx.scale(s, s);
    G.limb(ctx, [[0, 0], [10, 220], [0, 440]], { color: '#3A8A3A', lw: 16, ink: '#1a4a1a', outline: 3, seed: 520 + seed });
    for (let k = 0; k < 6; k++) { const an = k / 6 * Math.PI * 2; G.ellipse(ctx, Math.cos(an) * 50, Math.sin(an) * 50, 40, 26, { fill: col, lw: 4, seed: 530 + k + seed }); }
    G.ellipse(ctx, 0, 0, 30, 30, { fill: '#FFD22E', lw: 4, seed: 540 + seed });
    ctx.restore();
  }
  // colibrí mirando a la derecha. o: { sleep, wing (velocidad), blue, dir }
  function bird(ctx, x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.dir || 1), s); ctx.rotate(o.rot ?? -0.15);
    const col = o.sleep ? '#5A8AB0' : GREEN;
    if (!o.sleep) { const sp = o.wing ?? 60;
      for (let g = 0; g < 3; g++) { const ph = Math.sin(t * sp + g * 2.1); ctx.save(); ctx.globalAlpha = 0.28 + 0.12 * g; ctx.translate(-10, -30); ctx.rotate(-1.2 + ph * 0.9);
        G.ellipse(ctx, 0, -95, 34, 100, { fill: '#BFF0FF', lw: 3, seed: 550 + g }); ctx.restore(); } }
    G.poly(ctx, [[-110, 10], [-210, -10], [-200, 50]], { fill: GD, lw: 5, seed: 560 });
    G.ellipse(ctx, 0, 0, 120, 70, { fill: col, lw: 6, seed: 561 });
    G.ellipse(ctx, 20, 30, 80, 34, { fill: '#F2F2E0', lw: 0, seed: 562, alpha: 0.8 });
    G.ellipse(ctx, 110, -40, 62, 56, { fill: col, lw: 6, seed: 563 });
    G.ellipse(ctx, 100, -5, 40, 22, { fill: '#E8324A', lw: 4, seed: 564 }); // garganta roja
    G.line(ctx, [[165, -40], [330, -25]], { color: '#2a2a2a', lw: 9, seed: 565 });
    if (o.sleep) G.line(ctx, [[115, -55], [130, -48], [145, -55]], { lw: 5, seed: 566 });
    else { G.ellipse(ctx, 130, -52, 14, 14, { fill: '#fff', lw: 3, seed: 567 }); G.ellipse(ctx, 134, -50, 7, 7, { fill: '#111', lw: 0, seed: 568 }); }
    if (o.sleep) { G.ellipse(ctx, -20, -30, 90, 40, { fill: '#3A6A90', lw: 5, seed: 569 }); }
    ctx.restore();
  }
  function bigHeart(ctx, x, y, s, f, t, col = '#E8324A') { const b = Math.max(0, Math.sin(t * Math.PI * 2 * f)) ** 4; C.glow(ctx, x, y, 200 * s, '255,80,100', 0.3 + 0.3 * b); G.heart(ctx, x, y, s * (1 + 0.18 * b), { fill: col }); }
  function car(ctx, x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    G.rrect(ctx, -170, -70, 340, 110, 50, { fill: '#5FB8FF', lw: 6, seed: 580 }); G.rrect(ctx, -100, -150, 200, 100, 50, { fill: '#5FB8FF', lw: 6, seed: 581 }); G.rrect(ctx, -75, -130, 150, 60, 20, { fill: '#DDF4FF', lw: 4, seed: 582 });
    for (const wx of [-100, 100]) { G.ellipse(ctx, wx, 45, 42, 42, { fill: '#222', lw: 5, seed: 583 + wx }); G.line(ctx, [[wx, 45], [wx + Math.cos(-t * 8) * 30, 45 + Math.sin(-t * 8) * 30]], { color: '#888', lw: 5, seed: 585 }); }
    ctx.restore(); }

  C.film([
    function hook(ctx, t, a) {
      C.bg(ctx, '#5A3A2A', '#B8845A');
      const bird_on = t > ev.colibri - 0.3;
      const [sx, sy] = shake(t, ev.manija, 10, 3);
      ctx.save(); ctx.translate(sx * (bird_on ? 0 : 1), sy * (bird_on ? 0 : 1));
      C.person(ctx, bird_on ? 260 : CX, 1330, (bird_on ? 0.8 : 1.1) * (0.6 + 0.4 * pop(t, a, 0.5)), { eyes: 'wide', mouth: 'grin', brows: 'up', style: { shirt: '#19B8B2' } });
      for (let i = 0; i < 3; i++) { const p = pop(t, ev.cafes - 0.3 + i * 0.12, 0.3); if (p <= 0) continue; const cx = (bird_on ? 120 : 160) + i * 110;
        G.rrect(ctx, cx - 36, 1200 - 80 * p, 72, 80 * p, 10, { fill: '#F4F0E8', lw: 4, seed: 590 + i }); for (let k = 0; k < 2; k++) G.line(ctx, [[cx - 10 + k * 20, 1100 - Math.sin(t * 3 + k) * 10], [cx - 10 + k * 20, 1060 - Math.sin(t * 3 + k) * 10]], { color: 'rgba(255,255,255,0.6)', lw: 5, seed: 595 + k }); }
      ctx.restore();
      if (bird_on) { const k = out(t, ev.colibri - 0.3, 0.5); bird(ctx, lerp(1300, 740, k) + Math.sin(t * 9) * 12, 980 + Math.cos(t * 7) * 18, 1.25, t); }
      C.pill(ctx, t, ev.manija, 're manija', 260, 820, '#FFD22E');
      return ['Tres cafés', 'el colibrí vive *así*'];
    },
    function corazon(ctx, t, a) {
      C.bg(ctx, '#3A0A1A', '#8A1A3A');
      const old = t > ev.setenta - 0.2, k = out(t, ev.setenta - 0.2, 0.5);
      bigHeart(ctx, lerp(CX, 320, k), 1000, lerp(9, 5.5, k) * pop(t, a, 0.4), 17, t);
      C.count(ctx, t, ev.mil - 0.3, 1000, lerp(CX, 320, k), 1320, { suf: ' LPM', size: lerp(110, 70, k) });
      if (old) { C.person(ctx, 780, 1340, 0.95 * pop(t, ev.setenta - 0.2, 0.45), { eyes: 'sleep', mouth: 'smile', style: { shirt: '#9A9AA8', hairStyle: 'bald', glasses: 'round' } });
        bigHeart(ctx, 780, 1170, 2.2, 1.2, t); C.text(ctx, '70 LPM', 780, 900, { size: 70, color: '#fff', stroke: '#0b1030', strokeW: 8 }); }
      C.pill(ctx, t, ev.jubilado, 'tranqui, como un jubilado', 780, 760, '#9A9AA8');
      return ['El corazón le late', 'más de *mil* por minuto'];
    },
    function alas(ctx, t, a) {
      garden(ctx, t);
      flower(ctx, 760, 1120, 1.2, t, '#E8324A', 1);
      bird(ctx, 400 + Math.sin(t * 8) * 10, 980 + Math.cos(t * 6) * 12, 1.6 * pop(t, a, 0.5), t, { wing: 80 });
      if (t > ev.zumban) for (let i = 0; i < 3; i++) C.text(ctx, 'z', 260 - i * 50, 800 - i * 40 + Math.sin(t * 20 + i) * 8, { size: 70 - i * 12, color: '#fff', stroke: '#0b1030', strokeW: 8 });
      C.count(ctx, t, ev.cincuenta - 0.2, 50, 740, 760, { suf: ' x SEG', size: 100 });
      return ['Mueve las alas', '*50* veces por segundo'];
    },
    function atras(ctx, t, a) {
      garden(ctx, t);
      flower(ctx, 820, 1100, 1.1, t, '#FF8A3A', 2);
      const back = clamp((t - ev.atras + 0.3) / 2.0);
      bird(ctx, lerp(620, 260, ease.inOutQuad(back)), 960 + Math.sin(t * 7) * 10, 1.15 * pop(t, a, 0.5), t);
      if (t > ev.atras) { G.ellipse(ctx, 160, 760, 60, 60, { fill: '#fff', lw: 6, seed: 600 }); C.text(ctx, 'R', 160, 785, { size: 70, color: '#E8324A', shadow: false }); }
      if (t > ev.fiat - 0.3) car(ctx, lerp(1150, 780, out(t, ev.fiat - 0.3, 1.2)), 1330, 0.8, t);
      C.pill(ctx, t, ev.atras, 'marcha atrás', CX, 1300 - 100, '#FFD22E');
      return ['Es el único pájaro', 'que vuela *para atrás*'];
    },
    function come(ctx, t, a) {
      garden(ctx, t, '#F2A0C8', '#FFE0EC');
      const xs = [180, 450, 720, 960];
      xs.forEach((x, i) => flower(ctx, x, 1150 + (i % 2) * 60, 0.85, t, ['#E8324A', '#9A5AE8', '#FF8A3A', '#E8508A'][i], 3 + i));
      const seg = (t * 1.6) % xs.length, i0 = Math.floor(seg), f = ease.inOutQuad(seg - i0), x0 = xs[i0], x1 = xs[(i0 + 1) % xs.length];
      bird(ctx, lerp(x0, x1, f) - 150, 1090 + (i0 % 2) * 60 - Math.sin(f * Math.PI) * 140, 0.75 * pop(t, a, 0.4), t);
      const pc = pop(t, ev.diez - 0.3, 0.4);
      if (pc > 0) { ctx.save(); ctx.translate(820, 760); ctx.scale(pc, pc); G.ellipse(ctx, 0, 0, 110, 110, { fill: '#fff', lw: 7, seed: 610 });
        const p = (t - ev.diez) * 0.5; G.line(ctx, [[0, 0], [Math.cos(p * 6 - 1.57) * 85, Math.sin(p * 6 - 1.57) * 85]], { lw: 9, seed: 611 }); ctx.restore(); C.text(ctx, '10 MIN', 820, 940, { size: 64 * pc, color: '#FFD22E', stroke: '#0b1030', strokeW: 10 }); }
      C.pill(ctx, t, ev.angurriento, 'angurriento', 300, 760, '#ff5a3a');
      return ['Tiene que comer', 'cada *10 minutos*'];
    },
    function noche(ctx, t, a) {
      C.space(ctx, t, '#05081f', '#1A2052');
      G.ellipse(ctx, 840, 560, 80, 80, { fill: '#F4F0D8', lw: 5, seed: 620 });
      G.limb(ctx, [[-60, 1000], [500, 990], [1140, 1010]], { color: '#5A3A2A', lw: 40, ink: '#2a1a0a', outline: 5, seed: 621 });
      const off = t > ev.apaga - 0.2;
      ctx.save(); ctx.translate(480, 1090); ctx.rotate(Math.PI); bird(ctx, 0, 0, 0.9, t, { sleep: off, rot: 0.2 }); ctx.restore(); // cuelga cabeza abajo
      if (off) for (let i = 0; i < 3; i++) { const p = (t * 0.6 + i / 3) % 1; C.text(ctx, 'Z', 560 + p * 80, 980 - p * 180, { size: 40 + 40 * p, color: '#fff', alpha: 1 - p, stroke: '#0b1030', strokeW: 6 }); }
      const pt = pop(t, ev.temperatura - 0.3, 0.4);
      if (pt > 0) { ctx.save(); ctx.translate(850, 1250); ctx.scale(pt, pt); G.rrect(ctx, -26, -200, 52, 300, 26, { fill: '#fff', lw: 6, seed: 622 }); G.ellipse(ctx, 0, 110, 50, 50, { fill: '#5FB8FF', lw: 6, seed: 623 });
        const lv = lerp(160, 30, out(t, ev.temperatura, 1.2)); G.rrect(ctx, -12, 100 - lv, 24, lv, 12, { fill: '#5FB8FF', lw: 0, seed: 624 }); ctx.restore(); }
      C.pill(ctx, t, ev.apaga, 'se apaga', 300, 1250, '#5FB8FF');
      return ['A la noche', 'se *apaga*'];
    },
    function cierre(ctx, t, a) {
      const up = out(t, a, 1.5);
      C.bg(ctx, '#FF9A5A', '#FFE0A0'); C.glow(ctx, CX, 1500 - 300 * up, 500, '255,230,140', 0.8); G.ellipse(ctx, CX, 1500 - 300 * up, 120, 120, { fill: '#FFD22E', lw: 6, seed: 630 });
      G.poly(ctx, [[-60, 1500], [1140, 1480], [1140, 2000], [-60, 2000]], { fill: '#5AAF4A', lw: 6, seed: 631 });
      const go = t > ev.arranca - 0.2, k = out(t, ev.arranca - 0.2, 0.9);
      if (go) for (let i = 0; i < 6; i++) G.line(ctx, [[lerp(300, 900, k) - 120 - i * 60, 960 + i * 18 - 50], [lerp(300, 900, k) - 260 - i * 60, 960 + i * 18 - 50]], { color: 'rgba(255,255,255,0.7)', lw: 6, seed: 640 + i });
      bird(ctx, go ? lerp(300, 900, k) : 300, 980 + Math.sin(t * 8) * 12, 1.2 * pop(t, a, 0.5), t, { wing: go ? 90 : 50 });
      if (t > ev.enfermo - 0.05) C.text(ctx, '¡ENFERMO!', CX, 780, { size: 130 * pop(t, ev.enfermo, 0.35), color: '#FFD22E', stroke: '#0b1030', strokeW: 16 });
      return ['Al otro día', 'arranca *a mil*'];
    },
  ]);
})();
