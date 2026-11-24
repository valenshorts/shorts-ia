// El matcha se cultiva a la sombra
var N = {};

function teaPlant(parent, width) {
  var g = el("g", {}, parent);
  var w = width || 220;
  el("path", { d: "M" + (-w/2) + " 100 Q0 150 " + (w/2) + " 100 L" + (w/2 - 24) + " 180 L" + (-w/2 + 24) + " 180 Z", fill: "#133a24" }, g);
  for (var i = 0; i < 6; i++) {
    var bx = -w/2.5 + i * (w/5);
    el("path", { d: "M0 80 Q" + bx + " -40 " + (bx*1.2) + " -130 Q" + (bx*0.6) + " -40 0 80", fill: "#19b8b2", opacity: 0.9 }, g);
  }
  return g;
}

function stoneMill(parent) {
  var g = el("g", {}, parent);
  el("rect", { x: -240, y: 160, width: 480, height: 60, rx: 16, fill: "#1a2348" }, g);
  el("ellipse", { cx: 0, cy: 0, rx: 210, ry: 100, fill: "#7a88a8", stroke: "#cfd8ff", "stroke-width": 8 }, g);
  el("ellipse", { cx: 0, cy: -30, rx: 190, ry: 90, fill: "#5a6888" }, g);
  el("rect", { x: -30, y: -60, width: 60, height: 60, rx: 12, fill: "#2a3658" }, g);
  el("circle", { cx: 0, cy: -30, r: 18, fill: "#FFD22E" }, g);
  return g;
}

function cup(parent) {
  var g = el("g", {}, parent);
  el("path", { d: "M-170 -90 L-120 180 Q0 240 120 180 L170 -90 Z", fill: "#f0f4f8" }, g);
  el("ellipse", { cx: 0, cy: -90, rx: 170, ry: 50, fill: "#d9e2ec" }, g);
  el("ellipse", { cx: 0, cy: -98, rx: 145, ry: 40, fill: "#134e32" }, g);
  return g;
}

