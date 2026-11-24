// La Estatua de la Libertad era marrón
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = { verde: cue(0, 'verde'), armaron: cue(1, 'armaron'), moneda: cue(1, 'moneda'), marron: cue(1, 'marrón'), capa: cue(2, 'capa'), finita: cue(2, 'finita'),
    lluvia: cue(3, 'lluvia'), oxidando: cue(3, 'oxidando'), arruina: cue(4, 'arruina'), protege: cue(4, 'protege'), pintarla: cue(5, 'pintarla') };
  const mix = (c1, c2, k) => { const a = c1.match(/\w\w/g).map((h) => parseInt(h, 16)), b = c2.match(/\w\w/g).map((h) => parseInt(h, 16)); return '#' + a.map((v, i) => Math.round(lerp(v, b[i], k)).toString(16).padStart(2, '0')).join(''); };
  // la estatua; g = 0 cobre nuevo, 1 verde
  function statue(ctx, x, y, s, g, t) {
    const col = mix('#C8743A', '#7FC4A8', g), dark = mix('#8A4A1E', '#4E9A80', g);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    G.rrect(ctx, -170, -40, 340, 140, 10, { fill: '#9AA0A8', lw: 6, seed: 1 }); G.rrect(ctx, -130, -120, 260, 90, 10, { fill: '#B0B6BE', lw: 5, seed: 2 });
    G.poly(ctx, [[-110, -120], [-80, -520], [80, -520], [120, -120]], { fill: col, lw: 6, seed: 3, hatch: { color: 'rgba(0,0,0,0.12)', gap: 14 } });
    for (let i = 0; i < 4; i++) G.line(ctx, [[-70 + i * 45, -480], [-80 + i * 50, -140]], { color: dark, lw: 5, seed: 10 + i });
    G.limb(ctx, [[60, -480], [110, -620], [120, -760]], { color: col, lw: 46, outline: dark });
    G.rrect(ctx, 95, -820, 50, 70, 10, { fill: col, lw: 5, seed: 20 }); C.glow(ctx, 120, -860, 80, '255,200,80', 0.6);
    G.ellipse(ctx, 120, -860, 26, 40 + 6 * Math.sin(t * 10), { fill: '#FFB020', lw: 4, seed: 21 });
    G.ellipse(ctx, 0, -580, 70, 80, { fill: col, lw: 6, seed: 22 });
    for (let i = 0; i < 7; i++) { const a = -2.6 + i * 0.35; G.poly(ctx, [[Math.cos(a) * 60, -600 + Math.sin(a) * 60], [Math.cos(a) * 130, -600 + Math.sin(a) * 130], [Math.cos(a + 0.12) * 60, -600 + Math.sin(a + 0.12) * 60]], { fill: col, lw: 4, seed: 30 + i }); }
    G.rrect(ctx, -110, -420, 70, 100, 8, { fill: dark, lw: 4, seed: 40 });
    ctx.restore();
  }
  function coin(ctx, x, y, r, t) { ctx.save(); ctx.translate(x, y); ctx.scale(Math.abs(Math.cos(t * 2)) * 0.8 + 0.2, 1); G.ellipse(ctx, 0, 0, r, r, { fill: '#D4824A', lw: 6, seed: 50 }); G.ellipse(ctx, 0, 0, r * 0.75, r * 0.75, { fill: 'rgba(0,0,0,0)', stroke: '#9A4A1E', lw: 5, seed: 51 }); ctx.restore(); }
  C.film([
    function verde(ctx, t, a) {
      C.bg(ctx, '#3A7AC0', '#A0D0F0');
      G.poly(ctx, [[-50, 1260], [1130, 1260], [1130, 2000], [-50, 2000]], { fill: '#2A6AA0', lw: 5, seed: 60 });
      statue(ctx, CX, 1250, 0.9 * pop(t, a, 0.5), 1, t);
      C.pill(ctx, t, ev.verde, 'no siempre fue verde', CX, 1310, '#7FC4A8');
      return ['La Estatua de la Libertad', 'no siempre fue *verde*'];
    },
    function cobre(ctx, t, a) {
      C.bg(ctx, '#C98E5A', '#F4D0A0');
      statue(ctx, 380, 1250, 0.85, 0, t);
      coin(ctx, 800, 900, 120 * pop(t, ev.moneda - 0.2, 0.5), t);
      C.pill(ctx, t, ev.armaron, '1886', 380, 620, '#FFD22E'); C.pill(ctx, t, ev.marron, 'marrón y brillante', 800, 1100, '#C8743A');
      return ['Cuando la armaron en 1886', 'era *marrón* y brillante'];
    },
    function capa(ctx, t, a) {
      C.bg(ctx, '#1A2A4A', '#3A5A8A');
      G.rrect(ctx, 140, 820, 800, 300, 20, { fill: '#9AA0A8', lw: 6, seed: 70 });
      const k = out(t, ev.finita - 0.4, 0.8);
      G.rrect(ctx, 140, 800 - 6 * k, 800, 30 - 20 * k + 6, 6, { fill: '#C8743A', lw: 5, seed: 71 });
      C.text(ctx, '2,4 mm', CX, 760, { size: 70, color: '#FFD22E', stroke: '#0b1030', strokeW: 10, alpha: fade(t, ev.finita) });
      C.pill(ctx, t, ev.capa, 'capa de cobre', CX, 1200, '#C8743A');
      return ['Está hecha de una capa', 'de cobre muy *finita*'];
    },
    function oxidando(ctx, t, a, b) {
      C.bg(ctx, '#2A3A5A', '#5A7A9A');
      for (let i = 0; i < 30; i++) G.line(ctx, [[(i * 71 + t * 200) % 1100, (i * 113 + t * 900) % 1400 + 400], [(i * 71 + t * 200) % 1100 - 10, (i * 113 + t * 900) % 1400 + 440]], { color: '#BDE6FF', lw: 4, seed: 80 + i, alpha: fade(t, ev.lluvia - 0.3) * 0.7 });
      const g = clamp((t - ev.lluvia) / (b - ev.lluvia));
      statue(ctx, CX, 1250, 0.9, g, t);
      C.count(ctx, t, ev.lluvia, 30, 830, 700, { size: 70, suf: ' AÑOS', dur: b - ev.lluvia });
      return ['La lluvia, el aire y la sal', 'la fueron *oxidando*'];
    },
    function protege(ctx, t, a) {
      C.bg(ctx, '#0E3A2A', '#2E7A5A');
      statue(ctx, CX, 1250, 0.9, 1, t);
      const k = out(t, ev.protege - 0.2, 0.5);
      ctx.save(); ctx.globalAlpha = k * 0.8; ctx.strokeStyle = '#5CFF9A'; ctx.lineWidth = 12; ctx.setLineDash([24, 14]); ctx.beginPath(); ctx.ellipse(CX, 900, 260, 470, 0, 0, 7); ctx.stroke(); ctx.restore();
      C.pill(ctx, t, ev.protege, 'la protege', 840, 700, '#5CFF9A');
      return ['Esa capa no la arruina', 'al contrario: la *protege*'];
    },
    function pintarla(ctx, t, a) {
      C.bg(ctx, '#3A7AC0', '#A0D0F0');
      statue(ctx, 420, 1250, 0.85, 1, t);
      const k = pop(t, ev.pintarla - 0.2, 0.4);
      ctx.save(); ctx.translate(800, 980); ctx.scale(k, k); G.rrect(ctx, -60, -40, 120, 140, 14, { fill: '#C9D6E8', lw: 5, seed: 90 }); G.limb(ctx, [[0, -40], [0, -160]], { color: '#8A5A3A', lw: 20, outline: '#3a1a0a' }); G.rrect(ctx, -40, -230, 80, 80, 10, { fill: '#ff5a3a', lw: 5, seed: 91 });
      G.ellipse(ctx, 0, 0, 160, 160, { fill: 'rgba(0,0,0,0)', stroke: '#ff5a3a', lw: 16, seed: 92 }); G.line(ctx, [[-110, -110], [110, 110]], { color: '#ff5a3a', lw: 16, seed: 93 }); ctx.restore();
      return ['Por eso decidieron', 'no *pintarla* nunca'];
    },
  ]);
})();
