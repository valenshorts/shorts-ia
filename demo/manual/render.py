"""
Videos hechos a mano (calidad "Torre Eiffel v6"): cada video tiene su carpeta en demo/manual/<nombre>/ con
  storyboard.json  guion por escena, palabras clave, cifras para subtítulos y efectos de sonido
  scene.html       diseño y animación propios: render(t) dibuja el cuadro del segundo t
Este script pone la voz (tiempos por palabra), los subtítulos, los efectos, la música, filma y revisa.

Uso: python demo/manual/render.py neptuno           -> demo/manual/neptuno/video.mp4 (para revisar)
     python demo/manual/render.py neptuno --fake    -> sin voz, solo para mirar la imagen
Publicar: copiar video.mp4 a manual/<id>.mp4 (lo hace manual.yml con "publicar"); el Short diario lo sube.
"""
import asyncio, base64, json, math, os, re, subprocess, sys, urllib.request, wave
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(ROOT))
SR, FPS, W, H = 48000, 30, 1080, 1920
FUNC = {"la", "el", "lo", "los", "las", "un", "una", "de", "del", "en", "que", "se", "y", "a", "no", "con", "por",
        "hasta", "más", "como", "pero", "es", "esos", "cada", "su", "sus", "al", "o"}


def log(*a):
    print("[a mano]", *a, flush=True)


def run(cmd, capture=False):
    r = subprocess.run([str(c) for c in cmd], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"Falló: {' '.join(map(str, cmd))[:300]}\n{r.stderr[-1500:]}")
    return r.stderr if capture else None


def norm(w):
    return re.sub(r"[^\wáéíóúñü]", "", w.lower())


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


async def tts_words(text, voice, rate, mp3):
    import edge_tts
    for attempt in range(6):
        try:
            try:
                comm = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
            except TypeError:
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
    err = run(["ffmpeg", "-hide_banner", "-y", "-i", src, "-af", f"loudnorm=I={I}:TP={TP}:LRA=11:print_format=json",
               "-f", "null", "-"], capture=True)
    m = json.loads(err[err.rfind("{"):err.rfind("}") + 1])
    run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af",
         f"loudnorm=I={I}:TP={TP}:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
         f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,"
         f"aresample={SR}", "-ar", SR, "-ac", 1, dst])


CLONE = {}  # voz clonada (Chatterbox) si existe la variable VOZ_REF con la ruta a la grabación de referencia


def clone_tts(text, out_wav):
    if not CLONE:
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        from faster_whisper import WhisperModel
        CLONE["m"] = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
        CLONE["w"] = WhisperModel("small", device="cpu", compute_type="int8")
    import torchaudio
    m = CLONE["m"]
    w = m.generate(text, language_id="es", audio_prompt_path=os.environ["VOZ_REF"],
                   exaggeration=float(os.environ.get("VOZ_EXAG", "0.55")), cfg_weight=0.5, temperature=0.7)
    raw = out_wav.with_suffix(".raw.wav"); torchaudio.save(str(raw), w, m.sr)
    run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", f"atempo={os.environ.get('VOZ_TEMPO', '1.1')}", "-ar", SR, "-ac", 1, out_wav])
    w16 = out_wav.with_suffix(".16k.wav")  # se le pasa el audio ya leído: evita el choque de versiones de PyAV
    run(["ffmpeg", "-v", "error", "-y", "-i", out_wav, "-ar", 16000, "-ac", 1, "-c:a", "pcm_s16le", w16])
    with wave.open(str(w16)) as f:
        a16 = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    segs, _ = CLONE["w"].transcribe(a16, language="es", word_timestamps=True, initial_prompt=text)
    return [(x.start, x.end, x.word.strip()) for s in segs for x in (s.words or []) if x.word.strip()]


