// Por qué los mosquitos te pican más a vos
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = { pican: cue(0, 'pican'), suerte: cue(0, 'suerte'), eligen: cue(1, 'eligen'), aire: cue(2, 'aire'), calor: cue(2, 'calor'), olor: cue(2, 'olor'),
    estudio: cue(3, 'estudio'), acidos: cue(3, 'ácidos'), injusto: cue(4, 'injusto'), cambia: cue(4, 'cambia'), iman: cue(5, 'imán') };
  function mosq(ctx, x, y, s, t, seed) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t * 9 + seed) * 0.15);
    const w = Math.sin(t * 60 + seed) * 0.5;
    G.ellipse(ctx, -30, -30 - 10 * w, 40, 16, { fill: 'rgba(220,240,255,0.7)', lw: 3, seed: seed + 1 }); G.ellipse(ctx, 20, -32 + 10 * w, 40, 16, { fill: 'rgba(220,240,255,0.7)', lw: 3, seed: seed + 2 });
    G.ellipse(ctx, 0, 0, 46, 14, { fill: '#4A3A3A', lw: 4, seed: seed + 3 }); G.ellipse(ctx, 50, -4, 16, 14, { fill: '#4A3A3A', lw: 3, seed: seed + 4 });
    G.line(ctx, [[64, -2], [104, 6]], { color: '#2a1a1a', lw: 4, seed: seed + 5 });
    for (let k = 0; k < 3; k++) G.line(ctx, [[-10 + k * 15, 8], [-30 + k * 20, 50]], { color: '#2a1a1a', lw: 3, seed: seed + 6 + k });
    ctx.restore();
  }
  const swarm = (ctx, t, tx, ty, n, k, r0 = 90) => { for (let i = 0; i < n; i++) { const ang = i * 2.4 + t * (1 + i % 3 * 0.3), r = lerp(500, r0 + (i % 4) * 30, k);
    mosq(ctx, tx + Math.cos(ang) * r, ty + Math.sin(ang) * r * 0.7, 0.8, t, 10 + i * 10); } };
  C.film([
    function pican(ctx, t, a) {
      C.bg(ctx, '#0E2A1E', '#2E5A3E');
      C.person(ctx, 300, 1330, 1.0, { eyes: 'happy', mouth: 'smile', style: { shirt: '#3E6FB0' } });
      C.person(ctx, 780, 1330, 1.0, { eyes: 'worried', mouth: 'wavy', brows: 'worried', style: { shirt: '#FFD22E', hairStyle: 'long' } });
      swarm(ctx, t, 780, 950, 6, out(t, ev.pican - 0.4, 1));
      for (let i = 0; i < 4; i++) G.ellipse(ctx, 740 + (i % 2) * 60, 1080 + Math.floor(i / 2) * 80, 14 * fade(t, ev.pican + i * 0.2), 14 * fade(t, ev.pican + i * 0.2), { fill: '#ff5a3a', lw: 2, seed: 90 + i });
      return ['Si siempre te pican a vos', 'no es *mala suerte*'];
    },
    function eligen(ctx, t, a) {
      C.bg(ctx, '#2A0E1E', '#5A1E3E');
      for (let i = 0; i < 5; i++) C.person(ctx, 140 + i * 200, 1330, 0.75, { eyes: i === 2 ? 'wide' : 'normal', mouth: i === 2 ? 'o' : 'flat', style: { shirt: i === 2 ? '#FFD22E' : '#3E4A6A', hairStyle: ['short', 'long', 'curlytop', 'bun', 'buzz'][i] } });
      const k = out(t, ev.eligen - 0.2, 0.6);
      ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = '#FFD22E'; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(540, 1100, 150, 300, 0, 0, 7); ctx.stroke(); ctx.restore();
      swarm(ctx, t, 540, 860, 5, k, 120);
      return ['', 'Te *eligen*'];
    },
    function encuentran(ctx, t, a) {
      C.bg(ctx, '#0E1A3A', '#22365E');
      C.person(ctx, CX, 1330, 1.3, { eyes: 'normal', mouth: 'o', style: { shirt: '#FFD22E' } });
      const k1 = fade(t, ev.aire - 0.2), k2 = fade(t, ev.calor - 0.2), k3 = fade(t, ev.olor - 0.2);
      for (let i = 0; i < 4; i++) { const p = ((t * 0.7 + i / 4) % 1); G.ellipse(ctx, CX + 80 + p * 220, 760 - p * 120, 20 + p * 30, 20 + p * 30, { fill: 'rgba(200,220,255,0.4)', lw: 3, seed: 20 + i, alpha: k1 * (1 - p) }); }
      C.glow(ctx, CX, 1060, 380, '255,120,60', 0.4 * k2);
      for (let i = 0; i < 6; i++) { const p = ((t * 0.5 + i / 6) % 1), x = CX - 200 + (i * 80); G.line(ctx, [[x, 1180 - p * 300], [x + 20, 1130 - p * 300], [x, 1080 - p * 300]], { color: '#B8E04A', lw: 7, seed: 30 + i, alpha: k3 * (1 - p) }); }
      mosq(ctx, 860, 720, 1.4, t, 50);
      C.pill(ctx, t, ev.aire, 'aire', 260, 700, '#5fb8ff'); C.pill(ctx, t, ev.calor, 'calor', 200, 900, '#ff8a3a'); C.pill(ctx, t, ev.olor, 'olor de la piel', 820, 1240, '#B8E04A');
      return ['Te encuentran por', 'el *olor* de tu piel'];
    },
    function estudio(ctx, t, a) {
      C.bg(ctx, '#0E2A3A', '#1E5A6A');
      G.rrect(ctx, 200, 720, 680, 480, 30, { fill: '#F4F7FB', lw: 7, seed: 40 });
      C.text(ctx, '2022', CX, 820, { size: 80, color: '#0b1030', shadow: false });
      for (let i = 0; i < 3; i++) { const h = [120, 180, 330][i] * out(t, ev.acidos - 0.4 + i * 0.1, 0.6); G.rrect(ctx, 300 + i * 180, 1150 - h, 120, h, 12, { fill: i === 2 ? '#ff5a3a' : '#5fb8ff', lw: 5, seed: 41 + i }); }
      C.pill(ctx, t, ev.acidos, 'más ácidos en la piel', CX, 1270, '#ff5a3a');
      return ['Un estudio de 2022', 'más *ácidos* en la piel'];
    },
    function injusto(ctx, t, a) {
      C.bg(ctx, '#2A1A3A', '#5A3A6A');
      for (let i = 0; i < 3; i++) { const x = 220 + i * 320; G.rrect(ctx, x - 110, 740, 220, 300, 20, { fill: '#F4F7FB', lw: 5, seed: 50 + i });
        C.text(ctx, ['HOY', 'MAÑANA', 'AÑOS'][i], x, 800, { size: 36, color: '#0b1030', shadow: false }); C.person(ctx, x, 1020, 0.45, { eyes: 'worried', mouth: 'wavy', style: { shirt: '#FFD22E', hairStyle: 'long' } }); mosq(ctx, x + 60, 880, 0.6, t, 60 + i); }
      C.pill(ctx, t, ev.cambia, 'ese olor no cambia', CX, 1210, '#ff5a3a');
      return ['Y lo más injusto', 'ese olor *no cambia*'];
    },
    function iman(ctx, t, a) {
      C.bg(ctx, '#3A0E1E', '#7A1E3E');
      C.person(ctx, CX, 1330, 1.25, { eyes: 'worried', mouth: 'wavy', gesture: 'shrug', style: { shirt: '#FFD22E', hairStyle: 'long' } });
      const k = pop(t, ev.iman - 0.2, 0.4);
      ctx.save(); ctx.translate(CX, 640); ctx.scale(k, k); G.limb(ctx, [[-80, 60], [-80, -20], [0, -80], [80, -20], [80, 60]], { color: '#ff5a3a', lw: 50, outline: '#5a1010' });
      G.rrect(ctx, -105, 40, 50, 40, 6, { fill: '#C9D6E8', lw: 4, seed: 70 }); G.rrect(ctx, 55, 40, 50, 40, 6, { fill: '#C9D6E8', lw: 4, seed: 71 }); ctx.restore();
      swarm(ctx, t, CX, 900, 9, out(t, ev.iman, 0.8), 140);
      return ['Si hoy sos un imán de mosquitos', 'lo vas a *seguir siendo*'];
    },
  ]);
})();
