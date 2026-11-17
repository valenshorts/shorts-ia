"""
Estilo "animación con código" para El Porqué de Todo: escenas muy movidas (colores fuertes, rayos que giran,
emojis que rebotan, golpes de cámara, números que cuentan) hechas con HTML/CSS y filmadas cuadro por cuadro con
Chromium. No usa IA de video ni cuota de Hugging Face. Gemini solo elige qué mostrar en cada frase.
"""
import base64, json, os, random, re, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
W, H, FPS = 1080, 1920, 30
TEMPLATES = ("emoji", "numero", "versus", "mito", "lista", "zoom")
PALETTES = [("#ff2e63", "#7b2ff7"), ("#00c6ff", "#0047ff"), ("#ff9a00", "#ff2d55"), ("#00e1a2", "#007cf0"),
            ("#f72585", "#3a0ca3"), ("#ffbe0b", "#fb5607"), ("#8338ec", "#3a86ff"), ("#06d6a0", "#118ab2")]


def _font_css():
    f = ROOT / "fonts" / "Inter-Black.otf"
    if not f.exists():
        return ""
    return ("@font-face{font-family:'Inter';font-weight:900;src:url(data:font/otf;base64,"
            + base64.b64encode(f.read_bytes()).decode() + ") format('opentype')}")


CSS = _font_css() + """
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1920px;overflow:hidden}
body{font-family:'Inter','Noto Color Emoji',sans-serif;color:#fff;background:linear-gradient(160deg,var(--c1),var(--c2))}
.cam{position:absolute;inset:0;transform-origin:50% 42%;animation:punch .35s cubic-bezier(.2,1,.3,1) both,
  drift var(--d) linear both,shake .32s linear var(--hit) both}
@keyframes punch{from{scale:1.25}to{scale:1}}
@keyframes drift{from{transform:scale(1)}to{transform:scale(1.1)}}
@keyframes shake{0%,100%{translate:0 0}20%{translate:-18px 10px}40%{translate:16px -12px}60%{translate:-10px -8px}80%{translate:8px 12px}}
.rays{position:absolute;left:-460px;top:-160px;width:2000px;height:2000px;opacity:.22;
  background:repeating-conic-gradient(#fff 0 9deg,transparent 9deg 22deg);border-radius:50%;
  animation:spin 9s linear infinite}
@keyframes spin{to{rotate:360deg}}
.blob{position:absolute;border-radius:50%;background:#fff;opacity:.13;animation:flo 3s ease-in-out infinite alternate}
@keyframes flo{from{translate:0 0}to{translate:0 -70px}}
.title{position:absolute;left:50px;right:50px;top:270px;text-align:center;font-weight:900;font-size:112px;
  line-height:1.0;letter-spacing:-2px;text-transform:uppercase;-webkit-text-stroke:10px #000;paint-order:stroke fill;
  text-shadow:0 12px 0 rgba(0,0,0,.35);animation:pop .4s cubic-bezier(.2,1.7,.4,1) .05s both}
.title b{color:#ffe600}
@keyframes pop{from{scale:.2;opacity:0}to{scale:1;opacity:1}}
@keyframes bob{from{translate:0 0;rotate:-6deg}to{translate:0 -30px;rotate:6deg}}
.e{position:absolute;font-family:'Noto Color Emoji';line-height:1;text-align:center;
  filter:drop-shadow(0 18px 0 rgba(0,0,0,.25))}
.flash{position:absolute;inset:0;background:#fff;opacity:0;animation:fl .25s ease-out var(--hit) forwards}
@keyframes fl{from{opacity:.75}to{opacity:0}}
"""

JS = """
window.setTime = (t) => {
  for (const a of document.getAnimations()) { a.pause(); a.currentTime = t * 1000; }
  for (const e of document.querySelectorAll('[data-count]')) {
    const [a, b, s, d, dec] = e.dataset.count.split(',').map(Number);
    const k = Math.min(1, Math.max(0, (t - s) / d)), v = a + (b - a) * (1 - Math.pow(1 - k, 3));
    e.textContent = v.toFixed(dec).replace('.', ',');
  }
};
"""


def _esc(s):
    s = str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return s.replace("&lt;b&gt;", "<b>").replace("&lt;/b&gt;", "</b>")


