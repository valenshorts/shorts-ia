"""
Música de fondo hecha con código (sin derechos de autor): un tema electrónico alegre distinto para cada video.
Bombo en negras, clap, hi-hats, bajo, acordes y una melodía corta. Lo elige una "semilla" (la idea del video).
"""
import numpy as np

SR = 48000
PROGS = [[0, 5, 3, 4], [5, 3, 0, 4], [0, 4, 5, 3], [3, 4, 0, 0]]   # grados de la escala mayor (I-vi-IV-V, etc.)
MAJOR = [0, 2, 4, 5, 7, 9, 11]


def _env(n, a, d, s=0.0, curve=4):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * (s + (1 - s) * np.exp(-curve * t / max(d, 1e-4)))
    return e


def _lp(x, cutoff):
    """Filtro pasa bajos simple (un polo), suficiente para suavizar los sintes."""
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def _saw(f, n, detune=(0.0,)):
    t = np.arange(n) / SR
    return sum(2 * ((t * f * (1 + d)) % 1) - 1 for d in detune) / len(detune)


def make_track(seconds, seed, path):
    r = np.random.default_rng(seed)
    bpm = r.choice([118, 120, 122, 124, 126])
    root = 45 + r.integers(0, 7)                       # nota MIDI de la tónica (La2 a Mi3)
    prog = PROGS[r.integers(0, len(PROGS))]
    beat = 60 / bpm
    n = int((seconds + 1) * SR)
    out = np.zeros(n)
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    deg = lambda d, o=0: root + MAJOR[d % 7] + 12 * (d // 7) + 12 * o

    # sonidos sueltos
    kn = int(0.35 * SR); kt = np.arange(kn) / SR
    kick = np.sin(2 * np.pi * (50 * kt + 90 / 30 * (1 - np.exp(-30 * kt)))) * np.exp(-9 * kt)
    noise = r.standard_normal(int(0.3 * SR))
    clap = _lp(np.diff(noise, prepend=0), 4500) * _env(len(noise), 0.001, 0.10) * 0.45
    hat = np.diff(np.diff(r.standard_normal(int(0.05 * SR)), prepend=0), prepend=0) * _env(int(0.05 * SR), 0.001, 0.02) * 0.03
    ohat = np.diff(np.diff(r.standard_normal(int(0.18 * SR)), prepend=0), prepend=0) * _env(int(0.18 * SR), 0.002, 0.09) * 0.028

    def place(sample, t, gain=1.0):
        i = int(t * SR)
        if i >= n:
            return
        m = min(len(sample), n - i)
        out[i:i + m] += sample[:m] * gain

    bar = 4 * beat
    side = np.ones(n)                                  # "bombeo" del bombo sobre bajo y acordes
    for b in range(int(seconds / beat) + 2):
        t = b * beat
        place(kick, t, 0.9)
        i = int(t * SR)
        m = min(int(0.22 * SR), n - i)
        if m > 0:
            side[i:i + m] = np.minimum(side[i:i + m], 0.35 + 0.65 * np.linspace(0, 1, m) ** 0.6)
        if b % 2 == 1:
            place(clap, t, 0.6)
        place(ohat, t + beat / 2)
        place(hat, t + beat / 4); place(hat, t + 3 * beat / 4)

    music = np.zeros(n)
    for k in range(int(seconds / bar) + 2):
        d0 = prog[k % 4]
        t0 = k * bar
        i0 = int(t0 * SR)
        L = min(int(bar * SR), n - i0)
        if L <= 0:
            break
        # bajo: corcheas en la tónica del acorde
        for e in range(8):
            ti = int((t0 + e * beat / 2) * SR) - i0
            ln = min(int(beat / 2 * 0.9 * SR), L - ti)
            if ln > 0:
                f = hz(deg(d0, -1))
                music[i0 + ti:i0 + ti + ln] += _saw(f, ln, (0, .004)) * _env(ln, 0.005, 0.25, 0.3) * 0.22
        # acordes: golpes en contratiempo
        for e in (0.5, 1.5, 2.5, 3.5):
            ti = int((t0 + e * beat) * SR) - i0
            ln = min(int(beat * 0.45 * SR), L - ti)
            if ln > 0:
                ch = sum(_saw(hz(deg(d0 + s, 1)), ln, (-.006, 0, .006)) for s in (0, 2, 4)) / 3
                music[i0 + ti:i0 + ti + ln] += ch * _env(ln, 0.004, 0.18, 0.15) * 0.26
        # melodía: arpegio corto en semicorcheas (pentatónica), solo en compases pares
        if k % 2 == 0:
            notes = r.choice([0, 1, 2, 4, 5], size=8)
            for e, nd in enumerate(notes):
                ti = int((t0 + 2 * beat + e * beat / 4) * SR) - i0
                ln = min(int(beat / 4 * SR), L - ti)
                if ln > 0:
                    f = hz(deg(d0 + int(nd), 2))
                    tt = np.arange(ln) / SR
                    music[i0 + ti:i0 + ti + ln] += (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) \
                        * _env(ln, 0.002, 0.12) * 0.2
    music = _lp(music, 3200) * side
    mix = out + music
    mix[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
    mix /= max(1e-6, np.abs(mix).max()) / 0.9
    import wave
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())
    return path
