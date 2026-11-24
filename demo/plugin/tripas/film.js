// Por qué te suenan las tripas
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = { suenan: cue(0, 'suenan'), hambre: cue(0, 'hambre'), ondas: cue(1, 'ondas'), lleno: cue(2, 'lleno'), vacio: cue(3, 'vacío'), fuerte: cue(3, 'fuerte'),
    horas: cue(4, 'horas'), limpieza: cue(4, 'limpieza'), rugido: cue(5, 'rugido'), barriendo: cue(6, 'barriendo') };
  // intestino: un tubo serpenteante con ondas que viajan; fill = 'comida' | 'aire'
  function gut(ctx, t, x, y, s, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const path = []; for (let i = 0; i <= 120; i++) { const u = i / 120, row = Math.floor(u * 4), f = (u * 4) % 1; const dir = row % 2 ? -1 : 1;
      path.push([dir * lerp(-280, 280, f), -210 + row * 140 + Math.sin(f * Math.PI) * 20 * (row % 2 ? 1 : -1)]); }
    const amp = o.amp ?? 1, sp = o.speed ?? 1;
    G.limb(ctx, path, { color: '#F08A9A', lw: 92, outline: '#7a2a3a' });
    path.forEach((p, i) => { const w = Math.max(0, Math.sin(i * 0.35 - t * 6 * sp)); if (w > 0.85) G.ellipse(ctx, p[0], p[1], 46 * amp, 46 * amp, { fill: 'rgba(255,255,255,0.18)', lw: 0, seed: 100 + i }); });
    const n = o.items || 0;
    for (let k = 0; k < n; k++) { const idx = Math.floor(((k / n) * 120 + t * 14 * sp) % 120), p = path[idx];
      if (o.fill === 'aire') G.ellipse(ctx, p[0], p[1], 24, 24, { fill: '#CFF0FF', lw: 3, seed: 200 + k });
      else G.rrect(ctx, p[0] - 22, p[1] - 22, 44, 44, 12, { fill: ['#C98E3A', '#7AAA4A', '#E8B54A'][k % 3], lw: 3, seed: 200 + k }); }
    ctx.restore();
  }
  const waves = (ctx, t, x, y, k, col = '#FFD22E') => { for (let i = 0; i < 3; i++) { const p = ((t * 1.5 + i / 3) % 1); ctx.save(); ctx.globalAlpha = k * (1 - p); ctx.strokeStyle = col; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(x, y, 60 + p * 200, -0.7, 0.7); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, 60 + p * 200, Math.PI - 0.7, Math.PI + 0.7); ctx.stroke(); ctx.restore(); } };
  C.film([
    function suenan(ctx, t, a) {
      C.bg(ctx, '#2A1A3A', '#5A3A6A');
      C.person(ctx, CX, 1330, 1.35 * pop(t, a, 0.5), { eyes: 'wide', mouth: 'o', brows: 'up', handL: [-60, -150], handR: [60, -150], style: { shirt: '#19B8B2' } });
      waves(ctx, t, CX, 1060, fade(t, ev.suenan - 0.2));
      C.text(ctx, 'GRRR', 830, 760 + Math.sin(t * 12) * 6, { size: 90, color: '#FFD22E', stroke: '#0b1030', strokeW: 12, alpha: fade(t, ev.suenan) });
      return ['Las tripas te suenan', '*todo el tiempo*'];
    },
    function ondas(ctx, t, a) {
      C.bg(ctx, '#3A1E2A', '#7A3B4A');
      gut(ctx, t, CX, 960, 1.15 * pop(t, a, 0.5), { items: 10 });
      C.pill(ctx, t, ev.ondas, 'se aprieta en ondas', CX, 640, '#FFD22E');
      return ['Tu intestino empuja', 'la comida en *ondas*'];
    },
    function lleno(ctx, t, a) {
      C.bg(ctx, '#3A1E2A', '#7A3B4A');
      gut(ctx, t, CX, 960, 1.15, { items: 26 });
      C.text(ctx, 'grr', 860, 700, { size: 50, color: '#fff', alpha: 0.35 });
      C.pill(ctx, t, ev.lleno, 'lleno: amortigua el ruido', CX, 1300, '#7AAA4A');
      return ['Cuando está lleno', 'la comida *amortigua*'];
    },
    function vacio(ctx, t, a) {
      C.bg(ctx, '#3A1E2A', '#7A3B4A');
      gut(ctx, t, CX, 960, 1.15, { items: 12, fill: 'aire', amp: 1.3 });
      waves(ctx, t, CX, 960, fade(t, ev.fuerte - 0.2) * 1.2);
      C.text(ctx, 'GRRRR', CX, 700 + Math.sin(t * 14) * 8, { size: 120 * (0.8 + 0.2 * fade(t, ev.fuerte)), color: '#FFD22E', stroke: '#0b1030', strokeW: 14, alpha: fade(t, ev.vacio) });
      C.pill(ctx, t, ev.vacio, 'vacío: solo aire', CX, 1300, '#5fb8ff');
      return ['Cuando está vacío', 'suena mucho *más fuerte*'];
    },
    function limpieza(ctx, t, a) {
      C.bg(ctx, '#12304A', '#2A5A7A');
      const k = out(t, ev.limpieza - 0.3, 0.4);
      gut(ctx, t, CX, 980, 1.05, { items: 6, speed: 1 + 2.5 * k, amp: 1 + 0.5 * k });
      G.ellipse(ctx, 200, 640, 80, 80, { fill: '#F4F7FB', lw: 6, seed: 50 });
      const hand = -Math.PI / 2 + Math.PI * 2 * clamp((t - a) / 2) / 3 * 2;
      G.line(ctx, [[200, 640], [200 + Math.cos(hand) * 60, 640 + Math.sin(hand) * 60]], { color: '#0b1030', lw: 8, seed: 51 });
      C.pill(ctx, t, ev.horas, '2 horas después', 420, 640, '#FFD22E');
      C.pill(ctx, t, ev.limpieza, 'limpieza a fondo', CX, 1300, '#19B8B2');
      return ['2 horas después de comer', 'hace una *limpieza*'];
    },
    function rugido(ctx, t, a) {
      C.bg(ctx, '#2A1A3A', '#5A3A6A');
      C.person(ctx, CX, 1330, 1.2, { eyes: 'normal', mouth: 'smirk', gesture: 'shrug', style: { shirt: '#19B8B2' } });
      waves(ctx, t, CX, 1100, 1);
      C.pill(ctx, t, ev.rugido + 0.3, 'no siempre es hambre', CX, 640, '#ff5a3a');
      return ['Ese rugido', 'no siempre es *hambre*'];
    },
    function barriendo(ctx, t, a) {
      C.bg(ctx, '#12304A', '#2A5A7A');
      G.limb(ctx, [[-100, 1060], [1180, 1060]], { color: '#F08A9A', lw: 300, outline: '#7a2a3a' });
      const x = lerp(-100, 1180, ((t - a) * 0.35) % 1);
      ctx.save(); ctx.translate(x, 1060); ctx.rotate(-0.4 + Math.sin(t * 8) * 0.15);
      G.line(ctx, [[0, -260], [0, 40]], { color: '#8A5A3A', lw: 16, seed: 60 });
      G.poly(ctx, [[-60, 40], [60, 40], [90, 140], [-90, 140]], { fill: '#FFD22E', lw: 5, seed: 61 }); ctx.restore();
      for (let i = 0; i < 5; i++) G.ellipse(ctx, x + 120 + i * 40, 1110 - (i % 2) * 30, 14, 14, { fill: '#C98E3A', lw: 3, seed: 70 + i });
      return ['A veces es tu cuerpo', '*barriendo*'];
    },
  ]);
})();