def _bg(seed):
    r = random.Random(seed)
    return "".join(f'<div class="blob" style="left:{r.randint(-100, 1000)}px;top:{r.randint(100, 1500)}px;'
                   f'width:{(z := r.randint(60, 220))}px;height:{z}px;animation-delay:-{r.uniform(0, 3):.2f}s"></div>'
                   for _ in range(9))


def scene_html(spec, d, seed):
    """spec: {"plantilla", "titulo", "emoji", "emoji2", "valor", "unidad", "items"}; d: segundos."""
    c1, c2 = PALETTES[seed % len(PALETTES)]
    hit = min(max(d * 0.55, 0.5), d - 0.3)
    k = spec.get("plantilla", "emoji")
    e1, e2 = _esc(spec.get("emoji") or "🤯"), _esc(spec.get("emoji2") or "❓")
    body = ""
    if k == "numero":
        dec = 0 if float(spec.get("valor", 0)) == int(float(spec.get("valor", 0))) else 1
        body = (f'<div style="position:absolute;left:0;right:0;top:640px;text-align:center;font-weight:900;'
                f'font-size:300px;color:#ffe600;-webkit-text-stroke:14px #000;paint-order:stroke fill" '
                f'data-count="0,{float(spec.get("valor", 0))},0.15,{max(hit - 0.2, 0.4):.2f},{dec}">0</div>'
                f'<div style="position:absolute;left:40px;right:40px;top:1000px;text-align:center;font-weight:900;'
                f'font-size:92px;-webkit-text-stroke:8px #000;paint-order:stroke fill;'
                f'animation:pop .35s cubic-bezier(.2,1.7,.4,1) {hit:.2f}s both">{_esc(spec.get("unidad", ""))}</div>')
    elif k == "versus":
        body = (f'<div class="e" style="font-size:300px;left:60px;top:700px;animation:inl .45s cubic-bezier(.2,1.4,.4,1) both,'
                f'bob 1s ease-in-out .45s infinite alternate">{e1}</div>'
                f'<div class="e" style="font-size:300px;right:60px;top:700px;animation:inr .45s cubic-bezier(.2,1.4,.4,1) .15s both,'
                f'bob 1.1s ease-in-out .6s infinite alternate">{e2}</div>'
                f'<div style="position:absolute;left:0;right:0;top:780px;text-align:center;font-weight:900;font-size:150px;'
                f'color:#ffe600;-webkit-text-stroke:12px #000;paint-order:stroke fill;'
                f'animation:pop .3s cubic-bezier(.2,1.8,.4,1) {hit:.2f}s both">VS</div>'
                '<style>@keyframes inl{from{translate:-700px 0}}@keyframes inr{from{translate:700px 0}}</style>')
    elif k == "mito":
        body = (f'<div class="e" style="font-size:380px;left:0;right:0;top:620px;animation:bob 1s ease-in-out infinite alternate">{e1}</div>'
                f'<div style="position:absolute;left:170px;right:170px;top:760px;padding:24px 0;text-align:center;'
                f'font-weight:900;font-size:120px;color:#ff1744;border:16px solid #ff1744;border-radius:30px;'
                f'background:rgba(255,255,255,.9);rotate:-10deg;'
                f'animation:pop .3s cubic-bezier(.2,1.8,.4,1) {hit:.2f}s both">FALSO</div>')
    elif k == "lista":
        items = [i for i in (spec.get("items") or []) if isinstance(i, (list, tuple)) and len(i) == 2][:3]
        step = min(hit / max(len(items), 1), 0.9)
        body = "".join(
            f'<div style="position:absolute;left:90px;right:90px;top:{600 + j * 230}px;height:190px;display:flex;'
            f'align-items:center;gap:40px;padding:0 44px;background:#fff;color:#111;border-radius:40px;'
            f'font-weight:900;font-size:76px;box-shadow:0 14px 0 rgba(0,0,0,.3);'
            f'animation:pop .35s cubic-bezier(.2,1.7,.4,1) {0.2 + j * step:.2f}s both">'
            f'<span style="font-family:Noto Color Emoji;font-size:110px">{_esc(a)}</span>{_esc(b)}</div>'
            for j, (a, b) in enumerate(items))
    elif k == "zoom":
        body = (f'<div class="e" style="font-size:360px;left:0;right:0;top:640px;'
                f'animation:zin {hit:.2f}s cubic-bezier(.5,0,.2,1) both,bob .9s ease-in-out {hit:.2f}s infinite alternate">{e1}</div>'
                '<style>@keyframes zin{from{scale:.05;rotate:-200deg}to{scale:1;rotate:0deg}}</style>')
    else:  # emoji
        body = (f'<div class="e" style="font-size:380px;left:0;right:0;top:620px;'
                f'animation:pop .45s cubic-bezier(.2,1.8,.4,1) .1s both,bob .8s ease-in-out .55s infinite alternate">{e1}</div>')
    title = f'<div class="title">{_esc(spec.get("titulo", ""))}</div>' if spec.get("titulo") else ""
    return (f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head>"
            f"<body style='--c1:{c1};--c2:{c2};--d:{d:.2f}s;--hit:{hit:.2f}s'><div class='cam'>"
            f"<div class='rays'></div>{_bg(seed)}{body}{title}</div><div class='flash'></div>"
            f"<script>{JS}</script></body></html>")


