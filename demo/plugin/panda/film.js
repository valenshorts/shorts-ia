// El panda (versión puteada)
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = {
    carnivoro: cue(0, 'carnívoro'), pelotudo: cue(0, 'pelotudo'), bambu: cue(0, 'bambú'),
    veinte: cue(1, 'veinte'), entero: cue(1, 'entero'), concha: cue(1, 'concha'),
    dieciseis: cue(2, 'dieciséis'), boludo: cue(2, 'boludo'), hambre: cue(2, 'hambre'),
    caga: cue(3, 'caga'), cuarenta: cue(3, 'cuarenta'), fabrica: cue(3, 'fábrica'), peluche: cue(3, 'peluche'),
    pulgar: cue(4, 'pulgar'), muneca: cue(4, 'muñeca'), chanta: cue(4, 'chanta'),
    dos: cue(5, 'dos'), ano: cue(5, 'año'), macho: cue(5, 'macho'), gil: cue(5, 'gil'),
    cien: cue(6, 'cien'), novecientas: cue(6, 'novecientas'), chorizo: cue(6, 'chorizo'),
    ama: cue(7, 'ama'), lindo: cue(7, 'lindo'), salva: cue(7, 'salva'), puta: cue(7, 'puta'),
  };
  const WH = '#F4F1EA', BK = '#22232B', GR = '#5FB04A', GD = '#2F6A2A', POO = '#7A5A2A';
  const shake = (t, t0, amp = 22, d = 0.45) => { const k = clamp(1 - (t - t0) / d); return t >= t0 && k > 0 ? [Math.sin(t * 70) * amp * k, Math.cos(t * 61) * amp * k] : [0, 0]; };
  function forest(ctx, t) {
    C.bg(ctx, '#BFE6C0', '#F4F0D8');
    for (let i = 0; i < 7; i++) bamboo(ctx, 40 + i * 170 + (i % 2) * 40, 1350, 900 + (i % 3) * 120, 900 + i, 0.35);
    G.poly(ctx, [[-60, 1320], [1140, 1300], [1140, 2000], [-60, 2000]], { fill: '#8CC66A', lw: 6, seed: 880 });
  }
  function bamboo(ctx, x, y, h, seed, alpha = 1) {
    ctx.save(); ctx.globalAlpha = alpha;
    const seg = 150;
    for (let k = 0; k * seg < h; k++) {
      const yy = y - (k + 1) * seg;
      G.rrect(ctx, x - 22, yy, 44, seg, 12, { fill: GR, lw: 5, seed: seed * 7 + k });
      G.line(ctx, [[x - 24, yy + 2], [x + 24, yy + 2]], { color: GD, lw: 6, seed: seed * 11 + k });
      if (k % 2) G.poly(ctx, [[x + 20, yy + 20], [x + 110, yy - 20], [x + 30, yy + 40]], { fill: '#7FCB5A', lw: 4, seed: seed * 13 + k });
    }
    ctx.restore();
  }
  function poo(ctx, x, y, s, seed, alpha = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = alpha;
    G.ellipse(ctx, 0, 0, 60, 26, { fill: POO, lw: 5, seed });
    G.ellipse(ctx, 0, -28, 44, 22, { fill: POO, lw: 5, seed: seed + 1 });
    G.ellipse(ctx, 0, -52, 28, 18, { fill: POO, lw: 5, seed: seed + 2 });
    ctx.restore();
  }
  // panda sentado de frente. o: { chew, mood: 'happy'|'angry'|'dumb'|'smug', blush, wink, look }
  function panda(ctx, x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    G.ellipse(ctx, -120, 180, 80, 60, { fill: BK, lw: 6, seed: 900 });
    G.ellipse(ctx, 120, 180, 80, 60, { fill: BK, lw: 6, seed: 901 });
    G.ellipse(ctx, 0, 60, 200, 175, { fill: WH, lw: 7, seed: 902 });
    G.rrect(ctx, -195, -60, 390, 90, 45, { fill: BK, lw: 6, seed: 903 });
    const ch = o.chew ? Math.sin(t * 12) : 0;
    if (o.chew) {
      G.limb(ctx, [[-170, -10], [-110, -120 + ch * 10]], { color: BK, lw: 70, ink: BK, outline: 5, seed: 904 });
      bamboo(ctx, -70, -60 + ch * 8, 300, 905);
    } else {
      G.limb(ctx, [[-170, -10], [-220, 120]], { color: BK, lw: 70, ink: BK, outline: 5, seed: 906 });
    }
    G.limb(ctx, [[170, -10], [220, 120]], { color: BK, lw: 70, ink: BK, outline: 5, seed: 907 });
    ctx.save(); ctx.translate(0, -190);
    G.ellipse(ctx, -105, -100, 48, 44, { fill: BK, lw: 6, seed: 908 });
    G.ellipse(ctx, 105, -100, 48, 44, { fill: BK, lw: 6, seed: 909 });
    G.ellipse(ctx, 0, 0, 160, 130, { fill: WH, lw: 7, seed: 910 });
    G.ellipse(ctx, -58, -10, 40, 52, { fill: BK, lw: 0, seed: 911 });
    G.ellipse(ctx, 58, -10, 40, 52, { fill: BK, lw: 0, seed: 912 });
    const lk = o.look || 0;
    if (o.wink) G.line(ctx, [[-75, -12], [-40, -12]], { color: '#fff', lw: 7, seed: 913 });
    else { G.ellipse(ctx, -55, -14, 15, 15, { fill: '#fff', lw: 0, seed: 914 }); G.ellipse(ctx, -55 + lk * 6, -12, 7, 7, { fill: '#111', lw: 0, seed: 915 }); }
    G.ellipse(ctx, 55, -14, 15, 15, { fill: '#fff', lw: 0, seed: 916 }); G.ellipse(ctx, 55 + lk * 6, -12, 7, 7, { fill: '#111', lw: 0, seed: 917 });
    if (o.mood === 'angry') { G.line(ctx, [[-90, -62], [-30, -44]], { lw: 7, seed: 918 }); G.line(ctx, [[90, -62], [30, -44]], { lw: 7, seed: 919 }); }
    G.ellipse(ctx, 0, 40, 24, 16, { fill: BK, lw: 0, seed: 920 });
    if (o.chew) G.ellipse(ctx, 0, 78, 22, 10 + Math.abs(ch) * 10, { fill: '#7A2A3A', lw: 4, seed: 921 });
    else if (o.mood === 'dumb') { G.ellipse(ctx, 0, 82, 26, 20, { fill: '#7A2A3A', lw: 4, seed: 922 }); }
    else G.line(ctx, [[-30, 72], [0, 84], [30, 72]], { lw: 6, seed: 923 });
    if (o.blush) { G.ellipse(ctx, -100, 45, 22, 12, { fill: '#FF9AB4', lw: 0, seed: 924, alpha: 0.8 }); G.ellipse(ctx, 100, 45, 22, 12, { fill: '#FF9AB4', lw: 0, seed: 925, alpha: 0.8 }); }
    ctx.restore();
    ctx.restore();
  }
  C.film([
    function hook(ctx, t, a) {
      forest(ctx, t);
      const [sx, sy] = shake(t, ev.pelotudo, 22);
      ctx.save(); ctx.translate(sx, sy);
      const meat = t > ev.carnivoro - 0.2, bb = t > ev.bambu - 0.2;
      if (meat && !bb) { ctx.save(); ctx.translate(250, 860); ctx.scale(pop(t, ev.carnivoro - 0.2, 0.4), pop(t, ev.carnivoro - 0.2, 0.4));
        G.ellipse(ctx, 0, 0, 110, 75, { fill: '#C8404A', lw: 6, seed: 930 }); G.ellipse(ctx, -10, -5, 60, 35, { fill: '#F2C8B8', lw: 4, seed: 931 });
        G.rrect(ctx, 90, -14, 90, 28, 12, { fill: '#F4EDE0', lw: 5, seed: 932 }); ctx.restore(); }
      if (bb) bamboo(ctx, 830, 1400, 760 * out(t, ev.bambu - 0.2, 0.5), 933);
      panda(ctx, CX - 40, 1180, 1.05 * (0.6 + 0.4 * pop(t, a, 0.5)), t, { chew: bb, mood: t > ev.pelotudo && !bb ? 'dumb' : 'happy' });
      ctx.restore();
      C.pill(ctx, t, ev.carnivoro, 'carnívoro', 280, 700, '#E8324A');
      return ['Es un carnívoro', 'que come *bambú*'];
    },
    function digiere(ctx, t, a) {
      forest(ctx, t);
      panda(ctx, 330, 1250, 0.75 * pop(t, a, 0.5), t, { chew: true });
      const p = out(t, ev.veinte - 0.2, 0.8), x0 = 160, w = 760;
      G.rrect(ctx, x0, 760, w, 110, 30, { fill: '#fff', lw: 7, seed: 940 });
      if (p > 0) G.rrect(ctx, x0, 760, w * 0.2 * p, 110, 30, { fill: GR, lw: 0, seed: 941 });
      if (t > ev.entero - 0.2) { const q = out(t, ev.entero - 0.2, 0.7); G.rrect(ctx, x0 + w * 0.2, 760, w * 0.8 * q, 110, 30, { fill: POO, lw: 0, seed: 942 }); }
      C.count(ctx, t, ev.veinte - 0.2, 20, CX, 700, { suf: ' %', size: 120 });
      if (t > ev.entero) for (let i = 0; i < 5; i++) poo(ctx, 640 + (i % 3) * 120, 1500 - Math.floor(i / 3) * 70, 0.9 * pop(t, ev.entero + i * 0.12, 0.35), 943 + i * 3);
      C.pill(ctx, t, ev.entero, 'el resto, entero', 760, 950, '#C8A050');
      return ['Digiere apenas', 'un *20 %*'];
    },
    function come(ctx, t, a) {
      forest(ctx, t);
      ctx.save(); ctx.translate(800, 820);
      G.ellipse(ctx, 0, 0, 150, 150, { fill: '#fff', lw: 8, seed: 950 });
      const sp = t > ev.dieciseis - 0.2 ? (t - ev.dieciseis) * 9 : 0;
      ctx.save(); ctx.rotate(sp); G.line(ctx, [[0, 0], [0, -120]], { lw: 9, seed: 951 }); ctx.restore();
      ctx.save(); ctx.rotate(sp / 12); G.line(ctx, [[0, 0], [70, 0]], { lw: 12, seed: 952 }); ctx.restore();
      ctx.restore();
      panda(ctx, 380, 1230, 0.85 * pop(t, a, 0.5), t, { chew: true, mood: t > ev.boludo ? 'dumb' : 'happy' });
      C.count(ctx, t, ev.dieciseis - 0.2, 16, 800, 1080, { suf: ' H', size: 120 });
      C.pill(ctx, t, ev.hambre, 'para no morirse de hambre', CX, 1520, '#FFD22E');
      return ['Come hasta', '*16 horas* por día'];
    },
    function caca(ctx, t, a) {
      forest(ctx, t);
      const n = t > ev.cuarenta - 0.2 ? Math.round(40 * out(t, ev.cuarenta - 0.2, 1.4)) : (t > ev.caga ? 3 : 0);
      for (let i = 0; i < n; i++) { const c = i % 10, r = Math.floor(i / 10); poo(ctx, 110 + c * 95 + (r % 2) * 40, 1600 - r * 70, 0.6, 960 + (i % 9) * 3); }
      panda(ctx, CX, 1080, 0.8 * pop(t, a, 0.5), t, { mood: 'smug', blush: t > ev.peluche });
      C.count(ctx, t, ev.cuarenta - 0.2, 40, CX, 680, { suf: ' VECES', size: 110 });
      if (t > ev.fabrica) C.text(ctx, 'FÁBRICA', CX, 1340, { size: 110 * pop(t, ev.fabrica, 0.35), color: '#fff', stroke: '#0b1030', strokeW: 12 });
      return ['Va al baño', '*40 veces* por día'];
    },
    function pulgar(ctx, t, a) {
      C.bg(ctx, '#CFE8F8', '#F4F8FF');
      ctx.save(); ctx.translate(CX, 1150); const s = 1.2 * pop(t, a, 0.5); ctx.scale(s, s);
      G.ellipse(ctx, 0, 0, 230, 210, { fill: BK, lw: 8, seed: 970 });
      G.ellipse(ctx, 0, 40, 120, 95, { fill: '#5A4A50', lw: 5, seed: 971 });
      for (let i = 0; i < 5; i++) G.ellipse(ctx, -150 + i * 75, -150 - Math.sin(i / 4 * Math.PI) * 40, 38, 34, { fill: '#5A4A50', lw: 5, seed: 972 + i });
      const hi = t > ev.pulgar - 0.2, pulse = hi ? 1 + 0.08 * Math.sin(t * 10) : 1;
      ctx.save(); ctx.translate(-230, 60); ctx.scale(pulse, pulse);
      G.ellipse(ctx, 0, 0, 55, 70, { fill: hi ? '#FFD22E' : '#5A4A50', lw: 6, seed: 978 }); ctx.restore();
      if (t > ev.chanta) { G.line(ctx, [[-300, -20], [-160, 140]], { color: '#E8324A', lw: 14, seed: 979 }); G.line(ctx, [[-160, -20], [-300, 140]], { color: '#E8324A', lw: 14, seed: 980 }); }
      ctx.restore();
      bamboo(ctx, 900, 1600, 700 * out(t, a, 0.6), 981);
      C.pill(ctx, t, ev.pulgar, 'pulgar trucho', 300, 760, '#FFD22E');
      C.pill(ctx, t, ev.muneca, 'hueso de la muñeca', 760, 860, '#7FD4FF');
      return ['Tiene un', '*pulgar trucho*'];
    },
    function celo(ctx, t, a) {
      forest(ctx, t);
      ctx.save(); ctx.translate(CX, 830); const s = pop(t, a, 0.45); ctx.scale(s, s);
      G.rrect(ctx, -330, -200, 660, 400, 30, { fill: '#fff', lw: 7, seed: 990 });
      G.rrect(ctx, -330, -200, 660, 80, 30, { fill: '#E8324A', lw: 7, seed: 991 });
      C.text(ctx, '365 DÍAS', 0, -140, { size: 46, color: '#fff', shadow: false });
      for (let i = 0; i < 52; i++) { const c = i % 13, r = Math.floor(i / 13), hot = i === 30 || i === 31;
        G.rrect(ctx, -300 + c * 46, -90 + r * 66, 36, 50, 8, { fill: hot && t > ev.dos - 0.1 ? '#FFD22E' : '#E4E8F0', lw: 3, seed: 992 + (i % 7) }); }
      ctx.restore();
      const ign = t > ev.macho - 0.2;
      panda(ctx, 330, 1250, 0.6, t, { chew: ign, mood: ign ? 'dumb' : 'happy' });
      panda(ctx, 780, 1260, 0.55, t, { blush: true, mood: t > ev.gil ? 'angry' : 'happy' });
      if (!ign && t > ev.dos) G.heart(ctx, 780, 930 + Math.sin(t * 3) * 15, 1.6, { fill: '#FF6A8A' });
      if (t > ev.gil) C.text(ctx, '¡GIL!', 780, 920, { size: 110 * pop(t, ev.gil, 0.35), color: '#FFD22E', stroke: '#0b1030', strokeW: 12 });
      return ['Dos o tres días', '*al año*'];
    },
    function cria(ctx, t, a) {
      forest(ctx, t);
      panda(ctx, 360, 1200, 0.95 * pop(t, a, 0.5), t, { mood: 'happy' });
      const bs = pop(t, ev.cien - 0.3, 0.4);
      if (bs > 0) { ctx.save(); ctx.translate(800, 1170); ctx.scale(bs, bs);
        G.ellipse(ctx, 0, 0, 70, 34, { fill: '#FFB3C6', lw: 5, seed: 1000 }); G.ellipse(ctx, 55, -6, 30, 26, { fill: '#FFB3C6', lw: 5, seed: 1001 });
        G.line(ctx, [[58, -12], [72, -12]], { lw: 4, seed: 1002 }); ctx.restore(); }
      C.count(ctx, t, ev.cien - 0.2, 100, 800, 1030, { suf: ' G', size: 100 });
      C.count(ctx, t, ev.novecientas - 0.2, 900, 780, 760, { pre: '÷', size: 120 });
      C.pill(ctx, t, ev.chorizo, 'chorizo rosado', 800, 1290, '#FF8AB0');
      return ['La cría pesa', '*100 gramos*'];
    },
    function cierre(ctx, t, a) {
      C.bg(ctx, '#FFD0E0', '#FFF2D8');
      if (t > ev.lindo - 0.1) G.rays(ctx, CX, 1100, { n: 18, r0: 300, r1: 1300, color: '#FFD22E', lw: 10, alpha: 0.25, spin: t * 0.4 });
      for (let i = 0; i < 14; i++) { const p = ((t - a) * 0.25 + i / 14) % 1; G.heart(ctx, (i * 151) % 1080, 500 + p * 1400, 1 + (i % 3) * 0.4, { fill: i % 2 ? '#FF6A8A' : '#FF9AB4', seed: 1010 + i }); }
      panda(ctx, CX, 1230, 0.85 * pop(t, a, 0.5), t, { blush: true, wink: t > ev.lindo, mood: 'happy' });
      C.pill(ctx, t, ev.ama, 'medio mundo lo ama', CX, 640, '#FF8AB0');
      if (t > ev.salva - 0.05) C.text(ctx, 'SER LINDO SALVA', CX, 800, { size: 96 * pop(t, ev.salva, 0.35), color: '#FFD22E', stroke: '#0b1030', strokeW: 14 });
      return ['Ser lindo', 'te *salva de todo*'];
    },
  ]);
})();
