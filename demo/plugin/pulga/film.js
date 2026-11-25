// La pulga (versión puteada)
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = {
    lenteja: cue(0, 'lenteja'), olimpico: cue(0, 'olímpico'), remil: cue(0, 'remil'),
    cien: cue(1, 'cien'), reconcha: cue(1, 'reconcha'),
    edificio: cue(2, 'edificio'), cincuenta: cue(2, 'cincuenta'), boludo: cue(2, 'boludo'),
    resorte: cue(3, 'resorte'), golpe: cue(3, 'golpe'), turra: cue(3, 'turra'),
    meses: cue(4, 'meses'), gil: cue(4, 'gil'), sangre: cue(4, 'sangre'),
    hembra: cue(5, 'hembra'), huevos: cue(5, 'huevos'), ejercito: cue(5, 'ejército'),
    perro: cue(6, 'perro'), rasca: cue(6, 'rasca'), forros: cue(6, 'forros'),
  };
  const FB = '#7A3A1A', FD = '#2A1006';
  const shake = (t, t0, amp = 22, d = 0.45) => { const k = clamp(1 - (t - t0) / d); return t >= t0 && k > 0 ? [Math.sin(t * 70) * amp * k, Math.cos(t * 61) * amp * k] : [0, 0]; };
  function room(ctx, t, top = '#F2E2C2', bot = '#D8B888') {
    C.bg(ctx, top, bot);
    for (let i = 0; i < 9; i++) G.line(ctx, [[i * 130, 0], [i * 130, 1300]], { color: 'rgba(160,110,60,0.18)', lw: 6, seed: 800 + i });
    G.poly(ctx, [[-60, 1300], [1140, 1300], [1140, 2000], [-60, 2000]], { fill: '#A8784A', lw: 6, seed: 810 });
    for (let i = 0; i < 6; i++) G.line(ctx, [[-60, 1360 + i * 100], [1140, 1360 + i * 100]], { color: 'rgba(60,30,10,0.25)', lw: 4, seed: 811 + i });
    for (let i = 0; i < 14; i++) { const x = (i * 157 + t * 30) % 1180 - 50, y = 600 + (i * 113) % 600; ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 3 + i % 3, 0, 7); ctx.fill(); ctx.restore(); }
  }
  // pulga de costado mirando a la derecha. o: { crouch 0..1, mood, medal, legs: true }
  function flea(ctx, x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
    const cr = o.crouch || 0;
    G.limb(ctx, [[-60, 40], [-150, -40 + 40 * cr], [-120, 120 - 30 * cr], [-200, 160]], { color: FB, lw: 22, ink: FD, outline: 4, seed: 820 });
    G.limb(ctx, [[0, 50], [-20, 120], [-50, 160]], { color: FB, lw: 16, ink: FD, outline: 3, seed: 821 });
    G.limb(ctx, [[60, 40], [90, 110], [70, 160]], { color: FB, lw: 16, ink: FD, outline: 3, seed: 822 });
    G.ellipse(ctx, 0, 0, 120 * (1 + 0.1 * cr), 80 * (1 - 0.15 * cr), { fill: FB, lw: 6, seed: 823 });
    for (let k = 0; k < 4; k++) G.line(ctx, [[-90 + k * 50, -70], [-80 + k * 50, 70]], { color: FD, lw: 4, seed: 824 + k });
    G.ellipse(ctx, -30, -40, 40, 18, { fill: 'rgba(255,220,180,0.35)', lw: 0, seed: 828 });
    G.ellipse(ctx, 130, -10, 50, 42, { fill: FB, lw: 6, seed: 829 });
    G.line(ctx, [[175, 5], [230, 40]], { color: FD, lw: 6, seed: 830 });
    G.line(ctx, [[150, -45], [190, -100 + Math.sin(t * 6) * 10]], { color: FD, lw: 4, seed: 831 });
    const m = o.mood || 'smug';
    G.ellipse(ctx, 145, -20, 14, 14, { fill: '#fff', lw: 3, seed: 832 }); G.ellipse(ctx, 149, -18, 7, 7, { fill: '#111', lw: 0, seed: 833 });
    if (m === 'smug' || m === 'angry') G.line(ctx, [[128, -42], [165, -34]], { lw: 5, seed: 834 });
    if (o.medal) { G.line(ctx, [[110, 25], [90, 80]], { color: '#E8324A', lw: 6, seed: 835 }); G.ellipse(ctx, 90, 95, 22, 22, { fill: '#FFD22E', lw: 4, seed: 836 }); }
    ctx.restore();
  }
  function dog(ctx, x, y, s, t, scratch) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    G.ellipse(ctx, 0, 0, 200, 110, { fill: '#C8955A', lw: 6, seed: 840 }); G.ellipse(ctx, 190, -90, 90, 80, { fill: '#C8955A', lw: 6, seed: 841 });
    G.ellipse(ctx, 160, -170, 34, 60, { fill: '#8A5A2A', lw: 5, seed: 842 }); G.ellipse(ctx, 260, -60, 26, 20, { fill: '#2a1a10', lw: 0, seed: 843 }); G.ellipse(ctx, 210, -110, 10, 10, { fill: '#111', lw: 0, seed: 844 });
    for (const lx of [-120, -60, 80, 140]) G.limb(ctx, [[lx, 80], [lx, 190]], { color: '#C8955A', lw: 34, ink: '#5a3a1a', outline: 4, seed: 845 + lx });
    if (scratch) { const sw = Math.sin(t * 30) * 25; G.limb(ctx, [[-100, 40], [-40 + sw, -60], [40, -120 + sw]], { color: '#C8955A', lw: 30, ink: '#5a3a1a', outline: 4, seed: 849 }); }
    G.limb(ctx, [[-190, -20], [-260, -80 + Math.sin(t * 8) * 20]], { color: '#C8955A', lw: 20, ink: '#5a3a1a', outline: 4, seed: 850 });
    ctx.restore();
  }
  C.film([
    function hook(ctx, t, a) {
      room(ctx, t);
      const [sx, sy] = shake(t, ev.olimpico, 22);
      ctx.save(); ctx.translate(sx, sy);
      flea(ctx, CX - 40, 1100, 1.6 * (0.6 + 0.4 * pop(t, a, 0.5)), t, { medal: t > ev.olimpico - 0.2 });
      if (t > ev.lenteja - 0.2) { const p = pop(t, ev.lenteja - 0.2, 0.4); G.ellipse(ctx, 850, 1320, 70 * p, 46 * p, { fill: '#B8763A', lw: 5, seed: 860 }); C.pill(ctx, t, ev.lenteja, 'lenteja', 850, 1220, '#B8763A'); }
      ctx.restore();
      C.pill(ctx, t, ev.olimpico, 'atleta olímpico', CX, 720, '#FFD22E');
      return ['¿Ves esta cosita?', 'salta como un *atleta*'];
    },
    function salto(ctx, t, a) {
      room(ctx, t, '#5AA8E0', '#BFE8F8');
      const [sx, sy] = shake(t, ev.reconcha, 26, 0.6);
      ctx.save(); ctx.translate(sx, sy);
      const ph = ((t - a) * 0.7) % 1, hy = Math.sin(ph * Math.PI) * 800;
      flea(ctx, 300 + ph * 480, 1260 - hy, 0.7, t, { crouch: ph < 0.08 ? 1 : 0, rot: -0.4 + ph * 0.8 });
      for (let k = 0; k < 6; k++) { const pp = Math.max(0, ph - k * 0.04); G.ellipse(ctx, 300 + pp * 480, 1260 - Math.sin(pp * Math.PI) * 800, 10, 10, { fill: 'rgba(255,255,255,0.5)', lw: 0, seed: 870 + k }); }
      ctx.restore();
      C.count(ctx, t, ev.cien - 0.2, 100, 820, 760, { pre: 'x', size: 150 });
      C.pill(ctx, t, ev.cien + 0.3, 'su tamaño', 820, 830, '#FFD22E');
      return ['Salta', '*100 veces* su tamaño'];
    },
    function vos(ctx, t, a) {
      C.bg(ctx, '#2A5A8A', '#8AC8F0');
      G.rrect(ctx, 560, 380, 300, 1120, 10, { fill: '#5A6A8A', lw: 7, seed: 880 });
      for (let r = 0; r < 14; r++) for (let c = 0; c < 3; c++) G.rrect(ctx, 590 + c * 90, 420 + r * 76, 60, 44, 6, { fill: (r + c + Math.floor(t)) % 5 ? '#FFE07A' : '#3A4A6A', lw: 3, seed: 881 + ((r * 3 + c) & 15) });
      G.poly(ctx, [[-60, 1500], [1140, 1500], [1140, 2000], [-60, 2000]], { fill: '#6A8A4A', lw: 6, seed: 898 });
      const ph = clamp((t - a - 0.3) / 2.2), hy = Math.sin(ph * Math.PI) * 1250;
      C.person(ctx, lerp(260, 1000, ph), 1500 - hy, 0.8 * pop(t, a, 0.4), { pose: ph > 0 && ph < 1 ? 'celebrate' : 'stand', eyes: 'wide', mouth: 'open', style: { shirt: '#19B8B2' } });
      C.pill(ctx, t, ev.cincuenta, '50 pisos', 300, 900, '#FFD22E');
      return ['Si vos saltaras así', 'pasás un edificio de *50 pisos*'];
    },
    function resorte(ctx, t, a) {
      C.bg(ctx, '#0B1E3A', '#1D3F6E');
      const sq = (Math.sin(t * 3) * 0.5 + 0.5), go = t > ev.golpe - 0.1 ? out(t, ev.golpe - 0.1, 0.25) : 0;
      ctx.save(); ctx.globalAlpha = 0.55; flea(ctx, CX, 1100 - 300 * go, 1.7 * pop(t, a, 0.5), t, { crouch: go > 0 ? 0 : sq }); ctx.restore();
      const cx = CX - 120, cy = 1080 - 300 * go, comp = go > 0 ? 1 : (1 - sq * 0.6);
      const pts = []; for (let k = 0; k <= 14; k++) pts.push([cx + (k % 2 ? 40 : -40), cy - 100 * comp + k * (200 * comp / 14)]);
      G.line(ctx, pts, { color: '#FFD22E', lw: 12, seed: 900 });
      C.pill(ctx, t, ev.resorte, 'resorte de goma', CX, 1380, '#FFD22E');
      if (t > ev.golpe) C.text(ctx, '¡PUM!', CX + 260, 820, { size: 120 * pop(t, ev.golpe, 0.3), color: '#fff', stroke: '#0b1030', strokeW: 12 });
      return ['No salta con músculos', 'tiene un *resorte*'];
    },
    function espera(ctx, t, a) {
      room(ctx, t, '#3A2A4A', '#6A4A6A');
      flea(ctx, 330, 1250, 1.0 * pop(t, a, 0.5), t, { mood: 'angry' });
      const pc = pop(t, ev.meses - 0.2, 0.4);
      if (pc > 0) { ctx.save(); ctx.translate(800, 760); ctx.scale(pc, pc); G.rrect(ctx, -130, -120, 260, 240, 24, { fill: '#fff', lw: 6, seed: 910 }); G.rrect(ctx, -130, -120, 260, 70, 24, { fill: '#E8324A', lw: 6, seed: 911 });
        C.text(ctx, 'MESES', 0, 50, { size: 64, color: '#0b1030', shadow: false }); ctx.restore(); }
      if (t > ev.gil - 0.3) { C.person(ctx, 820, 1400, 0.85 * pop(t, ev.gil - 0.3, 0.4), { eyes: 'normal', mouth: 'smile', style: { shirt: '#FFD22E' } }); if (t > ev.sangre) for (let i = 0; i < 4; i++) G.ellipse(ctx, 760 + i * 30, 1300 - ((t * 120 + i * 30) % 120), 8, 12, { fill: '#E8324A', lw: 2, seed: 912 + i }); }
      return ['Aguanta meses sin comer', 'esperándote a *vos*'];
    },
    function huevos(ctx, t, a) {
      room(ctx, t);
      flea(ctx, 260, 1220, 0.8 * pop(t, a, 0.5), t, { mood: 'smug' });
      const n = Math.min(50, Math.floor(clamp((t - ev.huevos) / 1.6) * 50));
      for (let i = 0; i < n; i++) G.ellipse(ctx, 460 + (i % 10) * 54, 1440 - Math.floor(i / 10) * 44, 20, 26, { fill: '#F4F0E0', lw: 3, seed: 920 + (i & 15) });
      if (t > ev.ejercito - 0.1) for (let i = 0; i < 7; i++) flea(ctx, 140 + i * 130, 760 + (i % 2) * 70 + Math.sin(t * 8 + i) * 20, 0.35 * pop(t, ev.ejercito - 0.1 + i * 0.05, 0.3), t, { mood: 'angry' });
      C.count(ctx, t, ev.huevos - 0.2, 50, 780, 1100, { suf: ' x DÍA', size: 90 });
      return ['Una hembra pone', '*50 huevos* por día'];
    },
    function cierre(ctx, t, a) {
      room(ctx, t, '#2A2A5A', '#5A4A8A');
      if (t > ev.forros - 0.1) G.rays(ctx, CX, 1000, { n: 18, r0: 300, r1: 1300, color: '#FFD22E', lw: 10, alpha: 0.2, spin: t * 0.4 });
      dog(ctx, 420, 1250, 1.1 * pop(t, a, 0.5), t, t > ev.rasca - 0.2);
      if (t > ev.rasca) for (let i = 0; i < 6; i++) { const ph = ((t - ev.rasca) * 0.9 + i / 6) % 1; flea(ctx, 400 + i * 60 + ph * 120, 1100 - Math.sin(ph * Math.PI) * 300, 0.22, t, { medal: true }); }
      if (t > ev.forros - 0.05) C.text(ctx, '¡ATLETAS F*RROS!', CX, 780, { size: 92 * pop(t, ev.forros, 0.35), color: '#FFD22E', stroke: '#0b1030', strokeW: 14 });
      return ['Si tu perro se rasca', '*no es joda*'];
    },
  ]);
})();
