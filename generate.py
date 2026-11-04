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


CHECK_PROMPT = """These are {n} frames, in order, from a 4-second AI-generated animation for an educational video (stylized 3D cartoon style is fine).
Intended scene: {image}
Intended motion: {motion}
Check ONLY for obvious AI mistakes a normal viewer would notice as weird or impossible: something moving where it can't
(a ship over land, a car through a wall), objects melting, merging, stretching or changing shape, things appearing or
disappearing, deformed bodies or extra limbs, things passing through each other, or the subject turning into something else.
Small imperfections are fine. Reply only JSON: {{"ok": true or false, "reason": "short reason in Spanish"}}"""


def gemini_check(clip, image_desc, motion):
    """Gemini mira fotogramas de la animación. Devuelve (ok, motivo); ok es None si no se pudo revisar."""
    key = os.environ.get("GEMINI_API_KEY")
    if not key or not CFG.get("check_clips", True):
        return True, "sin revisión"
    import base64, urllib.request
    d, parts = duration(clip), []
    for j, t in enumerate((0.15, 0.4, 0.65, 0.9)):
        fr = clip.with_name(f"{clip.stem}_f{j}.jpg")
        run(["ffmpeg", "-v", "error", "-y", "-ss", f"{d * t:.2f}", "-i", clip, "-frames:v", "1", "-vf", "scale=384:-2", fr])
        parts.append({"inline_data": {"mime_type": "image/jpeg", "data": base64.b64encode(fr.read_bytes()).decode()}})
        fr.unlink()
    parts.append({"text": CHECK_PROMPT.format(n=len(parts), image=image_desc, motion=motion)})
    body = json.dumps({"contents": [{"parts": parts}],
                       "generationConfig": {"responseMimeType": "application/json", "temperature": 0}}).encode()
    models = CFG.get("gemini_models", ["gemini-flash-latest", "gemini-flash-lite-latest"])
    for attempt in range(3):  # cada vuelta prueba todos los modelos; si todos están saturados, espera y reintenta
        for model in models:
            try:
                req = urllib.request.Request(
                    f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                    data=body, headers={"Content-Type": "application/json", "x-goog-api-key": key})
                with urllib.request.urlopen(req, timeout=90) as r:
                    v = json.loads(json.loads(r.read())["candidates"][0]["content"]["parts"][0]["text"])
                if isinstance(v, list):
                    v = v[0]
                return bool(v.get("ok", True)), str(v.get("reason", ""))
            except Exception as e:  # saturado (503/429), lento o respuesta rara: pasa al otro modelo
                log(f"Revisión con Gemini {model} falló: {e}")
        if attempt < 2:
            time.sleep(20 * (attempt + 1))
    log("⚠️ No se pudo revisar con Gemini: el clip se usa por ahora y se vuelve a revisar en la próxima corrida")
    return None, "sin revisión"


def clip_ok(clip, k, image_desc, motion, work):
    """Gemini revisa la animación. Si tiene un error de IA evidente, la borra para rehacerla.
    Si ya se rehízo `max_rejects` veces y sigue mal, esa escena va con la imagen quieta (marca scene{k}.still)."""
    mark, rej, still = work / f"scene{k}.ok", work / f"scene{k}.rej", work / f"scene{k}.still"
    if mark.exists():
        return True
    n = int(rej.read_text()) if rej.exists() else 0
    ok, why = gemini_check(clip, image_desc, motion)
    if ok is None:  # no se pudo revisar: se usa por ahora, sin marca, así se revisa en la próxima corrida
        return True
    if ok:
        mark.touch()
        return True
    clip.unlink()
    if n >= CFG.get("max_rejects", 2):
        still.touch()
        log(f"Clip {k} salió mal {n + 1} veces ({why}); esta escena va con la imagen quieta")
        return False
    rej.write_text(str(n + 1))
    log(f"Clip {k} rechazado por la revisión ({why}); lo rehago")
    return False


# ---------------------------------------------------------------- Voz
def sentences(text):
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text.strip()) if s.strip()]


async def _tts(text, path):
    import edge_tts
    for attempt in range(6):  # el servicio de voz de Microsoft a veces corta sin mandar audio: reintenta
        try:
            await edge_tts.Communicate(text, CFG["voice"], rate=CFG["voice_rate"]).save(str(path))
            if Path(path).exists() and Path(path).stat().st_size > 1000:
                return
            raise RuntimeError("audio vacío")
        except Exception as e:
            if attempt == 5:
                raise
            log(f"La voz falló ({type(e).__name__}); reintento en {15 * (attempt + 1)} s")
            await asyncio.sleep(15 * (attempt + 1))


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
    status = {"privacyStatus": CFG["privacy"], "selfDeclaredMadeForKids": False, "containsSyntheticMedia": False}
    publish_at = scheduled_time()
    if publish_at:  # se sube privado y YouTube lo publica solo a la hora elegida
        status.update(privacyStatus="private", publishAt=publish_at)
        log(f"Programado para publicarse a las {CFG['publish_time_ar']} (hora AR)")
    body = {
        "snippet": {"title": youtube_title(idea),
                    "description": youtube_description(idea),
                    "tags": list(dict.fromkeys(idea.get("tags", []) + CFG["extra_tags"]))[:15],
                    "categoryId": "27", "defaultLanguage": "es", "defaultAudioLanguage": "es"},
        "status": status,
    }
    req = yt.videos().insert(part="snippet,status", body=body,
                             media_body=MediaFileUpload(str(video), chunksize=-1, resumable=True))
    resp = None
    while resp is None:
        _, resp = req.next_chunk()
    log("Subido: https://youtube.com/shorts/" + resp["id"])
    extras(yt, resp["id"], idea, comment=not publish_at)  # si está programado, el comentario va cuando sea público
    return resp["id"], publish_at


