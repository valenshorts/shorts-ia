// Tu corazón late 100 mil veces por día
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = { late: cue(0, 'late'), cien: cue(0, 'cien'), descanso: cue(1, 'descanso'), millones: cue(2, 'millones'), empuja: cue(3, 'empuja'),
    fila: cue(3, 'fila'), vueltas: cue(3, 'vueltas'), generador: cue(4, 'generador'), saquen: cue(5, 'saquen'), oxigeno: cue(5, 'oxígeno') };
  const beat = (t) => { const p = (t * 1.25) % 1; return Math.exp(-p * 9) + 0.6 * Math.exp(-Math.max(0, p - 0.18) * 12) * (p > 0.18 ? 1 : 0); };
  function heart(ctx, x, y, s, t, o = {}) {
    const b = 1 + 0.08 * beat(t);
    ctx.save(); ctx.translate(x, y); ctx.scale(s * b, s * b);
    C.glow(ctx, 0, 0, 260, '255,90,90', 0.35);
    const pts = []; for (let i = 0; i <= 60; i++) { const a = (i / 60) * Math.PI * 2; pts.push([16 * Math.pow(Math.sin(a), 3) * 11, -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 11]); }
    G.poly(ctx, pts, { fill: '#E8423A', lw: 7, seed: 1, hatch: { color: 'rgba(120,0,0,0.18)', gap: 12 } });
    G.limb(ctx, [[-40, -120], [-50, -200]], { color: '#5A8AE0', lw: 34, outline: '#1a2a5a' });
    G.limb(ctx, [[20, -130], [40, -210], [110, -230]], { color: '#E8423A', lw: 40, outline: '#5a1010' });
    if (o.spark) { const p = (t * 1.25) % 1; G.line(ctx, [[-20, -60], [-60, -10], [-10, 0], [-40, 60]], { color: '#FFD22E', lw: 10, seed: 5, alpha: 1 - p }); }
    ctx.restore();
  }
  function ecg(ctx, t, y, col = '#5CFF9A') {
    const pts = []; for (let x = 60; x <= 1020; x += 8) { const u = ((x - 60) / 240 - t * 1.25) % 1, v = (u + 1) % 1;
      let dy = 0; if (v > 0.4 && v < 0.44) dy = -160 * Math.sin((v - 0.4) / 0.04 * Math.PI); else if (v > 0.44 && v < 0.48) dy = 60 * Math.sin((v - 0.44) / 0.04 * Math.PI); pts.push([x, y + dy]); }
    G.line(ctx, pts, { color: col, lw: 7, seed: 9, step: 8 });
  }
  C.film([
    function late(ctx, t, a) {
      C.bg(ctx, '#2A0A1A', '#6A1A2A');
      heart(ctx, CX, 860, 1.0 * pop(t, a, 0.5), t);
      ecg(ctx, t, 1230);
      C.count(ctx, t, ev.cien - 0.2, 100000, CX, 600, { size: 130, dur: 1.2 });
      C.pill(ctx, t, ev.cien + 0.6, 'latidos por día', CX, 650 + 20, '#FFD22E');
      return ['Tu corazón late', '*100.000* veces por día'];
    },
    function descanso(ctx, t, a) {
      C.bg(ctx, '#0E1A3A', '#22365E');
      G.ellipse(ctx, 840, 520, 60, 60, { fill: '#F4E9B8', lw: 5, seed: 20 }); // luna
      G.rrect(ctx, 120, 1060, 840, 140, 30, { fill: '#5A4AA0', lw: 6, seed: 21 }); G.rrect(ctx, 140, 980, 220, 110, 40, { fill: '#F4F7FB', lw: 5, seed: 22 });
      C.person(ctx, 520, 1100, 0.9, { pose: 'sit', eyes: 'sleep', mouth: 'sleep', blanket: true, style: { shirt: '#3E6FB0' } });
      heart(ctx, 560, 770, 0.32, t);
      for (let i = 0; i < 3; i++) { const p = ((t * 0.5 + i / 3) % 1); C.text(ctx, 'z', 700 + p * 80, 900 - p * 200, { size: 60 + i * 10, color: '#cfe0ff', alpha: 1 - p, shadow: false }); }
      ecg(ctx, t, 1300, '#5CFF9A');
      return ['Sin descanso', 'y *sin que se lo pidas*'];
    },
    function vida(ctx, t, a, b) {
      C.bg(ctx, '#2A0A1A', '#6A1A2A');
      const p = clamp((t - a) / (b - a));
      for (let i = 0; i < 5; i++) { const x = 160 + i * 190, sc2 = 0.35 + i * 0.12, show = fade(t, a + i * 0.35);
        if (show <= 0) continue; ctx.save(); ctx.globalAlpha = show;
        C.person(ctx, x, 1260, sc2 + 0.25, { style: { hairStyle: i > 3 ? 'bald' : i > 2 ? 'short' : 'curlytop', shirt: ['#FFD22E', '#19B8B2', '#3E6FB0', '#A23B3B', '#7A4FA0'][i] }, eyes: 'happy', mouth: 'smile' });
        heart(ctx, x, 1260 - (sc2 + 0.25) * 230, 0.09 + i * 0.01, t + i * 0.3); ctx.restore(); }
      C.count(ctx, t, ev.millones - 0.6, 2500000000, CX, 680, { size: 92, dur: 1.4 });
      C.pill(ctx, t, ev.millones + 0.6, 'latidos en una vida', CX, 750, '#FFD22E');
      return ['En toda una vida', 'más de *2.500 millones*'];
    },
    function camino(ctx, t, a) {
      C.space(ctx, t);
      C.earth(ctx, CX, 950, 230, t);
      const k = out(t, ev.vueltas - 0.6, 1.4);
      for (let r = 0; r < 2; r++) { ctx.save(); ctx.beginPath(); ctx.ellipse(CX, 950, 330 + r * 60, 120 + r * 26, -0.25, 0, Math.PI * 2 * clamp(k * 2 - r)); ctx.strokeStyle = '#E8423A'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore(); }
      heart(ctx, 210, 650, 0.25 * pop(t, a, 0.4), t);
      C.pill(ctx, t, ev.vueltas, '2 vueltas a la Tierra', CX, 1270, '#FFD22E');
      return ['Tus vasos sanguíneos en fila', 'darían *2 vueltas* a la Tierra'];
    },
    function generador(ctx, t, a) {
      C.bg(ctx, '#0A0A2A', '#1A2A6A');
      heart(ctx, CX, 900, 1.0 * pop(t, a, 0.5), t, { spark: t > ev.generador });
      if (t > ev.generador) { const p = (t * 1.25) % 1; G.rays(ctx, CX, 900, { n: 14, r0: 280, r1: 300 + 140 * (1 - p), color: '#FFD22E', lw: 8, alpha: 1 - p }); }
      C.pill(ctx, t, ev.generador + 0.2, 'generador eléctrico propio', CX, 1280, '#FFD22E');
      return ['Lo más impresionante', 'tiene su propio *generador*'];
    },
    function solo(ctx, t, a) {
      C.bg(ctx, '#0E2A3A', '#1E5A6A');
      G.rrect(ctx, 250, 740, 580, 520, 40, { fill: 'rgba(200,240,255,0.25)', lw: 7, seed: 30 }); // frasco
      for (let i = 0; i < 6; i++) { const p = ((t * 0.6 + i / 6) % 1); G.ellipse(ctx, 330 + i * 80, 1240 - p * 480, 10, 10, { fill: '#BDE6FF', lw: 2, seed: 40 + i, alpha: 1 - p }); }
      heart(ctx, CX, 1010, 0.6 * pop(t, a, 0.5), t);
      C.pill(ctx, t, ev.oxigeno, 'con oxígeno', CX, 680, '#5fb8ff');
      return ['Late solo', 'aunque lo *saquen del cuerpo*'];
    },
  ]);
})();
