// Por qué se te tapan los oídos en el avión
var N = {};

function planeDetailed(parent) {
  var g = el("g", {}, parent);
  // Avión vectorial grande, centrado y estilizado
  el("path", { d: "M-220 -60 Q0 -90 220 -60 Q250 0 220 60 Q0 90 -220 60 Q-250 0 -220 -60 Z", fill: "#f4f8fb" }, g);
  el("path", { d: "M-40 60 L-140 180 L-80 180 L10 70 Z", fill: "#5fb8ff" }, g);
  el("path", { d: "M-160 0 L-300 30 L-270 -15 Z", fill: "#ff5a3a" }, g);
  // Ventanas del avión
  for (var i = -2; i <= 2; i++) {
    el("ellipse", { cx: i * 45, cy: -8, rx: 12, ry: 16, fill: "#121936" }, g);
  }
  return g;
}

function throatTubeDetailed(parent) {
  var g = el("g", {}, parent);
  el("path", { d: "M-90 -120 Q0 -160 90 -120 L75 140 Q0 180 -75 140 Z", fill: "#f2c9a0" }, g);
  el("path", { d: "M-40 -30 Q0 20 40 -30 L30 100 Q0 130 -30 100 Z", fill: "#e5b388" }, g);
  g.tube = el("path", { d: "M-15 15 Q-90 50 -140 110", stroke: "#ff8aa6", "stroke-width": 22, fill: "none", "stroke-linecap": "round" }, g);
  el("path", { d: "M-15 15 Q-90 50 -140 110", stroke: "#ffffff", "stroke-width": 8, fill: "none", "stroke-linecap": "round", opacity: .6 }, g);
  return g;
}

function earDetailed(parent) {
  var g = el("g", {}, parent);
  el("path", { d: "M-120 -240 Q140 -260 160 -20 Q140 260 -120 280 Q-180 220 -160 0 Q-180 -220 -120 -240 Z", fill: "#f2c9a0" }, g);
  el("path", { d: "M-100 -180 Q100 -200 110 0 Q100 180 -100 200 Q-130 140 -110 0 Q-130 -140 -100 -180 Z", fill: "#e5b388" }, g);
  g.chamber = el("ellipse", { cx: 10, cy: -10, rx: 75, ry: 95, fill: "#5fb8ff", opacity: .85 }, g);
  el("ellipse", { cx: -5, cy: -25, rx: 35, ry: 45, fill: "#9fe0ff", opacity: .5 }, g);
  el("path", { d: "M-30 80 Q-80 160 -130 280", stroke: "#19B8B2", "stroke-width": 18, fill: "none", "stroke-linecap": "round" }, g);
  el("path", { d: "M-30 80 Q-80 160 -130 280", stroke: "#ffffff", "stroke-width": 6, fill: "none", "stroke-linecap": "round", opacity: .6 }, g);
  g.bubbles = [];
  for(var i=0; i<4; i++) {
    g.bubbles.push(el("circle", { cx: -10 + i*15, cy: -30 + (i%2)*25, r: 8 + i*2, fill: "#ffffff", opacity: .6 }, g));
  }
  return g;
}

