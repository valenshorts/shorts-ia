"""
Motor "escena": cada video automático con una animación PROPIA, como los hechos a mano (ducha, Torre Eiffel, monje...).
  1) Gemini planea las escenas (una por frase del guion) y escribe scene.js sobre demo/manual/base.html,
     mirando de ejemplo los scene.js hechos a mano que están en el repo.
  2) Prueba sin voz: ningún error de JavaScript, cada escena con dibujo; Gemini mira 6 cuadros y pone nota.
     Si algo falla o la nota es baja, se le devuelve el problema y lo rehace (hasta 3 veces).
  3) Video final con demo/manual/render.py: voz de Valentín (ElevenLabs) con tiempos por palabra, subtítulos,
     efectos, música y el control anti-congelado. Si algo de esto falla, generate.py sigue con el motor cine.
Uso suelto (para probar): python escena.py 105 [--fake]
"""
import json, os, re, shutil, subprocess, sys, time, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MAN = ROOT / "demo" / "manual"
sys.path.insert(0, str(MAN))
import render as R  # noqa: E402  (demo/manual/render.py: voz, subtítulos, efectos, música, filmar, control)

EJEMPLOS = ["ducha", "monje", "saturno"]  # los mejores hechos a mano: Gemini los usa de modelo
SFX = ["boom", "boom_grande", "whoosh", "subida", "bajada", "grave", "campana", "brillo"]
SWAY = """
;(function () { var d0 = V.draw; V.draw = function (t, c) {   // vaivén suave de cámara: nunca queda un cuadro quieto
  var o = d0(t, c) || {}; if (!o.cam) o.cam = { s: 1 + .05 * c.drift, fx: 540, fy: 960 };
  o.cam = { s: o.cam.s || 1, fx: (o.cam.fx || 540) + Math.sin(t * 1.2) * 12, fy: (o.cam.fy || 960) + Math.cos(t * .9) * 9 };
  return o; }; })();
"""


def log(*a):
    print("[escena]", *a, flush=True)


# ---------------------------------------------------------------- Gemini
def gemini(parts, models, as_json=False, temp=0.7):
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise RuntimeError("falta GEMINI_API_KEY")
    cfg = {"temperature": temp, "maxOutputTokens": 32000}
    if as_json:
        cfg["responseMimeType"] = "application/json"
    body = json.dumps({"contents": [{"parts": parts}], "generationConfig": cfg}).encode()
    last = None
    for ronda in range(3):
        for model in models:
            try:
                req = urllib.request.Request(
                    f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                    data=body, headers={"Content-Type": "application/json", "x-goog-api-key": key})
                with urllib.request.urlopen(req, timeout=240) as r:
                    res = json.loads(r.read())
                txt = "".join(p.get("text", "") for p in res["candidates"][0]["content"]["parts"] if not p.get("thought"))
                if txt.strip():
                    return json.loads(txt) if as_json else txt
            except Exception as e:
                last = e
                log(f"Gemini {model}: {str(e)[:160]}")
        time.sleep(15 * (ronda + 1))
    raise RuntimeError(f"Gemini no respondió ({last})")


def frases(text):
    s = [x.strip() for x in re.split(r"(?<=[.!?…])\s+", text.strip()) if x.strip()]
    while len(s) > 7:  # como mucho 7 escenas: se juntan las dos frases más cortas que estén pegadas
        i = min(range(len(s) - 1), key=lambda k: len(s[k]) + len(s[k + 1]))
        s[i:i + 2] = [s[i] + " " + s[i + 1]]
    return s


PLAN = """Sos director de animación de "El Porqué de Todo", canal de Shorts de curiosidades (voz en español rioplatense).
Cada frase del guion es UNA escena animada con dibujos vectoriales (SVG) hechos con código: estilo flat, colores vivos
sobre fondo azul noche, objetos simples y reconocibles, mucho movimiento sincronizado con las palabras.

Guion (una escena por frase):
{frases}

Devolvé SOLO este JSON:
{"keys": ["una palabra en minúscula sin tildes por escena, distinta entre sí"],
 "visual": ["por escena: QUÉ se dibuja (objetos concretos, posiciones, colores), QUÉ se mueve y con qué PALABRA exacta de la frase pasa cada cosa importante (2 a 4 frases)"],
 "head": [["kicker corto (2-4 palabras, sin HTML)", "titular de 2 a 5 palabras con la palabra clave entre <b></b>"]],
 "keywords": ["8 a 15 palabras del guion (tal cual aparecen) que van resaltadas en amarillo en los subtítulos"],
 "caption_replace": [["texto con números escritos en letras tal cual está en el guion", "versión con cifras, ej: 1.000 años"]],
 "sfx": [{"tipo": "uno de: boom, boom_grande, whoosh, subida, bajada, grave, campana, brillo", "escena": 0, "palabra": "palabra exacta de esa frase", "gain": 0.6}]}
Reglas: entre 6 y 10 efectos; el primero en la escena 0; nada de personas realistas ni marcas; todo tiene que poder
dibujarse con formas simples. Las metáforas visuales tienen que explicar el dato (que se entienda sin sonido)."""

