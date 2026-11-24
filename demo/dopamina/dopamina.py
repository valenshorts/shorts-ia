"""
Prueba de video "muy dopamínico": un clip de IA (Hugging Face, las 10 cuentas en orden) cada 1,2 a 2 s,
cortes con flash, zoom, temblor y barridos, sellos de palabras clave, barra de progreso y los mismos subtítulos de la
tanda (letra del canal, caja azul, palabra clave en amarillo). La voz es la de la misma idea en demo/manual/<base>.
NO se publica: el resultado queda en demo/dopamina/<carpeta>/video.mp4.
Uso: python demo/dopamina/dopamina.py gallina [--fake]   (--fake: clips de prueba sin Hugging Face)
"""
import json, math, shutil, subprocess, sys, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(ROOT))
W, H, FPS = 1080, 1920, 30


def log(*a):
    print("[dopamina]", *a, flush=True)


def run(cmd):
    r = subprocess.run([str(c) for c in cmd], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"Falló: {' '.join(map(str, cmd))[:200]}\n{r.stderr[-1200:]}")
    return r.stdout


def dur(p):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).strip())


def generar(plan, clips, fake):
    """Un clip por segmento. Lo ya hecho (de una corrida anterior) se reutiliza."""
    if not fake:
        import generate as gen  # mismas funciones y rotación de cuentas que el Short diario
    hechos = 0
    for i, s in enumerate(plan["segmentos"]):
        mp4, png = clips / f"{i:02d}.mp4", clips / f"{i:02d}.png"
        if mp4.exists() and mp4.stat().st_size > 10000:
            hechos += 1
            continue
        if fake:
            run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"testsrc2=s=480x832:r=24:d=4", "-vf",
                 f"hue=h={i * 40}", "-pix_fmt", "yuv420p", mp4])
            hechos += 1
            continue
        for intento in range(3):
            try:
                if not png.exists():
                    gen.with_tokens(gen.make_image, f"{gen.CFG['style']} {s['image']}. Vertical composition, vibrant saturated colors, "
                                    "dynamic and eye-catching, no text.", png)
                gen.with_tokens(gen.make_clip, png, f"{s['motion']}, fast energetic motion, {gen.CFG['motion_style']}", 4, mp4)
                hechos += 1
                log(f"Clip {i + 1}/{len(plan['segmentos'])} listo (cuenta {gen._tok[0] + 1})")
                break
            except Exception as e:
                log(f"Clip {i + 1} falló ({str(e)[:160]})")
                if gen.is_quota(e):
                    log("Se terminó la cuota de todas las cuentas de Hugging Face: guardo lo hecho.")
                    return hechos
                mp4.unlink(missing_ok=True)
                time.sleep(15)
    return hechos


FX = {
    "zoom_in": "zoompan=z='1+0.22*on/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30",
    "zoom_out": "zoompan=z='1.22-0.22*on/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30",
    "shake": "scale=1180:2098,crop=1080:1920:x='50+34*sin(t*47)':y='89+34*cos(t*39)'",
    "whip": "scale=1300:2311,crop=1080:1920:x='110+110*cos(min(t/0.35,1)*PI)':y='195'",
    "speed": "zoompan=z='1.08+0.06*sin(on/4)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30",
}


def segmento(src, d, fx, i, work):
    """Recorta el clip al largo del segmento con su efecto y un flash blanco al entrar."""
    n = max(1, int(round(d * FPS)))
    speed = 1.5 if fx == "speed" else 1.0
    clip_d = dur(src)
    usa = min(clip_d, d * speed)
    pts = (d / usa)  # si el clip es más corto, se estira; si es "speed", se acelera
    vf = (f"trim=0:{usa:.3f},setpts=(PTS-STARTPTS)*{pts:.4f},fps=30,scale=1080:1920:force_original_aspect_ratio=increase,"
          f"crop=1080:1920,setsar=1,{FX[fx].format(n=n)},eq=saturation=1.3:contrast=1.08,"
          f"fade=t=in:st=0:d=0.12:color=white,format=yuv420p")
    out = work / f"seg{i:02d}.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", vf, "-frames:v", n, "-an", "-c:v", "libx264", "-preset", "veryfast",
         "-crf", "18", "-r", FPS, out])
    return out


