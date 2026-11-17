"""
Motor "cine": arma solo un Short completo (imagen + voz + música + efectos) con el estilo de la Torre Eiffel v6.

Cada frase es una escena de una biblioteca (cine_escena.html): objeto, medida, comparacion, cambio, lupa, dato, lista.
Gemini elige qué escena va en cada frase y con qué datos; el código anima, sincroniza con la voz palabra por palabra,
mezcla el sonido (sin saturar) y revisa que nada quede congelado. Si algo falla, levanta un error y el video
se hace con el estilo anterior.

Uso suelto (prueba): python cine.py 030 [--fake]
"""
import asyncio, base64, json, math, os, random, re, subprocess, sys, time, urllib.request, wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
SR, FPS, W, H = 48000, 30, 1080, 1920
TIPOS = ("objeto", "medida", "comparacion", "cambio", "lupa", "dato", "lista")
FONDOS = ("noche", "ciudad", "espacio", "laboratorio", "naturaleza", "mar", "cuerpo")
MOVS = ("crece", "achica", "gira", "late", "sube", "cae", "inclina", "tiembla", "flota")
DIBUJOS = ("torre_eiffel", "sol", "luna", "tierra", "termometro")
PARTICULAS = ("atomos", "celulas", "burbujas", "cristales")
EFECTOS = ("vibran", "se_separan", "se_juntan", "se_mueven")


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
    """Volumen al nivel justo en dos pasadas, sin aplastar la dinámica."""
    err = run(["ffmpeg", "-hide_banner", "-y", "-i", src, "-af", f"loudnorm=I={I}:TP={TP}:LRA=11:print_format=json",
               "-f", "null", "-"], capture=True)
    m = json.loads(err[err.rfind("{"):err.rfind("}") + 1])
    run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af",
         f"loudnorm=I={I}:TP={TP}:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
         f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,"
         f"aresample={SR}", "-ar", SR, "-ac", 1, dst])


def make_voice(sents, work, voice_name, rate, pause, fake=False):
    words, parts, t = [], [], 0.0
    for si, text in enumerate(sents):
        wav = work / f"cv{si}.wav"
        toks = text.split()
        if fake:
            d0, ws = 0.0, []
            for w in toks:
                d = 0.042 * len(w) + 0.07
                ws.append((d0, d0 + d, w)); d0 += d
            run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=mono", "-t", f"{d0:.3f}", wav])
            start = 0.0
        else:
            mp3 = work / f"cv{si}.mp3"
            ws = asyncio.run(_tts(text, voice_name, rate, mp3))
            start = max(0.0, ws[0][0] - 0.04)
            run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-af",
                 f"atrim={start:.3f}:{ws[-1][1] + 0.12:.3f},asetpts=PTS-STARTPTS", "-ar", SR, "-ac", 1, wav])
        d, j = dur(wav), 0
        for a, b, w in ws:  # la voz no trae la puntuación: se recupera del guion
            txt = w
            for jj in range(j, min(j + 3, len(toks))):
                if norm(toks[jj]) == norm(w):
                    txt, j = toks[jj], jj + 1
                    break
            words.append({"s": si, "t": round(t + a - start, 3), "e": round(t + b - start, 3), "x": txt, "n": norm(w)})
        parts.append((wav, t, d))
        t += d + pause
    total = parts[-1][1] + parts[-1][2] + 0.6
    buf = np.zeros(int(total * SR) + SR)
    for wav, at, d in parts:
        x = read_wav(wav); i = int(at * SR); buf[i:i + len(x)] += x
    raw = work / "cvoice_raw.wav"; write_wav(raw, buf[:int(total * SR)])
    out = work / "cvoice.wav"
    if fake:
        out.write_bytes(raw.read_bytes())
    else:
        loudnorm(raw, out, -16, -2)
    spans = [(round(parts[i][1] if i else 0.0, 3), round(parts[i + 1][1] if i + 1 < len(parts) else total, 3))
             for i in range(len(parts))]
    return out, words, spans, total


