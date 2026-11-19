"""Voz clonada de Valentín con ElevenLabs (la usan generate.py y cine.py).

Se activa sola si existen los secretos ELEVEN_API_KEY y ELEVEN_VOICE_ID. Genera TODO el guion en un solo pedido
(así la entonación es natural) y devuelve, para cada frase, su pedazo de audio y el tiempo de cada palabra.
Si algo falla (sin créditos, caída del servicio), quien la llama sigue con la voz de siempre (edge-tts).

Ajustes elegidos por Valentín: modelo Eleven v4, estabilidad 0.5, similitud 0.75 (se pueden cambiar con
ELEVEN_MODEL, ELEVEN_STAB y ELEVEN_SIM).
"""
import base64, difflib, hashlib, json, os, re, subprocess, time, urllib.error, urllib.request
from pathlib import Path


def activo():
    return bool(os.environ.get("ELEVEN_API_KEY", "").strip() and os.environ.get("ELEVEN_VOICE_ID", "").strip())


def _norm(w):
    return re.sub(r"[^\wáéíóúñü]", "", w.lower())


def _run(cmd):
    r = subprocess.run([str(c) for c in cmd], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"Falló: {' '.join(map(str, cmd))[:200]}\n{r.stderr[-800:]}")


def _dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                          "-of", "csv=p=0", str(p)]).decode().strip())


def _settings(model):
    st = {"stability": float(os.environ.get("ELEVEN_STAB", "0.5")),
          "similarity_boost": float(os.environ.get("ELEVEN_SIM", "0.75"))}
    if not model.startswith(("eleven_v4", "eleven_v3")):  # v4 solo acepta estabilidad y similitud
        st.update(style=0.0, use_speaker_boost=True, speed=float(os.environ.get("ELEVEN_SPEED", "1.0")))
    return st


def _call(url, data, headers, log):
    headers = dict(headers, **{"xi-api-key": os.environ["ELEVEN_API_KEY"].strip()})
    for attempt in range(4):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, data=data, headers=headers), timeout=180).read()
        except urllib.error.HTTPError as e:
            msg = f"{e.code}: {e.read()[:300]!r}"
            if e.code in (400, 401, 402, 403, 404, 422) or attempt == 3:  # 401/402 = clave mala o sin créditos
                raise RuntimeError(f"ElevenLabs {msg}")
            log(f"ElevenLabs falló (intento {attempt + 1}): {msg}")
        except Exception as e:
            if attempt == 3:
                raise
            log(f"ElevenLabs falló (intento {attempt + 1}): {str(e)[:200]}")
        time.sleep(5 * (attempt + 1))


def _chars_to_words(al):
    ws, cur = [], None
    for ch, a, b in zip(al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]):
        if ch.isspace():
            if cur:
                ws.append(tuple(cur)); cur = None
        elif cur is None:
            cur = [a, b, ch]
        else:
            cur[1], cur[2] = b, cur[2] + ch
    if cur:
        ws.append(tuple(cur))
    return ws


def _forced_align(mp3, text, log):
    # plan B si el modelo no devuelve tiempos: alineación forzada de ElevenLabs (audio + guion)
    bnd = "----shorts" + os.urandom(8).hex()
    body = (f"--{bnd}\r\nContent-Disposition: form-data; name=\"text\"\r\n\r\n{text}\r\n"
            f"--{bnd}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"voz.mp3\"\r\n"
            f"Content-Type: audio/mpeg\r\n\r\n").encode() + Path(mp3).read_bytes() + f"\r\n--{bnd}--\r\n".encode()
    r = json.loads(_call("https://api.elevenlabs.io/v1/forced-alignment", body,
                         {"Content-Type": f"multipart/form-data; boundary={bnd}"}, log))
    return [(w["start"], w["end"], w["text"].strip()) for w in r["words"] if w["text"].strip()]