def render(html, secs, dest, browser):
    dest = Path(dest)
    tmp = dest.with_name(dest.stem + ".part.mp4")
    pg = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
    pg.set_content(html, wait_until="load")
    pg.evaluate("document.fonts.ready")
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg",
                           "-i", "-", "-c:v", "libx264", "-crf", "18", "-preset", "veryfast", "-pix_fmt", "yuv420p",
                           "-r", str(FPS), str(tmp)], stdin=subprocess.PIPE)
    try:
        for f in range(int(round(secs * FPS))):
            pg.evaluate(f"setTime({f / FPS:.4f})")
            ff.stdin.write(pg.screenshot(type="jpeg", quality=92))
    finally:
        ff.stdin.close()
        ok = ff.wait() == 0
        pg.close()
    if not ok:
        raise RuntimeError(f"ffmpeg falló filmando {dest.name}")
    tmp.rename(dest)
    return dest


SPEC_PROMPT = """Vas a diseñar las escenas de un Short animado de datos curiosos. Hay una escena por frase de la narración.
Para cada frase elegí una plantilla y sus datos. Plantillas:
- "emoji": un emoji grande que rebota. Datos: emoji, titulo.
- "zoom": un emoji que entra girando desde lejos (para algo sorprendente). Datos: emoji, titulo.
- "numero": un número que cuenta desde 0 (solo si la frase tiene una cifra). Datos: valor (número), unidad (texto corto), titulo.
- "versus": dos emojis enfrentados con un VS (comparaciones). Datos: emoji, emoji2, titulo.
- "mito": un emoji con un sello de FALSO (cuando la frase desmiente algo). Datos: emoji, titulo.
- "lista": 2 o 3 renglones [emoji, texto de 1 a 3 palabras]. Datos: items, titulo.
Siempre poné también "emoji2": otro emoji distinto y relacionado (se usa en una segunda toma de la misma frase).
Reglas: "titulo" en español, de 1 a 4 palabras, la palabra clave entre <b> y </b> (sale en amarillo). Emojis que
existan y que muestren lo que dice la frase. Variá las plantillas: nunca la misma tres veces seguidas.
Respondé SOLO un JSON: una lista con exactamente {n} objetos (uno por frase, en orden), cada uno con "plantilla" y sus datos.
Frases:
{frases}"""


def gemini_specs(sentences, models):
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        return None
    import urllib.request
    prompt = SPEC_PROMPT.replace("{n}", str(len(sentences))).replace(
        "{frases}", "\n".join(f"{i + 1}. {s}" for i, s in enumerate(sentences)))
    body = json.dumps({"contents": [{"parts": [{"text": prompt}]}],
                       "generationConfig": {"responseMimeType": "application/json", "temperature": 0.7}}).encode()
    for model in list(models) * 2:  # dos vueltas: a veces Gemini está saturado
        try:
            req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                                         data=body, headers={"Content-Type": "application/json", "x-goog-api-key": key})
            with urllib.request.urlopen(req, timeout=90) as r:
                v = json.loads(json.loads(r.read())["candidates"][0]["content"]["parts"][0]["text"])
            if isinstance(v, list) and len(v) == len(sentences):
                return v
        except Exception as e:
            print(f"[anim] Gemini {model} no pudo diseñar las escenas: {e}", flush=True)
    return None


