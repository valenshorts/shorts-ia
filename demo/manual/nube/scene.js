// Cuánto pesa una nube (hecho a mano)
var N = {};
function cloud(parent, dark) {
  var g = el("g", {}, parent);
  var puffs = [[-210, 40, 110], [-110, -30, 150], [40, -70, 170], [180, -10, 140], [270, 50, 100], [-20, 50, 150], [120, 60, 130], [-160, 70, 110]];
  puffs.forEach(function (p) { el("circle", { cx: p[0], cy: p[1] + 22, r: p[2], fill: dark ? "#3c4a6a" : "#b9c8e6" }, g); });
  puffs.forEach(function (p) { el("circle", { cx: p[0], cy: p[1], r: p[2], fill: "url(#" + (dark ? "cloudD" : "cloudW") + ")" }, g); });
  return g;
}
function elephant(parent) {
  var g = el("g", {}, parent), c = "#9aa6c4";
  el("ellipse", { cx: 0, cy: 0, rx: 40, ry: 27, fill: c }, g);
  el("circle", { cx: 38, cy: -12, r: 21, fill: c }, g);
  el("ellipse", { cx: 30, cy: -12, rx: 13, ry: 17, fill: "#8290b2" }, g);
  el("path", { d: "M52 -6 Q66 10 58 28", stroke: c, "stroke-width": 9, fill: "none", "stroke-linecap": "round" }, g);
  [-26, -10, 12, 26].forEach(function (x) { el("rect", { x: x - 6, y: 14, width: 12, height: 22, rx: 4, fill: c }, g); });
  return g;
}
function drop(parent, r, color) {
  return el("path", { d: "M0 " + (-r * 1.5) + " C" + (r * .9) + " " + (-r * .3) + " " + r + " " + (r * .2) + " " + r + " " + (r * .45) +
    " A" + r + " " + r + " 0 1 1 " + (-r) + " " + (r * .45) + " C" + (-r) + " " + (r * .2) + " " + (-r * .9) + " " + (-r * .3) + " 0 " + (-r * 1.5) + " Z", fill: color || "url(#dropG)" }, parent);
}
var V = {
  stars: 60,
  build: function () {
    defs('<radialGradient id="cloudW" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#eef3fb"/><stop offset="1" stop-color="#d3def0"/></radialGradient>' +
      '<radialGradient id="cloudD" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#8a96b2"/><stop offset="1" stop-color="#4a587a"/></radialGradient>' +
      '<linearGradient id="dropG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9f4ff"/><stop offset="1" stop-color="#3fa0e8"/></linearGradient>' +
      '<linearGradient id="warm" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff9d4a" stop-opacity=".9"/><stop offset="1" stop-color="#ffd22e" stop-opacity="0"/></linearGradient>');
    // S0: la nube y el peso
    N.c0 = cloud(sc(0)); N.w0 = el("g", {}, sc(0));
    el("path", { d: "M0 0 L0 120", stroke: "#ffffff", "stroke-width": 5, "stroke-dasharray": "10 8" }, N.w0);
    el("path", { d: "M-80 120 L80 120 L110 260 L-110 260 Z", fill: "#2a3658", stroke: "#FFD22E", "stroke-width": 6 }, N.w0);
    txt(N.w0, "500 t", { y: 212, "font-size": 64, "font-weight": 900, fill: "#FFD22E" });
    // S1: balanza nube vs 100 elefantes
    var g1 = sc(1); N.bal = { post: el("g", {}, g1) };
    el("rect", { x: 528, y: 760, width: 24, height: 420, fill: "#9fb4d8" }, N.bal.post);
    el("path", { d: "M440 1180 L640 1180 L600 1140 L480 1140 Z", fill: "#9fb4d8" }, N.bal.post);
    N.bal.beam = el("g", {}, g1);
    el("rect", { x: -320, y: -10, width: 640, height: 20, rx: 10, fill: "#cfd8ff" }, N.bal.beam);
    el("circle", { r: 22, fill: "#FFD22E" }, N.bal.beam);
    N.bal.panL = el("g", {}, g1); N.bal.panR = el("g", {}, g1);
    [N.bal.panL, N.bal.panR].forEach(function (p) {
      el("line", { x1: -150, y1: 0, x2: 0, y2: -200, stroke: "#cfd8ff", "stroke-width": 4 }, p);
      el("line", { x1: 150, y1: 0, x2: 0, y2: -200, stroke: "#cfd8ff", "stroke-width": 4 }, p);
      el("path", { d: "M-170 0 L170 0 Q150 40 0 44 Q-150 40 -170 0 Z", fill: "#2a3658", stroke: "#9fb4d8", "stroke-width": 4 }, p);
    });
    N.c1 = cloud(N.bal.panL); tr(N.c1, 0, -95, .42, 0);
    N.els = [];
    for (var i = 0; i < 100; i++) { var e = elephant(N.bal.panR); N.els.push({ e: e, x: -144 + (i % 10) * 32, y: -16 - Math.floor(i / 10) * 21 }); }
    // S2: millones de gotitas separadas
    var g2 = sc(2);
    N.c2 = cloud(g2); N.lens = el("g", {}, g2);
    el("circle", { r: 300, fill: "#0a1640", stroke: "#ffffff", "stroke-width": 8 }, N.lens);
    defs('<clipPath id="lc"><circle r="292"/></clipPath>');
    var lg = el("g", { "clip-path": "url(#lc)" }, N.lens); N.drops = [];
    for (var j = 0; j < 26; j++) N.drops.push({ x: (R() - .5) * 520, y: (R() - .5) * 520, ph: R() * 6.3, e: drop(lg, 9) });
    N.dist = el("line", { stroke: "#FFD22E", "stroke-width": 4, "stroke-dasharray": "10 8" }, lg);
    // S3: el aire caliente sostiene la gota
    var g3 = sc(3); N.air = [];
    for (var k = 0; k < 9; k++) N.air.push({ x: 300 + (k % 3) * 240 + (R() - .5) * 60, ph: R(), e: el("path", { d: "M0 0 q-24 -50 0 -100 q24 -50 0 -100", stroke: "url(#warm)", "stroke-width": 12, fill: "none", "stroke-linecap": "round" }, g3) });
    N.d3 = drop(g3, 60); N.up = el("g", {}, g3);
    el("path", { d: "M0 0 L0 -150 M-30 -118 L0 -150 L30 -118", stroke: "#ff9d4a", "stroke-width": 16, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, N.up);
    N.down = el("g", {}, g3);
    el("path", { d: "M0 0 L0 60 M-14 46 L0 60 L14 46", stroke: "#bff4ff", "stroke-width": 8, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, N.down);
    // S4: se juntan, crecen y caen
    var g4 = sc(4); N.c4 = cloud(g4, false); N.small = [];
    for (var m = 0; m < 8; m++) { var an = m / 8 * 6.283; N.small.push({ a: an, e: drop(g4, 16) }); }
    N.big = drop(g4, 48);
    // S5: lluvia
    var g5 = sc(5); N.c5 = cloud(g5, true); N.rain = [];
    for (var q = 0; q < 60; q++) N.rain.push({ x: R() * 1180 - 50, y: R() * 1400, v: 1100 + R() * 500, e: el("line", { stroke: "#9fd8ff", "stroke-width": 5, "stroke-linecap": "round", opacity: .8 }, g5) });
  },
  draw: function (t, c) {
    var o = { sky: ["#0f2a6a", "#2f5fae"] }, a = c.a, b = c.b, d = c.drift, k = c.key;
    if (k === "peso") {
      var tt = cue(0, "toneladas", .7), wp = E.spring(seg(t, tt - .3, tt + .2));
      tr(N.c0, 540, 800 + Math.sin(t * 1.3) * 12, E.pop(seg(t, a - .01, a + .4)), 0);
      tr(N.w0, 540, 990 + 180 * (1 - wp), 1, Math.sin(t * 2) * 3); op(N.w0, seg(t, tt - .3, tt - .1));
      var cnt = seg(t, a + .3, tt + .3);
      o.num = [fmt(Math.round(500 * cnt)), "toneladas", fade(t, a + .2), Math.sin(Math.PI * seg(t, tt + .3, tt + .6)), 250];
      o.head = ["Una nube normal pesa", "", 1, 0];
      o.cam = { s: 1 + .06 * E.inout(d), fx: 540, fy: 930 };
    } else if (k === "elefantes") {
      var te = cue(1, "elefantes", .6), fill = seg(t, a + .15, te + .2);
      var ang = lerp(-8, 0, E.inout(fill));
      tr(N.bal.beam, 540, 760, 1, ang);
      var rad = ang * Math.PI / 180;
      tr(N.bal.panL, 540 - 300 * Math.cos(rad), 760 - 300 * Math.sin(rad) + 200, 1, 0);
      tr(N.bal.panR, 540 + 300 * Math.cos(rad), 760 + 300 * Math.sin(rad) + 200, 1, 0);
      N.els.forEach(function (q, i) { var p = E.spring(seg(t, a + .15 + fill * 0 + i / 100 * (te + .2 - a - .15), a + .35 + i / 100 * (te + .2 - a - .15))); tr(q.e, q.x, q.y, .4 * p, 0); op(q.e, p > 0 ? 1 : 0); });
      var p100 = Math.round(100 * fill);
      o.num = [p100 + "", "elefantes", fade(t, a + .1), Math.sin(Math.PI * seg(t, te + .2, te + .5)), 250];
      o.head = ["Lo mismo que", "", 1, 0];
      o.tags = [["nube", 240, 1030, fade(t, a + .2), "#bff4ff"], ["100 elefantes", 840, 1060, fade(t, te + .2), "#FFD22E"]];
      o.cam = { s: 1.02 + .05 * E.inout(d), fx: 540, fy: 960 };
    } else if (k === "gotitas") {
      var tg = cue(2, "gotitas", .5), tes = cue(2, "espacio", .8), zo = E.inout(seg(t, a, a + .9));
      tr(N.c2, 540, 820, lerp(1, 2.4, zo), 0); op(N.c2, 1 - seg(t, a + .8, a + 1.2));
      var lp = E.spring(seg(t, Math.min(tg - .4, a + .8), Math.min(tg - .4, a + .8) + .6));
      tr(N.lens, 540, 860, lp, 0); op(N.lens, lp > 0 ? 1 : 0);
      var sp = lerp(.55, 1, E.inout(seg(t, tg, tes + .3)));
      N.drops.forEach(function (q) { tr(q.e, q.x * sp + Math.sin(t * 1.4 + q.ph) * 6, q.y * sp + Math.cos(t * 1.2 + q.ph) * 6, 1, 0); });
      var dl = fade(t, tes);
      N.dist.setAttribute("x1", N.drops[0].x * sp); N.dist.setAttribute("y1", N.drops[0].y * sp);
      N.dist.setAttribute("x2", N.drops[1].x * sp); N.dist.setAttribute("y2", N.drops[1].y * sp); op(N.dist, dl);
      o.head = tes > t ? ["Pero en realidad son", "millones de <b>gotitas</b>", rise(t, tg)[0], rise(t, tg)[1]] : ["Y entre gotita y gotita", "mucho <b>espacio</b>", 1, rise(t, tes)[1]];
      o.tags = [["gotitas diminutas", 540, 1210, fade(t, tg + .2) * (1 - dl), "#19B8B2"], ["espacio vacío", 540, 1210, dl, "#FFD22E"]];
      o.note = ["ilustración: escala exagerada", fade(t, tg)];
      o.cam = { s: 1 + .08 * E.inout(d), fx: 540, fy: 900 };
    } else if (k === "aire") {
      var ta = cue(3, "aire", .5), tar = cue(3, "arriba", .85);
      N.air.forEach(function (q) {
        var y = 1300 - ((t * 260 + q.ph * 900) % 900);
        tr(q.e, q.x, y, 1, 0); op(q.e, seg(t, ta - .3, ta) * Math.min(1, (1300 - y) / 200, (y - 400) / 200));
      });
      var hover = Math.sin(t * 3) * 14;
      tr(N.d3, 540, 820 + hover - 40 * fade(t, ta), 1.6 * E.pop(seg(t, a - .01, a + .4)), 0);
      tr(N.up, 540, 1060 + hover, fade(t, ta) * (1 + .08 * Math.sin(t * 6)), 0); op(N.up, fade(t, ta));
      tr(N.down, 540, 900 + hover, .9, 0); op(N.down, fade(t, a + .3));
      o.head = ["Cada gotita es tan liviana que", "el aire la <b>sostiene</b>", rise(t, tar)[0], rise(t, tar)[1]];
      o.tags = [["peso", 640, 960, fade(t, a + .4), "#bff4ff"], ["aire caliente", 760, 1150, fade(t, ta + .2), "#ff9d4a"]];
      o.cam = { s: 1.02 + .08 * E.inout(d), fx: 540, fy: 920 };
    } else if (k === "caen") {
      var tj = cue(4, "juntan", .3), tgr = cue(4, "grandes", .5), tc = cue(4, "caen", .85);
      tr(N.c4, 540, 640, .9, 0);
      var mj = E.inout(seg(t, tj - .2, tgr));
      N.small.forEach(function (q) { tr(q.e, 540 + Math.cos(q.a + t) * 170 * (1 - mj), 900 + Math.sin(q.a + t) * 110 * (1 - mj), 1, 0); op(q.e, 1 - seg(mj, .85, 1)); });
      var fall = seg(t, tc - .1, tc + .6);
      tr(N.big, 540, 900 + 900 * fall * fall, E.spring(seg(t, tgr - .1, tgr + .3)), 0); op(N.big, seg(mj, .8, 1));
      o.head = fall > 0 ? ["Pesan demasiado y", "<b>caen</b>", 1, rise(t, tc)[1]] : ["Cuando se juntan", "se hacen <b>grandes</b>", rise(t, tj)[0], rise(t, tj)[1]];
      o.cam = { s: 1 + .06 * d, fx: 540, fy: lerp(920, 980, fall) };
    } else {
      var tl = cue(5, "lluvia", .4);
      tr(N.c5, 540, 620 + Math.sin(t) * 8, lerp(1.15, 1.05, d), 0);
      N.rain.forEach(function (q) {
        var y = (q.y + t * q.v) % 1500 + 650;
        q.e.setAttribute("x1", q.x); q.e.setAttribute("x2", q.x - 14); q.e.setAttribute("y1", y); q.e.setAttribute("y2", y + 70);
        op(q.e, .85 * seg(t, a, a + .25));
      });
      o.head = ["Y eso es", "la <b>lluvia</b>", fade(t, tl - .2), 0];
      o.sky = ["#141c3c", "#2c3a62"]; o.stars = 0;
      o.cam = { s: 1.05 - .05 * E.out(d), fx: 540, fy: 940 };
    }
    return o;
  }
};