def align(toks, ws):
    # tiempos de whisper -> palabras exactas del guion; las que no coinciden se reparten en el hueco
    import difflib
    A, B = [norm(t) for t in toks], [norm(w) for _, _, w in ws]
    times = [None] * len(toks)
    for blk in difflib.SequenceMatcher(None, A, B, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            times[blk.a + k] = (ws[blk.b + k][0], ws[blk.b + k][1])
    end, i = (ws[-1][1] if ws else 0.5 * len(toks)), 0
    while i < len(toks):
        if times[i] is None:
            j = i
            while j < len(toks) and times[j] is None:
                j += 1
            a = times[i - 1][1] if i else (ws[0][0] if ws else 0.0)
            b = times[j][0] if j < len(toks) else end
            step = max(b - a, 0.05 * (j - i)) / (j - i)
            for k in range(j - i):
                times[i + k] = (a + k * step, a + (k + 1) * step)
            i = j
        else:
            i += 1
    return [(a, b, t) for (a, b), t in zip(times, toks)]


def make_voice(sb, work, fake):
    words, parts, t = [], [], 0.0
    for si, sc in enumerate(sb["scenes"]):
        wav = work / f"v{si}.wav"
        if fake:
            d0, ws = 0.0, []
            for w in sc["text"].split():
                d = 0.042 * len(w) + 0.07
                ws.append((d0, d0 + d, w)); d0 += d
            run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=mono", "-t", f"{d0:.3f}", wav])
            start = 0.0
        elif os.environ.get("VOZ_REF"):
            cw = work / f"c{si}.wav"
            ws = align(sc["text"].split(), clone_tts(sc["text"], cw))
            start = max(0.0, ws[0][0] - 0.04)
            run(["ffmpeg", "-v", "error", "-y", "-i", cw, "-af",
                 f"atrim={start:.3f}:{ws[-1][1] + 0.12:.3f},asetpts=PTS-STARTPTS", "-ar", SR, "-ac", 1, wav])
        else:
            mp3 = work / f"v{si}.mp3"
            ws = asyncio.run(tts_words(sc["text"], sb.get("voice", "es-MX-JorgeNeural"), sb.get("rate", "+20%"), mp3))
            start = max(0.0, ws[0][0] - 0.04)
            run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-af",
                 f"atrim={start:.3f}:{ws[-1][1] + 0.12:.3f},asetpts=PTS-STARTPTS", "-ar", SR, "-ac", 1, wav])
        d = dur(wav)
        toks, j = sc["text"].split(), 0
        for a, b, w in ws:
            txt = w
            for jj in range(j, min(j + 3, len(toks))):
                if norm(toks[jj]) == norm(w):
                    txt, j = toks[jj], jj + 1
                    break
            words.append({"s": si, "t": round(t + a - start, 3), "e": round(t + b - start, 3), "x": txt, "n": norm(w)})
        parts.append((wav, t, d))
        t += d + sb.get("pause", 0.18)
    total = parts[-1][1] + parts[-1][2] + sb.get("tail", 0.75)
    buf = np.zeros(int(total * SR) + SR)
    for wav, at, d in parts:
        x = read_wav(wav); i = int(at * SR); buf[i:i + len(x)] += x
    raw = work / "voice_raw.wav"; write_wav(raw, buf[:int(total * SR)])
    out = work / "voice.wav"
    if fake:
        out.write_bytes(raw.read_bytes())
    else:
        loudnorm(raw, out, -16, -2)
    scenes = [{"key": sc["key"], "a": round(parts[i][1] if i else 0.0, 3),
               "b": round(parts[i + 1][1] if i + 1 < len(parts) else total, 3)} for i, sc in enumerate(sb["scenes"])]
    return out, words, scenes, total


def chunks(words, scenes, sb):
    reps = [([norm(x) for x in a.split()], b) for a, b in sb.get("caption_replace", [])]
    kws = {norm(k) for k in sb.get("keywords", [])}
    out = []
    for si, sc in enumerate(scenes):
        ws = [w for w in words if w["s"] == si]
        toks, i = [], 0
        while i < len(ws):
            hit = next(((src, dst) for src, dst in reps if [w["n"] for w in ws[i:i + len(src)]] == src), None)
            if hit:
                last = ws[i + len(hit[0]) - 1]
                toks.append({"x": hit[1] + re.sub(r"[\wáéíóúñü]", "", last["x"]), "t": ws[i]["t"], "k": True})
                i += len(hit[0])
            else:
                toks.append({"x": ws[i]["x"], "t": ws[i]["t"], "k": ws[i]["n"] in kws}); i += 1
        group, groups = [], []
        for tk in toks:
            group.append(tk)
            chars = sum(len(g["x"]) + 1 for g in group)
            weak = norm(tk["x"]) in FUNC
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


def cue(words, scenes, si, prefix, frac=0.5, end=False):
    for w in words:
        if w["s"] == si and w["n"].startswith(prefix):
            return w["e"] if end else w["t"]
    s = scenes[si]
    return s["a"] + (s["b"] - s["a"]) * frac


