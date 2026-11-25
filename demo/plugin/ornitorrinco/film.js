// El ornitorrinco (versión puteada)
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = {
    sobras: cue(0, 'sobras'), nota: cue(0, 'nota'), puta: cue(0, 'puta'),
    pato: cue(1, 'pato'), castor: cue(1, 'castor'), nutria: cue(1, 'nutria'), mierda: cue(1, 'mierda'), funciona: cue(1, 'funciona'),
    mamifero: cue(2, 'mamífero'), huevos: cue(2, 'huevos'), forro: cue(2, 'forro'), leche: cue(2, 'leche'), panza: cue(2, 'panza'), asco: cue(2, 'asco'),
    espolones: cue(3, 'espolones'), veneno: cue(3, 'veneno'), mata: cue(3, 'mata'), semanas: cue(3, 'semanas'), concha: cue(3, 'concha'),
    estomago: cue(4, 'estómago'), esofago: cue(4, 'esófago'), intestino: cue(4, 'intestino'), escalas: cue(4, 'escalas'),
    ojos: cue(5, 'ojos'), pico: cue(5, 'pico'), electricidad: cue(5, 'electricidad'), detector: cue(5, 'detector'),
    ultravioleta: cue(6, 'ultravioleta'), brilla: cue(6, 'brilla'), fluorescente: cue(6, 'fluorescente'),
    raro: cue(7, 'raro'), venenoso: cue(7, 'venenoso'), bien: cue(7, 'bien'), gil: cue(7, 'gil'),
  };
  const BR = '#8A5A3A', BD = '#5A3A22', BILL = '#3A3A44', GLOW = '#3FF0C8';
  const shake = (t, t0, amp = 22, d = 0.45) => { const k = clamp(1 - (t - t0) / d); return t >= t0 && k > 0 ? [Math.sin(t * 70) * amp * k, Math.cos(t * 61) * amp * k] : [0, 0]; };
  function creek(ctx, t, under = false) {
    C.bg(ctx, under ? '#1F4A5A' : '#9ED8E8', under ? '#08202A' : '#E8F4E0');
    if (!under) {
      G.poly(ctx, [[-60, 1250], [1140, 1230], [1140, 1500], [-60, 1520]], { fill: '#8CC66A', lw: 6, seed: 1100 });
      G.poly(ctx, [[-60, 1500], [1140, 1480], [1140, 2000], [-60, 2000]], { fill: '#4A8AA0', lw: 6, seed: 1101 });
      for (let i = 0; i < 6; i++) { const x = ((i * 200 + t * 50) % 1300) - 100; G.line(ctx, [[x, 1560 + (i % 3) * 40], [x + 90, 1560 + (i % 3) * 40]], { color: 'rgba(255,255,255,0.5)', lw: 5, seed: 1102 + i }); }
    } else {
      for (let i = 0; i < 18; i++) { const x = (i * 131.7) % 1080 + Math.sin(t * 2 + i) * 12, y = 1900 - ((t * (50 + (i % 5) * 20) + i * 173) % 1100); ctx.save(); ctx.globalAlpha = 0.45; ctx.strokeStyle = '#DDF4FF'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 5 + (i % 4) * 3, 0, 7); ctx.stroke(); ctx.restore(); }
      G.poly(ctx, [[-60, 1680], [1140, 1660], [1140, 2000], [-60, 2000]], { fill: '#4A3A22', lw: 6, seed: 1110 });
    }
  }
  // ornitorrinco de costado mirando a la derecha. o: { parts: {bill,tail,feet} 0..1 (piezas que llegan volando), glow, spur, eyes:'closed', swim, mood }
  function platy(ctx, x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const P = Object.assign({ bill: 1, tail: 1, feet: 1 }, o.parts || {});
    const body = o.glow ? GLOW : BR, dark = o.glow ? '#1FA88A' : BD, bill = o.glow ? '#2AD8B0' : BILL;
    const sw = o.swim ? Math.sin(t * 8) : 0;
    if (P.tail > 0) { ctx.save(); ctx.translate(lerp(-700, 0, P.tail), lerp(-500, 0, P.tail)); ctx.rotate((1 - P.tail) * 3 + sw * 0.1);
      G.ellipse(ctx, -230, 10, 120, 55, { fill: dark, lw: 6, seed: 1120 });
      for (let i = 0; i < 4; i++) G.line(ctx, [[-300 + i * 40, -10], [-290 + i * 40, 30]], { color: 'rgba(0,0,0,0.25)', lw: 4, seed: 1121 + i });
      ctx.restore(); }
    if (P.feet > 0) { const fy = lerp(700, 0, P.feet);
      for (const [fx, ph] of [[-90, 1], [100, 0]]) {
        ctx.save(); ctx.translate(fx, 70 + fy); ctx.rotate((ph ? sw : -sw) * 0.3);
        G.limb(ctx, [[0, 0], [10, 50]], { color: dark, lw: 30, ink: '#111', outline: 4, seed: 1125 + fx });
        G.poly(ctx, [[-25, 50], [45, 50], [55, 75], [-35, 75]], { fill: dark, lw: 5, seed: 1127 + fx });
        if (o.spur && ph) { G.poly(ctx, [[-10, 15], [-80, -5], [-12, 40]], { fill: '#C870FF', lw: 5, seed: 1129 });
          const dp = (t * 1.2) % 1; G.ellipse(ctx, -74, 0 + dp * 80, 11, 15, { fill: '#C870FF', lw: 2, seed: 1130, alpha: 1 - dp }); }
        ctx.restore();
      } }
    G.ellipse(ctx, 0, 0, 210, 100, { fill: body, lw: 7, seed: 1131 });
    G.ellipse(ctx, -10, 40, 150, 40, { fill: o.glow ? '#8AFFE4' : '#B08060', lw: 0, seed: 1132, alpha: 0.6 });
    G.ellipse(ctx, 190, -20, 85, 75, { fill: body, lw: 7, seed: 1133 });
    if (P.bill > 0) { ctx.save(); ctx.translate(lerp(800, 0, P.bill), lerp(-600, 0, P.bill)); ctx.rotate((1 - P.bill) * -4);
      G.rrect(ctx, 240, -40, 190, 70, 35, { fill: bill, lw: 6, seed: 1134 });
      G.ellipse(ctx, 395, -20, 7, 5, { fill: '#111', lw: 0, seed: 1135 }); G.ellipse(ctx, 375, -20, 7, 5, { fill: '#111', lw: 0, seed: 1136 });
      ctx.restore(); }
    if (o.eyes === 'closed') G.line(ctx, [[195, -55], [225, -50]], { lw: 6, seed: 1137 });
    else { G.ellipse(ctx, 210, -52, 13, 13, { fill: '#fff', lw: 3, seed: 1138 }); G.ellipse(ctx, 214, -50, 6, 6, { fill: '#111', lw: 0, seed: 1139 });
      if (o.mood === 'angry') G.line(ctx, [[190, -78], [235, -66]], { lw: 6, seed: 1140 }); }
    ctx.restore();
  }
  C.film([
    function hook(ctx, t, a) {
      creek(ctx, t);
      const [sx, sy] = shake(t, ev.puta, 22);
      ctx.save(); ctx.translate(sx, sy);
      const k = (d) => out(t, a + d, 0.6);
      platy(ctx, CX - 110, 1080, 1.4 * (0.7 + 0.3 * pop(t, a, 0.5)), t, { parts: { tail: k(0.3), feet: k(0.6), bill: k(0.9) }, mood: t > ev.puta ? 'angry' : 'happy' });
      ctx.restore();
      C.pill(ctx, t, ev.sobras, 'hecho con sobras', CX, 760, '#FFD22E');
      if (t > ev.nota) C.text(ctx, 'Y SE NOTA', CX, 900, { size: 100 * pop(t, ev.nota, 0.35), color: '#fff', stroke: '#0b1030', strokeW: 12 });
      return ['Lo armaron', 'con *sobras*'];
    },
    function partes(ctx, t, a) {
      creek(ctx, t);
      platy(ctx, CX - 110, 1080, 1.3 * pop(t, a, 0.5), t, {});
      const ar = (x0, y0, x1, y1, t0) => { if (t < t0) return; const p = out(t, t0, 0.35); G.line(ctx, [[x0, y0], [lerp(x0, x1, p), lerp(y0, y1, p)]], { color: '#0b1030', lw: 7, seed: 1150 + x0 }); };
      ar(900, 860, 900, 1030, ev.pato); ar(180, 860, 160, 1060, ev.castor); ar(620, 1550, 620, 1340, ev.nutria);
      C.pill(ctx, t, ev.pato, 'pato', 900, 820, '#FFD22E');
      C.pill(ctx, t, ev.castor, 'castor', 180, 820, '#C8A050');
      C.pill(ctx, t, ev.nutria, 'nutria', 620, 1590, '#7FD4FF');
      if (t > ev.funciona) C.text(ctx, 'Y FUNCIONA', CX, 1780, { size: 100 * pop(t, ev.funciona, 0.35), color: '#FFD22E', stroke: '#0b1030', strokeW: 12 });
      return ['Pico de pato,', 'cola de *castor*'];
    },
    function huevos(ctx, t, a) {
      creek(ctx, t);
      G.ellipse(ctx, CX, 1340, 380, 90, { fill: '#C8A070', lw: 6, seed: 1160 });
      platy(ctx, CX - 170, 1150, 1.2 * pop(t, a, 0.5), t, { mood: t > ev.forro ? 'smug' : 'happy' });
      for (let i = 0; i < 2; i++) { const s = pop(t, ev.huevos + i * 0.2, 0.4); if (s > 0) { ctx.save(); ctx.translate(700 + i * 110, 1310); ctx.scale(s, s); G.ellipse(ctx, 0, 0, 42, 54, { fill: '#FFF4D8', lw: 5, seed: 1161 + i }); ctx.restore(); } }
      if (t > ev.leche - 0.2) for (let i = 0; i < 8; i++) { const p = ((t - ev.leche + 0.2) * 0.8 + i / 8) % 1; G.ellipse(ctx, 330 + (i * 53) % 220, 1250 + p * 120, 9, 12, { fill: '#fff', lw: 3, seed: 1163 + i, alpha: 1 - p }); }
      C.pill(ctx, t, ev.mamifero, 'mamífero', 280, 760, '#7FD4FF');
      C.pill(ctx, t, ev.huevos, 'pone huevos', 760, 760, '#FFD22E');
      C.pill(ctx, t, ev.panza, 'leche por la panza', CX, 1580, '#fff');
      if (t > ev.asco) C.text(ctx, 'UN ASCO', CX, 980, { size: 100 * pop(t, ev.asco, 0.35), color: '#3FE07A', stroke: '#0b1030', strokeW: 12 });
      return ['Es mamífero', 'pero *pone huevos*'];
    },
    function veneno(ctx, t, a) {
      creek(ctx, t);
      const [sx, sy] = shake(t, ev.veneno, 26, 0.6);
      ctx.save(); ctx.translate(sx, sy);
      if (t > ev.veneno - 0.1) G.rays(ctx, 330, 1180, { n: 16, r0: 160, r1: 900, color: '#C870FF', lw: 10, alpha: 0.25, spin: t * 0.4 });
      platy(ctx, 400, 1080, 1.3 * pop(t, a, 0.5), t, { spur: t > ev.espolones - 0.2, mood: 'angry' });
      ctx.restore();
      const hurt = t > ev.mata - 0.1;
      C.person(ctx, 900, 1400, 0.85 * pop(t, ev.mata - 0.3, 0.4), { pose: hurt ? 'celebrate' : 'stand', eyes: hurt ? 'wide' : 'normal', mouth: hurt ? 'open' : 'smile', style: { shirt: '#19B8B2' } });
      C.pill(ctx, t, ev.espolones, 'espolones', 300, 760, '#C870FF');
      C.count(ctx, t, ev.semanas - 0.2, 3, CX, 900, { suf: '+ SEMANAS', size: 96, color: '#C870FF' });
      return ['Tiene espolones', 'con *veneno*'];
    },
    function estomago(ctx, t, a) {
      C.bg(ctx, '#FFE2C8', '#FFF4E4');
      const pts = [[540, 620], [540, 900], [400, 1000], [680, 1110], [400, 1220], [680, 1330], [540, 1440], [540, 1700]];
      G.line(ctx, pts, { color: '#E8A0A0', lw: 70, seed: 1170 });
      G.line(ctx, pts, { color: '#FFC8C0', lw: 52, seed: 1171 });
      if (t > ev.estomago - 0.2) { ctx.save(); ctx.translate(800, 900); const s = pop(t, ev.estomago - 0.2, 0.4); ctx.scale(s, s);
        G.ellipse(ctx, 0, 0, 120, 90, { fill: '#FF9AB4', lw: 6, seed: 1172, alpha: 0.6 }); C.text(ctx, 'ESTÓMAGO', 0, 15, { size: 34, color: '#0b1030', shadow: false });
        G.line(ctx, [[-120, -90], [120, 90]], { color: '#E8324A', lw: 14, seed: 1173 }); G.line(ctx, [[120, -90], [-120, 90]], { color: '#E8324A', lw: 14, seed: 1174 }); ctx.restore(); }
      if (t > ev.esofago - 0.2) { const p = clamp((t - ev.esofago + 0.2) / 1.8), seg = p * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(seg)), f = seg - i;
        G.ellipse(ctx, lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f), 26, 22, { fill: '#6A9A3A', lw: 4, seed: 1175 }); }
      C.pill(ctx, t, ev.esofago, 'esófago', 300, 700, '#7FD4FF');
      C.pill(ctx, t, ev.intestino, 'intestino', 300, 1500, '#FFD22E');
      C.pill(ctx, t, ev.escalas, 'sin escalas', 800, 1600, '#E8324A');
      return ['No tiene', '*estómago*'];
    },
    function electro(ctx, t, a) {
      creek(ctx, t, true);
      const sx = lerp(120, 380, clamp((t - a) / 4));
      platy(ctx, sx, 1120, 1.1 * pop(t, a, 0.5), t, { swim: true, eyes: t > ev.ojos - 0.2 ? 'closed' : 'open' });
      if (t > ev.electricidad - 0.2) { for (let i = 0; i < 4; i++) { const p = ((t - ev.electricidad + 0.2) * 0.9 + i / 4) % 1;
          ctx.save(); ctx.globalAlpha = 1 - p; ctx.strokeStyle = '#FFE14A'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(sx + 470, 1100, 40 + p * 300, -0.7, 0.7); ctx.stroke(); ctx.restore(); }
        ctx.save(); ctx.translate(960, 1100);
        G.ellipse(ctx, 0, 0, 50, 22, { fill: '#FF8A6A', lw: 5, seed: 1180 });
        for (let i = 0; i < 3; i++) { const z = Math.sin(t * 20 + i * 2) * 10; G.line(ctx, [[-20 + i * 20, -30], [-10 + i * 20 + z, -55], [-20 + i * 20, -75]], { color: '#FFE14A', lw: 5, seed: 1181 + i }); }
        ctx.restore(); }
      C.pill(ctx, t, ev.ojos, 'ojos cerrados', 300, 760, '#7FD4FF');
      C.pill(ctx, t, ev.electricidad, 'detecta electricidad', 700, 900, '#FFE14A');
      return ['Caza con', 'los *ojos cerrados*'];
    },
    function brilla(ctx, t, a) {
      const uv = t > ev.ultravioleta - 0.1;
      if (uv) C.bg(ctx, '#2A0A5A', '#0A0420'); else creek(ctx, t);
      if (uv) { C.glow(ctx, CX, 1150, 600, '63,240,200', 0.35 + 0.1 * Math.sin(t * 4)); G.rays(ctx, CX, 1150, { n: 18, r0: 320, r1: 1300, color: '#8A4AFF', lw: 10, alpha: 0.3, spin: t * 0.3 }); }
      platy(ctx, CX - 110, 1100, 1.35 * pop(t, a, 0.5), t, { glow: t > ev.brilla - 0.1 });
      C.pill(ctx, t, ev.ultravioleta, 'luz ultravioleta', CX, 760, '#8A4AFF');
      if (t > ev.fluorescente) C.text(ctx, 'FLUORESCENTE', CX, 1600, { size: 100 * pop(t, ev.fluorescente, 0.35), color: GLOW, stroke: '#0b1030', strokeW: 12 });
      return ['Con luz ultravioleta', '*brilla*'];
    },
    function cierre(ctx, t, a) {
      creek(ctx, t);
      if (t > ev.bien - 0.1) G.rays(ctx, CX, 1100, { n: 18, r0: 300, r1: 1300, color: '#FFD22E', lw: 10, alpha: 0.22, spin: t * 0.4 });
      const ok = t > ev.bien - 0.1;
      C.person(ctx, 820, 1460, 0.9 * pop(t, a, 0.5), { pose: 'stand', eyes: ok ? 'normal' : 'wide', mouth: ok ? 'smile' : 'open', style: { shirt: '#3E6FB0' } });
      platy(ctx, 300, 1200, 1.0 * pop(t, a + 0.2, 0.5), t, { glow: t > ev.venenoso, spur: t > ev.venenoso, mood: 'smug' });
      C.pill(ctx, t, ev.raro, '¿te sentís raro?', CX, 700, '#7FD4FF');
      if (ok) C.text(ctx, 'VOS ESTÁS BIEN', CX, 900, { size: 100 * pop(t, ev.bien, 0.35), color: '#FFD22E', stroke: '#0b1030', strokeW: 14 });
      return ['Si te sentís raro,', '*acordate de este*'];
    },
  ]);
})();
