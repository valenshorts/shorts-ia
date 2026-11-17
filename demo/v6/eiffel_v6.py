"""
Torre Eiffel v6: prueba aparte del estilo "Cinematic Educational Motion Graphics".
No toca el Short diario, ni codeanim.py, ni generate.py, ni sube nada: deja el video en demo/v6/.

Partes (cada una se puede cambiar sin tocar las otras):
  storyboard.json  contenido: frases, objetivos de cada escena, palabras clave, reemplazos de subtítulos
  scene.html       diseño y animación: render(t) dibuja el cuadro del segundo t (cámara, torre, textos)
  eiffel_v6.py     voz con tiempos por palabra, línea de tiempo, sonido, filmación, mezcla y control de calidad

Uso: python demo/v6/eiffel_v6.py          (voz real, en GitHub Actions)
     python demo/v6/eiffel_v6.py --fake   (sin voz, tiempos inventados: solo para revisar la imagen)
"""
import asyncio, base64, json, math, re, subprocess, sys, wave
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(ROOT))
SR, FPS, W, H = 48000, 30, 1080, 1920
WORK = ROOT / "work_v6"
OUT = HERE / "torre_eiffel_cine_v6.mp4"


def log(*a):
    print("[v6]", *a, flush=True)


def run(cmd, capture=False):
    r = subprocess.run([str(c) for c in cmd], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"Falló: {' '.join(map(str, cmd))[:300]}\n{r.stderr[-1500:]}")
    return r.stderr if capture else None


def norm(w):
    return re.sub(r"[^\wáéíóúñü]", "", w.lower())


# ---------------------------------------------------------------- voz con tiempos por palabra
async def tts_words(text, voice, rate, mp3):
    import edge_tts
    for attempt in range(6):
        try:
            try:
                comm = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
            except TypeError:  # versiones viejas: ya mandan las palabras por defecto
                comm = edge_tts.Communicate(text, voice, rate=rate)
            audio, words = bytearray(), []
            async for ch in comm.stream():
                if ch["type"] == "audio":
                    audio += ch["data"]
                elif ch["type"] == "WordBoundary":
                    words.append((ch["offset"] / 1e7, (ch["offset"] + ch["duration"]) / 1e7, ch["text"]))
            if len(audio) < 1000 or not words:
                raise RuntimeError("voz vacía o sin tiempos por palabra")
            Path(mp3).write_bytes(bytes(audio))
            return words
        except Exception as e:
            if attempt == 5:
                raise
            log(f"La voz falló ({e}); reintento")
            await asyncio.sleep(10 * (attempt + 1))


def loudnorm(src, dst, I, TP):
    """Normalización en dos pasadas y lineal (sube o baja el volumen sin aplastar la dinámica)."""
    err = run(["ffmpeg", "-hide_banner", "-y", "-i", src, "-af", f"loudnorm=I={I}:TP={TP}:LRA=11:print_format=json",
               "-f", "null", "-"], capture=True)
    m = json.loads(err[err.rfind("{"):err.rfind("}") + 1])
    run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af",
         f"loudnorm=I={I}:TP={TP}:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
         f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,"
         f"aresample={SR}", "-ar", SR, "-ac", 1, dst])


