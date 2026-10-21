"""
Fábrica diaria de Shorts con IA gratis.

1. Toma la próxima idea de ideas.json que no esté en done.json
2. Genera una imagen por escena (Qwen-Image, Hugging Face) y la anima (Wan 2.2)
3. Voz en español (Microsoft Edge TTS, gratis) + subtítulos palabra por palabra
4. Arma el Short 9:16 con ffmpeg
5. Lo sube a YouTube (si están cargados los secretos) y marca la idea como hecha

Variables de entorno: HF_TOKEN (obligatoria), HF_TOKEN_2, GEMINI_API_KEY, YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN (opcionales)
"""
import asyncio, hashlib, json, os, re, shutil, subprocess, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CFG = json.loads((ROOT / "config.json").read_text(encoding="utf-8"))
OUT = ROOT / "output"
W, H, FPS = 1080, 1920, 30


def log(*a):
    print("[shorts]", *a, flush=True)


def run(cmd):
    r = subprocess.run([str(c) for c in cmd], capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-3000:])
        raise RuntimeError("ffmpeg falló")
    return r.stdout


def duration(p):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).strip())


# ---------------------------------------------------------------- Hugging Face
HF_TOKENS = [t for t in (os.environ.get("HF_TOKEN"), os.environ.get("HF_TOKEN_2")) if t]
_tok = [0]


def hf_client(space):
    from gradio_client import Client
    return Client(space, token=HF_TOKENS[_tok[0]] if HF_TOKENS else None)


def is_quota(e):
    return "quota" in str(e).lower()


def with_tokens(fn, *a, **k):
    """Si se acaba la cuota con una cuenta de Hugging Face, sigue con la otra."""
    while True:
        try:
            return fn(*a, **k)
        except Exception as e:
            if is_quota(e) and _tok[0] + 1 < len(HF_TOKENS):
                _tok[0] += 1
                log("Cuota agotada en esta cuenta de Hugging Face; sigo con la segunda.")
                continue
            raise


def call_space(client, candidates, **kwargs):
    """Prueba los nombres de endpoint conocidos; si cambian, usa el primero que exista."""
    names = list(candidates)
    try:
        info = client.view_api(return_format="dict", print_info=False)
        names += [n for n in info.get("named_endpoints", {}) if n not in names]
    except Exception:
        pass
    last = None
    for n in names:
        try:
            return client.predict(api_name=n, **kwargs)
        except Exception as e:  # endpoint equivocado o cuota
            last = e
            if "quota" in str(e).lower():
                raise
    raise last


def as_path(x):
    """Las Spaces devuelven rutas, dicts o tuplas; saca la ruta del archivo."""
    if isinstance(x, (list, tuple)):
        for item in x:
            p = as_path(item)
            if p:
                return p
        return None
    if isinstance(x, dict):
        for k in ("video", "path", "image", "name", "value"):
            if k in x:
                p = as_path(x[k])
                if p:
                    return p
        return None
    if isinstance(x, str) and os.path.exists(x):
        return x
    return None


def make_image(prompt, dest):
    c = hf_client(CFG["image_space"])
    res = call_space(c, ["/generate_image", "/infer", "/generate"],
                     prompt=prompt, aspect_ratio="9:16", randomize_seed=True)
    p = as_path(res)
    if not p:
        raise RuntimeError(f"La imagen no volvió como archivo: {res!r}")
    run(["ffmpeg", "-v", "error", "-y", "-i", p, dest])
    return dest


def make_clip(image, prompt, seconds, dest):
    from gradio_client import handle_file
    c = hf_client(CFG["video_space"])
    res = call_space(c, ["/generate_video", "/generate", "/infer"],
                     input_image=handle_file(str(image)), prompt=prompt,
                     duration_seconds=seconds, steps=CFG["video_steps"], randomize_seed=True)
    p = as_path(res)
    if not p:
        raise RuntimeError(f"El video no volvió como archivo: {res!r}")
    shutil.copy(p, dest)
    return dest


# ---------------------------------------------------------------- Voz
def sentences(text):
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text.strip()) if s.strip()]