def sfx_track(sb, words, scenes, total, work):
    """Efectos según la lista "sfx" del storyboard: {"tipo", "escena", "palabra" o "inicio", "fin", "offset", "gain"}."""
    n = int((total + 1) * SR)
    out = np.zeros(n)
    rng = np.random.default_rng(97)

    def put(x, at, g=1.0):
        i = int(max(0, at) * SR)
        if i < n:
            m = min(len(x), n - i); out[i:i + m] += x[:m] * g

    def tt(d):
        return np.arange(int(d * SR)) / SR

    def lp(x, c):
        a = math.exp(-2 * math.pi * c / SR); y = np.empty_like(x); acc = 0.0
        for i in range(len(x)):
            acc = (1 - a) * x[i] + a * acc; y[i] = acc
        return y

    def boom(d=0.6, f0=95, f1=42):
        t = tt(d); f = f1 + (f0 - f1) * np.exp(-t * 9)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5.5)

    def click(f=2200, d=0.02):
        t = tt(d); return np.sin(2 * np.pi * f * t) * np.exp(-t * 260)

    def whoosh(d=0.45):
        t = tt(d); return lp(np.diff(rng.standard_normal(len(t)), prepend=0), 2500) * np.sin(np.pi * t / d) ** 2 * 2.2

    def sweep(f0, f1, d, g=0.5):
        t = tt(d); f = f0 + (f1 - f0) * (t / d)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * g

    def chime():
        t = tt(1.2)
        return (np.sin(2 * np.pi * 880 * t) + .6 * np.sin(2 * np.pi * 1320 * t) + .3 * np.sin(2 * np.pi * 1760 * t)) \
            * np.exp(-t * 3.5) * .35

    def shimmer(d=1.0):  # brillo (cristales, diamantes)
        t = tt(d); x = np.zeros(len(t))
        for k in range(14):
            f = 2400 + rng.random() * 3200; s = rng.random() * (d - .15)
            m = (t >= s) & (t < s + .15); tl = t[m] - s
            x[m] += np.sin(2 * np.pi * f * tl) * np.exp(-tl * 30) * .25
        return x

    for fx in sb.get("sfx", []):
        si = fx["escena"]
        if "palabra" in fx:
            at = cue(words, scenes, si, fx["palabra"], fx.get("frac", .5), end=fx.get("fin", False))
        else:
            at = scenes[si]["a"] + fx.get("inicio", 0.0)
        at += fx.get("offset", 0.0)
        g, tipo = fx.get("gain", 0.7), fx["tipo"]
        if tipo == "boom":
            put(boom(), at, g)
        elif tipo == "boom_grande":
            put(boom(0.8, 120, 45) + .25 * chime()[:int(.8 * SR)], at, g)
        elif tipo == "whoosh":
            put(whoosh(), at - 0.25, g)
        elif tipo == "subida":
            r = sweep(220, 900, 0.55, .35) + lp(rng.standard_normal(int(.55 * SR)), 3000) * np.linspace(0, .5, int(.55 * SR))
            put(r, at - 0.45, g)
        elif tipo == "bajada":
            put(sweep(700, 220, .55, .3), at - .1, g)
        elif tipo == "grave":
            put(sweep(160, 90, .9, .35), at - .1, g)
        elif tipo == "campana":
            put(chime(), at, g)
        elif tipo == "brillo":
            put(shimmer(fx.get("dur", 1.0)), at, g)
        elif tipo == "clics":  # n clics parejos hasta otra palabra
            b = cue(words, scenes, fx.get("hasta_escena", si), fx["hasta"], .9, end=True)
            k = fx.get("n", 5)
            for j in range(1, k + 1):
                put(click(fx.get("f", 2000) + 120 * j, fx.get("d", .02)), at + (b - at) * j / k, g)
    p = work / "sfx.wav"; write_wav(p, out[:int(total * SR)]); return p


def mix(voice, sfx, total, work, seed):
    import music as music_gen
    track = music_gen.make_track(total + 2, seed, work / "music.wav")
    pre = work / "mix_pre.wav"
    af = (f"[1:a]aresample={SR},volume=0.30,afade=t=in:d=0.4[mus];[0:a]asplit=2[vo][key];"
          f"[mus][key]sidechaincompress=threshold=0.035:ratio=7:attack=20:release=350[duck];[2:a]volume=0.6[fx];"
          f"[vo][duck][fx]amix=inputs=3:duration=first:normalize=0,"
          f"afade=t=out:st={max(0.0, total - 0.9):.2f}:d=0.9,alimiter=limit=0.84:level=false[a]")
    run(["ffmpeg", "-v", "error", "-y", "-i", voice, "-i", track, "-i", sfx, "-filter_complex", af,
         "-map", "[a]", "-t", f"{total:.3f}", "-ar", SR, "-ac", 1, pre])
    final = work / "mix.wav"
    loudnorm(pre, final, -14, -1.5)
    return final