def _align(toks, ws):
    # tiempos de ElevenLabs -> palabras exactas del guion; las que no coinciden se reparten en el hueco
    A, B = [_norm(t) for t in toks], [_norm(w) for _, _, w in ws]
    times = [None] * len(toks)
    for blk in difflib.SequenceMatcher(None, A, B, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            times[blk.a + k] = (ws[blk.b + k][0], ws[blk.b + k][1])
    hits = sum(t is not None for t in times)
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
    return [(a, b, t) for (a, b), t in zip(times, toks)], hits / max(1, len(toks))


def guion(frases, work, log=print):
    """Genera todas las frases de una vez. Devuelve (wav_completo, grupos): grupos[i] es la lista
    [(inicio, fin, palabra_del_guion), ...] de la frase i, con tiempos en segundos dentro del wav (48 kHz, mono)."""
    model = os.environ.get("ELEVEN_MODEL", "eleven_v4")
    toks = [f.split() for f in frases]
    text = " ".join(frases)
    base = "https://api.elevenlabs.io/v1/text-to-speech/" + os.environ["ELEVEN_VOICE_ID"].strip()
    body = json.dumps({"text": text, "model_id": model, "voice_settings": _settings(model)}).encode()
    jh = {"Content-Type": "application/json"}
    work = Path(work); mp3 = work / "eleven_full.mp3"; full = work / "eleven_full.wav"; meta = work / "eleven_full.json"
    key = hashlib.sha1(body + os.environ["ELEVEN_VOICE_ID"].strip().encode()).hexdigest()
    if meta.exists() and full.exists():  # ya generada en un intento anterior: no gasta créditos de nuevo
        try:
            m = json.loads(meta.read_text(encoding="utf-8"))
            if m.get("key") == key:
                log("Voz de Valentín: reutilizo la ya generada")
                return full, [[tuple(x) for x in g] for g in m["grupos"]]
        except Exception:
            pass
    try:
        r = json.loads(_call(base + "/with-timestamps?output_format=mp3_44100_128", body, jh, log))
        mp3.write_bytes(base64.b64decode(r["audio_base64"]))
        heard = _chars_to_words(r.get("normalized_alignment") or r["alignment"])
    except RuntimeError as e:
        if "401" in str(e) or "402" in str(e):
            raise
        log(f"ElevenLabs sin tiempos directos ({str(e)[:150]}); uso alineación forzada")
        mp3.write_bytes(_call(base + "?output_format=mp3_44100_128", body, jh, log))
        heard = _forced_align(mp3, text, log)
    al, ok = _align([t for ts in toks for t in ts], heard)
    if ok < 0.6:
        raise RuntimeError(f"ElevenLabs: solo {ok:.0%} de las palabras alineadas")
    _run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-ar", 48000, "-ac", 1, full])
    grupos, i = [], 0
    for ts in toks:
        grupos.append(al[i:i + len(ts)]); i += len(ts)
    meta.write_text(json.dumps({"key": key, "grupos": grupos}, ensure_ascii=False), encoding="utf-8")
    log(f"Voz de Valentín (ElevenLabs {model}): {_dur(full):.1f} s, {ok:.0%} de palabras alineadas")
    return full, grupos


def cortar(full, grupos, work, prefijo="ev"):
    """Corta el wav completo en un pedazo por frase (en el medio del silencio entre frases, así no se pierde
    nada y las pausas son las naturales). Devuelve [(wav, [(inicio, fin, palabra), ...] relativo al pedazo)]."""
    total, n, res = _dur(full), len(grupos), []
    for si, g in enumerate(grupos):
        a = max(0.0, g[0][0] - 0.04) if si == 0 else (grupos[si - 1][-1][1] + g[0][0]) / 2
        b = min(total, g[-1][1] + 0.3) if si == n - 1 else (g[-1][1] + grupos[si + 1][0][0]) / 2
        b = max(b, a + 0.2)
        wav = Path(work) / f"{prefijo}{si}.wav"
        _run(["ffmpeg", "-v", "error", "-y", "-i", full, "-af", f"atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS",
              "-ar", 48000, "-ac", 1, wav])
        res.append((wav, [(max(0.0, x - a), max(0.0, y - a), w) for x, y, w in g]))
    return res
