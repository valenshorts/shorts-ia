"""
Motor "cine": videos con motion graphics hechos con código (el estilo de la Torre Eiffel v6), automáticos.

Gemini elige, para cada frase del guion, una plantilla de escena y sus datos (objeto, número, comparación...).
Las plantillas, la cámara, los subtítulos por palabra, el sonido y la mezcla son siempre los mismos y probados.
No sube nada: devuelve el MP4 listo; la publicación la hace generate.py.

Partes:
  cine.py           voz con tiempos por palabra, plan de escenas (Gemini + revisión), sonido, filmación y control
  cine_escena.html  plantillas y animación: render(t) dibuja el cuadro del segundo t

Prueba suelta: python cine.py 030 [--fake]  (deja demo/cine_030.mp4 y demo/cine_030.json)
"""
import asyncio, base64, json, math, os, re, subprocess, sys, time, urllib.request, wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
SR, FPS, W, H = 48000, 30, 1080, 1920

PLANTILLAS = ("gancho", "numero", "comparar", "proceso", "zoom", "acumular", "linea", "cierre")
FONDOS = ("ciudad", "espacio", "cielo", "mar", "laboratorio", "cuerpo", "naturaleza", "cocina")
CAMBIOS = ("crece", "achica", "gira", "brilla", "late", "")
LIB = ("torre_eiffel",)  # dibujos propios (vectoriales); el resto son emojis vectoriales (Noto, licencia Apache)


def log(*a):
    print("[cine]", *a, flush=True)


def run(cmd, capture=False):
    r = subprocess.run([str(c) for c in cmd], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"Falló: {' '.join(map(str, cmd))[:300]}\n{r.stderr[-1500:]}")
    return r.stderr if capture else None


def norm(w):
    return re.sub(r"[^\wáéíóúñü]", "", w.lower())


def sentences(text):
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text.strip()) if s.strip()]


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


# ---------------------------------------------------------------- voz con tiempos por palabra
async def _tts(text, voice, rate, mp3):
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
    """Normalización en dos pasadas, lineal (no aplasta la dinámica)."""
    err = run(["ffmpeg", "-hide_banner", "-y", "-i", src, "-af", f"loudnorm=I={I}:TP={TP}:LRA=11:print_format=json",
               "-f", "null", "-"], capture=True)
    m = json.loads(err[err.rfind("{"):err.rfind("}") + 1])
    run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af",
         f"loudnorm=I={I}:TP={TP}:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
         f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,"
         f"aresample={SR}", "-ar", SR, "-ac", 1, dst])


def make_voice(sents, work, voice, rate, pause, fake=False):
    words, parts, t = [], [], 0.0
    for si, text in enumerate(sents):
        wav = work / f"cv{si}.wav"
        if fake:  # solo para probar la imagen sin internet
            d0, ws = 0.0, []
            for w in text.split():
                d = 0.042 * len(w) + 0.07
                ws.append((d0, d0 + d, w)); d0 += d
            run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=mono", "-t", f"{d0:.3f}", wav])
            start = 0.0
        else:
            mp3 = work / f"cv{si}.mp3"
            ws = asyncio.run(_tts(text, voice, rate, mp3))
            start = max(0.0, ws[0][0] - 0.04)
            run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-af",
                 f"atrim={start:.3f}:{ws[-1][1] + 0.12:.3f},asetpts=PTS-STARTPTS", "-ar", SR, "-ac", 1, wav])
        d = dur(wav)
        toks, j = text.split(), 0
        for a, b, w in ws:  # se recupera la puntuación del guion para cortar bien los subtítulos
            txt = w
            for jj in range(j, min(j + 3, len(toks))):
                if norm(toks[jj]) == norm(w):
                    txt, j = toks[jj], jj + 1
                    break
            words.append({"s": si, "t": round(t + a - start, 3), "e": round(t + b - start, 3), "x": txt, "n": norm(w)})
        parts.append((wav, t, d))
        t += d + pause
    total = parts[-1][1] + parts[-1][2] + 0.7
    buf = np.zeros(int(total * SR) + SR)
    for wav, at, d in parts:
        x = read_wav(wav); i = int(at * SR); buf[i:i + len(x)] += x
    raw = work / "cvoice_raw.wav"; write_wav(raw, buf[:int(total * SR)])
    out = work / "cvoice.wav"
    if fake:
        out.write_bytes(raw.read_bytes())
    else:
        loudnorm(raw, out, -16, -2)
    bounds = [{"a": round(parts[i][1] if i else 0.0, 3), "b": round(parts[i + 1][1] if i + 1 < len(parts) else total, 3)}
              for i in range(len(parts))]
    return out, words, bounds, total