FALLBACK_EMOJI = {"Espacio": "🚀 🌍 🪐 🌙 ⭐ ☄️", "Cuerpo humano": "🧠 🫀 👀 🦴 💪 👂", "Ciencia loca": "🧪 ⚡ 🔬 🧲 💥 🌡️",
                  "Comida increíble": "🍔 🍕 🍫 🍌 🍓 🧂", "Inventos por accidente": "💡 🛠️ ⚙️ 🔧 🏭 📦",
                  "Mitos falsos": "🤔 ❌ 🧐 ✅ 😮 🔍", "Naturaleza": "🌋 🌳 🌊 🍂 🌈 ☀️", "Lugares increíbles": "🗺️ 🏛️ 🗼 🌍 🏔️ 🧭"}
STOP = set("que como para pero cuando donde porque esto esta este eso esa tiene tienen hace hacen sobre entre muy más "
           "todo toda todos todas cada desde hasta solo sola también aunque mientras".split())


def clean_specs(specs, sentences, idea):
    """Arregla o completa lo que mande Gemini; si no mandó nada, arma escenas simples."""
    out = []
    for i, s in enumerate(sentences):
        sp = specs[i] if specs and i < len(specs) and isinstance(specs[i], dict) else {}
        k = sp.get("plantilla") if sp.get("plantilla") in TEMPLATES else ("zoom" if i == 0 else "emoji")
        if k == "numero":
            try:
                sp["valor"] = float(str(sp.get("valor")).replace(",", "."))
            except Exception:
                k = "emoji"
        if k == "lista" and not sp.get("items"):
            k = "emoji"
        sp["plantilla"] = k
        pool = FALLBACK_EMOJI.get(idea.get("playlist"), "🤯 😮 🔥 💥 👀 ✨").split()
        sp.setdefault("emoji", pool[i % len(pool)])
        if not sp.get("titulo"):  # las 2 palabras más largas de la frase, en el orden en que aparecen
            words = [w for w in re.findall(r"\w+", s) if w.lower() not in STOP and len(w) > 3]
            keep = sorted(sorted(words, key=len, reverse=True)[:2], key=words.index)
            keep = [w.upper() for w in keep]
            sp["titulo"] = " ".join(keep[:-1] + [f"<b>{keep[-1]}</b>"]) if keep else ""
        sp["titulo"] = re.sub(r"\s+", " ", str(sp["titulo"]))[:60]
        out.append(sp)
    return out


def make_visuals(idea, timeline, total, work, models):
    """Una o dos tomas por frase (las frases largas se cortan en dos para que haya más cortes)."""
    from playwright.sync_api import sync_playwright
    sentences = [s for s, _, _ in timeline]
    specs = clean_specs(gemini_specs(sentences, models), sentences, idea)
    (work / "anim_specs.json").write_text(json.dumps(specs, ensure_ascii=False, indent=1), encoding="utf-8")
    starts = [0.0] + [timeline[k][1] for k in range(1, len(timeline))]
    ends = starts[1:] + [total]
    shots = []
    for k, (a, b) in enumerate(zip(starts, ends)):
        if b - a > 3.6 and specs[k]["plantilla"] in ("emoji", "zoom", "mito"):
            m = (a + b) / 2
            alt = dict(specs[k], plantilla="zoom" if specs[k]["plantilla"] != "zoom" else "emoji",
                       emoji=specs[k].get("emoji2") or specs[k]["emoji"])
            shots += [(specs[k], a, m), (alt, m, b)]
        else:
            shots.append((specs[k], a, b))
    seed0 = int(re.sub(r"\D", "", idea["id"]) or 0)
    visuals = []
    with sync_playwright() as pw:
        br = pw.chromium.launch()
        for j, (sp, a, b) in enumerate(shots):
            clip = work / f"anim{j + 1}.mp4"
            render(scene_html(sp, b - a, seed0 + j), b - a, clip, br)
            visuals.append((clip, True, b - a))
        br.close()
    return visuals, [a for _, a, _ in shots[1:]]
