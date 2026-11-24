// Por qué te suenan las tripas
(function () {
  const G = globalThis.G, Ch = globalThis.Ch, L = globalThis.L;
  const { CX, YEL, fade, pop, ramp, head, head2, pill, bg, glow, cue, lerp, clamp, big } = L;
  const ME = { hairStyle: 'short', hair: '#2a1a10', outfit: 'tee', shirt: '#FFD22E', skin: '#E9B48A', build: 'regular' };
  const T = { ham: cue(0, 'hambre'), ondas: cue(1, 'ondas'), emp: cue(1, 'empujar'), lleno: cue(2, 'lleno'), vac: cue(2, 'vacío'), fue: cue(2, 'fuerte'),
    dos: cue(3, 'dos'), limp: cue(3, 'limpieza'), rug: cue(4, 'rugido'), bar: cue(4, 'barriendo') };
  // intestino serpenteante; squeeze = fase de la onda; fill 0..1 cuánta comida
  function gut(ctx, t, x, y, s, fill, wave, gas) {
    const pts = [];
    for (let i = 0; i <= 80; i++) { const u = i / 80, row = Math.floor(u * 4), f = (u * 4) % 1, dir = row % 2 ? -1 : 1;
      pts.push([x + dir * (f - 0.5) * 560 * s, y - 220 * s + row * 150 * s + Math.sin(f * Math.PI) * 30 * s]); }
    for (let i = 0; i < pts.length; i++) { const sq = 1 - 0.45 * Math.max(0, Math.sin(i * 0.35 - t * wave)); const r = 58 * s * sq;
      G.ellipse(ctx, pts[i][0], pts[i][1], r, r, { fill: '#F08A9A', lw: 0.01, seed: 300 + i, stroke: 'rgba(0,0,0,0)' }); }
    for (let i = 0; i < pts.length; i += 2) { const sq = 1 - 0.45 * Math.max(0, Math.sin(i * 0.35 - t * wave));
      if ((i / 80) < fill) G.ellipse(ctx, pts[i][0], pts[i][1], 28 * s * sq, 28 * s * sq, { fill: '#b8743a', lw: 2, seed: 400 + i });
      else if (gas) G.ellipse(ctx, pts[i][0] + Math.sin(t * 5 + i) * 6, pts[i][1], 18 * s, 18 * s, { fill: 'rgba(220,240,255,0.8)', lw: 2, seed: 500 + i }); }
    G.line(ctx, pts, { color: '#b8506a', lw: 5, seed: 600, step: 14 });
  }
  function soundwaves(ctx, t, x, y, k, col) { for (let i = 0; i < 3; i++) { const p = (t * 1.4 + i / 3) % 1; ctx.save(); ctx.globalAlpha = (1 - p) * k; G.line(ctx, Array.from({ length: 9 }, (_, j) => [x + (j - 4) * 30 * (1 + p * 2), y - Math.cos((j - 4) / 4 * 1.4) * (40 + p * 160)]), { color: col || YEL, lw: 7, seed: 700 + i }); ctx.restore(); } }
  L.film([
    function suenan(ctx, t, a) {
      bg(ctx, '#2a1430', '#5a2a4a');
      const h = fade(t, T.ham - 0.1, 0.3);
      Ch.person(ctx, { x: CX, y: 1270, pose: 'stand', s: 1.1 * pop(t, a, 0.5), eyes: 'wide', mouth: 'o', brows: 'worried', blush: 0.5, style: ME, handL: [-60, -150], handR: [60, -150] });
      soundwaves(ctx, t, CX, 1050, 1);
      L.font(ctx, 90, 900); ctx.save(); ctx.fillStyle = YEL; ctx.textAlign = 'center'; ctx.globalAlpha = 0.8 + 0.2 * Math.sin(t * 8); ctx.fillText('GRRR', CX + 260 + Math.sin(t * 30) * 4, 760); ctx.restore();
      pill(ctx, t, T.ham, 'no solo es hambre', 300, 640, YEL);
      head(ctx, t, 'Las tripas te suenan', '*todo* el tiempo', a + 0.05);
    },
    function ondas(ctx, t, a) {
      bg(ctx, '#3a1a14', '#7a3a2a');
      gut(ctx, t, CX, 930, 1, 0.6 + 0.1 * Math.sin(t), 4 * fade(t, T.ondas - 0.3, 0.4) + 0.5, true);
      pill(ctx, t, T.emp, 'comida · líquido · aire', CX, 1300, YEL);
      head2(ctx, t, a, 'Tu intestino se aprieta', 'en *ondas*', T.emp - 0.1, 'para empujar', 'la *comida*');
    },
    function lleno(ctx, t, a) {
      const vac = fade(t, T.vac - 0.2, 0.4);
      bg(ctx, vac > 0.5 ? '#0c1d3a' : '#2a1a10', vac > 0.5 ? '#24447a' : '#5a3a1a');
      gut(ctx, t, CX, 900, 0.9, lerp(1, 0, vac), 4, vac > 0.5);
      soundwaves(ctx, t, CX, 1250, lerp(0.15, 1, ramp(t, T.fue - 0.3, 0.3)), vac > 0.5 ? YEL : '#c9a06a');
      pill(ctx, t, T.lleno, 'lleno = silencio', 280, 600, '#b8743a', T.vac - 0.2);
      pill(ctx, t, T.vac, 'vacío = ¡ruido!', 280, 600, YEL);
      head2(ctx, t, a, 'Cuando está lleno', 'la comida *amortigua*', T.vac - 0.1, 'Cuando está vacío', 'suena más *fuerte*');
    },
    function limpieza(ctx, t, a) {
      bg(ctx, '#0a1a2a', '#1a3a5a');
      G.ellipse(ctx, 280, 820, 150, 150, { fill: '#f4f0e8', lw: 6, seed: 800 });
      const ang = (t - a) * 3;
      G.line(ctx, [[280, 820], [280, 720]], { color: '#1a0d08', lw: 8, seed: 801 });
      G.line(ctx, [[280, 820], [280 + Math.sin(ang) * 110, 820 - Math.cos(ang) * 110]], { color: '#ff5a3a', lw: 8, seed: 802 });
      big(ctx, t, T.dos, '2 H', 280, 1060, 110);
      const k = ramp(t, T.limp - 0.3, 0.4);
      ctx.save(); ctx.translate(640, 900); ctx.scale(0.6, 0.6); ctx.translate(-640, -900); gut(ctx, t, 640, 900, 1, 0.1, 3 + 6 * k, true); ctx.restore();
      pill(ctx, t, T.limp, 'ondas de limpieza', 680, 1240, YEL);
      head2(ctx, t, a, 'Unas 2 horas', 'después de *comer*', T.limp - 0.1, 'el intestino hace', 'una *limpieza*');
    },
    function barriendo(ctx, t, a) {
      bg(ctx, '#1d0f0a', '#4a2414');
      const k = fade(t, T.bar - 0.3, 0.3);
      ctx.save(); ctx.translate(CX, 930); ctx.scale(0.75, 0.75); ctx.translate(-CX, -930); gut(ctx, t, CX, 930, 1, 0.05, 6, true); ctx.restore();
      const bx = CX + Math.sin(t * 4) * 160 * k;
      ctx.save(); ctx.globalAlpha = k; ctx.translate(bx, 900); ctx.rotate(Math.sin(t * 4) * 0.3);
      G.rrect(ctx, -10, -260, 20, 260, 8, { fill: '#a0703a', lw: 5, seed: 900 });
      G.poly(ctx, [[-70, 0], [70, 0], [100, 120], [-100, 120]], { fill: YEL, lw: 6, seed: 901 });
      for (let i = 0; i < 8; i++) G.line(ctx, [[-90 + i * 26, 70], [-96 + i * 27, 140]], { color: '#c9a020', lw: 4, seed: 902 + i });
      ctx.restore();
      pill(ctx, t, T.rug, 'no siempre es hambre', CX, 600, '#ff5a3a', T.bar - 0.3);
      head2(ctx, t, a, 'Ese rugido no siempre', 'es *hambre*', T.bar - 0.1, 'A veces es tu cuerpo', '*barriendo*');
    },
  ]);
})();
