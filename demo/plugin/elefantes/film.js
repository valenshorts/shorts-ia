// Los elefantes escuchan con los pies
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = { pies: cue(0, 'pies'), grave: cue(1, 'grave'), aire: cue(1, 'aire'), suelo: cue(2, 'suelo'), kilometros: cue(2, 'kilómetros'), patas: cue(3, 'patas'),
    sensores: cue(3, 'sensores'), quietos: cue(4, 'quietos'), levantada: cue(4, 'levantada'), peligros: cue(5, 'peligros'), manada: cue(5, 'manada') };
  function eleph(ctx, x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(o.flip ? -s : s, s);
    const lift = o.lift || 0;
    for (const [lx, k] of [[-110, 0], [-40, 1], [60, 0], [130, 0]]) G.limb(ctx, [[lx, -40], [lx, 90 - (k ? lift * 60 : 0)]], { color: '#8A94A8', lw: 62, outline: '#3a4058' });
    G.ellipse(ctx, 0, -120, 220, 140, { fill: '#9AA4B8', lw: 7, seed: 1, hatch: { color: 'rgba(0,0,0,0.08)', gap: 14 } });
    G.ellipse(ctx, 210, -200, 100, 95, { fill: '#9AA4B8', lw: 6, seed: 2 });
    G.ellipse(ctx, 160, -200, 70, 100, { fill: '#8A94A8', lw: 5, seed: 3 });
    const tr = o.trumpet || 0;
    G.limb(ctx, [[280, -180], [330, -80 - 80 * tr], [320 + 40 * tr, 20 - 200 * tr]], { color: '#9AA4B8', lw: 40, outline: '#3a4058' });
    G.ellipse(ctx, 250, -225, 8, 10, { fill: '#111', lw: 0, seed: 4 });
    G.limb(ctx, [[-215, -140], [-250, -60]], { color: '#8A94A8', lw: 12, outline: '#3a4058' });
    ctx.restore();
  }
  const ground = (ctx) => G.poly(ctx, [[-50, 1200], [1130, 1200], [1130, 2000], [-50, 2000]], { fill: '#C99A5A', lw: 6, seed: 10 });
  const rings = (ctx, t, x, y, k, col = '#FFD22E') => { for (let i = 0; i < 4; i++) { const p = ((t * 0.7 + i / 4) % 1); ctx.save(); ctx.globalAlpha = k * (1 - p); ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(x, y, 80 + p * 700, 20 + p * 120, 0, 0, 7); ctx.stroke(); ctx.restore(); } };
  C.film([
    function pies(ctx, t, a) {
      C.bg(ctx, '#E8823A', '#F4C46A'); ground(ctx);
      eleph(ctx, CX - 60, 1150, 1.25 * pop(t, a, 0.5), t);
      const k = fade(t, ev.pies - 0.2);
      for (const x of [CX - 200, CX + 100]) { ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = '#FFD22E'; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(x, 1260, 70, 30, 0, 0, 7); ctx.stroke(); ctx.restore(); }
      return ['Los elefantes pueden escuchar', 'con los *pies*'];
    },
    function grave(ctx, t, a) {
      C.bg(ctx, '#C9763A', '#F4B46A'); ground(ctx);
      const tr = out(t, ev.grave - 0.3, 0.4);
      eleph(ctx, 360, 1150, 1.0, t, { trumpet: tr });
      for (let i = 0; i < 3; i++) { const p = ((t * 0.8 + i / 3) % 1); ctx.save(); ctx.globalAlpha = fade(t, ev.grave) * (1 - p); ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(720, 700, 60 + p * 260, -0.6, 0.6); ctx.stroke(); ctx.restore(); }
      C.pill(ctx, t, ev.grave, 'sonido muy grave', 760, 1000, '#FFD22E');
      return ['Hacen un sonido muy grave', 'que no solo viaja por el *aire*'];
    },
    function suelo(ctx, t, a) {
      C.bg(ctx, '#3A7AC0', '#A0D0F0'); ground(ctx);
      eleph(ctx, 260, 1150, 0.7, t, { trumpet: 0.6 });
      rings(ctx, t, 260, 1250, fade(t, ev.suelo - 0.3));
      G.line(ctx, [[260, 1330], [980, 1330]], { color: '#5a3a1a', lw: 6, seed: 20 });
      C.pill(ctx, t, ev.kilometros, 'varios kilómetros', 700, 1300, '#FFD22E');
      return ['También viaja por el suelo', 'a varios *kilómetros*'];
    },
    function patas(ctx, t, a) {
      C.bg(ctx, '#2A1A0E', '#6A4A2A');
      ctx.save(); ctx.translate(CX, 1000); G.limb(ctx, [[0, -380], [0, 120]], { color: '#8A94A8', lw: 260, outline: '#3a4058' }); G.ellipse(ctx, 0, 160, 170, 60, { fill: '#7A8498', lw: 6, seed: 30 });
      for (let i = 0; i < 7; i++) { const on = t > ev.sensores + i * 0.08; G.ellipse(ctx, -120 + i * 40, 150, 14, 14, { fill: on ? '#FFD22E' : '#5a6070', lw: 3, seed: 31 + i }); if (on) C.glow(ctx, -120 + i * 40, 150, 40, '255,210,46', 0.6); } ctx.restore();
      rings(ctx, t, CX, 1180, 1);
      C.pill(ctx, t, ev.sensores, 'sensores especiales', CX, 640, '#FFD22E');
      return ['La sienten en las patas', 'con *sensores* especiales'];
    },
    function quietos(ctx, t, a) {
      C.bg(ctx, '#E8823A', '#F4C46A'); ground(ctx);
      eleph(ctx, CX - 40, 1150, 1.15, t, { lift: out(t, ev.levantada - 0.3, 0.5) });
      rings(ctx, t, CX + 600, 1250, 0.7, '#fff');
      C.pill(ctx, t, ev.quietos, 'quietos, escuchando', CX, 700, '#FFD22E');
      return ['Se quedan quietos', 'con una *pata levantada*'];
    },
    function manada(ctx, t, a) {
      C.bg(ctx, '#3A1A4A', '#E8823A'); ground(ctx);
      eleph(ctx, 250, 1150, 0.6, t, { trumpet: 0.5 }); eleph(ctx, 830, 1170, 0.55, t, { flip: true }); eleph(ctx, 960, 1200, 0.4, t, { flip: true });
      rings(ctx, t, 250, 1250, 1); rings(ctx, t, 830, 1260, 0.6, '#fff');
      C.pill(ctx, t, ev.peligros, 'se avisan de peligros', CX, 700, '#ff5a3a');
      return ['Así se avisan', 'y encuentran a su *manada*'];
    },
  ]);
})();
