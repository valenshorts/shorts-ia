"""
Fábrica diaria de Shorts con IA gratis.

1. Toma la próxima idea de ideas.json que no esté en done.json
2. Genera una imagen por escena (Qwen-Image, Hugging Face) y la anima (Wan 2.2)
3. Voz en español (Microsoft Edge TTS, gratis) + subtítulos palabra por palabra
4. Arma el Short 9:16 con ffmpeg
5. Lo sube a YouTube (si están cargados los secretos) y marca la idea como hecha

Variables de entorno: HF_TOKEN (obligatoria), YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN (opcionales)
"""
import asyncio, json, os, re, shutil, subprocess, sys, time
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
def hf_client(space):
    from gradio_client import Client
    return Client(space, hf_token=os.environ.get("HF_TOKEN"), verbose=False)


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
    lst.write_text("".join(f"file '{p.as_posix()}'\nfile '{gap.as_posix()}'\n" for p in parts))
    voice = work / "voice.wav"
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, voice])
    return voice, timeline


# ---------------------------------------------------------------- Subtítulos
def ts(t):
    return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"


def make_subs(timeline, out):
    st = CFG["captions"]
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
            txt = " ".join(w for w, _ in g).rstrip(",;:")
            caps.append([t, t + d, txt.upper() if st["uppercase"] else txt])
            t += d
    for i in range(len(caps) - 1):  # sin huecos en las pausas
        caps[i][1] = caps[i + 1][0]
    pop = "{\\fscx85\\fscy85\\t(0,80,\\fscx100\\fscy100)}"
    lines = [f"Dialogue: 0,{ts(a)},{ts(b)},Cap,,0,0,0,,{pop}{txt}" for a, b, txt in caps]
    out.write_text(f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,{st['font']},{st['size']},&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,1,0,1,{st['outline']},0,2,80,80,{st['margin_bottom']},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""" + "\n".join(lines) + "\n", encoding="utf-8")


# ---------------------------------------------------------------- Armado
def assemble(visuals, voice, subs, total, out):
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
            chains.append(f"[{i}:v]scale={W*2}:{H*2}:force_original_aspect_ratio=increase,crop={W*2}:{H*2},"
                          f"zoompan=z='min(zoom+0.0010,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s={W}x{H}:fps={FPS},setsar=1[s{i}]")
    n = len(visuals)
    fontsdir = (ROOT / "fonts").as_posix()
    vf = ";".join(chains) + ";" + "".join(f"[s{i}]" for i in range(n)) + \
        f"concat=n={n}:v=1:a=0,ass={subs.as_posix()}:fontsdir={fontsdir}[v]"
    vi, ai = n, n + 1
    af = (f"[{ai}:a]lowpass=f=320,volume={CFG['ambience_volume']}[amb];[{vi}:a]loudnorm=I=-14:TP=-1.5[vo];"
          f"[vo][amb]amix=inputs=2:duration=first,apad=pad_dur=2,afade=t=out:st={total - 0.8:.2f}:d=0.8[a]")
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-i", voice,
         "-f", "lavfi", "-i", "anoisesrc=color=brown:amplitude=0.5:r=48000",
         "-filter_complex", vf + ";" + af, "-map", "[v]", "-map", "[a]", "-t", f"{total:.2f}",
         "-c:v", "libx264", "-crf", "19", "-preset", "medium", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out])


# ---------------------------------------------------------------- YouTube
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
                        token_uri="https://oauth2.googleapis.com/token",
                        scopes=["https://www.googleapis.com/auth/youtube.upload"])
    yt = build("youtube", "v3", credentials=creds)
    body = {
        "snippet": {"title": f"{idea['title']} #shorts"[:100],
                    "description": f"{idea['title']}\n\n{CFG['description_footer']}",
                    "tags": idea.get("tags", []) + CFG["extra_tags"],
                    "categoryId": "27", "defaultLanguage": "es", "defaultAudioLanguage": "es"},
        "status": {"privacyStatus": CFG["privacy"], "selfDeclaredMadeForKids": False,
                   "containsSyntheticMedia": True},
    }
    req = yt.videos().insert(part="snippet,status", body=body,
                             media_body=MediaFileUpload(str(video), chunksize=-1, resumable=True))
    resp = None
    while resp is None:
        _, resp = req.next_chunk()
    log("Subido: https://youtube.com/shorts/" + resp["id"])
    return resp["id"]


# ---------------------------------------------------------------- Principal
def main():
    ideas = json.loads((ROOT / "ideas.json").read_text(encoding="utf-8"))
    done_p = ROOT / "done.json"
    done = json.loads(done_p.read_text(encoding="utf-8")) if done_p.exists() else {}
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
    total = duration(voice) + 0.8
    subs = work / "subs.ass"
    make_subs(timeline, subs)
    log(f"Voz lista: {total:.1f}s")

    # Escenas: imagen -> clip. Si se termina la cuota, la escena queda como imagen con zoom.
    scenes = idea["scenes"]
    per = total / len(scenes)
    visuals, quota_out = [], False
    for k, sc in enumerate(scenes, 1):
        img = work / f"scene{k}.png"
        make_image(f"{CFG['style']} {sc['image']}. Vertical composition, no text.", img)
        log(f"Imagen {k} lista")
        clip = work / f"scene{k}.mp4"
        if not quota_out:
            for attempt in range(2):
                try:
                    make_clip(img, f"{sc['motion']}, {CFG['motion_style']}", CFG["clip_seconds"], clip)
                    visuals.append((clip, True, per))
                    log(f"Clip {k} listo")
                    break
                except Exception as e:
                    if "quota" in str(e).lower():
                        log("Se terminó la cuota gratis de hoy: el resto va con imágenes.")
                        quota_out = True
                        break
                    log(f"Clip {k} falló ({e}); reintento" if attempt == 0 else f"Clip {k} falló otra vez")
                    time.sleep(20)
        if len(visuals) < k:
            visuals.append((img, False, per))
    if not any(v[1] for v in visuals):
        raise SystemExit("No salió ningún clip animado: se reintenta mañana con la misma idea.")

    out = OUT / f"short_{idea['id']}.mp4"
    assemble(visuals, voice, subs, total, out)
    log(f"Short listo: {out}")
    vid = upload(out, idea)
    done[idea["id"]] = {"title": idea["title"], "youtube_id": vid, "date": time.strftime("%Y-%m-%d")}
    done_p.write_text(json.dumps(done, indent=2, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()
