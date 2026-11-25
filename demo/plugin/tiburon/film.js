// El tiburón de Groenlandia (versión puteada)
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = {
    bisabuelo: cue(0, 'bisabuelo'), ortiva: cue(0, 'ortiva'),
    cuatro: cue(1, 'cuatrocientos'), concha: cue(1, 'concha'),
    centimetro: cue(2, 'centímetro'), rata: cue(2, 'rata'), crias: cue(2, 'crías'),
    jubilado: cue(3, 'jubilado'), kilometro: cue(3, 'kilómetro'), pelotudo: cue(3, 'pelotudo'),
    parasito: cue(4, 'parásito'), giles: cue(4, 'giles'),
    toxica: cue(5, 'tóxica'), islandia: cue(5, 'islandia'), morfan: cue(5, 'morfan'),
    siglos: cue(6, 'siglos'), enterrar: cue(6, 'enterrar'), salame: cue(6, 'salame'),
  };
  const SK = '#6A7A8A', SD = '#2A3440';
  const shake = (t, t0, amp = 22, d = 0.45) => { const k = clamp(1 - (t - t0) / d); return t >= t0 && k > 0 ? [Math.sin(t * 70) * amp * k, Math.cos(t * 61) * amp * k] : [0, 0]; };
  function ice(ctx, t, top = '#0A2A4A', bot = '#03101E') {
    C.bg(ctx, top, bot);
    G.poly(ctx, [[-60, 300], [300, 340], [520, 280], [800, 350], [1140, 300], [1140, 420], [-60, 430]], { fill: '#DDF0FF', lw: 6, seed: 900 });
    for (let i = 0; i < 6; i++) { ctx.save(); ctx.globalAlpha = 0.07 + 0.04 * Math.sin(t + i); ctx.fillStyle = '#BFE9FF'; const x = i * 200 + Math.sin(t * 0.3 + i) * 40; ctx.beginPath(); ctx.moveTo(x, 420); ctx.lineTo(x + 90, 420); ctx.lineTo(x + 260, 1900); ctx.lineTo(x + 120, 1900); ctx.fill(); ctx.restore(); }
    for (let i = 0; i < 40; i++) { const x = (i * 131.7) % 1080 + Math.sin(t + i) * 10, y = 450 + ((i * 97 + t * 25) % 1450); ctx.save(); ctx.globalAlpha = 0.4; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 2 + i % 3, 0, 7); ctx.fill(); ctx.restore(); }
  }
  // tiburón mirando a la derecha. o: { mood, parasite, old, glasses }
  function shark(ctx, x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const tw = Math.sin(t * 1.6) * 0.18;
    ctx.save(); ctx.translate(-300, 0); ctx.rotate(tw); G.poly(ctx, [[0, 0], [-170, -120], [-130, 0], [-170, 110]], { fill: SK, lw: 6, seed: 910 }); ctx.restore();
    G.poly(ctx, [[-300, -10], [-120, -95], [160, -90], [330, -20], [340, 20], [160, 90], [-120, 80], [-300, 15]], { fill: SK, lw: 7, seed: 911 });
    G.poly(ctx, [[-40, -88], [10, -170], [70, -90]], { fill: SK, lw: 6, seed: 912 });
    G.poly(ctx, [[20, 70], [-30, 150], [100, 80]], { fill: SK, lw: 6, seed: 913 });
    G.poly(ctx, [[-120, 30], [160, 30], [320, 10], [330, 25], [160, 85], [-120, 75]], { fill: '#AAB6C2', lw: 0, seed: 914 });
    for (let k = 0; k < 30; k++) G.ellipse(ctx, -260 + (k * 37) % 520, -70 + (k * 23) % 120, 6, 6, { fill: SD, lw: 0, seed: 915 + k, alpha: 0.5 });
    for (let k = 0; k < 4; k++) G.line(ctx, [[150 + k * 22, -30], [160 + k * 22, 30]], { color: SD, lw: 4, seed: 950 + k });
    const m = o.mood || 'smug';
    G.ellipse(ctx, 250, -30, 20, m === 'shock' ? 20 : 14, { fill: o.parasite ? '#8AA0B0' : '#111', lw: 3, seed: 960 });
    if (m === 'smug' || m === 'angry') G.line(ctx, [[225, -58], [278, -44]], { lw: 6, seed: 961 });
    G.line(ctx, [[240, 40], [290, 48], [330, 30]], { lw: 6, seed: 962 });
    if (o.parasite) { const sw = Math.sin(t * 3) * 10; G.limb(ctx, [[262, -26], [282 + sw, 30], [270 + sw * 1.4, 90]], { color: '#F4E8C0', lw: 14, ink: '#8A7A50', outline: 3, seed: 963 }); }
    if (o.old) { G.line(ctx, [[220, 60], [215, 140]], { color: '#F4F4F4', lw: 6, seed: 964 }); G.line(ctx, [[240, 62], [245, 150]], { color: '#F4F4F4', lw: 6, seed: 965 }); }
    if (o.glasses) { G.rrect(ctx, 200, -60, 100, 50, 14, { fill: '#111522', lw: 5, seed: 966 }); }
    ctx.restore();
  }
  C.film([
    function hook(ctx, t, a) {
      ice(ctx, t);
      const [sx, sy] = shake(t, ev.bisabuelo, 22);
      ctx.save(); ctx.translate(sx, sy);
      shark(ctx, CX - 40 + Math.sin(t * 0.8) * 30, 1050, 1.25 * (0.6 + 0.4 * pop(t, a, 0.5)), t, { old: true });
      ctx.restore();
      if (t > ev.bisabuelo - 0.2) { const p = pop(t, ev.bisabuelo - 0.2, 0.4); ctx.save(); ctx.translate(820, 640); ctx.scale(p, p); G.rrect(ctx, -110, -140, 220, 280, 16, { fill: '#E8D8B0', lw: 6, seed: 970 }); G.rrect(ctx, -85, -115, 170, 200, 8, { fill: '#B8A888', lw: 4, seed: 971 }); C.person(ctx, 0, 60, 0.45, { eyes: 'normal', mouth: 'flat', style: { shirt: '#5A4A3A', facialHair: 'beard', hairStyle: 'bald' } }); ctx.restore(); }
      C.pill(ctx, t, ev.ortiva, 'el muy ortiva', CX, 1330, '#FFD22E');
      return ['Atenti', 'nació antes que tu *bisabuelo*'];
    },
    function edad(ctx, t, a) {
      ice(ctx, t);
      const [sx, sy] = shake(t, ev.concha, 28, 0.6);
      ctx.save(); ctx.translate(sx, sy);
      shark(ctx, CX - 40, 1150, 1.0 * pop(t, a, 0.5), t, { old: true });
      ctx.restore();
      C.count(ctx, t, ev.cuatro - 0.2, 400, CX, 820, { size: 240 });
      C.pill(ctx, t, ev.cuatro + 0.4, 'años', CX, 890, '#FFD22E');
      return ['Puede vivir', '*400* años'];
    },
    function crece(ctx, t, a) {
      ice(ctx, t, '#0A2A4A', '#06182E');
      const g = clamp((t - a) / 4);
      G.rrect(ctx, 120, 1420, 840, 22, 6, { fill: '#F2D24A', lw: 4, seed: 980 }); for (let k = 0; k <= 10; k++) G.line(ctx, [[120 + k * 84, 1420], [120 + k * 84, 1400]], { lw: 4, seed: 981 + k });
      shark(ctx, CX - 20, 1150, (0.75 + 0.05 * g) * pop(t, a, 0.5), t, { mood: 'smug' });
      C.pill(ctx, t, ev.centimetro, '1 cm por año', CX, 760, '#3FE07A');
      if (t > ev.crias) C.text(ctx, '+100 AÑOS', CX, 900, { size: 110 * pop(t, ev.crias, 0.35), color: '#FFD22E', stroke: '#0b1030', strokeW: 12 });
      return ['Crece', '*1 cm* por año'];
    },
    function lento(ctx, t, a) {
      ice(ctx, t);
      const p = clamp((t - a) / 8);
      shark(ctx, lerp(260, 560, p), 1080, 0.8 * pop(t, a, 0.5), t, { mood: 'flat' });
      C.person(ctx, 820, 1420, 0.85 * pop(t, ev.jubilado - 0.2, 0.4), { eyes: 'sleep', mouth: 'flat', style: { shirt: '#9A9AA8', hairStyle: 'bald', glasses: 'round' } });
      const pk = pop(t, ev.kilometro - 0.2, 0.4);
      if (pk > 0) C.text(ctx, '1 KM/H', CX, 820, { size: 150 * pk, color: '#FFD22E', stroke: '#0b1030', strokeW: 14 });
      return ['Nada más lento', 'que un *jubilado*'];
    },
    function ojo(ctx, t, a) {
      ice(ctx, t, '#06182E', '#020A14');
      shark(ctx, CX - 80, 1080, 1.4 * pop(t, a, 0.5), t, { parasite: t > ev.parasito - 0.3, mood: 'shock' });
      C.pill(ctx, t, ev.parasito, 'parásito en el ojo', CX, 760, '#F4E8C0');
      if (t > ev.giles) C.text(ctx, 'CASI CIEGO', CX, 1330, { size: 90 * pop(t, ev.giles, 0.35), color: '#fff', stroke: '#0b1030', strokeW: 12 });
      return ['Tiene un parásito', 'en el *ojo*'];
    },
    function carne(ctx, t, a) {
      C.bg(ctx, '#3A4A2A', '#7A8A4A');
      const pt = pop(t, ev.toxica - 0.2, 0.4);
      ctx.save(); ctx.translate(CX, 1080); ctx.scale(pop(t, a, 0.5), pop(t, a, 0.5));
      G.rrect(ctx, -260, -60, 520, 120, 30, { fill: '#F2E8D8', lw: 6, seed: 990 }); for (let k = 0; k < 6; k++) G.rrect(ctx, -230 + k * 80, -40, 60, 80, 10, { fill: '#E8D0A0', lw: 4, seed: 991 + k });
      ctx.restore();
      for (let i = 0; i < 5; i++) { const p = (t * 0.6 + i / 5) % 1; G.line(ctx, [[CX - 160 + i * 80, 1000 - p * 260], [CX - 140 + i * 80 + Math.sin(t * 3 + i) * 20, 960 - p * 260]], { color: `rgba(170,220,90,${1 - p})`, lw: 8, seed: 997 + i }); }
      if (pt > 0) { ctx.save(); ctx.translate(820, 740); ctx.scale(pt, pt); G.ellipse(ctx, 0, 0, 80, 70, { fill: '#F4F4F4', lw: 5, seed: 1000 }); G.ellipse(ctx, -25, -10, 18, 20, { fill: '#111', lw: 0, seed: 1001 }); G.ellipse(ctx, 25, -10, 18, 20, { fill: '#111', lw: 0, seed: 1002 }); G.rrect(ctx, -30, 40, 60, 40, 10, { fill: '#F4F4F4', lw: 5, seed: 1003 }); ctx.restore(); }
      C.pill(ctx, t, ev.islandia, 'Islandia', 250, 740, '#19B8B2');
      if (t > ev.morfan) C.person(ctx, 820, 1420, 0.8 * pop(t, ev.morfan, 0.4), { eyes: 'happy', mouth: 'grin', style: { shirt: '#5FB8FF' } });
      return ['Su carne es tóxica', 'y se la *morfan* igual'];
    },
    function cierre(ctx, t, a) {
      ice(ctx, t, '#2A2A5A', '#0A1030');
      if (t > ev.salame - 0.1) G.rays(ctx, CX, 1000, { n: 18, r0: 300, r1: 1300, color: '#FFD22E', lw: 10, alpha: 0.2, spin: t * 0.4 });
      shark(ctx, CX - 60, 1050, 1.0 * pop(t, a, 0.5), t, { glasses: t > ev.enterrar - 0.3, old: true, mood: 'smug' });
      if (t > ev.enterrar - 0.2) { const p = pop(t, ev.enterrar - 0.2, 0.4); G.rrect(ctx, 760, 1420 - 130 * p, 120, 160 * p, 40, { fill: '#8A8A9A', lw: 6, seed: 1010 }); C.text(ctx, 'VOS', 820, 1460 - 50 * p, { size: 40 * p, color: '#fff', shadow: false }); }
      if (t > ev.salame - 0.05) C.text(ctx, '¡SALAME!', CX, 780, { size: 150 * pop(t, ev.salame, 0.35), color: '#FFD22E', stroke: '#0b1030', strokeW: 16 });
      return ['Y aun así', 'te va a *enterrar*'];
    },
  ]);
})();