# ---------------------------------------------------------------- Gemini elige las escenas
PROMPT = """Sos el director de arte de un Short vertical de datos curiosos (estilo motion graphics educativo: fondo azul noche,
objetos ilustrados, cifras grandes en amarillo). Para CADA frase de la narración elegí UNA escena de esta biblioteca y sus datos.

Tipos de escena:
- "objeto": un objeto grande que hace un movimiento. Campos: obj, mov (crece|achica|gira|late|sube|cae|inclina|tiembla|flota), etiquetas (0 a 2 textos de máx. 16 letras).
- "medida": algo que se mide con una cinta que sube y un contador. Campos: obj, valor (número), desde (número, opcional), unidad (ej. "cm", "km", "%", "años"), signo (true si es un aumento "+15").
- "dato": una cifra enorme que cuenta hasta el valor. Campos: obj, valor, unidad, decimales (0 a 2).
- "comparacion": dos cosas lado a lado. Campos: a {obj, txt, valor opcional, unidad opcional}, b {obj, txt, valor opcional, unidad opcional}, entre ("VS", "=", "→" o "≠").
- "cambio": un antes y un después (el mismo objeto que crece, o uno que se convierte en otro). Campos: antes {obj, txt}, despues {obj, txt}, tono ("frio_calor" si pasa de frío a calor, si no "normal"), escala (si es el mismo obj: 0.5 a 1.6).
- "lupa": un objeto y una lupa que muestra lo que pasa por dentro. Campos: obj, particulas (atomos|celulas|burbujas|cristales), efecto (vibran|se_separan|se_juntan|se_mueven), rotulo (máx. 20 letras).
- "lista": hasta 3 ítems que aparecen de a uno. Campos: items [[emoji, texto de máx. 16 letras], ...].

Campos de TODAS las escenas: tipo, fondo (noche|ciudad|espacio|laboratorio|naturaleza|mar|cuerpo), kicker (máx. 3 palabras, contexto),
titulo (máx. 5 palabras, con 1 o 2 palabras clave entre <b> y </b>), clave (UNA palabra exacta de la frase: el momento del impacto visual).
"obj" es UN emoji (ej. "🐙") o uno de estos dibujos: torre_eiffel, sol, luna, tierra, termometro.

Reglas: mostrá el fenómeno, no un símbolo genérico (si algo se estira, que se estire; si algo se mide, medilo).
Usá solo cifras que estén en la frase (nunca inventes números). Variá los tipos: no repitas el mismo tipo más de 2 veces seguidas.
La primera escena es el gancho: tiene que entenderse sola y sorprender. Textos en español neutro, sin tildes faltantes.
Respondé SOLO un JSON: una lista de {n} objetos, en orden.

Narración ({tema}):
{frases}"""


def gemini_specs(sents, idea, models):
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        return None
    prompt = PROMPT.replace("{n}", str(len(sents))).replace("{tema}", idea.get("title", "")).replace(
        "{frases}", "\n".join(f"{i + 1}. {s}" for i, s in enumerate(sents)))
    body = json.dumps({"contents": [{"parts": [{"text": prompt}]}],
                       "generationConfig": {"responseMimeType": "application/json", "temperature": 0.6}}).encode()
    for ronda in range(5):
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
                log(f"Gemini {model} no pudo diseñar las escenas: {e}")
        if ronda < 4:
            time.sleep(20 * (ronda + 1))
    return None


POOL = {"Espacio": ("espacio", "🚀 🪐 ☄️ 🌙 ⭐ 🛰️"), "Cuerpo humano": ("cuerpo", "🧠 🫀 👀 🦴 💪 👂"),
        "Ciencia loca": ("laboratorio", "🧪 ⚡ 🔬 🧲 💥 🌡️"), "Comida increíble": ("noche", "🍔 🍕 🍫 🍌 🍓 🧂"),
        "Inventos por accidente": ("laboratorio", "💡 🛠️ ⚙️ 🔧 🏭 📦"), "Mitos falsos": ("noche", "🤔 ❌ 🧐 ✅ 😮 🔍"),
        "Naturaleza": ("naturaleza", "🌋 🌳 🌊 🍂 🌈 ☀️"), "Lugares increíbles": ("ciudad", "🗺️ 🏛️ 🗼 🌍 🏔️ 🧭")}