def font_url(work):
    f = work / "Montserrat.ttf"
    if not f.exists():
        try:
            url = "https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf"
            with urllib.request.urlopen(url, timeout=60) as r:
                f.write_bytes(r.read())
        except Exception as e:
            log(f"No bajó Montserrat ({e}); uso Inter")
    for p in (f, ROOT / "fonts" / "Inter-Black.otf"):
        if p.exists():
            kind = "truetype" if p.suffix == ".ttf" else "opentype"
            return f"data:font/{kind};base64," + base64.b64encode(p.read_bytes()).decode()
    raise RuntimeError("No hay fuente")


def film(folder, data, total, video, work, scene_file=None):
    from playwright.sync_api import sync_playwright
    if (folder / "scene.js").exists():  # escena sobre la base común (textos, subtítulos, cámara)
        html = (HERE / "base.html").read_text(encoding="utf-8").replace("/*SCENE*/", (folder / "scene.js").read_text(encoding="utf-8"))
    else:
        html = (ROOT / scene_file if scene_file else folder / "scene.html").read_text(encoding="utf-8")
    html = html.replace("FONTURL", font_url(work)).replace("/*DATA*/null", json.dumps(data, ensure_ascii=False))
    page = work / "scene.html"; page.write_text(html, encoding="utf-8")
    frames = int(math.ceil(total * FPS))
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg",
                           "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
                           "-profile:v", "high", "-r", str(FPS), str(video)], stdin=subprocess.PIPE)
    errors = []
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.goto(page.as_uri())
        pg.wait_for_function("window.READY === true", timeout=60000)
        pg.evaluate("document.fonts.ready")
        for f in range(frames):
            pg.evaluate(f"render({f / FPS:.4f})")
            ff.stdin.write(pg.screenshot(type="jpeg", quality=93))
            if errors:
                break
        br.close()
    ff.stdin.close(); ff.wait()
    if errors:
        raise RuntimeError(f"Error en la animación: {errors[0][:300]}")


def qa(out, total):
    rep = {"streams": json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries",
           "stream=codec_name,width,height,r_frame_rate:format=duration", "-of", "json", str(out)]))}
    e = run(["ffmpeg", "-hide_banner", "-i", out, "-af", "ebur128=peak=true", "-vf",
             "freezedetect=n=0.002:d=0.7,blackdetect=d=0.2", "-f", "null", "-"], capture=True)
    rep["freeze"] = re.findall(r"freeze_start: ([\d.]+)", e)
    rep["black"] = re.findall(r"black_start:([\d.]+)", e)
    tail = e[e.rfind("Summary:"):]
    rep["loudness_I"] = float(re.search(r"I:\s+(-?[\d.]+)", tail).group(1))
    rep["true_peak"] = float(re.search(r"Peak:\s+(-?[\d.]+)", tail).group(1))
    rep["duration"] = round(total, 3)
    return rep


def main():
    name = next(a for a in sys.argv[1:] if not a.startswith("--"))
    fake = "--fake" in sys.argv
    folder = HERE / name
    sb = json.loads((folder / "storyboard.json").read_text(encoding="utf-8"))
    work = (ROOT / "work_manual" / name).resolve(); work.mkdir(parents=True, exist_ok=True)
    suf = "_voz" if os.environ.get("VOZ_REF") else ""  # con voz clonada no pisa el video original
    voice, words, scenes, total = make_voice(sb, work, fake)
    data = {"scenes": scenes, "words": words, "chunks": chunks(words, scenes, sb), "total": total}
    (folder / f"timeline{suf}.json").write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    log(f"{name}: {total:.2f} s, {len(words)} palabras")
    audio = mix(voice, sfx_track(sb, words, scenes, total, work), total, work, int(re.sub(r"\D", "", sb["id"]) or 1))
    video = work / "video_sin_audio.mp4"
    film(folder, data, total, video, work, sb.get("scene"))  # "scene": otra escena del repo (ej. demo/v6/scene.html)
    out = folder / f"video{suf}.mp4" if not fake else work / "fake.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-i", video, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
         "-c:a", "aac", "-b:a", "192k", "-ar", SR, "-t", f"{total:.3f}", "-movflags", "+faststart", out])
    rep = qa(out, total)
    (folder / f"qa{suf}.json").write_text(json.dumps(rep, indent=1), encoding="utf-8")
    log(f"Listo: {out} | quietos: {rep['freeze'] or 'ninguno'} | {rep['loudness_I']} LUFS, pico {rep['true_peak']} dB")


if __name__ == "__main__":
    main()
