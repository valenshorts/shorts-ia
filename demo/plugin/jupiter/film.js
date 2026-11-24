// La tormenta gigante de Júpiter
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = { jupiter: cue(0, 'júpiter'), tierra: cue(0, 'tierra'), mancha: cue(1, 'mancha'), huracan: cue(2, 'huracán'), vientos: cue(2, 'vientos'), anios: cue(2, 'años'),
    achicando: cue(3, 'achicando'), desaparecer: cue(4, 'desaparecer') };
  function jupiter(ctx, x, y, r, t, spot = 1, spotK = 1) {
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
    const cols = ['#E8C9A0', '#C98E5A', '#F4E0C0', '#B8764A', '#E8C9A0', '#D8A878', '#F4E0C0', '#B8764A', '#E8C9A0'];
    cols.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(x - r, y - r + i * (2 * r / cols.length), 2 * r, 2 * r / cols.length + 2); });
    for (let i = 0; i < 9; i++) { const yy = y - r + (i + 0.5) * (2 * r / 9); const pts = []; for (let k = 0; k <= 30; k++) pts.push([x - r + k * (2 * r / 30), yy + Math.sin(k * 0.6 + t * (i % 2 ? 1 : -1) + i) * 6]); G.line(ctx, pts, { color: 'rgba(120,70,30,0.35)', lw: 4, seed: 10 + i }); }
    const sx = x + r * 0.25, sy = y + r * 0.28, sr = r * 0.22 * spot;
    ctx.save(); ctx.globalAlpha = spotK; G.ellipse(ctx, sx, sy, sr * 1.5, sr, { fill: '#C0442A', lw: 5, seed: 30 });
    for (let k = 0; k < 3; k++) { ctx.strokeStyle = 'rgba(255,200,170,0.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(sx, sy, sr * (1.2 - k * 0.35), sr * (0.8 - k * 0.23), 0, t * 2 + k, t * 2 + k + 4); ctx.stroke(); } ctx.restore();
    ctx.restore();
    G.ellipse(ctx, x, y, r, r, { fill: 'rgba(0,0,0,0)', stroke: '#5a3a1a', lw: 6, seed: 40 });
    return [sx, sy, sr];
  }
  C.film([
    function jup(ctx, t, a) {
      C.space(ctx, t);
      const r = 420 * pop(t, a, 0.6);
      const [sx, sy, sr] = jupiter(ctx, CX, 980, r, t);
      const k = pop(t, ev.tierra - 0.2, 0.5);
      if (k > 0) { C.earth(ctx, sx, sy, sr * 0.75 * k, t); C.pill(ctx, t, ev.tierra, 'la Tierra entera', sx, sy + sr + 60, '#5fb8ff'); }
      return ['En Júpiter hay una tormenta', 'más grande que *la Tierra*'];
    },
    function mancha(ctx, t, a) {
      C.space(ctx, t);
      const z = 1 + 1.4 * out(t, a, 1.6);
      ctx.save(); ctx.translate(CX, 980); ctx.scale(z, z); ctx.translate(-CX - 105 * (z - 1) / z * 1, -980 - 118 * (z - 1) / z);
      jupiter(ctx, CX, 980, 420, t); ctx.restore();
      C.pill(ctx, t, ev.mancha, 'Gran Mancha Roja', CX, 1300, '#ff5a3a');
      return ['Se llama', 'la *Gran Mancha Roja*'];
    },
    function huracan(ctx, t, a) {
      C.bg(ctx, '#3A1A0E', '#8A3A1E');
      ctx.save(); ctx.translate(CX, 960);
      for (let k = 0; k < 7; k++) { ctx.strokeStyle = ['#F4C0A0', '#E8805A', '#C0442A'][k % 3]; ctx.lineWidth = 22 - k * 2; ctx.beginPath(); ctx.ellipse(0, 0, 420 - k * 55, 260 - k * 34, 0, t * (1.5 + k * 0.3), t * (1.5 + k * 0.3) + 4.5); ctx.stroke(); }
      ctx.restore();
      C.pill(ctx, t, ev.vientos, 'cientos de km/h', 300, 640, '#FFD22E');
      C.count(ctx, t, ev.anios - 0.5, 150, CX, 1330 - 30, { size: 110, suf: ' AÑOS' });
      return ['Un huracán gigante', 'girando hace *150 años*'];
    },
    function achica(ctx, t, a, b) {
      C.space(ctx, t);
      const p = out(t, ev.achicando - 0.3, 1.6);
      jupiter(ctx, CX, 980, 420, t, 1 - 0.4 * p);
      for (let i = 0; i < 4; i++) { const ang = i * 1.57 + 0.78, r = 260 - 60 * p; G.line(ctx, [[CX + 105 + Math.cos(ang) * r, 1098 + Math.sin(ang) * r * 0.7], [CX + 105 + Math.cos(ang) * (r - 50), 1098 + Math.sin(ang) * (r - 50) * 0.7]], { color: '#FFD22E', lw: 8, seed: 50 + i, alpha: fade(t, ev.achicando - 0.2) }); }
      C.pill(ctx, t, ev.achicando, 'se está achicando', CX, 1300, '#FFD22E');
      return ['En las últimas décadas', 'se está *achicando*'];
    },
    function desaparecer(ctx, t, a) {
      C.space(ctx, t);
      const p = out(t, ev.desaparecer - 0.3, 1.2);
      jupiter(ctx, CX, 980, 420, t, 0.55, 1 - p);
      return ['Algún día esa tormenta', 'podría *desaparecer*'];
    },
  ]);
})();
