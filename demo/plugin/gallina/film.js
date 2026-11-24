// Por qué se pone la piel de gallina
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = { frio: cue(0, 'frío'), emocionas: cue(0, 'emocionás'), gallina: cue(0, 'gallina'), musculo: cue(1, 'músculo'), levanta: cue(1, 'levanta'),
    aire: cue(2, 'aire'), grandes: cue(2, 'grandes'), eriza: cue(3, 'eriza'), pelo: cue(4, 'pelo'), boton: cue(5, 'botón'), peludos: cue(5, 'peludos') };
  // corte de la piel: un pelito con su músculo; up = 0..1 cuánto se levanta
  function skin(ctx, x, y, s, up, t, n = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    G.rrect(ctx, -400, 0, 800, 380, 30, { fill: '#F2C6A4', lw: 6, seed: 1, hatch: { color: 'rgba(150,80,40,0.12)', gap: 12 } });
    G.rrect(ctx, -400, 0, 800, 50, 20, { fill: '#E9A985', lw: 5, seed: 2 });
    for (let i = 0; i < n; i++) {
      const hx = n === 1 ? 0 : -300 + i * (600 / (n - 1)), th = lerp(0.35, 1.45, up) + Math.sin(t * 2 + i) * 0.04;
      G.ellipse(ctx, hx, 120, 34, 70, { fill: '#C98E66', lw: 4, seed: 10 + i });
      G.line(ctx, [[hx, 60], [hx + 280 * Math.cos(th), 60 - 280 * Math.sin(th)]], { color: '#3a2a20', lw: 12, seed: 20 + i });
      // músculo diminuto
      G.limb(ctx, [[hx + 30, 160], [hx + 110, 90 + 10 * up], [hx + 170, 60]], { color: up > 0.3 ? '#FF6B5A' : '#E58C7A', lw: 22 + 8 * up, outline: '#7a2a2a' });
      if (up > 0.3) G.ellipse(ctx, hx, 40, 50 * up, 26 * up, { fill: '#F2B894', lw: 4, seed: 30 + i }); // el bultito
    }
    ctx.restore();
  }
  function cat(ctx, x, y, s, puff, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const spikes = (cx, cy, rx, ry, k, seed) => { const pts = []; const n = 28; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, r = i % 2 ? 1 : 1 + 0.25 * k; pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]); } G.poly(ctx, pts, { fill: '#3B3B4A', lw: 5, seed }); };
    spikes(0, 0, 220 + 60 * puff, 140 + 50 * puff, puff, 1);
    G.limb(ctx, [[200, -20], [300, -160 - 40 * puff], [260, -260]], { color: '#3B3B4A', lw: 36 + 30 * puff, outline: '#15151f' });
    spikes(-230, -120, 110 + 20 * puff, 100 + 20 * puff, puff * 0.6, 2);
    G.poly(ctx, [[-300, -190], [-290, -290], [-230, -210]], { fill: '#3B3B4A', lw: 5, seed: 3 }); G.poly(ctx, [[-190, -200], [-150, -290], [-130, -190]], { fill: '#3B3B4A', lw: 5, seed: 4 });
    G.ellipse(ctx, -265, -130, 18, 22 + 6 * puff, { fill: '#FFD22E', lw: 3, seed: 5 }); G.ellipse(ctx, -195, -130, 18, 22 + 6 * puff, { fill: '#FFD22E', lw: 3, seed: 6 });
    for (const lx of [-120, -40, 60, 140]) G.limb(ctx, [[lx, 100], [lx, 230]], { color: '#3B3B4A', lw: 34, outline: '#15151f' });
    ctx.restore();
  }
  function bear(ctx, x, y, s, t, o) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const fur = (cx, cy, rx, ry, seed) => { const pts = []; for (let i = 0; i < 36; i++) { const a = (i / 36) * Math.PI * 2, r = i % 2 ? 1 : 1.12; pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]); } G.poly(ctx, pts, { fill: o, lw: 5, seed }); };
    fur(0, 0, 150, 190, 1); fur(0, -230, 100, 95, 2); G.ellipse(ctx, -70, -310, 30, 30, { fill: o, lw: 4, seed: 3 }); G.ellipse(ctx, 70, -310, 30, 30, { fill: o, lw: 4, seed: 4 });
    G.ellipse(ctx, 0, -205, 40, 30, { fill: '#E9C9A0', lw: 3, seed: 5 }); G.ellipse(ctx, -35, -250, 8, 10, { fill: '#111', lw: 0, seed: 6 }); G.ellipse(ctx, 35, -250, 8, 10, { fill: '#111', lw: 0, seed: 7 });
    ctx.restore();
  }
  C.film([
    function frio(ctx, t, a) {
      const emo = t > ev.emocionas;
      C.bg(ctx, emo ? '#3A1640' : '#123A6A', emo ? '#7A2A6A' : '#5FA8E0');
      if (!emo) for (let i = 0; i < 24; i++) { const x = (i * 97) % 1080, y = ((i * 211 + t * 120) % 1400) + 400; G.star(ctx, x, y, 8, { fill: '#FFFFFF', rot: t + i }); }
      else for (let i = 0; i < 8; i++) { const p = ((t - ev.emocionas) * 0.5 + i / 8) % 1; G.heart(ctx, 200 + (i * 113) % 700, 1250 - p * 700, 1.2); }
      C.person(ctx, CX, 1300, 1.25 * pop(t, a, 0.5), { eyes: emo ? 'happy' : 'wide', mouth: emo ? 'grin' : 'wavy', brows: emo ? 'up' : 'worried', crossArms: !emo, blush: emo ? 0.8 : 0.2, style: { shirt: '#19B8B2' } });
      const g = fade(t, ev.gallina - 0.2);
      for (let i = 0; i < 18; i++) G.ellipse(ctx, CX - 150 + (i % 6) * 60 + (Math.floor(i / 6) % 2) * 30, 960 + Math.floor(i / 6) * 50, 6 * g, 6 * g, { fill: '#C98E66', lw: 2, seed: 40 + i });
      C.pill(ctx, t, ev.gallina, 'piel de gallina', CX, 860, '#FFD22E');
      return [emo ? 'O te emocionás' : 'Cuando tenés frío', 'piel de *gallina*'];
    },
    function musculo(ctx, t, a) {
      C.bg(ctx, '#3A1E2A', '#7A3B4A');
      const up = out(t, ev.levanta - 0.2, 0.5);
      skin(ctx, CX, 820, 1.05 * pop(t, a, 0.5), up, t);
      C.pill(ctx, t, ev.musculo, 'músculo diminuto', CX + 150, 1300, '#ff5a3a');
      C.pill(ctx, t, a + 0.3, 'pelito', CX - 230, 640);
      return ['Cada pelito tiene', 'un *músculo* diminuto'];
    },
    function animales(ctx, t, a) {
      C.bg(ctx, '#0F3A2A', '#2E7A4A');
      G.poly(ctx, [[-50, 1220], [1130, 1220], [1130, 2000], [-50, 2000]], { fill: '#E8F2FF', lw: 5, seed: 50 });
      const puff = out(t, ev.aire - 0.3, 0.6);
      bear(ctx, CX, 1180, 1.25 * (1 + 0.1 * puff) * pop(t, a, 0.5), t, '#8A5A3A');
      for (let i = 0; i < 10; i++) { const ang = i / 10 * 6.28 + t * 0.5; G.ellipse(ctx, CX + Math.cos(ang) * 260, 960 + Math.sin(ang) * 300, 16 * puff, 16 * puff, { fill: '#FFB86A', lw: 2, seed: 60 + i, alpha: 0.8 }); }
      C.pill(ctx, t, ev.aire, 'atrapa aire caliente', CX, 600, '#FFB86A');
      C.pill(ctx, t, ev.grandes, 'se ve más grande', CX, 1300, '#FFD22E');
      return ['En los animales con pelo', 'atrapa *aire caliente*'];
    },
    function gato(ctx, t, a) {
      C.bg(ctx, '#2A1A3A', '#5A3A7A');
      const p = out(t, ev.eriza - 0.2, 0.25) * (1 + 0.05 * Math.sin(t * 20));
      cat(ctx, CX + 40, 1050, 1.05 * pop(t, a, 0.5), p, t);
      if (p > 0.5) G.rays(ctx, CX + 40, 1000, { n: 12, r0: 330, r1: 420, color: '#FFD22E', lw: 8, alpha: 0.6 });
      return ['Como cuando', 'un gato se *eriza*'];
    },
    function pelo(ctx, t, a) {
      C.bg(ctx, '#123A6A', '#3E7AB0');
      C.person(ctx, 330, 1300, 1.05 * pop(t, a, 0.5), { eyes: 'normal', mouth: 'smile', style: { shirt: '#FFD22E' } });
      bear(ctx, 780, 1240, 0.95 * pop(t, a + 0.2, 0.5), t, '#8A5A3A');
      C.pill(ctx, t, ev.pelo, 'casi sin pelo', 330, 780, '#5fb8ff');
      C.pill(ctx, t, ev.pelo + 0.3, 'mucho pelo', 780, 780, '#FFB86A');
      return ['Ya casi no tenemos pelo', 'pero el cuerpo *sigue igual*'];
    },
    function boton(ctx, t, a) {
      C.bg(ctx, '#1A1440', '#3A2A7A');
      const press = clamp(Math.sin(t * 4) * 0.5 + 0.5);
      G.ellipse(ctx, CX, 1000, 240, 90, { fill: '#5A1A1A', lw: 6, seed: 70 });
      G.ellipse(ctx, CX, 960 + 30 * press, 200, 75, { fill: '#ff5a3a', lw: 6, seed: 71 });
      C.text(ctx, 'PIEL DE GALLINA', CX, 980 + 30 * press, { size: 36, color: '#fff', shadow: false });
      const ap = out(t, ev.peludos - 0.4, 0.6);
      if (ap > 0) { ctx.save(); ctx.globalAlpha = ap; bear(ctx, 230, 1300, 0.6, t, '#6A4A30'); C.person(ctx, 860, 1320, 0.8, { mouth: 'smile', eyes: 'happy', style: { shirt: '#19B8B2', hairStyle: 'long', facialHair: 'beard' } }); ctx.restore(); }
      C.pill(ctx, t, ev.peludos, 'cuando éramos peludos', CX, 700, '#FFD22E');
      return ['Es un botón que quedó', 'de cuando éramos *peludos*'];
    },
  ]);
})();
