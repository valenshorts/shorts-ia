// La frutilla no es una baya, la banana sí
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = { baya: cue(0, 'baya'), banana: cue(0, 'banana'), flor: cue(1, 'flor'), semillas: cue(1, 'semillas'), uva: cue(2, 'uva'), tomate: cue(2, 'tomate'), regla: cue(2, 'regla'),
    frutilla: cue(2, 'frutilla'), puntitos: cue(3, 'puntitos'), fruta: cue(3, 'fruta'), cientos: cue(4, 'cientos') };
  function straw(ctx, x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    G.poly(ctx, [[-150, -100], [-120, -150], [0, -170], [120, -150], [150, -100], [120, 40], [40, 170], [0, 190], [-40, 170], [-120, 40]], { fill: '#E8302A', lw: 7, seed: 1 });
    for (let i = 0; i < 5; i++) { const a = -2.4 + i * 0.45; G.poly(ctx, [[0, -160], [Math.cos(a) * 130, -160 + Math.sin(a) * 50], [Math.cos(a + 0.2) * 60, -170]], { fill: '#4E8A3A', lw: 4, seed: 2 + i }); }
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5 - (r > 2 ? r - 2 : 0); c++) { const px = -100 + c * 50 + (r % 2) * 25 + (r > 2 ? (r - 2) * 25 : 0), py = -100 + r * 55;
      const big = o.zoom ? 1 + 0.6 * o.zoom : 1; G.ellipse(ctx, px, py, 8 * big, 11 * big, { fill: o.glow ? '#FFD22E' : '#F4E080', lw: 2, seed: 20 + r * 5 + c }); }
    ctx.restore();
  }
  function banana(ctx, x, y, s, r) { ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(s, s); G.limb(ctx, [[-160, -60], [-60, 40], [80, 40], [170, -60]], { color: '#FFD22E', lw: 80, outline: '#8A6A0A' }); G.rrect(ctx, 160, -90, 30, 40, 6, { fill: '#6A4A1A', lw: 3, seed: 30 }); ctx.restore(); }
  function stamp(ctx, x, y, k, ok) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(ok ? -0.15 : 0.15);
    G.ellipse(ctx, 0, 0, 80, 80, { fill: ok ? '#4E9A5A' : '#D8402A', lw: 6, seed: ok ? 40 : 41 }); C.text(ctx, ok ? '✓' : '✗', 0, 30, { size: 90, color: '#fff', shadow: false }); ctx.restore(); }
  C.film([
    function baya(ctx, t, a) {
      C.bg(ctx, '#3A1A2A', '#7A2A4A');
      straw(ctx, 320, 1000, 1.25 * pop(t, a, 0.5), t); banana(ctx, 780, 1000, 1.05 * pop(t, ev.banana - 0.2, 0.5), 0.3);
      stamp(ctx, 320, 760, pop(t, ev.baya + 0.1), false); stamp(ctx, 780, 760, pop(t, ev.banana + 0.2), true);
      return ['Para la ciencia', 'la frutilla no es baya; *la banana sí*'];
    },
    function flor(ctx, t, a) {
      C.bg(ctx, '#0E3A2A', '#2E7A5A');
      const g = out(t, ev.flor + 0.6, 1.2);
      ctx.save(); ctx.translate(CX, 940);
      for (let i = 0; i < 6; i++) { const ang = i * 1.05 + t * 0.3; ctx.save(); ctx.globalAlpha = 1 - g; G.ellipse(ctx, Math.cos(ang) * 110, Math.sin(ang) * 110, 90, 60, { fill: '#F4F7FB', lw: 5, seed: 50 + i }); ctx.restore(); }
      G.ellipse(ctx, 0, 0, 70 + 120 * g, 70 + 140 * g, { fill: g > 0.5 ? '#8A4ABA' : '#FFD22E', lw: 6, seed: 60 });
      if (t > ev.semillas) for (let i = 0; i < 6; i++) G.ellipse(ctx, Math.cos(i) * 70 * g, Math.sin(i) * 80 * g, 12, 16, { fill: '#F4E0A0', lw: 3, seed: 70 + i });
      ctx.restore();
      C.pill(ctx, t, ev.flor, 'una sola flor', CX, 620, '#FFD22E'); C.pill(ctx, t, ev.semillas, 'semillas adentro', CX, 1260, '#F4E0A0');
      return ['Una baya sale de una sola flor', 'con las *semillas adentro*'];
    },
    function regla(ctx, t, a) {
      C.bg(ctx, '#1A2A4A', '#3A5A8A');
      banana(ctx, 200, 1000, 0.45, 0.2);
      ctx.save(); ctx.translate(430, 1000); for (let i = 0; i < 5; i++) G.ellipse(ctx, (i % 3) * 50 - 50, Math.floor(i / 3) * 50, 30, 30, { fill: '#8A4ABA', lw: 4, seed: 80 + i, alpha: fade(t, ev.uva - 0.2) }); ctx.restore();
      G.ellipse(ctx, 650, 1000, 80 * fade(t, ev.tomate - 0.2), 70 * fade(t, ev.tomate - 0.2), { fill: '#E8442A', lw: 5, seed: 90 });
      straw(ctx, 900, 1000, 0.45 * pop(t, ev.frutilla - 0.3), t);
      [200, 430, 650].forEach((x, i) => stamp(ctx, x, 800, pop(t, ev.regla + i * 0.1) * 0.7, true));
      stamp(ctx, 900, 800, pop(t, ev.frutilla + 0.2) * 0.7, false);
      return ['La banana, la uva y el tomate', 'cumplen la regla; *la frutilla no*'];
    },
    function puntitos(ctx, t, a) {
      C.bg(ctx, '#3A1A2A', '#7A2A4A');
      const z = out(t, ev.puntitos - 0.3, 1);
      straw(ctx, CX, 960, 1.5 + 0.8 * z, t, { zoom: z, glow: t > ev.fruta });
      C.pill(ctx, t, ev.puntitos, 'no son semillas', CX, 600, '#ff5a3a');
      C.pill(ctx, t, ev.fruta, 'cada uno es una fruta', CX, 1310, '#FFD22E');
      return ['Esos puntitos', 'no son *semillas*'];
    },
    function cientos(ctx, t, a) {
      C.bg(ctx, '#3A1A2A', '#7A2A4A');
      straw(ctx, CX, 980, 1.3, t, { glow: true });
      C.count(ctx, t, ev.cientos - 0.4, 200, CX, 700, { size: 130, pre: '+' });
      C.person(ctx, 180, 1330, 0.7, { eyes: 'wide', mouth: 'open', style: { shirt: '#19B8B2' } });
      return ['Cuando comés una frutilla', 'comés *cientos de frutitas*'];
    },
  ]);
})();