def scheduled_time():
    """Hora de publicación de hoy en UTC (RFC3339), o None si hay que publicar ya (pasó la hora o fue a mano)."""
    from datetime import datetime, timedelta, timezone
    hhmm = CFG.get("publish_time_ar")
    if not hhmm or os.environ.get("FORCE"):
        return None
    ar = timezone(timedelta(hours=-3))
    now = datetime.now(ar)
    h, m = map(int, hhmm.split(":"))
    target = now.replace(hour=h, minute=m, second=0, microsecond=0)
    if target - now < timedelta(minutes=20):
        return None
    return target.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def youtube_client():
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    creds = Credentials(None, refresh_token=os.environ["YT_REFRESH_TOKEN"],
                        client_id=os.environ["YT_CLIENT_ID"], client_secret=os.environ["YT_CLIENT_SECRET"],
                        token_uri="https://oauth2.googleapis.com/token")
    return build("youtube", "v3", credentials=creds)


def post_comment(yt, vid, idea):
    q = idea.get("question") or CFG.get("comment", "🤯 ¿Lo sabías? Escribe SÍ o NO 👇 ¿Qué tema quieres para mañana?")
    try:
        yt.commentThreads().insert(part="snippet", body={"snippet": {"videoId": vid, "topLevelComment": {
            "snippet": {"textOriginal": q}}}}).execute()
        log("Comentario publicado")
        return True
    except Exception as e:
        log(f"Sin comentario automático ({str(e)[:120]})")
        return False


def pending_comments(done, ideas):
    """Comenta los videos programados que ya se hicieron públicos."""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    todo = [k for k, v in done.items() if v.get("comment_pending") and v.get("publish_at", "") <= now]
    if not todo or not os.environ.get("YT_REFRESH_TOKEN"):
        return False
    yt, by = youtube_client(), {i["id"]: i for i in ideas}
    for k in todo:
        if k in by and post_comment(yt, done[k]["youtube_id"], by[k]):
            done[k].pop("comment_pending", None)
    return True


def extras(yt, vid, idea, comment=True):
    """Comentario con pregunta + lista por tema. Necesita el permiso youtube.force-ssl; si no está, se saltea."""
    if comment:
        post_comment(yt, vid, idea)
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
- GANCHO: la primera frase dice YA lo más sorprendente del video, lo mismo que promete "yt_title". Nunca guardar la promesa del título para el final.
- Nunca empezar explicando ("Cuando cortas...", "La lluvia va..."). Los ganchos que mejor funcionan en el canal: una contradicción ("Un clavo de acero se hunde, pero un barco de miles de toneladas flota") o algo que todos vivieron con un giro ("Se te arrugan los dedos en el agua. Parece que absorben agua, pero no").
- La última frase es un final "wow".
- Narración de 70 a 85 palabras, frases cortas y fáciles de decir en voz alta. Números escritos en letras.
- 5 escenas: "image" en inglés describiendo una imagen 3D estilo animación; las 3 primeras también llevan "motion" en inglés (movimiento simple de 4 segundos).
- "motion" realista y chico: describe solo cómo se mueve lo que YA está en esa imagen (algo que respira, se balancea o fluye) y la cámara despacio. Nunca nombres en "motion" cosas que no aparecen en la escena, ni siquiera para decir que no se muevan. Los objetos grandes no viajan por la imagen: se quedan en su lugar.
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


def publish_hour_ok():
    """Se publica directo en público recién desde publish_after_ar (hora AR): lo antes se usa para preparar el video."""
    from datetime import datetime, timedelta, timezone
    hhmm = CFG.get("publish_after_ar")
    if not hhmm:
        return True
    h, m = map(int, hhmm.split(":"))
    now = datetime.now(timezone(timedelta(hours=-3)))
    return (now.hour, now.minute) >= (h, m)