CONTRATO = """Escribís scene.js para el motor de videos verticales 1080x1920 del canal. scene.js se inserta dentro de una página
que YA tiene estas funciones globales (NO las redefinas, NO uses estos nombres para variables tuyas):
clamp(x,a,b) lerp(a,b,p) seg(t,a,b)->0..1  E.out E.inout E.inq E.spring E.pop (easings 0..1)  rnd(seed)->fn  R (=rnd(7), azar fijo)
$(id)  el(tag, attrs, parent)->elemento SVG  txt(parent, texto, attrs)->texto SVG centrado  tr(e,x,y,escala,rot)  op(e,opacidad)
defs(markup)  sc(i)-> <g> de la escena i (solo se muestra en su escena)  cue(si, prefijo, frac, fin)->segundo en que se dice la
primera palabra de la escena si que empieza con prefijo (minúsculas, CON tildes, sin signos; si no la encuentra usa frac de la escena)
fade(t,a,dur)->0..1   rise(t,a)->[opacidad, desplazamientoY]   fmt(n,dec)   DATA (tiempos)   W=1080 H=1920
Nombres PROHIBIDOS para tus variables/funciones globales: render, __boot, tag, txt, op, fade, rise, cue, sc, defs, el, tr, seg,
lerp, clamp, E, R, W, H, DATA, NS, setHead, captions, DUST, cur, lastCap, lastHead. Usá un objeto N = {} para guardar lo tuyo.

Tenés que definir:  var V = { stars: true/false/número, build: function(){...}, draw: function(t, c){ ... return o; } };
- build(): dibuja TODO una sola vez (con el(...) dentro de sc(0), sc(1)...). Nada de crear elementos en draw.
- draw(t, c): t = segundo actual; c = {si: escena actual, key: su clave, a: inicio, b: fin, drift: 0..1 dentro de la escena}.
  Mové lo de la escena c.si con setAttribute / tr / op según t. Usá cue() para sincronizar con palabras.
  Devolvé o = {
    head: [kicker (texto plano), titular (HTML, <b>palabra</b> sale amarilla), opacidad, dy],   <- SIEMPRE, en todas las escenas
    cam: {s: zoom ~1..1.12, fx: 540, fy: ~900},  sky: ["#colorArriba", "#colorAbajo"] (opcional),
    tags: [[texto, x, y, opacidad, colorBorde]] (máx. 4, etiquetas cortas en mayúsculas), num: [cifra, unidad, opacidad, pop 0..1, top, tamaño] (opcional),
    stars: opacidad, dust: opacidad }
ZONAS (muy importante): y 96 marca del canal; y 170-480 kicker+titular (no dibujes nada importante ahí);
DIBUJO PRINCIPAL entre y 520 y y 1260, x 80-1000; y 1300-1460 subtítulos (no pongas nada importante ahí). Si usás num, top ~330.
Estilo: formas planas (rect, circle, ellipse, path, polygon), contornos redondeados, paleta: amarillo #FFD22E, turquesa #19B8B2,
blanco, naranja #ff8a3a, rojo #ff5a3a, celeste #5fb8ff, sobre fondo azul noche. Objetos grandes (que se vean en un celular).
Todo tiene que MOVERSE siempre (algo oscila, gira, flota o crece en cada escena), con apariciones con E.pop/E.spring
en el momento exacto de la palabra (cue). Nada de texto largo dibujado; el texto va en head/tags/num.
JavaScript ES5 simple (var, function), sin librerías, sin imágenes externas, sin Math.random (usá R()).
Respondé SOLO con el código de scene.js dentro de un bloque ```js ... ```."""


