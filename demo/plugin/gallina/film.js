// Por qué se pone la piel de gallina
(function () {
  const G = globalThis.G, Ch = globalThis.Ch, L = globalThis.L;
  const { CX, YEL, fade, pop, ramp, head, head2, pill, bg, glow, cue, clamp, lerp, ease } = L;
  const SKIN = '#F2C29A';
  const T = { emo: cue(0, 'emocion'), gal: cue(0, 'gallina'), mus: cue(1, 'músculo'), lev: cue(1, 'levanta'), cal: cue(2, 'caliente'),
    gra: cue(2, 'grandes'), miedo: cue(2, 'miedo'), eriza: cue(3, 'eriza'), pelo: cue(4, 'pelo'), mismo: cue(4, 'mismo'), pel: cue(5, 'peludos') };
  // brazo grande con granitos (k = 0..1 cuánto se erizó)
  function arm(ctx, t, x, y, k, hairs) {
    G.rrect(ctx, x - 380, y - 95, 760, 190, 95, { fill: SKIN, lw: 6, seed: 11, hatch: { color: 'rgba(150,80,40,0.12)', gap: 12 } });
    for (let i = 0; i < 26; i++) {
      const px = x - 330 + (i % 13) * 52 + (i > 12 ? 26 : 0), py = y - 40 + (i > 12 ? 70 : 0) + Math.sin(i * 7) * 10;
      const b = k * (0.8 + 0.2 * Math.sin(t * 9 + i));
      if (b > 0.02) G.ellipse(ctx, px, py, 9 * b, 8 * b, { fill: '#E8A27A', lw: 2.5, seed: 20 + i });
      if (hairs) { const ang = lerp(1.25, 0.15, k) + Math.sin(t * 3 + i) * 0.05; G.line(ctx, [[px, py], [px + Math.cos(ang) * 26, py - Math.sin(ang) * 26]], { color: '#6b4630', lw: 3, seed: 40 + i }); }
    }
  }
  function flake(ctx, x, y, r, rot) { for (let i = 0; i < 3; i++) { const a = rot + i * Math.PI / 3; G.line(ctx, [[x - Math.cos(a) * r, y - Math.sin(a) * r], [x + Math.cos(a) * r, y + Math.sin(a) * r]], { color: '#dff4ff', lw: 4, seed: 60 + i }); } }
  // animal peludo (oso) que se infla
  function bear(ctx, t, x, y, s, fur) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    for (let i = 0; i < 44; i++) { const a = (i / 44) * Math.PI * 2, r = 210 + fur * 40; G.line(ctx, [[Math.cos(a) * 170, -200 + Math.sin(a) * 170], [Math.cos(a) * r, -200 + Math.sin(a) * r]], { color: '#6a4026', lw: 9, seed: 100 + i }); }
    G.ellipse(ctx, 0, -200, 190, 190, { fill: '#8a5634', lw: 6, seed: 150, hatch: { color: 'rgba(0,0,0,0.15)', gap: 10 } });
    G.ellipse(ctx, -120, -360, 46, 46, { fill: '#8a5634', lw: 5, seed: 151 }); G.ellipse(ctx, 120, -360, 46, 46, { fill: '#8a5634', lw: 5, seed: 152 });
    G.ellipse(ctx, 0, -170, 70, 52, { fill: '#c99a6c', lw: 5, seed: 153 }); G.ellipse(ctx, 0, -190, 20, 14, { fill: '#2a1a10', lw: 2, seed: 154 });
    G.ellipse(ctx, -60, -250, 12, 14, { fill: '#1a0d08', lw: 2, seed: 155 }); G.ellipse(ctx, 60, -250, 12, 14, { fill: '#1a0d08', lw: 2, seed: 156 });
    ctx.restore();
  }
  function cat(ctx, t, x, y, k) {
    ctx.save(); ctx.translate(x, y);
    const arch = k * 70;
    for (let i = 0; i < 30; i++) { const u = i / 29, px = lerp(-200, 200, u), py = -150 - Math.sin(u * Math.PI) * (60 + arch), len = 20 + k * 45 * Math.sin(u * Math.PI);
      G.line(ctx, [[px, py], [px + (u - 0.5) * 20, py - len]], { color: '#2b2b33', lw: 8, seed: 200 + i }); }
    G.shape(ctx, Array.from({ length: 21 }, (_, i) => { const u = i / 20; return [lerp(-200, 200, u), -150 - Math.sin(u * Math.PI) * (60 + arch)]; }).concat([[200, -60], [-200, -60]]), { fill: '#3a3a44', lw: 6, seed: 230, closed: true });
    for (const lx of [-170, -120, 120, 170]) G.rrect(ctx, lx - 14, -80, 28, 80 + 0, 10, { fill: '#3a3a44', lw: 5, seed: 240 + lx });
    G.ellipse(ctx, 240, -150 - arch * 0.4, 70, 62, { fill: '#3a3a44', lw: 6, seed: 250 });
    G.poly(ctx, [[190, -190 - arch * 0.4], [205, -250 - arch * 0.4], [232, -205 - arch * 0.4]], { fill: '#3a3a44', lw: 5, seed: 251 });
    G.poly(ctx, [[260, -205 - arch * 0.4], [290, -250 - arch * 0.4], [300, -190 - arch * 0.4]], { fill: '#3a3a44', lw: 5, seed: 252 });
    G.ellipse(ctx, 225, -160 - arch * 0.4, 12, 16 * (1 + k * 0.4), { fill: '#c8f05a', lw: 2, seed: 253 }); G.ellipse(ctx, 265, -160 - arch * 0.4, 12, 16 * (1 + k * 0.4), { fill: '#c8f05a', lw: 2, seed: 254 });
    const tail = Array.from({ length: 8 }, (_, i) => [-200 - i * 14, -100 - i * 22 + Math.sin(t * 3 + i * 0.5) * 6]);
    G.line(ctx, tail, { color: '#3a3a44', lw: 16 + k * 22, seed: 260 });
    ctx.restore();
  }
  L.film([
    function frio(ctx, t, a) {
      const emo = fade(t, T.emo - 0.1, 0.4);
      bg(ctx, emo > 0.5 ? '#2a0f2e' : '#0c2a4a', emo > 0.5 ? '#6a2a5a' : '#2c6a9a');
      for (let i = 0; i < 18; i++) { const x = (i * 137) % 1080, y = ((i * 97 + t * 120) % 900) + 480; ctx.globalAlpha = 1 - emo; flake(ctx, x, y, 16, t + i); ctx.globalAlpha = 1; }
      Ch.person(ctx, { x: CX, y: 1060, pose: 'stand', s: 0.95 * pop(t, a, 0.5), eyes: emo > 0.5 ? 'happy' : 'wide', mouth: emo > 0.5 ? 'open' : 'wavy', brows: emo > 0.5 ? 'up' : 'worried',
        headX: (1 - emo) * Math.sin(t * 40) * 4, crossArms: emo < 0.5, gesture: emo > 0.5 ? 'cheer' : undefined, blush: emo * 0.6, style: { hairStyle: 'curlytop', hair: '#3a2416', outfit: 'tee', shirt: '#19B8B2', skin: SKIN } });
      if (emo > 0) for (let i = 0; i < 5; i++) { const p = (t * 0.6 + i / 5) % 1; G.heart(ctx, CX - 260 + i * 130, 900 - p * 360, 1.2 * emo); }
      const k = ramp(t, T.gal - 0.1, 0.5);
      if (k > 0) { ctx.save(); ctx.translate(0, (1 - k) * 200); ctx.globalAlpha = k; arm(ctx, t, CX, 1240, k, false); ctx.restore(); }
      head2(ctx, t, a, 'Cuando tenés frío', 'se te pone la piel de *gallina*', T.emo, 'o te emocionás', 'se te pone la piel de *gallina*');
    },
    function musculo(ctx, t, a) {
      bg(ctx, '#3a1a14', '#7a3a2a');
      G.rrect(ctx, 90, 560, 900, 680, 40, { fill: '#F2C29A', lw: 6, seed: 300, hatch: { color: 'rgba(150,80,40,0.12)', gap: 14 } });
      G.rrect(ctx, 90, 560, 900, 140, 40, { fill: '#E8A27A', lw: 6, seed: 301 });
      const k = ramp(t, T.lev - 0.2, 0.6);
      G.ellipse(ctx, 520, 780, 70, 150, { fill: '#d98e6a', lw: 5, seed: 302 }); // raíz del pelo
      const ang = lerp(0.35, 1.45, k);
      G.line(ctx, [[520, 760], [520 + Math.cos(ang) * 520, 760 - Math.sin(ang) * 520]], { color: '#5a3820', lw: 16, seed: 303 });
      const mx = lerp(700, 640, k), my = lerp(980, 900, k);
      G.limb(ctx, [[560, 860], [mx, my], [820, 720]], { color: '#ff5a3a', lw: 34 - k * 8 + 6 * k });
      glow(ctx, 680, 880, 160, '255,90,58', 0.25 * fade(t, T.mus - 0.1, 0.4));
      if (k > 0.3) G.ellipse(ctx, 520, 600, 60 * k, 30 * k, { fill: '#e8a27a', lw: 4, seed: 304 });
      L.pill(ctx, t, T.mus, 'músculo erector', 760, 1060, '#ff5a3a');
      L.pill(ctx, t, T.lev + 0.1, '¡se para!', 300, 560, YEL);
      head(ctx, t, 'Cada pelito tiene', 'un *músculo* diminuto', a + 0.05);
    },
    function animales(ctx, t, a) {
      bg(ctx, '#0b2a3a', '#3a6a5a');
      G.poly(ctx, [[-50, 1250], [1130, 1250], [1130, 1960], [-50, 1960]], { fill: '#e8f2f8', lw: 5, seed: 400 });
      const fur = ramp(t, T.cal - 0.4, 0.6), big = ramp(t, T.gra - 0.2, 0.5);
      bear(ctx, t, CX, 1250, 1.05 + big * 0.25 + Math.sin(t * 2) * 0.01, fur + big);
      if (fur > 0 && big < 0.5) for (let i = 0; i < 10; i++) { const a2 = i / 10 * 6.28 + t * 0.4; glow(ctx, CX + Math.cos(a2) * 230, 1040 + Math.sin(a2) * 230, 40, '255,150,60', 0.6 * fur); }
      L.pill(ctx, t, T.cal, 'aire caliente', 820, 640, '#ff8a3a', T.gra - 0.2);
      L.pill(ctx, t, T.gra, '¡más grande!', 250, 640, YEL);
      head2(ctx, t, a, 'En los animales peludos', 'el pelo parado *abriga*', T.gra - 0.1, 'y si tienen miedo', 'parecen más *grandes*');
    },
    function gato(ctx, t, a) {
      bg(ctx, '#2a1430', '#5a2a4a');
      const k = ramp(t, T.eriza - 0.15, 0.35);
      if (k > 0) G.rays(ctx, CX, 1000, { n: 18, r0: 120, r1: 900, color: 'rgba(255,210,46,0.18)', lw: 40, spin: t * 0.3 });
      cat(ctx, t, CX - 40, 1230 + Math.sin(t * 20) * 3 * k, k);
      head(ctx, t, 'Como cuando', 'un *gato* se eriza', a + 0.05);
    },
    function nosotros(ctx, t, a) {
      bg(ctx, '#0c1d3a', '#24447a');
      Ch.person(ctx, { x: CX, y: 1010, pose: 'stand', s: 0.75, eyes: 'normal', mouth: 'smirk', gesture: 'shrug', style: { hairStyle: 'short', hair: '#2a1a10', outfit: 'tee', shirt: '#7A4FA0', skin: SKIN } });
      const k = ramp(t, T.mismo - 0.3, 0.5);
      arm(ctx, t, CX, 1210, k, true);
      L.pill(ctx, t, T.pelo, 'casi sin pelo', 800, 600, '#5fb8ff');
      head2(ctx, t, a, 'Nosotros ya casi', 'no tenemos *pelo*', T.mismo - 0.1, 'pero el cuerpo', 'hace lo *mismo*');
    },
    function boton(ctx, t, a) {
      bg(ctx, '#1d0f0a', '#4a2414');
      const k = ramp(t, T.pel - 0.3, 0.6);
      ctx.save(); ctx.globalAlpha = 0.35 + 0.4 * k;
      bear(ctx, t, 260, 1180, 0.6, 0.5); ctx.restore();
      Ch.person(ctx, { x: 760, y: 1180, pose: 'stand', s: 0.7, eyes: 'happy', mouth: 'grin', gesture: 'point', look: -1, style: { hairStyle: 'curlytop', hair: '#3a2416', outfit: 'tee', shirt: '#19B8B2', skin: SKIN } });
      const press = Math.max(0, Math.sin(t * 5)) * 10;
      G.rrect(ctx, CX - 130, 680, 260, 90, 30, { fill: '#555a70', lw: 6, seed: 500 });
      G.ellipse(ctx, CX, 690 + press, 110, 50, { fill: '#ff5a3a', lw: 6, seed: 501 });
      glow(ctx, CX, 690, 220, '255,90,58', 0.3);
      L.pill(ctx, t, T.pel, 'herencia peluda', 280, 880, YEL);
      head(ctx, t, 'Es un botón que quedó', 'de cuando éramos *peludos*', a + 0.05);
    },
  ]);
})();
