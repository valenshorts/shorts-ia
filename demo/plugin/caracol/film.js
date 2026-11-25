// El caracol (versión puteada)
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = {
    baboso: cue(0, 'baboso'), dientes: cue(0, 'dientes'), familia: cue(0, 'familia'),
    miles: cue(1, 'miles'), rallador: cue(1, 'rallador'), forro: cue(1, 'forro'),
    gastando: cue(2, 'gastando'), nuevos: cue(2, 'nuevos'), dentista: cue(2, 'dentista'), reconcha: cue(2, 'reconcha'),
    lentisimo: cue(3, 'lentísimo'), cuarto: cue(3, 'cuarto'), metro: cue(3, 'metro'), pelotudo: cue(3, 'pelotudo'),
    calor: cue(4, 'calor'), encierra: cue(4, 'encierra'), meses: cue(4, 'meses'), anos: cue(4, 'años'),
    baba: cue(5, 'baba'), navaja: cue(5, 'navaja'), mil: cue(5, 'mil'),
    baboso2: cue(6, 'baboso'), gil: cue(6, 'gil'), madre: cue(6, 'madre'),
  };
  const BODY = '#C8B48A', BD = '#6A5A3A', SHELL = '#B8642A';
  const shake = (t, t0, amp = 22, d = 0.45) => { const k = clamp(1 - (t - t0) / d); return t >= t0 && k > 0 ? [Math.sin(t * 70) * amp * k, Math.cos(t * 61) * amp * k] : [0, 0]; };
  function garden(ctx, t, top = '#5AA8C8', bot = '#C8E8D8') {
    C.bg(ctx, top, bot);
    for (let i = 0; i < 7; i++) { const x = 40 + i * 170, h = 260 + (i % 3) * 90, sw = Math.sin(t * 1.4 + i) * 16;
      G.limb(ctx, [[x, 1500], [x + sw, 1500 - h * 0.5], [x + sw * 1.6, 1500 - h]], { color: '#3FAF5A', lw: 20, ink: '#1a5a2a', outline: 3, seed: 700 + i });
      ctx.save(); ctx.translate(x + sw * 1.6, 1500 - h); ctx.rotate(Math.sin(t + i) * 0.3); G.ellipse(ctx, 30, 0, 50, 20, { fill: '#4FC86A', lw: 4, seed: 710 + i }); ctx.restore(); }
    G.poly(ctx, [[-60, 1500], [1140, 1480], [1140, 2000], [-60, 2000]], { fill: '#7A5A3A', lw: 6, seed: 720 });
    for (let i = 0; i < 10; i++) { const x = (i * 131 + t * 30) % 1180 - 50, y = 700 + (i * 97) % 600; ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 3 + i % 3, 0, 7); ctx.fill(); ctx.restore(); }
  }
  // caracol de costado mirando a la derecha. o: { hide 0..1 (se mete), mood, slime, teeth }
  function snail(ctx, x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const hide = o.hide || 0, ex = 1 - hide, wob = Math.sin(t * 3) * 4;
    if (o.slime) { ctx.save(); ctx.globalAlpha = 0.5; G.rrect(ctx, -700, 70, 760, 22, 11, { fill: '#BFF0FF', lw: 0, seed: 730 }); ctx.restore(); }
    if (ex > 0.05) {
      G.rrect(ctx, -180, 20, 380 * ex + 60, 70, 35, { fill: BODY, lw: 6, seed: 731 });
      const hx = -180 + 380 * ex + 20;
      G.limb(ctx, [[hx - 20, 40], [hx + 10, -40 * ex], [hx + 20 + wob, -150 * ex]], { color: BODY, lw: 18, ink: BD, outline: 4, seed: 732 });
      G.limb(ctx, [[hx - 50, 40], [hx - 40, -30 * ex], [hx - 50 - wob, -130 * ex]], { color: BODY, lw: 18, ink: BD, outline: 4, seed: 733 });
      if (ex > 0.6) { G.ellipse(ctx, hx + 20 + wob, -160, 16, 16, { fill: '#fff', lw: 3, seed: 734 }); G.ellipse(ctx, hx + 22 + wob, -158, 7, 7, { fill: '#111', lw: 0, seed: 735 });
        G.ellipse(ctx, hx - 50 - wob, -140, 15, 15, { fill: '#fff', lw: 3, seed: 736 }); G.ellipse(ctx, hx - 48 - wob, -138, 7, 7, { fill: '#111', lw: 0, seed: 737 });
        if (o.mood === 'angry') { G.line(ctx, [[hx + 2, -184], [hx + 34, -176]], { lw: 5, seed: 738 }); G.line(ctx, [[hx - 66, -164], [hx - 36, -156]], { lw: 5, seed: 739 }); }
        if (o.teeth) { G.rrect(ctx, hx - 10, 30, 70, 34, 12, { fill: '#5a1a14', lw: 4, seed: 740 }); for (let k = 0; k < 5; k++) G.poly(ctx, [[hx - 4 + k * 13, 32], [hx + 2 + k * 13, 46], [hx + 8 + k * 13, 32]], { fill: '#fff', lw: 2, seed: 741 + k }); }
        else G.line(ctx, [[hx + 10, 50], [hx + 30, 58], [hx + 48, 50]], { lw: 5, seed: 746 }); }
    }
    // caparazón con espiral
    G.ellipse(ctx, -60, -60, 150, 140, { fill: SHELL, lw: 7, seed: 750 });
    const pts = []; for (let k = 0; k < 60; k++) { const an = k * 0.22, r = 120 - k * 1.9; pts.push([-60 + Math.cos(an) * r, -60 + Math.sin(an) * r * 0.93]); }
    G.line(ctx, pts, { color: '#7A3A12', lw: 8, seed: 751 });
    G.ellipse(ctx, -110, -130, 30, 18, { fill: 'rgba(255,230,190,0.4)', lw: 0, seed: 752 });
    ctx.restore();
  }
  C.film([
    function hook(ctx, t, a) {
      garden(ctx, t);
      const [sx, sy] = shake(t, ev.dientes, 22);
      ctx.save(); ctx.translate(sx, sy);
      snail(ctx, CX - 40, 1300, 1.5 * (0.6 + 0.4 * pop(t, a, 0.5)), t, { teeth: t > ev.dientes - 0.1 });
      ctx.restore();
      if (t > ev.familia - 0.2) for (let i = 0; i < 4; i++) C.person(ctx, 180 + i * 230, 1700, 0.5 * pop(t, ev.familia - 0.2 + i * 0.08, 0.35), { eyes: 'wide', mouth: 'o', style: { shirt: ['#19B8B2', '#FFD22E', '#5FB8FF', '#FF8AB0'][i] } });
      C.pill(ctx, t, ev.baboso, 'este baboso', CX, 700, '#BFF0FF');
      return ['Escuchame, chabón', 'tiene más *dientes* que vos'];
    },
    function dientes(ctx, t, a) {
      C.bg(ctx, '#3A1A2A', '#7A3A4A');
      const pr = pop(t, a, 0.5), scroll = (t * 60) % 80;
      ctx.save(); ctx.translate(CX, 1000); ctx.scale(pr, pr);
      G.rrect(ctx, -420, -260, 840, 520, 120, { fill: '#E88AA0', lw: 8, seed: 760 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(-400, -240, 800, 480, 110); ctx.clip();
      for (let r = 0; r < 8; r++) for (let c = -1; c < 12; c++) { const x = -420 + c * 80 + (r % 2) * 40 - scroll, y = -220 + r * 60;
        G.poly(ctx, [[x, y + 40], [x + 20, y], [x + 40, y + 40]], { fill: '#FFF8F0', lw: 3, seed: 761 + ((r * 13 + c) & 15) }); }
      ctx.restore(); ctx.restore();
      C.count(ctx, t, ev.miles - 0.2, 20000, CX, 1430 - 160, { pre: '+', size: 110 });
      C.pill(ctx, t, ev.rallador, 'como un rallador', CX, 680, '#FFD22E');
      return ['Tiene miles de', '*dientitos* en la lengua'];
    },
    function crecen(ctx, t, a) {
      C.bg(ctx, '#1A3A5A', '#3A7AAA');
      const [sx, sy] = shake(t, ev.reconcha, 26, 0.6);
      ctx.save(); ctx.translate(sx, sy);
      snail(ctx, 360, 1250, 1.1 * pop(t, a, 0.5), t, { teeth: true });
      for (let i = 0; i < 6; i++) { const p = ((t - ev.nuevos) * 0.9 + i / 6) % 1; if (t < ev.nuevos) break; ctx.save(); ctx.globalAlpha = 1 - p; G.poly(ctx, [[600 + i * 50, 1100 - p * 300 + 30], [612 + i * 50, 1100 - p * 300], [624 + i * 50, 1100 - p * 300 + 30]], { fill: '#fff', lw: 2, seed: 780 + i }); ctx.restore(); }
      ctx.restore();
      const pd = pop(t, ev.dentista - 0.2, 0.4);
      if (pd > 0) { C.person(ctx, 820, 1360, 0.9 * pd, { eyes: 'worried', mouth: 'wavy', style: { shirt: '#F4F8FF' } }); C.text(ctx, '$0', 820, 860, { size: 120 * pd, color: '#3FE07A', stroke: '#0b1030', strokeW: 12 }); }
      return ['Se le gastan y', 'le crecen *nuevos*'];
    },
    function lento(ctx, t, a) {
      garden(ctx, t);
      G.rrect(ctx, 80, 1520, 920, 24, 6, { fill: '#F2D24A', lw: 4, seed: 790 }); for (let k = 0; k <= 10; k++) G.line(ctx, [[80 + k * 92, 1520], [80 + k * 92, 1500 - (k % 5 ? 0 : 20)]], { lw: 4, seed: 791 + k });
      C.text(ctx, '1 METRO', CX, 1600, { size: 50, color: '#fff', stroke: '#0b1030', strokeW: 8 });
      const p = clamp((t - a) / 30); snail(ctx, 200 + p * 900, 1420, 0.7 * pop(t, a, 0.5), t, { slime: true });
      const pc = pop(t, ev.cuarto - 0.2, 0.4);
      if (pc > 0) { ctx.save(); ctx.translate(800, 820); ctx.scale(pc, pc); G.ellipse(ctx, 0, 0, 120, 120, { fill: '#fff', lw: 7, seed: 802 });
        ctx.fillStyle = 'rgba(232,50,74,0.85)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 105, -Math.PI / 2, -Math.PI / 2 + Math.PI / 2 * clamp((t - ev.cuarto) / 1.5)); ctx.fill(); ctx.restore();
        C.text(ctx, '15 MIN', 800, 1010, { size: 64 * pc, color: '#FFD22E', stroke: '#0b1030', strokeW: 10 }); }
      return ['Es lentísimo', '*15 minutos* por metro'];
    },
    function duerme(ctx, t, a) {
      C.bg(ctx, '#FFB347', '#E8632A');
      C.glow(ctx, 850, 560, 300, '255,240,150', 0.7); G.ellipse(ctx, 850, 560, 110, 110, { fill: '#FFE14A', lw: 6, seed: 810 });
      G.rays(ctx, 850, 560, { n: 16, r0: 140, r1: 230, color: '#FFE14A', lw: 8, alpha: 0.8, spin: t * 0.6 });
      G.poly(ctx, [[-60, 1450], [1140, 1430], [1140, 2000], [-60, 2000]], { fill: '#C89A5A', lw: 6, seed: 811 });
      snail(ctx, 420, 1330, 1.3 * pop(t, a, 0.5), t, { hide: out(t, ev.encierra, 0.8) });
      if (t > ev.encierra + 0.5) for (let i = 0; i < 3; i++) { const p = (t * 0.6 + i / 3) % 1; C.text(ctx, 'Z', 470 + p * 90, 1080 - p * 200, { size: 40 + 40 * p, color: '#fff', alpha: 1 - p, stroke: '#0b1030', strokeW: 6 }); }
      if (t > ev.meses - 0.1) C.text(ctx, t > ev.anos - 0.1 ? '¡AÑOS!' : 'MESES', 760, 1000, { size: 105 * pop(t, t > ev.anos - 0.1 ? ev.anos - 0.1 : ev.meses - 0.1, 0.35), color: '#FFD22E', stroke: '#0b1030', strokeW: 14 });
      return ['Si hace calor', 'se tira a *dormir*'];
    },
    function baba(ctx, t, a) {
      C.bg(ctx, '#2A2A3A', '#5A5A7A');
      const p = clamp((t - a) / 4);
      G.poly(ctx, [[60, 1260], [1020, 1260], [1020, 1300], [60, 1340]], { fill: '#D8DCE8', lw: 6, seed: 820 }); // navaja
      G.line(ctx, [[60, 1258], [1020, 1258]], { color: '#fff', lw: 4, seed: 821 });
      G.rrect(ctx, 1000, 1240, 120, 110, 20, { fill: '#3A2A2A', lw: 6, seed: 822 });
      snail(ctx, lerp(150, 760, p), 1160, 0.9 * pop(t, a, 0.5), t, { slime: true });
      C.pill(ctx, t, ev.baba, 'su baba lo protege', CX, 760, '#BFF0FF');
      if (t > ev.navaja) C.pill(ctx, t, ev.navaja + 0.2, 'ni un rasguño', CX, 1460 - 120, '#3FE07A');
      return ['Camina sobre su baba', 'por el filo de una *navaja*'];
    },
    function cierre(ctx, t, a) {
      garden(ctx, t, '#2A2A5A', '#5A4A8A');
      if (t > ev.madre - 0.1) G.rays(ctx, CX, 1000, { n: 18, r0: 300, r1: 1300, color: '#FFD22E', lw: 10, alpha: 0.2, spin: t * 0.4 });
      snail(ctx, 380, 1360, 1.0 * pop(t, a, 0.5), t, { mood: 'angry' });
      C.person(ctx, 820, 1400, 0.95 * pop(t, ev.baboso2 - 0.2, 0.45), { eyes: 'wide', mouth: 'smirk', style: { shirt: '#FFD22E' } });
      if (t > ev.gil - 0.05) C.text(ctx, '¡ES UN ELOGIO, GIL!', CX, 780, { size: 86 * pop(t, ev.gil, 0.35), color: '#FFD22E', stroke: '#0b1030', strokeW: 12 });
      return ['Si te dicen baboso', '*agradecé*'];
    },
  ]);
})();