def ejemplos():
    out = []
    for n in EJEMPLOS:
        d = MAN / n
        if (d / "scene.js").exists() and (d / "storyboard.json").exists():
            sb = json.loads((d / "storyboard.json").read_text(encoding="utf-8"))
            guion = [{"key": s["key"], "text": s["text"]} for s in sb["scenes"]]
            out.append(f"### EJEMPLO hecho a mano: «{sb.get('title', n)}»\nEscenas: {json.dumps(guion, ensure_ascii=False)}\n"
                       f"```js\n{(d / 'scene.js').read_text(encoding='utf-8')}\n```")
    return "\n\n".join(out)


def pedir_escena(sb, plan, models, previo=None, problemas=None):
    guion = [{"si": i, "key": s["key"], "text": s["text"], "visual": plan["visual"][i], "head": plan["head"][i]}
             for i, s in enumerate(sb["scenes"])]
    p = (CONTRATO + "\n\n" + ejemplos() + f"\n\n### TU VIDEO: «{sb['title']}»\nEscenas (en orden; draw elige por c.key o c.si):\n"
         + json.dumps(guion, ensure_ascii=False, indent=1)
         + "\n\nHacelo al nivel de los ejemplos o mejor: varias capas de dibujo por escena, detalles, y cada momento clave "
           "de la frase con su animación propia.")
    if previo and problemas:
        p += ("\n\nEsta es tu versión anterior:\n```js\n" + previo + "\n```\nTiene estos problemas, corregilos (y mantené lo que "
              "estaba bien):\n- " + "\n- ".join(problemas))
    txt = gemini([{"text": p}], models, temp=0.6 if not previo else 0.4)
    m = re.findall(r"```(?:js|javascript)?\s*\n(.*?)```", txt, re.S)
    code = max(m, key=len) if m else txt
    if "var V" not in code and "V =" not in code:
        raise RuntimeError("Gemini no mandó un scene.js válido")
    return code.strip()


# ---------------------------------------------------------------- prueba sin voz
def probar(folder, data, total, work):
    """Recorre el video cada 0,1 s buscando errores, revisa que cada escena tenga dibujo y saca 6 cuadros."""
    from playwright.sync_api import sync_playwright
    html = (MAN / "base.html").read_text(encoding="utf-8").replace("/*SCENE*/", (folder / "scene.js").read_text(encoding="utf-8"))
    html = html.replace("FONTURL", R.font_url(work)).replace("/*DATA*/null", json.dumps(data, ensure_ascii=False))
    page = work / "probe.html"; page.write_text(html, encoding="utf-8")
    errores, problemas, fotos = [], [], []
    S = data["scenes"]
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={"width": R.W, "height": R.H})
        pg.on("pageerror", lambda e: errores.append(str(e)))
        pg.goto(page.as_uri())
        try:
            pg.wait_for_function("window.READY === true", timeout=30000)
        except Exception:
            br.close()
            return [f"La página no arrancó: {errores[0] if errores else 'build() no terminó'}"], []
        pg.evaluate("document.fonts.ready")
        t = 0.0
        while t < total and not errores:
            pg.evaluate(f"render({t:.3f})"); t += 0.1
        if errores:
            br.close()
            return [f"Error de JavaScript al dibujar (segundo {t:.1f}): {errores[0][:300]}"], []
        for i, s in enumerate(S):
            tm = s["a"] + (s["b"] - s["a"]) * 0.7
            pg.evaluate(f"render({tm:.3f})")
            info = pg.evaluate(f"""(() => {{ var g = sc({i}), n = g.querySelectorAll('*').length, b = null;
                try {{ var r = g.getBBox(); b = [r.x, r.y, r.width, r.height]; }} catch (e) {{}}
                return {{ n: n, b: b, h: document.getElementById('h1').textContent }}; }})()""")
            if info["n"] < 6:
                problemas.append(f"La escena {i} ({s['key']}) casi no tiene dibujo ({info['n']} elementos): dibujá la escena completa.")
            elif info["b"] and (info["b"][2] < 150 or info["b"][3] < 150):
                problemas.append(f"El dibujo de la escena {i} ({s['key']}) es muy chico: tiene que ocupar la zona y 520-1260.")
            if not info["h"].strip():
                problemas.append(f"La escena {i} ({s['key']}) no tiene titular: devolvé o.head en todas las escenas.")
            f = work / f"probe{i}.jpg"
            f.write_bytes(pg.screenshot(type="jpeg", quality=80))
            fotos.append(f)
        br.close()
    return problemas, fotos