async def _tts(text, path):
    import edge_tts
    await edge_tts.Communicate(text, CFG["voice"], rate=CFG["voice_rate"]).save(str(path))


def make_voice(text, work):
    pause = CFG["pause_between_sentences"]
    t, timeline, parts = 0.0, [], []
    for i, s in enumerate(sentences(text)):
        mp3, wav = work / f"v{i}.mp3", work / f"v{i}.wav"
        asyncio.run(_tts(s, mp3))
        run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-af",
             "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
             "silenceremove=start_periods=1:start_threshold=-45dB,areverse",
             "-ar", "48000", "-ac", "1", wav])
        d = duration(wav)
        timeline.append((s, t, t + d))
        parts.append(wav)
        t += d + pause
    gap = work / "gap.wav"
    run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", pause, gap])
    lst = work / "list.txt"
    lst.write_text("".join(f"file '{p.as_posix()}'\n" + (f"file '{gap.as_posix()}'\n" if i < len(parts) - 1 else "")
                           for i, p in enumerate(parts)))  # sin silencio después de la última frase
    raw = work / "voice_raw.wav"
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, raw])
    # normalizar el volumen en un paso aparte (dentro del armado cortaba el final de la voz)
    voice = work / "voice.wav"
    run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000",
         "-ar", "48000", "-ac", "1", voice])
    return voice, timeline


# ---------------------------------------------------------------- Subtítulos
def ts(t):
    return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"


def _norm(w):
    return re.sub(r"[^\wáéíóúñü]", "", w.lower())


