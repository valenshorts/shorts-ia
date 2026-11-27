// Dormir (versión puteada). Zona útil: y 560-1340.
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, pop, out, cue } = C;
  const ev = {
    tercio: cue(0, 'tercio'), veinticinco: cue(0, 'veinticinco'), cama: cue(0, 'cama'),
    seis: cue(1, 'seis'), peliculas: cue(1, 'películas'), olvidas: cue(1, 'olvidás'),
    limpia: cue(2, 'limpia'), basura: cue(2, 'basura'), lava: cue(2, 'lava'),
    pocos: cue(3, 'pocos'), existen: cue(3, 'existen'), sueldo: cue(3, 'sueldo'),
    tiron: cue(4, 'tirón'), caes: cue(4, 'caés'), espasmo: cue(4, 'espasmo'),
    dormir: cue(5, 'dormir'), video: cue(5, 'video'),
  };
  const BIG = (ctx, t, t0, s, x, y, color = '#FFD22E', size = 100) => { if (t > t0) C.text(ctx, s, x, y, { size: size * pop(t, t0, 0.35), color, stroke: '#0b1030', strokeW: 14 }); };
  const night = (ctx) => { C.bg(ctx, '#1E2A5A', '#0A0E2A'); for (let i = 0; i < 40; i++) { ctx.globalAlpha = 0.5; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc((i * 137.5) % 1080, 580 + (i * 263.7) % 300, 2, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; };
  // persona acostada en la cama (cabeza a la izquierda)
  function bed(ctx, x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    G.rrect(ctx, -330, -40, 660, 120, 20, { fill: '#8A5A3A', lw: 7, seed: 900 });
    G.rrect(ctx, -340, -160, 40, 240, 12, { fill: '#8A5A3A', lw: 7, seed: 901 });
    G.rrect(ctx, -290, -90, 150, 70, 30, { fill: '#fff', lw: 6, seed: 902 });
    const br = Math.sin(t * 2) * 6;
    G.rrect(ctx, -170, -110 - br, 470, 100 + br, 40, { fill: o.blanket || '#5A8ADA', lw: 7, seed: 903 });
    const jump = o.jump || 0;
    ctx.save(); ctx.translate(0, -jump * 60);
    G.ellipse(ctx, -210, -110, 62, 58, { fill: '#E9B48A', lw: 6, seed: 904 });
    G.ellipse(ctx, -230, -160, 60, 28, { fill: '#3a2a20', lw: 4, seed: 905 });
    if (o.awake) { G.ellipse(ctx, -190, -116, 12, 14, { fill: '#fff', lw: 3, seed: 906 }); G.ellipse(ctx, -190, -114, 6, 6, { fill: '#111', lw: 0, seed: 907 }); G.ellipse(ctx, -168, -86, 12, 10, { fill: '#7A2A3A', lw: 3, seed: 908 }); }
    else { G.line(ctx, [[-205, -116], [-180, -110]], { lw: 5, seed: 909 }); }
    ctx.restore();
    ctx.restore();
  }
  function zzz(ctx, t, x, y) { for (let i = 0; i < 3; i++) { const p = (t * 0.6 + i / 3) % 1; C.text(ctx, 'Z', x + p * 80, y - p * 160, { size: 40 + 40 * p, color: '#fff', alpha: 1 - p, stroke: '#0b1030', strokeW: 6 }); } }
  C.film([
    function hook(ctx, t, a) {
      night(ctx);
      bed(ctx, CX, 1250, 1.1 * pop(t, a, 0.5), t);
      zzz(ctx, t, 330, 1060);
      // torta de la vida: 1/3 durmiendo
      if (t > ev.tercio - 0.2) { const k = out(t, ev.tercio - 0.2, 0.8); ctx.save(); ctx.translate(780, 790);
        ctx.fillStyle = '#fff'; ctx.strokeStyle = '#0b1030'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 130, 0, 7); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#7A6AE8'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 130, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 / 3 * k); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
      C.count(ctx, t, ev.veinticinco - 0.2, 25, 300, 790, { suf: ' AÑOS', size: 96 });
      return ['Vas a pasar', 'un *tercio* de tu vida durmiendo'];
    },
    function suenios(ctx, t, a) {
      night(ctx);
      bed(ctx, CX, 1260, 1.0, t);
      // nube de sueño con "película"
      ctx.save(); ctx.translate(640, 820); const s = pop(t, ev.seis - 0.3, 0.5); ctx.scale(s, s);
      for (const [dx, dy, r] of [[0, 0, 150], [-140, 30, 100], [140, 30, 110], [-60, -90, 100], [70, -90, 100]]) G.ellipse(ctx, dx, dy, r, r * 0.8, { fill: '#fff', lw: 6, seed: 910 + dx });
      G.rrect(ctx, -120, -70, 240, 150, 14, { fill: '#222', lw: 5, seed: 916 }); const k = (t * 2) % 1;
      G.ellipse(ctx, -40 + k * 80, 0, 26, 26, { fill: '#FFD22E', lw: 0, seed: 917 }); G.poly(ctx, [[30, -20], [70, 0], [30, 20]], { fill: '#fff', lw: 0, seed: 918 });
      ctx.restore();
      for (let i = 0; i < 3; i++) G.ellipse(ctx, 380 - i * 50, 1040 + i * 40, 22 - i * 5, 18 - i * 4, { fill: '#fff', lw: 4, seed: 920 + i });
      C.count(ctx, t, ev.seis - 0.2, 6, 250, 700, { suf: ' AÑOS', size: 90, color: '#B9A8FF' });
      if (t > ev.olvidas) C.pill(ctx, t, ev.olvidas, 'y te las olvidás', 250, 810, '#B9A8FF');
      return ['De tu vida', '*6 años* soñando'];
    },
    function limpia(ctx, t, a) {
      night(ctx);
      ctx.save(); ctx.translate(CX, 950); const s = pop(t, a, 0.5); ctx.scale(s, s);
      G.ellipse(ctx, 0, 0, 300, 220, { fill: '#FF9AB4', lw: 8, seed: 930 });
      for (let i = 0; i < 6; i++) G.line(ctx, [[-240 + i * 90, -150], [-200 + i * 90, -50], [-250 + i * 90, 50], [-210 + i * 90, 150]], { color: '#C85A7A', lw: 7, seed: 931 + i });
      ctx.restore();
      // basura que se va
      const k = out(t, ev.lava - 0.2, 1.4);
      for (let i = 0; i < 7; i++) { const x = 360 + (i * 61) % 360, y = 860 + (i * 53) % 200; G.rrect(ctx, x + k * (600 + i * 30), y - k * 120, 34, 34, 6, { fill: '#7A6A4A', lw: 4, seed: 940 + i, alpha: 1 - k }); }
      if (t > ev.lava - 0.3) for (let i = 0; i < 10; i++) { const p = ((t - ev.lava) * 1.2 + i / 10) % 1; ctx.save(); ctx.globalAlpha = 0.6 * (1 - p); ctx.strokeStyle = '#BFE6FF'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(300 + i * 52, 1200 - p * 400, 10 + (i % 3) * 5, 0, 7); ctx.stroke(); ctx.restore(); }
      C.pill(ctx, t, ev.basura, 'saca la basura del día', CX, 680, '#BFE6FF');
      BIG(ctx, t, ev.lava, 'LAVA', CX, 1290, '#BFE6FF', 100);
      return ['El cerebro', 'se *limpia* de noche'];
    },
    function sin(ctx, t, a) {
      C.bg(ctx, '#3A2A5A', '#15102A');
      C.person(ctx, 330, 1320, 1.2 * pop(t, a, 0.5), { pose: 'stand', eyes: 'worried', mouth: 'wavy', style: { shirt: '#7A5AB0' } });
      // ojeras
      if (t > ev.existen - 0.2) { const k = pop(t, ev.existen - 0.2, 0.5);
        ctx.save(); ctx.translate(780, 880); ctx.scale(k, k); ctx.globalAlpha = 0.85 + 0.15 * Math.sin(t * 6);
        G.rrect(ctx, -200, -110, 400, 220, 30, { fill: '#3FB06A', lw: 7, seed: 950 }); C.text(ctx, '$ SUELDO', 0, 26, { size: 64, color: '#fff', stroke: '#0b1030', strokeW: 8 }); ctx.restore(); }
      C.count(ctx, t, ev.pocos - 0.2, 3, 780, 680, { suf: ' DÍAS', size: 90 });
      if (t > ev.sueldo) C.text(ctx, '¿EXISTE?', 780, 1100, { size: 80 * pop(t, ev.sueldo, 0.35), color: '#FFD22E', stroke: '#0b1030', strokeW: 12 });
      return ['Sin dormir', 'ves *cosas que no existen*'];
    },
    function tiron(ctx, t, a) {
      night(ctx);
      const jump = t > ev.caes - 0.1 && t < ev.caes + 0.5 ? Math.sin((t - ev.caes + 0.1) / 0.6 * Math.PI) : 0;
      bed(ctx, CX, 1250, 1.1, t, { awake: t > ev.caes - 0.1, jump });
      if (jump > 0.1) { G.line(ctx, [[260, 1000], [230, 960]], { lw: 6, seed: 960 }); G.line(ctx, [[300, 990], [300, 940]], { lw: 6, seed: 961 }); G.line(ctx, [[340, 1000], [370, 960]], { lw: 6, seed: 962 }); }
      C.pill(ctx, t, ev.espasmo, 'espasmo hípnico', CX, 700, '#FFD22E');
      BIG(ctx, t, ev.caes, '¡ME CAIGO!', CX, 860, '#fff', 96);
      return ['Antes de dormir', 'ese *tirón*'];
    },
    function cierre(ctx, t, a) {
      night(ctx);
      bed(ctx, CX, 1250, 1.1, t, { awake: true });
      ctx.save(); ctx.translate(560, 1080); const s = pop(t, ev.video - 0.2, 0.4); ctx.scale(s, s);
      G.rrect(ctx, -50, -90, 100, 180, 16, { fill: '#222', lw: 5, seed: 970 }); G.rrect(ctx, -40, -78, 80, 156, 10, { fill: '#5FB8FF', lw: 0, seed: 971 }); ctx.restore();
      if (t > ev.video - 0.2) C.glow(ctx, 560, 1080, 260, '95,184,255', 0.35);
      BIG(ctx, t, ev.dormir, 'ANDÁ A DORMIR', CX, 720, '#FFD22E', 90);
      if (t > ev.video) C.pill(ctx, t, ev.video, 'después de otro video', CX, 840, '#5FB8FF');
      return ['Andá a dormir', '*después de otro video*'];
    },
  ]);
})();
