// Por qué los surfistas raspan sus tablas (hecho a mano)
var N = {}, BOARD = "M0 -430 C150 -320 160 280 95 430 L-95 430 C-160 280 -150 -320 0 -430 Z";
function board(parent, id, bumps) {
  var g = el("g", {}, parent);
  el("path", { d: BOARD, fill: "#0a3a5a", transform: "translate(14,18)", opacity: .35 }, g);
  el("path", { d: BOARD, fill: "url(#boardG)", stroke: "#d8e6f2", "stroke-width": 6 }, g);
  el("line", { x1: 0, y1: -425, x2: 0, y2: 428, stroke: "#c08a4a", "stroke-width": 7 }, g);
  defs('<clipPath id="bc' + id + '"><path d="' + BOARD + '"/></clipPath>');
  g.in = el("g", { "clip-path": "url(#bc" + id + ")" }, g);
  g.bumps = [];
  if (bumps) { var r = rnd(7 + id); for (var y = -330; y <= 340; y += 34) for (var x = -130; x <= 130; x += 34) {
    var b = el("circle", { cx: x + (r() - .5) * 14, cy: y + (r() - .5) * 14, r: 13, fill: "#f3e2b0", stroke: "#c9a95a", "stroke-width": 3 }, g.in); g.bumps.push({ e: b, o: r() });
  } }
  return g;
}
function foot(parent) {
  var g = el("g", {}, parent);
  el("ellipse", { cx: 0, cy: 0, rx: 46, ry: 92, fill: "#e9b48a" }, g);
  [-30, -12, 6, 22, 36].forEach(function (x, i) { el("circle", { cx: x, cy: -92 + Math.abs(i - 1) * 6, r: 12 - i, fill: "#e9b48a" }, g); });
  return g;
}
function drops(parent, n, col) {
  var a = []; for (var i = 0; i < n; i++) a.push({ e: el("circle", { r: 8 + (i % 3) * 4, fill: col || "#bff4ff" }, parent), ang: -Math.PI * (i / (n - 1)), v: 160 + (i % 4) * 70 });
  return a;
}
var V = {
  stars: false,
  build: function () {
    defs('<linearGradient id="boardG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e6f2fb"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#cfe2f0"/></linearGradient>' +
      '<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#19B8B2"/><stop offset="1" stop-color="#0a4a7a"/></linearGradient>');
    // S0: se resbala
    var g0 = sc(0); N.waves0 = []; for (var w = 0; w < 7; w++) N.waves0.push(el("path", { d: "M-100 0 q90 -40 180 0 t180 0 t180 0 t180 0 t180 0 t180 0 t180 0", stroke: "#bff4ff", "stroke-width": 6, fill: "none", opacity: .35 }, g0));
    N.b0 = board(g0, 0, false); N.f0 = [foot(N.b0), foot(N.b0)]; N.d0 = drops(g0, 10);
    // S1: lisa y mojada, se frota cera
    var g1 = sc(1); N.b1 = board(g1, 1, true); N.shine = [];
    for (var s = 0; s < 4; s++) N.shine.push(el("rect", { x: -200, y: -12, width: 400, height: 22, fill: "#ffffff", opacity: .5, transform: "rotate(-30)" }, N.b1.in));
    N.wax = el("g", {}, g1); el("rect", { x: -70, y: -45, width: 140, height: 90, rx: 24, fill: "#f6e7b4", stroke: "#c9a95a", "stroke-width": 5 }, N.wax);
    txt(N.wax, "WAX", { y: 12, "font-size": 34, "font-weight": 900, fill: "#8a6a24" });
    N.f1 = [foot(g1), foot(g1)];
    // S2: se ensucia y se aplana
    var g2 = sc(2); N.b2 = board(g2, 2, true);
    N.meter = el("g", {}, g2); el("rect", { x: -200, y: -22, width: 400, height: 44, rx: 22, fill: "#0a2a4a", stroke: "#ffffff", "stroke-width": 4 }, N.meter);
    N.meterBar = el("rect", { x: -194, y: -16, width: 388, height: 32, rx: 16, fill: "#3fcf5a" }, N.meter);
    txt(N.meter, "AGARRE", { y: -40, "font-size": 30, "font-weight": 900 });
    // S3: el peine raspa en diagonal
    var g3 = sc(3); N.b3 = board(g3, 3, false); N.lines = [];
    for (var i = -12; i <= 12; i++) {
      N.lines.push({ e: el("line", { x1: i * 40 - 400, y1: -430, x2: i * 40 + 400, y2: 430, stroke: "#9fb8cc", "stroke-width": 6, "stroke-dasharray": 1200, "stroke-dashoffset": 1200 }, N.b3.in), dir: 0, k: i + 12 });
      N.lines.push({ e: el("line", { x1: i * 40 + 400, y1: -430, x2: i * 40 - 400, y2: 430, stroke: "#9fb8cc", "stroke-width": 6, "stroke-dasharray": 1200, "stroke-dashoffset": 1200 }, N.b3.in), dir: 1, k: i + 12 });
    }
    N.comb = el("g", {}, g3); el("rect", { x: -110, y: -40, width: 220, height: 50, rx: 12, fill: "#ff5a3a" }, N.comb);
    for (var c = 0; c < 9; c++) el("rect", { x: -100 + c * 24, y: 8, width: 10, height: 34, rx: 3, fill: "#ff5a3a" }, N.comb);
    // S4: macro: bultos y cera nueva
    var g4 = sc(4); N.macro = el("g", {}, g4);
    el("rect", { x: -460, y: -420, width: 920, height: 840, rx: 40, fill: "#f2f6fa", stroke: "#ffffff", "stroke-width": 8 }, N.macro);
    defs('<clipPath id="mc"><rect x="-460" y="-420" width="920" height="840" rx="40"/></clipPath>');
    var mi = el("g", { "clip-path": "url(#mc)" }, N.macro);
    for (var j = -6; j <= 6; j++) { el("line", { x1: j * 140 - 500, y1: -500, x2: j * 140 + 500, y2: 500, stroke: "#9fb8cc", "stroke-width": 14 }, mi); el("line", { x1: j * 140 + 500, y1: -500, x2: j * 140 - 500, y2: 500, stroke: "#9fb8cc", "stroke-width": 14 }, mi); }
    N.mbumps = []; for (var yy = -350; yy <= 350; yy += 140) for (var xx = -420; xx <= 420; xx += 140) {
      var bx = xx + ((Math.round((yy + 350) / 140)) % 2 ? 70 : 0); N.mbumps.push({ e: el("ellipse", { cx: bx, cy: yy, rx: 46, ry: 40, fill: "#e8eef5", stroke: "#c8d4e0", "stroke-width": 4 }, mi), o: Math.abs(bx) / 900 + Math.abs(yy) / 900 });
    }
    N.newWax = []; for (var n = 0; n < 10; n++) N.newWax.push({ e: el("circle", { r: 26, fill: "#fff4c8", stroke: "#e2c270", "stroke-width": 4 }, mi), x: -380 + (n * 97) % 760, y: -300 + (n * 151) % 600, o: n / 10 });
    // S5: surfista firme sobre la ola
    var g5 = sc(5); N.sea = el("path", { fill: "url(#sea)" }, g5);
    N.rider = el("g", {}, g5);
    el("path", { d: "M-230 0 Q0 -26 240 -6 Q250 6 230 14 Q0 26 -230 14 Z", fill: "#ffffff", stroke: "#d8e6f2", "stroke-width": 4 }, N.rider);
    var p = el("g", { stroke: "#0a1a3a", "stroke-width": 18, "stroke-linecap": "round", fill: "none" }, N.rider);
    el("path", { d: "M-70 -10 L-30 -110 L30 -10 M-30 -110 L0 -200 M0 -170 L-90 -150 M0 -170 L90 -190" }, p);
    el("circle", { cx: 6, cy: -238, r: 28, fill: "#0a1a3a", stroke: "none" }, N.rider);
    N.spray = drops(g5, 12, "#ffffff");
  },
  draw: function (t, c) {
    var o = { sky: ["#0b5a8a", "#19a0c8"] }, a = c.a, d = c.drift, k = c.key;
    if (k === "resbala") {
      var tc = cue(0, "cera", .5), tr2 = cue(0, "resbalarían", .7);
      N.waves0.forEach(function (w, i) { tr(w, -((t * 60 + i * 50) % 180), 560 + i * 120, 1, 0); });
      var sl = E.inq(seg(t, tr2 - .1, tr2 + .7));
      tr(N.b0, 540, 900, .9 * E.pop(seg(t, a - .01, a + .45)), lerp(-10, 8, sl) + Math.sin(t * 2) * 2);
      tr(N.f0[0], lerp(-60, -260, sl), lerp(-90, 120, sl), 1, lerp(-8, -70, sl));
      tr(N.f0[1], lerp(60, 280, sl), lerp(150, 380, sl), 1, lerp(8, 60, sl));
      N.d0.forEach(function (q) { var p = seg(t, tr2 + .1, tr2 + .8); tr(q.e, 540 + Math.cos(q.ang) * q.v * p, 980 + Math.sin(q.ang) * q.v * p + 300 * p * p, 1, 0); op(q.e, p > 0 && p < 1 ? 1 - p : 0); });
      o.head = tc > t ? ["Los surfistas", "<b>raspan</b> sus tablas", fade(t, a + .05), 0] : ["Porque sin cera", "se <b>resbalarían</b>", 1, rise(t, tc)[1]];
      o.cam = { s: 1 + .06 * E.inout(d), fx: 540, fy: 920 };
    } else if (k === "cera") {
      var tli = cue(1, "lisa", .2), tf = cue(1, "frotan", .55), tg = cue(1, "agarren", .9);
      tr(N.b1, 540, 920 + Math.sin(t * 2.2) * 16, .92, -8 + Math.sin(t * 1.6) * 3);
      N.shine.forEach(function (sh, i) { var p = ((t - a) * .6 + i / 4) % 1; sh.setAttribute("transform", "translate(0," + lerp(-520, 520, p) + ") rotate(-30)"); op(sh, .75 * (1 - fade(t, tf - .2))); });
      var wp = seg(t, tf - .2, tg); N.b1.bumps.forEach(function (q) { var s = E.spring(seg(wp, q.o * .8, q.o * .8 + .2)); tr(q.e, 0, 0, 1, 0); q.e.setAttribute("r", 13 * s); });
      var ang = (t - tf) * 7; tr(N.wax, 540 + Math.cos(ang) * 110, 900 + Math.sin(ang) * 200 + lerp(-150, 150, wp), 1, Math.sin(ang) * 10); op(N.wax, fade(t, tf - .3) * (1 - fade(t, tg - .1)));
      var fp = E.spring(seg(t, tg - .1, tg + .4)); tr(N.f1[0], 470, 760, .9 * fp, -10); tr(N.f1[1], 600, 1060, .9 * fp, 12); op(N.f1[0], fp > 0 ? 1 : 0); op(N.f1[1], fp > 0 ? 1 : 0);
      o.head = tf > t ? ["La tabla es", "lisa y <b>mojada</b>", fade(t, a + .05), rise(t, tli)[1]] : ["Le frotan", "<b>cera</b> para agarrar", 1, rise(t, tf)[1]];
      o.tags = [["¡agarre!", 760, 640, fade(t, tg + .1), "#3fcf5a"]];
      o.cam = { s: 1 + .05 * d, fx: 540, fy: 920 };
    } else if (k === "sucia") {
      var te = cue(2, "ensucia", .35), tap = cue(2, "aplana", .6), tga = cue(2, "agarrar", .85);
      tr(N.b2, 540, 940, .9, -8);
      var dirt = fade(t, te - .1, .6), flat = E.inout(seg(t, tap - .1, tap + .6));
      var col = "rgb(" + Math.round(lerp(251, 150, dirt)) + "," + Math.round(lerp(246, 128, dirt)) + "," + Math.round(lerp(232, 96, dirt)) + ")";
      N.b2.bumps.forEach(function (q) { q.e.setAttribute("fill", col); q.e.setAttribute("r", 13 * (1 - .65 * flat)); });
      var g = 1 - .82 * E.inout(seg(t, tap, tga + .3)); N.meterBar.setAttribute("width", 388 * g); N.meterBar.setAttribute("fill", g > .5 ? "#3fcf5a" : (g > .3 ? "#FFD22E" : "#ff3b5c"));
      tr(N.meter, 540, 1215, 1, 0); op(N.meter, fade(t, a + .3));
      o.head = tap > t ? ["Con cada sesión", "la cera se <b>ensucia</b>", fade(t, a + .05), rise(t, te)[1]] : ["Se aplana y", "<b>deja de agarrar</b>", 1, rise(t, tap)[1]];
      o.cam = { s: 1 + .06 * E.inout(d), fx: 540, fy: 920 };
    } else if (k === "peine") {
      var trs = cue(3, "raspan", .2), tp = cue(3, "peine", .4), tdg = cue(3, "diagonal", .85);
      tr(N.b3, 540, 920, .92, -8);
      var p1 = seg(t, trs, tdg - .3), p2 = seg(t, tdg - .5, tdg + .6);
      N.lines.forEach(function (q) { var pp = q.dir ? p2 : p1, lp = clamp(pp * 1.6 - q.k / 40, 0, 1); q.e.setAttribute("stroke-dashoffset", 1200 * (1 - lp)); });
      var cp = (t < tdg - .5 ? p1 : p2), dir = t < tdg - .5 ? 1 : -1;
      tr(N.comb, 540 + dir * lerp(-230, 230, (cp * 3) % 1), lerp(560, 1260, cp), 1.1 * E.pop(seg(t, trs - .3, trs + .1)), dir * 35);
      o.head = tdg > t ? ["Entonces la raspan", "con un <b>peine</b>", fade(t, a + .05), rise(t, tp)[1]] : ["Y le hacen", "rayas en <b>diagonal</b>", 1, rise(t, tdg)[1]];
      o.cam = { s: 1 + .06 * d, fx: 540, fy: 920 };
    } else if (k === "bultos") {
      var tb = cue(4, "bultos", .4), tn = cue(4, "nueva", .85);
      tr(N.macro, 540, 900, lerp(.85, 1, E.out(seg(t, a, a + .6))), -4 + Math.sin(t) * 1.5);
      N.mbumps.forEach(function (q) { var s = E.spring(seg(t, tb - .3 + q.o * .6, tb + .1 + q.o * .6)); q.e.setAttribute("transform", "translate(" + q.e.getAttribute("cx") * 0 + ",0)"); q.e.setAttribute("ry", 40 * (.25 + .75 * s)); q.e.setAttribute("rx", 46 * (.4 + .6 * s)); });
      N.newWax.forEach(function (q) { var p = E.out(seg(t, tn - .4 + q.o * .5, tn + q.o * .5)); tr(q.e, q.x, lerp(q.y - 420, q.y, p), p > 0 ? 1 : 0, 0); });
      o.head = tn > t ? ["Esas rayitas crean", "pequeños <b>bultos</b>", fade(t, a + .05), rise(t, tb)[1]] : ["Donde se pega", "la <b>cera nueva</b>", 1, rise(t, tn)[1]];
      o.tags = [["visto de muy cerca", 540, 1225, fade(t, a + .3), "#19B8B2"]];
      o.cam = { s: 1 + .07 * E.inout(d), fx: 540, fy: 900 };
    } else {
      var tl = cue(5, "lisa", .85);
      var dpath = "M-100 1300 L-100 1050"; for (var x = -100; x <= 1180; x += 40) dpath += " L" + x + " " + (1050 + Math.sin(x * .012 - t * 3) * 40); dpath += " L1180 1300 Z";
      N.sea.setAttribute("d", dpath);
      var rx = 540 + Math.sin(t * .8) * 60, ry = 1030 + Math.sin(rx * .012 - t * 3) * 40;
      tr(N.rider, rx, ry, 1.15 * E.pop(seg(t, a - .01, a + .4)), Math.cos(rx * .012 - t * 3) * 10);
      N.spray.forEach(function (q, i) { var p = ((t * .9) + i / 12) % 1; tr(q.e, rx - 220 + Math.cos(q.ang) * q.v * p * .8, ry + Math.sin(q.ang) * q.v * p + 220 * p * p, 1, 0); op(q.e, .8 * (1 - p)); });
      o.head = ["Por eso arriba la tabla", "<b>nunca está lisa</b>", fade(t, a + .05), rise(t, tl)[1]];
      o.sky = ["#1a1450", "#f07a3a"];
      o.cam = { s: 1.04 - .04 * d, fx: 540, fy: 940 };
    }
    if (o.cam) { o.cam.fx += Math.sin(t * 1.2) * 12; o.cam.fy += Math.cos(t * .9) * 9; }
    return o;
  }
};