STOP = set("que como para pero cuando donde porque esto esta este eso esa tiene tienen hace hacen sobre entre muy más "
           "todo toda todos todas cada desde hasta solo sola también aunque mientras".split())


def _txt(s, n):
    s = re.sub(r"<(?!/?b>)[^>]*>", "", str(s or "")).strip()
    if len(s) > n:  # se corta en la última palabra entera
        s = s[:n].rsplit(" ", 1)[0] if " " in s[:n] else s[:n]
    return s


def _obj(o, pool, k):
    o = str(o or "").strip()
    if o in DIBUJOS or (0 < len(o) <= 8 and not re.search(r"[A-Za-z0-9]", o)):
        return o
    return pool[k % len(pool)]


def _num(v):
    try:
        x = float(str(v).replace(",", "."))
        return x if math.isfinite(x) else None
    except Exception:
        return None


def clean_specs(specs, sents, idea):
    fondo0, pool = POOL.get(idea.get("playlist"), ("noche", "🤯 😮 🔥 💥 👀 ✨"))
    pool = pool.split()
    out = []
    for i, s in enumerate(sents):
        sp = specs[i] if specs and i < len(specs) and isinstance(specs[i], dict) else {}
        words = [w for w in re.findall(r"[\wáéíóúñü]+", s) if len(w) > 3 and w.lower() not in STOP]
        tipo = sp.get("tipo") if sp.get("tipo") in TIPOS else "objeto"
        c = {"tipo": tipo, "fondo": sp.get("fondo") if sp.get("fondo") in FONDOS else fondo0,
             "kicker": _txt(sp.get("kicker"), 26), "obj": _obj(sp.get("obj"), pool, i),
             "clave": norm(str(sp.get("clave") or (max(words, key=len) if words else "")))}
        t = _txt(sp.get("titulo"), 44)
        if not re.sub(r"<[^>]+>", "", t).strip():
            t = " ".join(words[:3]) or s[:30]
            if words:
                t = t.replace(max(words, key=len), f"<b>{max(words, key=len)}</b>", 1)
        c["titulo"] = t
        if tipo == "objeto":
            c["mov"] = sp.get("mov") if sp.get("mov") in MOVS else "flota"
            c["etiquetas"] = [_txt(x, 18) for x in (sp.get("etiquetas") or [])[:2] if _txt(x, 18)]
        elif tipo in ("medida", "dato"):
            v = _num(sp.get("valor"))
            if v is None:
                c.update(tipo="objeto", mov="crece", etiquetas=[])
            else:
                c.update(valor=v, desde=_num(sp.get("desde")) or 0, unidad=_txt(sp.get("unidad"), 10),
                         signo=bool(sp.get("signo")), decimales=int(min(2, max(0, _num(sp.get("decimales")) or 0))))
                if c["decimales"] == 0 and abs(v - round(v)) > 1e-9:
                    c["decimales"] = 1
        elif tipo == "comparacion":
            for side in ("a", "b"):
                x = sp.get(side) if isinstance(sp.get(side), dict) else {}
                c[side] = {"obj": _obj(x.get("obj"), pool, i + (side == "b")), "txt": _txt(x.get("txt"), 16),
                           "valor": _num(x.get("valor")), "unidad": _txt(x.get("unidad"), 8)}
            c["entre"] = sp.get("entre") if sp.get("entre") in ("VS", "=", "→", "≠") else "VS"
        elif tipo == "cambio":
            for side in ("antes", "despues"):
                x = sp.get(side) if isinstance(sp.get(side), dict) else {}
                c[side] = {"obj": _obj(x.get("obj"), pool, i + (side == "despues")), "txt": _txt(x.get("txt"), 16)}
            c["tono"] = "frio_calor" if sp.get("tono") == "frio_calor" else "normal"
            c["escala"] = min(1.6, max(.5, _num(sp.get("escala")) or 1.3))
        elif tipo == "lupa":
            c["particulas"] = sp.get("particulas") if sp.get("particulas") in PARTICULAS else "atomos"
            c["efecto"] = sp.get("efecto") if sp.get("efecto") in EFECTOS else "vibran"
            c["rotulo"] = _txt(sp.get("rotulo"), 22)
        elif tipo == "lista":
            items = [[_obj(x[0], pool, i + k), _txt(x[1], 22)] for k, x in enumerate(sp.get("items") or [])
                     if isinstance(x, (list, tuple)) and len(x) >= 2][:3]
            if not items:
                c.update(tipo="objeto", mov="flota", etiquetas=[])
            c["items"] = items
        out.append(c)
    return out