def subtitulos(tl, total, work):
    """Capa transparente con subtítulos (estilo de la tanda), sellos de palabras clave y barra de progreso."""
    from playwright.sync_api import sync_playwright
    font = work / "Montserrat.ttf"
    if not font.exists():
        import urllib.request
        urllib.request.urlretrieve("https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf", font)
    chunks = [{"t": c["a"], "end": c["b"], "w": [{"x": w["x"], "t": w["t"], "k": w["k"]} for w in c["w"]]} for c in tl["chunks"]]
    stamps, last = [], -9
    for c in chunks:
        for w in c["w"]:
            clean = w["x"].strip(",.;:!?¿¡").upper()
            if w["k"] and len(clean) > 3 and w["t"] - last > 1.4:
                stamps.append({"t": w["t"], "x": clean}); last = w["t"]
    html = (HERE / "capa.html").read_text(encoding="utf-8").replace("/*DATA*/null", json.dumps(
        {"chunks": chunks, "stamps": stamps, "total": total, "font": font.as_uri()}, ensure_ascii=False))
    page = work / "capa.html"; page.write_text(html, encoding="utf-8")
    out = work / "capa.mov"
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "png", "-i", "-",
                           "-c:v", "qtrle", "-pix_fmt", "argb", str(out)], stdin=subprocess.PIPE)
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={"width": W, "height": H})
        pg.goto(page.as_uri())
        pg.wait_for_function("window.READY === true", timeout=30000)
        for f in range(int(math.ceil(total * FPS))):
            pg.evaluate(f"draw({f / FPS:.4f})")
            ff.stdin.write(pg.screenshot(type="png", omit_background=True))
        br.close()
    ff.stdin.close(); ff.wait()
    return out, stamps


def whoosh(work):
    p = work / "whoosh.wav"
    run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anoisesrc=d=0.35:c=pink:a=0.6", "-af",
         "bandpass=f=1800:w=1600,afade=t=in:d=0.12,afade=t=out:st=0.12:d=0.23,volume=0.8", "-ar", 48000, p])
    b = work / "boom.wav"
    run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "sine=f=70:d=0.5", "-af",
         "afade=t=out:st=0.05:d=0.45,volume=1.4", "-ar", 48000, b])
    return p, b


def main():
    name = next(a for a in sys.argv[1:] if not a.startswith("--"))
    fake = "--fake" in sys.argv
    folder = HERE / name
    plan = json.loads((folder / "plan.json").read_text(encoding="utf-8"))
    base = ROOT / "demo" / "manual" / plan["base"]
    tl = json.loads((base / "timeline.json").read_text(encoding="utf-8"))
    total = tl["total"]
    clips = folder / "clips"; clips.mkdir(exist_ok=True)
    work = (ROOT / "work_dopamina" / name); work.mkdir(parents=True, exist_ok=True)
    segs = plan["segmentos"]
    hechos = generar(plan, clips, fake)
    log(f"{hechos}/{len(segs)} clips de IA listos")
    if hechos < len(segs):
        log("Faltan clips: se completan en la próxima corrida (lo hecho queda guardado).")
        return
    partes = []
    for i, s in enumerate(segs):
        t1 = segs[i + 1]["t"] if i + 1 < len(segs) else total
        partes.append(segmento(clips / f"{i:02d}.mp4", t1 - s["t"], s.get("fx", "zoom_in"), i, work))
    lista = work / "lista.txt"; lista.write_text("".join(f"file '{p}'\n" for p in partes))
    video = work / "video_solo.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", 0, "-i", lista, "-c", "copy", video])
    capa, stamps = subtitulos(tl, total, work)
    wh, bo = whoosh(work)
    # audio: voz (+ música y efectos de la tanda) + un whoosh en cada corte + un golpe en cada sello
    voz = base / "voz.m4a"
    ins, mix = ["-i", voz], ["[0:a]volume=1.0[a0]"]
    labels = ["[a0]"]
    k = 1
    for s in segs[1:]:
        ins += ["-i", wh]; mix.append(f"[{k}:a]adelay={int(s['t'] * 1000)}|{int(s['t'] * 1000)},volume=0.35[a{k}]"); labels.append(f"[a{k}]"); k += 1
    for st in stamps:
        ins += ["-i", bo]; mix.append(f"[{k}:a]adelay={int(st['t'] * 1000)}|{int(st['t'] * 1000)},volume=0.45[a{k}]"); labels.append(f"[a{k}]"); k += 1
    mix.append("".join(labels) + f"amix=inputs={len(labels)}:duration=first:normalize=0,alimiter=limit=0.9[a]")
    audio = work / "audio.wav"
    run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", ";".join(mix), "-map", "[a]", "-t", f"{total:.3f}", "-ar", 48000, audio])
    out = folder / "video.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-i", video, "-i", capa, "-i", audio, "-filter_complex", "[0:v][1:v]overlay=0:0:format=auto,format=yuv420p[v]",
         "-map", "[v]", "-map", "2:a", "-c:v", "libx264", "-preset", "medium", "-b:v", "3500k", "-maxrate", "4500k", "-bufsize", "9000k",
         "-c:a", "aac", "-b:a", "160k", "-t", f"{total:.3f}", "-movflags", "+faststart", out])
    log(f"Listo: {out} ({total:.1f}s, {len(segs)} cortes, {len(stamps)} sellos)")


if __name__ == "__main__":
    main()