# ---------------------------------------------------------------- plan de escenas
SPEC_PROMPT = """Sos director de motion graphics de un canal de YouTube Shorts de curiosidades. Cada frase del guion es una escena animada.
Para cada frase elegí UNA plantilla y sus datos, pensando en DEMOSTRAR el dato (no adornarlo):
- "gancho": un objeto grande que cambia (crece, achica, gira, brilla, late). Ideal para la primera frase.
- "numero": un número que cuenta hasta "valor" con una barra que se llena. Para cifras (cm, años, km, %).
- "comparar": dos objetos lado a lado ("e" y "e2") con etiquetas; "tam2" = tamaño del segundo respecto del primero (0.3 a 1.5).
- "proceso": "e" se transforma en "e2" con una flecha (causa y efecto, antes y después).
- "zoom": una lupa sobre "e" que muestra por dentro muchos "interior" (átomos, células, burbujas); "agitar": true si se mueven más (calor, energía).
- "acumular": muchos "e" que aparecen de a uno y un total grande ("valor" como texto, ej. "100.000").
- "linea": línea de tiempo con 2 o 3 "puntos" [{"e": emoji, "texto": "año o etapa corta"}].
- "cierre": objeto grande con el remate. Ideal para la última frase.
No repitas la misma plantilla en frases seguidas. Usá "gancho" solo al principio y "cierre" solo al final.

Datos de cada escena (JSON):
{"plantilla": ..., "fondo": uno de ciudad, espacio, cielo, mar, laboratorio, cuerpo, naturaleza, cocina,
 "kicker": "2 a 4 palabras chicas arriba", "titulo": "máx. 5 palabras, la clave entre <b> y </b>",
 "e": "UN emoji que represente exactamente el objeto (o torre_eiffel)", "e2": "otro emoji si hace falta",
 "etiqueta": "1 a 3 palabras", "etiqueta2": "1 a 3 palabras", "cambio": "crece|achica|gira|brilla|late",
 "valor": número o texto corto, "unidad": "cm, km, años, %...", "interior": "emoji", "agitar": true/false, "tam2": 1,
 "puntos": [...], "palabra": "UNA palabra exacta de la frase donde ocurre el golpe visual",
 "cifras": [["frase con el número en letras exacta de la frase", "como se escribe en cifras"]],
 "clave": ["1 a 3 palabras exactas de la frase para resaltar"]}
Reglas: los emojis tienen que ser objetos concretos y correctos (nada de 🤔 o ✨ como objeto principal). Datos verdaderos, sin inventar cifras que no estén en la frase.
Devolvé SOLO un array JSON con {n} objetos, en orden.

Frases:
{frases}"""

FALLBACK = {"Espacio": ("espacio", "🚀 🪐 ☄️ 🌙 ⭐ 🛰️"), "Cuerpo humano": ("cuerpo", "🧠 🫀 👀 🦴 💪 👂"),
            "Ciencia loca": ("laboratorio", "🧪 ⚡ 🔬 🧲 💥 🌡️"), "Comida increíble": ("cocina", "🍔 🍕 🍫 🍌 🍓 🧂"),
            "Inventos por accidente": ("laboratorio", "💡 🛠️ ⚙️ 🔧 🏭 📦"), "Mitos falsos": ("ciudad", "🔍 ❌ ✅ 🧐 📚 💡"),
            "Naturaleza": ("naturaleza", "🌋 🌳 🌊 🍂 🌈 ☀️"), "Lugares increíbles": ("ciudad", "🗺️ 🏛️ 🗼 🌍 🏔️ 🧭")}


