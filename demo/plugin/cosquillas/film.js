// Por qué no te podés hacer cosquillas
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = { trata: cue(0, 'tratá'), no: cue(1, 'funciona'), predice: cue(2, 'predice'), volumen: cue(3, 'volumen'), sorpresa: cue(4, 'sorpresa'),
    otra: cue(5, 'otra'), risa: cue(5, 'risa'), robot: cue(6, 'robot'), sentian: cue(6, 'sentían') };
  const feather = (ctx, x, y, r, s = 1) => { ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(s, s);
    G.ellipse(ctx, 0, -70, 34, 100, { fill: '#F4F7FB', lw: 5, seed: 1 }); G.line(ctx, [[0, 40], [0, -160]], { color: '#C9D6E8', lw: 6, seed: 2 });
    for (let i = 0; i < 6; i++) G.line(ctx, [[0, -140 + i * 25], [26, -150 + i * 25]], { color: '#C9D6E8', lw: 3, seed: 3 + i }); ctx.restore(); };
  function brain(ctx, x, y, s, t, glow = 0) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (glow) C.glow(ctx, 0, 0, 260, '255,210,46', 0.4 * glow);
    G.ellipse(ctx, -70, 0, 140, 120, { fill: '#F2A0B8', lw: 6, seed: 10 }); G.ellipse(ctx, 70, 0, 140, 120, { fill: '#F2A0B8', lw: 6, seed: 11 });
    for (let i = 0; i < 6; i++) G.line(ctx, [[-180 + i * 60, -60 + (i % 2) * 30], [-150 + i * 60, 20], [-170 + i * 60, 70]], { color: '#B85A7A', lw: 6, seed: 12 + i });
    ctx.restore();
  }
  C.film([
    function trata(ctx, t, a) {
      C.bg(ctx, '#1A3A5A', '#3A7AA0');
      C.person(ctx, CX, 1330, 1.35 * pop(t, a, 0.5), { eyes: 'focus', mouth: 'flat', handR: [120, -240], style: { shirt: '#FFD22E' } });
      feather(ctx, CX + 160 + Math.sin(t * 10) * 25, 990, -0.6 + Math.sin(t * 10) * 0.3, 0.8);
      return ['Tratá de hacerte', '*cosquillas* a vos mismo'];
    },
    function no(ctx, t, a) {
      C.bg(ctx, '#3A1A2A', '#6A2A3A');
      C.person(ctx, CX, 1330, 1.35, { eyes: 'normal', mouth: 'flat', brows: 'neutral', gesture: 'shrug', style: { shirt: '#FFD22E' } });
      const p = pop(t, ev.no - 0.1, 0.4);
      ctx.save(); ctx.translate(CX, 760); ctx.scale(p, p); G.ellipse(ctx, 0, 0, 120, 120, { fill: 'rgba(255,90,58,0.15)', stroke: '#ff5a3a', lw: 16, seed: 20 });
      G.line(ctx, [[-60, -60], [60, 60]], { color: '#ff5a3a', lw: 18, seed: 21 }); G.line(ctx, [[60, -60], [-60, 60]], { color: '#ff5a3a', lw: 18, seed: 22 }); ctx.restore();
      return ['', 'No *funciona*'];
    },
    function predice(ctx, t, a) {
      C.bg(ctx, '#0E1A3A', '#22365E');
      brain(ctx, CX, 820, 1.2 * pop(t, a, 0.5), t, fade(t, ev.predice - 0.2));
      // flecha de predicción: dibuja el camino antes de que pase la mano
      const k = clamp((t - ev.predice) / 1.2);
      const pts = []; for (let i = 0; i <= 30 * k; i++) { const u = i / 30; pts.push([lerp(200, 880, u), 1180 - Math.sin(u * Math.PI) * 160]); }
      if (pts.length > 1) G.line(ctx, pts, { color: '#FFD22E', lw: 10, seed: 30 });
      if (k > 0) G.star(ctx, 880, 1180, 28 * k, { fill: '#FFD22E' });
      C.pill(ctx, t, ev.predice + 0.3, 'predice cada movimiento', CX, 1290, '#FFD22E');
      return ['Tu cerebro', '*predice* cada movimiento'];
    },
    function volumen(ctx, t, a) {
      C.bg(ctx, '#0E1A3A', '#22365E');
      brain(ctx, 300, 820, 0.7, t);
      const v = 1 - out(t, ev.volumen - 0.2, 0.8);
      G.rrect(ctx, 560, 640, 360, 520, 30, { fill: '#1A2348', lw: 6, seed: 40 });
      for (let i = 0; i < 8; i++) G.rrect(ctx, 600, 1110 - i * 58, 280, 44, 10, { fill: i / 8 < v ? (i > 5 ? '#ff5a3a' : '#5CFF9A') : '#2A3658', lw: 3, seed: 41 + i });
      C.text(ctx, 'VOLUMEN', 740, 1220, { size: 40, color: '#FFD22E' });
      return ['Como sabe dónde vas a tocar', 'le *baja el volumen*'];
    },
    function sorpresa(ctx, t, a) {
      C.bg(ctx, '#3A1A5A', '#7A3A9A');
      const p = pop(t, ev.sorpresa - 0.1, 0.4);
      C.text(ctx, '!', CX, 1050, { size: 520 * p, color: '#FFD22E', stroke: '#0b1030', strokeW: 20 });
      G.rays(ctx, CX, 880, { n: 18, r0: 260, r1: 300 + 120 * p, color: '#FFD22E', lw: 10, alpha: 0.6 * p });
      return ['Las cosquillas', 'necesitan *sorpresa*'];
    },
    function otra(ctx, t, a) {
      C.bg(ctx, '#1A4A3A', '#3A8A6A');
      const laugh = t > ev.risa - 0.3;
      C.person(ctx, 380, 1330, 1.1, { eyes: laugh ? 'happy' : 'wide', mouth: laugh ? { open: 0.7 + 0.3 * Math.abs(Math.sin(t * 12)), wide: 1 } : 'o', blush: laugh ? 1 : 0.3, rot: laugh ? Math.sin(t * 10) * 0.05 : 0, style: { shirt: '#FFD22E' } });
      C.person(ctx, 760, 1330, 1.1, { eyes: 'happy', mouth: 'grin', handL: [-200, -180 + Math.sin(t * 14) * 20], style: { shirt: '#7A4FA0', hairStyle: 'long' } });
      if (laugh) for (let i = 0; i < 3; i++) C.text(ctx, 'JA', 250 + i * 90, 760 - ((t * 120 + i * 60) % 180), { size: 70, color: '#FFD22E', stroke: '#0b1030', strokeW: 10 });
      return ['Si otra persona te toca', 'te *morís de risa*'];
    },
    function robot(ctx, t, a) {
      C.bg(ctx, '#0E2A3A', '#1E5A6A');
      ctx.save(); ctx.translate(720, 1000); const r = pop(t, a, 0.5); ctx.scale(r, r);
      G.rrect(ctx, -110, -60, 220, 260, 30, { fill: '#C9D6E8', lw: 6, seed: 50 }); G.rrect(ctx, -90, -230, 180, 150, 30, { fill: '#C9D6E8', lw: 6, seed: 51 });
      G.ellipse(ctx, -40, -160, 22, 22, { fill: '#19B8B2', lw: 4, seed: 52 }); G.ellipse(ctx, 40, -160, 22, 22, { fill: '#19B8B2', lw: 4, seed: 53 });
      G.limb(ctx, [[-110, 0], [-230, 40], [-330, 10 + Math.sin(t * 10) * 20]], { color: '#C9D6E8', lw: 34, outline: '#3a4a68' }); ctx.restore();
      const laugh = t > ev.sentian - 0.4;
      C.person(ctx, 280, 1330, 1.0, { eyes: laugh ? 'happy' : 'normal', mouth: laugh ? 'grin' : 'flat', blush: laugh ? 1 : 0, style: { shirt: '#FFD22E' } });
      C.pill(ctx, t, ev.robot + 0.4, 'con un poquito de retraso', CX, 640, '#19B8B2');
      return ['Con un robot que tardaba un poquito', 'las cosquillas *sí se sentían*'];
    },
  ]);
})();
