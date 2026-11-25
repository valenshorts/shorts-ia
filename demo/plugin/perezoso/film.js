// El perezoso (versión puteada): algas en el pelo, un mes para digerir y baja una vez por semana a cagar
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = {
    vago: cue(0, 'vago'), selva: cue(0, 'selva'),
    lento: cue(1, 'lento'), algas: cue(1, 'algas'), verde: cue(1, 'verde'),
    mes: cue(2, 'mes'), digerir: cue(2, 'digerir'), hoja: cue(2, 'hoja'), concha: cue(2, 'concha'),
    baja: cue(3, 'baja'), semana: cue(3, 'semana'), cagar: cue(3, 'cagar'),
    perder: cue(4, 'perder'), tercio: cue(4, 'tercio'),
    nada: cue(5, 'nada'), cuarenta: cue(5, 'cuarenta'),
    vago2: cue(6, 'vago'), perezoso: cue(6, 'perezoso'), forro: cue(6, 'forro'),
  };
  const FUR = '#9A7A5A', FDARK = '#4A3420';
  const shake = (t, t0, amp = 22, d = 0.45) => { const k = clamp(1 - (t - t0) / d); return t >= t0 && k > 0 ? [Math.sin(t * 70) * amp * k, Math.cos(t * 61) * amp * k] : [0, 0]; };

  // selva con hojas que se mueven y luciérnagas (nunca queda quieta)
  function jungle(ctx, t, top = '#0E3A22', bot = '#2E7A3A') {
    C.bg(ctx, top, bot);
    for (let i = 0; i < 9; i++) { const x = (i * 140) - 60, sw = Math.sin(t * 0.9 + i) * 0.08;
      ctx.save(); ctx.translate(x, 1950); ctx.rotate(sw); G.poly(ctx, [[-30, 0], [30, 0], [10, -900 - (i % 3) * 200], [-10, -900 - (i % 3) * 200]], { fill: '#1F5A30', lw: 4, seed: 700 + i }); ctx.restore(); }
    for (let i = 0; i < 14; i++) { const x = (i * 83) % 1080, y = 620 + (i * 131) % 900, a = t * 1.2 + i;
      ctx.save(); ctx.translate(x + Math.sin(a) * 18, y); ctx.rotate(Math.sin(a) * 0.4);
      G.ellipse(ctx, 0, 0, 70, 26, { fill: i % 2 ? '#3FAF5A' : '#2F8A46', lw: 4, seed: 720 + i }); ctx.restore(); }
    for (let i = 0; i < 12; i++) { const x = (i * 97 + Math.sin(t + i) * 40) % 1080, y = 700 + ((i * 151 + t * 25) % 900);
      ctx.save(); ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t * 3 + i); C.glow(ctx, x, y, 18, '255,240,140', 0.9); ctx.restore(); }
  }
  function branch(ctx, y, t) { G.limb(ctx, [[-80, y + 10], [400, y - 10 + Math.sin(t) * 6], [1160, y + 20]], { color: '#6A4A2A', lw: 54, ink: '#2A1A0A', outline: 5, seed: 740 }); }

  // perezoso colgado de una rama (manos arriba en y=-300 relativo). o: { green 0..1, sleepy, mood, hang:false, swim, thin }
  function sloth(ctx, x, y, s, t, o = {}) {
    const g = o.green || 0, col = g > 0 ? lerpColor(FUR, '#5A9A4A', g) : FUR, w = o.thin ? lerp(1, 0.7, o.thin) : 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
    const sway = o.hang === false ? 0 : Math.sin(t * 0.8) * 0.06; ctx.rotate(sway);
    if (o.swim) { const p = Math.sin(t * 6); G.limb(ctx, [[-90, -40], [-220, -40 + 60 * p], [-300, 20 + 60 * p]], { color: col, lw: 46, ink: FDARK, outline: 5, seed: 750 }); G.limb(ctx, [[90, -40], [220, -40 - 60 * p], [300, 20 - 60 * p]], { color: col, lw: 46, ink: FDARK, outline: 5, seed: 751 }); }
    else if (o.hang !== false) { G.limb(ctx, [[-80, -60], [-110, -200], [-90, -300]], { color: col, lw: 46, ink: FDARK, outline: 5, seed: 752 }); G.limb(ctx, [[80, -60], [110, -200], [90, -300]], { color: col, lw: 46, ink: FDARK, outline: 5, seed: 753 });
      for (const sx of [-90, 90]) for (let k = -1; k <= 1; k++) G.line(ctx, [[sx + k * 12, -300], [sx + k * 14, -335]], { color: '#EDE0C8', lw: 7, seed: 754 + k }); }
    G.limb(ctx, [[-60, 150], [-90, 290]], { color: col, lw: 46, ink: FDARK, outline: 5, seed: 756 }); G.limb(ctx, [[60, 150], [90, 290]], { color: col, lw: 46, ink: FDARK, outline: 5, seed: 757 });
    const pts = []; for (let i = 0; i < 34; i++) { const a = (i / 34) * Math.PI * 2, r = i % 2 ? 1 : 1.08; pts.push([Math.cos(a) * 140 * w * r, 50 + Math.sin(a) * 170 * r]); }
    G.poly(ctx, pts, { fill: col, lw: 6, seed: 758 });
    if (g > 0) for (let i = 0; i < 16; i++) G.ellipse(ctx, Math.cos(i * 2.4) * 100 * w, 50 + Math.sin(i * 1.7) * 130, 10 * g, 8 * g, { fill: '#3FCF5A', lw: 0, seed: 760 + i });
    // cabeza
    G.ellipse(ctx, 0, -140, 110, 95, { fill: col, lw: 6, seed: 780 }); G.ellipse(ctx, 0, -130, 85, 66, { fill: '#F2E2C4', lw: 4, seed: 781 });
    const sl = o.sleepy ?? 1;
    for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * 40, -140); ctx.rotate(sx * 0.35); G.ellipse(ctx, 0, 0, 34, 20, { fill: '#3A2614', lw: 3, seed: 782 + sx }); ctx.restore();
      if (o.mood === 'shock') G.ellipse(ctx, sx * 40, -140, 14, 14, { fill: '#fff', lw: 3, seed: 784 + sx });
      else G.line(ctx, [[sx * 40 - 14, -140 + 4 * sl], [sx * 40, -140 + 10 * sl], [sx * 40 + 14, -140 + 4 * sl]], { color: '#fff', lw: 5, seed: 786 + sx }); }
    G.ellipse(ctx, 0, -112, 16, 11, { fill: '#2A1A0A', lw: 0, seed: 788 });
    if (o.mood === 'shock') G.ellipse(ctx, 0, -80, 14, 18, { fill: '#5a1a14', lw: 4, seed: 789 });
    else G.line(ctx, [[-28, -86], [0, -74], [28, -86]], { lw: 6, seed: 790 });
    ctx.restore();
  }
  function lerpColor(a, b, k) { const pa = [1, 3, 5].map((i) => parseInt(a.substr(i, 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.substr(i, 2), 16));
    return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], k)).toString(16).padStart(2, '0')).join(''); }
  function zzz(ctx, x, y, t) { for (let i = 0; i < 3; i++) { const p = (t * 0.6 + i / 3) % 1; C.text(ctx, 'Z', x + p * 90 + i * 10, y - p * 200, { size: 40 + 40 * p, color: '#fff', alpha: 1 - p, stroke: '#0b1030', strokeW: 6 }); } }
  function poop(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    G.ellipse(ctx, 0, 0, 90, 34, { fill: '#7A4A22', lw: 5, seed: 800 }); G.ellipse(ctx, 0, -40, 66, 28, { fill: '#8A5A2A', lw: 5, seed: 801 }); G.ellipse(ctx, 0, -76, 40, 22, { fill: '#9A6A32', lw: 5, seed: 802 });
    G.poly(ctx, [[-10, -96], [8, -128], [18, -94]], { fill: '#9A6A32', lw: 4, seed: 803 }); ctx.restore(); }

  C.film([
    function hook(ctx, t, a) {
      jungle(ctx, t);
      const [sx, sy] = shake(t, ev.vago, 22);
      ctx.save(); ctx.translate(sx, sy);
      branch(ctx, 760, t);
      sloth(ctx, CX, 1080, 1.35 * (0.6 + 0.4 * pop(t, a, 0.5)), t, { sleepy: 1 });
      zzz(ctx, CX + 150, 820, t);
      ctx.restore();
      C.pill(ctx, t, ev.vago, 'el más vago', CX, 1330, '#FFD22E');
      return ['El perezoso es', 'el más *vago* de la selva'];
    },
    function algas(ctx, t, a) {
      jungle(ctx, t, '#0A3A2A', '#2A6A3A');
      branch(ctx, 760, t);
      const g = out(t, ev.algas - 0.2, 1.4) * 0.6 + out(t, ev.verde, 0.6) * 0.4;
      sloth(ctx, CX, 1080, 1.35 * pop(t, a, 0.5), t, { green: g, sleepy: 1 });
      if (t > ev.lento - 0.2 && t < ev.algas) C.text(ctx, '0,2 km/h', 860, 1300, { size: 70 * pop(t, ev.lento - 0.2, 0.3), color: '#fff', stroke: '#0b1030', strokeW: 10 });
      C.pill(ctx, t, ev.algas, 'algas en el pelo', CX, 1330, '#3FE07A');
      return ['Es tan lento que', 'le crecen *algas*'];
    },
    function digiere(ctx, t, a) {
      C.bg(ctx, '#2A1A3A', '#5A3A6A');
      const [sx, sy] = shake(t, ev.concha, 28, 0.6);
      ctx.save(); ctx.translate(sx, sy);
      sloth(ctx, 340, 1150, 1.0 * pop(t, a, 0.5), t, { hang: false, sleepy: 1 });
      // hoja que viaja despacito por la panza
      const lp = clamp((t - ev.hoja) / 2.5);
      ctx.save(); ctx.translate(340, lerp(1000, 1230, lp)); ctx.rotate(t * 0.5); G.ellipse(ctx, 0, 0, 40, 18, { fill: '#3FAF5A', lw: 4, seed: 810 }); G.line(ctx, [[-38, 0], [38, 0]], { color: '#1F5A30', lw: 3, seed: 811 }); ctx.restore();
      const pc = pop(t, ev.mes - 0.2, 0.4);
      if (pc > 0) { ctx.save(); ctx.translate(780, 900); ctx.scale(pc, pc); G.rrect(ctx, -160, -150, 320, 300, 26, { fill: '#fff', lw: 6, seed: 812 }); G.rrect(ctx, -160, -150, 320, 80, 26, { fill: '#E8324A', lw: 6, seed: 813 });
        const dd = Math.min(30, 1 + Math.floor((t - ev.mes + 0.2) * 14)); C.text(ctx, dd + '', 0, 80, { size: 140, color: '#0b1030', shadow: false }); C.text(ctx, 'DÍAS', 0, -92, { size: 44, color: '#fff', shadow: false }); ctx.restore(); }
      ctx.restore();
      C.pill(ctx, t, ev.digerir, 'para digerir una hoja', CX, 1320, '#3FE07A');
      return ['Tarda casi', 'un *mes* en digerir'];
    },
    function baja(ctx, t, a, b) {
      jungle(ctx, t, '#0E3A22', '#3A6A2A');
      G.rrect(ctx, 700, 300, 140, 1700, 40, { fill: '#6A4A2A', lw: 6, seed: 820 }); // tronco
      G.poly(ctx, [[-60, 1600], [1140, 1580], [1140, 2000], [-60, 2000]], { fill: '#5A3A1A', lw: 6, seed: 821 });
      const down = clamp((t - ev.baja + 0.3) / (ev.cagar - ev.baja + 0.3));
      sloth(ctx, 640, lerp(700, 1300, ease.inOutQuad(down)), 0.85 * pop(t, a, 0.5), t, { sleepy: t > ev.cagar ? 0 : 1, mood: t > ev.cagar ? 'shock' : undefined });
      const pc = pop(t, ev.semana - 0.2, 0.4);
      if (pc > 0) C.text(ctx, '1 VEZ X SEMANA', 330, 800, { size: 64 * pc, color: '#FFD22E', stroke: '#0b1030', strokeW: 10 });
      const pp = pop(t, ev.cagar, 0.4);
      if (pp > 0) { poop(ctx, 330, 1560, 1.2 * pp); for (let i = 0; i < 3; i++) G.line(ctx, [[280 + i * 50, 1420 - Math.sin(t * 4 + i) * 20], [290 + i * 50, 1360 - Math.sin(t * 4 + i) * 20]], { color: '#C8E86A', lw: 6, seed: 830 + i }); }
      return ['Baja del árbol', '*una vez* por semana'];
    },
    function peso(ctx, t, a) {
      C.bg(ctx, '#3A2A1A', '#7A5A3A');
      const th = out(t, ev.tercio, 0.6);
      // balanza
      G.rrect(ctx, CX - 260, 1300, 520, 90, 20, { fill: '#DDE6F2', lw: 6, seed: 840 }); G.rrect(ctx, CX - 120, 1320, 240, 50, 10, { fill: '#0b1030', lw: 4, seed: 841 });
      C.text(ctx, Math.round(lerp(9, 6, th)) + ' KG', CX, 1362, { size: 40, color: '#3FE07A', shadow: false });
      sloth(ctx, CX, 1020 + 20 * th, 1.0 * pop(t, a, 0.5), t, { hang: false, thin: th, mood: th > 0.3 ? 'shock' : undefined, sleepy: 1 });
      const pt = pop(t, ev.tercio, 0.4);
      if (pt > 0) C.text(ctx, '-1/3', 860, 820, { size: 170 * pt, color: '#FFD22E', stroke: '#0b1030', strokeW: 16 });
      if (t > ev.tercio) poop(ctx, 220, 1250, 0.7);
      C.pill(ctx, t, ev.tercio, 'un tercio de su peso', CX, 660, '#FFD22E');
      return ['En una sola vez', 'pierde *un tercio* del peso'];
    },
    function nada(ctx, t, a) {
      C.bg(ctx, '#0A4A6A', '#06304A');
      for (let i = 0; i < 22; i++) { const x = (i * 131.7) % 1080 + Math.sin(t * 2 + i) * 12, y = 1900 - ((t * (80 + (i % 5) * 20) + i * 173) % 2000);
        ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = '#DDF4FF'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 5 + (i % 4) * 4, 0, 7); ctx.stroke(); ctx.restore(); }
      const x = lerp(-150, 700, clamp((t - a) / 2.5));
      sloth(ctx, x, 1150 + Math.sin(t * 3) * 25, 0.95, t, { swim: true, hang: false, rot: Math.PI / 2 * 0.9, sleepy: 0.3 });
      const pr = pop(t, ev.cuarenta - 0.2, 0.4);
      if (pr > 0) C.count(ctx, t, ev.cuarenta, 40, 760, 820, { suf: ' MIN', size: 130 });
      C.pill(ctx, t, ev.nada, 'nada mejor de lo que camina', CX, 1340, '#7FD4FF');
      return ['Y encima', '*nada* re bien'];
    },
    function cierre(ctx, t, a) {
      C.bg(ctx, '#2A2A5A', '#5A4A8A');
      G.rrect(ctx, 80, 1150, 920, 260, 60, { fill: '#C0504A', lw: 7, seed: 850 }); G.rrect(ctx, 60, 1060, 160, 360, 50, { fill: '#A8403A', lw: 6, seed: 851 }); G.rrect(ctx, 860, 1060, 160, 360, 50, { fill: '#A8403A', lw: 6, seed: 852 });
      C.person(ctx, 380, 1270, 1.0 * pop(t, a, 0.5), { pose: 'sit', eyes: 'sleep', mouth: 'smile', style: { shirt: '#19B8B2' } });
      zzz(ctx, 430, 880, t);
      const ps = pop(t, ev.perezoso - 0.2, 0.45);
      if (ps > 0) sloth(ctx, 760, 1130, 0.75 * ps, t, { hang: false, sleepy: 1 });
      if (t > ev.forro - 0.05) { G.rays(ctx, CX, 900, { n: 18, r0: 200, r1: 1200, color: '#FFD22E', lw: 8, alpha: 0.25, spin: t * 0.4 });
        C.text(ctx, '¡F*RRO!', CX, 760, { size: 150 * pop(t, ev.forro, 0.35), color: '#FFD22E', stroke: '#0b1030', strokeW: 16 }); }
      return ['Si te dicen vago', 'decí que sos un *perezoso*'];
    },
  ]);
})();
