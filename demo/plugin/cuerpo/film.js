// Tu cuerpo (versión puteada, exagerada)
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = {
    pelotudo: cue(0, 'pelotudo'), cuerpo: cue(0, 'cuerpo'), maquina: cue(0, 'máquina'), concha: cue(0, 'concha'),
    manana: cue(1, 'mañana'), centimetro: cue(1, 'centímetro'), noche: cue(1, 'noche'), columna: cue(1, 'columna'), forro: cue(1, 'forro'),
    trescientos: cue(2, 'trescientos'), doscientos: cue(2, 'doscientos'), soldando: cue(2, 'soldando'), cien: cue(2, 'cien'), velorio: cue(2, 'velorio'),
    quince: cue(3, 'quince'), mentiroso: cue(3, 'mentiroso'), dormido: cue(3, 'dormido'), orto: cue(3, 'orto'),
    parpadeas: cue(4, 'parpadeás'), diez: cue(4, 'diez'), cerrados: cue(4, 'cerrados'), carajo: cue(4, 'carajo'),
    acido: cue(5, 'ácido'), capa: cue(5, 'capa'), arregla: cue(5, 'arregla'), porquerias: cue(5, 'porquerías'),
    treinta: cue(6, 'treinta'), pedacitos: cue(6, 'pedacitos'), salero: cue(6, 'salero'), puta: cue(6, 'puta'),
    cerebro: cue(7, 'cerebro'), dos: cue(7, 'dos'), veinte: cue(7, 'veinte'), videos: cue(7, 'videos'), segui: cue(7, 'seguí'),
  };
  const shake = (t, t0, amp = 22, d = 0.45) => { const k = clamp(1 - (t - t0) / d); return t >= t0 && k > 0 ? [Math.sin(t * 70) * amp * k, Math.cos(t * 61) * amp * k] : [0, 0]; };
  const room = (ctx, top = '#FFE7C2', bot = '#FFF6E6') => {
    C.bg(ctx, top, bot);
    G.poly(ctx, [[-60, 1480], [1140, 1460], [1140, 2000], [-60, 2000]], { fill: '#C89A6A', lw: 6, seed: 1200 });
    for (let i = 0; i < 6; i++) G.line(ctx, [[i * 200 - 20, 1475], [i * 200 + 60, 2000]], { color: 'rgba(0,0,0,0.12)', lw: 4, seed: 1201 + i });
  };
  const BIG = (ctx, t, t0, s, x, y, color = '#FFD22E', size = 110) => { if (t > t0) C.text(ctx, s, x, y, { size: size * pop(t, t0, 0.35), color, stroke: '#0b1030', strokeW: 14 }); };
  function bone(ctx, x, y, s, rot, seed) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    G.rrect(ctx, -60, -12, 120, 24, 12, { fill: '#F4EDE0', lw: 5, seed });
    for (const [bx, by] of [[-62, -12], [-62, 12], [62, -12], [62, 12]]) G.ellipse(ctx, bx, by, 17, 17, { fill: '#F4EDE0', lw: 5, seed: seed + bx + by });
    ctx.restore();
  }
  function cloud(ctx, x, y, s, alpha, seed) {
    ctx.save(); ctx.globalAlpha = alpha;
    for (const [dx, dy, r] of [[0, 0, 40], [35, -15, 32], [-35, -10, 30], [10, -38, 28]]) G.ellipse(ctx, x + dx * s, y + dy * s, r * s, r * s, { fill: '#A8D86A', lw: 4, seed: seed + dx });
    ctx.restore();
  }
  C.film([
    function hook(ctx, t, a) {
      room(ctx);
      const [sx, sy] = shake(t, ev.concha, 28, 0.6);
      ctx.save(); ctx.translate(sx, sy);
      if (t > ev.concha - 0.1) G.rays(ctx, CX, 1100, { n: 20, r0: 300, r1: 1300, color: '#E8324A', lw: 12, alpha: 0.28, spin: t * 0.5 });
      const dumb = t > ev.pelotudo - 0.1;
      C.person(ctx, CX, 1560, 1.8 * (0.6 + 0.4 * pop(t, a, 0.5)), { pose: 'stand', eyes: dumb ? 'wide' : 'happy', mouth: dumb ? 'o' : 'smile', style: { shirt: '#3E6FB0' } });
      if (t > ev.maquina - 0.2) for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate([170, 910, 540][i], [1000, 1000, 640][i]); ctx.rotate((t - a) * (i % 2 ? -2 : 2));
        for (let k = 0; k < 8; k++) { ctx.save(); ctx.rotate(k * Math.PI / 4); G.rrect(ctx, -14, -75, 28, 30, 6, { fill: '#9AA4B8', lw: 4, seed: 1210 + k }); ctx.restore(); }
        G.ellipse(ctx, 0, 0, 55, 55, { fill: '#9AA4B8', lw: 5, seed: 1219 }); G.ellipse(ctx, 0, 0, 18, 18, { fill: '#5A6478', lw: 4, seed: 1220 }); ctx.restore(); }
      ctx.restore();
      C.pill(ctx, t, ev.pelotudo, 'pedazo de pel*tudo', CX, 640, '#E8324A');
      BIG(ctx, t, ev.concha, '¡ESCUCHAME!', CX, 1760, '#FFD22E', 110);
      return ['Tu cuerpo es', 'una *máquina loca*'];
    },
    function altura(ctx, t, a) {
      C.bg(ctx, '#FFD9A0', '#2A2E5A');
      G.ellipse(ctx, 270, 620, 70, 70, { fill: '#FFE07A', lw: 5, seed: 1230 });
      G.ellipse(ctx, 810, 620, 60, 60, { fill: '#F4F0E0', lw: 5, seed: 1231 }); G.ellipse(ctx, 840, 600, 50, 50, { fill: '#5A5E8A', lw: 0, seed: 1232 });
      G.line(ctx, [[CX, 560], [CX, 1700]], { color: 'rgba(255,255,255,0.6)', lw: 5, seed: 1233 });
      const grow = out(t, ev.centimetro - 0.2, 0.6), shr = out(t, ev.columna - 0.2, 0.6);
      C.person(ctx, 270, 1600, 1.5 * pop(t, a, 0.5) * (1 + 0.07 * grow), { pose: 'stand', eyes: 'happy', mouth: 'grin', style: { shirt: '#FFB03A' } });
      C.person(ctx, 810, 1600, 1.5 * pop(t, ev.noche - 0.3, 0.5) * (1 - 0.05 * shr), { pose: 'stand', eyes: 'worried', mouth: t > ev.forro ? 'wavy' : 'flat', style: { shirt: '#3E4FB0' } });
      if (grow > 0) { G.line(ctx, [[150, 960 - 40 * grow], [390, 960 - 40 * grow]], { color: '#FFD22E', lw: 8, seed: 1234 }); }
      C.count(ctx, t, ev.centimetro - 0.2, 1, 270, 830, { pre: '+', suf: ' CM', size: 100 });
      C.pill(ctx, t, ev.manana, 'a la mañana', 270, 710, '#FFD22E');
      C.pill(ctx, t, ev.noche, 'a la noche', 810, 710, '#7FD4FF');
      BIG(ctx, t, ev.forro, 'PETISO', 810, 1780, '#fff', 100);
      return ['A la mañana', 'sos *más alto*'];
    },
    function huesos(ctx, t, a) {
      C.bg(ctx, '#2E3A5A', '#121830');
      const lost = t > ev.cien - 0.2;
      for (let i = 0; i < 18; i++) { const fall = lost && i % 2 ? out(t, ev.cien - 0.2 + (i % 5) * 0.08, 0.9) : 0;
        bone(ctx, 140 + (i % 6) * 160, 900 + Math.floor(i / 6) * 150 + fall * 900, 0.9 * pop(t, a + i * 0.03, 0.4), (i * 0.7) + fall * 3, 1240 + i * 3); }
      if (t < ev.doscientos - 0.2) C.count(ctx, t, ev.trescientos - 0.2, 300, CX, 760, { size: 130 });
      else C.count(ctx, t, ev.doscientos - 0.2, 206, CX, 760, { size: 130, color: '#7FD4FF' });
      if (t > ev.velorio - 0.2) { const s = pop(t, ev.velorio - 0.2, 0.4); ctx.save(); ctx.translate(CX, 1620); ctx.scale(s, s);
        G.rrect(ctx, -110, -170, 220, 240, 100, { fill: '#9AA4B8', lw: 7, seed: 1300 }); C.text(ctx, 'RIP', 0, -50, { size: 70, color: '#3A4258', shadow: false }); ctx.restore(); }
      C.pill(ctx, t, ev.soldando, 'se soldaron', 300, 1500, '#FFD22E');
      return ['Naciste con', '*300 huesos*'];
    },
    function pedos(ctx, t, a) {
      const night = t > ev.dormido - 0.2;
      if (night) C.bg(ctx, '#1A2050', '#0A0E2A'); else room(ctx, '#DFF2FF', '#F6FBFF');
      if (night) { G.rrect(ctx, 120, 1300, 840, 160, 30, { fill: '#E8E4F4', lw: 6, seed: 1310 }); C.person(ctx, 520, 1330, 1.2, { pose: 'floor', eyes: 'sleep', mouth: 'sleep', style: { shirt: '#7A5AB0' } }); }
      else C.person(ctx, 520, 1560, 1.8 * pop(t, a, 0.5), { pose: 'stand', eyes: t > ev.mentiroso ? 'worried' : 'happy', mouth: t > ev.mentiroso ? 'wavy' : 'smirk', style: { shirt: '#19B8B2' } });
      if (t > ev.quince - 0.3) for (let i = 0; i < 5; i++) { const p = ((Math.max(0, t - ev.quince + 0.3)) * 0.6 + i / 5) % 1;
        cloud(ctx, (night ? 300 : 330) - p * 160, (night ? 1250 : 1250) - p * 380, 0.8 + p * 1.2, 0.9 * (1 - p), 1320 + i * 5); }
      C.count(ctx, t, ev.quince - 0.2, 15, CX, 700, { suf: ' POR DÍA', size: 96 });
      BIG(ctx, t, ev.mentiroso, 'MENTIROSO', CX, 920, '#fff', 100);
      if (night) BIG(ctx, t, ev.orto, 'COCHINO', CX, 1700, '#A8D86A', 110);
      return ['Largás gases', '*15 veces* por día'];
    },
    function ojos(ctx, t, a) {
      C.bg(ctx, '#FFE2E8', '#FFF6F2');
      const k = (Math.max(0, t - a) * 0.9) % 1, lid = k < 0.14 ? Math.sin(k / 0.14 * Math.PI) : 0;
      ctx.save(); ctx.translate(CX, 1050); const s = pop(t, a, 0.5); ctx.scale(s, s);
      G.ellipse(ctx, 0, 0, 380, 220, { fill: '#fff', lw: 9, seed: 1340 });
      G.ellipse(ctx, 0, 0, 130, 130, { fill: '#4A8AC8', lw: 6, seed: 1341 }); G.ellipse(ctx, 0, 0, 60, 60, { fill: '#111', lw: 0, seed: 1342 });
      G.ellipse(ctx, 30, -35, 20, 20, { fill: '#fff', lw: 0, seed: 1343 });
      if (lid > 0) { ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 382, 222, 0, 0, 7); ctx.clip();
        ctx.fillStyle = '#F2B8A0'; ctx.fillRect(-400, -240, 800, 480 * lid); ctx.restore(); }
      ctx.restore();
      if (t > ev.diez - 0.2) { const p = out(t, ev.diez - 0.2, 0.8); ctx.save(); ctx.translate(820, 700);
        ctx.fillStyle = '#fff'; ctx.strokeStyle = '#0b1030'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#E8324A'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 90, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.1 * p); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
      C.count(ctx, t, ev.diez - 0.2, 10, 380, 740, { suf: ' %', size: 130 });
      C.pill(ctx, t, ev.cerrados, 'ojos cerrados', CX, 1360, '#7FD4FF');
      BIG(ctx, t, ev.carajo, 'NI UN C*RAJO', CX, 1780, '#fff', 90);
      return ['Parpadeando pasás', 'el *10 %* ciego'];
    },
    function estomago(ctx, t, a) {
      C.bg(ctx, '#FFD8C8', '#FFF0E4');
      ctx.save(); ctx.translate(CX, 1100); const s = pop(t, a, 0.5); ctx.scale(s, s);
      G.ellipse(ctx, 0, 0, 330, 260, { fill: '#FF9AAE', lw: 9, seed: 1350 });
      const lvl = out(t, ev.acido - 0.2, 0.8);
      if (lvl > 0) { ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 300, 230, 0, 0, 7); ctx.clip();
        ctx.fillStyle = '#9AE04A'; ctx.fillRect(-320, 230 - 230 * lvl, 640, 460);
        for (let i = 0; i < 10; i++) { const p = (Math.max(0, t - a) * 0.7 + i / 10) % 1; ctx.globalAlpha = 1 - p; ctx.strokeStyle = '#E8FFC8'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(-240 + i * 52, 200 - p * 200 * lvl, 10 + (i % 3) * 5, 0, 7); ctx.stroke(); }
        ctx.restore(); }
      if (t > ev.capa - 0.2) { const p = out(t, ev.capa - 0.2, 0.8); ctx.save(); ctx.globalAlpha = p; ctx.strokeStyle = '#FFD22E'; ctx.lineWidth = 16; ctx.setLineDash([30, 18]); ctx.lineDashOffset = -t * 60; ctx.beginPath(); ctx.ellipse(0, 0, 318, 248, 0, 0, Math.PI * 2 * p); ctx.stroke(); ctx.restore(); }
      ctx.restore();
      if (t > ev.porquerias - 0.2) for (let i = 0; i < 4; i++) { const p = clamp((t - ev.porquerias + 0.2 - i * 0.25) / 0.8); if (p <= 0) continue;
        G.ellipse(ctx, lerp(150 + i * 250, CX, p), lerp(560, 1000, p), 34, 26, { fill: ['#C8803A', '#E8C84A', '#8A5A3A', '#E8324A'][i], lw: 5, seed: 1360 + i }); }
      C.pill(ctx, t, ev.acido, 'ácido', 280, 720, '#9AE04A');
      C.pill(ctx, t, ev.capa, 'capa nueva', 800, 720, '#FFD22E');
      BIG(ctx, t, ev.arregla, 'SE ARREGLA SOLO', CX, 1640, '#fff', 90);
      return ['Tu estómago', 'se *comería solo*'];
    },
    function piel(ctx, t, a) {
      room(ctx, '#E4F0FF', '#F8FBFF');
      const x = lerp(160, 900, clamp((t - a) / 5));
      for (let i = 0; i < 60; i++) { const age = (i / 60) * 5, px = lerp(160, 900, clamp((t - a - age) / 5)); if (t - a < age) continue;
        const dy = Math.min(1, age * 0.4) * 200; G.ellipse(ctx, px + ((i * 37) % 60) - 30, 1300 + dy + ((i * 53) % 80), 6, 5, { fill: '#E8D0B0', lw: 2, seed: 1370 + (i % 9), alpha: 0.9 }); }
      C.person(ctx, x, 1560, 1.5 * pop(t, a, 0.5), { pose: 'walk', eyes: 'happy', mouth: 'smile', style: { shirt: '#3E6FB0' } });
      C.count(ctx, t, ev.treinta - 0.2, 30000, CX, 760, { suf: '/MIN', size: 110 });
      C.pill(ctx, t, ev.pedacitos, 'pedacitos tuyos', CX, 900, '#E8D0B0');
      BIG(ctx, t, ev.salero, 'SALERO DE MUGRE', CX, 1780, '#fff', 86);
      return ['Largás piel', '*muerta* sin parar'];
    },
    function cierre(ctx, t, a) {
      C.bg(ctx, '#2A1A4A', '#0E0A22');
      const phone = t > ev.videos - 0.2;
      if (!phone) {
        ctx.save(); ctx.translate(CX, 1050); const s = pop(t, a, 0.5); ctx.scale(s, s);
        G.ellipse(ctx, 0, 0, 280, 200, { fill: '#FF9AB4', lw: 8, seed: 1400 });
        for (let i = 0; i < 6; i++) G.line(ctx, [[-220 + i * 80, -120], [-180 + i * 80, -40], [-230 + i * 80, 40], [-190 + i * 80, 120]], { color: '#C85A7A', lw: 7, seed: 1401 + i });
        G.line(ctx, [[0, -195], [0, 195]], { color: '#C85A7A', lw: 8, seed: 1408 });
        ctx.restore();
        const p = out(t, ev.veinte - 0.2, 0.8);
        G.rrect(ctx, 200, 1430, 680, 90, 24, { fill: '#fff', lw: 6, seed: 1410 });
        if (p > 0) G.rrect(ctx, 200, 1430, 680 * 0.2 * p, 90, 24, { fill: '#FFD22E', lw: 0, seed: 1411 });
        C.count(ctx, t, ev.dos - 0.2, 2, CX, 680, { suf: ' % DEL PESO', size: 80, color: '#7FD4FF' });
        C.count(ctx, t, ev.veinte - 0.2, 20, CX, 800, { suf: ' % DE ENERGÍA', size: 80 });
      } else {
        C.person(ctx, CX, 1520, 1.7, { pose: 'sit', eyes: 'focus', mouth: 'o', style: { shirt: '#3E6FB0' } });
        ctx.save(); ctx.translate(CX + 160, 1180); ctx.rotate(-0.15);
        G.rrect(ctx, -70, -120, 140, 240, 22, { fill: '#222', lw: 6, seed: 1420 }); G.rrect(ctx, -58, -104, 116, 208, 14, { fill: '#5FB8FF', lw: 0, seed: 1421 });
        C.text(ctx, '▶', 0, 20, { size: 60, color: '#fff', shadow: false }); ctx.restore();
        C.glow(ctx, CX + 160, 1180, 300, '95,184,255', 0.35);
      }
      if (t > ev.segui - 0.1) G.rays(ctx, CX, 1100, { n: 18, r0: 300, r1: 1300, color: '#FFD22E', lw: 10, alpha: 0.2, spin: t * 0.4 });
      BIG(ctx, t, ev.segui, 'SEGUÍ, B*LUDO', CX, 1760, '#FFD22E', 100);
      return ['Tu cerebro', 'se chupa el *20 %*'];
    },
  ]);
})();