def hoja(fotos, work):
    out = work / "probe_hoja.jpg"
    n = len(fotos)
    inputs = sum([["-i", str(f)] for f in fotos], [])
    filt = "".join(f"[{i}:v]scale=360:640[s{i}];" for i in range(n)) + "".join(f"[s{i}]" for i in range(n)) + \
        f"xstack=inputs={n}:layout=" + "|".join(f"{(i % 4) * 360}_{(i // 4) * 640}" for i in range(n)) + ":fill=0x080D2B[o]"
    if n == 1:
        filt = "[0:v]scale=360:640[o]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", filt, "-map", "[o]", "-q:v", "4", str(out)], check=True)
    return out


def critica(hoja_jpg, sb, models):
    import base64
    escenas = "\n".join(f"{i}. {s['text']}" for i, s in enumerate(sb["scenes"]))
    p = ("Sos un editor exigente de YouTube Shorts. Esta imagen tiene un cuadro de cada escena de un video animado "
         "(en orden, de izquierda a derecha y de arriba a abajo; los subtítulos de abajo son de prueba). Frase de cada escena:\n"
         + escenas + "\n\nRevisá: ¿se entiende qué es cada dibujo y tiene que ver con su frase? ¿hay cosas cortadas, "
         "encimadas con el titular, fuera de cuadro, demasiado chicas o una escena vacía/fea? ¿se ve profesional?\n"
         'Devolvé SOLO JSON: {"nota": 1-10, "problemas": ["problema concreto + escena + cómo arreglarlo"]}')
    img = base64.b64encode(hoja_jpg.read_bytes()).decode()
    v = gemini([{"text": p}, {"inline_data": {"mime_type": "image/jpeg", "data": img}}], models, as_json=True, temp=0.2)
    return int(v.get("nota", 0)), [str(x) for x in v.get("problemas", [])][:8]


# ---------------------------------------------------------------- todo junto
def storyboard(idea, models):
    fr = frases(idea["narration"])
    plan = gemini([{"text": PLAN.replace("{frases}", "\n".join(f"{i}. {s}" for i, s in enumerate(fr)))}], models, as_json=True)
    keys = [re.sub(r"[^a-z0-9]", "", str(k).lower()) or f"e{i}" for i, k in enumerate(plan.get("keys", []))]
    keys = [k if keys.index(k) == i else f"{k}{i}" for i, k in enumerate(keys)]
    if len(keys) != len(fr) or len(plan.get("visual", [])) != len(fr):
        raise RuntimeError("Gemini planeó otra cantidad de escenas")
    head = plan.get("head") or []
    plan["head"] = [head[i] if i < len(head) else ["", ""] for i in range(len(fr))]
    sfx = []
    for fx in plan.get("sfx", []):
        if isinstance(fx, dict) and fx.get("tipo") in SFX and isinstance(fx.get("escena"), int) and 0 <= fx["escena"] < len(fr):
            x = {"tipo": fx["tipo"], "escena": fx["escena"], "gain": min(0.9, max(0.3, float(fx.get("gain", 0.6))))}
            pal = R.norm(str(fx.get("palabra", "")))
            if pal and pal in [R.norm(w) for w in fr[fx["escena"]].split()]:
                x["palabra"] = pal
            else:
                x["inicio"] = 0.2
            sfx.append(x)
    texto = " ".join(fr)
    sb = {"id": idea["id"], "title": idea["title"], "pause": 0.18, "tail": 0.8,
          "scenes": [{"key": k, "text": s} for k, s in zip(keys, fr)],
          "keywords": [k for k in plan.get("keywords", []) if isinstance(k, str) and k.lower() in texto.lower()][:15],
          "caption_replace": [r for r in plan.get("caption_replace", []) if isinstance(r, list) and len(r) == 2
                              and isinstance(r[0], str) and r[0] in texto],
          "sfx": sfx or [{"tipo": "brillo", "escena": 0, "inicio": 0.1, "gain": 0.5}]}
    return sb, plan


