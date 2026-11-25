// El hipopótamo (versión puteada)
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = {
    peluche: cue(0, 'peluche'), peligrosos: cue(0, 'peligrosos'), puta: cue(0, 'puta'),
    nadar: cue(1, 'nadar'), fondo: cue(1, 'fondo'), respirar: cue(1, 'respirar'),
    cinco: cue(2, 'cinco'), dormido: cue(2, 'dormido'), turro: cue(2, 'turro'),
    rojo: cue(3, 'rojo'), protector: cue(3, 'protector'), antibiotico: cue(3, 'antibiótico'), concha: cue(3, 'concha'),
    autos: cue(4, 'autos'), corre: cue(4, 'corre'), treinta: cue(4, 'treinta'),
    caga: cue(5, 'caga'), ventilador: cue(5, 'ventilador'), cerdo: cue(5, 'cerdo'),
    safari: cue(6, 'safari'), foto: cue(6, 'foto'), corre2: cue(6, 'corré'),
  };
  const HP = '#8A7A9A', HD = '#3A2A4A';
  const shake = (t, t0, amp = 22, d = 0.45) => { const k = clamp(1 - (t - t0) / d); return t >= t0 && k > 0 ? [Math.sin(t * 70) * amp * k, Math.cos(t * 61) * amp * k] : [0, 0]; };
  function river(ctx, t, under = false) {
    C.bg(ctx, under ? '#2A5A4A' : '#F2B060', under ? '#0A2A20' : '#F8E0A0');
    if (!under) { C.glow(ctx, 850, 560, 260, '255,230,120', 0.6); G.ellipse(ctx, 850, 560, 90, 90, { fill: '#FFE07A', lw: 5, seed: 700 }); }
    G.poly(ctx, [[-60, 900], [1140, 880], [1140, 2000], [-60, 2000]], { fill: under ? 'rgba(40,110,90,0.5)' : '#4A8AA0', lw: 6, seed: 701 });
    for (let i = 0; i < 8; i++) { const x = ((i * 160 + t * 40) % 1300) - 100; G.line(ctx, [[x, 940 + (i % 3) * 30], [x + 80, 940 + (i % 3) * 30]], { color: 'rgba(255,255,255,0.5)', lw: 5, seed: 702 + i }); }
    if (under) { for (let i = 0; i < 20; i++) { const x = (i * 131.7) % 1080 + Math.sin(t * 2 + i) * 12, y = 1900 - ((t * (60 + (i % 5) * 20) + i * 173) % 1000); ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = '#DDF4FF'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 5 + (i % 4) * 3, 0, 7); ctx.stroke(); ctx.restore(); }
      G.poly(ctx, [[-60, 1650], [1140, 1630], [1140, 2000], [-60, 2000]], { fill: '#5A4A2A', lw: 6, seed: 712 }); }
  }
  // hipopótamo de costado mirando a la derecha. o: { mouth 0..1, mood, sweat, sleep, run, tail }
  function hippo(ctx, x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const st = o.run ? Math.sin(t * 14) : 0;
    for (const [lx, ph] of [[-140, 1], [-70, 0], [90, 0], [150, 1]]) G.limb(ctx, [[lx, 60], [lx + (ph ? st : -st) * 30, 170]], { color: HP, lw: 60, ink: HD, outline: 5, seed: 720 + lx });
    if (o.tail) { const w = Math.sin(t * 30) * 0.8; ctx.save(); ctx.translate(-230, -20); ctx.rotate(w); G.poly(ctx, [[0, 0], [-60, -18], [-70, 0], [-60, 18]], { fill: HP, lw: 4, seed: 725 }); ctx.restore(); }
    G.ellipse(ctx, 0, 0, 240, 140, { fill: HP, lw: 7, seed: 726 });
    G.ellipse(ctx, -30, 50, 170, 60, { fill: '#B8A8C8', lw: 0, seed: 727, alpha: 0.6 });
    const mo = o.mouth || 0;
    ctx.save(); ctx.translate(230, -40);
    G.ellipse(ctx, 0, 0, 110, 95, { fill: HP, lw: 7, seed: 728 });
    G.ellipse(ctx, -40, -95, 24, 20, { fill: HP, lw: 5, seed: 729 }); G.ellipse(ctx, 20, -100, 22, 18, { fill: HP, lw: 5, seed: 730 });
    ctx.save(); ctx.translate(60, 30); ctx.rotate(-0.9 * mo);
    G.rrect(ctx, -10, -70, 150, 90, 40, { fill: HP, lw: 7, seed: 731 }); if (mo > 0.2) { G.rrect(ctx, 10, 10, 110, 30, 10, { fill: '#C85A7A', lw: 0, seed: 732 }); G.poly(ctx, [[30, 20], [42, -20], [54, 20]], { fill: '#fff', lw: 3, seed: 733 }); G.poly(ctx, [[90, 20], [102, -20], [114, 20]], { fill: '#fff', lw: 3, seed: 734 }); }
    G.ellipse(ctx, 110, -45, 9, 6, { fill: HD, lw: 0, seed: 735 }); G.ellipse(ctx, 130, -40, 9, 6, { fill: HD, lw: 0, seed: 736 });
    ctx.restore();
    if (mo > 0.2) { ctx.save(); ctx.translate(60, 40); ctx.rotate(0.3 * mo); G.rrect(ctx, -10, -10, 150, 60, 30, { fill: HP, lw: 7, seed: 737 }); G.poly(ctx, [[50, -10], [62, -55], [74, -10]], { fill: '#fff', lw: 3, seed: 738 }); ctx.restore(); }
    if (o.sleep) G.line(ctx, [[-10, -40], [10, -32], [30, -40]], { lw: 6, seed: 739 });
    else { G.ellipse(ctx, 10, -40, 14, 14, { fill: '#fff', lw: 3, seed: 740 }); G.ellipse(ctx, 14, -38, 7, 7, { fill: '#111', lw: 0, seed: 741 }); if (o.mood === 'angry') G.line(ctx, [[-14, -64], [30, -52]], { lw: 6, seed: 742 }); }
    ctx.restore();
    if (o.sweat) for (let i = 0; i < 10; i++) { const p = ((t * 0.5) + i / 10) % 1; G.ellipse(ctx, -180 + (i * 47) % 400, -100 + p * 200, 10, 14, { fill: '#E8324A', lw: 2, seed: 750 + i, alpha: 1 - p * 0.6 }); }
    ctx.restore();
  }
  C.film([
    function hook(ctx, t, a) {
      river(ctx, t);
      const danger = t > ev.peligrosos - 0.1;
      const [sx, sy] = shake(t, ev.peligrosos, 24);
      ctx.save(); ctx.translate(sx, sy);
      if (danger) G.rays(ctx, CX, 1000, { n: 18, r0: 360, r1: 1300, color: '#E8324A', lw: 10, alpha: 0.25, spin: t * 0.3 });
      hippo(ctx, CX - 80, 1080, 1.15 * (0.6 + 0.4 * pop(t, a, 0.5)), t, { mouth: danger ? out(t, ev.peligrosos - 0.1, 0.3) : 0, mood: danger ? 'angry' : 'happy' });
      if (!danger) for (let i = 0; i < 3; i++) G.heart(ctx, CX - 80 + Math.cos(t + i * 2) * 300, 760 + Math.sin(t * 1.5 + i) * 40, 1.2, { fill: '#FF8AB0' });
      ctx.restore();
      C.pill(ctx, t, ev.peluche, 'parece un peluche', CX, 700, '#FF8AB0');
      return ['Parece un peluche', 'pero es *peligroso*'];
    },
    function nada(ctx, t, a) {
      river(ctx, t, true);
      const p = clamp((t - a) / 5), up = t > ev.respirar - 0.4 ? out(t, ev.respirar - 0.4, 0.8) : 0;
      hippo(ctx, lerp(200, 640, p), lerp(1520, 1000, up), 0.9 * pop(t, a, 0.5), t, { run: up < 0.5 });
      if (t > ev.nadar && t < ev.fondo + 0.5) { ctx.save(); ctx.translate(820, 760); G.ellipse(ctx, 0, 0, 80, 80, { fill: '#fff', lw: 6, seed: 760 }); C.text(ctx, 'NADAR', 0, 14, { size: 34, color: '#0b1030', shadow: false }); G.line(ctx, [[-60, -60], [60, 60]], { color: '#E8324A', lw: 14, seed: 761 }); ctx.restore(); }
      C.pill(ctx, t, ev.fondo, 'camina por el fondo', CX, 1250, '#7FD4FF');
      return ['El hipopótamo', '*no sabe nadar*'];
    },
    function duerme(ctx, t, a) {
      river(ctx, t, true);
      const cyc = ((t - a) * 0.5) % 1, yy = cyc < 0.7 ? 1450 : lerp(1450, 1000, Math.sin((cyc - 0.7) / 0.3 * Math.PI));
      hippo(ctx, CX - 60, yy, 0.95 * pop(t, a, 0.5), t, { sleep: t > ev.dormido - 0.3 });
      if (t > ev.dormido - 0.3) for (let i = 0; i < 3; i++) { const p = (t * 0.6 + i / 3) % 1; C.text(ctx, 'Z', 760 + p * 80, yy - 200 - p * 160, { size: 40 + 40 * p, color: '#fff', alpha: 1 - p, stroke: '#0b1030', strokeW: 6 }); }
      C.count(ctx, t, ev.cinco - 0.2, 5, 820, 760, { suf: ' MIN', size: 120 });
      return ['Sale a respirar', 'hasta *dormido*'];
    },
    function sudor(ctx, t, a) {
      river(ctx, t);
      const [sx, sy] = shake(t, ev.concha, 26, 0.6);
      ctx.save(); ctx.translate(sx, sy);
      hippo(ctx, CX - 80, 1100, 1.1 * pop(t, a, 0.5), t, { sweat: t > ev.rojo - 0.3 });
      ctx.restore();
      C.pill(ctx, t, ev.protector, 'protector solar', 300, 720, '#FFD22E');
      C.pill(ctx, t, ev.antibiotico, 'antibiótico', 780, 720, '#3FE07A');
      return ['Transpira', 'un líquido *rojo*'];
    },
    function corre(ctx, t, a) {
      C.bg(ctx, '#F2B060', '#F8E0A0');
      G.poly(ctx, [[-60, 1300], [1140, 1280], [1140, 2000], [-60, 2000]], { fill: '#C8A050', lw: 6, seed: 770 });
      const run = t > ev.corre - 0.2, k = out(t, ev.corre - 0.2, 2.5);
      if (!run) { for (let i = 0; i < 2; i++) { G.rrect(ctx, 560 + i * 230, 1100, 200, 90, 30, { fill: ['#5FB8FF', '#E8324A'][i], lw: 6, seed: 771 + i }); G.ellipse(ctx, 600 + i * 230, 1200, 30, 30, { fill: '#222', lw: 4, seed: 773 + i }); G.ellipse(ctx, 720 + i * 230, 1200, 30, 30, { fill: '#222', lw: 4, seed: 775 + i }); }
        C.text(ctx, '=', 470, 1180, { size: 120, color: '#fff', stroke: '#0b1030', strokeW: 10 }); }
      hippo(ctx, run ? lerp(250, 900, k) : 230, 1180, 0.75 * pop(t, a, 0.5), t, { run, mood: 'angry' });
      if (run) { C.person(ctx, lerp(500, 1150, k), 1350, 0.8, { pose: 'run', eyes: 'wide', mouth: 'open', style: { shirt: '#19B8B2' } });
        for (let i = 0; i < 6; i++) G.line(ctx, [[lerp(250, 900, k) - 250 - i * 50, 1120 + i * 15], [lerp(250, 900, k) - 380 - i * 50, 1120 + i * 15]], { color: 'rgba(255,255,255,0.7)', lw: 6, seed: 780 + i }); }
      C.count(ctx, t, ev.treinta - 0.2, 30, CX, 780, { suf: ' KM/H', size: 120 });
      return ['Pesa como *dos autos*', 'y corre más que vos'];
    },
    function caca(ctx, t, a) {
      river(ctx, t);
      const go = t > ev.caga - 0.1;
      hippo(ctx, 560, 1100, 1.0 * pop(t, a, 0.5), t, { tail: go, mood: 'smug' });
      if (go) for (let i = 0; i < 24; i++) { const p = ((t - ev.caga) * 1.4 + i / 24) % 1, an = Math.PI * 0.6 + (i * 0.37) % 1.8; G.ellipse(ctx, 330 + Math.cos(an) * 420 * p, 1080 + Math.sin(an) * 300 * p - 200 * p * (1 - p), 12, 10, { fill: '#7A5A2A', lw: 2, seed: 790 + (i & 7), alpha: 1 - p * 0.5 }); }
      C.pill(ctx, t, ev.ventilador, 'cola ventilador', 300, 760, '#FFD22E');
      if (t > ev.cerdo) C.text(ctx, 'CERDO', 780, 820, { size: 120 * pop(t, ev.cerdo, 0.35), color: '#fff', stroke: '#0b1030', strokeW: 12 });
      return ['Para marcar territorio', 'usa la cola de *ventilador*'];
    },
    function cierre(ctx, t, a) {
      river(ctx, t);
      if (t > ev.corre2 - 0.1) G.rays(ctx, CX, 1000, { n: 18, r0: 300, r1: 1300, color: '#FFD22E', lw: 10, alpha: 0.22, spin: t * 0.4 });
      const mad = t > ev.foto;
      hippo(ctx, 360, 1150, 0.95 * pop(t, a, 0.5), t, { mouth: mad ? out(t, ev.foto, 0.3) : 0, mood: mad ? 'angry' : 'happy' });
      const k = t > ev.corre2 - 0.1 ? out(t, ev.corre2 - 0.1, 1.2) : 0;
      C.person(ctx, lerp(820, 1200, k), 1400, 0.85 * pop(t, ev.safari - 0.2, 0.4), { pose: k > 0 ? 'run' : 'stand', eyes: k > 0 ? 'wide' : 'normal', mouth: k > 0 ? 'open' : 'smile', style: { shirt: '#C8B48A', hat: 'safari' } });
      if (t > ev.foto - 0.2 && k < 0.2) { G.rrect(ctx, 760, 1180, 90, 60, 10, { fill: '#222', lw: 4, seed: 800 }); G.ellipse(ctx, 805, 1210, 18, 18, { fill: '#5FB8FF', lw: 3, seed: 801 }); }
      if (t > ev.corre2 - 0.05) C.text(ctx, '¡CORRÉ, NABO!', CX, 780, { size: 120 * pop(t, ev.corre2, 0.35), color: '#FFD22E', stroke: '#0b1030', strokeW: 16 });
      return ['En un safari', '*no te acerques*'];
    },
  ]);
})();
