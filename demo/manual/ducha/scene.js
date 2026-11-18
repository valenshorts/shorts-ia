// Por qué cantas mejor en la ducha (hecho a mano)
var N = {};
function note(parent, col) {
  var g = el("g", {}, parent), c = col || "#FFD22E";
  el("ellipse", { cx: 0, cy: 0, rx: 18, ry: 13, fill: c, transform: "rotate(-20)" }, g);
  el("rect", { x: 14, y: -62, width: 6, height: 62, fill: c }, g);
  el("path", { d: "M20 -62 Q44 -50 40 -26", stroke: c, "stroke-width": 6, fill: "none" }, g);
  return g;
}
function head(parent) {
  var g = el("g", {}, parent);
  el("circle", { cx: 0, cy: -60, r: 56, fill: "#f2c9a0" }, g);
  el("path", { d: "M-56 -70 Q-50 -130 0 -126 Q52 -130 58 -72 Q30 -96 -10 -94 Q-40 -92 -56 -70 Z", fill: "#3a2a20" }, g);
  g.mouth = el("ellipse", { cx: 22, cy: -40, rx: 12, ry: 8, fill: "#7a2a2a" }, g);
  el("path", { d: "M-70 60 Q0 -10 70 60 L80 160 L-80 160 Z", fill: "#f2c9a0" }, g);
  return g;
}
function tiles(parent, col) {
  var g = el("g", {}, parent);
  el("rect", { x: -100, y: -100, width: 1280, height: 2120, fill: col || "#cfe6ef" }, g);
  for (var x = 0; x <= 1080; x += 120) el("line", { x1: x, y1: 0, x2: x, y2: 1920, stroke: "#a9c8d6", "stroke-width": 4 }, g);
  for (var y = 0; y <= 1920; y += 120) el("line", { x1: 0, y1: y, x2: 1080, y2: y, stroke: "#a9c8d6", "stroke-width": 4 }, g);
  el("rect", { x: -100, y: -100, width: 1280, height: 760, fill: "url(#topDark)" }, g);
  return g;
}
var V = {
  stars: false,
  build: function () {
    defs('<linearGradient id="topDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#080D2B" stop-opacity=".92"/><stop offset=".75" stop-color="#080D2B" stop-opacity=".55"/><stop offset="1" stop-color="#080D2B" stop-opacity="0"/></linearGradient>');
    // S0: la ducha
    var g0 = sc(0); tiles(g0);
    N.shower = el("g", {}, g0);
    el("path", { d: "M900 420 L900 520 L760 560", stroke: "#8a9ab2", "stroke-width": 18, fill: "none", "stroke-linecap": "round" }, N.shower);
    el("ellipse", { cx: 730, cy: 575, rx: 90, ry: 30, fill: "#9fb0c8" }, N.shower);
    N.water = []; for (var w = 0; w < 26; w++) N.water.push({ x: 650 + R() * 160, ph: R(), e: el("line", { stroke: "#5fb8ff", "stroke-width": 5, "stroke-linecap": "round", opacity: .7 }, g0) });
    N.h0 = head(g0); N.notes0 = []; for (var n = 0; n < 6; n++) N.notes0.push({ ph: n / 6, x: (R() - .5) * 200, e: note(g0) });
    // S1: corte del baño con ondas que rebotan
    var g1 = sc(1);
    el("rect", { x: 140, y: 520, width: 800, height: 700, rx: 16, fill: "#0f1e4a", stroke: "#cfe6ef", "stroke-width": 22 }, g1);
    N.h1 = el("circle", { cx: 360, cy: 900, r: 40, fill: "#f2c9a0" }, g1);
    N.rays = [];
    [[-.2], [.35], [.9], [1.6], [2.4], [-.9]].forEach(function (q) { N.rays.push({ a: q[0], e: el("polyline", { fill: "none", stroke: "#FFD22E", "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: .9 }, g1) }); });
    N.waves = []; for (var k = 0; k < 4; k++) N.waves.push(el("circle", { cx: 360, cy: 900, r: 10, fill: "none", stroke: "#19B8B2", "stroke-width": 5 }, g1));
    // S2: la voz se vuelve más llena
    var g2 = sc(2); N.wv = []; var cols = ["#ffffff", "#19B8B2", "#19B8B2", "#19B8B2"];
    for (var j = 0; j < 4; j++) N.wv.push(el("path", { fill: "none", stroke: cols[j], "stroke-width": j ? 5 : 8, opacity: j ? .7 : 1, "stroke-linecap": "round" }, g2));
    N.bad = note(g2, "#ff5a3a");
    // S3: vapor y garganta
    var g3 = sc(3); tiles(g3, "#bcd8e4"); N.steam = [];
    for (var s = 0; s < 10; s++) N.steam.push({ x: 140 + s * 90, ph: R(), e: el("path", { d: "M0 0 q-30 -60 0 -120 q30 -60 0 -120", stroke: "#ffffff", "stroke-width": 26, fill: "none", "stroke-linecap": "round", opacity: .5 }, g3) });
    N.h3 = head(g3); N.throat = el("ellipse", { rx: 26, ry: 44, fill: "#ff8a6a", opacity: 0 }, g3);
    // S4: estudio de grabación
    var g4 = sc(4); N.mic = el("g", {}, g4);
    el("rect", { x: -60, y: -150, width: 120, height: 200, rx: 60, fill: "#cfd8ff" }, N.mic);
    for (var m = 0; m < 6; m++) el("line", { x1: -50, y1: -120 + m * 28, x2: 50, y2: -120 + m * 28, stroke: "#8a96b8", "stroke-width": 5 }, N.mic);
    el("path", { d: "M-90 -20 Q-90 110 0 110 Q90 110 90 -20", stroke: "#cfd8ff", "stroke-width": 10, fill: "none" }, N.mic);
    el("rect", { x: -8, y: 110, width: 16, height: 120, fill: "#cfd8ff" }, N.mic);
    N.desk = el("g", {}, g4); el("rect", { x: -380, y: -90, width: 760, height: 180, rx: 24, fill: "#1a2348", stroke: "#3a4a78", "stroke-width": 6 }, N.desk);
    N.sliders = []; for (var q = 0; q < 6; q++) { el("rect", { x: -320 + q * 70, y: -60, width: 10, height: 120, fill: "#3a4a78" }, N.desk); N.sliders.push(el("rect", { x: -334 + q * 70, y: -20, width: 38, height: 22, rx: 6, fill: q === 5 ? "#FFD22E" : "#9fb4d8" }, N.desk)); }
    N.knob = el("g", {}, N.desk); el("circle", { r: 54, fill: "#2a3658", stroke: "#FFD22E", "stroke-width": 6 }, N.knob); el("line", { x1: 0, y1: 0, x2: 0, y2: -40, stroke: "#FFD22E", "stroke-width": 8, "stroke-linecap": "round" }, N.knob);
    N.knobLab = txt(N.desk, "REVERB", { x: 250, y: 84, "font-size": 24, fill: "#FFD22E" });
    // S5: estrella de la ducha
    var g5 = sc(5); N.spot = el("path", { d: "M440 300 L640 300 L860 1300 L220 1300 Z", fill: "url(#spotG)", opacity: .5 }, g5);
    defs('<linearGradient id="spotG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6cf" stop-opacity=".9"/><stop offset="1" stop-color="#fff6cf" stop-opacity="0"/></linearGradient>');
    N.h5 = head(g5); N.stars5 = []; for (var z = 0; z < 8; z++) N.stars5.push({ a: z / 8 * 6.283, e: el("path", { d: "M0 -26 L7 -8 L26 -8 L11 4 L17 24 L0 12 L-17 24 L-11 4 L-26 -8 L-7 -8 Z", fill: "#FFD22E" }, g5) });
    N.notes5 = []; for (var u = 0; u < 7; u++) N.notes5.push({ ph: u / 7, x: (R() - .5) * 400, e: note(g5) });
  },
  draw: function (t, c) {
    var o = {}, a = c.a, d = c.drift, k = c.key;
    function sing(h, notes, x, y, on) {
      tr(h, x, y, 1.6, 0); h.mouth.setAttribute("ry", 6 + 6 * Math.abs(Math.sin(t * 7)));
      notes.forEach(function (q) { var p = (t * .5 + q.ph) % 1; tr(q.e, x + 60 + q.x * p + Math.sin(t * 3 + q.ph * 6) * 20, y - 120 - 520 * p, 1.2, Math.sin(t * 2 + q.ph * 6) * 15); op(q.e, on * Math.min(1, p * 5, (1 - p) * 4)); });
    }
    if (k === "ducha") {
      N.water.forEach(function (q) { var p = (t * 1.6 + q.ph) % 1, y = 600 + p * 900; q.e.setAttribute("x1", q.x + p * 40); q.e.setAttribute("x2", q.x + p * 40 + 4); q.e.setAttribute("y1", y); q.e.setAttribute("y2", y + 50); });
      sing(N.h0, N.notes0, 470, 1080, fade(t, a + .2));
      o.head = ["No es tu imaginación", "en la ducha <b>cantas mejor</b>", 1, 0];
      o.cam = { s: 1 + .06 * E.inout(d), fx: 540, fy: 960 };
    } else if (k === "paredes") {
      var tr2 = cue(1, "rebota", .6), bounce = seg(t, tr2 - .4, tr2 + 1.2);
      N.waves.forEach(function (w, i) { var p = ((t - a) * .9 + i / 4) % 1; w.setAttribute("r", 40 + p * 520); op(w, (1 - p) * .8 * (1 - bounce * .6)); });
      N.rays.forEach(function (q) {
        var x = 360, y = 900, ang = q.a, pts = [[x, y]], len = 1600 * E.out(bounce), left = len;
        for (var n = 0; n < 6 && left > 0; n++) {
          var dx = Math.cos(ang), dy = Math.sin(ang), tx = dx > 0 ? (929 - x) / dx : (151 - x) / dx, ty = dy > 0 ? (1209 - y) / dy : (531 - y) / dy, st = Math.min(tx, ty, left);
          x += dx * st; y += dy * st; left -= st; pts.push([x, y]);
          if (st === tx) ang = Math.PI - ang; else if (st === ty) ang = -ang;
        }
        q.e.setAttribute("points", pts.map(function (p) { return p[0] + "," + p[1]; }).join(" ")); op(q.e, .9 * fade(t, tr2 - .4));
      });
      o.head = ["Paredes duras y lisas", "tu voz <b>rebota</b>", rise(t, tr2)[0], rise(t, tr2)[1]];
      o.tags = [["pared lisa", 540, 1265, fade(t, a + .4), "#cfe6ef"]];
      o.cam = { s: 1 + .05 * d, fx: 540, fy: 900 };
    } else if (k === "eco") {
      var te = cue(2, "eco", .2), tll = cue(2, "llena", .5), tde = cue(2, "desafinadas", .85), full = E.inout(seg(t, te, tll + .3));
      N.wv.forEach(function (p, j) {
        var dpath = "M120 900", amp = j ? 60 * full : 70, off = j * .5;
        for (var x = 120; x <= 960; x += 12) dpath += " L" + x + " " + (900 + Math.sin(x * .03 - t * 6 + off) * amp * (j ? 1 : (1 + .4 * full)) + (j ? (j - 2) * 14 * full : 0));
        p.setAttribute("d", dpath); op(p, j ? full * .7 : 1);
      });
      var hb = fade(t, tde - .2), cov = fade(t, tde + .2);
      tr(N.bad, 760, 720 + Math.sin(t * 3) * 10, 1.4 * (1 - cov * .6), 0); op(N.bad, hb * (1 - cov));
      o.head = tde > t ? ["Ese eco cortito", "hace la voz más <b>llena</b>", rise(t, te)[0], rise(t, te)[1]] : ["Y tapa las notas", "<b>desafinadas</b>", 1, rise(t, tde)[1]];
      o.tags = [["tu voz", 230, 1060, fade(t, a + .2), "#ffffff"], ["+ eco", 820, 1060, fade(t, te + .2), "#19B8B2"]];
      o.cam = { s: 1 + .06 * E.inout(d), fx: 540, fy: 900 };
    } else if (k === "vapor") {
      var tv = cue(3, "vapor", .3), tg = cue(3, "garganta", .8);
      N.steam.forEach(function (q) { var p = (t * .35 + q.ph) % 1; tr(q.e, q.x + Math.sin(t + q.ph * 6) * 20, 1500 - p * 900, 1, 0); op(q.e, .45 * fade(t, tv - .3) * Math.min(1, p * 4, (1 - p) * 3)); });
      tr(N.h3, 540, 900, 1.8, 0); N.h3.mouth.setAttribute("ry", 6 + 4 * Math.abs(Math.sin(t * 5)));
      tr(N.throat, 540, 960, 1, 0); op(N.throat, fade(t, tg - .2) * (.5 + .3 * Math.sin(t * 4)));
      o.head = ["El vapor y el calor", "<b>relajan</b> la garganta", rise(t, tv)[0], rise(t, tv)[1]];
      o.cam = { s: 1 + .07 * d, fx: 540, fy: 940 };
    } else if (k === "estudio") {
      var tes = cue(4, "estudios", .3), tef = cue(4, "efectos", .8);
      tr(N.mic, 540, 720 + Math.sin(t * 1.5) * 6, E.pop(seg(t, a - .01, a + .4)), 0);
      tr(N.desk, 540, 1110, E.pop(seg(t, a + .1, a + .5)), 0);
      N.sliders.forEach(function (s, i) { s.setAttribute("y", -20 + Math.sin(t * 2 + i) * 30 - (i === 5 ? 40 * fade(t, tef) : 0)); });
      N.knob.setAttribute("transform", "translate(250,10) rotate(" + lerp(-120, 110, E.inout(seg(t, tef - .3, tef + .5))) + ")");
      o.head = ["Los estudios de grabación", "usan el <b>mismo truco</b>", rise(t, tes)[0], rise(t, tes)[1]];
      o.sky = ["#120a26", "#2a1240"];
      o.cam = { s: 1 + .06 * d, fx: 540, fy: 920 };
    } else {
      var tf = cue(5, "famoso", .8);
      op(N.spot, .45 + .1 * Math.sin(t * 3));
      sing(N.h5, N.notes5, 540, 1100, 1);
      N.stars5.forEach(function (s, i) { var r = 260 + 20 * Math.sin(t * 3 + i); tr(s.e, 540 + Math.cos(s.a + t * .6) * r, 820 + Math.sin(s.a + t * .6) * r * .6, E.spring(seg(t, tf - .4 + i * .04, tf + i * .04)), t * 40); });
      o.head = ["Por eso en la ducha", "todos suenan <b>famosos</b>", rise(t, tf)[0], rise(t, tf)[1]];
      o.sky = ["#120a26", "#3a1a4a"];
      o.cam = { s: 1.06 - .06 * d, fx: 540, fy: 940 };
    }
    return o;
  }
};