def gemini_plan(sents, models):
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        return None
    prompt = SPEC_PROMPT.replace("{n}", str(len(sents))).replace(
        "{frases}", "\n".join(f"{i + 1}. {s}" for i, s in enumerate(sents)))
    body = json.dumps({"contents": [{"parts": [{"text": prompt}]}],
                       "generationConfig": {"responseMimeType": "application/json", "temperature": 0.6}}).encode()
    for ronda in range(5):  # Gemini a veces está saturado: espera y reintenta
        for model in models:
            try:
                req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                                             data=body, headers={"Content-Type": "application/json", "x-goog-api-key": key})
                with urllib.request.urlopen(req, timeout=90) as r:
                    v = json.loads(json.loads(r.read())["candidates"][0]["content"]["parts"][0]["text"])
                if isinstance(v, dict):
                    v = next((x for x in v.values() if isinstance(x, list)), None)
                if isinstance(v, list) and len(v) == len(sents):
                    return v
                log(f"Gemini {model} mandó otra cantidad de escenas")
            except Exception as e:
                log(f"Gemini {model} no pudo planear las escenas: {e}")
        if ronda < 4:
            time.sleep(20 * (ronda + 1))
    return None


def is_emoji(s):
    return isinstance(s, str) and 0 < len(s) <= 12 and not re.search(r"[A-Za-z0-9áéíóúñ]", s)


def _txt(v, n):
    v = re.sub(r"<(?!/?b>)[^>]*>", "", str(v or "")).strip()
    return v[:n]