def make_subs(timeline, out, highlight=(), video_len=None):
    st = CFG["captions"]
    stop = {"todos", "todo", "para", "como", "pero", "este", "esta", "cada", "solo", "tiene", "hasta", "desde"}
    hl = {_norm(w) for ph in highlight for w in ph.split()
          if (len(_norm(w)) >= 4 or _norm(w).isdigit()) and _norm(w) not in stop}
    color = st.get("highlight_color", "&H00D7FF&")
    caps = []
    for sent, a, b in timeline:
        words = sent.split()
        weights = [len(w) + 2 for w in words]
        total = sum(weights)
        group, groups = [], []
        for w, wt in zip(words, weights):
            group.append((w, wt))
            if len(group) >= st["words_per_caption"] or re.search(r"[,.!?;:]$", w):
                groups.append(group); group = []
        if group:
            groups.append(group)
        t = a
        for g in groups:
            d = (b - a) * sum(x for _, x in g) / total
            ws = [w for w, _ in g]
            ws[-1] = ws[-1].rstrip(",;:")
            ws = [w.upper() if st["uppercase"] else w for w in ws]
            txt = " ".join(f"{{\\c{color}}}{w}{{\\c&HFFFFFF&}}" if _norm(w) in hl else w for w in ws)
            caps.append([t, t + d, txt])
            t += d
    for i in range(len(caps) - 1):  # sin huecos en las pausas
        caps[i][1] = caps[i + 1][0]
    pop = "{\\fscx85\\fscy85\\t(0,80,\\fscx100\\fscy100)}"
    lines = [f"Dialogue: 0,{ts(a)},{ts(b)},Cap,,0,0,0,,{pop}{txt}" for a, b, txt in caps]
    end = video_len or (caps[-1][1] if caps else 0)
    if CFG.get("handle"):  # marca del canal arriba, por si lo suben a TikTok/Instagram
        lines.append(f"Dialogue: 1,{ts(0)},{ts(end)},Mark,,0,0,0,,{CFG['handle']}")
    if CFG.get("end_card", True) and end > 6:  # cartel final con la mascota
        a = end - CFG.get("end_card_seconds", 2.6)
        lines.append(f"Dialogue: 2,{ts(a)},{ts(end)},End,,0,0,0,,{{\\fscx40\\fscy40\\t(0,180,\\fscx110\\fscy110)\\t(180,300,\\fscx100\\fscy100)}}¡SUSCRÍBETE!")
    out.write_text(f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,{st['font']},{st['size']},&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,1,0,1,{st['outline']},0,2,80,80,{st['margin_bottom']},1
Style: Mark,{st['font']},38,&H60FFFFFF,&H60FFFFFF,&H90000000,&H00000000,0,0,0,0,100,100,1,0,1,2,0,8,40,40,150,1
Style: End,{st['font']},96,&H00FFFFFF,&H00FFFFFF,&H001A6BFF,&H00000000,0,0,0,0,100,100,2,0,1,8,0,5,40,40,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""" + "\n".join(lines) + "\n", encoding="utf-8")


# ---------------------------------------------------------------- Armado
def crop_variant(src, dest, where):
    """Otra toma de la misma imagen: un acercamiento (centro) o la parte de abajo."""
    y = {"center": "(ih-oh)/2", "bottom": "ih-oh"}[where]
    run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vf",
         f"crop=iw*0.62:ih*0.62:(iw-ow)/2:{y},scale={W}:{H}:flags=lanczos", dest])

def make_sfx(work, total, whooshes, pops):
    """Efectos de sonido propios (sin derechos de autor): whoosh en cada corte y pop en el dato fuerte."""
    wh, pp = work / "whoosh.wav", work / "pop.wav"
    run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anoisesrc=d=0.45:c=pink:r=48000:a=0.9",
         "-af", "highpass=f=500,lowpass=f=5000,afade=t=in:d=0.3:curve=exp,afade=t=out:st=0.3:d=0.15,volume=0.5", wh])
    run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i",
         "aevalsrc=0.9*sin(2*PI*(500+900*exp(-28*t))*t)*exp(-22*t):s=48000:d=0.18", pp])
    ev = [(wh, max(0.0, t - 0.3)) for t in whooshes] + [(pp, t) for t in pops]
    out = work / "sfx.wav"
    if not ev:
        run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", f"{total:.2f}", out])
        return out
    ins, ch = [], []
    for k, (f, t) in enumerate(ev):
        ins += ["-i", f]
        ch.append(f"[{k}:a]adelay={int(t * 1000)}:all=1[e{k}]")
    fc = ";".join(ch) + ";" + "".join(f"[e{k}]" for k in range(len(ev))) + \
        f"amix=inputs={len(ev)}:normalize=0,apad,atrim=0:{total:.2f}[a]"
    run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", fc, "-map", "[a]", "-ac", "1", "-ar", "48000", out])
    return out


def mascot_png(work):
    b = ROOT / "mascot.b64"
    if not b.exists():
        return None
    import base64
    p = work / "mascot.webp"
    p.write_bytes(base64.b64decode(b.read_text()))
    return p


def assemble(visuals, voice, subs, total, out, sfx=None, mascot=None):
    """visuals: lista de (archivo, es_video, segundos en pantalla)."""
    inputs, chains = [], []
    look = f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H},unsharp=5:5:0.6,fps={FPS},setsar=1"
    for i, (f, is_video, secs) in enumerate(visuals):
        if is_video:
            d = duration(f)
            stretch = min(max(secs / d, 1.0), 1.5)  # cámara lenta suave si falta duración
            inputs += ["-i", f]
            chains.append(f"[{i}:v]setpts={stretch:.3f}*PTS,{look},tpad=stop_mode=clone:stop_duration={secs},trim=0:{secs:.3f},setpts=PTS-STARTPTS[s{i}]")
        else:  # imagen fija con zoom lento
            frames = int(secs * FPS) + 1
            inputs += ["-loop", "1", "-t", f"{secs:.3f}", "-i", f]
            moves = [  # zoom in, zoom out, paneo a la derecha, paneo hacia arriba
                ("min(zoom+0.0012,1.18)", "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"),
                ("max(1.18-0.0012*on,1.0)", "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"),
                ("1.15", f"(iw-iw/zoom)*on/{frames}", "ih/2-(ih/zoom/2)"),
                ("1.15", "iw/2-(iw/zoom/2)", f"(ih-ih/zoom)*(1-on/{frames})"),
            ]
            z, x, y = moves[i % len(moves)]
            chains.append(f"[{i}:v]scale={W*2}:{H*2}:force_original_aspect_ratio=increase,crop={W*2}:{H*2},"
                          f"zoompan=z='{z}':x='{x}':y='{y}':d={frames}:s={W}x{H}:fps={FPS},setsar=1[s{i}]")
    n = len(visuals)
    fontsdir = (ROOT / "fonts").as_posix()
    vf = ";".join(chains) + ";" + "".join(f"[s{i}]" for i in range(n)) + \
        f"concat=n={n}:v=1:a=0,ass={subs.as_posix()}:fontsdir={fontsdir}[v]"
    vi, ai, si, mi = n, n + 1, n + 2, n + 3
    extra = ["-i", sfx] if sfx else ["-f", "lavfi", "-t", f"{total:.2f}", "-i", "anullsrc=r=48000:cl=mono"]
    if mascot:  # la mascota entra saltando en el cartel final
        a = total - CFG.get("end_card_seconds", 2.6)
        extra += ["-loop", "1", "-t", f"{total:.2f}", "-i", mascot]
        vf = vf.replace("[v]", "[v0]") + (f";[{mi}:v]scale=-1:430,format=rgba[m];"
              f"[v0][m]overlay=x=(W-w)/2:y='if(lt(t-{a:.2f},0.35),H-(H-470)*(t-{a:.2f})/0.35,470)':enable='gte(t,{a:.2f})'[v]")
    tracks = sorted(p for p in (ROOT / "music").rglob("*") if p.suffix.lower() in (".mp3", ".wav", ".m4a", ".ogg"))
    if tracks:  # música de fondo: tema al azar, desde un punto al azar, que baja sola cuando habla la voz
        import random
        track = random.choice(tracks)
        start = random.uniform(0, max(0.0, duration(track) - total - 2))
        log(f"Música: {track.name}")
        ain = ["-ss", f"{start:.2f}", "-stream_loop", "-1", "-i", track]
        m = CFG["music"]
        af = (f"[{vi}:a]aresample=48000,asplit=2[vo][key];"
              f"[{ai}:a]aresample=48000,aformat=channel_layouts=mono,volume={m['volume']},afade=t=in:d=1[mus];"
              f"[mus][key]sidechaincompress=threshold=0.06:ratio={m['duck_ratio']}:attack=30:release=500[duck];"
              f"[{si}:a]aresample=48000,volume={CFG.get('sfx_volume', 0.5)}[fx];"
              f"[vo][duck][fx]amix=inputs=3:duration=first:normalize=0,apad=pad_dur=2,afade=t=out:st={total - 0.12:.2f}:d=0.12[a]")
    else:  # sin música: un zumbido ambiente muy bajo
        ain = ["-f", "lavfi", "-i", "anoisesrc=color=brown:amplitude=0.5:r=48000"]
        af = (f"[{ai}:a]lowpass=f=320,volume={CFG['ambience_volume']}[amb];[{vi}:a]aresample=48000[vo];"
              f"[{si}:a]aresample=48000,volume={CFG.get('sfx_volume', 0.5)}[fx];"
              f"[vo][amb][fx]amix=inputs=3:duration=first:normalize=0,apad=pad_dur=2,afade=t=out:st={total - 0.12:.2f}:d=0.12[a]")
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-i", voice, *ain, *extra,
         "-filter_complex", vf + ";" + af, "-map", "[v]", "-map", "[a]", "-t", f"{total:.2f}",
         "-c:v", "libx264", "-crf", "19", "-preset", "medium", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", out])


# ---------------------------------------------------------------- YouTube
def youtube_title(idea):
    t = idea.get("yt_title") or idea["title"]
    return f"{t} #shorts"[:100]


def youtube_description(idea):
    hook = sentences(idea["narration"])[0]
    tags = [re.sub(r"[^\wáéíóúñü]", "", t.lower()) for t in idea.get("tags", [])]
    hashtags = " ".join(f"#{t}" for t in dict.fromkeys(tags + ["curiosidades", "sabiasque", "datoscuriosos", "shorts"]) if t)
    return (f"{hook}\n\n"
            "🤔 ¿Lo sabías? Cuéntalo en los comentarios 👇\n"
            "🔔 Suscríbete: un dato nuevo todos los días.\n\n"
            f"{hashtags}")


def upload(video, idea):
    need = ("YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN")
    if not all(os.environ.get(k) for k in need):
        log("Sin datos de YouTube: el video queda para descargar desde GitHub.")
        return None
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    creds = Credentials(None, refresh_token=os.environ["YT_REFRESH_TOKEN"],
                        client_id=os.environ["YT_CLIENT_ID"], client_secret=os.environ["YT_CLIENT_SECRET"],
                        token_uri="https://oauth2.googleapis.com/token")
    yt = build("youtube", "v3", credentials=creds)
    body = {
        "snippet": {"title": youtube_title(idea),
                    "description": youtube_description(idea),
                    "tags": list(dict.fromkeys(idea.get("tags", []) + CFG["extra_tags"]))[:15],
                    "categoryId": "27", "defaultLanguage": "es", "defaultAudioLanguage": "es"},
        "status": {"privacyStatus": CFG["privacy"], "selfDeclaredMadeForKids": False,
                   "containsSyntheticMedia": False},
    }
    req = yt.videos().insert(part="snippet,status", body=body,
                             media_body=MediaFileUpload(str(video), chunksize=-1, resumable=True))
    resp = None
    while resp is None:
        _, resp = req.next_chunk()
    log("Subido: https://youtube.com/shorts/" + resp["id"])
    extras(yt, resp["id"], idea)
    return resp["id"]


def extras(yt, vid, idea):
    """Comentario con pregunta + lista por tema. Necesita el permiso youtube.force-ssl; si no está, se saltea."""
    q = idea.get("question") or CFG.get("comment", "🤯 ¿Lo sabías? Escribe SÍ o NO 👇 ¿Qué tema quieres para mañana?")
    try:
        yt.commentThreads().insert(part="snippet", body={"snippet": {"videoId": vid, "topLevelComment": {
            "snippet": {"textOriginal": q}}}}).execute()
        log("Comentario publicado")
    except Exception as e:
        log(f"Sin comentario automático ({str(e)[:120]})")
    name = idea.get("playlist")
    if not name:
        return
    try:
        pid = None
        req = yt.playlists().list(part="snippet", mine=True, maxResults=50)
        while req and not pid:
            res = req.execute()
            pid = next((p["id"] for p in res.get("items", []) if p["snippet"]["title"] == name), None)
            req = yt.playlists().list_next(req, res)
        if not pid:
            pid = yt.playlists().insert(part="snippet,status", body={
                "snippet": {"title": name, "description": f"{name}: datos curiosos en 30 segundos. Uno nuevo cada día."},
                "status": {"privacyStatus": "public"}}).execute()["id"]
        yt.playlistItems().insert(part="snippet", body={"snippet": {
            "playlistId": pid, "resourceId": {"kind": "youtube#video", "videoId": vid}}}).execute()
        log(f"Agregado a la lista: {name}")
    except Exception as e:
        log(f"Sin lista ({str(e)[:120]})")


# ---------------------------------------------------------------- Ideas nuevas solas
IDEA_PROMPT = """Eres el guionista del canal de YouTube Shorts "El Porqué de Todo": datos curiosos explicados en 30 segundos.
Escribe {n} ideas NUEVAS en español neutro (tú, nunca vos; nada de palabras argentinas), sobre temas distintos a estos ya usados:
{used}

Reglas:
- Solo datos reales y comprobados por la ciencia. Si no estás seguro de un dato, no lo uses.
- La primera frase es un gancho que sorprende. La última frase es un final "wow".
- Narración de 70 a 85 palabras, frases cortas y fáciles de decir en voz alta. Números escritos en letras.
- 5 escenas: "image" en inglés describiendo una imagen 3D estilo animación; las 3 primeras también llevan "motion" en inglés (movimiento simple de 4 segundos).
- "playlist" es una de: Animales increíbles, Cuerpo humano, Espacio, Ciencia loca, Comida increíble, Inventos por accidente, Mitos falsos, Naturaleza, Lugares increíbles.
- "highlight": 2 palabras o frases cortas de la narración para resaltar en amarillo.
- "yt_title": título corto que dé curiosidad, con un emoji al final.

Devuelve SOLO un JSON con una lista de objetos con estas claves: title, yt_title, narration, scenes, tags, playlist, highlight.
Ejemplo de una idea:
{example}"""


def gemini_ideas(ideas, n=10):
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        return []
    import urllib.request
    used = "\n".join("- " + i["title"] for i in ideas)
    ex = {k: ideas[-1][k] for k in ("title", "yt_title", "narration", "scenes", "tags", "playlist", "highlight") if k in ideas[-1]}
    prompt = IDEA_PROMPT.format(n=n, used=used, example=json.dumps(ex, ensure_ascii=False))
    body = json.dumps({"contents": [{"parts": [{"text": prompt}]}],
                       "generationConfig": {"responseMimeType": "application/json", "temperature": 0.9}}).encode()
    for model in CFG.get("gemini_models", ["gemini-flash-latest", "gemini-2.5-flash"]):
        try:
            req = urllib.request.Request(
                f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                data=body, headers={"Content-Type": "application/json", "x-goog-api-key": key})
            with urllib.request.urlopen(req, timeout=180) as r:
                txt = json.loads(r.read())["candidates"][0]["content"]["parts"][0]["text"]
            new = json.loads(txt)
            good = []
            for it in new:
                sc = it.get("scenes", [])
                if (isinstance(it.get("narration"), str) and 50 <= len(it["narration"].split()) <= 100
                        and len(sc) >= 3 and all("image" in x for x in sc) and it.get("title")):
                    good.append(it)
            log(f"Gemini ({model}) escribió {len(good)} ideas nuevas")
            return good
        except Exception as e:
            log(f"Gemini {model} falló: {e}")
    return []


def refill_ideas(ideas, done):
    pending = [i for i in ideas if i["id"] not in done]
    if len(pending) >= CFG.get("min_pending_ideas", 7):
        return ideas
    new = gemini_ideas(ideas)
    if not new:
        if len(pending) < 3:
            log("⚠️ Quedan muy pocas ideas. Pedile a Claude más ideas o cargá GEMINI_API_KEY.")
        return ideas
    nxt = max(int(i["id"]) for i in ideas) + 1
    for k, it in enumerate(new):
        it["id"] = f"{nxt + k:03d}"
        ideas.append(it)
    (ROOT / "ideas.json").write_text(json.dumps(ideas, ensure_ascii=False, indent=2), encoding="utf-8")
    return ideas


# ---------------------------------------------------------------- Principal
def today_ar():
    from datetime import datetime, timedelta, timezone
    return datetime.now(timezone(timedelta(hours=-3))).strftime("%Y-%m-%d")


def main():
    ideas = json.loads((ROOT / "ideas.json").read_text(encoding="utf-8"))
    done_p = ROOT / "done.json"
    done = json.loads(done_p.read_text(encoding="utf-8")) if done_p.exists() else {}
    per_day = CFG.get("videos_per_day", 1)
    if not os.environ.get("FORCE") and sum(1 for v in done.values() if v.get("date") == today_ar()) >= per_day:
        log("Hoy ya se subió el video del día. Nada que hacer.")
        return
    ideas = refill_ideas(ideas, done)
    pending = [i for i in ideas if i["id"] not in done]
    if not pending:
        log("No quedan ideas nuevas. Agregá más a ideas.json.")
        return
    idea = pending[0]
    log(f"Idea {idea['id']}: {idea['title']}")
    work = ROOT / "work" / idea["id"]
    shutil.rmtree(work, ignore_errors=True)
    work.mkdir(parents=True)
    OUT.mkdir(exist_ok=True)

    voice, timeline = make_voice(idea["narration"], work)
    total = duration(voice) + CFG.get("end_padding", 0.15)  # corta apenas termina de hablar
    subs = work / "subs.ass"
    make_subs(timeline, subs, idea.get("highlight", []), total)
    log(f"Voz lista: {total:.1f}s")

    # 1) Primero todas las imágenes (gastan poca cuota), sin repetidas.
    scenes = idea["scenes"]
    per = total / len(scenes)
    imgs, hashes = [], set()
    for k, sc in enumerate(scenes, 1):
        img = work / f"scene{k}.png"
        ok = False
        for attempt in range(3):
            try:
                extra = "" if attempt == 0 else f", variation {attempt}, different composition"
                with_tokens(make_image, f"{CFG['style']} {sc['image']}{extra}. Vertical composition, no text.", img)
                h = hashlib.md5(img.read_bytes()).hexdigest()
                if h in hashes:
                    log(f"Imagen {k} salió repetida; pido otra")
                    continue
                hashes.add(h); ok = True
                log(f"Imagen {k} lista")
                break
            except Exception as e:
                log(f"Imagen {k} falló ({e})")
                if "quota" in str(e).lower():
                    break
                time.sleep(10)
        if not ok:
            if not imgs:
                raise SystemExit("No salió ninguna imagen: se reintenta mañana con la misma idea.")
            log(f"Imagen {k}: uso un recorte de la anterior")
            crop_variant(imgs[-1], img, "bottom")
        imgs.append(img)

    # 2) Animar las primeras escenas (el gancho) con la cuota que quede.
    visuals, quota_out = [], False
    for k, (sc, img) in enumerate(zip(scenes, imgs), 1):
        clip = work / f"scene{k}.mp4"
        done_clip = False
        motion = sc.get("motion") or CFG.get("default_motion")
        if motion and k <= CFG["max_clips"] and not quota_out:
            for attempt in range(2):
                try:
                    with_tokens(make_clip, img, f"{motion}, {CFG['motion_style']}", CFG["clip_seconds"], clip)
                    done_clip = True
                    log(f"Clip {k} listo")
                    break
                except Exception as e:
                    if "quota" in str(e).lower():
                        log("Se terminó la cuota gratis de hoy: el resto va con imágenes.")
                        quota_out = True
                        break
                    log(f"Clip {k} falló ({e}); reintento" if attempt == 0 else f"Clip {k} falló otra vez")
                    time.sleep(20)
        if done_clip:
            visuals.append((clip, True, per))
        else:
            # escena quieta: dos tomas (plano general + acercamiento) para que no aburra
            close = work / f"scene{k}b.png"
            crop_variant(img, close, "center")
            visuals += [(img, False, per / 2), (close, False, per / 2)]
    if not any(v[1] for v in visuals):
        raise SystemExit("No salió ningún clip animado: se reintenta mañana con la misma idea.")

    out = OUT / f"short_{idea['id']}.mp4"
    cuts, t = [], 0.0
    for _, _, secs in visuals[:-1]:
        t += secs
        cuts.append(t)
    pops = [timeline[-1][1]] if len(timeline) > 2 else []  # el dato fuerte del final
    sfx = make_sfx(work, total, cuts, pops) if CFG.get("sfx", True) else None
    mascot = mascot_png(work) if CFG.get("end_card", True) else None
    assemble(visuals, voice, subs, total, out, sfx, mascot)
    log(f"Short listo: {out}")
    vid = upload(out, idea)
    tags = " ".join("#" + _norm(t) for t in idea.get("tags", []) if _norm(t))
    (OUT / "meta.json").write_text(json.dumps({
        "id": idea["id"], "file": out.name, "youtube_id": vid,
        "caption": f"{idea.get('yt_title') or idea['title']}\n\n{sentences(idea['narration'])[0]}\n\n"
                   f"Síguenos para un dato nuevo cada día 🤯\n\n{tags} #curiosidades #sabiasque #datoscuriosos"},
        ensure_ascii=False, indent=2), encoding="utf-8")
    done[idea["id"]] = {"title": idea["title"], "youtube_id": vid, "date": today_ar()}
    done_p.write_text(json.dumps(done, indent=2, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()
