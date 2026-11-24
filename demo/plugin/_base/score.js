// Score genérico de la tanda: la voz de Valentín (tiempos por palabra, de assets/data.js) manda todo.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const D = node ? require('./assets/data.js') : globalThis.DATA;
  const FPS = 30, FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H), WIDE = W / H > 1.2;
  const clock = MU.makeClock({ bpm: 120, offset: 0 });
  const sc = D.scenes;
  // segundo en que se dice la primera palabra de la escena si que empieza con pre (minúsculas, con tildes)
  const cue = (si, pre, frac = 0.5) => { const w = D.words.find((x) => x.s === si && x.n.indexOf(pre) === 0); return w ? w.t : U.lerp(sc[si].a, sc[si].b, frac); };
  const markers = {}; sc.forEach((s) => { markers[s.key] = s.a; });
  const SCORE = { FPS, FORMAT, W, H, SAFE, WIDE, DURATION: D.total, clock, T: clock.T, BEAT: clock.BEAT, S: {}, sc, cue, markers, subtitles: D.subs, m: MU.m, STYLE: 'paper' };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