def make_voice(sb, fake=False):
    words, parts, t = [], [], 0.0
    for si, sc in enumerate(sb["scenes"]):
        wav = WORK / f"v{si}.wav"
        if fake:
            toks = sc["text"].split()
            d0, ws = 0.0, []
            for w in toks:
                d = 0.042 * len(w) + 0.07
                ws.append((d0, d0 + d, w)); d0 += d
            run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=mono", "-t", f"{d0:.3f}", wav])
            start = 0.0
        else:
            mp3 = WORK / f"v{si}.mp3"
            ws = asyncio.run(tts_words(sc["text"], sb["voice"], sb["rate"], mp3))
            start = max(0.0, ws[0][0] - 0.04)
            end = ws[-1][1] + 0.12
            run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-af", f"atrim={start:.3f}:{end:.3f},asetpts=PTS-STARTPTS",
                 "-ar", SR, "-ac", 1, wav])
        d = dur(wav)
        # las palabras de la voz traen la puntuación pegada en el texto original: se recupera del guion
        toks, j = sc["text"].split(), 0
        for k, (a, b, w) in enumerate(ws):
            txt = w
            for jj in range(j, min(j + 3, len(toks))):
                if norm(toks[jj]) == norm(w):
                    txt, j = toks[jj], jj + 1
                    break
            words.append({"s": si, "t": round(t + a - start, 3), "e": round(t + b - start, 3), "x": txt, "n": norm(w)})
        parts.append((wav, t, d))
        t += d + sb["pause"]
    total = parts[-1][1] + parts[-1][2] + 0.75   # el cierre respira un poco después de la última palabra
    # pegar las frases en su lugar exacto de la línea de tiempo
    voice = np.zeros(int(total * SR) + SR)
    for wav, at, d in parts:
        x = read_wav(wav); i = int(at * SR); voice[i:i + len(x)] += x
    raw = WORK / "voice_raw.wav"; write_wav(raw, voice[:int(total * SR)])
    out = WORK / "voice.wav"
    if fake:
        out.write_bytes(raw.read_bytes())
    else:
        loudnorm(raw, out, -16, -2)
    scenes = [{"key": sc["key"], "a": round(parts[i][1] if i else 0.0, 3),
               "b": round(parts[i + 1][1] if i + 1 < len(parts) else total, 3)} for i, sc in enumerate(sb["scenes"])]
    return out, words, scenes, total


def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                          "-of", "csv=p=0", str(p)]).decode().strip())


def read_wav(p):
    with wave.open(str(p)) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768