function realisticEardrum(parent) {
  var g = el("g", {}, parent);
  // Canal auditivo seccionado con claridad anatómica
  el("rect", { x: -280, y: -160, width: 560, height: 320, rx: 160, fill: "#152652", stroke: "#5fb8ff", "stroke-width": 8 }, g);
  el("ellipse", { cx: -180, cy: 0, rx: 50, ry: 110, fill: "#243c75" }, g);

  // Cadenecita de huesecillos (martillo, yunque, estribo) conectados al tímpano
  el("path", { d: "M-130 -80 L-50 -30 L0 -90", stroke: "#cfd8ff", "stroke-width": 12, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
  el("circle", { cx: -50, cy: -30, r: 20, fill: "#e2eafc" }, g);

  // Membrana del Tímpano clara, translúcida y cóncava
  g.drumMembrane = el("path", { d: "M-120 -130 Q-60 0 -120 130 Q-90 0 -120 -130 Z", fill: "#ff8aa6", opacity: .9 }, g);
  el("path", { d: "M-115 -100 Q-75 0 -115 100", stroke: "#ffcfd8", "stroke-width": 6, fill: "none", "stroke-linecap": "round" }, g);

  // Flecha de presión exterior empujando fuertemente el tímpano hacia adentro
  g.pushArrow = el("path", { d: "M-250 0 L-140 0 M-180 -40 L-140 0 L-180 40", stroke: "#ff5a3a", "stroke-width": 16, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
  return g;
}

function cryingBaby(parent) {
  var g = el("g", {}, parent);
  el("path", { d: "M-70 -30 Q0 -140 70 -30 Z", fill: "#ff8aa6" }, g);
  el("circle", { cx: 0, cy: -140, r: 16, fill: "#ff5a3a" }, g);
  el("circle", { cx: 0, cy: 20, r: 90, fill: "#f2c9a0" }, g);
  el("path", { d: "M-45 0 Q-30 -20 -15 0 M15 0 Q30 -20 45 0", stroke: "#3a2a20", "stroke-width": 8, fill: "none", "stroke-linecap": "round" }, g);
  g.tearL = el("path", { d: "M-35 15 Q-40 40 -35 55 Q-30 40 -35 15", fill: "#5fb8ff" }, g);
  g.tearR = el("path", { d: "M35 15 Q30 40 35 55 Q40 40 35 15", fill: "#5fb8ff" }, g);
  g.mouth = el("ellipse", { cx: 0, cy: 65, rx: 22, ry: 28, fill: "#7a2a2a" }, g);
  el("path", { d: "M-70 100 Q0 80 70 100 L90 220 L-90 220 Z", fill: "#5fb8ff" }, g);
  return g;
}

var V = {
  stars: 120,
  build: function () {
    defs('<linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD22E" stop-opacity=".9"/><stop offset="1" stop-color="#FFD22E" stop-opacity=".2"/></linearGradient>' +
         '<linearGradient id="airStream" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb8ff" stop-opacity="0"/><stop offset=".5" stop-color="#5fb8ff" stop-opacity="0.8"/><stop offset="1" stop-color="#5fb8ff" stop-opacity="0"/></linearGradient>');

    // S0: tubito y avión grandes y conectados
    var g0 = sc(0);
    N.plane0 = planeDetailed(g0);
    N.throat0 = throatTubeDetailed(g0);
    N.connectLine = el("path", { d: "M540 760 L540 1060", stroke: "#5fb8ff", "stroke-width": 12, "stroke-dasharray": "16 16", fill: "none", opacity: .8 }, g0);

    // S1: cámara detallada
    var g1 = sc(1);
    N.ear1 = earDetailed(g1);

    // S2: presión con nubes y flechas
    var g2 = sc(2);
    N.arrows2 = [];
    for (var i = 0; i < 6; i++) {
      N.arrows2.push(el("path", { d: "M0 -40 L0 40 M-15 15 L0 40 L15 15", stroke: "#ff5a3a", "stroke-width": 8, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round", opacity: .9 }, g2));
    }
    N.cloud2 = el("path", { d: "M-220 0 Q-220 -120 0 -120 Q160 -120 200 -30 Q280 -30 280 60 Q280 150 200 150 L-200 150 Q-280 150 -280 60 Q-280 0 -220 0 Z", fill: "url(#cloudGrad)" }, g2);

    // S3: Tímpano realista y rediseñado
    var g3 = sc(3);
    N.drum3 = realisticEardrum(g3);

    // S4: pop y alivio con garganta completa y estrella brillante
    var g4 = sc(4);
    N.throat4 = throatTubeDetailed(g4);
    N.star4 = el("path", { d: "M0 -60 L16 -18 L55 -18 L24 6 L36 48 L0 24 L-36 48 L-24 6 L-55 -18 L-16 -18 Z", fill: "#FFD22E" }, g4);
    N.rings4 = [];
    for(var r=0; r<3; r++) {
      N.rings4.push(el("circle", { r: 30 + r*35, fill: "none", stroke: "#FFD22E", "stroke-width": 6, opacity: 0 }, g4));
    }

    // S5: bebé llorando detallado y notas musicales
    var g5 = sc(5);
    N.baby5 = cryingBaby(g5);
    N.notes5 = [];
    for (var j = 0; j < 6; j++) {
      var ng = el("g", {}, g5);
      el("text", { "font-size": 42, fill: "#ff8aa6", "font-weight": 900 }, ng).textContent = j%2 ? "♫" : "♬";
      N.notes5.push({ ph: j / 6, e: ng });
    }
  },

  draw: function (t, c) {
    var o = {}, a = c.a, d = c.drift, k = c.key;

    if (k === "tubito") {
      var tc = cue(0, "tubito", .75);
      var hover = Math.sin(t * 3) * 18;
      tr(N.plane0, 540 + Math.sin(t * 2) * 25, 620 + hover, lerp(1, 1.12, d), Math.sin(t) * 8);
      var tp = E.spring(seg(t, tc - .3, tc + .3));
      tr(N.throat0, 540, 1220, tp, 0);
      op(N.throat0, tp > 0 ? 1 : 0);
      tr(N.connectLine, 540, 930, 1, 0);
      op(N.connectLine, tp);
      o.head = ["curiosidades aereas", "el secreto del <b>tubito</b>", 1, 15];
      o.cam = { s: 1 + .06 * E.inout(d), fx: 540, fy: 960 };

    } else if (k === "camara") {
      var tcam = cue(1, "cámara", .4);
      tr(N.ear1, 540, 950, 1.25, 0);
      var pulse = 1 + .12 * Math.sin(t * 8) * fade(t, tcam);
      N.ear1.chamber.setAttribute("transform", "scale(" + pulse + ")");
      N.ear1.bubbles.forEach(function(b, i) {
        tr(b, -10 + (i*12) + Math.sin(t*4 + i)*8, -30 + (i*15) + Math.cos(t*3)*6, 1 + 0.2*Math.sin(t*5 + i), 0);
      });
      o.head = ["anatomia de vuelo", "la camara de <b>aire</b>", rise(t, tcam)[0], rise(t, tcam)[1] + 15];
      o.cam = { s: 1 + .05 * d, fx: 540, fy: 920 };

    } else if (k === "presion") {
      var tpr = cue(2, "presión", .5);
      N.arrows2.forEach(function (ar, i) {
        var p = ((t * 1.5 + i * .2) % 1);
        tr(ar, 200 + i * 140, 400 + p * 800, 1, 0);
        op(ar, Math.min(1, p * 3, (1 - p) * 3));
      });
      var cp = E.inout(seg(t, tpr - .2, tpr + .6));
      tr(N.cloud2, 540, 1100, 1 - .2 * cp, 0);
      o.head = ["cambio brusco", "la <b>presion</b> invisible", 1, 15];
      o.tags = [["exterior", 240, 520, fade(t, a + .2), "#ff5a3a"], ["interior", 840, 520, fade(t, a + .3), "#5fb8ff"]];
      o.cam = { s: 1 + .06 * E.inout(d), fx: 540, fy: 900 };

    } else if (k === "timpano") {
      var ttim = cue(3, "tímpano", .6);
      tr(N.drum3, 540, 960, 1.25, 0);
      var push = E.inout(seg(t, ttim - .3, ttim + .5));
      N.drum3.drumMembrane.setAttribute("d", "M" + (-120 - 60 * push) + " -130 Q" + (-60 - 30 * push) + " 0 " + (-120 - 60 * push) + " 130 Q" + (-90 - 30 * push) + " 0 " + (-120 - 60 * push) + " -130 Z");
      op(N.drum3.pushArrow, fade(t, ttim - .2) * (1 - fade(t, ttim + .6)));
      o.head = ["alerta auditiva", "el sufrido <b>timpano</b>", rise(t, ttim)[0], rise(t, ttim)[1] + 15];
      o.cam = { s: 1 + .07 * d, fx: 540, fy: 940 };

    } else if (k === "pop") {
      var tpop = cue(4, "pop", .7);
      tr(N.throat4, 540, 1000, 1.25, 0);
      var opn = Math.abs(Math.sin(t * 6));
      N.throat4.tube.setAttribute("d", "M-15 15 Q" + (-90 - 60 * opn) + " " + (50 - 50 * opn) + " -140 110");
      var popP = E.spring(seg(t, tpop - .1, tpop + .4));
      tr(N.star4, 540, 720, popP * 1.6, t * 60);
      op(N.star4, popP > 0 ? 1 : 0);
      
      N.rings4.forEach(function(rg, i) {
        var rp = ((t * 2 + i * 0.3) % 1);
        tr(rg, 540, 720, rp * 2.5, 0);
        op(rg, (1 - rp) * popP);
      });

      o.head = ["alivio instantaneo", "el famoso <b>pop</b>", 1, rise(t, tpop)[1] + 15];
      o.cam = { s: 1 + .06 * E.inout(d), fx: 540, fy: 920 };

    } else {
      var tbeb = cue(5, "bebés", .4);
      tr(N.baby5, 540, 960, 1.3, Math.sin(t * 2) * 5);
      
      var tearAnim = Math.abs(Math.sin(t * 6));
      tr(N.baby5.tearL, -35, 15 + tearAnim * 15, 1, 0);
      tr(N.baby5.tearR, 35, 15 + tearAnim * 15, 1, 0);
      N.baby5.mouth.setAttribute("ry", 22 + 10 * Math.sin(t * 8));

      N.notes5.forEach(function (nt, i) {
        var p = ((t * .8 + nt.ph) % 1);
        tr(nt.e, 420 + (i%2 ? 70 : -70) + i * 25 + Math.sin(t * 3 + i) * 20, 820 - p * 450, 1 + p * 0.5, Math.sin(t * 2 + i) * 25);
        op(nt.e, Math.min(1, p * 4, (1 - p) * 3));
      });
      o.head = ["misterios infantiles", "por que lloran los <b>bebes</b>", rise(t, tbeb)[0], rise(t, tbeb)[1] + 15];
      o.cam = { s: 1.05 - .05 * d, fx: 540, fy: 950 };
    }

    return o;
  }
};

;(function () { var d0 = V.draw; V.draw = function (t, c) {   // vaivén suave de cámara: nunca queda un cuadro quieto
  var o = d0(t, c) || {}; if (!o.cam) o.cam = { s: 1 + .05 * c.drift, fx: 540, fy: 960 };
  o.cam = { s: o.cam.s || 1, fx: (o.cam.fx || 540) + Math.sin(t * 1.2) * 12, fy: (o.cam.fy || 960) + Math.cos(t * .9) * 9 };
  return o; }; })();