var V = {
  stars: 160,
  build: function () {
    defs('<linearGradient id="matchaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#19b8b2"/><stop offset="1" stop-color="#134e32"/></linearGradient>' +
         '<radialGradient id="glowG"><stop offset="0" stop-color="#FFD22E" stop-opacity=".7"/><stop offset="1" stop-color="#FFD22E" stop-opacity="0"/></radialGradient>');

    // S0: matcha planta y sombra
    var g0 = sc(0);
    N.plants0 = [];
    for (var i = 0; i < 4; i++) {
      N.plants0.push(teaPlant(g0, 260));
    }
    N.net0 = el("g", {}, g0);
    el("rect", { x: -540, y: -300, width: 1080, height: 600, rx: 30, fill: "#040818", opacity: 0.92 }, N.net0);
    for (var nx = -500; nx <= 500; nx += 50) {
      el("line", { x1: nx, y1: -300, x2: nx, y2: 300, stroke: "#121a3a", "stroke-width": 8 }, N.net0);
    }

    // S1: manos y redes sobre plantas
    var g1 = sc(1);
    N.plants1 = [];
    for (var j = 0; j < 3; j++) {
      N.plants1.push(teaPlant(g1, 280));
    }
    N.nets1 = [];
    for (var n = 0; n < 3; n++) {
      var ng = el("g", {}, g1);
      el("rect", { x: -160, y: -70, width: 320, height: 140, rx: 20, fill: "#1a2348", stroke: "#19b8b2", "stroke-width": 8 }, ng);
      for (var lx = -130; lx <= 130; lx += 30) {
        el("line", { x1: lx, y1: -70, x2: lx, y2: 70, stroke: "#0f172a", "stroke-width": 6 }, ng);
      }
      N.nets1.push(ng);
    }
    N.cal = el("g", {}, g1);
    el("rect", { x: -200, y: -340, width: 400, height: 280, rx: 24, fill: "#f2f5fb", stroke: "#3a4a78", "stroke-width": 10 }, N.cal);
    el("rect", { x: -200, y: -340, width: 400, height: 90, rx: 24, fill: "#ff5a3a" }, N.cal);
    N.calTxt = txt(N.cal, "COSECHA", { y: -290, "font-size": 48, fill: "#ffffff", "font-weight": 900 });
    for (var cd = 0; cd < 3; cd++) {
      el("circle", { cx: -110 + cd * 110, cy: -140, r: 24, fill: "#1a2348" }, N.cal);
    }

    // S2: clorofila y zoom a hoja
    var g2 = sc(2);
    N.leafZoom = el("g", {}, g2);
    el("path", { d: "M0 -380 Q360 0 0 380 Q-360 0 0 -380 Z", fill: "#134e32", stroke: "#19b8b2", "stroke-width": 16 }, N.leafZoom);
    el("path", { d: "M0 -320 L0 320", stroke: "#5fb8ff", "stroke-width": 8, fill: "none" }, N.leafZoom);
    for (var vb = -240; vb <= 240; vb += 120) {
      el("path", { d: "M0 " + vb + " Q120 " + (vb - 60) + " 200 " + (vb - 120), stroke: "#5fb8ff", "stroke-width": 6, fill: "none" }, N.leafZoom);
      el("path", { d: "M0 " + vb + " Q-120 " + (vb - 60) + " -200 " + (vb - 120), stroke: "#5fb8ff", "stroke-width": 6, fill: "none" }, N.leafZoom);
    }
    N.sparks2 = [];
    for (var s = 0; s < 18; s++) {
      N.sparks2.push({
        ph: s / 18,
        e: el("circle", { r: 16, fill: "#FFD22E" }, g2)
      });
    }

    // S3: molino de piedra y polvo
    var g3 = sc(3);
    N.mill = stoneMill(g3);
    N.dust = [];
    for (var d = 0; d < 30; d++) {
      N.dust.push({
        ph: R(),
        x: (R() - 0.5) * 600,
        y: (R() - 0.5) * 300,
        e: el("circle", { r: 10 + R() * 12, fill: "#19b8b2", opacity: 0.8 }, g3)
      });
    }
    N.glow3 = el("circle", { r: 240, fill: "url(#glowG)" }, g3);

    // S4: taza y hoja entera
    var g4 = sc(4);
    N.cup4 = cup(g4);
    N.leafFall = el("g", {}, g4);
    el("path", { d: "M0 -120 Q90 0 0 150 Q-90 0 0 -120 Z", fill: "#19b8b2", stroke: "#ffffff", "stroke-width": 4 }, N.leafFall);
    el("path", { d: "M0 -90 L0 120", stroke: "#ffffff", "stroke-width": 6, fill: "none" }, N.leafFall);
  },

  draw: function (t, c) {
    var o = {}, a = c.a, d = c.drift, k = c.key;

    if (k === "matcha") {
      var ts = cue(0, "sombra", .6);
      N.plants0.forEach(function (p, i) {
        tr(p, -420 + i * 280, 1020 + Math.sin(t * 2 + i) * 12, 1.5, 0);
      });
      var spNet = E.inout(seg(t, ts - .3, ts + .3));
      tr(N.net0, 540, lerp(-300, 960, spNet), 1.2, Math.sin(t) * 3);
      op(N.net0, spNet > 0 ? 1 : 0);
      o.head = ["SECRETO VERDE", "El poder del <b>matcha</b>", 1, 0];
      o.cam = { s: 1 + .06 * E.inout(d), fx: 540, fy: 960 };

    } else if (k === "sombra") {
      var tc = cue(1, "cosecha", .55);
      N.plants1.forEach(function (p, i) {
        tr(p, 180 + i * 360, 1150, 1.4, 0);
      });
      N.nets1.forEach(function (net, i) {
        tr(net, 180 + i * 360, 950 + Math.sin(t * 3 + i) * 10, 1.2, Math.sin(t + i) * 5);
      });
      var cp = E.pop(seg(t, tc - .2, tc + .3));
      tr(N.cal, 540, 560, cp, Math.sin(t * 4) * 5);
      op(N.cal, cp > 0 ? 1 : 0);
      o.head = ["OSCURIDAD TOTAL", "Semanas a la <b>sombra</b>", 1, 0];
      o.tags = [["redes de paja", 540, 1420, fade(t, a + .3), "#19b8b2"]];
      o.cam = { s: 1 + .05 * d, fx: 540, fy: 900 };

    } else if (k === "clorofila") {
      var tcl = cue(2, "clorofila", .4);
      tr(N.leafZoom, 540, 960, 1.5 + 0.12 * Math.sin(t * 3), Math.sin(t * 2) * 5);
      var clActive = fade(t, tcl);
      N.sparks2.forEach(function (s) {
        var p = (t * 1.8 + s.ph) % 1;
        tr(s.e, 540 + Math.cos(s.ph * 12) * 260 * p, 960 + Math.sin(s.ph * 12) * 380 * p, clActive * (1 - p), 0);
      });
      o.head = ["MAGIA NATURAL", "Exceso de <b>clorofila</b>", 1, 0];
      o.cam = { s: 1 + .07 * E.inout(d), fx: 540, fy: 920 };

    } else if (k === "molinos") {
      var tp = cue(3, "polvo", .75);
      tr(N.mill, 540, 980, 1.6, Math.sin(t * 8) * 12);
      tr(N.glow3, 540, 980, 1 + 0.2 * Math.sin(t * 4), 0);
      op(N.glow3, 0.6 + 0.3 * Math.sin(t * 5));
      var dustActive = fade(t, tp);
      N.dust.forEach(function (ds) {
        var p = (t * 2.2 + ds.ph) % 1;
        tr(ds.e, 540 + ds.x * p, 800 - p * 400 + ds.y, dustActive * (1 - p), 0);
      });
      o.head = ["MOLINOS DE PIEDRA", "Hecho en <b>polvo</b>", 1, 0];
      o.tags = [["molido fino", 540, 1400, fade(t, a + .4), "#FFD22E"]];
      o.cam = { s: 1 + .06 * d, fx: 540, fy: 960 };

    } else {
      var th = cue(4, "hoja", .5);
      tr(N.cup4, 540, 1020, 1.5, 0);
      var fallP = seg(t, th - .2, th + .6);
      var fy = lerp(520, 980, E.inout(fallP));
      tr(N.leafFall, 540, fy, 1.2 - 0.4 * fallP, Math.sin(t * 6) * 25);
      op(N.leafFall, fallP > 0 && fallP < 1 ? 1 : (fallP >= 1 ? 0.4 : 0));
      o.head = ["INFUSIÓN PURA", "Te tomás la <b>hoja</b>", 1, 0];
      o.cam = { s: 1.05 + .05 * d, fx: 540, fy: 940 };
    }

    return o;
  }
};

;(function () { var d0 = V.draw; V.draw = function (t, c) {   // vaivén suave de cámara: nunca queda un cuadro quieto
  var o = d0(t, c) || {}; if (!o.cam) o.cam = { s: 1 + .05 * c.drift, fx: 540, fy: 960 };
  o.cam = { s: o.cam.s || 1, fx: (o.cam.fx || 540) + Math.sin(t * 1.2) * 12, fy: (o.cam.fy || 960) + Math.cos(t * .9) * 9 };
  return o; }; })();