# ---------------------------------------------------------------- subtítulos (grupos con sentido, palabra por palabra)
FUNC = {"la", "el", "lo", "los", "las", "un", "una", "de", "del", "en", "que", "se", "y", "a", "no", "con", "por",
        "hasta", "más", "como", "pero", "es", "esos", "cada", "su", "sus", "al"}


def chunks(words, spans, keywords):
    out = []
    for si, (A, Bn) in enumerate(spans):
        toks = [{"x": w["x"], "t": w["t"], "k": w["n"] in keywords} for w in words if w["s"] == si]
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
            a = max(A, g[0]["t"] - 0.05)
            b = groups[k + 1][0]["t"] - 0.05 if k + 1 < len(groups) else Bn
            out.append({"a": round(a, 3), "b": round(b, 3), "w": g})
    return out


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

    def pop():
        t = tt(.18); return np.sin(2 * np.pi * (500 + 900 * np.exp(-28 * t)) * t) * np.exp(-22 * t)

    def sweep(f0, f1, d, g=.4):
        t = tt(d); f = f0 + (f1 - f0) * (t / d)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * g

    def chime():
        t = tt(1.0); return (np.sin(2 * np.pi * 880 * t) + .6 * np.sin(2 * np.pi * 1320 * t)) * np.exp(-t * 3.5) * .35

    whoosh = lp(np.diff(rng.standard_normal(int(.45 * SR)), prepend=0), 2500) * np.sin(np.pi * tt(.45) / .45) ** 2 * 2.2
    prev = None
    for i, sc in enumerate(scenes):
        sp, a, k, ke = sc["spec"], sc["a"], sc["k"], sc["ke"]
        if i and sp["tipo"] != prev:          # whoosh solo cuando cambia el tipo de escena (no en cada corte)
            put(whoosh, a - .25, .55)
        prev = sp["tipo"]
        if sp["tipo"] == "medida":
            end = max(a + .9, ke)
            for j in range(1, 6):
                put(click(1900 + 120 * j), a + .3 + (end - a - .3) * j / 5, .5)
            put(boom(.8, 120, 45) + .25 * chime()[:int(.8 * SR)], end, .85)
        elif sp["tipo"] == "dato":
            put(boom(.7), max(a + .8, ke), .85)
        elif sp["tipo"] == "cambio":
            put(sweep(220, 760, .5, .3) if sp.get("tono") == "frio_calor" else sweep(300, 600, .4, .25), k - .2, 1)
            put(pop(), k + .1, .5)
        elif sp["tipo"] == "comparacion":
            put(pop(), a + .45, .45); put(pop(), min(k, a + 1.2), .5)
        elif sp["tipo"] == "lista":
            d, nn = sc["b"] - a, max(1, len(sp.get("items", [])))
            for j in range(nn):
                put(pop(), a + .15 + j * min(.9, (d - .6) / nn), .45)
        elif sp["tipo"] == "lupa":
            put(sweep(140, 340, 1.0, .16), a + .2, 1)
        elif sp.get("mov") in ("crece", "late", "gira", "achica", "sube"):
            put(pop(), k, .5)
    put(chime(), scenes[-1]["k"] + .2, .5)
    p = work / "csfx.wav"; write_wav(p, out[:int(total * SR)]); return p


