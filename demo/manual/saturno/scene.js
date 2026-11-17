// Saturno flotaría en el agua (hecho a mano)
var N = {};
function saturn(parent, rings) {
  var g = el("g", {}, parent);
  if (rings !== false) { g.back = el("g", {}, g); ringPath(g.back, true); }
  el("circle", { r: 230, fill: "url(#satG)" }, g);
  var b = el("g", { "clip-path": "url(#satClip)" }, g);
  [[-150, 30, "#e8c27a"], [-90, 24, "#c99a52"], [-30, 40, "#f0d49a"], [40, 26, "#c99a52"], [100, 34, "#e2b86c"], [160, 30, "#b8884a"]].forEach(function (s) {
    el("rect", { x: -240, y: s[0], width: 480, height: s[1], fill: s[2], opacity: .55 }, b);
  });
  el("circle", { r: 230, fill: "url(#satShade)" }, g);
  if (rings !== false) { g.front = el("g", {}, g); ringPath(g.front, false); }
  return g;
}
function ringPath(g, back) {
  var clip = back ? "url(#ringBack)" : "url(#ringFront)";
  var w = el("g", { "clip-path": clip }, g);
  [[470, 120, "#d9c39a", 26], [420, 104, "#b89a6a", 18], [380, 92, "#e8d4a8", 22], [330, 80, "#a8885a", 10]].forEach(function (r) {
    el("ellipse", { rx: r[0], ry: r[1], fill: "none", stroke: r[2], "stroke-width": r[3], opacity: .9 }, w);
  });
}
function miniEarth(parent) { var g = el("g", {}, parent); el("circle", { r: 9, fill: "#2a6fd6" }, g); el("circle", { cx: -2, cy: -2, r: 4, fill: "#3fbf7a" }, g); return g; }
var V = {
  stars: 170,
  build: function () {
    defs('<radialGradient id="satG" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ffe7b0"/><stop offset=".6" stop-color="#e2b86c"/><stop offset="1" stop-color="#9a6a32"/></radialGradient>' +
      '<radialGradient id="satShade" cx=".3" cy=".3" r=".9"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>' +
      '<clipPath id="satClip"><circle r="230"/></clipPath>' +
      '<clipPath id="ringBack"><rect x="-600" y="-200" width="1200" height="200"/></clipPath>' +
      '<clipPath id="ringFront"><rect x="-600" y="0" width="1200" height="200"/></clipPath>' +
      '<linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fc8ff" stop-opacity=".85"/><stop offset="1" stop-color="#1f6fd0" stop-opacity=".95"/></linearGradient>');
    // S0: 700 Tierras adentro
    N.s0 = saturn(sc(0)); N.earths = el("g", { "clip-path": "url(#satClip)" }, N.s0); N.ers = [];
    for (var y = -220; y <= 220; y += 22) for (var x = -220; x <= 220; x += 22) if (x * x + y * y < 225 * 225) N.ers.push({ e: miniEarth(N.earths), x: x, y: y, o: R() });
    // S1: la bañera
    var g1 = sc(1); N.tub = el("g", {}, g1);
    el("rect", { x: -480, y: -40, width: 960, height: 420, rx: 120, fill: "#f2f5fb", stroke: "#c8d2e6", "stroke-width": 10 }, N.tub);
    N.waterY = el("rect", { x: -455, y: 40, width: 910, height: 320, rx: 100, fill: "url(#water)" }, N.tub);
    [-360, 360].forEach(function (x) { el("rect", { x: x - 18, y: 370, width: 36, height: 70, rx: 12, fill: "#c8d2e6" }, N.tub); });
    N.s1 = saturn(g1); N.splash = [];
    for (var s = 0; s < 14; s++) N.splash.push({ a: -Math.PI * (s / 13), v: 200 + R() * 260, e: el("circle", { r: 10 + R() * 10, fill: "#9fe0ff" }, g1) });
    N.front = el("rect", { x: 85, y: 945, width: 910, height: 300, rx: 100, fill: "url(#water)", opacity: .78 }, g1);
    // S2: gas liviano
    var g2 = sc(2); N.s2 = saturn(g2, false); N.lens = el("g", {}, g2);
    el("circle", { r: 250, fill: "#1a1240", stroke: "#ffffff", "stroke-width": 8 }, N.lens);
    defs('<clipPath id="lc2"><circle r="242"/></clipPath>');
    var lg = el("g", { "clip-path": "url(#lc2)" }, N.lens); N.gas = [];
    for (var i = 0; i < 26; i++) { var he = i % 4 === 0, gg = el("g", {}, lg); el("circle", { r: he ? 22 : 14, fill: he ? "#ff9dd6" : "#bff4ff" }, gg); txt(gg, he ? "He" : "H", { y: he ? 8 : 6, "font-size": he ? 20 : 15, fill: "#1a1240", "font-weight": 900 }); N.gas.push({ e: gg, x: (R() - .5) * 440, y: (R() - .5) * 440, vx: (R() - .5) * 90, vy: (R() - .5) * 90 }); }
    // S3: densidad (barras)
    var g3 = sc(3); N.bars = [];
    [["agua", "1", "#3fa0e8", 1], ["Saturno", "0,7", "#e2b86c", .69]].forEach(function (q, k) {
      var x = 360 + k * 360, b = { v: q[3] };
      el("rect", { x: x - 70, y: 560, width: 140, height: 560, rx: 20, fill: "#ffffff", opacity: .1 }, g3);
      b.bar = el("rect", { x: x - 70, y: 1120, width: 140, height: 0, rx: 20, fill: q[2] }, g3);
      b.val = txt(g3, q[1], { x: x, y: 520, "font-size": 70, "font-weight": 900, fill: q[2], opacity: 0 });
      b.lab = txt(g3, q[0].toUpperCase(), { x: x, y: 1180, "font-size": 40, opacity: 0 });
      N.bars.push(b);
    });
    N.line = el("line", { x1: 220, x2: 860, y1: 560, y2: 560, stroke: "#ffffff", "stroke-width": 4, "stroke-dasharray": "14 10", opacity: 0 }, g3);
    // S4 y S5: anillos finísimos
    N.s4 = saturn(sc(4)); N.s5 = el("g", {}, sc(5));
    el("ellipse", { cx: 540, cy: 900, rx: 520, ry: 10, fill: "#d9c39a" }, N.s5);
    el("ellipse", { cx: 540, cy: 900, rx: 380, ry: 7, fill: "#b89a6a" }, N.s5);
    el("circle", { cx: 540, cy: 900, r: 160, fill: "url(#satG)" }, N.s5);
    N.wArrow = el("g", {}, sc(5));
    el("path", { d: "M30 760 L1050 760 M60 740 L30 760 L60 780 M1020 740 L1050 760 L1020 780", stroke: "#FFD22E", "stroke-width": 7, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, N.wArrow);
    N.mag = el("g", {}, sc(5));
    el("circle", { r: 170, fill: "#0a0f2e", stroke: "#ffffff", "stroke-width": 7 }, N.mag);
    el("rect", { x: -170, y: -9, width: 340, height: 18, fill: "#d9c39a" }, N.mag);
    el("path", { d: "M120 -60 L120 -14 M104 -30 L120 -14 L136 -30 M120 60 L120 14 M104 30 L120 14 L136 30", stroke: "#FFD22E", "stroke-width": 6, fill: "none", "stroke-linecap": "round" }, N.mag);
  },
  draw: function (t, c) {
    var o = {}, a = c.a, d = c.drift, k = c.key;
    if (k === "gigante") {
      var tt = cue(0, "tierras", .75), fillP = seg(t, a + .4, tt + .2);
      tr(N.s0, 540, 860, .95 * E.pop(seg(t, a - .01, a + .45)), -12);
      N.ers.forEach(function (q) { var p = E.spring(seg(t, a + .4 + q.o * (tt - a - .2), a + .7 + q.o * (tt - a - .2))); tr(q.e, q.x, q.y, p, 0); });
      o.num = [fmt(Math.round(700 * fillP)), "Tierras", fade(t, a + .3), Math.sin(Math.PI * seg(t, tt + .2, tt + .5)), 330, 150];
      o.head = ["Dentro de Saturno caben", "", 1, 0];
      o.note = ["ilustración", fade(t, a + .5)];
      o.cam = { s: 1 + .08 * E.inout(d), fx: 540, fy: 920 };
    } else if (k === "banera") {
      var tf = cue(1, "flotaría", .8), dropP = E.inq(seg(t, a + .3, a + 1.1)), land = seg(t, a + 1.1, a + 2.4);
      tr(N.tub, 540, 880, 1, 0);
      var sy = lerp(-200, 960, dropP) + (land > 0 ? Math.sin((t - a - 1.1) * 5) * 30 * (1 - land) + Math.sin(t * 2) * 8 : 0);
      tr(N.s1, 540, sy, .55, -12);
      N.splash.forEach(function (q) { var p = seg(t, a + 1.1, a + 1.8); tr(q.e, 540 + Math.cos(q.a) * q.v * p, 930 + Math.sin(q.a) * q.v * p * 1.4 + 600 * p * p, 1, 0); op(q.e, p > 0 && p < 1 ? 1 - p : 0); });
      o.head = ["Si existiera una bañera gigante", "Saturno <b>flotaría</b>", rise(t, tf)[0], rise(t, tf)[1]];
      o.cam = { s: 1 + .05 * d, fx: 540, fy: 960 };
    } else if (k === "gas") {
      var th = cue(2, "hidrógeno", .4), the = cue(2, "helio", .5), tl = cue(2, "livianos", .8);
      tr(N.s2, 540, 860, lerp(1, 1.8, E.inout(seg(t, a, a + .8))), -12); op(N.s2, 1 - seg(t, a + .6, a + 1));
      var lp = E.spring(seg(t, a + .6, a + 1.1)); tr(N.lens, 540, 880, lp, 0); op(N.lens, lp > 0 ? 1 : 0);
      N.gas.forEach(function (q) {
        var x = ((q.x + t * q.vx) % 480 + 720) % 480 - 240, y = ((q.y + t * q.vy) % 480 + 720) % 480 - 240;
        tr(q.e, x, y, 1, 0);
      });
      o.head = tl > t ? ["Está hecho casi todo de", "<b>gas</b>", fade(t, a + .2), 0] : ["Los gases", "más <b>livianos</b>", 1, rise(t, tl)[1]];
      o.tags = [["H · hidrógeno", 330, 1190, fade(t, th), "#bff4ff"], ["He · helio", 760, 1190, fade(t, the), "#ff9dd6"]];
      o.sky = ["#0a0820", "#1a1240"];
      o.cam = { s: 1 + .06 * E.inout(d), fx: 540, fy: 920 };
    } else if (k === "densidad") {
      var tm = cue(3, "menos", .5), tw = cue(3, "agua", .8);
      N.bars.forEach(function (b, i) {
        var p = E.inout(seg(t, (i ? tm : a + .2), (i ? tm : a + .2) + .7)) * b.v;
        b.bar.setAttribute("y", 1120 - 560 * p); b.bar.setAttribute("height", 560 * p);
        op(b.val, fade(t, (i ? tm : a + .2) + .6)); op(b.lab, fade(t, a + .1));
      });
      op(N.line, fade(t, tw));
      o.head = ["Aunque es enorme", "es <b>menos denso</b> que el agua", rise(t, tm)[0], rise(t, tm)[1]];
      o.note = ["densidad en gramos por cm³", fade(t, a + .5)];
      o.cam = { s: 1 + .05 * d, fx: 540, fy: 900 };
    } else if (k === "anillos") {
      var tf2 = cue(4, "finísimos", .8), tilt = E.inout(seg(t, a + .3, tf2 + .2));
      tr(N.s4, 540, 900, lerp(1, 1.15, d), lerp(-12, 0, tilt));
      [N.s4.back, N.s4.front].forEach(function (r) { r.setAttribute("transform", "scale(1," + lerp(1, .08, tilt) + ")"); });
      o.head = ["Y sus anillos son", "<b>finísimos</b>", rise(t, tf2)[0], rise(t, tf2)[1]];
      o.cam = { s: 1 + .04 * d, fx: 540, fy: 900 };
    } else {
      var tk = cue(5, "kilómetros", .3), tm2 = cue(5, "metros", .8);
      op(N.wArrow, fade(t, tk - .1)); tr(N.wArrow, 0, 0, 1, 0);
      var mp = E.spring(seg(t, tm2 - .3, tm2 + .2)); tr(N.mag, 540, 1080, mp, 0); op(N.mag, mp > 0 ? 1 : 0);
      o.head = tm2 > t ? ["De ancho", "<b>cientos de miles</b> de km", rise(t, tk)[0], rise(t, tk)[1]] : ["Pero de alto", "unos <b>10 metros</b>", 1, rise(t, tm2)[1]];
      o.tags = [["cientos de miles de km", 540, 700, fade(t, tk + .2) * (1 - fade(t, tm2 - .3)), "#FFD22E"], ["~10 m", 760, 1080, fade(t, tm2 + .1), "#FFD22E"]];
      o.cam = { s: 1.02 + .06 * d, fx: 540, fy: 940 };
    }
    return o;
  }
};
