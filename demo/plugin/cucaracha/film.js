// La cucaracha (versión puteada): vive una semana sin cabeza y vio pasar a los dinosaurios
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = {
    indes: cue(0, 'indestructible'), boludo: cue(0, 'boludo'),
    cortas: cue(1, 'cortás'), turra: cue(1, 'turra'), semana: cue(1, 'semana'),
    sed: cue(2, 'sed'), pelotuda: cue(2, 'pelotuda'), boca: cue(2, 'boca'), agua: cue(2, 'agua'),
    agujeritos: cue(3, 'agujeritos'), cuerpo: cue(3, 'cuerpo'), huevo: cue(3, 'huevo'),
    cuarenta: cue(4, 'cuarenta'), concha: cue(4, 'concha'),
    trescientos: cue(5, 'trescientos'), dinos: cue(5, 'dinosaurios'),
    murieron: cue(6, 'murieron'), sigue: cue(6, 'sigue'), cocina: cue(6, 'cocina'),
  };
  const BROWN = '#7A3E1E', BDARK = '#3A1A0A';
  const shake = (t, t0, amp = 22, d = 0.45) => { const k = clamp(1 - (t - t0) / d); return t >= t0 && k > 0 ? [Math.sin(t * 70) * amp * k, Math.cos(t * 61) * amp * k] : [0, 0]; };

  // piso de cocina con baldosas y polvo que flota (nunca queda quieto)
  function kitchen(ctx, t, night = false) {
    C.bg(ctx, night ? '#141A3A' : '#F3E2C2', night ? '#2A2F5A' : '#E2C79A');
    for (let i = 0; i < 4; i++) G.rrect(ctx, 60 + i * 250, 520, 210, 300, 16, { fill: night ? '#2E3566' : '#FFF4DE', lw: 5, seed: 400 + i });
    G.poly(ctx, [[-60, 1200], [1140, 1200], [1140, 2000], [-60, 2000]], { fill: night ? '#3A3F70' : '#C9A26E', lw: 6, seed: 410 });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const x = -40 + c * 200 + (r % 2) * 100, y = 1240 + r * 170;
      G.rrect(ctx, x, y, 180, 150, 10, { fill: (r + c) % 2 ? (night ? '#454A80' : '#D8B27E') : (night ? '#3D4278' : '#CFA36A'), lw: 3, seed: 420 + r * 6 + c }); }
    for (let i = 0; i < 18; i++) { const x = (i * 157) % 1080 + Math.sin(t + i) * 30, y = 600 + ((i * 97 + t * 30) % 900);
      ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = night ? '#C8D0FF' : '#fff'; ctx.beginPath(); ctx.arc(x, y, 3 + (i % 3), 0, 7); ctx.fill(); ctx.restore(); }
  }

  // la cucaracha vista de arriba, mirando hacia arriba. o: { head:false, walk, mood, alpha, xray, cheeks }
  function cuca(ctx, x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0); ctx.globalAlpha = o.alpha ?? 1;
    const step = o.walk === false ? 0 : Math.sin(t * 16);
    for (const side of [-1, 1]) for (let k = 0; k < 3; k++) { const ly = -40 + k * 80, sw = step * (k % 2 ? 1 : -1) * side * 18;
      G.limb(ctx, [[side * 60, ly], [side * 150, ly - 40 + sw], [side * 200, ly + 40 + sw]], { color: BDARK, lw: 14, ink: '#120600', outline: 3, seed: 500 + k + side * 5 }); }
    G.ellipse(ctx, 0, 40, 105, 170, { fill: BROWN, lw: 6, seed: 510 });
    G.line(ctx, [[0, -100], [0, 200]], { color: BDARK, lw: 6, seed: 511 });
    for (let k = 0; k < 4; k++) G.line(ctx, [[-90, -20 + k * 55], [90, -20 + k * 55]], { color: 'rgba(40,15,5,0.45)', lw: 4, seed: 512 + k });
    G.ellipse(ctx, -40, -40, 22, 60, { fill: 'rgba(255,220,180,0.35)', lw: 0, seed: 516 });
    if (o.xray) for (let k = 0; k < 5; k++) for (const side of [-1, 1]) { const sy = -40 + k * 50, p = (t * 1.5 + k * 0.2) % 1;
      G.ellipse(ctx, side * 92, sy, 9, 9, { fill: '#111', lw: 2, seed: 520 + k });
      ctx.save(); ctx.globalAlpha = 0.8 * (1 - p); G.line(ctx, [[side * (200 - 100 * p), sy], [side * (150 - 100 * p), sy]], { color: '#7FD4FF', lw: 8, seed: 530 + k }); ctx.restore(); }
    G.ellipse(ctx, 0, -140, 85, 55, { fill: '#5A2A12', lw: 6, seed: 540 }); // escudo (pronoto)
    if (o.head !== false) {
      G.ellipse(ctx, 0, -205, 55, 42, { fill: BDARK, lw: 5, seed: 541 });
      const a1 = Math.sin(t * 5) * 0.25, a2 = Math.cos(t * 4.3) * 0.25;
      G.line(ctx, [[-20, -235], [-90 + 40 * a1, -330], [-170 + 60 * a1, -470]], { color: BDARK, lw: 7, seed: 542 });
      G.line(ctx, [[20, -235], [90 + 40 * a2, -330], [170 + 60 * a2, -470]], { color: BDARK, lw: 7, seed: 543 });
      const m = o.mood || 'smug';
      for (const sx of [-24, 24]) { G.ellipse(ctx, sx, -215, 17, 17, { fill: '#fff', lw: 3, seed: 544 + sx }); G.ellipse(ctx, sx + 3, -212, 8, 8, { fill: '#111', lw: 0, seed: 546 + sx }); }
      if (m === 'smug' || m === 'angry') { G.line(ctx, [[-44, -244], [-10, -232]], { lw: 6, seed: 548 }); G.line(ctx, [[44, -244], [10, -232]], { lw: 6, seed: 549 }); }
      if (o.cheeks) { G.ellipse(ctx, -50, -190, 26, 22, { fill: '#C0602E', lw: 3, seed: 550 }); G.ellipse(ctx, 50, -190, 26, 22, { fill: '#C0602E', lw: 3, seed: 551 }); }
      else G.line(ctx, [[-16, -186], [0, -178], [18, -190]], { lw: 5, seed: 552 });
    } else {
      G.ellipse(ctx, 0, -175, 40, 16, { fill: '#C9E86A', lw: 4, seed: 553 }); // cuello cortado
    }
    ctx.restore();
  }
  function dino(ctx, x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = o.alpha ?? 1; ctx.rotate(o.rot || 0);
    const col = o.col || '#4FAF5A', dk = '#1F5A28', bob = Math.sin(t * 2) * 8;
    G.limb(ctx, [[-150, 0], [-330, 40], [-460, -20]], { color: col, lw: 60, ink: dk, outline: 5, seed: 600 });
    for (const lx of [-80, 60]) G.limb(ctx, [[lx, 60], [lx, 230]], { color: col, lw: 56, ink: dk, outline: 5, seed: 601 + lx });
    G.ellipse(ctx, 0, 0, 200, 130, { fill: col, lw: 6, seed: 603 });
    G.limb(ctx, [[130, -50], [210, -220 + bob], [230, -380 + bob]], { color: col, lw: 64, ink: dk, outline: 5, seed: 604 });
    G.ellipse(ctx, 280, -400 + bob, 100, 62, { fill: col, lw: 6, seed: 605 });
    if (o.dead) { G.line(ctx, [[280, -440 + bob], [310, -410 + bob]], { lw: 7, seed: 606 }); G.line(ctx, [[310, -440 + bob], [280, -410 + bob]], { lw: 7, seed: 607 }); }
    else { G.ellipse(ctx, 300, -425 + bob, 16, 16, { fill: '#fff', lw: 3, seed: 608 }); G.ellipse(ctx, 304, -422 + bob, 7, 7, { fill: '#111', lw: 0, seed: 609 }); }
    for (let k = 0; k < 5; k++) G.poly(ctx, [[-120 + k * 60, -120], [-95 + k * 60, -175], [-70 + k * 60, -120]], { fill: '#F2C230', lw: 4, seed: 610 + k });
    ctx.restore();
  }

  C.film([
    function hook(ctx, t, a) {
      kitchen(ctx, t);
      const [sx, sy] = shake(t, ev.indes, 24);
      ctx.save(); ctx.translate(sx, sy);
      if (t > ev.indes - 0.05) G.rays(ctx, CX, 1050, { n: 18, r0: 360, r1: 1300, color: '#FF6A3A', lw: 10, alpha: 0.25, spin: t * 0.3 });
      cuca(ctx, CX + Math.sin(t * 1.4) * 40, 1080, 1.4 * (0.55 + 0.45 * pop(t, a, 0.5)), t, { mood: 'smug' });
      ctx.restore();
      C.pill(ctx, t, ev.indes, 'indestructible', CX, 640, '#FF6A3A');
      return ['La cucaracha es', 'la más *indestructible*'];
    },
    function cabeza(ctx, t, a) {
      kitchen(ctx, t);
      const cut = t > ev.cortas, k = out(t, ev.cortas, 0.9);
      const bx = cut ? lerp(CX, CX + 120, k) + Math.sin(t * 3) * 60 : CX;
      cuca(ctx, bx, 1150, 1.15 * pop(t, a, 0.5), t, { head: !cut, mood: 'smug' });
      if (cut) { // la cabeza vuela girando
        ctx.save(); ctx.translate(lerp(CX, 230, k), lerp(1150 - 236, 760, k) - Math.sin(k * Math.PI) * 220); ctx.rotate(k * 9);
        G.ellipse(ctx, 0, 0, 63, 48, { fill: BDARK, lw: 5, seed: 560 }); G.ellipse(ctx, -20, -8, 14, 14, { fill: '#fff', lw: 3, seed: 561 }); G.ellipse(ctx, 20, -8, 14, 14, { fill: '#fff', lw: 3, seed: 562 });
        G.line(ctx, [[-12, 18], [12, 18]], { lw: 4, seed: 563 }); ctx.restore();
        C.text(ctx, 'ZAS', CX + 260, 900, { size: 110 * pop(t, ev.cortas, 0.3), color: '#fff', stroke: '#0b1030', strokeW: 12 });
      }
      const pc = pop(t, ev.semana - 0.2, 0.4);
      if (pc > 0) { ctx.save(); ctx.translate(820, 720); ctx.scale(pc, pc); G.rrect(ctx, -130, -120, 260, 240, 24, { fill: '#fff', lw: 6, seed: 570 }); G.rrect(ctx, -130, -120, 260, 70, 24, { fill: '#E8324A', lw: 6, seed: 571 });
        const dd = Math.min(7, 1 + Math.floor((t - ev.semana + 0.2) * 5)); C.text(ctx, dd + '', 0, 60, { size: 120, color: '#0b1030', shadow: false }); C.text(ctx, 'DÍAS', 0, -70, { size: 40, color: '#fff', shadow: false }); ctx.restore(); }
      return ['Sin cabeza', 'vive una *semana*'];
    },
    function sed(ctx, t, a) {
      C.bg(ctx, '#FFB347', '#E8632A');
      C.glow(ctx, 850, 520, 300, '255,240,150', 0.7); G.ellipse(ctx, 850, 520, 110, 110, { fill: '#FFE14A', lw: 6, seed: 580 });
      G.rays(ctx, 850, 520, { n: 16, r0: 140, r1: 230, color: '#FFE14A', lw: 8, alpha: 0.8, spin: t * 0.6 });
      G.poly(ctx, [[-60, 1250], [400, 1200], [1140, 1260], [1140, 2000], [-60, 2000]], { fill: '#F2C77A', lw: 6, seed: 581 });
      const dry = out(t, ev.sed, 0.6);
      cuca(ctx, 420 + Math.sin(t * 2) * 20, 1230, 1.05 * pop(t, a, 0.5), t, { head: false, walk: t < ev.sed });
      for (let i = 0; i < 4; i++) G.ellipse(ctx, 300 + i * 80, 960 - ((t * 140 + i * 50) % 180), 9, 15, { fill: '#7FD4FF', lw: 2, seed: 585 + i, alpha: dry }); // se le va el agua
      const pg = pop(t, ev.agua - 0.6, 0.4);
      if (pg > 0) { ctx.save(); ctx.translate(840, 1180); ctx.scale(pg, pg); G.rrect(ctx, -70, -150, 140, 220, 18, { fill: 'rgba(190,235,255,0.6)', lw: 6, seed: 590 }); G.rrect(ctx, -62, -60, 124, 122, 12, { fill: '#5FB8FF', lw: 0, seed: 591 }); ctx.restore(); }
      const pb = pop(t, ev.boca, 0.35);
      if (pb > 0) { ctx.save(); ctx.translate(420, 820); ctx.scale(pb, pb); G.ellipse(ctx, 0, 0, 80, 50, { fill: '#fff', lw: 6, seed: 592 }); G.line(ctx, [[-40, 0], [0, 15], [40, 0]], { lw: 8, seed: 593 });
        G.line(ctx, [[-90, -70], [90, 70]], { color: '#ff3a3a', lw: 14, seed: 594 }); ctx.restore(); }
      C.pill(ctx, t, ev.sed, 'se muere de sed', CX, 650, '#ff5a3a');
      return ['¿De qué se muere?', 'de *sed*'];
    },
    function respira(ctx, t, a) {
      C.bg(ctx, '#0B1E3A', '#1D3F6E');
      for (let i = 0; i < 30; i++) { const x = (i * 71) % 1080, y = (i * 113 + t * 40) % 1920; ctx.save(); ctx.globalAlpha = 0.15; ctx.fillStyle = '#7FD4FF'; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); ctx.restore(); }
      cuca(ctx, CX, 1060, 1.5 * pop(t, a, 0.5), t, { head: t < ev.huevo - 0.3, xray: t > ev.agujeritos - 0.2, walk: false });
      if (t > ev.huevo - 0.3) C.text(ctx, '¿Y la cabeza?', CX, 700, { size: 70 * pop(t, ev.huevo - 0.3, 0.3), color: '#fff', stroke: '#0b1030', strokeW: 10 });
      C.pill(ctx, t, ev.agujeritos, 'respira por agujeritos', CX, 1330, '#7FD4FF');
      return ['Respira', 'por el *cuerpo*'];
    },
    function aire(ctx, t, a) {
      C.bg(ctx, '#0A3A6A', '#062246');
      for (let i = 0; i < 22; i++) { const x = (i * 131.7) % 1080 + Math.sin(t * 2 + i) * 12, y = 1900 - ((t * (80 + (i % 5) * 20) + i * 173) % 2000);
        ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = '#DDF4FF'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 5 + (i % 4) * 4, 0, 7); ctx.stroke(); ctx.restore(); }
      const [sx, sy] = shake(t, ev.concha, 26, 0.6);
      ctx.save(); ctx.translate(sx, sy);
      cuca(ctx, 380, 1150 + Math.sin(t * 1.5) * 25, 1.0 * pop(t, a, 0.5), t, { cheeks: true, walk: false, rot: Math.sin(t) * 0.1 });
      ctx.restore();
      const pr = pop(t, ev.cuarenta - 0.3, 0.4);
      if (pr > 0) { ctx.save(); ctx.translate(770, 860); ctx.scale(pr, pr);
        G.ellipse(ctx, 0, 0, 170, 170, { fill: '#fff', lw: 8, seed: 620 });
        const p = clamp((t - ev.cuarenta) / 1.6); ctx.fillStyle = 'rgba(232,50,74,0.85)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 150, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2 * (40 / 60)); ctx.fill();
        G.line(ctx, [[0, 0], [Math.cos(-Math.PI / 2 + p * 4.19) * 130, Math.sin(-Math.PI / 2 + p * 4.19) * 130]], { lw: 10, seed: 621 }); ctx.restore();
        C.count(ctx, t, ev.cuarenta, 40, 770, 1140, { suf: ' MIN', size: 110 }); }
      return ['Aguanta sin respirar', '*40 minutos*'];
    },
    function dinos(ctx, t, a) {
      C.bg(ctx, '#FF9A4A', '#B8402A');
      G.poly(ctx, [[600, 1100], [780, 700], [860, 690], [1080, 1100]], { fill: '#6A3A2A', lw: 6, seed: 630 });
      for (let i = 0; i < 6; i++) { const p = (t * 0.6 + i / 6) % 1; G.ellipse(ctx, 820 + Math.sin(i * 3) * 40 * p, 680 - p * 400, 30 + p * 60, 30 + p * 50, { fill: 'rgba(80,60,60,0.5)', lw: 0, seed: 631 + i }); }
      G.poly(ctx, [[-60, 1100], [1140, 1100], [1140, 2000], [-60, 2000]], { fill: '#8A6A3A', lw: 6, seed: 640 });
      dino(ctx, 470, 1060, 0.95 * pop(t, ev.dinos - 0.3, 0.5), t);
      cuca(ctx, 830, 1300, 0.45 * pop(t, a, 0.4), t, { mood: 'smug', rot: -0.4 });
      C.count(ctx, t, ev.trescientos, 300, CX, 760, { suf: ' MILLONES', size: 100 });
      C.pill(ctx, t, ev.trescientos + 0.5, 'de años', CX, 840, '#FFD22E');
      return ['Está acá hace', '*300 millones* de años'];
    },
    function cierre(ctx, t, a) {
      const kit = t > ev.sigue - 0.2;
      if (!kit) {
        C.bg(ctx, '#5A2A3A', '#B8402A');
        G.poly(ctx, [[-60, 1100], [1140, 1100], [1140, 2000], [-60, 2000]], { fill: '#6A5A4A', lw: 6, seed: 650 });
        const m = out(t, a, 0.7), boom = out(t, ev.murieron, 0.4);
        G.line(ctx, [[1200 - 700 * m, -100 + 1000 * m], [1300 - 700 * m, -250 + 1000 * m]], { color: '#FFD22E', lw: 30, seed: 651 });
        G.ellipse(ctx, 1200 - 700 * m, -100 + 1000 * m, 70, 70, { fill: '#6A4A3A', lw: 6, seed: 652 });
        if (boom > 0) { C.glow(ctx, 500, 950, 700 * boom, '255,200,80', 0.8 * (1 - boom * 0.5)); }
        dino(ctx, 420, 1080, 0.85, t, { dead: t > ev.murieron, col: t > ev.murieron ? '#8A8A8A' : '#4FAF5A', rot: t > ev.murieron ? 0.25 * out(t, ev.murieron, 0.5) : 0 });
      } else {
        kitchen(ctx, t, true);
        G.rrect(ctx, 620, 560, 380, 700, 30, { fill: '#DDE6F2', lw: 6, seed: 660 }); G.line(ctx, [[620, 800], [1000, 800]], { lw: 6, seed: 661 }); // heladera
        C.glow(ctx, CX, 1300, 400, '255,240,180', 0.3);
        cuca(ctx, 380 + Math.sin(t * 2) * 30, 1350, 0.9 * pop(t, ev.sigue - 0.2, 0.5), t, { mood: 'smug' });
        if (t > ev.cocina) C.text(ctx, '¡F*RRA!', CX, 780, { size: 150 * pop(t, ev.cocina + 0.3, 0.35), color: '#FFD22E', stroke: '#0b1030', strokeW: 16 });
      }
      return kit ? ['Y sigue', 'en tu *cocina*'] : ['Los dinosaurios', 'se *murieron* todos'];
    },
  ]);
})();
