// El ajolote se regenera (versión puteada)
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = {
    salame: cue(0, 'salame'), pokemon: cue(0, 'pokémon'), real: cue(0, 'real'),
    ajolote: cue(1, 'ajolote'), mexico: cue(1, 'méxico'), superpoder: cue(1, 'superpoder'),
    cortas: cue(2, 'cortás'), crece: cue(2, 'crece'), huesos: cue(2, 'huesos'), concha: cue(2, 'concha'),
    corazon: cue(3, 'corazón'), medula: cue(3, 'médula'), cerebro: cue(3, 'cerebro'), turro: cue(3, 'turro'),
    bebe: cue(4, 'bebé'), nabo: cue(4, 'nabo'),
    peligro: cue(5, 'peligro'), extincion: cue(5, 'extinción'), lago: cue(5, 'lago'),
    nosotros: cue(6, 'nosotros'), pelotudos: cue(6, 'pelotudos'),
  };
  const PINK = '#F7A8C4', PD = '#B0507A';
  const shake = (t, t0, amp = 22, d = 0.45) => { const k = clamp(1 - (t - t0) / d); return t >= t0 && k > 0 ? [Math.sin(t * 70) * amp * k, Math.cos(t * 61) * amp * k] : [0, 0]; };
  function tank(ctx, t, top = '#0B4A5A', bot = '#1E8A8A', dirty = 0) {
    C.bg(ctx, top, bot);
    for (let i = 0; i < 6; i++) { const x = 60 + i * 200, sw = Math.sin(t * 1.4 + i) * 22;
      G.limb(ctx, [[x, 1950], [x + sw, 1600], [x - sw, 1350 - (i % 3) * 80]], { color: dirty ? '#5A6A3A' : '#2FA05A', lw: 26, ink: '#145a30', outline: 3, seed: 600 + i }); }
    G.poly(ctx, [[-60, 1600], [1140, 1580], [1140, 2000], [-60, 2000]], { fill: dirty ? '#6A6050' : '#D8C08A', lw: 6, seed: 610 });
    for (let i = 0; i < 24; i++) { const x = (i * 131.7) % 1080 + Math.sin(t * 2 + i) * 12, y = 1900 - ((t * (70 + (i % 5) * 20) + i * 173) % 2000);
      ctx.save(); ctx.globalAlpha = 0.45; ctx.strokeStyle = '#DDF4FF'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 5 + (i % 4) * 4, 0, 7); ctx.stroke(); ctx.restore(); }
    if (dirty) { ctx.save(); ctx.globalAlpha = 0.35 * dirty; ctx.fillStyle = '#5A4A2A'; ctx.fillRect(-300, -300, 1700, 2600); ctx.restore(); }
  }
  // ajolote de frente. o: { leg: 0..1 (pata derecha de adelante), mood, cape, paci, col, alpha }
  function axo(ctx, x, y, s, t, o = {}) {
    const col = o.col || PINK;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = o.alpha ?? 1;
    if (o.cape) { const w = Math.sin(t * 3) * 20; G.poly(ctx, [[-120, -60], [120, -60], [190 + w, 330], [-190 - w, 330]], { fill: '#E8324A', lw: 6, seed: 620 }); }
    const tw = Math.sin(t * 2.4) * 30;
    G.limb(ctx, [[0, 180], [tw * 0.5, 300], [tw, 420]], { color: col, lw: 70, ink: PD, outline: 5, seed: 621 });
    G.poly(ctx, [[tw - 50, 330], [tw + 50, 330], [tw + 10, 470], [tw - 10, 470]], { fill: '#FBD0E0', lw: 4, seed: 622, alpha: 0.8 });
    const legs = [[-110, 40, -1, 1], [110, 40, 1, o.leg ?? 1], [-100, 200, -1, 1], [100, 200, 1, 1]];
    for (const [lx, ly, sd, g] of legs) { if (g <= 0.02) continue; const ln = 110 * g, wv = Math.sin(t * 3 + lx) * 10;
      G.limb(ctx, [[lx, ly], [lx + sd * ln * 0.7, ly + 30 + wv], [lx + sd * ln, ly + 70 + wv]], { color: col, lw: 30 * Math.max(0.5, g), ink: PD, outline: 4, seed: 623 + lx + ly });
      if (g > 0.9) for (let k = -1; k <= 1; k++) G.line(ctx, [[lx + sd * ln, ly + 70 + wv], [lx + sd * (ln + 22), ly + 80 + wv + k * 14]], { color: PD, lw: 6, seed: 630 + k }); }
    G.ellipse(ctx, 0, 110, 130, 150, { fill: col, lw: 6, seed: 640 });
    G.ellipse(ctx, 0, -60, 190, 130, { fill: col, lw: 6, seed: 641 });
    for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { const bx = sd * 170, by = -120 + k * 55, ang = sd * (-0.6 + k * 0.45) + Math.sin(t * 2.5 + k) * 0.12 * sd;
      const ex = bx + Math.cos(ang) * 120 * sd * sd, ey = by + Math.sin(ang) * 120;
      const p1 = [bx + sd * Math.cos(ang) * 120, by - Math.sin(Math.abs(ang)) * 60 - 40 + k * 30];
      G.limb(ctx, [[bx, by], p1], { color: '#E8508A', lw: 18, ink: '#8A2050', outline: 3, seed: 650 + k + sd });
      for (let j = 1; j <= 4; j++) { const f = j / 4; G.ellipse(ctx, lerp(bx, p1[0], f), lerp(by, p1[1], f) - 16, 9, 16, { fill: '#FF6AA0', lw: 2, seed: 660 + j + k }); } }
    const m = o.mood || 'happy';
    G.ellipse(ctx, -80, -80, 16, m === 'sad' ? 10 : 16, { fill: '#1a0e0a', lw: 0, seed: 670 }); G.ellipse(ctx, 80, -80, 16, m === 'sad' ? 10 : 16, { fill: '#1a0e0a', lw: 0, seed: 671 });
    if (m === 'sad') G.line(ctx, [[-70, 10], [0, -10], [70, 10]], { lw: 7, seed: 672 });
    else if (m === 'angry') { G.line(ctx, [[-120, -120], [-50, -100]], { lw: 8, seed: 673 }); G.line(ctx, [[120, -120], [50, -100]], { lw: 8, seed: 674 }); G.line(ctx, [[-60, 0], [60, 0]], { lw: 7, seed: 675 }); }
    else G.line(ctx, [[-110, -20], [-40, 10], [40, 10], [110, -20]], { lw: 7, seed: 676 });
    if (m !== 'sad') { G.ellipse(ctx, -130, -30, 22, 12, { fill: '#FF7AA8', lw: 0, seed: 677, alpha: 0.7 }); G.ellipse(ctx, 130, -30, 22, 12, { fill: '#FF7AA8', lw: 0, seed: 678, alpha: 0.7 }); }
    if (o.paci) { G.ellipse(ctx, 0, 5, 46, 30, { fill: '#5FB8FF', lw: 5, seed: 679 }); G.ellipse(ctx, 0, 5, 18, 18, { fill: '#FFE07A', lw: 4, seed: 680 }); }
    ctx.restore();
  }
  function heal(ctx, x, y, s, g) { if (g <= 0) return; C.glow(ctx, x, y, 140 * s, '120,255,160', 0.6 * g); ctx.save(); ctx.translate(x, y); ctx.scale(s * g, s * g); G.rrect(ctx, -14, -45, 28, 90, 8, { fill: '#3FE07A', lw: 4, seed: 690 }); G.rrect(ctx, -45, -14, 90, 28, 8, { fill: '#3FE07A', lw: 4, seed: 691 }); ctx.restore(); }

  C.film([
    function hook(ctx, t, a) {
      tank(ctx, t);
      axo(ctx, CX, 1060 + Math.sin(t * 1.6) * 16, 1.45 * (0.6 + 0.4 * pop(t, a, 0.5)), t);
      if (t > ev.pokemon) for (let i = 0; i < 6; i++) { const an = t * 1.5 + i; G.star(ctx, CX + Math.cos(an) * 360, 1000 + Math.sin(an) * 300, 24, { fill: '#FFE07A', rot: t * 2 + i }); }
      C.pill(ctx, t, ev.pokemon, '¿pokémon trucho?', CX, 680, '#FFD22E');
      C.pill(ctx, t, ev.real, 'existe', CX, 1440 - 140, '#3FE07A');
      return ['Mirá a este', '*salame*'];
    },
    function quien(ctx, t, a) {
      tank(ctx, t, '#0A3A6A', '#2A6AAA');
      const cape = t > ev.superpoder - 0.2;
      if (cape) G.rays(ctx, CX, 1050, { n: 18, r0: 300, r1: 1300, color: '#FFD22E', lw: 10, alpha: 0.22, spin: t * 0.3 });
      axo(ctx, CX, 1060 + Math.sin(t * 1.6) * 16 - 40 * out(t, ev.superpoder - 0.2, 0.5), 1.3 * pop(t, a, 0.5), t, { cape });
      C.pill(ctx, t, ev.mexico, 'México', 260, 700, '#19B8B2');
      return ['Es el ajolote', 'y tiene un *superpoder*'];
    },
    function pata(ctx, t, a) {
      tank(ctx, t);
      const cut = t > ev.cortas, grow = out(t, ev.crece, 1.6);
      const leg = cut ? grow : 1;
      const [sx, sy] = shake(t, ev.concha, 26, 0.6);
      ctx.save(); ctx.translate(sx, sy);
      axo(ctx, CX, 1060, 1.35 * pop(t, a, 0.5), t, { leg, mood: cut && grow < 0.3 ? 'sad' : 'happy' });
      if (cut && t < ev.crece + 0.6) { const f = clamp((t - ev.cortas) / 1.2); ctx.save(); ctx.translate(CX + 260 + 120 * f, 1140 + 520 * f * f); ctx.rotate(f * 5);
        G.limb(ctx, [[0, 0], [70, 30], [110, 70]], { color: PINK, lw: 40, ink: PD, outline: 4, seed: 699 }); ctx.restore(); }
      if (cut && t > ev.crece) { for (let i = 0; i < 8; i++) { const an = t * 4 + i; G.star(ctx, CX + 200 * 1.35 + Math.cos(an) * 80, 1150 + Math.sin(an) * 70, 12, { fill: '#7FFFB0', rot: an }); } }
      ctx.restore();
      if (cut && t < ev.crece) C.text(ctx, 'ZAS', CX + 300, 900, { size: 110 * pop(t, ev.cortas, 0.3), color: '#fff', stroke: '#0b1030', strokeW: 12 });
      C.pill(ctx, t, ev.huesos, 'con huesos y todo', CX, 1320, '#3FE07A');
      return ['Le cortás una pata', 'y le *crece* otra'];
    },
    function organos(ctx, t, a) {
      C.bg(ctx, '#0B1E3A', '#1D3F6E');
      axo(ctx, CX, 1080, 1.35 * pop(t, a, 0.5), t, { alpha: 0.45 });
      G.line(ctx, [[CX, 1080 - 60 * 1.35], [CX, 1080 + 250 * 1.35]], { color: '#F2F2F2', lw: 12, seed: 700 }); // médula
      G.heart(ctx, CX - 40, 1180, 1.6, { fill: '#E8324A' });
      G.ellipse(ctx, CX, 1080 - 150, 70, 46, { fill: '#FF9AD5', lw: 5, seed: 701 }); G.line(ctx, [[CX, 1080 - 190], [CX, 1080 - 110]], { lw: 4, seed: 702 });
      heal(ctx, CX + 130, 1180, 0.9, out(t, ev.corazon, 0.4)); heal(ctx, CX + 70, 1350, 0.8, out(t, ev.medula, 0.4)); heal(ctx, CX + 120, 900, 0.9, out(t, ev.cerebro, 0.4));
      C.pill(ctx, t, ev.corazon, 'corazón', 230, 1180, '#ff5a7a'); C.pill(ctx, t, ev.medula, 'médula', 230, 1350, '#F2F2F2'); C.pill(ctx, t, ev.cerebro, 'cerebro', 230, 930, '#FF9AD5');
      return ['Se arregla', 'hasta el *cerebro*'];
    },
    function bebe(ctx, t, a) {
      C.bg(ctx, '#F7C8DA', '#C8A0E0');
      for (let i = 0; i < 10; i++) { const p = ((t * 0.4) + i / 10) % 1; G.heart(ctx, 100 + (i * 113) % 880, 1700 - p * 1100, 0.9, { fill: 'rgba(255,255,255,0.6)' }); }
      axo(ctx, CX, 1080 + Math.sin(t * 2) * 14, 1.3 * pop(t, a, 0.5), t, { paci: t > ev.bebe - 0.4 });
      if (t > ev.nabo) C.text(ctx, 'NABO ETERNO', CX, 760, { size: 96 * pop(t, ev.nabo, 0.35), color: '#FFD22E', stroke: '#0b1030', strokeW: 12 });
      return ['Nunca termina', 'de *crecer*'];
    },
    function peligro(ctx, t, a) {
      tank(ctx, t, '#3A4A3A', '#6A7A5A', out(t, ev.lago - 0.6, 0.8));
      for (let i = 0; i < 6; i++) { const x = 100 + i * 170 + Math.sin(t + i) * 20, y = 760 + (i % 3) * 120 + Math.sin(t * 1.3 + i) * 15;
        if (i % 2) G.rrect(ctx, x - 25, y - 60, 50, 120, 14, { fill: 'rgba(160,220,255,0.7)', lw: 4, seed: 710 + i }); else G.rrect(ctx, x - 35, y - 45, 70, 90, 8, { fill: '#C8C8D0', lw: 4, seed: 716 + i }); }
      axo(ctx, CX, 1180, 1.15 * pop(t, a, 0.5), t, { mood: 'sad', col: '#E8A0B8' });
      if (t > ev.extincion) { ctx.save(); ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 8); C.text(ctx, '⚠', CX, 700, { size: 120, color: '#ff3a3a' }); ctx.restore(); }
      C.pill(ctx, t, ev.extincion, 'en peligro de extinción', CX, 800, '#ff3a3a');
      return ['Está en peligro', 'de *extinción*'];
    },
    function cierre(ctx, t, a) {
      C.bg(ctx, '#2A1A3A', '#6A2A4A');
      if (t > ev.pelotudos - 0.05) G.rays(ctx, CX, 1000, { n: 18, r0: 300, r1: 1300, color: '#FFD22E', lw: 10, alpha: 0.2, spin: t * 0.4 });
      axo(ctx, 300, 1180, 0.9 * pop(t, a, 0.5), t, { mood: 'angry' });
      for (let i = 0; i < 3; i++) C.person(ctx, 620 + i * 160, 1340, 0.75 * pop(t, ev.nosotros - 0.2 + i * 0.1, 0.4), { eyes: 'normal', mouth: 'smirk', style: { shirt: ['#19B8B2', '#FFD22E', '#5FB8FF'][i] } });
      if (t > ev.pelotudos - 0.05) C.text(ctx, '¡QUÉ PEL*TUDOS!', CX, 780, { size: 100 * pop(t, ev.pelotudos, 0.35), color: '#FFD22E', stroke: '#0b1030', strokeW: 14 });
      return ['Él se arregla solo', 'y nosotros lo *rompemos*'];
    },
  ]);
})();