def write_wav(p, x):
    x = np.clip(x, -1, 1)
    with wave.open(str(p), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


# ---------------------------------------------------------------- subtítulos (grupos cortos, palabra por palabra)
FUNC = {"la", "el", "lo", "los", "las", "un", "una", "de", "del", "en", "que", "se", "y", "a", "no", "con", "por",
        "hasta", "más", "como", "pero", "es", "esos", "cada"}


def chunks(words, scenes, sb):
    reps = [([norm(x) for x in a.split()], b) for a, b in sb["caption_replace"]]
    kws = {norm(k) for k in sb["keywords"]}
    out = []
    for si, sc in enumerate(scenes):
        ws = [dict(w) for w in words if w["s"] == si]
        toks, i = [], 0
        while i < len(ws):  # números en cifras: "quince centímetros" -> "15 cm"
            hit = None
            for src, dst in reps:
                if [w["n"] for w in ws[i:i + len(src)]] == src:
                    hit = (src, dst)
                    break
            if hit:
                last = ws[i + len(hit[0]) - 1]
                punct = re.sub(r"[\wáéíóúñü]", "", last["x"])
                toks.append({"x": hit[1] + punct, "t": ws[i]["t"], "k": True})
                i += len(hit[0])
            else:
                toks.append({"x": ws[i]["x"], "t": ws[i]["t"], "k": ws[i]["n"] in kws}); i += 1
        group, groups = [], []
        for tk in toks:
            group.append(tk)
            chars = sum(len(g["x"]) + 1 for g in group)
            weak = norm(tk["x"]) in FUNC  # no cortar en "de", "el", "que"...: el grupo queda con sentido
            if re.search(r"[,.;:!?]$", tk["x"]) or ((len(group) >= 4 or chars > 18) and not weak) or len(group) >= 6:
                groups.append(group); group = []
        if group:
            groups.append(group)
        for k, g in enumerate(groups):
            for tk in g:
                tk["x"] = tk["x"].rstrip(",;:")
                if tk["x"].endswith(".") and not tk["x"].endswith("..."):
                    tk["x"] = tk["x"][:-1]
            a = max(sc["a"], g[0]["t"] - 0.05)
            b = groups[k + 1][0]["t"] - 0.05 if k + 1 < len(groups) else sc["b"]
            out.append({"a": round(a, 3), "b": round(b, 3), "w": g})
    return out


# ---------------------------------------------------------------- efectos de sonido (hechos con código)
def cue(words, scenes, si, prefix, frac, end=False):
    for w in words:
        if w["s"] == si and w["n"].startswith(prefix):
            return w["e"] if end else w["t"]
    s = scenes[si]
    return s["a"] + (s["b"] - s["a"]) * frac


def sfx_track(words, scenes, total):
    n = int((total + 1) * SR)
    out = np.zeros(n)
    rng = np.random.default_rng(97)

    def put(x, at, g=1.0):
        i = int(max(0, at) * SR)
        if i < n:
            m = min(len(x), n - i); out[i:i + m] += x[:m] * g

    def tt(d):
        return np.arange(int(d * SR)) / SR

    def env(d, a, r):
        t = tt(d); return np.minimum(1, t / a) * np.exp(-t / r)

    def lp(x, c):
        a = math.exp(-2 * math.pi * c / SR); y = np.empty_like(x); acc = 0.0
        for i in range(len(x)):
            acc = (1 - a) * x[i] + a * acc; y[i] = acc
        return y

    def boom(d=0.6, f0=95, f1=42):
        t = tt(d); f = f1 + (f0 - f1) * np.exp(-t * 9)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5.5)

    def click(f=2400, d=0.02):
        t = tt(d); return np.sin(2 * np.pi * f * t) * np.exp(-t * 260)

    def whoosh(d=0.45):
        x = rng.standard_normal(int(d * SR)); t = tt(d)
        shape = np.sin(np.pi * t / d) ** 2
        return lp(np.diff(x, prepend=0), 2500) * shape * 2.2

    def sweep(f0, f1, d, g=0.5):
        t = tt(d); f = f0 + (f1 - f0) * (t / d)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * g

    def chime():
        t = tt(1.2); return (np.sin(2 * np.pi * 880 * t) + .6 * np.sin(2 * np.pi * 1320 * t) + .3 * np.sin(2 * np.pi * 1760 * t)) * np.exp(-t * 3.5) * .35

    W_ = lambda *a, **k: cue(words, scenes, *a, **k)
    # 1 gancho: subida + golpe cuando la torre crece
    tv = W_(0, "verano", .45)
    rise = sweep(220, 900, 0.55, .35) + lp(rng.standard_normal(int(.55 * SR)), 3000) * np.linspace(0, .5, int(.55 * SR))
    put(rise, tv - 0.45, .6); put(boom(), tv + 0.1, .8)
    # 2 medición: clics cada 3 cm (lineal) y golpe en los 15 cm
    a1 = scenes[1]["a"]; q1 = W_(1, "centím", .9, end=True)
    for k in range(1, 6):
        put(click(2000 + 120 * k), a1 + 0.25 + (q1 - a1 - 0.25) * k / 5, .55)
    put(boom(0.8, 120, 45) + .25 * chime()[:int(.8 * SR)], q1, .9)
    # 3 y 4: entrada y salida de la demostración (transición por escala)
    put(whoosh(), scenes[2]["a"] - 0.25, .7)
    put(sweep(140, 340, 1.2, .18), scenes[2]["a"] + .3, 1)          # el hierro se calienta
    put(whoosh(.6), scenes[3]["a"] - 0.05, .6)
    # tramos que se iluminan: clics suaves ascendentes
    bs = max(W_(3, "poquito", .25), scenes[3]["a"] + 1.0); be = W_(3, "suman", .95, end=True)
    for k in range(10):
        put(click(900 + 110 * k, .03), bs + (be - bs) * (k + 1) / 10, .35)
    put(boom(.5, 110, 50), be, .5)
    # 5 la punta se inclina: barrido grave
    put(sweep(160, 90, .9, .35), W_(4, "inclina", .75) - .1, 1)
    # 6 cierre: encoge (barrido hacia abajo) y campana en la comparación
    put(sweep(700, 220, .55, .3), W_(5, "encoger", .45) - .1, 1)
    put(chime(), W_(5, "próximo", .75) + .3, .8)
    p = WORK / "sfx.wav"; write_wav(p, out[:int(total * SR)]); return p


# ---------------------------------------------------------------- mezcla
def mix(voice, sfx, total):
    import music as music_gen  # el mismo motor de música del canal (sin derechos de autor)
    track = music_gen.make_track(total + 2, 97, WORK / "music.wav")
    pre = WORK / "mix_pre.wav"
    fade = max(0.0, total - 0.9)
    af = (f"[1:a]aresample={SR},volume=0.30,afade=t=in:d=0.4[mus];"
          f"[0:a]asplit=2[vo][key];"
          f"[mus][key]sidechaincompress=threshold=0.035:ratio=7:attack=20:release=350[duck];"
          f"[2:a]volume=0.6[fx];"
          f"[vo][duck][fx]amix=inputs=3:duration=first:normalize=0,"
          f"afade=t=out:st={fade:.2f}:d=0.9,alimiter=limit=0.84:level=false[a]")
    run(["ffmpeg", "-v", "error", "-y", "-i", voice, "-i", track, "-i", sfx, "-filter_complex", af,
         "-map", "[a]", "-t", f"{total:.3f}", "-ar", SR, "-ac", 1, pre])
    final = WORK / "mix.wav"
    loudnorm(pre, final, -14, -1.5)
    return final


