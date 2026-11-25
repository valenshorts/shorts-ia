// El wombat caga cubos (versión puteada)
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = {
    cubos: cue(0, 'cubos'), dados: cue(0, 'dados'),
    wombat: cue(1, 'wombat'), australia: cue(1, 'australia'), plato: cue(1, 'plato'), chanta: cue(1, 'chanta'),
    ochenta: cue(2, 'ochenta'), cuadradas: cue(2, 'cuadradas'), cagon: cue(2, 'cagón'),
    intestino: cue(3, 'intestino'), aprieta: cue(3, 'aprieta'), moldeando: cue(3, 'moldeando'),
    apila: cue(4, 'apila'), piedras: cue(4, 'piedras'), territorio: cue(4, 'territorio'),
    ruedan: cue(5, 'ruedan'), pedo: cue(5, 'pedo'), reconcha: cue(5, 'reconcha'),
    lego: cue(6, 'lego'), mueble: cue(6, 'mueble'), gil: cue(6, 'gil'),
  };
  const FUR = '#8A6A4A', FD = '#3A2614', POO = '#6A4422';
  const shake = (t, t0, amp = 22, d = 0.45) => { const k = clamp(1 - (t - t0) / d); return t >= t0 && k > 0 ? [Math.sin(t * 70) * amp * k, Math.cos(t * 61) * amp * k] : [0, 0]; };
  function outback(ctx, t, night = false) {
    C.bg(ctx, night ? '#0E1440' : '#F2A65A', night ? '#3A2A6A' : '#C8643A');
    if (night) { for (let i = 0; i < 60; i++) { ctx.save(); ctx.globalAlpha = 0.4 + 0.4 * Math.sin(t * 2 + i); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc((i * 137) % 1080, (i * 89) % 1100, 2 + i % 3, 0, 7); ctx.fill(); ctx.restore(); }
      G.ellipse(ctx, 830, 560, 90, 90, { fill: '#F4F0D8', lw: 5, seed: 900 }); }
    else { C.glow(ctx, 840, 600, 260, '255,240,180', 0.6); G.ellipse(ctx, 840, 600, 100, 100, { fill: '#FFE07A', lw: 5, seed: 901 }); }
    G.poly(ctx, [[-60, 1300], [300, 1250], [760, 1290], [1140, 1240], [1140, 2000], [-60, 2000]], { fill: night ? '#4A3A5A' : '#B8552E', lw: 6, seed: 902 });
    for (let i = 0; i < 4; i++) { const x = 120 + i * 280, sw = Math.sin(t * 1.3 + i) * 10;
      G.limb(ctx, [[x, 1300], [x - 30 + sw, 1210], [x - 60 + sw * 1.5, 1150]], { color: night ? '#5A7A4A' : '#8AA84A', lw: 14, ink: '#3a4a20', outline: 3, seed: 903 + i });
      G.limb(ctx, [[x, 1300], [x + 30 - sw, 1200], [x + 60 - sw * 1.5, 1140]], { color: night ? '#5A7A4A' : '#8AA84A', lw: 14, ink: '#3a4a20', outline: 3, seed: 908 + i }); }
    for (let i = 0; i < 14; i++) { const x = (i * 157 + t * 40) % 1180 - 50, y = 700 + (i * 113) % 500; ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = night ? '#C8D0FF' : '#FFF4D0'; ctx.beginPath(); ctx.arc(x, y, 3 + i % 3, 0, 7); ctx.fill(); ctx.restore(); }
  }
  // wombat de costado mirando a la derecha. o: { mood: 'happy'|'smug'|'shock', halo, walk, dir }
  function wombat(ctx, x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.dir || 1), s);
    const st = o.walk ? Math.sin(t * 9) : 0, br = 1 + Math.sin(t * 2.2) * 0.02;
    for (const [lx, ph] of [[-120, 0], [-60, 1], [80, 1], [140, 0]]) G.limb(ctx, [[lx, 60], [lx + (ph ? st : -st) * 14, 140]], { color: FUR, lw: 46, ink: FD, outline: 5, seed: 910 + lx });
    G.ellipse(ctx, 0, 0, 220 * br, 140 * br, { fill: FUR, lw: 6, seed: 920 });
    G.ellipse(ctx, -30, 40, 150, 70, { fill: '#A88A6A', lw: 0, seed: 921, alpha: 0.6 });
    G.ellipse(ctx, 200, -40, 110, 95, { fill: FUR, lw: 6, seed: 922 });
    G.ellipse(ctx, 160, -125, 26, 30, { fill: FUR, lw: 5, seed: 923 }); G.ellipse(ctx, 230, -128, 24, 28, { fill: FUR, lw: 5, seed: 924 });
    G.ellipse(ctx, 290, -20, 44, 36, { fill: '#2A1A10', lw: 4, seed: 925 });
    const m = o.mood || 'happy', bl = Math.sin(t * 1.1) > 0.985 ? 0.15 : 1;
    G.ellipse(ctx, 225, -60, m === 'shock' ? 18 : 13, (m === 'shock' ? 18 : 13) * bl, { fill: '#111', lw: 0, seed: 926 });
    if (m === 'smug') G.line(ctx, [[200, -90], [250, -80]], { lw: 6, seed: 927 });
    if (m === 'shock') G.ellipse(ctx, 270, 30, 14, 18, { fill: '#5a1a14', lw: 4, seed: 928 }); else G.line(ctx, [[240, 22], [262, 32], [284, 24]], { lw: 5, seed: 929 });
    if (o.halo) { C.glow(ctx, 200, -175, 130, '255,230,120', 0.5 * o.halo); ctx.save(); ctx.globalAlpha = o.halo; ctx.strokeStyle = '#FFD22E'; ctx.lineWidth = 14; ctx.beginPath(); ctx.ellipse(200, -175 + Math.sin(t * 3) * 6, 80, 20, 0, 0, 7); ctx.stroke(); ctx.restore(); }
    ctx.restore();
  }
  function cube(ctx, x, y, r, rot = 0, dots = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    G.rrect(ctx, -r, -r, 2 * r, 2 * r, r * 0.25, { fill: POO, lw: Math.max(3, r * 0.08), seed: 940 + (r | 0) });
    G.rrect(ctx, -r * 0.7, -r * 0.75, r * 0.6, r * 0.25, r * 0.1, { fill: 'rgba(255,220,180,0.35)', lw: 0, seed: 941 });
    if (dots) { const pts = { 1: [[0, 0]], 3: [[-.45, -.45], [0, 0], [.45, .45]], 5: [[-.45, -.45], [.45, -.45], [0, 0], [-.45, .45], [.45, .45]], 6: [[-.45, -.5], [-.45, 0], [-.45, .5], [.45, -.5], [.45, 0], [.45, .5]] }[dots] || [];
      for (const [a, b] of pts) G.ellipse(ctx, a * r, b * r, r * 0.13, r * 0.13, { fill: '#F4E8D0', lw: 2, seed: 942 }); }
    ctx.restore();
  }
  C.film([
    function hook(ctx, t, a) {
      outback(ctx, t);
      const [sx, sy] = shake(t, ev.cubos, 22);
      ctx.save(); ctx.translate(sx, sy);
      wombat(ctx, CX - 60, 1150, 1.25 * (0.6 + 0.4 * pop(t, a, 0.5)), t, { mood: t > ev.cubos ? 'smug' : 'happy' });
      const pc = pop(t, ev.cubos, 0.4);
      if (pc > 0) { const roll = t > ev.dados ? out(t, ev.dados, 0.8) : 0;
        cube(ctx, lerp(260, 200, roll), 1260 - Math.sin(roll * Math.PI) * 160, 60 * pc, roll * Math.PI * 2, t > ev.dados + 0.6 ? 5 : 0); }
      ctx.restore();
      C.pill(ctx, t, ev.dados, 'como dados', CX, 700, '#FFD22E');
      return ['Agarrate', 'este gordito caga *cubos*'];
    },
    function quien(ctx, t, a) {
      outback(ctx, t);
      const halo = t > ev.plato - 0.2 ? (t > ev.chanta ? 1 - out(t, ev.chanta, 0.4) : out(t, ev.plato - 0.2, 0.4)) : 0;
      wombat(ctx, CX - 60, 1150, 1.25 * pop(t, a, 0.5), t, { mood: t > ev.chanta ? 'smug' : 'happy', halo });
      C.pill(ctx, t, ev.australia, 'Australia', 240, 700, '#19B8B2');
      if (t > ev.chanta) C.text(ctx, 'CHANTA', CX, 820, { size: 130 * pop(t, ev.chanta, 0.35), color: '#FFD22E', stroke: '#0b1030', strokeW: 14 });
      return ['Se llama', '*wombat*'];
    },
    function cuantas(ctx, t, a) {
      outback(ctx, t, true);
      const n = Math.round(100 * ease.outCubic(clamp((t - ev.ochenta) / 1.4)));
      wombat(ctx, 300, 1180, 0.9 * pop(t, a, 0.5), t, { mood: t > ev.cagon ? 'smug' : 'happy', dir: -1 });
      for (let i = 0; i < Math.min(30, Math.floor(n * 0.3)); i++) { const col = i % 6, row = Math.floor(i / 6); cube(ctx, 560 + col * 80 + (row % 2) * 40, 1360 - row * 72, 34, Math.sin(i) * 0.1); }
      if (t > ev.ochenta) C.text(ctx, n + '', 790, 820, { size: 220, color: '#FFD22E', stroke: '#0b1030', strokeW: 16 });
      C.pill(ctx, t, ev.ochenta + 0.3, 'por noche', 790, 880, '#FFD22E');
      return ['Cada noche', 'hasta *100* caquitas'];
    },
    function porque(ctx, t, a) {
      C.bg(ctx, '#3A1A2A', '#7A3A4A');
      const y = 980, sq = Math.max(0, Math.sin(t * 4));
      G.rrect(ctx, 60, y - 130, 960, 260, 130, { fill: '#E88A8A', lw: 7, seed: 950 });
      for (let i = 0; i < 6; i++) { const x = 160 + i * 150, k = (i % 2 ? sq : 1 - sq) * out(t, ev.aprieta - 0.3, 0.4);
        G.ellipse(ctx, x, y - 120 + 22 * k, 50, 18, { fill: '#C85A6A', lw: 4, seed: 951 + i }); G.ellipse(ctx, x, y + 120 - 22 * k, 50, 18, { fill: '#C85A6A', lw: 4, seed: 957 + i }); }
      const p = ((t - a) * 0.28) % 1, bx = lerp(120, 980, p), sqr = clamp((bx - 300) / 500);
      G.rrect(ctx, bx - 60, y - 60, 120, 120, lerp(60, 18, sqr), { fill: POO, lw: 5, seed: 963 });
      C.pill(ctx, t, ev.intestino, 'intestino', CX, 760, '#ff8aa0');
      C.pill(ctx, t, ev.aprieta, 'aprieta desparejo', CX, 1250, '#FFD22E');
      return ['¿Por qué cuadradas?', 'el intestino las *moldea*'];
    },
    function apila(ctx, t, a) {
      outback(ctx, t);
      G.poly(ctx, [[560, 1300], [600, 1120], [760, 1080], [900, 1140], [940, 1300]], { fill: '#8A8A9A', lw: 6, seed: 970 });
      const k = Math.min(4, Math.floor((t - ev.apila + 0.2) * 3));
      for (let i = 0; i < Math.max(0, k); i++) cube(ctx, 750, 1040 - i * 92, 44, Math.sin(i * 2) * 0.08);
      wombat(ctx, 330, 1180, 0.9 * pop(t, a, 0.5), t, { mood: 'smug' });
      if (t > ev.territorio) { G.line(ctx, [[750, 1040 - k * 92 - 40], [750, 1040 - k * 92 - 220]], { lw: 8, seed: 971 }); G.poly(ctx, [[750, 1040 - k * 92 - 220], [900, 1040 - k * 92 - 185], [750, 1040 - k * 92 - 150]], { fill: '#E8324A', lw: 5, seed: 972 });
        C.text(ctx, 'MÍO', 800, 1040 - k * 92 - 175, { size: 34, color: '#fff', shadow: false }); }
      return ['Las apila', 'para marcar *territorio*'];
    },
    function ruedan(ctx, t, a) {
      C.bg(ctx, '#5A9ACF', '#B8E0F0');
      const [sx, sy] = shake(t, ev.reconcha, 26, 0.6);
      ctx.save(); ctx.translate(sx, sy);
      G.poly(ctx, [[-60, 900], [1140, 1400], [1140, 2000], [-60, 2000]], { fill: '#7AB84A', lw: 6, seed: 980 });
      const rp = clamp((t - a - 0.3) / 2.2), bx = lerp(240, 1200, ease.inQuad(rp));
      G.ellipse(ctx, bx, 900 + (bx + 60) * (500 / 1200) - 70, 60, 60, { fill: '#B87A4A', lw: 6, seed: 981 }); G.line(ctx, [[bx - 40 * Math.cos(rp * 20), 900 + (bx + 60) * 0.4167 - 70 - 40 * Math.sin(rp * 20)], [bx + 40 * Math.cos(rp * 20), 900 + (bx + 60) * 0.4167 - 70 + 40 * Math.sin(rp * 20)]], { lw: 5, seed: 982 });
      ctx.save(); ctx.translate(420, 900 + 480 * 0.4167 - 62); ctx.rotate(Math.atan(500 / 1200)); cube(ctx, 0, 0, 62, 0); ctx.restore();
      ctx.restore();
      C.pill(ctx, t, a + 0.4, 'la redonda se va', 760, 1180, '#ff5a3a');
      C.pill(ctx, t, ev.ruedan, 'el cubo se queda', 420, 1080, '#3FE07A');
      return ['Como son cuadradas', '*no ruedan*'];
    },
    function cierre(ctx, t, a) {
      C.bg(ctx, '#2A2A5A', '#5A4A8A');
      const k = Math.min(9, Math.floor((t - a) * 5));
      for (let i = 0; i < k; i++) { const col = i % 3, row = Math.floor(i / 3); cube(ctx, 230 + col * 96, 1360 - row * 96, 46, 0); }
      wombat(ctx, 300, 1000, 0.55, t, { mood: 'smug' });
      C.person(ctx, 780, 1330, 1.0 * pop(t, ev.mueble - 0.3, 0.45), { eyes: 'worried', mouth: 'wavy', brows: 'worried', style: { shirt: '#FFD22E' } });
      if (t > ev.mueble - 0.3) for (let i = 0; i < 5; i++) G.rrect(ctx, 640 + i * 60, 1450 + Math.sin(t * 2 + i) * 6, 50, 14, 4, { fill: '#D9B27E', lw: 3, seed: 990 + i });
      if (t > ev.gil - 0.05) C.text(ctx, '¡GIL!', CX, 780, { size: 170 * pop(t, ev.gil, 0.35), color: '#FFD22E', stroke: '#0b1030', strokeW: 16 });
      return ['Inventó', 'el *Lego* con la cola'];
    },
  ]);
})();
