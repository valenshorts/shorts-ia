// El monje dentro del Buda: la voz de Valentín (con sus tiempos por palabra) manda todo el timeline.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const D = node ? require('./assets/data.js') : globalThis.MONJE;
  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const WIDE = W / H > 1.2;
  const clock = MU.makeClock({ bpm: 120, offset: 0 });
  const { T, BEAT } = clock;
  const DURATION = D.total;
  const sc = D.scenes;
  const S = {}; sc.forEach((s) => { S[s.key] = [s.a, s.b]; });
  // el segundo en que se dice la primera palabra (de la escena si) que empieza con pre
  const cue = (si, pre, frac = 0.5) => { const w = D.words.find((x) => x.s === si && x.n.indexOf(pre) === 0); return w ? w.t : U.lerp(sc[si].a, sc[si].b, frac); };
  const ev = {
    estatua: cue(0, 'estatua'), monje: cue(0, 'monje'), tomo: cue(1, 'tomógrafo'), esqueleto: cue(1, 'esqueleto'),
    meditacion: cue(1, 'meditación'), liuquan: cue(2, 'liuquan'), organos: cue(3, 'órganos'), papel: cue(3, 'papel'),
    siglos: cue(4, 'siglos'), adentro: cue(4, 'adentro'),
  };
  const markers = {};
  for (const s of sc) markers[s.key] = s.a;
  Object.assign(markers, { monje: ev.monje, esqueleto: ev.esqueleto, liuquan: ev.liuquan, papel: ev.papel, adentro: ev.adentro });
  const subtitles = D.subs;
  const SCORE = { FPS, FORMAT, W, H, SAFE, WIDE, DURATION, clock, T, BEAT, S, sc, cue, ev, markers, subtitles, m: MU.m, STYLE: 'paper' };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
