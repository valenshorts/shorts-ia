// El pulpo (versión puteada): tres corazones, sangre azul y nueve cerebros
(function () {
  const G = globalThis.G, C = globalThis.C, D = globalThis.MONJE;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  // n-ésima vez que se dice una palabra dentro de una escena
  const nth = (si, pre, n) => { const ws = D.words.filter((x) => x.s === si && x.n.indexOf(pre) === 0); return (ws[n] || ws[ws.length - 1] || { t: D.scenes[si].a }).t; };
  const ev = {
    puta: cue(0, 'puta'), raro: cue(0, 'raro'), puto: cue(0, 'puto'), boludo: cue(0, 'boludo'),
    tres: cue(1, 'tres'), tres2: nth(1, 'tres', 1), concha: cue(1, 'concha'), vos: cue(1, 'vos'), das: cue(1, 'das'),
    nada: cue(2, 'nada'), para: cue(2, 'para'), apaga: cue(2, 'apaga'), pelotudo: cue(2, 'pelotudo'), caminar: cue(2, 'caminar'),
    azul: cue(3, 'azul'), rey: cue(3, 'rey'), cobre: cue(3, 'cobre'), hierro: cue(3, 'hierro'),
    nueve: cue(4, 'nueve'), cerebros: cue(4, 'cerebros'), cabeza: cue(4, 'cabeza'), cada: cue(4, 'cada'), brazo: cue(4, 'brazo'),
    piensa: cue(5, 'piensa'), cortas: cue(5, 'cortás'), sigue: cue(5, 'sigue'), agarrando: cue(5, 'agarrando'), remil: cue(5, 'remil'),
    nueve2: cue(6, 'nueve'), corazones2: cue(6, 'corazones'), vos2: cue(6, 'vos'), llaves: cue(6, 'llaves'), forro: cue(6, 'forro'),
  };
  const ORANGE = '#F47B4F', ODARK = '#9E3B22', INK = '#2a1410';

  // fondo de mar con burbujas que suben siempre (nunca queda quieto)
  function sea(ctx, t, top = '#0B2E5C', bot = '#1E7FB0', sand = true) {
    C.bg(ctx, top, bot);
    for (let i = 0; i < 7; i++) { // rayos de luz que se mueven
      ctx.save(); ctx.globalAlpha = 0.06 + 0.04 * Math.sin(t * 0.9 + i); ctx.fillStyle = '#BFE9FF';
      const x = (i * 190 + Math.sin(t * 0.4 + i) * 60) % 1300 - 100;
      ctx.beginPath(); ctx.moveTo(x, -50); ctx.lineTo(x + 120, -50); ctx.lineTo(x + 360, 1900); ctx.lineTo(x + 200, 1900); ctx.fill(); ctx.restore();
    }
    if (sand) {
      G.poly(ctx, [[-60, 1560], [300, 1520], [700, 1545], [1140, 1510], [1140, 2000], [-60, 2000]], { fill: '#E8C88E', lw: 6, seed: 300 });
      for (let i = 0; i < 5; i++) { const x = 90 + i * 230, h = 120 + (i % 3) * 50, sw = Math.sin(t * 1.6 + i) * 18;
        G.limb(ctx, [[x, 1560], [x + sw, 1560 - h / 2], [x + sw * 1.8, 1560 - h]], { color: '#3FAF7A', lw: 18, ink: '#1d5a3c', outline: 4, seed: 310 + i }); }
    }
    for (let i = 0; i < 26; i++) { const x = (i * 131.7) % 1080 + Math.sin(t * 2 + i) * 14, y = 1900 - ((t * (70 + (i % 5) * 25) + i * 173) % 2000), r = 5 + (i % 4) * 4;
      ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = '#DDF4FF'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); ctx.restore(); }
  }

  // el pulpo. o: { col, dark, mood: 'angry'|'shock'|'smug'|'dizzy'|'happy', walk, wig, skip:[i], alpha, glass, crown, xray }
  function pulpo(ctx, x, y, s, t, o = {}) {
    const col = o.col || ORANGE, dark = o.dark || ODARK, wig = o.wig ?? 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0); ctx.globalAlpha = o.alpha ?? 1;
    const arms = [];
    for (let i = 0; i < 8; i++) {
      const bx = (i - 3.5) * 36, ph = t * 3.2 + i * 0.85, spread = (i - 3.5) * (o.walk ? 34 : 62), len = 250 + ((i === 3 || i === 4) ? 30 : 0);
      const pts = [];
      for (let j = 0; j <= 5; j++) {
        const f = j / 5;
        if (o.walk) { const lift = Math.max(0, Math.sin(t * 7 + i * Math.PI / 2)) * 40 * f; pts.push([bx + spread * f + Math.sin(ph + f * 2) * 12 * f, 40 + len * 1.05 * f - lift]); }
        else pts.push([bx + spread * f + Math.sin(ph + f * 3.2) * 34 * f * wig, 40 + len * f + Math.cos(ph + f * 2) * 10 * f * wig]);
      }
      arms.push(pts);
      if (o.skip && o.skip.includes(i)) continue;
      G.limb(ctx, pts, { color: col, lw: 44, ink: dark, outline: 5, seed: 10 + i });
      for (let j = 2; j <= 5; j++) G.ellipse(ctx, pts[j][0], pts[j][1], 7, 7, { fill: '#FFD7C2', lw: 2, seed: 30 + i * 6 + j });
    }
    if (o.xray) { // cuerpo transparente para ver los corazones
      ctx.save(); ctx.globalAlpha *= 0.55; G.ellipse(ctx, 0, -120, 200, 220, { fill: col, lw: 6, seed: 1 }); ctx.restore();
      G.ellipse(ctx, 0, -120, 200, 220, { fill: 'rgba(0,0,0,0)', lw: 6, seed: 1 });
    } else {
      G.ellipse(ctx, 0, -120, 200, 220, { fill: col, lw: 6, seed: 1 });
      for (const [sx, sy, r] of [[-110, -230, 18], [-60, -280, 12], [100, -250, 16], [130, -170, 10], [-130, -140, 11]]) G.ellipse(ctx, sx, sy, r, r, { fill: dark, lw: 0, seed: 40 + sx & 31, alpha: 0.35 });
    }
    // cara
    const m = o.mood || 'angry', blink = (Math.sin(t * 1.3) > 0.985) ? 0.15 : 1;
    const ey = -70, eR = m === 'shock' ? 52 : 44;
    for (const sx of [-72, 72]) {
      G.ellipse(ctx, sx, ey, eR, eR * blink, { fill: '#FFFFFF', lw: 5, seed: 50 + sx });
      if (m === 'dizzy') { G.line(ctx, [[sx - 20, ey - 20], [sx + 20, ey + 20]], { lw: 7, seed: 60 }); G.line(ctx, [[sx + 20, ey - 20], [sx - 20, ey + 20]], { lw: 7, seed: 61 }); }
      else G.ellipse(ctx, sx + Math.sin(t * 0.7) * 6, ey + 6, (m === 'shock' ? 14 : 20), (m === 'shock' ? 14 : 20) * blink, { fill: '#1a0e0a', lw: 0, seed: 62 + sx });
    }
    if (m === 'angry') { G.line(ctx, [[-120, -140], [-30, -105]], { lw: 12, seed: 70 }); G.line(ctx, [[120, -140], [30, -105]], { lw: 12, seed: 71 }); }
    if (m === 'smug') { G.line(ctx, [[-115, -125], [-30, -118]], { lw: 10, seed: 72 }); G.line(ctx, [[30, -128], [115, -145]], { lw: 10, seed: 73 }); }
    if (m === 'shock') { G.line(ctx, [[-115, -150], [-35, -160]], { lw: 10, seed: 74 }); G.line(ctx, [[35, -160], [115, -150]], { lw: 10, seed: 75 }); }
    if (m === 'angry') G.line(ctx, [[-38, 20], [0, 4], [38, 20]], { lw: 9, seed: 76 });
    else if (m === 'shock') G.ellipse(ctx, 0, 20, 22, 30, { fill: '#5a1a14', lw: 5, seed: 77 });
    else if (m === 'dizzy') G.line(ctx, [[-40, 18], [-15, 8], [10, 22], [40, 10]], { lw: 8, seed: 78 });
    else G.line(ctx, [[-40, 6], [0, 26], [40, 6]], { lw: 9, seed: 79 });
    if (o.glass) { G.rrect(ctx, -130, -110, 110, 70, 22, { fill: '#111522', lw: 5, seed: 80 }); G.rrect(ctx, 20, -110, 110, 70, 22, { fill: '#111522', lw: 5, seed: 81 }); G.line(ctx, [[-20, -85], [20, -85]], { lw: 8, seed: 82 });
      G.line(ctx, [[-100, -95], [-70, -70]], { color: 'rgba(255,255,255,0.6)', lw: 6, seed: 83 }); }
    if (o.crown) { const cy = -330; G.poly(ctx, [[-110, cy + 40], [-120, cy - 70], [-55, cy - 15], [0, cy - 95], [55, cy - 15], [120, cy - 70], [110, cy + 40]], { fill: '#FFD22E', lw: 6, seed: 84 });
      for (const [gx, gc] of [[-60, '#E0304A'], [0, '#2F7BD8'], [60, '#3FAF7A']]) G.ellipse(ctx, gx, cy + 10, 14, 14, { fill: gc, lw: 3, seed: 85 + gx }); }
    ctx.restore();
    return arms; // puntos de los brazos (en coordenadas del pulpo) por si la escena quiere usarlos
  }

  function brain(ctx, x, y, r, glow, seed = 1) {
    if (glow > 0) C.glow(ctx, x, y, r * 2.4, '255,140,220', 0.55 * glow);
    G.ellipse(ctx, x, y, r * 1.25, r, { fill: glow > 0.5 ? '#FF9AD5' : '#F2A6C8', lw: Math.max(2, r * 0.09), seed });
    G.line(ctx, [[x, y - r * 0.9], [x, y + r * 0.8]], { lw: Math.max(2, r * 0.07), seed: seed + 1 });
    for (const sx of [-1, 1]) G.line(ctx, [[x + sx * r * 0.85, y - r * 0.2], [x + sx * r * 0.45, y - r * 0.45], [x + sx * r * 0.55, y + r * 0.1], [x + sx * r * 0.25, y + r * 0.4]], { lw: Math.max(2, r * 0.06), seed: seed + 2 + sx });
  }
  function heart(ctx, x, y, s, beat, col = '#E8324A') { const k = 1 + 0.14 * beat; C.glow(ctx, x, y, 120 * s, col === '#8C8C96' ? '160,160,170' : '255,80,100', 0.35); G.heart(ctx, x, y, s * k, { fill: col }); }
  function keys(ctx, x, y, s, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    G.ellipse(ctx, 0, 0, 34, 34, { fill: '#F2C230', lw: 5, seed: 90 }); G.ellipse(ctx, 0, 0, 13, 13, { fill: '#2a2a3a', lw: 3, seed: 91 });
    G.rrect(ctx, 28, -9, 110, 18, 6, { fill: '#F2C230', lw: 5, seed: 92 }); G.rrect(ctx, 100, 6, 14, 26, 3, { fill: '#F2C230', lw: 4, seed: 93 }); G.rrect(ctx, 124, 6, 12, 20, 3, { fill: '#F2C230', lw: 4, seed: 94 }); ctx.restore(); }
  const shake = (t, t0, amp = 22, d = 0.45) => { const k = clamp(1 - (t - t0) / d); return t >= t0 && k > 0 ? [Math.sin(t * 70) * amp * k, Math.cos(t * 61) * amp * k] : [0, 0]; };

  C.film([
    function hook(ctx, t, a) {
      sea(ctx, t);
      const [sx, sy] = shake(t, ev.puto, 26);
      ctx.save(); ctx.translate(sx, sy);
      if (t > ev.puto - 0.05) G.rays(ctx, CX, 1000, { n: 18, r0: 380, r1: 1300, color: '#FFD22E', lw: 10, alpha: 0.25 * fade(t, ev.puto, 0.2), spin: t * 0.3 });
      pulpo(ctx, CX, 1080 + Math.sin(t * 1.8) * 18, 1.45 * (0.55 + 0.45 * pop(t, a, 0.5)), t, { mood: t > ev.raro ? 'angry' : 'smug' });
      for (let i = 0; i < 5; i++) { const p = clamp((t - ev.raro - i * 0.08) / 0.5); if (p <= 0) continue; // peces que huyen
        const dir = i % 2 ? 1 : -1, fx = CX + dir * (300 + p * 700), fy = 760 + i * 150;
        G.ellipse(ctx, fx, fy, 50, 28, { fill: ['#FFD22E', '#5FD0FF', '#FF8AB0'][i % 3], lw: 4, seed: 120 + i }); G.poly(ctx, [[fx - dir * 45, fy], [fx - dir * 90, fy - 30], [fx - dir * 90, fy + 30]], { fill: ['#FFD22E', '#5FD0FF', '#FF8AB0'][i % 3], lw: 4, seed: 130 + i }); }
      ctx.restore();
      C.pill(ctx, t, ev.raro, 'el más raro del océano', CX, 650, '#FFD22E');
      return ['El pulpo es', 'el hijo de *puta* más raro'];
    },
    function corazones(ctx, t, a) {
      sea(ctx, t, '#2A0E2E', '#7A2A4A', false);
      const vos = t > ev.vos, px = vos ? lerp(CX, 330, out(t, ev.vos, 0.5)) : CX, ps = vos ? lerp(1.5, 1.05, out(t, ev.vos, 0.5)) : 1.5;
      const [sx, sy] = shake(t, ev.concha, 30, 0.6);
      ctx.save(); ctx.translate(sx, sy);
      pulpo(ctx, px, 1060, ps * pop(t, a, 0.5), t, { xray: true, mood: t > ev.concha ? 'shock' : 'happy' });
      const beat = Math.max(0, Math.sin(t * 9)) ** 3;
      [[-95, -250], [95, -250], [0, -315]].forEach(([hx, hy], i) => { const p = pop(t, ev.tres + i * 0.25, 0.4); if (p <= 0) return;
        heart(ctx, px + hx * ps, 1060 + hy * ps, 3.4 * ps * p, beat); });
      if (t > ev.tres2) C.text(ctx, '3', px + 230 * ps, 760, { size: 230 * pop(t, ev.tres2, 0.4), color: '#FFD22E', stroke: '#0b1030', strokeW: 16 });
      ctx.restore();
      if (vos) { const p = pop(t, ev.vos, 0.45);
        C.person(ctx, 780, 1330, 1.05 * p, { eyes: 'worried', mouth: 'wavy', brows: 'worried', style: { shirt: '#19B8B2' } });
        heart(ctx, 780, 1030, 1.4 * p, Math.max(0, Math.sin(t * 13)) ** 3);
        for (let i = 0; i < 3; i++) G.ellipse(ctx, 700 + i * 60, 880 - ((t * 120 + i * 40) % 120), 8, 14, { fill: '#7FD4FF', lw: 2, seed: 140 + i }); // sudor
        C.pill(ctx, t, ev.das, 'ya no das más', 780, 1470 - 200, '#ff5a3a'); }
      return ['Tiene', '*tres* corazones'];
    },
    function nadar(ctx, t, a, b) {
      sea(ctx, t, '#0A2650', '#1A6A9A', t > ev.caminar - 0.3);
      if (t < ev.caminar - 0.3) {
        const sw = clamp((t - a) / (ev.apaga - a)), off = t > ev.para ? out(t, ev.para, 0.8) : 0;
        const x = lerp(170, 760, sw) - 120 * off, y = 1000 + Math.sin(t * 5) * 30 + 260 * out(t, ev.apaga, 0.8);
        for (let i = 0; i < 8; i++) { const bt = (t * 3 + i / 8) % 1; G.ellipse(ctx, x - 250 - bt * 300, y + 140 + Math.sin(i) * 60, 10 + bt * 18, 10 + bt * 18, { fill: 'rgba(220,244,255,0.35)', lw: 2, seed: 150 + i }); }
        pulpo(ctx, x, y, 1.1, t, { rot: Math.PI / 2 * (1 - out(t, ev.apaga, 0.6)) * 0.9 - 0.25 * off, wig: 0.4, mood: t > ev.apaga ? 'dizzy' : (t > ev.para ? 'shock' : 'happy') });
        // monitor del corazón principal
        const pp = pop(t, ev.para - 0.4, 0.4);
        if (pp > 0) { ctx.save(); ctx.translate(760, 700); ctx.scale(1.3 * pp, 1.3 * pp);
          G.rrect(ctx, -200, -110, 400, 220, 30, { fill: '#0b1030', lw: 6, seed: 160 });
          const dead = t > ev.para, hc = dead ? '#8C8C96' : '#E8324A';
          heart(ctx, -120, 0, 1.3, dead ? 0 : Math.max(0, Math.sin(t * 9)) ** 3, hc);
          const pts = []; for (let i = 0; i <= 30; i++) { const xx = -50 + i * 7.5, ph = (i / 30 + t * 1.5) % 1; pts.push([xx, dead ? 0 : (ph > 0.45 && ph < 0.55 ? -70 * Math.sin((ph - 0.45) * 31) : 0)]); }
          G.line(ctx, pts, { color: dead ? '#8C8C96' : '#3FE07A', lw: 7, seed: 161 });
          ctx.restore(); }
        if (t > ev.pelotudo - 0.1) for (let i = 0; i < 3; i++) { const an = t * 4 + i * 2.1; G.star(ctx, x + Math.cos(an) * 160, y - 330 + Math.sin(an) * 40, 22, { fill: '#FFD22E', rot: t * 3 }); }
        C.pill(ctx, t, ev.para, 'se le para el corazón', CX, 1300, '#ff5a3a');
      } else {
        const wx = lerp(-200, 1250, clamp((t - ev.caminar + 0.3) / 2.6));
        pulpo(ctx, wx, 1180, 1.05, t, { walk: true, mood: 'smug' });
        C.pill(ctx, t, ev.caminar, 'mejor camina', CX, 700, '#3FE07A');
      }
      return ['Cuando nada', 'el corazón se le *para*'];
    },
    function sangre(ctx, t, a) {
      const king = t > ev.rey - 0.15;
      sea(ctx, t, king ? '#2A1A5A' : '#071A3A', king ? '#5A3AA0' : '#123A7A', false);
      if (!king) { const fall = clamp((t - a) / (ev.azul - a + 0.2)), dy = lerp(500, 1080, ease.inQuad(fall)), splash = out(t, ev.azul + 0.05, 0.4);
        C.glow(ctx, CX, dy, 300, '80,160,255', 0.5);
        G.poly(ctx, [[CX, dy - 230], [CX + 120, dy + 20], [CX + 105, dy + 110], [CX, dy + 160], [CX - 105, dy + 110], [CX - 120, dy + 20]], { fill: '#2F7BFF', lw: 7, seed: 170 });
        G.ellipse(ctx, CX - 40, dy + 10, 22, 50, { fill: 'rgba(255,255,255,0.55)', lw: 0, seed: 171 });
        if (splash > 0) for (let i = 0; i < 10; i++) { const an = Math.PI + i / 9 * Math.PI; G.ellipse(ctx, CX + Math.cos(an) * 260 * splash, 1250 + Math.sin(an) * 140 * splash, 18, 18, { fill: '#2F7BFF', lw: 3, seed: 172 + i }); }
      } else {
        G.rays(ctx, CX, 1050, { n: 24, r0: 300, r1: 1400, color: '#FFD22E', lw: 8, alpha: 0.18, spin: t * 0.2 });
        // trono
        G.rrect(ctx, CX - 260, 820, 520, 760, 60, { fill: '#B0283A', lw: 7, seed: 180 }); G.rrect(ctx, CX - 300, 1350, 600, 120, 30, { fill: '#D9A93A', lw: 6, seed: 181 });
        pulpo(ctx, CX, 1180, 1.2 * pop(t, ev.rey - 0.15, 0.5), t, { col: '#5A7BFF', dark: '#24308A', crown: true, mood: 'smug' });
        const p1 = pop(t, ev.cobre, 0.4), p2 = pop(t, ev.hierro, 0.4);
        if (p1 > 0) { C.text(ctx, 'Cu', 230, 780, { size: 110 * p1, color: '#E58A4A', stroke: '#0b1030', strokeW: 12 }); C.pill(ctx, t, ev.cobre, 'cobre', 230, 840, '#E58A4A'); }
        if (p2 > 0) { C.text(ctx, 'Fe', 850, 780, { size: 110 * p2, color: '#C8CCD8', stroke: '#0b1030', strokeW: 12, alpha: 0.6 }); G.line(ctx, [[770, 660], [930, 800]], { color: '#ff3a3a', lw: 14, seed: 190 }); G.line(ctx, [[930, 660], [770, 800]], { color: '#ff3a3a', lw: 14, seed: 191 }); }
      }
      C.pill(ctx, t, ev.azul, 'sangre azul', CX, 1430 - 120, '#5fb8ff');
      return ['La sangre la tiene', '*azul*, como un rey'];
    },
    function cerebros(ctx, t, a) {
      sea(ctx, t, '#140A3A', '#3A1E7A', false);
      const s = 1.35 * pop(t, a, 0.5), x = CX, y = 1040 + Math.sin(t * 1.5) * 14;
      const arms = pulpo(ctx, x, y, s, t, { mood: 'happy', col: '#8E6BFF', dark: '#3B2A8A' });
      const on0 = ev.cerebros - 0.1;
      brain(ctx, x, y - 330 * s, 70 * s, out(t, on0, 0.3), 200);
      for (let i = 0; i < 8; i++) { const tip = arms[i][4], g = out(t, ev.cada + i * 0.1, 0.25); if (g <= 0 && t < ev.cada) continue;
        brain(ctx, x + tip[0] * s, y + tip[1] * s, 36 * s * (0.6 + 0.4 * pop(t, ev.cada + i * 0.1, 0.35)), g, 210 + i * 4); }
      const pn = pop(t, ev.nueve, 0.4);
      if (pn > 0) C.text(ctx, '9', 900, 820, { size: 260 * pn, color: '#FFD22E', stroke: '#0b1030', strokeW: 16 });
      C.pill(ctx, t, ev.cabeza, '1 en la cabeza', CX, 640, '#FF9AD5');
      C.pill(ctx, t, ev.brazo, '+ 1 en cada brazo', CX, 1320, '#FF9AD5');
      return ['Y encima tiene', '*nueve* cerebros'];
    },
    function brazos(ctx, t, a) {
      const mad = t > ev.remil - 0.1;
      sea(ctx, t, mad ? '#3A0A12' : '#0B2E5C', mad ? '#8A1A2A' : '#1E7FB0', true);
      const cut = t > ev.cortas, cp = out(t, ev.cortas, 0.5);
      const [sx, sy] = shake(t, ev.remil, 28, 0.7);
      ctx.save(); ctx.translate(sx, sy);
      if (mad) for (let i = 0; i < 9; i++) { const r = 120 + 260 * out(t, ev.remil, 0.8) + i * 18, an = i * 0.7 + t * 0.5; G.ellipse(ctx, 330 + Math.cos(an) * r * 0.6, 1100 + Math.sin(an) * r * 0.5, 90, 70, { fill: 'rgba(20,10,30,0.55)', lw: 0, seed: 240 + i }); }
      const px = cut ? lerp(CX, 330, cp) : CX;
      const arms = pulpo(ctx, px, 1050, 1.25 * pop(t, a, 0.5), t, { mood: mad ? 'angry' : (cut ? 'shock' : 'happy'), skip: cut ? [7] : [], col: mad ? '#E8484A' : ORANGE });
      if (!cut) arms.forEach((pts, i) => { const p = pop(t, ev.piensa + i * 0.06, 0.3); if (p <= 0) return; const tip = pts[5];
        C.text(ctx, '?', px + tip[0] * 1.25 + 10, 1050 + tip[1] * 1.25 - 60, { size: 64 * p, color: '#FFD22E', stroke: '#0b1030', strokeW: 8 }); });
      ctx.restore();
      if (cut) { // el brazo cortado sigue solo y agarra un caracol
        const ax = lerp(560, 780, cp) + Math.sin(t * 3) * 10, ay = 1230, wig = Math.sin(t * 6);
        const pts = [[ax - 150, ay - 30 + wig * 20], [ax - 70, ay - 70 - wig * 25], [ax + 10, ay - 40 + wig * 20], [ax + 90, ay - 80 - wig * 15], [ax + 150, ay - 60]];
        G.limb(ctx, pts, { color: ORANGE, lw: 44, ink: ODARK, outline: 5, seed: 260 });
        for (let j = 1; j < 5; j++) G.ellipse(ctx, pts[j][0], pts[j][1] + 6, 7, 7, { fill: '#FFD7C2', lw: 2, seed: 261 + j });
        const grab = out(t, ev.agarrando, 0.4), shx = lerp(900, ax + 170, grab), shy = lerp(1300, ay - 70, grab);
        G.ellipse(ctx, shx, shy, 48, 40, { fill: '#F7D9A8', lw: 5, seed: 270 }); G.line(ctx, [[shx - 30, shy], [shx, shy - 25], [shx + 25, shy + 5], [shx, shy + 15]], { lw: 5, seed: 271 });
        C.pill(ctx, t, ev.sigue, 'sigue solo', 760, 1060, '#3FE07A');
      }
      if (mad) C.pill(ctx, t, ev.remil, 'hijo de remil', CX, 700, '#ff3a3a');
      return ['Cada brazo', 'piensa *solo*'];
    },
    function cierre(ctx, t, a) {
      const forro = t > ev.forro - 0.05;
      sea(ctx, t, '#0B2E5C', '#1E7FB0', false);
      if (forro) G.rays(ctx, CX, 1000, { n: 20, r0: 300, r1: 1400, color: '#FFD22E', lw: 10, alpha: 0.22, spin: t * 0.4 });
      const left = t > ev.vos2 - 0.1, k = out(t, ev.vos2 - 0.1, 0.5);
      const px = lerp(CX, 290, k), ps = lerp(1.25, 0.85, k);
      pulpo(ctx, px, 1080, ps * pop(t, a, 0.5), t, { glass: true, mood: 'smug', wig: 0.6 });
      for (let i = 0; i < 9; i++) { const p = pop(t, ev.nueve2 + i * 0.05, 0.3); if (p <= 0) continue; const an = t * 0.8 + i / 9 * 6.28; brain(ctx, px + Math.cos(an) * 330 * ps, 1000 + Math.sin(an) * 330 * ps, 20 * p, 0.4, 300 + i * 4); }
      for (let i = 0; i < 3; i++) { const p = pop(t, ev.corazones2 + i * 0.08, 0.3); if (p <= 0) continue; const an = -t * 1.1 + i / 3 * 6.28; heart(ctx, px + Math.cos(an) * 220 * ps, 920 + Math.sin(an) * 140 * ps, 0.9 * p, Math.max(0, Math.sin(t * 9)) ** 3); }
      if (left) { const p = pop(t, ev.vos2, 0.45), look = Math.sin(t * 5);
        C.person(ctx, 790, 1330, 1.05 * p, { eyes: 'worried', mouth: 'o', brows: 'worried', look, style: { shirt: '#FFD22E' } });
        for (let i = 0; i < 3; i++) C.text(ctx, '?', 690 + i * 100, 860 - Math.abs(Math.sin(t * 3 + i)) * 40, { size: 80 * p, color: '#fff', stroke: '#0b1030', strokeW: 8 });
        const kk = out(t, ev.llaves, 0.4); if (kk > 0) keys(ctx, lerp(1150, 960, kk), 1500 + Math.sin(t * 2) * 10, 1, t * 0.5); }
      if (forro) C.text(ctx, '¡FORRO!', CX, 760, { size: 150 * pop(t, ev.forro, 0.35), color: '#FFD22E', stroke: '#0b1030', strokeW: 16 });
      return left ? ['Y vos', 'no encontrás las *llaves*'] : ['Nueve cerebros', 'y *tres* corazones'];
    },
  ]);
})();
