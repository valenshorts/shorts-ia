// La jirafa (versión puteada)
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = {
    forra: cue(0, 'forra'), verde: cue(0, 'verde'),
    vertebras: cue(1, 'vértebras'), siete: cue(1, 'siete'), veinte: cue(1, 'veinte'), turra: cue(1, 'turra'),
    lengua: cue(2, 'lengua'), negra: cue(2, 'negra'), sol: cue(2, 'sol'),
    examenes: cue(3, 'exámenes'), media: cue(3, 'media'), pelotuda: cue(3, 'pelotuda'),
    pesa: cue(4, 'pesa'), diez: cue(4, 'diez'), sangre: cue(4, 'sangre'), gil: cue(4, 'gil'),
    cae: cue(5, 'cae'), piso: cue(5, 'piso'), nabo: cue(5, 'nabo'),
    cheta: cue(6, 'cheta'), salame: cue(6, 'salame'),
  };
  const YEL = '#F2C04A', SPOT = '#B86A2A', DK = '#5A3414';
  const shake = (t, t0, amp = 22, d = 0.45) => { const k = clamp(1 - (t - t0) / d); return t >= t0 && k > 0 ? [Math.sin(t * 70) * amp * k, Math.cos(t * 61) * amp * k] : [0, 0]; };
  function savanna(ctx, t, top = '#7AC8F0', bot = '#F8E0A0') {
    C.bg(ctx, top, bot);
    for (let i = 0; i < 3; i++) { const x = ((i * 420 + t * 20) % 1500) - 200; G.ellipse(ctx, x, 520 + i * 60, 120, 40, { fill: 'rgba(255,255,255,0.85)', lw: 0, seed: 800 + i }); }
    G.limb(ctx, [[900, 1400], [905, 1150]], { color: '#6A4A2A', lw: 34, ink: '#2a1a0a', outline: 4, seed: 805 });
    G.ellipse(ctx, 905, 1110, 170, 50, { fill: '#4A8A3A', lw: 5, seed: 806 });
    G.poly(ctx, [[-60, 1400], [1140, 1380], [1140, 2000], [-60, 2000]], { fill: '#D8B060', lw: 6, seed: 807 });
    for (let i = 0; i < 8; i++) { const x = 60 + i * 140, sw = Math.sin(t * 2 + i) * 8; G.line(ctx, [[x, 1400], [x + sw, 1350]], { color: '#8A7A30', lw: 5, seed: 810 + i }); }
  }
  // jirafa de costado mirando a la derecha. o: { neck (largo), tongue 0..1, mood, sleep, glasses, baby }
  function giraffe(ctx, x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const nl = o.neck ?? 1, sw = Math.sin(t * 1.2) * 0.06, st = o.walk ? Math.sin(t * 6) : 0;
    for (const [lx, ph] of [[-110, 1], [-60, 0], [70, 0], [120, 1]]) G.limb(ctx, [[lx, 40], [lx + (ph ? st : -st) * 12, 200], [lx + (ph ? st : -st) * 16, 330]], { color: YEL, lw: 30, ink: DK, outline: 4, seed: 820 + lx });
    G.limb(ctx, [[-150, -10], [-200, 60 + Math.sin(t * 3) * 10]], { color: YEL, lw: 10, ink: DK, outline: 3, seed: 825 });
    G.ellipse(ctx, 0, 0, 170, 90, { fill: YEL, lw: 6, seed: 826 });
    for (const [sx, sy, r] of [[-80, -20, 26], [-10, 20, 22], [60, -30, 24], [110, 25, 18], [-120, 30, 16]]) G.ellipse(ctx, sx, sy, r, r * 0.8, { fill: SPOT, lw: 0, seed: 827 + sx & 31 });
    ctx.save(); ctx.translate(120, -40); ctx.rotate(sw - 0.25);
    const L = 420 * nl;
    G.rrect(ctx, -34, -L, 68, L + 30, 30, { fill: YEL, lw: 6, seed: 840 });
    if (o.bones) for (let k = 0; k < 7; k++) G.rrect(ctx, -18, -L + 20 + k * (L - 30) / 7, 36, (L - 30) / 7 - 10, 8, { fill: '#F4F0E8', lw: 3, seed: 841 + k });
    else for (let k = 0; k < 5; k++) G.ellipse(ctx, (k % 2 ? 10 : -10), -L + 60 + k * (L - 80) / 5, 16, 14, { fill: SPOT, lw: 0, seed: 850 + k });
    ctx.translate(0, -L);
    G.ellipse(ctx, 50, -10, 90, 48, { fill: YEL, lw: 6, seed: 860 });
    G.line(ctx, [[-10, -45], [-15, -95]], { color: DK, lw: 10, seed: 861 }); G.ellipse(ctx, -15, -100, 12, 12, { fill: DK, lw: 0, seed: 862 });
    G.line(ctx, [[20, -45], [20, -95]], { color: DK, lw: 10, seed: 863 }); G.ellipse(ctx, 20, -100, 12, 12, { fill: DK, lw: 0, seed: 864 });
    G.ellipse(ctx, -40, -30, 26, 12, { fill: YEL, lw: 4, seed: 865 });
    if (o.sleep) G.line(ctx, [[30, -22], [45, -16], [60, -22]], { lw: 5, seed: 866 });
    else { G.ellipse(ctx, 45, -22, 13, 13, { fill: '#fff', lw: 3, seed: 867 }); G.ellipse(ctx, 49, -20, 6, 6, { fill: '#111', lw: 0, seed: 868 }); }
    if (o.mood === 'smug') G.line(ctx, [[25, -42], [65, -36]], { lw: 5, seed: 869 });
    if (o.glasses) { G.rrect(ctx, 20, -40, 60, 32, 10, { fill: '#111522', lw: 4, seed: 870 }); G.line(ctx, [[-20, -26], [20, -26]], { lw: 4, seed: 871 }); }
    if (o.tongue) { const tl = 180 * o.tongue, wv = Math.sin(t * 6) * 15; G.limb(ctx, [[130, 10], [130 + tl * 0.6, 20 + wv], [130 + tl, 0 - wv]], { color: '#2A1E3A', lw: 22, ink: '#0a0510', outline: 3, seed: 872 }); }
    G.line(ctx, [[110, 18], [135, 15]], { lw: 5, seed: 873 });
    ctx.restore();
    ctx.restore();
  }
  C.film([
    function hook(ctx, t, a) {
      savanna(ctx, t);
      const [sx, sy] = shake(t, ev.forra, 22);
      ctx.save(); ctx.translate(sx, sy);
      giraffe(ctx, CX - 120, 1100, 1.15 * (0.6 + 0.4 * pop(t, a, 0.5)), t, { mood: 'smug' });
      if (t > ev.verde - 0.2) { const p = pop(t, ev.verde - 0.2, 0.4); ctx.save(); ctx.translate(840, 1330); ctx.scale(p, p);
        G.ellipse(ctx, 0, 0, 80, 46, { fill: '#3FE07A', lw: 5, seed: 880 }); G.ellipse(ctx, 70, -40, 40, 34, { fill: '#3FE07A', lw: 5, seed: 881 }); for (const lx of [-50, 40]) G.line(ctx, [[lx, 40], [lx, 80]], { lw: 12, color: '#2a8a4a', seed: 882 }); G.ellipse(ctx, 82, -46, 6, 6, { fill: '#111', lw: 0, seed: 883 }); ctx.restore(); }
      ctx.restore();
      C.pill(ctx, t, ev.verde, 'más rara que perro verde', CX, 640, '#3FE07A');
      return ['Ojo con esta', 'loca de *cuello largo*'];
    },
    function vertebras(ctx, t, a) {
      C.bg(ctx, '#0B1E3A', '#1D3F6E');
      giraffe(ctx, 300, 1180, 0.95 * pop(t, a, 0.5), t, { bones: true });
      C.person(ctx, 820, 1330, 0.95 * pop(t, ev.vertebras, 0.45), { eyes: 'wide', mouth: 'o', style: { shirt: '#19B8B2' } });
      const p7 = pop(t, ev.siete, 0.4);
      if (p7 > 0) { C.text(ctx, '7', 560, 760, { size: 200 * p7, color: '#FFD22E', stroke: '#0b1030', strokeW: 16 }); C.text(ctx, '= 7', 860, 880, { size: 110 * p7, color: '#fff', stroke: '#0b1030', strokeW: 12 }); }
      C.pill(ctx, t, ev.veinte, '+20 cm cada una', 560, 1300 - 120, '#FFD22E');
      return ['Las mismas vértebras', 'que vos: *siete*'];
    },
    function lengua(ctx, t, a) {
      savanna(ctx, t);
      C.glow(ctx, 900, 560, 260, '255,230,120', 0.6); G.ellipse(ctx, 900, 560, 90, 90, { fill: '#FFE07A', lw: 5, seed: 890 });
      giraffe(ctx, 330, 1150, 1.1 * pop(t, a, 0.5), t, { tongue: out(t, ev.lengua, 0.8) });
      C.pill(ctx, t, ev.lengua + 0.3, 'casi medio metro', 760, 720, '#ff8aa0');
      C.pill(ctx, t, ev.negra, 'negra: protector solar', 760, 800, '#2A1E3A');
      return ['La lengua mide', 'casi *medio metro*'];
    },
    function duerme(ctx, t, a) {
      C.space(ctx, t, '#05081f', '#1A2052');
      giraffe(ctx, 330, 1180, 1.0 * pop(t, a, 0.5), t, { sleep: t > ev.media - 0.3 });
      for (let i = 0; i < 3; i++) { const p = (t * 0.7 + i / 3) % 1; C.text(ctx, 'Z', 560 + p * 80, 700 - p * 160, { size: 40 + 40 * p, color: '#fff', alpha: 1 - p, stroke: '#0b1030', strokeW: 6 }); }
      const pc = pop(t, ev.media - 0.3, 0.4);
      if (pc > 0) { ctx.save(); ctx.translate(830, 1000); ctx.scale(pc, pc); G.ellipse(ctx, 0, 0, 120, 120, { fill: '#fff', lw: 7, seed: 891 });
        ctx.fillStyle = 'rgba(95,184,255,0.8)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 105, -Math.PI / 2, -Math.PI / 2 + Math.PI * clamp((t - ev.media) / 1.2)); ctx.fill(); ctx.restore();
        C.text(ctx, '30 MIN', 830, 1190, { size: 64 * pc, color: '#FFD22E', stroke: '#0b1030', strokeW: 10 }); }
      return ['¿Dormir?', '*media hora* por día'];
    },
    function corazon(ctx, t, a) {
      C.bg(ctx, '#3A0A1A', '#8A1A3A');
      giraffe(ctx, 300, 1200, 0.95 * pop(t, a, 0.5), t, { mood: 'smug' });
      const b = Math.max(0, Math.sin(t * 6)) ** 4; C.glow(ctx, 330, 1180, 180, '255,80,100', 0.4 + 0.3 * b); G.heart(ctx, 330, 1180, 3.2 * (1 + 0.15 * b), { fill: '#E8324A' });
      if (t > ev.sangre) for (let i = 0; i < 8; i++) { const p = ((t - ev.sangre) * 0.8 + i / 8) % 1; G.ellipse(ctx, lerp(370, 420, p), lerp(1120, 640, p), 10, 10, { fill: '#E8324A', lw: 2, seed: 892 + i }); }
      C.count(ctx, t, ev.diez - 0.2, 10, 820, 820, { suf: ' KG', size: 150 });
      if (t > ev.gil) C.text(ctx, 'GIL', 820, 1000, { size: 120 * pop(t, ev.gil, 0.35), color: '#fff', stroke: '#0b1030', strokeW: 12 });
      return ['El corazón pesa', 'más de *10 kilos*'];
    },
    function nace(ctx, t, a) {
      savanna(ctx, t);
      const [sx, sy] = shake(t, ev.piso, 26, 0.6);
      ctx.save(); ctx.translate(sx, sy);
      giraffe(ctx, 300, 1100, 1.0 * pop(t, a, 0.5), t, { mood: 'smug' });
      const f = clamp((t - ev.cae + 0.1) / Math.max(0.4, ev.piso - ev.cae + 0.1));
      giraffe(ctx, 500, lerp(980, 1290, ease.inQuad(f)), 0.42, t, { sleep: f >= 1, neck: 0.8 });
      if (f > 0 && f < 1) G.line(ctx, [[560, 900], [560, lerp(900, 1180, f)]], { color: 'rgba(255,255,255,0.5)', lw: 6, seed: 899 });
      ctx.restore();
      C.pill(ctx, t, ev.cae, 'cae de casi 2 metros', 760, 760, '#FFD22E');
      if (t > ev.nabo) C.text(ctx, '¡BIENVENIDO, NABO!', CX, 880, { size: 80 * pop(t, ev.nabo, 0.35), color: '#fff', stroke: '#0b1030', strokeW: 12 });
      return ['Cuando nace', 'se cae de *2 metros*'];
    },
    function cierre(ctx, t, a) {
      savanna(ctx, t, '#FF9A5A', '#FFE0A0');
      G.rays(ctx, CX, 900, { n: 18, r0: 300, r1: 1300, color: '#FFD22E', lw: 8, alpha: 0.18, spin: t * 0.3 });
      giraffe(ctx, 360, 1150, 1.15 * pop(t, a, 0.5), t, { glasses: t > ev.cheta - 0.2, mood: 'smug' });
      C.person(ctx, 860, 1360, 0.7 * pop(t, a + 0.3, 0.4), { eyes: 'wide', mouth: 'o', style: { shirt: '#FFD22E' } });
      if (t > ev.salame - 0.05) C.text(ctx, '¿QUÉ MIRÁS, SALAME?', CX, 760, { size: 68 * pop(t, ev.salame, 0.35), color: '#FFD22E', stroke: '#0b1030', strokeW: 12 });
      return ['Y te mira', 'desde *arriba*'];
    },
  ]);
})();
