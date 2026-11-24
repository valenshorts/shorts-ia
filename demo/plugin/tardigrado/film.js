// El osito de agua sobrevive en el espacio
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = { tardigrado: cue(0, 'tardígrado'), osito: cue(0, 'osito'), milimetro: cue(1, 'milímetro'), musgo: cue(1, 'musgo'), nave: cue(2, 'nave'), vacio: cue(2, 'vacío'),
    vivos: cue(2, 'vivos'), secarse: cue(3, 'secarse'), pelotita: cue(3, 'pelotita'), anios: cue(3, 'años'), gota: cue(4, 'gota'), caminar: cue(4, 'caminar') };
  // el osito de agua; dry = 0..1 (se seca y se hace pelotita)
  function tardi(ctx, x, y, s, t, dry = 0) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 - 0.35 * dry), s * (1 - 0.1 * dry));
    const col = dry > 0.5 ? '#C9A36A' : '#E8C9B0';
    if (dry < 0.8) for (let i = 0; i < 4; i++) { const lx = -150 + i * 100, w = Math.sin(t * 6 + i) * 10 * (1 - dry); G.limb(ctx, [[lx, 40], [lx + w, 110 * (1 - dry)]], { color: col, lw: 46, outline: '#7a5a3a' }); }
    G.ellipse(ctx, 0, 0, 230 - 90 * dry, 110 + 30 * dry, { fill: col, lw: 6, seed: 1, hatch: { color: 'rgba(120,80,40,0.15)', gap: 14 } });
    for (let i = 0; i < 4; i++) G.line(ctx, [[-120 + i * 80, -100 + 20 * dry], [-110 + i * 80, 100 - 20 * dry]], { color: 'rgba(150,100,60,0.5)', lw: 5, seed: 10 + i });
    if (dry < 0.6) { G.ellipse(ctx, 200 - 60 * dry, -10, 60, 55, { fill: col, lw: 5, seed: 20 }); G.ellipse(ctx, 215, -30, 8, 9, { fill: '#111', lw: 0, seed: 21 }); G.ellipse(ctx, 240, 5, 14, 10, { fill: '#B85A5A', lw: 3, seed: 22 }); }
    ctx.restore();
  }
  C.film([
    function animal(ctx, t, a) {
      C.space(ctx, t);
      C.earth(ctx, 200, 1700, 500, t * 0.3);
      tardi(ctx, CX + Math.sin(t * 0.7) * 40, 960 + Math.cos(t * 0.9) * 30, 1.3 * pop(t, ev.tardigrado - 0.2, 0.6), t);
      C.pill(ctx, t, ev.osito, 'osito de agua', CX, 1250, '#5fb8ff');
      return ['Sobrevivió en el espacio', 'el *tardígrado*'];
    },
    function mide(ctx, t, a) {
      C.bg(ctx, '#0E3A1E', '#2E6A3E');
      for (let i = 0; i < 14; i++) G.limb(ctx, [[60 + i * 75, 1300], [80 + i * 75 + Math.sin(t + i) * 10, 1080 - (i % 3) * 60]], { color: ['#4E8A3A', '#5AAA4A'][i % 2], lw: 40, outline: '#1a3a1a' });
      tardi(ctx, CX, 900, 0.9, t);
      G.line(ctx, [[CX - 230, 1060], [CX + 260, 1060]], { color: '#FFD22E', lw: 6, seed: 30 });
      C.pill(ctx, t, ev.milimetro, 'menos de 1 mm', CX, 640, '#FFD22E');
      C.pill(ctx, t, ev.musgo, 'vive en el musgo', CX, 1180, '#5AAA4A');
      return ['Mide menos de 1 milímetro', 'y vive en el *musgo*'];
    },
    function nave(ctx, t, a) {
      C.space(ctx, t);
      ctx.save(); ctx.translate(320, 760); G.rrect(ctx, -200, -80, 400, 160, 60, { fill: '#C9D6E8', lw: 6, seed: 40 }); G.rrect(ctx, 200, -40, 120, 80, 10, { fill: '#9AB0C8', lw: 5, seed: 41 }); G.ellipse(ctx, -60, 0, 40, 40, { fill: '#2B4A7A', lw: 4, seed: 42 }); ctx.restore();
      const k = out(t, ev.nave - 0.2, 1);
      for (let i = 0; i < 4; i++) tardi(ctx, lerp(500, 620 + i * 110, k), lerp(780, 1050 + (i % 2) * 120, k), 0.32, t, t < ev.vivos ? 0.7 : 0.1);
      for (let i = 0; i < 6; i++) { const p = ((t * 0.7 + i / 6) % 1); G.line(ctx, [[1000 - p * 600, 560 + i * 40], [960 - p * 600, 580 + i * 40]], { color: '#B8E04A', lw: 6, seed: 50 + i, alpha: fade(t, ev.vacio - 0.2) * (1 - p) }); }
      C.pill(ctx, t, ev.vacio, 'vacío y radiación', 760, 640, '#B8E04A');
      C.pill(ctx, t, ev.vivos, 'volvieron vivos', CX, 1300, '#5CFF9A');
      return ['En 2007 los mandaron afuera', 'y muchos *volvieron vivos*'];
    },
    function truco(ctx, t, a) {
      C.bg(ctx, '#3A2A0E', '#7A5A1E');
      const d = out(t, ev.secarse - 0.2, 1.4);
      tardi(ctx, CX, 980, 1.25, t, d);
      if (d > 0.9) for (let i = 0; i < 6; i++) G.ellipse(ctx, CX + Math.cos(i + t * 0.3) * 260, 980 + Math.sin(i + t * 0.3) * 200, 6, 6, { fill: '#F4E0A0', lw: 0, seed: 60 + i });
      C.pill(ctx, t, ev.pelotita, 'pelotita seca', CX, 700, '#C9A36A');
      C.pill(ctx, t, ev.anios, 'aguanta años', CX, 1260, '#FFD22E');
      return ['Su truco', 'secarse como una *pelotita*'];
    },
    function agua(ctx, t, a) {
      C.bg(ctx, '#0E3A5A', '#2E7AA0');
      const w = out(t, ev.gota - 0.1, 0.6), wake = out(t, ev.caminar - 0.6, 1);
      const gy = lerp(500, 900, clamp((t - ev.gota + 0.4) / 0.5));
      if (w < 0.99) G.ellipse(ctx, CX, gy, 40, 56, { fill: '#5fb8ff', lw: 4, seed: 70 });
      if (w > 0) { G.ellipse(ctx, CX, 1060, 380 * w, 120 * w, { fill: 'rgba(95,184,255,0.45)', lw: 5, seed: 71 }); }
      tardi(ctx, CX + 200 * wake * Math.min(1, (t - ev.caminar + 0.6) * 0.3), 1000, 1.05, t * wake, 1 - wake);
      return ['Le ponés una gota de agua', 'y vuelve a *caminar*'];
    },
  ]);
})();
