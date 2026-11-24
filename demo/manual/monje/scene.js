// Un monje dentro de una estatua de Buda (hecho a mano)
var N = {};
function buddha(parent, id) {
  // estatua sentada en meditación, origen en el centro del torso; devuelve también la capa de rayos X
  var g = el("g", {}, parent);
  g.halo = el("circle", { cx: 0, cy: -190, r: 250, fill: "url(#halo)" }, g);
  var base = el("g", {}, g);
  el("ellipse", { cx: 0, cy: 285, rx: 300, ry: 52, fill: "#6e4314" }, base);
  for (var i = -5; i <= 5; i++) el("ellipse", { cx: i * 52, cy: 262, rx: 34, ry: 26, fill: i % 2 ? "#b77b2c" : "#d39a3f" }, base);
  var body = el("g", {}, g);
  el("path", { d: "M-270 255 Q-262 150 -120 132 L120 132 Q262 150 270 255 Q0 305 -270 255 Z", fill: "url(#goldG)" }, body);
  el("path", { d: "M-155 165 Q-178 -10 -112 -102 Q0 -142 112 -102 Q178 -10 155 165 Z", fill: "url(#goldG)" }, body);
  el("path", { d: "M-112 -98 Q-40 30 30 165 M112 -98 Q70 0 90 160", stroke: "#9a6420", "stroke-width": 7, fill: "none", opacity: .55 }, body);
  el("ellipse", { cx: 0, cy: 132, rx: 86, ry: 30, fill: "#e8b75a" }, body);
  el("rect", { x: -34, y: -132, width: 68, height: 46, fill: "#d8a347" }, body);
  el("circle", { cx: 0, cy: -190, r: 86, fill: "url(#goldG)" }, body);
  el("circle", { cx: 0, cy: -270, r: 32, fill: "#c99038" }, body);
  [-1, 1].forEach(function (s) { el("ellipse", { cx: s * 84, cy: -176, rx: 15, ry: 42, fill: "#c99038" }, body); });
  el("path", { d: "M-46 -196 q16 10 30 0 M16 -196 q16 10 30 0", stroke: "#7a4a14", "stroke-width": 6, fill: "none", "stroke-linecap": "round" }, body);
  el("path", { d: "M-16 -150 q16 9 32 0", stroke: "#7a4a14", "stroke-width": 5, fill: "none", "stroke-linecap": "round" }, body);
  // rayos X: silueta oscura + esqueleto, recortados por un rectángulo que baja (escaneo)
  defs('<clipPath id="scan' + id + '"><rect id="scanr' + id + '" x="-320" y="-330" width="640" height="0"/></clipPath>');
  var xr = el("g", { "clip-path": "url(#scan" + id + ")" }, g);
  el("path", { d: "M-270 255 Q-262 150 -120 132 L120 132 Q262 150 270 255 Q0 305 -270 255 Z", fill: "#0b2c55", opacity: .92 }, xr);
  el("path", { d: "M-155 165 Q-178 -10 -112 -102 Q0 -142 112 -102 Q178 -10 155 165 Z", fill: "#0b2c55", opacity: .92 }, xr);
  el("circle", { cx: 0, cy: -190, r: 86, fill: "#0b2c55", opacity: .92 }, xr);
  g.skel = skeleton(xr);
  g.xr = xr; g.clip = $("scanr" + id);
  return g;
}
function skeleton(parent) {
  var s = el("g", { stroke: "#bff4ff", fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, parent);
  el("circle", { cx: 0, cy: -195, r: 58, "stroke-width": 9 }, s);
  el("ellipse", { cx: -22, cy: -200, rx: 13, ry: 16, fill: "#bff4ff", stroke: "none" }, s);
  el("ellipse", { cx: 22, cy: -200, rx: 13, ry: 16, fill: "#bff4ff", stroke: "none" }, s);
  el("path", { d: "M-24 -158 h48", "stroke-width": 7 }, s);
  for (var i = 0; i < 9; i++) el("rect", { x: -11, y: -128 + i * 30, width: 22, height: 20, rx: 6, fill: "#bff4ff", stroke: "none" }, s);
  for (var r = 0; r < 5; r++) el("path", { d: "M-8 " + (-100 + r * 26) + " Q-95 " + (-90 + r * 26) + " -78 " + (-40 + r * 24) + " M8 " + (-100 + r * 26) + " Q95 " + (-90 + r * 26) + " 78 " + (-40 + r * 24), "stroke-width": 7 }, s);
  el("path", { d: "M-70 150 Q0 100 70 150 Q40 185 0 175 Q-40 185 -70 150 Z", "stroke-width": 8 }, s);
  el("path", { d: "M-60 165 L-210 235 L-40 250 M60 165 L210 235 L40 250", "stroke-width": 11 }, s);
  el("path", { d: "M-95 -95 L-130 20 L-40 120 M95 -95 L130 20 L40 120", "stroke-width": 10 }, s);
  return s;
}
function glyph(parent, seed) {
  var r = rnd(seed), g = el("g", { stroke: "#3a2410", "stroke-width": 4, "stroke-linecap": "round", fill: "none" }, parent);
  for (var k = 0; k < 5; k++) {
    var x = -14 + r() * 28, y = -14 + r() * 28, h = r() < .5;
    el("path", { d: "M" + x + " " + y + (h ? " h" + (8 + r() * 14) : " v" + (8 + r() * 14)), }, g);
  }
  return g;
}
function paper(parent, seed) {
  var g = el("g", {}, parent), r = rnd(seed);
  el("rect", { x: -60, y: -80, width: 120, height: 160, rx: 6, fill: "#f3e3b8", stroke: "#c9a86a", "stroke-width": 3 }, g);
  for (var c = 0; c < 2; c++) for (var k = 0; k < 4; k++) tr(glyph(g, seed * 10 + c * 4 + k), -24 + c * 48, -54 + k * 36, .8, 0);
  return g;
}
function person(parent) {
  var g = el("g", { fill: "#7a4a22", stroke: "#ffcf7a", "stroke-width": 4, "stroke-opacity": .5 }, parent);
  el("ellipse", { cx: 0, cy: 40, rx: 70, ry: 30 }, g);
  g.top = el("g", {}, g);
  el("path", { d: "M-46 40 Q-50 -40 0 -60 Q50 -40 46 40 Z" }, g.top);
  el("circle", { cx: 0, cy: -84, r: 30 }, g.top);
  return g;
}
function candle(parent) {
  var g = el("g", {}, parent);
  el("rect", { x: -16, y: 0, width: 32, height: 120, rx: 6, fill: "#f1e2c4" }, g);
  g.flame = el("ellipse", { cx: 0, cy: -18, rx: 12, ry: 24, fill: "#ffb340" }, g);
  el("circle", { cx: 0, cy: -16, r: 60, fill: "url(#halo)", opacity: .7 }, g);
  return g;
}
var V = {
  stars: 60,
  build: function () {
    defs('<linearGradient id="goldG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe7a3"/><stop offset=".45" stop-color="#e2ad4c"/><stop offset="1" stop-color="#8f5a1a"/></linearGradient>' +
      '<radialGradient id="halo"><stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fe0ff" stop-opacity="0"/><stop offset=".5" stop-color="#5fe0ff" stop-opacity=".9"/><stop offset="1" stop-color="#5fe0ff" stop-opacity="0"/></linearGradient>');
    // S0: la estatua y la revelación
    N.b0 = buddha(sc(0), 0); N.line0 = el("rect", { x: -330, y: 0, width: 660, height: 26, fill: "url(#beam)" }, N.b0);
    // S1: el tomógrafo
    var g1 = sc(1); N.b1 = buddha(g1, 1);
    N.ringBack = el("ellipse", { rx: 360, ry: 84, fill: "none", stroke: "#8fa2c4", "stroke-width": 40 }, g1);
    N.ringFront = el("path", { d: "M-360 0 A360 84 0 0 0 360 0", fill: "none", stroke: "#e8eef8", "stroke-width": 44, "stroke-linecap": "round" }, g1);
    N.ringGlow = el("ellipse", { rx: 330, ry: 70, fill: "none", stroke: "#5fe0ff", "stroke-width": 6, opacity: .9 }, g1);
    // S2: el maestro
    var g2 = sc(2); N.b2 = buddha(g2, 2); N.c2 = [candle(g2), candle(g2)];
    N.scroll = el("g", {}, g2);
    N.scrollBg = el("rect", { x: -210, y: -50, width: 420, height: 100, rx: 10, fill: "#f3e3b8", stroke: "#8a5a1c", "stroke-width": 5 }, N.scroll);
    N.scrollTx = txt(N.scroll, "LIUQUAN", { y: 22, "font-size": 64, "font-weight": 900, fill: "#5a2a0a", "letter-spacing": "6" });
    el("rect", { x: 150, y: -28, width: 42, height: 42, rx: 4, fill: "#c0302a" }, N.scroll);
    // S3: papeles en lugar de órganos
    var g3 = sc(3); N.torso = el("g", {}, g3);
    el("path", { d: "M-300 380 Q-340 -60 -210 -260 Q0 -330 210 -260 Q340 -60 300 380 Z", fill: "#0b2c55", stroke: "#5fe0ff", "stroke-width": 6 }, N.torso);
    var sk = el("g", { stroke: "#bff4ff", fill: "none", "stroke-width": 12, "stroke-linecap": "round" }, N.torso);
    for (var i = 0; i < 12; i++) el("rect", { x: -20, y: -250 + i * 52, width: 40, height: 36, rx: 10, fill: "#bff4ff", stroke: "none" }, sk);
    for (var r = 0; r < 6; r++) el("path", { d: "M-16 " + (-200 + r * 50) + " Q-230 " + (-190 + r * 50) + " -200 " + (-90 + r * 46) + " M16 " + (-200 + r * 50) + " Q230 " + (-190 + r * 50) + " 200 " + (-90 + r * 46) }, sk);
    N.organs = el("g", { opacity: .8 }, N.torso);
    el("path", { d: "M-150 -150 q-60 120 0 230 q60 -40 50 -230 Z M150 -150 q60 120 0 230 q-60 -40 -50 -230 Z", fill: "#ff8fa8" }, N.organs);
    el("path", { d: "M-30 -40 q-40 -50 -70 0 q0 40 70 90 q70 -50 70 -90 q-30 -50 -70 0 Z", fill: "#ff4f6d" }, N.organs);
    N.papers = []; for (var p = 0; p < 7; p++) N.papers.push({ e: paper(N.torso, p + 3), x: [-140, 0, 140, -80, 80, -150, 150][p], y: [-140, -170, -120, 20, 40, 170, 190][p], r: (p % 2 ? 1 : -1) * (6 + p * 3), ph: p });
    // S4: siglos de rezos
    var g4 = sc(4); N.b4 = buddha(g4, 4); N.people = []; for (var q = 0; q < 4; q++) N.people.push(person(g4));
    N.smoke = []; for (var m = 0; m < 6; m++) N.smoke.push({ e: el("path", { d: "M0 0 q-24 -50 0 -100 q24 -50 0 -100", stroke: "#e8ddc8", "stroke-width": 12, fill: "none", "stroke-linecap": "round" }, g4), x: 300 + (m % 2) * 480, ph: m / 6 });
    N.sticks = el("g", {}, g4); [300, 780].forEach(function (x) { el("rect", { x: x - 4, y: 1080, width: 8, height: 90, fill: "#7a3a12" }, N.sticks); el("circle", { cx: x, cy: 1080, r: 7, fill: "#ff7a2a" }, N.sticks); });
  },
  draw: function (t, c) {
    var o = { sky: ["#1a0e06", "#3b220e"] }, a = c.a, d = c.drift, k = c.key;
    if (k === "estatua") {
      var tm = cue(0, "monje", .7), tb = cue(0, "buda", .3), ta = cue(0, "años", .55);
      tr(N.b0, 540, 930 + Math.sin(t * 1.3) * 6, .95 * E.pop(seg(t, a - .01, a + .5)), 0);
      var sp = E.inout(seg(t, tm - .25, tm + .85));
      N.b0.clip.setAttribute("height", 640 * sp); N.line0.setAttribute("y", -330 + 640 * sp - 13); op(N.line0, sp > 0 && sp < 1 ? 1 : 0);
      op(N.b0.halo, .7 + .3 * Math.sin(t * 2));
      o.head = tm > t ? ["En 2015 escanearon", "una estatua de <b>Buda</b>", rise(t, tb)[0], rise(t, tb)[1]] : ["Y adentro había", "un <b>monje momificado</b>", 1, rise(t, tm)[1]];
      o.tags = [["casi 1.000 años", 540, 1225, fade(t, ta) * (1 - fade(t, tm - .2)), "#FFD22E"], ["rayos X", 860, 640, fade(t, tm + .3), "#5fe0ff"]];
      if (sp > 0) o.sky = ["#04101f", "#0b2340"];
      o.cam = { s: 1 + .07 * E.inout(d), fx: 540, fy: 930 };
    } else if (k === "tomografo") {
      var tt = cue(1, "tomógrafo", .2), te = cue(1, "esqueleto", .6), tmd = cue(1, "meditación", .85);
      tr(N.b1, 540, 950, .8, 0);
      var pos = seg(t, tt - .2, te + .2), yy = lerp(-330, 330, E.inout(pos)) * .8 + 950;
      [N.ringBack, N.ringFront, N.ringGlow].forEach(function (e) { tr(e, 540, yy, 1, 0); });
      op(N.ringGlow, .5 + .5 * Math.sin(t * 10));
      N.b1.clip.setAttribute("height", 660 * E.inout(pos));
      op(N.b1.skel, te > t ? 1 : .8 + .2 * Math.sin(t * 6));
      o.head = te > t ? ["Los médicos usaron", "un <b>tomógrafo</b>", fade(t, a + .05), rise(t, tt)[1]] : ["Y apareció", "un <b>esqueleto completo</b>", 1, rise(t, te)[1]];
      o.tags = [["como en un hospital", 540, 560, fade(t, tt + .4) * (1 - fade(t, te - .2)), "#5fe0ff"], ["meditando", 540, 1225, fade(t, tmd - .1), "#FFD22E"]];
      o.sky = ["#04101f", "#0b2340"];
      o.cam = { s: 1 + .05 * d, fx: 540, fy: 940 };
    } else if (k === "maestro") {
      var tl = cue(2, "liuquan", .65);
      tr(N.b2, 540, 900, .82, 0); N.b2.clip.setAttribute("height", 660); op(N.b2.xr, .55 + .25 * Math.sin(t * 3));
      N.c2.forEach(function (cd, i) { tr(cd, i ? 900 : 180, 1060, 1, 0); cd.flame.setAttribute("ry", 22 + 5 * Math.sin(t * 13 + i * 2)); });
      var un = E.out(seg(t, tl - .35, tl + .3));
      tr(N.scroll, 540, 1210, 1, 0); N.scroll.setAttribute("transform", "translate(540,585) scale(" + Math.max(.02, un) + ",1)"); op(N.scroll, un > 0 ? 1 : 0);
      o.head = ["Se cree que era", "el maestro <b>Liuquan</b>", fade(t, a + .05), rise(t, tl)[1]];
      o.cam = { s: 1.02 + .08 * E.inout(d), fx: 540, fy: 900 };
    } else if (k === "papeles") {
      var to = cue(3, "órganos", .35), tp = cue(3, "papel", .7), tc = cue(3, "escrituras", .85);
      tr(N.torso, 540, 900, E.pop(seg(t, a - .01, a + .45)) * .95, 0);
      var gone = fade(t, tp - .3, .6); op(N.organs, (.85 * fade(t, to - .2)) * (1 - gone));
      N.papers.forEach(function (q, i) {
        var p = E.spring(seg(t, tp - .2 + i * .07, tp + .3 + i * .07));
        tr(q.e, q.x, q.y + Math.sin(t * 1.6 + q.ph) * 8, .9 * p, q.r + Math.sin(t * 1.2 + q.ph) * 5); op(q.e, p > 0 ? 1 : 0);
      });
      o.head = tp > t ? ["Lo más raro: donde iban", "sus <b>órganos</b>", fade(t, a + .05), rise(t, to)[1]] : ["Había", "<b>papeles</b> con escrituras", 1, rise(t, tp)[1]];
      o.tags = [["escrituras chinas antiguas", 540, 1225, fade(t, tc), "#FFD22E"]];
      o.sky = ["#04101f", "#0b2340"];
      o.cam = { s: 1 + .06 * E.inout(d), fx: 540, fy: 900 };
    } else {
      var ts = cue(4, "siglos", .2), tad = cue(4, "adentro", .85);
      tr(N.b4, 540, 860, .78, 0); N.b4.clip.setAttribute("height", 660);
      var ghost = fade(t, tad - .3, .5); op(N.b4.xr, ghost * (.45 + .2 * Math.sin(t * 4)));
      op(N.b4.halo, .8 + .2 * Math.sin(t * 2));
      N.people.forEach(function (p, i) { tr(p, 180 + i * 240, 1190, .95, 0); p.top.setAttribute("transform", "rotate(" + (18 + 16 * Math.sin(t * 1.6 + i * .9)) + " 0 40)"); });
      N.smoke.forEach(function (q) { var p = (t * .25 + q.ph) % 1; tr(q.e, q.x + Math.sin(t + q.ph * 6) * 16, 1070 - p * 520, .7, 0); op(q.e, .45 * Math.min(1, p * 4, (1 - p) * 3)); });
      o.head = tad > t ? ["Durante siglos", "le rezaron <b>sin saber</b>", rise(t, ts)[0], rise(t, ts)[1]] : ["Que había", "<b>alguien adentro</b>", 1, rise(t, tad)[1]];
      o.cam = { s: 1.06 - .06 * d, fx: 540, fy: 920 };
    }
    if (o.cam) { o.cam.fx += Math.sin(t * 1.2) * 12; o.cam.fy += Math.cos(t * .9) * 9; }
    return o;
  }
};