def make_video(idea, work, out, cfg, fake=False):
    models = cfg.get("escena_models") or ["gemini-pro-latest"] + cfg.get("gemini_models", ["gemini-flash-latest"])
    work, out = Path(work).resolve(), Path(out).resolve()
    folder = work / "escena"; folder.mkdir(parents=True, exist_ok=True)
    sbp, jsp = folder / "storyboard.json", folder / "scene.js"
    if sbp.exists() and (folder / "plan.json").exists():  # de un intento anterior: no se gasta Gemini de nuevo
        sb, plan = json.loads(sbp.read_text(encoding="utf-8")), json.loads((folder / "plan.json").read_text(encoding="utf-8"))
    else:
        sb, plan = storyboard(idea, models)
        sbp.write_text(json.dumps(sb, ensure_ascii=False, indent=1), encoding="utf-8")
        (folder / "plan.json").write_text(json.dumps(plan, ensure_ascii=False, indent=1), encoding="utf-8")
    sb.setdefault("voice", cfg.get("voice", "es-AR-TomasNeural")); sb.setdefault("rate", cfg.get("voice_rate", "+20%"))
    log(f"{len(sb['scenes'])} escenas: {', '.join(s['key'] for s in sb['scenes'])}")

    pw = work / "escena_prueba"; pw.mkdir(exist_ok=True)
    if not (folder / "ok").exists():
        _, words, scenes, total = R.make_voice(sb, pw, True)  # tiempos aproximados, sin gastar voz
        data = {"scenes": scenes, "words": words, "chunks": R.chunks(words, scenes, sb), "total": total}
        mejor, codigo, problemas = None, None, None
        for intento in range(1, cfg.get("escena_intentos", 3) + 1):
            try:
                codigo = pedir_escena(sb, plan, models, codigo, problemas)
            except Exception as e:
                log(f"Intento {intento}: {e}")
                continue
            jsp.write_text(codigo + "\n" + SWAY, encoding="utf-8")
            problemas, fotos = probar(folder, data, total, pw)
            if problemas and not fotos:
                log(f"Intento {intento}: {problemas[0]}")
                continue
            nota, crit = 0, []
            try:
                nota, crit = critica(hoja(fotos, pw), sb, cfg.get("gemini_models", models))
            except Exception as e:
                log(f"No se pudo pedir la revisión visual ({str(e)[:120]}); cuenta solo la prueba técnica")
                nota = 7
            nota -= 2 * len(problemas)
            log(f"Intento {intento}: nota {nota}/10" + (f" | {'; '.join((problemas + crit)[:4])[:400]}" if problemas or crit else ""))
            if not mejor or nota > mejor[0]:
                mejor = (nota, codigo)
                if (pw / "probe_hoja.jpg").exists():
                    shutil.copy(pw / "probe_hoja.jpg", work / "escena_hoja.jpg")
            if nota >= cfg.get("escena_nota_min", 8):
                break
            problemas = problemas + crit
        if not mejor or mejor[0] < cfg.get("escena_nota_ok", 6):
            raise RuntimeError(f"la escena no quedó bien (mejor nota {mejor[0] if mejor else 'ninguna'})")
        jsp.write_text(mejor[1] + "\n" + SWAY, encoding="utf-8")
        (folder / "ok").write_text(str(mejor[0]))

    # video final con la voz de verdad (mismo camino que los hechos a mano)
    rw = work / "escena_render"; rw.mkdir(exist_ok=True)
    voice, words, scenes, total = R.make_voice(sb, rw, fake)
    data = {"scenes": scenes, "words": words, "chunks": R.chunks(words, scenes, sb), "total": total}
    audio = R.mix(voice, R.sfx_track(sb, words, scenes, total, rw), total, rw, int(re.sub(r"\D", "", sb["id"]) or 1))
    video = rw / "video_sin_audio.mp4"
    R.film(folder, data, total, video, rw)
    tmp = out.with_name(out.stem + "_tmp.mp4")
    R.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
           "-c:a", "aac", "-b:a", "192k", "-ar", R.SR, "-t", f"{total:.3f}", "-movflags", "+faststart", tmp])
    rep = R.qa(tmp, total)
    if rep["freeze"] or rep["black"]:
        tmp.unlink(missing_ok=True)
        raise RuntimeError(f"el video final tiene tramos quietos {rep['freeze']} o negros {rep['black']}")
    tmp.replace(out)
    log(f"Listo: {out.name} ({total:.1f}s, {rep['loudness_I']} LUFS)")
    return out, total


if __name__ == "__main__":
    ide = next(a for a in sys.argv[1:] if not a.startswith("--"))
    cfg0 = json.loads((ROOT / "config.json").read_text(encoding="utf-8"))
    idea0 = next(i for i in json.loads((ROOT / "ideas.json").read_text(encoding="utf-8")) if i["id"] == ide)
    w0 = ROOT / "work_escena" / ide; w0.mkdir(parents=True, exist_ok=True)
    o0 = ROOT / "work_escena" / f"short_{ide}.mp4"
    make_video(idea0, w0, o0, cfg0, fake="--fake" in sys.argv)