def mix(voice, sfx, total, work):
    import music as music_gen
    track = music_gen.make_track(total + 2, random.randrange(10 ** 6), work / "cmusic.wav")
    pre = work / "cmix_pre.wav"
    af = (f"[1:a]aresample={SR},volume=0.30,afade=t=in:d=0.4[mus];[0:a]asplit=2[vo][key];"
          f"[mus][key]sidechaincompress=threshold=0.035:ratio=7:attack=20:release=350[duck];[2:a]volume=0.6[fx];"
          f"[vo][duck][fx]amix=inputs=3:duration=first:normalize=0,afade=t=out:st={max(0, total - .7):.2f}:d=0.7,"
          f"alimiter=limit=0.8:level=false[a]")
    run(["ffmpeg", "-v", "error", "-y", "-i", voice, "-i", track, "-i", sfx, "-filter_complex", af,
         "-map", "[a]", "-t", f"{total:.3f}", "-ar", SR, "-ac", 1, pre])
    final = work / "cmix.wav"
    loudnorm(pre, final, -14, -2)
    return final


# ---------------------------------------------------------------- filmación
def fonts(work):
    """Montserrat (texto) y Noto Color Emoji vectorial (emojis nítidos a cualquier tamaño). Se bajan una vez."""
    d = ROOT / "fonts"
    urls = {"Montserrat.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf",
            "NotoColorEmoji-COLR.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/notocoloremoji/NotoColorEmoji-Regular.ttf"}
    got = {}
    for name, url in urls.items():
        p = d / name
        if not p.exists():
            try:
                run(["curl", "-sSfL", "--retry", "3", url, "-o", p])
            except Exception as e:
                log(f"No pude bajar {name}: {str(e)[:120]}")
                p.unlink(missing_ok=True)
        got[name] = p if p.exists() else None
    txt = got["Montserrat.ttf"] or (d / "Inter-Black.otf")
    if not txt.exists():
        raise RuntimeError("No hay fuente para el texto")
    emo = got["NotoColorEmoji-COLR.ttf"]
    return txt.as_uri(), emo.as_uri() if emo else "local('Noto Color Emoji')"


def film(data, total, video, work):
    from playwright.sync_api import sync_playwright
    furl, eurl = fonts(work)
    html = (ROOT / "cine_escena.html").read_text(encoding="utf-8")
    html = html.replace("FONTURL", furl).replace("EMOJIURL", eurl).replace("/*DATA*/null", json.dumps(data, ensure_ascii=False))
    page = work / "cine.html"; page.write_text(html, encoding="utf-8")
    frames = int(math.ceil(total * FPS))
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg",
                           "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
                           "-profile:v", "high", "-r", str(FPS), str(video)], stdin=subprocess.PIPE)
    try:
        with sync_playwright() as p:
            br = p.chromium.launch(args=["--allow-file-access-from-files"])
            pg = br.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
            pg.goto(page.as_uri())
            pg.wait_for_function("window.READY === true")
            pg.evaluate("document.fonts.ready")
            pg.wait_for_timeout(500)
            for f in range(frames):
                pg.evaluate(f"render({f / FPS:.4f})")
                ff.stdin.write(pg.screenshot(type="jpeg", quality=93))
            br.close()
    finally:
        ff.stdin.close(); ff.wait()
    if ff.returncode:
        raise RuntimeError("ffmpeg falló al armar la imagen")


def check(out, total):
    info = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(out)]))
    v = [x for x in info["streams"] if x["codec_type"] == "video"]
    a = [x for x in info["streams"] if x["codec_type"] == "audio"]
    d = float(info["format"]["duration"])
    if not v or not a or (int(v[0]["width"]), int(v[0]["height"])) != (W, H) or abs(d - total) > 0.4:
        raise RuntimeError(f"El video salió mal (duración {d:.1f}s de {total:.1f}s)")
    e = run(["ffmpeg", "-hide_banner", "-i", out, "-vf", f"crop={W}:{int(H * .5)}:0:{int(H * .14)},freezedetect=n=0.002:d=0.8",
             "-an", "-f", "null", "-"], capture=True)
    fr = re.findall(r"freeze_start: ([\d.]+)", e)
    if fr:
        raise RuntimeError(f"Imagen quieta en {fr}")
    e = run(["ffmpeg", "-hide_banner", "-i", out, "-af", "ebur128=peak=true", "-vn", "-f", "null", "-"], capture=True)
    tail = e[e.rfind("Summary:"):]
    return {"duracion": round(d, 2), "lufs": float(re.search(r"I:\s+(-?[\d.]+)", tail).group(1)),
            "pico": float(re.search(r"Peak:\s+(-?[\d.]+)", tail).group(1))}


