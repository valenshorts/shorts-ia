// En el espacio no hay sonido (hecho a mano)
var N = {};
function speaker(parent) {
  var g = el("g", {}, parent);
  el("path", { d: "M-70 -40 L-20 -40 L40 -100 L40 100 L-20 40 L-70 40 Z", fill: "#cfd8ff" }, g);
  g.w = [];
  for (var i = 0; i < 3; i++) g.w.push(el("path", { d: "M" + (70 + i * 40) + " " + (-50 - i * 25) + " Q" + (100 + i * 50) + " 0 " + (70 + i * 40) + " " + (50 + i * 25), stroke: "#19B8B2", "stroke-width": 10, fill: "none", "stroke-linecap": "round" }, g));
  g.x = el("path", { d: "M80 -60 L200 60 M200 -60 L80 60", stroke: "#ff3b5c", "stroke-width": 14, "stroke-linecap": "round", opacity: 0 }, g);
  return g;
}
function helmet(parent, col) {
  var g = el("g", {}, parent);
  el("rect", { x: -120, y: 90, width: 240, height: 160, rx: 60, fill: "#e8eef8" }, g);
  el("circle", { r: 120, fill: "#e8eef8" }, g);
  el("ellipse", { cx: 0, cy: 6, rx: 86, ry: 72, fill: "url(#visor)" }, g);
  el("ellipse", { cx: -30, cy: -24, rx: 26, ry: 14, fill: "#ffffff", opacity: .5 }, g);
  el("line", { x1: 90, y1: -80, x2: 120, y2: -170, stroke: "#9fb4d8", "stroke-width": 8 }, g);
  el("circle", { cx: 120, cy: -176, r: 12, fill: col || "#FFD22E" }, g);
  return g;
}
var V = {
  stars: 220,
  build: function () {
    defs('<linearGradient id="visor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#7a4a1a"/></linearGradient>' +
      '<radialGradient id="nova"><stop offset="0" stop-color="#ffffff"/><stop offset=".25" stop-color="#ffd22e"/><stop offset=".6" stop-color="#ff5a3a" stop-opacity=".6"/><stop offset="1" stop-color="#7a3cff" stop-opacity="0"/></radialGradient>');
    N.sp0 = speaker(sc(0));
    // S1 y S2: partículas de aire
    [1, 2].forEach(function (i) {
      var g = sc(i), o = N["s" + i] = { parts: [] };
      o.sp = speaker(g);
      for (var r = 0; r < 7; r++) for (var c = 0; c < 9; c++) o.parts.push({ x0: 300 + c * 80, y0: 660 + r * 80, ph: R() * 6.3, ang: R() * 6.283, e: el("circle", { r: 16, fill: "#9fd8ff" }, g) });
    });
    // S3: explosión en silencio
    var g3 = sc(3); N.nova = el("circle", { r: 100, fill: "url(#nova)" }, g3);
    N.ring = el("circle", { r: 100, fill: "none", stroke: "#ffb070", "stroke-width": 10 }, g3);
    N.rays = []; for (var k = 0; k < 16; k++) N.rays.push({ a: k / 16 * 6.283, e: el("line", { stroke: "#ffd22e", "stroke-width": 6, "stroke-linecap": "round" }, g3) });
    N.mute = speaker(g3);
    // S4: películas
    var g4 = sc(4); N.screen = el("g", {}, g4);
    el("rect", { x: -380, y: -230, width: 760, height: 460, rx: 20, fill: "#120a26", stroke: "#cfd8ff", "stroke-width": 10 }, N.screen);
    N.boom = txt(N.screen, "¡BOOM!", { y: 40, "font-size": 140, "font-weight": 900, fill: "#ff8a2a" });
    N.ship = el("g", {}, N.screen); el("path", { d: "M-60 0 L40 -24 L80 0 L40 24 Z", fill: "#cfd8ff" }, N.ship);
    N.stamp = el("g", {}, g4);
    el("rect", { x: -260, y: -60, width: 520, height: 120, rx: 14, fill: "none", stroke: "#ff3b5c", "stroke-width": 12 }, N.stamp);
    txt(N.stamp, "INVENTADO", { y: 26, "font-size": 70, "font-weight": 900, fill: "#ff3b5c" });
    // S5: astronautas por radio
    var g5 = sc(5); N.a1 = helmet(g5, "#FFD22E"); N.a2 = helmet(g5, "#19B8B2"); N.radio = [];
    for (var w = 0; w < 4; w++) N.radio.push(el("path", { fill: "none", stroke: "#FFD22E", "stroke-width": 7, "stroke-dasharray": "14 12", "stroke-linecap": "round" }, g5));
  },
  draw: function (t, c) {
    var o = { sky: ["#03050f", "#0a0f26"] }, a = c.a, d = c.drift, k = c.key;
    function wave(sp, on) { sp.w.forEach(function (w, i) { op(w, on * Math.max(0, Math.sin(t * 6 - i * 1.2))); }); }
    if (k === "nada") {
      tr(N.sp0, 470, 900, 1.5 * E.pop(seg(t, a - .01, a + .4)), 0);
      var off = fade(t, a + .9); wave(N.sp0, 1 - off); op(N.sp0.x, off);
      o.head = ["En el espacio", "<b>no hay sonido</b>", 1, 0];
      o.cam = { s: 1 + .06 * E.inout(d), fx: 540, fy: 920 };
    } else if (k === "vibra") {
      var s = N.s1, tp = cue(1, "partícula", .7);
      tr(s.sp, 180, 900, .9, 0); wave(s.sp, 1);
      s.parts.forEach(function (q) { var push = Math.sin(t * 7 - (q.x0 - 300) * .03) * 18 * fade(t, a + .3); tr(q.e, q.x0 + push, q.y0 + Math.sin(t * 2 + q.ph) * 3, 1, 0); op(q.e, .45 + .55 * Math.max(0, Math.sin(t * 7 - (q.x0 - 300) * .03))); });
      o.head = ["El sonido viaja", "de <b>partícula en partícula</b>", rise(t, tp)[0], rise(t, tp)[1]];
      o.tags = [["aire", 640, 1240, fade(t, a + .3), "#9fd8ff"]];
      o.sky = ["#0a1650", "#1d3f9a"]; o.stars = .3;
      o.cam = { s: 1 + .05 * d, fx: 540, fy: 920 };
    } else if (k === "vacio") {
      var s2 = N.s2, tc = cue(2, "casi", .3), gone = E.inout(seg(t, tc - .2, tc + 1.2));
      tr(s2.sp, 180, 900, .9, 0); wave(s2.sp, 1 - gone * .7);
      s2.parts.forEach(function (q, i) {
        var keep = i % 11 === 0, push = Math.sin(t * 7 - (q.x0 - 300) * .03) * 18 * (1 - gone);
        var x = q.x0 + push + (keep ? 0 : Math.cos(q.ang) * 900 * gone), y = q.y0 + (keep ? 0 : Math.sin(q.ang) * 900 * gone);
        tr(q.e, x, y, 1, 0); op(q.e, keep ? 1 : 1 - gone);
      });
      o.head = ["Pero en el espacio", "casi <b>no hay partículas</b>", rise(t, tc)[0], rise(t, tc)[1]];
      o.sky = [gone > .5 ? "#03050f" : "#0a1650", gone > .5 ? "#0a0f26" : "#1d3f9a"]; o.stars = gone;
      o.cam = { s: 1 + .05 * d, fx: 540, fy: 920 };
    } else if (k === "estrella") {
      var tex = cue(3, "explote", .3), tn = cue(3, "nada", .9), ex = E.out(seg(t, tex, tex + 1.6));
      tr(N.nova, 540, 820, ex > 0 ? .4 + 3.2 * ex : .32 + .05 * Math.sin(t * 8), 0); op(N.nova, 1 - .4 * seg(ex, .7, 1));
      tr(N.ring, 540, 820, .6 + 5 * ex, 0); op(N.ring, ex > 0 ? (1 - ex) : 0);
      N.rays.forEach(function (q) { var r1 = 120 + 300 * ex, r2 = r1 + 120 * (1 - ex); q.e.setAttribute("x1", 540 + Math.cos(q.a) * r1); q.e.setAttribute("y1", 820 + Math.sin(q.a) * r1); q.e.setAttribute("x2", 540 + Math.cos(q.a) * r2); q.e.setAttribute("y2", 820 + Math.sin(q.a) * r2); op(q.e, ex > 0 ? 1 - ex : 0); });
      tr(N.mute, 470, 1130, .8, 0); wave(N.mute, 0); op(N.mute, fade(t, tn - .4)); op(N.mute.x, 1);
      o.head = ["Aunque explote una estrella", "<b>no se escucharía nada</b>", rise(t, tn)[0], rise(t, tn)[1]];
      o.cam = { s: 1.05 + .05 * d, fx: 540, fy: 900 };
    } else if (k === "peliculas") {
      var tpe = cue(4, "películas", .4), tin = cue(4, "inventadas", .85);
      tr(N.screen, 540, 860, E.pop(seg(t, a - .01, a + .4)), 0);
      tr(N.boom, 0, 40, 1 + .1 * Math.sin(t * 9), Math.sin(t * 12) * 3);
      tr(N.ship, lerp(-300, 300, ((t - a) * .5) % 1), -130, 1, 0);
      var st = E.spring(seg(t, tin - .1, tin + .35)); tr(N.stamp, 540, 900, st * 1.1, -12); op(N.stamp, st > 0 ? 1 : 0); op(N.boom, 1 - .75 * fade(t, tin - .1));
      o.head = ["El ruido de las películas", "es <b>inventado</b>", rise(t, tpe)[0], rise(t, tpe)[1]];
      o.cam = { s: 1 + .06 * d, fx: 540, fy: 900 };
    } else {
      var tra = cue(5, "radio", .85), lado = cue(5, "lado", .4);
      tr(N.a1, 320, 940 + Math.sin(t * 1.4) * 14, 1.15, -6 + Math.sin(t) * 3); tr(N.a2, 760, 940 + Math.sin(t * 1.4 + 1.5) * 14, 1.15, 6 + Math.sin(t + 1) * 3);
      var on = fade(t, tra - .3);
      N.radio.forEach(function (w, i) {
        var p = ((t * .8) + i / 4) % 1, x = lerp(460, 640, p), y = 720 - Math.sin(p * Math.PI) * 170;
        w.setAttribute("d", "M" + (x - 30) + " " + (y - 50) + " Q" + (x + 20) + " " + y + " " + (x - 30) + " " + (y + 50)); op(w, on * Math.sin(p * Math.PI));
      });
      o.head = ["Aunque estén al lado", "se hablan por <b>radio</b>", rise(t, tra)[0], rise(t, tra)[1]];
      o.cam = { s: 1.06 - .06 * d, fx: 540, fy: 920 };
    }
    return o;
  }
};
