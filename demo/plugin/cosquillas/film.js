// Por qué no te podés hacer cosquillas
(function () {
  const G = globalThis.G, Ch = globalThis.Ch, L = globalThis.L;
  const { CX, YEL, fade, pop, ramp, head, head2, pill, bg, glow, cue, lerp, clamp } = L;
  const ME = { hairStyle: 'quiff', hair: '#3a2416', outfit: 'hoodie', shirt: '#3E6FB0', skin: '#E9B48A' };
  const T = { func: cue(0, 'funciona'), pred: cue(1, 'predice'), antes: cue(1, 'antes'), sor: cue(2, 'sorprende'), vol: cue(2, 'volumen'),
    sorp: cue(3, 'sorpresa'), otra: cue(3, 'otra'), risa: cue(3, 'risa'), robot: cue(4, 'robot'), poq: cue(4, 'poquito'), sent: cue(4, 'sentían') };
  function feather(ctx, x, y, r) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(r);
    G.shape(ctx, [[0, -120], [34, -60], [30, 20], [0, 70], [-30, 20], [-34, -60]], { fill: '#fff6e0', lw: 5, seed: 31, closed: true });
    for (let i = 0; i < 6; i++) G.line(ctx, [[0, -90 + i * 26], [26, -100 + i * 26]], { color: '#c9b48a', lw: 3, seed: 40 + i });
    G.line(ctx, [[0, -110], [0, 120]], { color: '#c9b48a', lw: 5, seed: 49 });
    ctx.restore();
  }
  function brain(ctx, x, y, s, hi) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    G.ellipse(ctx, 0, 0, 230, 170, { fill: '#F4A7B9', lw: 7, seed: 60, hatch: { color: 'rgba(150,40,80,0.15)', gap: 12 } });
    for (let i = 0; i < 6; i++) G.line(ctx, [[-180 + i * 70, -120], [-150 + i * 60, -20], [-190 + i * 72, 90]], { color: '#c96a86', lw: 5, seed: 70 + i, step: 20, amp: 6 });
    G.ellipse(ctx, 130, 110, 80, 50, { fill: hi ? '#FFD22E' : '#e88aa2', lw: 6, seed: 80 });
    if (hi) glow(ctx, 130, 110, 160, '255,210,46', 0.5 * hi);
    ctx.restore();
  }
  function knob(ctx, x, y, v, label) {
    G.ellipse(ctx, x, y, 110, 110, { fill: '#2a3658', lw: 6, seed: 90 });
    const a = lerp(-2.4, 2.4, v);
    G.line(ctx, [[x, y], [x + Math.sin(a) * 80, y - Math.cos(a) * 80]], { color: YEL, lw: 12, seed: 91 });
    for (let i = 0; i <= 10; i++) { const b = lerp(-2.4, 2.4, i / 10); G.line(ctx, [[x + Math.sin(b) * 125, y - Math.cos(b) * 125], [x + Math.sin(b) * 145, y - Math.cos(b) * 145]], { color: i / 10 <= v ? YEL : '#555', lw: 6, seed: 92 + i }); }
    pill(ctx, 1e9, 0, label, x, y + 190);
  }
  function robot(ctx, t, x, y) {
    G.rrect(ctx, x - 90, y - 300, 180, 220, 30, { fill: '#b8c4d8', lw: 6, seed: 100 });
    G.rrect(ctx, x - 70, y - 400, 140, 110, 26, { fill: '#cfd8e8', lw: 6, seed: 101 });
    G.ellipse(ctx, x - 30, y - 345, 16, 16, { fill: '#19B8B2', lw: 3, seed: 102 }); G.ellipse(ctx, x + 30, y - 345, 16, 16, { fill: '#19B8B2', lw: 3, seed: 103 });
    G.line(ctx, [[x, y - 400], [x, y - 450]], { lw: 5, seed: 104 }); G.ellipse(ctx, x, y - 458, 12, 12, { fill: '#ff5a3a', lw: 3, seed: 105 });
    for (const lx of [-50, 50]) G.rrect(ctx, x + lx - 20, y - 80, 40, 80, 10, { fill: '#9aa6bc', lw: 5, seed: 106 + lx });
  }
  L.film([
    function proba(ctx, t, a) {
      bg(ctx, '#0c1d3a', '#2a4a8a');
      const no = fade(t, T.func - 0.1, 0.2);
      Ch.person(ctx, { x: CX, y: 1250, pose: 'stand', s: 1.05 * pop(t, a, 0.5), eyes: no ? 'normal' : 'focus', mouth: no ? 'flat' : 'smile', brows: no ? 'neutral' : 'up', style: ME,
        handR: [120, -330 + Math.sin(t * 18) * 25] });
      feather(ctx, CX + 110, 900 + Math.sin(t * 18) * 25, -0.6 + Math.sin(t * 9) * 0.3);
      if (no) { ctx.save(); ctx.globalAlpha = no; G.line(ctx, [[CX - 300, 560], [CX + 300, 1200]], { color: '#ff5a3a', lw: 28, seed: 20 }); G.line(ctx, [[CX + 300, 560], [CX - 300, 1200]], { color: '#ff5a3a', lw: 28, seed: 21 }); ctx.restore(); }
      head2(ctx, t, a, 'Tratá de hacerte', '*cosquillas* a vos mismo', T.func - 0.05, 'Tratá de hacerte cosquillas', 'no *funciona*');
    },
    function cerebro(ctx, t, a) {
      bg(ctx, '#1a0f2e', '#3a1f5e');
      const hi = ramp(t, T.pred - 0.2, 0.4);
      brain(ctx, CX, 880, 1.25 + Math.sin(t * 2) * 0.01, hi);
      if (hi > 0) { for (let i = 0; i < 3; i++) { const p = (t * 0.8 + i / 3) % 1; ctx.globalAlpha = 1 - p; G.ellipse(ctx, CX + 160, 1015, 60 + p * 220, 40 + p * 140, { fill: 'rgba(0,0,0,0)', stroke: YEL, lw: 5, seed: 30 + i }); ctx.globalAlpha = 1; } }
      pill(ctx, t, T.pred, 'predice tus movimientos', CX, 1210, YEL);
      head2(ctx, t, a, 'Tu cerebro tiene', 'una parte que *predice*', T.antes, 'cada movimiento', 'antes de que *pase*');
    },
    function volumen(ctx, t, a) {
      bg(ctx, '#0a1a2a', '#1a3a5a');
      const v = 1 - ramp(t, T.vol - 0.2, 0.9);
      knob(ctx, CX, 860, v, 'sensación');
      for (let i = 0; i < 9; i++) { const h = (40 + 140 * Math.abs(Math.sin(t * 6 + i))) * v + 10; G.rrect(ctx, 200 + i * 80, 1260 - h, 50, h, 10, { fill: i % 2 ? '#19B8B2' : '#FFD22E', lw: 4, seed: 120 + i }); }
      pill(ctx, t, T.sor, 'no se sorprende', 250, 600, '#5fb8ff');
      head2(ctx, t, a, 'Como sabe dónde vas a tocar', 'no se *sorprende*', T.vol - 0.1, 'y le baja', 'el *volumen*');
    },
    function sorpresa(ctx, t, a) {
      bg(ctx, '#3a1430', '#8a2a5a');
      const r = fade(t, T.otra - 0.2, 0.4), laugh = ramp(t, T.risa - 0.3, 0.3);
      if (laugh > 0) G.rays(ctx, CX, 1000, { n: 20, r0: 100, r1: 900, color: 'rgba(255,210,46,0.2)', lw: 40, spin: t * 0.4 });
      Ch.person(ctx, { x: 400, y: 1290, pose: "stand", s: 1.1, rot: laugh * Math.sin(t * 20) * 0.05, eyes: laugh ? 'happy' : 'normal', mouth: laugh ? 'open' : 'smile', blush: laugh, sweat: false, style: ME, gesture: laugh ? 'cheer' : undefined });
      Ch.person(ctx, { x: lerp(1300, 760, r), y: 1290, pose: "stand", s: 1.1, eyes: 'happy', mouth: 'smirk', look: -1, handL: [-240, -260 + Math.sin(t * 16) * 20], style: { hairStyle: 'ponytail', hair: '#7a3a1a', outfit: 'tee', shirt: '#FFD22E', skin: '#C68B5E' } });
      if (laugh > 0) for (let i = 0; i < 4; i++) { const p = (t * 0.7 + i / 4) % 1; ctx.save(); ctx.globalAlpha = 1 - p; L.font(ctx, 70, 900); ctx.fillStyle = YEL; ctx.textAlign = 'center'; ctx.fillText('JA', 300 + i * 70, 760 - p * 200); ctx.restore(); }
      head2(ctx, t, a, 'Las cosquillas necesitan', '*sorpresa*', T.otra - 0.1, 'Si te toca otra persona', 'te morís de *risa*');
    },
    function robotsc(ctx, t, a) {
      bg(ctx, '#0c1d3a', '#24447a');
      robot(ctx, t, 300, 1250);
      const lag = fade(t, T.poq - 0.2, 0.3), feel = ramp(t, T.sent - 0.3, 0.3);
      Ch.person(ctx, { x: 740, y: 1260, pose: 'stand', s: 0.9, eyes: feel ? 'happy' : 'normal', mouth: feel ? 'open' : 'flat', blush: feel, style: ME, gesture: feel ? 'cheer' : undefined });
      feather(ctx, lerp(420, 640, lag) + Math.sin(t * 16) * 10, 900, -1.2);
      pill(ctx, t, T.poq, '+0,2 segundos', 300, 680, YEL);
      head2(ctx, t, a, 'Con un robot que', 'tardaba un *poquito*', T.sent - 0.1, 'las cosquillas', 'sí se *sentían*');
    },
  ]);
})();