def clean_plan(plan, sents, idea):
    """Revisa y completa lo que manda Gemini. Si no mandó nada, arma escenas simples del tema."""
    fondo0, pool = FALLBACK.get(idea.get("playlist"), ("ciudad", "🌍 💡 🔍 ⭐ 📚 🧭"))
    pool = pool.split()
    out, prev = [], None
    for i, s in enumerate(sents):
        g = plan[i] if plan and i < len(plan) and isinstance(plan[i], dict) else {}
        p = g.get("plantilla") if g.get("plantilla") in PLANTILLAS else None
        last = i == len(sents) - 1
        if p is None:
            p = "gancho" if i == 0 else "cierre" if last else ("comparar", "proceso", "zoom", "acumular")[i % 4]
        if p == prev:  # nunca la misma plantilla dos veces seguidas
            p = "proceso" if p != "proceso" else "comparar"
        e = g.get("e") if (g.get("e") in LIB or is_emoji(g.get("e"))) else pool[i % len(pool)]
        e2 = g.get("e2") if (g.get("e2") in LIB or is_emoji(g.get("e2"))) else pool[(i + 1) % len(pool)]
        if e2 == e and p in ("comparar", "proceso"):
            e2 = pool[(i + 2) % len(pool)]
        words = [norm(w) for w in s.split()]
        cue = norm(g.get("palabra", ""))
        if cue not in words:
            longs = [w for w in words if len(w) > 5]
            cue = longs[len(longs) // 2] if longs else words[len(words) // 2]
        try:
            valor = float(str(g.get("valor")).replace(",", ".")) if p == "numero" else g.get("valor")
        except (TypeError, ValueError):
            valor = None
        if p == "numero" and (valor is None or valor <= 0):
            p = "gancho" if i == 0 else "comparar"
        if p == "acumular":
            valor = _txt(valor, 12)
        cifras = []
        for pair in g.get("cifras") or []:
            if isinstance(pair, list) and len(pair) == 2 and norm(pair[0]) and \
                    " ".join(norm(x) for x in str(pair[0]).split()) in " ".join(words):
                cifras.append([str(pair[0]), _txt(pair[1], 14)])
        puntos = [{"e": x.get("e") if is_emoji(x.get("e")) else pool[k % len(pool)], "texto": _txt(x.get("texto"), 14)}
                  for k, x in enumerate(g.get("puntos") or []) if isinstance(x, dict)][:3]
        if p == "linea" and len(puntos) < 2:
            p = "proceso"
        titulo = _txt(g.get("titulo"), 60)
        if not titulo:
            big = sorted([w for w in s.split() if len(norm(w)) > 4], key=lambda w: -len(w))[:2]
            titulo = " ".join(big[:1]) + (f" <b>{big[1]}</b>" if len(big) > 1 else "")
        out.append({"plantilla": p, "fondo": g.get("fondo") if g.get("fondo") in FONDOS else fondo0,
                    "kicker": _txt(g.get("kicker"), 28), "titulo": titulo, "e": e, "e2": e2,
                    "etiqueta": _txt(g.get("etiqueta"), 22), "etiqueta2": _txt(g.get("etiqueta2"), 22),
                    "cambio": g.get("cambio") if g.get("cambio") in CAMBIOS else ("crece" if p == "gancho" else ""),
                    "valor": valor, "unidad": _txt(g.get("unidad"), 10),
                    "interior": g.get("interior") if is_emoji(g.get("interior")) else "⚛️",
                    "agitar": bool(g.get("agitar")), "tam2": max(0.3, min(1.5, float(g.get("tam2") or 1))) if
                    isinstance(g.get("tam2"), (int, float)) else 1.0,
                    "puntos": puntos, "palabra": cue, "cifras": cifras,
                    "clave": [norm(x) for x in (g.get("clave") or []) if isinstance(x, str)][:3]})
        prev = p
    return out


# ---------------------------------------------------------------- emojis vectoriales (Noto Emoji, Apache 2.0)
def emoji_asset(e, cache):
    cps = "_".join(f"{ord(c):04x}" for c in e if ord(c) != 0xFE0F)
    f = cache / f"emoji_u{cps}.svg"
    if not f.exists():
        url = f"https://raw.githubusercontent.com/googlefonts/noto-emoji/main/2D/svg/emoji_u{cps}.svg"
        try:
            with urllib.request.urlopen(url, timeout=30) as r:
                f.write_bytes(r.read())
        except Exception as ex:
            log(f"Sin dibujo vectorial para {e} ({ex}); va con la fuente de emojis")
            return None
    return "data:image/svg+xml;base64," + base64.b64encode(f.read_bytes()).decode()


# ---------------------------------------------------------------- subtítulos
FUNC = {"la", "el", "lo", "los", "las", "un", "una", "de", "del", "en", "que", "se", "y", "a", "no", "con", "por",
        "hasta", "más", "como", "pero", "es", "esos", "cada", "su", "sus", "al", "o"}


def chunks(words, bounds, scenes, highlight):
    hl = {norm(w) for ph in highlight for w in ph.split() if len(norm(w)) >= 4}
    out = []
    for si, bd in enumerate(bounds):
        sc = scenes[si]
        reps = [([norm(x) for x in a.split()], b) for a, b in sc["cifras"]]
        kws = hl | set(sc["clave"]) | {sc["palabra"]}
        ws = [w for w in words if w["s"] == si]
        toks, i = [], 0
        while i < len(ws):
            hit = next(((src, dst) for src, dst in reps if [w["n"] for w in ws[i:i + len(src)]] == src), None)
            if hit:
                last = ws[i + len(hit[0]) - 1]
                toks.append({"x": hit[1] + re.sub(r"[\wáéíóúñü]", "", last["x"]), "t": ws[i]["t"], "k": True})
                i += len(hit[0])
            else:
                toks.append({"x": ws[i]["x"], "t": ws[i]["t"], "k": ws[i]["n"] in kws or ws[i]["n"].isdigit()}); i += 1
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
                tk["x"] = tk["x"].rstrip(",;:¿?¡!")
                if tk["x"].endswith(".") and not tk["x"].endswith("..."):
                    tk["x"] = tk["x"][:-1]
                tk["x"] = tk["x"].lstrip("¿¡")
            a = max(bd["a"], g[0]["t"] - 0.05)
            b = groups[k + 1][0]["t"] - 0.05 if k + 1 < len(groups) else bd["b"]
            out.append({"a": round(a, 3), "b": round(b, 3), "w": g})
    return out


def cue_time(words, si, word, bd, end=False):
    for w in words:
        if w["s"] == si and w["n"] == word:
            return w["e"] if end else w["t"]
    return bd["a"] + (bd["b"] - bd["a"]) * 0.5


# ---------------------------------------------------------------- sonido
def sfx_track(scenes, total, work):
    n = int((total + 1) * SR)
    out = np.zeros(n)
    rng = np.random.default_rng(7)

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

    def boom(d=0.6, f0=100, f1=44):
        t = tt(d); f = f1 + (f0 - f1) * np.exp(-t * 9)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5.5)

    def click(f=2200, d=0.02):
        t = tt(d); return np.sin(2 * np.pi * f * t) * np.exp(-t * 260)

    def whoosh(d=0.45):
        t = tt(d); return lp(np.diff(rng.standard_normal(len(t)), prepend=0), 2500) * np.sin(np.pi * t / d) ** 2 * 2.2

    def chime():
        t = tt(1.2)
        return (np.sin(2 * np.pi * 880 * t) + .6 * np.sin(2 * np.pi * 1320 * t) + .3 * np.sin(2 * np.pi * 1760 * t)) \
            * np.exp(-t * 3.5) * .35

    whoosh_pl = {"zoom", "proceso", "linea"}
    for k, sc in enumerate(scenes):
        p, a, c, ce = sc["plantilla"], sc["a"], sc["cue"], sc["cueEnd"]
        if k and (p in whoosh_pl or scenes[k - 1]["plantilla"] in whoosh_pl):
            put(whoosh(), a - 0.25, .55)
        if p == "numero":
            for j in range(1, 6):
                put(click(1900 + 130 * j), a + 0.2 + (ce - a - 0.2) * j / 5, .5)
            put(boom(.8, 120, 45), ce, .85)
        elif p == "acumular":
            for j in range(8):
                put(click(900 + 120 * j, .03), a + 0.2 + (ce - a - 0.2) * (j + 1) / 8, .32)
            put(boom(.5, 110, 50), ce, .55)
        elif p == "cierre":
            put(chime(), c, .8)
        else:
            put(boom(), c, .6)
    p = work / "csfx.wav"; write_wav(p, out[:int(total * SR)]); return p


