// La Tierra gira a 1600 km por hora (hecho a mano)
var N = {};
function globe(parent, r) {
  var g = el("g", {}, parent);
  el("circle", { r: r + 26, fill: "url(#atmoE)" }, g);
  el("circle", { r: r, fill: "#1f5fc8" }, g);
  var land = el("g", { "clip-path": "url(#gclip" + r + ")" }, g); g.land = [];
  for (var k = 0; k < 2; k++) {
    var L = el("g", {}, land);
    [[-.55, -.35, .32, .22], [-.2, .15, .22, .34], [.3, -.25, .36, .2], [.45, .3, .2, .16], [-.7, .45, .16, .1]].forEach(function (c) {
      el("ellipse", { cx: c[0] * r + k * 2 * r, cy: c[1] * r, rx: c[2] * r, ry: c[3] * r, fill: "#3fbf7a" }, L);
    });
    g.land.push(L);
  }
  el("ellipse", { cx: 0, cy: 0, rx: r, ry: r * .06, fill: "none", stroke: "#FFD22E", "stroke-width": 4, "stroke-dasharray": "12 10", opacity: 0, "class": "eq" }, g);
  el("circle", { r: r, fill: "url(#shadeG)" }, g);
  g.r = r; return g;
}
function spinGlobe(g, t, speed) { g.land.forEach(function (L) { L.setAttribute("transform", "translate(" + (-((t * speed) % (2 * g.r))) + ",0)"); }); }
function stick(parent, col) {
  var g = el("g", {}, parent), c = col || "#ffffff";
  el("circle", { cy: -70, r: 16, fill: c }, g);
  el("line", { x1: 0, y1: -54, x2: 0, y2: -14, stroke: c, "stroke-width": 10, "stroke-linecap": "round" }, g);
  g.legA = el("line", { x1: 0, y1: -14, x2: -12, y2: 20, stroke: c, "stroke-width": 10, "stroke-linecap": "round" }, g);
  g.legB = el("line", { x1: 0, y1: -14, x2: 12, y2: 20, stroke: c, "stroke-width": 10, "stroke-linecap": "round" }, g);
  el("line", { x1: -16, y1: -40, x2: 16, y2: -40, stroke: c, "stroke-width": 9, "stroke-linecap": "round" }, g);
  return g;
}
function walk(g, t) { var s = Math.sin(t * 8) * 14; g.legA.setAttribute("x2", -s); g.legB.setAttribute("x2", s); }
var V = {
  stars: 160,
  build: function () {
    defs('<radialGradient id="atmoE"><stop offset=".88" stop-color="#5fd4ff" stop-opacity="0"/><stop offset=".94" stop-color="#5fd4ff" stop-opacity=".5"/><stop offset="1" stop-color="#5fd4ff" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="shadeG" cx=".35" cy=".35" r=".85"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".65"/></radialGradient>' +
      '<radialGradient id="sunG"><stop offset="0" stop-color="#fff6cf"/><stop offset=".35" stop-color="#ffd22e"/><stop offset="1" stop-color="#ff9d2e" stop-opacity="0"/></radialGradient>' +
      '<clipPath id="gclip330"><circle r="330"/></clipPath><clipPath id="gclip46"><circle r="46"/></clipPath><clipPath id="gclip380"><circle r="380"/></clipPath>');
    // S0 y S1: el globo
    N.g0 = globe(sc(0), 330); N.pin = el("g", {}, sc(0));
    el("circle", { r: 16, fill: "#FFD22E", stroke: "#fff", "stroke-width": 4 }, N.pin);
    el("path", { d: "M30 0 L120 0 M96 -20 L120 0 L96 20", stroke: "#FFD22E", "stroke-width": 9, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, N.pin);
    N.g1 = globe(sc(1), 330); N.axis = el("line", { x1: 0, y1: -430, x2: 0, y2: 430, stroke: "#ffffff", "stroke-width": 5, "stroke-dasharray": "14 10", opacity: .7 }, sc(1));
    N.spinArrow = el("path", { d: "M-200 -360 A220 46 0 1 0 200 -360", stroke: "#FFD22E", "stroke-width": 10, fill: "none", "stroke-linecap": "round" }, sc(1));
    N.spinHead = el("path", { d: "M180 -390 L210 -362 L176 -340", stroke: "#FFD22E", "stroke-width": 10, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, sc(1));
    // S2: órbita alrededor del Sol
    var g2 = sc(2);
    el("ellipse", { cx: 540, cy: 880, rx: 400, ry: 170, fill: "none", stroke: "#ffffff", "stroke-width": 3, "stroke-dasharray": "12 12", opacity: .5 }, g2);
    N.sun = el("circle", { cx: 540, cy: 880, r: 190, fill: "url(#sunG)" }, g2); el("circle", { cx: 540, cy: 880, r: 80, fill: "#ffe27a" }, g2);
    N.g2 = globe(g2, 46); N.trail = el("path", { stroke: "#5fd4ff", "stroke-width": 6, fill: "none", opacity: .6, "stroke-linecap": "round" }, g2);
    // S3: ¿por qué no lo sientes?
    N.g3 = globe(sc(3), 380); N.p3 = stick(sc(3)); N.q = txt(sc(3), "?", { "font-size": 260, "font-weight": 900, fill: "#FFD22E" });
    // S4: gráfico de velocidad pareja
    var g4 = sc(4);
    el("line", { x1: 160, y1: 1120, x2: 960, y2: 1120, stroke: "#ffffff", "stroke-width": 5 }, g4);
    el("line", { x1: 160, y1: 1120, x2: 160, y2: 560, stroke: "#ffffff", "stroke-width": 5 }, g4);
    txt(g4, "VELOCIDAD", { x: 190, y: 540, "text-anchor": "start", "font-size": 30, fill: "#9fb4d8" });
    txt(g4, "TIEMPO", { x: 960, y: 1170, "text-anchor": "end", "font-size": 30, fill: "#9fb4d8" });
    N.bumpy = el("path", { d: "M160 1000 C220 760 280 1080 340 820 S460 1060 520 760 S640 1080 700 820 S820 1000 960 860", stroke: "#ff5a3a", "stroke-width": 8, fill: "none", opacity: .7, "stroke-dasharray": 2000, "stroke-dashoffset": 2000 }, g4);
    N.flat = el("path", { d: "M160 700 L960 700", stroke: "#FFD22E", "stroke-width": 12, fill: "none", "stroke-linecap": "round", "stroke-dasharray": 800, "stroke-dashoffset": 800 }, g4);
    N.dot = el("circle", { r: 18, fill: "#FFD22E" }, g4);
    // S5: avión
    var g5 = sc(5); N.clouds = [];
    for (var c = 0; c < 10; c++) N.clouds.push({ y: 420 + R() * 900, x: R() * 1400, v: 900 + R() * 600, e: el("ellipse", { rx: 120 + R() * 100, ry: 30 + R() * 20, fill: "#ffffff", opacity: .25 }, g5) });
    N.cabin = el("g", {}, g5);
    el("rect", { x: -440, y: -170, width: 880, height: 340, rx: 170, fill: "#e8eef8" }, N.cabin);
    el("rect", { x: -400, y: -130, width: 800, height: 260, rx: 130, fill: "#2a3658" }, N.cabin);
    for (var w = 0; w < 7; w++) el("rect", { x: -330 + w * 100, y: -110, width: 40, height: 56, rx: 18, fill: "#9fd8ff" }, N.cabin);
    el("rect", { x: -400, y: 88, width: 800, height: 12, fill: "#3a4a78" }, N.cabin);
    N.p5 = stick(N.cabin, "#FFD22E");
  },
  draw: function (t, c) {
    var o = {}, a = c.a, d = c.drift, k = c.key;
    if (k === "ahora") {
      var tk = cue(0, "kilómetros", .5), te = cue(0, "ecuador", .85), cnt = E.out(seg(t, a + .2, tk + .2));
      tr(N.g0, 540, 900, E.pop(seg(t, a - .01, a + .45)), 0); spinGlobe(N.g0, t, 120);
      op(N.g0.querySelector(".eq"), fade(t, te - .2));
      tr(N.pin, 540 - 120, 900, 1, 0); N.pin.lastChild.setAttribute("transform", "translate(" + (Math.sin(t * 6) * 8) + ",0)"); op(N.pin, fade(t, a + .3));
      o.num = [fmt(Math.round(1670 * cnt)), "km/h", fade(t, a + .1), Math.sin(Math.PI * seg(t, tk + .2, tk + .5)), 300, 160];
      o.head = ["Ahora mismo te mueves a", "", 1, 0];
      o.tags = [["ecuador", 540, 1290 - 50, fade(t, te), "#FFD22E"]];
      o.cam = { s: 1 + .06 * E.inout(d), fx: 540, fy: 940 };
    } else if (k === "gira") {
      var tg = cue(1, "gira", .6);
      tr(N.g1, 540, 900, 1, 0); spinGlobe(N.g1, t, 260);
      tr(N.axis, 540, 900, 1, -23); tr(N.spinArrow, 540, 900, 1, -23); tr(N.spinHead, 540, 900, 1, -23);
      op(N.spinArrow, fade(t, tg - .2)); op(N.spinHead, fade(t, tg));
      o.head = ["Es lo rápido que", "<b>gira la Tierra</b>", rise(t, tg)[0], rise(t, tg)[1]];
      o.tags = [["1 vuelta por día", 540, 1240, fade(t, tg + .3), "#FFD22E"]];
      o.cam = { s: 1.02 + .05 * d, fx: 540, fy: 920 };
    } else if (k === "sol") {
      var ts = cue(2, "sol", .4), tk2 = cue(2, "kilómetros", .7), ang = (t - a) * 1.4;
      var ex = 540 + 400 * Math.cos(ang + 2), ey = 880 + 170 * Math.sin(ang + 2);
      tr(N.g2, ex, ey, E.pop(seg(t, a - .01, a + .4)), 0); spinGlobe(N.g2, t, 60);
      var dpath = "M"; for (var i = 0; i <= 20; i++) { var aa = ang + 2 - i * .05; dpath += (i ? " L" : "") + (540 + 400 * Math.cos(aa)) + " " + (880 + 170 * Math.sin(aa)); }
      N.trail.setAttribute("d", dpath);
      var cnt2 = E.out(seg(t, ts - .2, tk2 + .3));
      o.num = [fmt(Math.round(107000 * cnt2)), "km/h", fade(t, ts - .2), Math.sin(Math.PI * seg(t, tk2 + .3, tk2 + .6)), 300, 150];
      o.head = ["Y alrededor del Sol viaja a", "", 1, 0];
      o.cam = { s: 1 + .05 * d, fx: 540, fy: 900 };
    } else if (k === "porque") {
      tr(N.g3, 540, 1300, 1, 0); spinGlobe(N.g3, t, 80);
      tr(N.p3, 540, 910, 1.3, 0);
      var qp = E.spring(seg(t, a + .2, a + .7)); tr(N.q, 700, 760 + Math.sin(t * 3) * 10, qp, Math.sin(t * 2) * 8); op(N.q, qp > 0 ? 1 : 0);
      o.head = ["¿Por qué", "<b>no lo sientes</b>?", fade(t, a + .05), 0];
      o.cam = { s: 1 + .06 * E.inout(d), fx: 540, fy: 960 };
    } else if (k === "parejo") {
      var tpa = cue(4, "parejo", .35), tfr = cue(4, "frenar", .6), tac = cue(4, "acelerar", .85);
      var fl = E.inout(seg(t, a + .2, tpa + .3));
      N.flat.setAttribute("stroke-dashoffset", 800 * (1 - fl));
      N.bumpy.setAttribute("stroke-dashoffset", 2000 * (1 - E.inout(seg(t, tfr - .2, tac + .3))));
      tr(N.dot, 160 + 800 * fl, 700, 1, 0);
      o.head = ["Porque gira", "siempre <b>parejo</b>", rise(t, tpa)[0], rise(t, tpa)[1]];
      o.tags = [["la Tierra", 820, 650, fade(t, tpa), "#FFD22E"], ["frenar y acelerar", 760, 1060, fade(t, tfr), "#ff5a3a"]];
      o.cam = { s: 1 + .05 * d, fx: 540, fy: 880 };
    } else {
      var tav = cue(5, "avión", .2), tca = cue(5, "caminar", .55), tra = cue(5, "rapidísimo", .85);
      N.clouds.forEach(function (q) { var x = ((q.x - t * q.v) % 1500 + 1500) % 1500 - 200; tr(q.e, x, q.y, 1, 0); });
      tr(N.cabin, 540, 880 + Math.sin(t * 1.2) * 4, E.pop(seg(t, a - .01, a + .4)), 0);
      var wx = lerp(-260, 260, (Math.sin((t - tca) * .9) + 1) / 2);
      tr(N.p5, wx, 60, 1, 0); walk(N.p5, t);
      o.head = tra > t ? ["Como en un avión estable", "caminas <b>tranquilo</b>", rise(t, tca)[0], rise(t, tca)[1]] : ["Aunque vaya", "<b>rapidísimo</b>", 1, rise(t, tra)[1]];
      o.tags = [["900 km/h", 540, 1120, fade(t, tav + .2), "#FFD22E"]];
      o.sky = ["#1f4f9a", "#6fa6e0"]; o.stars = 0;
      o.cam = { s: 1.02 + .06 * d, fx: 540, fy: 900 };
    }
    return o;
  }
};
