// La luz de las luciérnagas
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = { luz: cue(0, 'luz'), calienta: cue(0, 'calienta'), reaccion: cue(1, 'reacción'), mezcla: cue(1, 'mezcla'), oxigeno: cue(1, 'oxígeno'), especial: cue(2, 'especial'),
    calor: cue(2, 'calor'), bombilla: cue(3, 'bombilla'), no: cue(3, 'luciérnaga'), fria: cue(4, 'fría'), codigo: cue(5, 'código'), machos: cue(5, 'machos'), hembras: cue(5, 'hembras'), conversacion: cue(6, 'conversación') };
  function fly(ctx, x, y, s, t, on = 1, seed = 0) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (on > 0) C.glow(ctx, -60, 20, 160, '210,255,90', 0.7 * on);
    const w = Math.sin(t * 30 + seed) * 0.4;
    G.ellipse(ctx, 10, -50 - 10 * w, 70, 26, { fill: 'rgba(220,240,255,0.6)', lw: 3, seed: seed + 1 }); G.ellipse(ctx, 30, -48 + 10 * w, 60, 22, { fill: 'rgba(220,240,255,0.6)', lw: 3, seed: seed + 2 });
    G.ellipse(ctx, 0, 0, 80, 34, { fill: '#3A3A2A', lw: 5, seed: seed + 3 }); G.ellipse(ctx, 75, -5, 28, 26, { fill: '#C04A2A', lw: 4, seed: seed + 4 });
    G.ellipse(ctx, -60, 10, 40, 28, { fill: on > 0.2 ? '#E8FF6A' : '#9A9A5A', lw: 4, seed: seed + 5 });
    ctx.restore();
  }
  const night = (ctx, t) => { C.bg(ctx, '#050A1A', '#0E2A2A'); for (let i = 0; i < 10; i++) G.limb(ctx, [[i * 120, 1500], [i * 120 + 20, 1200 - (i % 3) * 80]], { color: '#0A1A14', lw: 60, outline: '#050a08' }); };
  C.film([
    function calienta(ctx, t, a) {
      night(ctx, t);
      fly(ctx, CX + Math.sin(t) * 60, 920 + Math.cos(t * 1.3) * 40, 1.6 * pop(t, a, 0.5), t, 0.6 + 0.4 * Math.sin(t * 4));
      C.pill(ctx, t, ev.calienta, 'casi no calienta', CX, 1250, '#E8FF6A');
      return ['La luz de una luciérnaga', 'casi no *calienta*'];
    },
    function reaccion(ctx, t, a) {
      C.bg(ctx, '#0A1A2A', '#1A3A4A');
      const k1 = pop(t, Math.min(ev.mezcla - 0.1, a + 0.15)), k2 = pop(t, Math.min(ev.oxigeno - 0.1, a + 0.6)), m = out(t, ev.oxigeno + 0.3, 0.6), bob = (1 - m) * 18;
      for (let i = 0; i < 16; i++) { const p = (t * 0.25 + i / 16) % 1; C.glow(ctx, 120 + (i * 137) % 840, 1300 - p * 760, 26, '210,255,90', 0.5 * Math.sin(p * Math.PI)); }
      ctx.save(); ctx.translate(lerp(280, CX, m), 940 + Math.sin(t * 2.4) * bob); ctx.scale(k1, k1); G.ellipse(ctx, 0, 0, 90, 90, { fill: '#B8E04A', lw: 6, seed: 10 }); ctx.restore();
      ctx.save(); ctx.translate(lerp(800, CX, m), 940 + Math.cos(t * 2.1) * bob); ctx.scale(k2, k2); G.ellipse(ctx, -30, 0, 60, 60, { fill: '#5fb8ff', lw: 5, seed: 11 }); G.ellipse(ctx, 40, 0, 60, 60, { fill: '#5fb8ff', lw: 5, seed: 12 }); C.text(ctx, 'O₂', 5, 22, { size: 60, color: '#fff', shadow: false }); ctx.restore();
      if (m > 0.8) { C.glow(ctx, CX, 940, 360, '230,255,120', 0.8); G.rays(ctx, CX, 940, { n: 14, r0: 140, r1: 280, color: '#E8FF6A', lw: 8 }); }
      C.pill(ctx, t, ev.reaccion, 'reacción química', CX, 640, '#B8E04A');
      return ['Hace luz con una reacción', 'mezcla una sustancia con *oxígeno*'];
    },
    function especial(ctx, t, a) {
      night(ctx, t);
      fly(ctx, 380, 960, 1.2, t, 1);
      const th = fade(t, ev.calor - 0.2);
      G.rrect(ctx, 760, 760, 50, 300, 25, { fill: '#F4F7FB', lw: 5, seed: 20, alpha: th }); G.ellipse(ctx, 785, 1080, 45, 45, { fill: '#5fb8ff', lw: 5, seed: 21, alpha: th }); G.rrect(ctx, 773, 980, 24, 100, 10, { fill: '#5fb8ff', lw: 0, seed: 22, alpha: th });
      C.pill(ctx, t, ev.especial, 'luz especial', 380, 700, '#E8FF6A');
      return ['Es una luz especial', 'casi no produce *calor*'];
    },
    function bombilla(ctx, t, a) {
      C.bg(ctx, '#2A1A0E', '#5A3A1E');
      const k = fade(t, ev.bombilla - 0.3);
      ctx.save(); ctx.translate(330, 920); ctx.globalAlpha = k; C.glow(ctx, 0, 0, 240, '255,170,60', 0.6); G.ellipse(ctx, 0, 0, 110, 130, { fill: '#FFE08A', lw: 6, seed: 30 }); G.rrect(ctx, -50, 110, 100, 80, 10, { fill: '#9AA0A8', lw: 5, seed: 31 });
      for (let i = 0; i < 3; i++) { const p = ((t * 0.8 + i / 3) % 1); G.line(ctx, [[-40 + i * 40, -150 - p * 120], [-20 + i * 40, -190 - p * 120], [-40 + i * 40, -230 - p * 120]], { color: '#ff5a3a', lw: 8, seed: 32 + i, alpha: 1 - p }); } ctx.restore();
      fly(ctx, 790, 920, 0.9 * fade(t, ev.no - 0.3), t, 1);
      C.pill(ctx, t, ev.bombilla + 0.4, 'se calienta', 330, 1180, '#ff5a3a'); C.pill(ctx, t, ev.no + 0.3, 'la luciérnaga no', 790, 1180, '#E8FF6A');
      return ['Una bombilla pierde energía', 'calentándose; *la luciérnaga no*'];
    },
    function fria(ctx, t, a) {
      night(ctx, t);
      fly(ctx, CX, 920, 1.6, t, 1);
      for (let i = 0; i < 8; i++) G.star(ctx, CX + Math.cos(i * 0.8 + t) * 340, 920 + Math.sin(i * 0.8 + t) * 300, 14, { fill: '#BDE6FF', rot: t });
      C.pill(ctx, t, ev.fria, 'luz fría', CX, 1250, '#5fb8ff');
      return ['Por eso se llama', '*luz fría*'];
    },
    function codigo(ctx, t, a) {
      night(ctx, t);
      const blinkM = (Math.floor(t * 3) % 3) === 0 ? 1 : 0.1, blinkF = t > ev.hembras ? ((Math.floor(t * 3 + 1) % 3) === 0 ? 1 : 0.1) : 0.1;
      fly(ctx, 300, 820, 0.9, t, blinkM, 10); fly(ctx, 780, 1080, 0.9, t, blinkF, 20);
      for (let i = 0; i < 6; i++) { const on = (Math.floor(t * 3) + i) % 3 === 0; G.ellipse(ctx, 150 + i * 60, 640, 16, 16, { fill: on ? '#E8FF6A' : '#2a3a2a', lw: 3, seed: 40 + i }); }
      C.pill(ctx, t, ev.machos, 'machos', 300, 980, '#5fb8ff'); C.pill(ctx, t, ev.hembras, 'hembras responden', 780, 1240, '#ff8aca');
      return ['Cada especie tiene', 'su *código* de destellos'];
    },
    function conversacion(ctx, t, a) {
      night(ctx, t);
      for (let i = 0; i < 9; i++) { const on = Math.max(0, Math.sin(t * 3 + i * 1.3)); fly(ctx, 160 + (i * 113) % 800, 700 + (i * 157) % 520, 0.5, t, on, 50 + i * 10); }
      return ['Es una conversación', 'hecha de *luces*'];
    },
  ]);
})();
