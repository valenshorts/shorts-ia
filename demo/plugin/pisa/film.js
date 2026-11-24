// Por qué no se cae la Torre de Pisa
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = { caerse: cue(0, 'caerse'), tierra: cue(0, 'tierra'), inclinarse: cue(1, 'inclinarse'), ochocientos: cue(1, 'ochocientos'), blando: cue(2, 'blando'),
    hundio: cue(2, 'hundió'), siglos: cue(3, 'siglos'), ingenieros: cue(4, 'ingenieros'), sacaron: cue(4, 'sacaron'), enderezo: cue(5, 'enderezó'), segura: cue(5, 'segura') };
  // la torre: lean en radianes, h = cuántos pisos hay (para la construcción)
  function tower(ctx, x, y, s, lean, h = 8) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(lean); ctx.scale(s, s);
    for (let i = 0; i < h; i++) { const yy = -i * 95;
      G.rrect(ctx, -120, yy - 95, 240, 95, 6, { fill: i === 7 ? '#E8DCC0' : '#F4ECD8', lw: 5, seed: 1 + i });
      for (let k = 0; k < 5; k++) G.rrect(ctx, -100 + k * 42, yy - 80, 26, 60, 13, { fill: '#C9B898', lw: 3, seed: 20 + i * 5 + k }); }
    ctx.restore();
  }
  function ground(ctx, soft = 0, dig = 0) {
    G.poly(ctx, [[-50, 1200], [1130, 1200], [1130, 2000], [-50, 2000]], { fill: soft ? '#9A7A4A' : '#6A8A4A', lw: 6, seed: 50 });
    if (soft) for (let i = 0; i < 30; i++) G.ellipse(ctx, (i * 71) % 1080, 1230 + (i * 37) % 160, 8, 6, { fill: '#C9A36A', lw: 0, seed: 60 + i });
    if (dig) G.ellipse(ctx, CX - 150, 1215, 120 * dig, 40 * dig, { fill: '#3a2a1a', lw: 4, seed: 90 });
  }
  C.film([
    function salvaron(ctx, t, a) {
      C.bg(ctx, '#3A7AC0', '#A0D0F0');
      ground(ctx);
      const wob = Math.sin(t * 3) * 0.02 * fade(t, ev.caerse - 0.3);
      tower(ctx, CX, 1200, 0.82 * pop(t, a, 0.5), 0.12 + wob);
      C.pill(ctx, t, ev.caerse, 'casi se cae', 800, 640, '#ff5a3a');
      return ['La Torre de Pisa', 'estuvo a punto de *caerse*'];
    },
    function inclinarse(ctx, t, a, b) {
      C.bg(ctx, '#C98E5A', '#F4D0A0');
      ground(ctx);
      const p = clamp((t - a) / (b - a));
      tower(ctx, CX, 1200, 0.82, 0.03 * p, Math.min(8, 2 + Math.floor(p * 7)));
      C.person(ctx, 210, 1330, 0.6, { gesture: 'think', eyes: 'worried', style: { outfit: 'kameez', shirt: '#8A5A3A' } });
      C.pill(ctx, t, ev.ochocientos, 'hace más de 800 años', CX, 640, '#FFD22E');
      return ['Empezó a inclinarse', 'cuando la *estaban construyendo*'];
    },
    function suelo(ctx, t, a) {
      C.bg(ctx, '#3A7AC0', '#A0D0F0');
      ground(ctx, 1);
      const sink = out(t, ev.hundio - 0.3, 1);
      tower(ctx, CX, 1200 + 30 * sink, 0.78, 0.04 + 0.06 * sink);
      C.pill(ctx, t, ev.blando, 'suelo blando', 280, 1300, '#C9A36A');
      return ['El suelo es blando', 'y un lado se *hundió* más'];
    },
    function siglos(ctx, t, a, b) {
      C.bg(ctx, '#1A2A5A', '#4A6AA0');
      ground(ctx, 1);
      const p = clamp((t - a) / (b - a));
      tower(ctx, CX, 1200, 0.78, 0.1 + 0.08 * p);
      const yr = Math.round(lerp(1200, 1990, p));
      C.text(ctx, String(yr), 820, 700, { size: 90, color: '#FFD22E', stroke: '#0b1030', strokeW: 10 });
      return ['Durante siglos', 'se fue *inclinando* cada vez más'];
    },
    function ingenieros(ctx, t, a) {
      C.bg(ctx, '#3A7AC0', '#A0D0F0');
      const d = out(t, ev.sacaron - 0.2, 1.4);
      ground(ctx, 1, d);
      tower(ctx, CX, 1200, 0.78, 0.18 - 0.06 * d);
      C.person(ctx, 820, 1330, 0.7, { gesture: 'point', eyes: 'focus', style: { hairStyle: 'short', shirt: '#FFB020', headwear: 'cap', headwearColor: '#FFD22E' } });
      for (let i = 0; i < 5; i++) { const p = ((t * 0.8 + i / 5) % 1); G.ellipse(ctx, CX - 150 + p * 300, 1200 - Math.sin(p * Math.PI) * 120, 14, 10, { fill: '#7A5A2A', lw: 2, seed: 70 + i, alpha: fade(t, ev.sacaron) }); }
      C.pill(ctx, t, ev.sacaron, 'sacaron tierra del lado alto', CX, 640, '#FFD22E');
      return ['Los ingenieros', '*sacaron tierra* con cuidado'];
    },
    function enderezo(ctx, t, a) {
      C.bg(ctx, '#3A7AC0', '#A0D0F0');
      ground(ctx);
      const p = out(t, ev.enderezo - 0.2, 1.2);
      tower(ctx, CX, 1200, 0.78, 0.12 - 0.02 * p);
      C.pill(ctx, t, ev.enderezo, 'se enderezó 40 cm', CX, 640, '#5CFF9A');
      for (let i = 0; i < 6; i++) G.star(ctx, CX + Math.cos(i + t) * 360, 900 + Math.sin(i + t) * 300, 16 * fade(t, ev.segura), { fill: '#FFD22E', rot: t });
      return ['Hoy es', 'más *segura* que nunca'];
    },
  ]);
})();