def mix(voice, sfx, total, work, seed):
    sys.path.insert(0, str(ROOT))
    import music as music_gen  # el motor de música del canal (sin derechos de autor)
    track = music_gen.make_track(total + 2, seed, work / "cmusic.wav")
    pre = work / "cmix_pre.wav"
    af = (f"[1:a]aresample={SR},volume=0.30,afade=t=in:d=0.4[mus];[0:a]asplit=2[vo][key];"
          f"[mus][key]sidechaincompress=threshold=0.035:ratio=7:attack=20:release=350[duck];[2:a]volume=0.6[fx];"
          f"[vo][duck][fx]amix=inputs=3:duration=first:normalize=0,"
          f"afade=t=out:st={max(0.0, total - 0.9):.2f}:d=0.9,alimiter=limit=0.84:level=false[a]")
    run(["ffmpeg", "-v", "error", "-y", "-i", voice, "-i", track, "-i", sfx, "-filter_complex", af,
         "-map", "[a]", "-t", f"{total:.3f}", "-ar", SR, "-ac", 1, pre])
    final = work / "cmix.wav"
    loudnorm(pre, final, -14, -1.5)
    return final


# ---------------------------------------------------------------- filmación
MONTSERRAT = "https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf"


def font_url():
    f = ROOT / ".emoji_cache" / "Montserrat.ttf"  # Montserrat (licencia OFL); si no baja, se usa Inter del repo
    if not f.exists():
        try:
            with urllib.request.urlopen(MONTSERRAT, timeout=60) as r:
                f.write_bytes(r.read())
        except Exception as e:
            log(f"No bajó Montserrat ({e}); uso Inter")
    for p in (f, ROOT / "fonts" / "Inter-Black.otf"):
        if p.exists():
            kind = "truetype" if p.suffix == ".ttf" else "opentype"
            return f"data:font/{kind};base64," + base64.b64encode(p.read_bytes()).decode()
    raise RuntimeError("No hay fuente para los textos")


def film(data, total, video, work):
    from playwright.sync_api import sync_playwright
    html = (ROOT / "cine_escena.html").read_text(encoding="utf-8")
    html = html.replace("FONTURL", font_url()).replace("/*DATA*/null", json.dumps(data, ensure_ascii=False))
    page_file = work / "cine_scene.html"; page_file.write_text(html, encoding="utf-8")
    frames = int(math.ceil(total * FPS))
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg",
                           "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
                           "-profile:v", "high", "-r", str(FPS), str(video)], stdin=subprocess.PIPE)
    errors = []
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.goto(page_file.as_uri())
        pg.wait_for_function("window.READY === true", timeout=60000)
        pg.evaluate("document.fonts.ready")
        pg.wait_for_timeout(500)
        for f in range(frames):
            pg.evaluate(f"render({f / FPS:.4f})")
            ff.stdin.write(pg.screenshot(type="jpeg", quality=93))
            if errors:
                break
        br.close()
    ff.stdin.close(); ff.wait()
    if errors:
        raise RuntimeError(f"Error en la animación: {errors[0][:300]}")
    if ff.returncode:
        raise RuntimeError("ffmpeg falló al armar la imagen")