# ---------------------------------------------------------------- todo junto
def make_video(idea, work, out, cfg, fake=False):
    """Arma el Short terminado en "out". Devuelve un resumen. Si algo sale mal, levanta un error."""
    work.mkdir(parents=True, exist_ok=True)
    sents = sentences(idea["narration"])
    voice, words, spans, total = make_voice(sents, work, cfg.get("voice", "es-MX-JorgeNeural"),
                                            cfg.get("voice_rate", "+20%"), cfg.get("cine_pause", 0.18), fake)
    specs = None if fake else gemini_specs(sents, idea, cfg.get("gemini_models", []))
    spec_file = work / "cine_specs.json"
    if fake and spec_file.exists():
        specs = json.loads(spec_file.read_text(encoding="utf-8"))
    if not specs:
        log("Gemini no respondió: escenas simples del tema")
    specs = clean_specs(specs, sents, idea)
    spec_file.write_text(json.dumps(specs, ensure_ascii=False, indent=1), encoding="utf-8")
    scenes = []
    for i, ((a, b), sp) in enumerate(zip(spans, specs)):
        ws = [w for w in words if w["s"] == i]
        hit = next((w for w in ws if sp["clave"] and (w["n"] == sp["clave"] or w["n"].startswith(sp["clave"][:6]))), None)
        k, ke = (hit["t"], hit["e"]) if hit else (a + (b - a) * .45, a + (b - a) * .6)
        scenes.append({"a": a, "b": b, "k": round(k, 3), "ke": round(ke, 3), "spec": sp})
    kw = {norm(w) for ph in idea.get("highlight", []) for w in ph.split() if len(norm(w)) >= 4 or norm(w).isdigit()}
    kw |= {sp["clave"] for sp in specs if sp["clave"]}
    kw |= {norm(w) for sp in specs for w in re.findall(r"<b>(.*?)</b>", sp["titulo"]) for w in w.split() if len(norm(w)) >= 4}
    kw -= FUNC
    data = {"scenes": scenes, "chunks": chunks(words, spans, kw), "total": total}
    (work / "cine_timeline.json").write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    log(f"{len(scenes)} escenas: " + ", ".join(s["spec"]["tipo"] for s in scenes) + f" ({total:.1f}s)")
    sfx = sfx_track(scenes, total, work)
    audio = mix(voice, sfx, total, work)
    video = work / "cine_video.mp4"
    film(data, total, video, work)
    run(["ffmpeg", "-v", "error", "-y", "-i", video, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
         "-c:a", "aac", "-b:a", "192k", "-ar", SR, "-t", f"{total:.3f}", "-movflags", "+faststart", out])
    rep = check(out, total)
    rep["escenas"] = len(scenes)
    log(f"Video listo y revisado: {rep}")
    return rep


if __name__ == "__main__":
    iid = sys.argv[1] if len(sys.argv) > 1 else "030"
    cfg = json.loads((ROOT / "config.json").read_text(encoding="utf-8"))
    ideas = {i["id"]: i for i in json.loads((ROOT / "ideas.json").read_text(encoding="utf-8"))}
    d = ROOT / "demo"; d.mkdir(exist_ok=True)
    w = ROOT / "work_cine"
    rep = make_video(ideas[iid], w, d / f"cine_{iid}.mp4", cfg, fake="--fake" in sys.argv)
    for f in ("cine_specs.json",):
        (d / f"cine_{iid}_specs.json").write_text((w / f).read_text(encoding="utf-8"), encoding="utf-8")
    print(json.dumps(rep))
