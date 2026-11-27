// Venus (versión puteada). Zona útil: y 560-1340 (abajo van los subtítulos).
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, pop, out, cue } = C;
  const ev = {
    anio: cue(0, 'año'), gil: cue(0, 'gil'),
    doscientos: cue(1, 'doscientos'), lunes: cue(1, 'lunes'),
    veinticinco: cue(2, 'veinticinco'), termina: cue(2, 'termina'),
    reves: cue(3, 'revés'), oeste: cue(3, 'oeste'), tio: cue(3, 'tío'),
    grados: cue(4, 'grados'), mercurio: cue(4, 'mercurio'), horno: cue(4, 'horno'),
    venus: cue(5, 'venus'), cocinas: cue(5, 'cocinás'),
  };
  const VE = '#E8A050', VD = '#B86A2A';
  function venus(ctx, x, y, r, t, rot = 0, hot = 0) {
    r = Math.max(8, r);
    if (hot > 0) C.glow(ctx, x, y, r * 1.8, '255,90,40', 0.5 * hot);
    G.ellipse(ctx, x, y, r, r, { fill: VE, lw: 7, seed: 300 });
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r - 4, 0, 7); ctx.clip();
    for (let i = 0; i < 5; i++) { const yy = y - r + (i + 0.5) * (2 * r / 5), off = ((rot * r * 2 + i * 70) % (r * 2)) - r;
      G.line(ctx, [[x - r * 1.2 + off, yy], [x - r * 0.2 + off, yy + 14], [x + r * 0.8 + off, yy]], { color: VD, lw: 10, seed: 301 + i }); }
    ctx.restore();
    // marca para que se vea que gira
    const a = rot * Math.PI * 2; if (Math.cos(a) > 0) G.ellipse(ctx, x + Math.sin(a) * r * 0.7, y - r * 0.2, 16 * Math.cos(a) + 4, 16, { fill: '#fff', lw: 4, seed: 309 });
  }
  function sun(ctx, x, y, r, t) { C.glow(ctx, x, y, r * 2.2, '255,220,100', 0.55); G.rays(ctx, x, y, { n: 14, r0: r * 1.1, r1: r * 1.6, color: '#FFD22E', lw: 8, alpha: 0.8, spin: t * 0.3 }); G.ellipse(ctx, x, y, r, r, { fill: '#FFD84A', lw: 6, seed: 310 }); }
  const BIG = (ctx, t, t0, s, x, y, color = '#FFD22E', size = 100) => { if (t > t0) C.text(ctx, s, x, y, { size: size * pop(t, t0, 0.35), color, stroke: '#0b1030', strokeW: 14 }); };
  C.film([
    function hook(ctx, t, a) {
      C.space(ctx, t);
      venus(ctx, CX, 950, 260 * pop(t, a, 0.5), t, (t - a) * 0.05);
      if (t > ev.anio - 0.2) { C.pill(ctx, t, ev.anio - 0.2, '1 día', 300, 1280, '#FFD22E'); C.text(ctx, '>', CX, 1300, { size: 110 * pop(t, ev.anio, 0.3), color: '#fff', stroke: '#0b1030', strokeW: 10 }); C.pill(ctx, t, ev.anio, '1 año', 780, 1280, '#7FD4FF'); }
      BIG(ctx, t, ev.gil, '¿QUÉ?', CX, 650, '#fff', 110);
      return ['En Venus', 'un día dura *más que un año*'];
    },
    function dia(ctx, t, a) {
      C.space(ctx, t);
      venus(ctx, 330, 1000, 210 * pop(t, a, 0.5), t, (t - a) * 0.03);
      C.count(ctx, t, ev.doscientos - 0.2, 243, 790, 900, { suf: ' DÍAS', size: 100 });
      C.pill(ctx, t, ev.doscientos, 'una vuelta sobre sí', 790, 1010, '#FFD22E');
      if (t > ev.lunes) { ctx.save(); ctx.translate(790, 1220); const s = pop(t, ev.lunes, 0.4); ctx.scale(s, s); G.rrect(ctx, -90, -60, 180, 120, 18, { fill: '#fff', lw: 6, seed: 320 }); G.rrect(ctx, -90, -60, 180, 36, 18, { fill: '#E8324A', lw: 6, seed: 321 }); C.text(ctx, 'LUNES', 0, 30, { size: 38, color: '#0b1030', shadow: false }); ctx.restore(); }
      return ['Un día en Venus', 'dura *243 días*'];
    },
    function anio(ctx, t, a) {
      C.space(ctx, t);
      sun(ctx, CX, 950, 110, t);
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 4; ctx.setLineDash([16, 14]); ctx.beginPath(); ctx.ellipse(CX, 950, 330, 250, 0, 0, 7); ctx.stroke(); ctx.restore();
      const ang = (t - a) * 0.9; venus(ctx, CX + Math.cos(ang) * 330, 950 + Math.sin(ang) * 250, 70, t, (t - a) * 0.05);
      C.count(ctx, t, ev.veinticinco - 0.2, 225, CX, 660, { suf: ' DÍAS', size: 100, color: '#7FD4FF' });
      if (t > ev.termina) C.pill(ctx, t, ev.termina, 'el año termina antes', CX, 1300, '#FFD22E');
      return ['Y da la vuelta al Sol', 'en *225 días*'];
    },
    function reves(ctx, t, a) {
      C.bg(ctx, '#3A1A4A', '#E88A40');
      G.poly(ctx, [[-60, 1180], [1140, 1160], [1140, 1360], [-60, 1360]], { fill: '#8A4A2A', lw: 6, seed: 330 });
      const rise = out(t, ev.oeste - 0.4, 1.6);
      sun(ctx, 220, lerp(1220, 860, rise), 80, t);
      C.pill(ctx, t, ev.oeste - 0.2, 'oeste', 220, 1290, '#FFD22E');
      C.pill(ctx, t, ev.oeste - 0.2, 'este', 860, 1290, '#7FD4FF');
      if (t > ev.reves - 0.2) { ctx.save(); ctx.translate(CX, 700); ctx.rotate(-(t - a) * 1.5); ctx.strokeStyle = '#fff'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, 0, 90, 0.3, Math.PI * 1.7); ctx.stroke(); G.poly(ctx, [[90 * Math.cos(0.3) - 20, 90 * Math.sin(0.3) - 10], [90 * Math.cos(0.3) + 26, 90 * Math.sin(0.3) - 10], [90 * Math.cos(0.3) + 4, 90 * Math.sin(0.3) + 30]], { fill: '#fff', lw: 0, seed: 331 }); ctx.restore(); }
      if (t > ev.tio) C.person(ctx, 820, 1180, 0.8 * pop(t, ev.tio - 0.2, 0.4), { pose: 'stand', eyes: 'focus', mouth: 'flat', style: { shirt: '#C83A3A' } });
      return ['Gira al revés', 'el Sol sale por *el oeste*'];
    },
    function calor(ctx, t, a) {
      C.space(ctx, t, '#2A0808', '#5A1A10');
      const hot = out(t, ev.grados - 0.3, 1);
      venus(ctx, 330, 1000, 200 * pop(t, a, 0.5), t, (t - a) * 0.03, hot);
      if (t > ev.mercurio - 0.2) { G.ellipse(ctx, 170, 700, 46 * pop(t, ev.mercurio - 0.2, 0.4), 46 * pop(t, ev.mercurio - 0.2, 0.4), { fill: '#A8A8B0', lw: 5, seed: 340 }); C.pill(ctx, t, ev.mercurio, 'mercurio', 170, 790, '#A8A8B0'); }
      // termómetro
      ctx.save(); ctx.translate(800, 1000); G.rrect(ctx, -34, -300, 68, 520, 34, { fill: '#fff', lw: 7, seed: 341 }); G.ellipse(ctx, 0, 240, 70, 70, { fill: '#E8324A', lw: 7, seed: 342 });
      const lv = 480 * hot; G.rrect(ctx, -18, 220 - lv, 36, lv + 20, 18, { fill: '#E8324A', lw: 0, seed: 343 }); ctx.restore();
      C.count(ctx, t, ev.grados - 0.3, 465, 800, 640, { suf: '°C', size: 100, color: '#FF7A4A' });
      BIG(ctx, t, ev.horno, 'HORNO', 330, 1300, '#FF7A4A', 90);
      return ['Más caliente', 'que *Mercurio*'];
    },
    function cierre(ctx, t, a) {
      C.space(ctx, t, '#2A0808', '#5A1A10');
      venus(ctx, 760, 900, 230, t, (t - a) * 0.03, out(t, ev.cocinas - 0.2, 0.6));
      const cook = t > ev.cocinas - 0.1;
      C.person(ctx, 300, 1300, 1.1 * pop(t, a, 0.5), { pose: 'stand', eyes: cook ? 'wide' : 'happy', mouth: cook ? 'open' : 'grin', style: { shirt: '#3E6FB0' } });
      if (cook) for (let i = 0; i < 6; i++) { const p = ((t - ev.cocinas) * 0.8 + i / 6) % 1; G.line(ctx, [[220 + i * 32, 860 - p * 180], [232 + i * 32, 830 - p * 180], [220 + i * 32, 800 - p * 180]], { color: `rgba(255,255,255,${0.8 * (1 - p)})`, lw: 6, seed: 350 + i }); }
      BIG(ctx, t, ev.venus, 'MUDATE A VENUS', CX, 660, '#FFD22E', 86);
      return ['¿No te alcanza el día?', '*Mudate a Venus*'];
    },
  ]);
})();
