// El arcoíris es un círculo (hecho a mano)
var N = {}, COLS = ["#ff3b3b", "#ff8a2a", "#ffd22e", "#3fcf5a", "#2a9bff", "#4a5bff", "#9a4aff"];
function bow(parent, r0, w) {
  var g = el("g", {}, parent); g.rings = [];
  COLS.forEach(function (c, i) {
    var r = r0 - i * w, len = 2 * Math.PI * r;
    g.rings.push({ e: el("circle", { r: r, fill: "none", stroke: c, "stroke-width": w + 1, opacity: .9, "stroke-dasharray": len, "stroke-dashoffset": 0, transform: "rotate(180)" }, g), len: len });
  });
  return g;
}
function setBow(g, frac) { g.rings.forEach(function (q) { q.e.setAttribute("stroke-dashoffset", q.len * (1 - frac)); }); }
function person(parent, col) {
  var g = el("g", {}, parent);
  el("circle", { cy: -92, r: 22, fill: col || "#ffffff" }, g);
  el("path", { d: "M-24 -64 Q0 -74 24 -64 L30 0 L-30 0 Z", fill: col || "#ffffff" }, g);
  el("rect", { x: -22, y: 0, width: 16, height: 46, rx: 6, fill: col || "#ffffff" }, g);
  el("rect", { x: 6, y: 0, width: 16, height: 46, rx: 6, fill: col || "#ffffff" }, g);
  return g;
}
function plane(parent) {
  var g = el("g", {}, parent);
  el("path", { d: "M-120 0 Q-110 -18 -60 -18 L90 -14 Q130 -10 140 0 Q130 10 90 14 L-60 18 Q-110 18 -120 0 Z", fill: "#e8eef8" }, g);
  el("path", { d: "M-10 -14 L40 -90 L70 -90 L40 -14 Z M-10 14 L40 90 L70 90 L40 14 Z M-110 -6 L-140 -50 L-118 -50 L-90 -10 Z", fill: "#c8d2e6" }, g);
  for (var i = 0; i < 6; i++) el("circle", { cx: -40 + i * 22, cy: -4, r: 4, fill: "#2a6fd6" }, g);
  return g;
}
var V = {
  stars: false,
  build: function () {
    defs('<clipPath id="above"><rect x="-600" y="-700" width="1200" height="700"/></clipPath>' +
      '<linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f8a5a"/><stop offset="1" stop-color="#174a3a"/></linearGradient>' +
      '<radialGradient id="sunG"><stop offset="0" stop-color="#fff6cf"/><stop offset=".4" stop-color="#ffd22e"/><stop offset="1" stop-color="#ffd22e" stop-opacity="0"/></radialGradient>');
    // S0-S2: suelo + arco
    [0, 1, 2].forEach(function (i) {
      var g = sc(i), o = N["s" + i] = {};
      o.bow = bow(g, 430, 24); tr(o.bow, 540, 1040, 1, 0);
      o.ground = el("rect", { x: -300, y: 1040, width: 1680, height: 1000, fill: "url(#grass)" }, g);
      o.dash = el("circle", { cx: 540, cy: 1040, r: 358, fill: "none", stroke: "#ffffff", "stroke-width": 5, "stroke-dasharray": "16 14", opacity: 0 }, g);
      o.p = person(g); tr(o.p, 540, 1040 - 46, 1, 0);
    });
    // S3: avión, sol detrás, anillo entero
    var g3 = sc(3); N.sun = el("circle", { r: 220, fill: "url(#sunG)" }, g3);
    N.clouds = el("g", {}, g3);
    for (var c = 0; c < 9; c++) el("ellipse", { cx: R() * 1200 - 60, cy: 1180 + R() * 260, rx: 140 + R() * 120, ry: 40 + R() * 30, fill: "#ffffff", opacity: .55 }, N.clouds);
    N.ring = bow(g3, 300, 20); N.plane = plane(g3);
    // S4 y S5: dos personas, dos arcoíris
    var g4 = sc(4); N.b4a = el("g", { "clip-path": "url(#above)" }, g4); N.b4b = el("g", { "clip-path": "url(#above)" }, g4);
    N.bA = bow(N.b4a, 330, 20); N.bB = bow(N.b4b, 330, 20);
    el("rect", { x: -300, y: 1040, width: 1680, height: 1000, fill: "url(#grass)" }, g4);
    N.pA = person(g4, "#FFD22E"); N.pB = person(g4, "#19B8B2");
    var g5 = sc(5); N.drops = [];
    for (var y = 0; y < 6; y++) for (var x = 0; x < 9; x++) N.drops.push({ x: 160 + x * 95, y: 420 + y * 80, e: el("circle", { r: 9, fill: "#bfe6ff", opacity: .55 }, g5) });
    N.raysA = el("g", {}, g5); N.raysB = el("g", {}, g5);
    [[1, 2], [3, 4], [2, 6]].forEach(function (p) { el("line", { x1: 0, y1: 0, x2: 0, y2: 0, stroke: "#FFD22E", "stroke-width": 5, "class": "ra", "data-i": p[0] * 9 + p[1] }, N.raysA); });
    [[1, 5], [3, 7], [4, 3]].forEach(function (p) { el("line", { x1: 0, y1: 0, x2: 0, y2: 0, stroke: "#19B8B2", "stroke-width": 5, "class": "rb", "data-i": p[0] * 9 + p[1] }, N.raysB); });
    el("rect", { x: -300, y: 1040, width: 1680, height: 1000, fill: "url(#grass)" }, g5);
    N.pA5 = person(g5, "#FFD22E"); N.pB5 = person(g5, "#19B8B2");
  },
  draw: function (t, c) {
    var o = { sky: ["#163574", "#8fb8e6"] }, a = c.a, d = c.drift, k = c.key;
    if (k === "arco") {
      var s = N.s0; setBow(s.bow, .5 * E.inout(seg(t, a, a + .9)));
      o.head = ["El arcoíris", "<b>no es un arco</b>", 1, 0];
      o.cam = { s: 1 + .05 * d, fx: 540, fy: 960 };
    } else if (k === "circulo") {
      var s1 = N.s1, tc = cue(1, "círculos", .4), full = E.inout(seg(t, a + .1, a + .85));
      setBow(s1.bow, .5 + .5 * full); op(s1.ground, 1 - .8 * full);
      o.head = ["Es un", "<b>círculo completo</b>", rise(t, tc)[0], rise(t, tc)[1]];
      o.cam = { s: lerp(1, .92, full) + .04 * d, fx: 540, fy: lerp(960, 1040, full) };
    } else if (k === "suelo") {
      var s2 = N.s2, tm = cue(2, "mitad", .3), tt = cue(2, "tapada", .7);
      setBow(s2.bow, .5); op(s2.dash, fade(t, tt)); op(s2.ground, lerp(1, .85, fade(t, tt)));
      tr(s2.p, 540, 1040 - 46, 1.2, 0);
      o.head = tt > t ? ["Desde el suelo vemos", "solo la <b>mitad</b>", rise(t, tm)[0], rise(t, tm)[1]] : ["La otra mitad", "la tapa <b>la tierra</b>", 1, rise(t, tt)[1]];
      o.tags = [["lo que vemos", 540, 560, fade(t, tm + .2), "#FFD22E"], ["tapado por el suelo", 540, 1230, fade(t, tt + .2), "#ffffff"]];
      o.cam = { s: lerp(.9, 1, E.out(seg(t, a, a + .6))) + .04 * d, fx: 540, fy: 1000 };
    } else if (k === "avion") {
      var tav = cue(3, "avión", .2), tso = cue(3, "sol", .4), ten = cue(3, "entero", .7);
      tr(N.sun, 170, 480, 1 + .05 * Math.sin(t * 2), 0); op(N.sun, fade(t, tso - .2));
      tr(N.clouds, -40 * d, 0, 1, 0);
      tr(N.plane, lerp(-200, 560, E.out(seg(t, a, a + 1.4))) + 30 * d, 560 + Math.sin(t * 1.5) * 10, .9, 0);
      tr(N.ring, 540, 1060, 1, t * 6); setBow(N.ring, E.inout(seg(t, ten - .6, ten + .5)));
      o.head = ten > t ? ["Desde un avión", "con el <b>sol detrás</b>", rise(t, tav)[0], rise(t, tav)[1]] : ["Se ve", "el <b>anillo entero</b>", 1, rise(t, ten)[1]];
      o.sky = ["#3a6ec4", "#bcd6f2"];
      o.cam = { s: 1 + .06 * E.inout(d), fx: 540, fy: 940 };
    } else if (k === "dos") {
      var tp = cue(4, "personas", .5), sp = E.inout(seg(t, tp - .2, tp + .6));
      tr(N.b4a, 540 - 140 * sp, 1040, 1, 0); tr(N.b4b, 540 + 140 * sp, 1040, 1, 0); op(N.b4b, sp);
      setBow(N.bA, .5 * E.inout(seg(t, a, a + .7))); setBow(N.bB, .5 * sp);
      tr(N.pA, 540 - 140 * sp, 994 + Math.sin(t * 3) * 6, 1.1, 0); tr(N.pB, 540 + 140 * sp, 994 + Math.sin(t * 3 + 1.6) * 6, 1.1, 0); op(N.pB, sp);
      [N.bA, N.bB].forEach(function (b, j) { b.rings.forEach(function (q, i) { q.e.setAttribute("opacity", .75 + .2 * Math.sin(t * 4 - i * .7 + j * 2)); }); });
      o.head = ["No hay dos personas que vean", "<b>el mismo arcoíris</b>", rise(t, tp)[0], rise(t, tp)[1]];
      o.cam = { s: 1 + .1 * E.inout(d), fx: 540, fy: 960 };
    } else {
      var tg = cue(5, "gotas", .7);
      tr(N.pA5, 400, 994, 1.1, 0); tr(N.pB5, 680, 994, 1.1, 0);
      N.drops.forEach(function (q, i) { tr(q.e, q.x + Math.sin(t * 2 + i) * 7, q.y + Math.cos(t * 1.7 + i) * 5, 1 + .25 * Math.sin(t * 4 + i), 0); });
      var ra = fade(t, a + .2, .5), rb = fade(t, tg - .3, .5);
      [[N.raysA, ".ra", 400, ra], [N.raysB, ".rb", 680, rb]].forEach(function (z) {
        z[0].querySelectorAll(z[1]).forEach(function (l) {
          var q = N.drops[+l.getAttribute("data-i")];
          l.setAttribute("x1", q.x); l.setAttribute("y1", q.y); l.setAttribute("x2", lerp(q.x, z[2], z[3])); l.setAttribute("y2", lerp(q.y, 902, z[3]));
          q.e.setAttribute("opacity", z[3] > .9 ? 1 : .55);
        });
      });
      o.head = ["Cada uno ve el suyo", "hecho por <b>gotas distintas</b>", rise(t, tg)[0], rise(t, tg)[1]];
      o.tags = [["tus gotas", 400, 1150, ra, "#FFD22E"], ["las de otro", 680, 1150, rb, "#19B8B2"]];
      o.note = ["ilustración", fade(t, a + .3)];
      o.cam = { s: 1 + .1 * d, fx: lerp(560, 520, d), fy: 940 };
    }
    if (o.cam) { o.cam.fx += Math.sin(t * 1.2) * 12; o.cam.fy += Math.cos(t * .9) * 9; }  // vaivén suave: nunca queda quieto aunque la voz sea más lenta
    return o;
  }
};
