// La Gran Muralla no se ve desde el espacio
(function () {
  const G = globalThis.G, C = globalThis.C;
  const { CX, clamp, lerp, ease, pop, fade, out, cue } = C;
  const ev = { escuchaste: cue(0, 'escuchaste'), espacio: cue(0, 'espacio'), mentira: cue(1, 'mentira'), larguisima: cue(2, 'larguísima'), angosta: cue(2, 'angosta'),
    color: cue(2, 'color'), astronautas: cue(3, 'astronautas'), cabello: cue(4, 'cabello'), metros: cue(4, 'metros'), noche: cue(5, 'noche'), luces: cue(5, 'luces'), barcos: cue(5, 'barcos') };
  function wall(ctx, x, y, s, len = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const pts = []; for (let i = 0; i <= 40 * len; i++) pts.push([-500 + i * 25, Math.sin(i * 0.35) * 60]);
    G.limb(ctx, pts, { color: '#C9A36A', lw: 46, outline: '#5a3a1a' });
    for (let i = 0; i < 6 * len; i++) { const p = pts[Math.min(pts.length - 1, i * 7)]; G.rrect(ctx, p[0] - 30, p[1] - 70, 60, 70, 6, { fill: '#B8925A', lw: 4, seed: 10 + i }); }
    ctx.restore();
  }
  C.film([
    function escuchaste(ctx, t, a) {
      C.bg(ctx, '#3A6A9A', '#9AC0E0');
      G.poly(ctx, [[-50, 1000], [250, 820], [520, 960], [800, 800], [1130, 940], [1130, 2000], [-50, 2000]], { fill: '#6A8A4A', lw: 6, seed: 1 });
      wall(ctx, CX, 1050, 1.0 * pop(t, a, 0.5), 1);
      C.astronaut(ctx, 820, 640, 0.6 * pop(t, ev.espacio - 0.2), t, { rot: 0.3 });
      return ['Seguro escuchaste que', 'se ve *desde el espacio*'];
    },
    function mentira(ctx, t, a) {
      C.bg(ctx, '#5A0E1E', '#9A1E3E');
      const k = pop(t, ev.mentira - 0.1, 0.4);
      ctx.save(); ctx.translate(CX, 940); ctx.rotate(-0.12); ctx.scale(k, k);
      G.rrect(ctx, -380, -110, 760, 220, 30, { fill: 'rgba(0,0,0,0)', stroke: '#FFD22E', lw: 16, seed: 2 });
      C.text(ctx, 'MENTIRA', 0, 45, { size: 150, color: '#FFD22E' }); ctx.restore();
      return ['', 'Es *mentira*'];
    },
    function angosta(ctx, t, a) {
      C.bg(ctx, '#8A6A3A', '#C9A36A');
      const z = 1 - 0.75 * out(t, ev.angosta - 0.3, 1.2);
      wall(ctx, CX, 1000, 1.6 * z, 1);
      const k = fade(t, ev.color - 0.2);
      ctx.save(); ctx.globalAlpha = k * 0.75; ctx.fillStyle = '#C9A36A'; ctx.fillRect(0, 560, 1080, 900); ctx.restore();
      C.pill(ctx, t, ev.larguisima, 'larguísima', 300, 700, '#FFD22E'); C.pill(ctx, t, ev.angosta, 'pero angosta', 760, 700, '#ff5a3a'); C.pill(ctx, t, ev.color, 'del color de la tierra', CX, 1290, '#C9A36A');
      return ['Es larguísima', 'pero muy *angosta*'];
    },
    function astronautas(ctx, t, a) {
      C.space(ctx, t);
      C.earth(ctx, CX, 1500, 620, t * 0.2);
      C.astronaut(ctx, CX, 900, 1.2 * pop(t, a, 0.5), t, { rot: Math.sin(t) * 0.05 });
      const k = fade(t, ev.astronautas + 0.3);
      ctx.save(); ctx.translate(810, 700); ctx.scale(k, k); G.ellipse(ctx, 0, 0, 90, 70, { fill: '#F4F7FB', lw: 5, seed: 20 }); C.text(ctx, '?', 0, 30, { size: 90, color: '#0b1030', shadow: false }); ctx.restore();
      return ['Los astronautas lo dicen', '*no se distingue*'];
    },
    function cabello(ctx, t, a) {
      C.bg(ctx, '#1A3A5A', '#3A6A9A');
      C.person(ctx, 220, 1330, 0.9, { eyes: 'focus', mouth: 'flat', style: { shirt: '#19B8B2' } });
      const k = fade(t, ev.cabello - 0.2);
      G.line(ctx, [[820, 700], [830 + Math.sin(t * 2) * 6, 1100]], { color: '#3a2a20', lw: 2, seed: 30, alpha: k });
      ctx.save(); ctx.setLineDash([16, 14]); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(300, 1000); ctx.lineTo(800, 900); ctx.stroke(); ctx.restore();
      C.pill(ctx, t, ev.metros, 'a varios metros', 560, 820, '#FFD22E');
      C.pill(ctx, t, ev.cabello, 'un cabello', 830, 1170, '#fff');
      return ['Es como intentar ver', 'un *cabello* a varios metros'];
    },
    function luces(ctx, t, a) {
      C.space(ctx, t, '#020410', '#0A1030');
      G.ellipse(ctx, CX, 1700, 900, 760, { fill: '#0A1838', lw: 6, seed: 40 });
      const k = out(t, ev.luces - 0.3, 1.2);
      for (let i = 0; i < 60; i++) { const x = 100 + (i * 173) % 880, y = 1080 + (i * 97) % 320, on = k > (i / 60); if (!on) continue;
        C.glow(ctx, x, y, 26 + (i % 4) * 8, '255,200,90', 0.6); }
      for (let i = 0; i < 8; i++) { const on = t > ev.barcos + i * 0.1; if (on) C.glow(ctx, 120 + i * 30, 1000 + (i % 3) * 20, 16, '200,240,255', 0.8); }
      C.pill(ctx, t, ev.luces, 'luces de las ciudades', CX, 900, '#FFD22E');
      return ['Lo que sí se ve de noche', 'son las *luces* de las ciudades'];
    },
  ]);
})();