def main():
    ideas = json.loads((ROOT / "ideas.json").read_text(encoding="utf-8"))
    done_p = ROOT / "done.json"
    done = json.loads(done_p.read_text(encoding="utf-8")) if done_p.exists() else {}
    try:
        if pending_comments(done, ideas):
            done_p.write_text(json.dumps(done, indent=2, ensure_ascii=False), encoding="utf-8")
    except Exception as e:
        log(f"Comentarios pendientes: falló ({e})")
    per_day = CFG.get("videos_per_day", 1)
    already = sum(1 for v in done.values() if v.get("date") == today_ar()) >= per_day
    publish_today = os.environ.get("FORCE") or (not already and publish_hour_ok())
    if not publish_today:
        log("Hoy ya se subió el video del día: aprovecho el cupo para ir preparando el de mañana." if already else
            f"Todavía no es la hora de publicar ({CFG.get('publish_after_ar')} AR): preparo el video de hoy.")
    ideas = refill_ideas(ideas, done)
    pending = [i for i in ideas if i["id"] not in done]
    if not pending:
        log("No quedan ideas nuevas. Agregá más a ideas.json.")
        return
    idea = pending[0]
    log(f"Idea {idea['id']}: {idea['title']}")
    work = ROOT / "work" / idea["id"]
    # lo ya generado de esta idea (en un intento anterior) se reutiliza; lo de ideas viejas se borra
    for d in (ROOT / "work").glob("*"):
        if d.is_dir() and d.name != idea["id"]:
            shutil.rmtree(d, ignore_errors=True)
    work.mkdir(parents=True, exist_ok=True)
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
        if img.exists() and img.stat().st_size > 10000:  # ya estaba de un intento anterior
            hashes.add(hashlib.md5(img.read_bytes()).hexdigest())
            imgs.append(img)
            log(f"Imagen {k} lista (guardada)")
            continue
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
            # modo calidad: no se rellena con recortes; se guarda lo hecho y se reintenta más tarde
            log(f"Imagen {k} no salió (cupo): guardo lo hecho y reintento más tarde.")
            return
        imgs.append(img)

    # 2) Animar las primeras escenas (el gancho) con la cuota que quede.
    visuals, quota_out = [], False
    for k, (sc, img) in enumerate(zip(scenes, imgs), 1):
        clip = work / f"scene{k}.mp4"
        done_clip = False
        motion = sc.get("motion") or CFG.get("default_motion")
        if clip.exists() and clip.stat().st_size > 10000:  # animación guardada de un intento anterior
            if clip_ok(clip, k, sc["image"], motion, work):
                done_clip = True
                log(f"Clip {k} listo (guardado)")
        if not done_clip and motion and k <= CFG["max_clips"] and not quota_out and not (work / f"scene{k}.still").exists():
            for attempt in range(3):
                try:
                    with_tokens(make_clip, img, f"{motion}, {CFG['motion_style']}", CFG["clip_seconds"], clip)
                except Exception as e:
                    if "quota" in str(e).lower():
                        log("Se terminó la cuota gratis de hoy: el resto va con imágenes.")
                        quota_out = True
                        break
                    log(f"Clip {k} falló ({e}); reintento" if attempt < 2 else f"Clip {k} falló otra vez")
                    time.sleep(20)
                    continue
                if clip_ok(clip, k, sc["image"], motion, work):
                    done_clip = True
                    log(f"Clip {k} listo")
                    break
                if (work / f"scene{k}.still").exists():  # salió mal demasiadas veces: imagen quieta
                    break
        if done_clip:
            # la animación se muestra entera, sin acercamiento encima
            visuals.append((clip, True, per))
        else:
            # escena quieta: dos tomas (plano general + acercamiento) para que no aburra
            close = work / f"scene{k}b.png"
            crop_variant(img, close, "center")
            visuals += [(img, False, per / 2), (close, False, per / 2)]
    # una escena cuenta como lista si está animada o si quedó con imagen quieta porque la animación salía mal
    animated = sum(1 for k in range(1, len(scenes) + 1)
                   if (work / f"scene{k}.mp4").exists() or (work / f"scene{k}.still").exists())
    need = min(CFG.get("min_clips", len(scenes)), len(scenes))
    if animated < need:  # modo calidad: si no están todas las escenas animadas, no se publica
        log(f"{animated}/{len(scenes)} escenas animadas: guardo lo hecho y sigo en el próximo intento.")
        return
    if not publish_today:
        log("El video de mañana ya tiene todo listo; se publica en el primer intento de mañana." if already else
            "El video de hoy ya tiene todo listo; se publica en la corrida de la noche.")
        return

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
    vid, publish_at = upload(out, idea) or (None, None)
    tags = " ".join("#" + _norm(t) for t in idea.get("tags", []) if _norm(t))
    (OUT / "meta.json").write_text(json.dumps({
        "id": idea["id"], "file": out.name, "youtube_id": vid,
        "caption": f"{idea.get('yt_title') or idea['title']}\n\n{sentences(idea['narration'])[0]}\n\n"
                   f"Síguenos para un dato nuevo cada día 🤯\n\n{tags} #curiosidades #sabiasque #datoscuriosos"},
        ensure_ascii=False, indent=2), encoding="utf-8")
    done[idea["id"]] = {"title": idea["title"], "youtube_id": vid, "date": today_ar()}
    if publish_at:
        done[idea["id"]].update(publish_at=publish_at, comment_pending=True)
    done_p.write_text(json.dumps(done, indent=2, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()