# ---------------------------------------------------------------- principal
def make_video(idea, work, out, cfg, fake=False, plan=None):
    """Arma el video completo (imagen, voz, subtítulos, música y efectos). Devuelve (ruta, duración)."""
    work = Path(work).resolve(); work.mkdir(parents=True, exist_ok=True)
    cache = ROOT / ".emoji_cache"; cache.mkdir(exist_ok=True)
    sents = sentences(idea["narration"])
    voice, words, bounds, total = make_voice(sents, work, cfg.get("voice", "es-MX-JorgeNeural"),
                                             cfg.get("voice_rate", "+20%"), cfg.get("cine_pause", 0.16), fake)
    log(f"Voz lista: {total:.1f} s, {len(words)} palabras")
    if plan is None:
        plan_file = work / "cine_plan.json"
        plan = json.loads(plan_file.read_text(encoding="utf-8")) if plan_file.exists() else \
            gemini_plan(sents, cfg.get("gemini_models", ["gemini-flash-latest"]))
        if plan:
            plan_file.write_text(json.dumps(plan, ensure_ascii=False, indent=1), encoding="utf-8")
        else:
            log("Gemini no respondió: escenas simples del tema")
    scenes = clean_plan(plan, sents, idea)
    for si, (sc, bd) in enumerate(zip(scenes, bounds)):
        sc.update(a=bd["a"], b=bd["b"], cue=cue_time(words, si, sc["palabra"], bd),
                  cueEnd=cue_time(words, si, sc["palabra"], bd, end=True))
    assets = {}
    for sc in scenes:
        for e in [sc["e"], sc["e2"], sc["interior"]] + [x["e"] for x in sc["puntos"]]:
            if e and e not in LIB and e not in assets:
                a = emoji_asset(e, cache)
                if a:
                    assets[e] = a
    caps = chunks(words, bounds, scenes, idea.get("highlight", []))
    data = {"scenes": scenes, "chunks": caps, "assets": assets, "total": total, "brand": cfg.get("handle", "")}
    (work / "cine_timeline.json").write_text(json.dumps({k: v for k, v in data.items() if k != "assets"},
                                                        ensure_ascii=False, indent=1), encoding="utf-8")
    log("Plan: " + " | ".join(f"{s['plantilla']}:{s['e']}" for s in scenes))
    sfx = sfx_track(scenes, total, work)
    seed = int(re.sub(r"\D", "", str(idea.get("id", "1"))) or 1)
    audio = mix(voice, sfx, total, work, seed)
    video = work / "cine_video.mp4"
    film(data, total, video, work)
    run(["ffmpeg", "-v", "error", "-y", "-i", video, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
         "-c:a", "aac", "-b:a", "192k", "-ar", SR, "-t", f"{total:.3f}", "-movflags", "+faststart", out])
    return Path(out), total


def main():
    """Prueba suelta: arma la idea pedida y la deja en demo/ (no sube nada)."""
    sys.path.insert(0, str(ROOT))
    import generate as g
    iid = next((a for a in sys.argv[1:] if not a.startswith("--")), "030")
    idea = {i["id"]: i for i in json.loads((ROOT / "ideas.json").read_text(encoding="utf-8"))}[iid]
    out_dir = ROOT / "demo"; out_dir.mkdir(exist_ok=True)
    work = ROOT / "work_cine" / iid
    out, total = make_video(idea, work, out_dir / f"cine_{iid}.mp4", g.CFG, fake="--fake" in sys.argv)
    (out_dir / f"cine_{iid}.json").write_text((work / "cine_timeline.json").read_text(encoding="utf-8"), encoding="utf-8")
    bad = g.verify_final(out, total, total / 6, 6)
    log(f"Listo: {out.name} ({total:.1f} s); tramos quietos: {bad or 'ninguno'}")


if __name__ == "__main__":
    main()