# ---------------------------------------------------------------- filmación cuadro por cuadro
def font_url():
    for p in (HERE / "fonts" / "Montserrat.ttf", ROOT / "fonts" / "Montserrat.ttf", ROOT / "fonts" / "Inter-Black.otf"):
        if p.exists():
            log(f"Fuente: {p.name}")
            kind = "truetype" if p.suffix == ".ttf" else "opentype"
            return f"data:font/{kind};base64," + base64.b64encode(p.read_bytes()).decode()
    raise RuntimeError("No hay fuente")


def film(data, total, video):
    from playwright.sync_api import sync_playwright
    html = (HERE / "scene.html").read_text(encoding="utf-8")
    html = html.replace("FONTURL", font_url()).replace("/*DATA*/null", json.dumps(data, ensure_ascii=False))
    page_file = WORK / "scene.html"; page_file.write_text(html, encoding="utf-8")
    frames = int(math.ceil(total * FPS))
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg",
                           "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
                           "-profile:v", "high", "-r", str(FPS), str(video)], stdin=subprocess.PIPE)
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        pg.goto(page_file.as_uri())
        pg.wait_for_function("window.READY === true")
        pg.evaluate("document.fonts.ready")
        for f in range(frames):
            pg.evaluate(f"render({f / FPS:.4f})")
            ff.stdin.write(pg.screenshot(type="jpeg", quality=93))
            if f % 150 == 0:
                log(f"cuadro {f}/{frames}")
        br.close()
    ff.stdin.close(); ff.wait()
    if ff.returncode:
        raise RuntimeError("ffmpeg falló al armar la imagen")


# ---------------------------------------------------------------- control de calidad
def qa(out, total):
    rep = {}
    rep["streams"] = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries",
        "stream=codec_name,width,height,r_frame_rate,sample_rate,channels:format=duration,bit_rate", "-of", "json", str(out)]))
    e = run(["ffmpeg", "-hide_banner", "-i", out, "-af", "ebur128=peak=true", "-vf", "freezedetect=n=0.002:d=0.7,blackdetect=d=0.2",
             "-f", "null", "-"], capture=True)
    rep["freeze"] = re.findall(r"freeze_start: ([\d.]+)", e)
    rep["black"] = re.findall(r"black_start:([\d.]+)", e)
    tail = e[e.rfind("Summary:"):]
    rep["loudness_I"] = float(re.search(r"I:\s+(-?[\d.]+)", tail).group(1))
    rep["true_peak"] = float(re.search(r"Peak:\s+(-?[\d.]+)", tail).group(1))
    rep["expected_duration"] = round(total, 3)
    return rep


def main():
    fake = "--fake" in sys.argv
    sb = json.loads((HERE / "storyboard.json").read_text(encoding="utf-8"))
    WORK.mkdir(parents=True, exist_ok=True)
    voice, words, scenes, total = make_voice(sb, fake)
    caps = chunks(words, scenes, sb)
    data = {"scenes": scenes, "words": words, "chunks": caps, "total": total}
    (HERE / "timeline_v6.json").write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    log(f"Duración {total:.2f} s, {len(words)} palabras, {len(caps)} subtítulos")
    sfx = sfx_track(words, scenes, total)
    audio = mix(voice, sfx, total)
    video = WORK / "video.mp4"
    film(data, total, video)
    out = OUT if not fake else WORK / "fake_v6.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-i", video, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
         "-c:a", "aac", "-b:a", "192k", "-ar", SR, "-t", f"{total:.3f}", "-movflags", "+faststart", out])
    rep = qa(out, total)
    (HERE / "qa_v6.json").write_text(json.dumps(rep, indent=1), encoding="utf-8")
    log(f"Listo: {out.name} | {rep}")


if __name__ == "__main__":
    main()
