// Las huellas en la Luna duran millones de años (hecho a mano)
var N = {};
function ground(parent, moon) {
  var g = el("g", {}, parent);
  el("rect", { x: -300, y: 940, width: 1680, height: 1200, fill: "url(#" + (moon ? "moonG" : "sandG") + ")" }, g);
  var r = rnd(moon ? 11 : 13);
  if (moon) for (var i = 0; i < 16; i++) {
    var x = r() * 1300 - 100, y = 1050 + r() * 800, w = 30 + r() * 110;
    el("ellipse", { cx: x, cy: y, rx: w, ry: w * .32, fill: "#55555f", opacity: .7 }, g);
    el("ellipse", { cx: x, cy: y - w * .06, rx: w * .86, ry: w * .24, fill: "#6e6e7a" }, g);
  }
  return g;
}
function sole(parent, color) {
  var g = el("g", {}, parent), f = el("g", {}, g);
  var d = "M-50 -125 Q-62 -60 -46 -10 Q-36 30 -42 70 Q-42 128 0 130 Q42 128 42 70 Q36 30 46 -10 Q62 -60 50 -125 Q0 -150 -50 -125 Z";
  el("path", { d: d, fill: "#d8d8e2", transform: "translate(6,-8)" }, f);
  el("path", { d: d, fill: color || "#3c3c48" }, f);
  for (var y = -112; y < 120; y += 17) el("path", { d: "M-38 " + y + " L-12 " + (y - 6) + " L12 " + (y - 6) + " L38 " + y, stroke: "#5a5a68", "stroke-width": 5, fill: "none" }, f);
  g.f = f; return g;
}
function cross(parent, icon) {
  var g = el("g", {}, parent);
  el("circle", { r: 70, fill: "#0b1640", stroke: "#ffffff", "stroke-width": 5 }, g);
  if (icon === "viento") for (var k = 0; k < 3; k++) el("path", { d: "M-40 " + (-22 + k * 22) + " q30 -16 56 0 q14 10 4 18", stroke: "#bff4ff", "stroke-width": 7, fill: "none", "stroke-linecap": "round" }, g);
  else for (var j = 0; j < 4; j++) el("line", { x1: -30 + j * 20, y1: -26, x2: -40 + j * 20, y2: 26, stroke: "#6fb8ff", "stroke-width": 7, "stroke-linecap": "round" }, g);
  el("path", { d: "M-58 -58 L58 58", stroke: "#ff3b5c", "stroke-width": 12, "stroke-linecap": "round" }, g);
  return g;
}
function earth(parent, r) {
  var g = el("g", {}, parent);
  el("circle", { r: r, fill: "#2a6fd6" }, g);
  el("path", { d: "M" + (-r * .5) + " " + (-r * .3) + " q" + (r * .3) + " " + (-r * .4) + " " + (r * .6) + " " + (-r * .1) + " q" + (r * .2) + " " + (r * .3) + " " + (-r * .1) + " " + (r * .5) + " q" + (-r * .4) + " " + (r * .1) + " " + (-r * .5) + " " + (-r * .4) + " Z", fill: "#3fbf7a" }, g);
  el("circle", { r: r, fill: "url(#shadeE)" }, g);
  return g;
}
var V = {
  stars: 180,
  build: function () {
    defs('<linearGradient id="moonG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6a6b2"/><stop offset=".5" stop-color="#7c7c88"/><stop offset="1" stop-color="#4a4a56"/></linearGradient>' +
      '<linearGradient id="sandG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8c98e"/><stop offset="1" stop-color="#b8925a"/></linearGradient>' +
      '<radialGradient id="shadeE" cx=".35" cy=".35" r=".8"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>');
    // S0, S1, S3, S4, S5: Luna
    [0, 1, 3, 4, 5].forEach(function (i) {
      var g = sc(i), o = N["m" + i] = {};
      o.earth = earth(g, i === 5 ? 120 : 70); o.ground = ground(g, true);
      o.print = sole(g); o.trail = [];
      if (i === 5) for (var k = 0; k < 7; k++) { var b = sole(g); o.trail.push(b); }
    });
    // S1: contador
    N.clock = el("g", {}, sc(1));
    el("circle", { r: 90, fill: "#0b1640", stroke: "#FFD22E", "stroke-width": 8 }, N.clock);
    N.hand = el("line", { x1: 0, y1: 0, x2: 0, y2: -66, stroke: "#FFD22E", "stroke-width": 10, "stroke-linecap": "round" }, N.clock);
    // S2: Tierra (playa) con viento y lluvia
    var g2 = sc(2); N.sand = ground(g2, false); N.ep = sole(g2, "#a07a46"); N.wind = []; N.rain = [];
    for (var w = 0; w < 7; w++) N.wind.push({ y: 500 + w * 110, ph: R(), e: el("path", { d: "M0 0 q60 -30 120 0 q60 30 120 0", stroke: "#ffffff", "stroke-width": 7, fill: "none", "stroke-linecap": "round", opacity: .6 }, g2) });
    for (var q = 0; q < 50; q++) N.rain.push({ x: R() * 1200, y: R() * 1600, v: 1200 + R() * 400, e: el("line", { stroke: "#bfe6ff", "stroke-width": 5, "stroke-linecap": "round", opacity: .8 }, g2) });
    // S3: sin viento ni lluvia
    N.xw = cross(sc(3), "viento"); N.xr = cross(sc(3), "lluvia");
    // S4: piedritas del espacio
    N.meteo = [];
    for (var m = 0; m < 6; m++) N.meteo.push({ x: 180 + R() * 720, ph: R(), e: el("line", { stroke: "#FFD22E", "stroke-width": 5, "stroke-linecap": "round" }, sc(4)), p: el("circle", { r: 10, fill: "#d9d9e3" }, sc(4)) });
    // S5: módulo lunar (silueta simple)
    N.lander = el("g", {}, sc(5));
    el("path", { d: "M-70 -40 L70 -40 L50 -110 L-50 -110 Z", fill: "#c9b26a" }, N.lander);
    el("rect", { x: -60, y: -40, width: 120, height: 36, fill: "#d9d9e3" }, N.lander);
    [[-60, -4, -100, 50], [60, -4, 100, 50]].forEach(function (l) { el("line", { x1: l[0], y1: l[1], x2: l[2], y2: l[3], stroke: "#d9d9e3", "stroke-width": 8 }, N.lander); });
  },
  draw: function (t, c) {
    var o = { sky: ["#03050f", "#0a0f26"] }, a = c.a, d = c.drift, k = c.key, m = N["m" + c.si];
    function moonBase(eX, eY, ps, pr) {
      tr(m.earth, eX, eY, 1, 0); tr(m.ground, 0, 0, 1, 0);
      tr(m.print, 540, 1110, 1, 0); m.print.f.setAttribute("transform", "scale(" + ps + "," + (ps * .5) + ") rotate(-62)");
    }
    if (k === "huellas") {
      moonBase(820, 560, 1.6 * E.pop(seg(t, a - .01, a + .4)));
      o.head = ["En la Luna", "las huellas <b>siguen ahí</b>", 1, 0];
      o.tags = [["huella de 1969", 540, 1225, fade(t, cue(0, "astronautas", .5)), "#FFD22E"]];
      o.cam = { s: 1 + .1 * E.inout(d), fx: 540, fy: lerp(960, 1020, d) };
    } else if (k === "millones") {
      moonBase(820, 560, 1.6);
      var tm = cue(1, "millones", .5), cn = E.inq(seg(t, a + .1, tm + .4));
      tr(N.clock, 540, 760, E.pop(seg(t, a - .01, a + .35)), 0);
      N.hand.setAttribute("transform", "rotate(" + (t * 900) + ")");
      o.num = [fmt(Math.round(cn * 3000000)), "años", fade(t, a), Math.sin(Math.PI * seg(t, tm + .4, tm + .7)), 330, 130];
      o.head = ["Podrían durar", "", 1, 0];
      o.cam = { s: 1.05 + .05 * d, fx: 540, fy: 980 };
    } else if (k === "tierra") {
      var tv = cue(2, "viento", .3), tl = cue(2, "lluvia", .5), tb = cue(2, "borran", .8);
      tr(N.ep, 540, 1110, 1, 0); N.ep.f.setAttribute("transform", "scale(1.6,.8) rotate(-62)");
      op(N.ep, 1 - E.inout(seg(t, tv, tb + .3)) * .95);
      N.wind.forEach(function (q) { var x = ((t * 700 + q.ph * 1400) % 1400) - 300; tr(q.e, x, q.y, 1, 0); op(q.e, .6 * fade(t, tv - .2)); });
      N.rain.forEach(function (q) { var y = (q.y + t * q.v) % 1700 - 100; q.e.setAttribute("x1", q.x); q.e.setAttribute("x2", q.x - 18); q.e.setAttribute("y1", y); q.e.setAttribute("y2", y + 60); op(q.e, .8 * fade(t, tl - .2)); });
      o.sky = ["#5a7ab8", "#c9d6ee"]; o.stars = 0;
      o.head = ["En la Tierra", "viento y lluvia <b>las borran</b>", rise(t, tv)[0], rise(t, tv)[1]];
      o.tags = [["Tierra", 540, 1225, fade(t, a + .2), "#3fbf7a"]];
      o.cam = { s: 1.02 + .06 * d, fx: 540, fy: 1000 };
    } else if (k === "sinaire") {
      moonBase(820, 560, 1.6);
      var tw = cue(3, "viento", .5), tr2 = cue(3, "lluvia", .65);
      var xw = E.spring(seg(t, tw - .1, tw + .4)), xr = E.spring(seg(t, tr2 - .1, tr2 + .4));
      tr(N.xw, 330, 720 + Math.sin(t * 2) * 8, 1.4 * xw, 0); op(N.xw, xw > 0 ? 1 : 0);
      tr(N.xr, 750, 720 + Math.sin(t * 2 + 1) * 8, 1.4 * xr, 0); op(N.xr, xr > 0 ? 1 : 0);
      o.head = ["La Luna", "<b>no tiene aire</b>", fade(t, a + .1), 0];
      o.tags = [["sin viento", 330, 860, fade(t, tw + .2), "#bff4ff"], ["sin lluvia", 750, 860, fade(t, tr2 + .2), "#6fb8ff"]];
      o.cam = { s: 1 + .08 * E.inout(d), fx: 540, fy: 960 };
    } else if (k === "piedras") {
      moonBase(820, 560, 1.6);
      var tp = cue(4, "piedras", .4), tlen = cue(4, "lento", .85), slow = lerp(1, .25, seg(t, tlen - .4, tlen + .2));
      N.meteo.forEach(function (q, i) {
        var per = 1.6, ph = ((t - a) * slow / per + q.ph) % 1, x = q.x, yEnd = 1100 + i * 30;
        var y = lerp(380, yEnd, ph);
        q.e.setAttribute("x1", x - 60 * (1 - ph) - 20); q.e.setAttribute("y1", y - 120); q.e.setAttribute("x2", x); q.e.setAttribute("y2", y);
        op(q.e, seg(t, tp - .5, tp) * (ph < .92 ? 1 : 0)); tr(q.p, x, yEnd, ph > .92 ? (ph - .92) * 25 : 0, 0); op(q.p, ph > .92 ? (1 - ph) * 10 : 0);
      });
      o.head = tlen > t ? ["Solo la borran", "<b>piedritas del espacio</b>", rise(t, tp)[0], rise(t, tp)[1]] : ["Y eso pasa", "muy <b>lento</b>", 1, rise(t, tlen)[1]];
      o.tags = [["micrometeoritos", 540, 1225, fade(t, tp + .2), "#FFD22E"]];
      o.cam = { s: 1.04 + .05 * d, fx: 540, fy: 960 };
    } else {
      tr(m.earth, 760, lerp(760, 560, d), 1, 0); tr(m.ground, 0, 0, 1, 0);
      tr(m.print, -500, -500, 0, 0);
      m.trail.forEach(function (b, i) {
        var p = E.pop(seg(t, a + i * .12, a + i * .12 + .35)), x = 220 + i * 95, y = 1500 - i * 70, s = 1 - i * .08;
        tr(b, x + (i % 2 ? 26 : -26), y - 60, 1, 0); b.f.setAttribute("transform", "scale(" + (s * .9 * p) + "," + (s * .45 * p) + ") rotate(-62)"); op(b, p > 0 ? 1 : 0);
      });
      tr(N.lander, 890, 1040, 1, 0);
      var tl2 = cue(5, "llegamos", .8);
      o.head = ["Seguirán marcando", "el día que <b>llegamos</b>", rise(t, tl2)[0], rise(t, tl2)[1]];
      o.cam = { s: 1.1 - .1 * d, fx: lerp(500, 560, d), fy: 980 };
    }
    return o;
  }
};
