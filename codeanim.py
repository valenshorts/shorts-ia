"""
Estilo "animación con código" para El Porqué de Todo: escenas ilustradas (cielo nocturno, ciudad, campo, espacio,
mar, laboratorio, cocina, cuerpo) con objetos dibujados (Luna, Tierra, Sol) y emojis que se mueven, crecen, se alejan
o entran, más números que cuentan y sellos. Se dibuja con HTML/CSS y se filma cuadro por cuadro con Chromium.
No usa IA de video ni cuota de Hugging Face: Gemini solo decide qué poner en cada escena.
"""
import base64, json, os, random, re, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
W, H, FPS = 1080, 1920, 30
FONDOS = ("noche", "ciudad", "campo", "espacio", "mar", "laboratorio", "cocina", "cuerpo")
POS = {"centro": (540, 880), "izq": (280, 900), "der": (800, 900), "arriba": (540, 600), "abajo": (540, 1130),
       "arriba_izq": (300, 640), "arriba_der": (780, 640)}
TAM = {"chico": 150, "medio": 240, "grande": 360}
ANIMS = ("rebota", "crece", "achica", "se_aleja", "entra", "gira", "flota", "late")
DIBUJOS = ("luna", "tierra", "sol")


def _font_css():
    f = ROOT / "fonts" / "Inter-Black.otf"
    if not f.exists():
        return ""
    return ("@font-face{font-family:'Inter';font-weight:900;src:url(data:font/otf;base64,"
            + base64.b64encode(f.read_bytes()).decode() + ") format('opentype')}")


CSS = _font_css() + """
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1920px;overflow:hidden}
body{font-family:'Inter','Noto Color Emoji',sans-serif;color:#fff;background:var(--bg)}
.stage{position:absolute;inset:0;transform-origin:50% 45%;animation:drift var(--d) linear both}
@keyframes drift{from{transform:scale(1)}to{transform:scale(1.08)}}
.star{position:absolute;border-radius:50%;background:#fff;animation:tw 2.4s ease-in-out infinite alternate}
@keyframes tw{from{opacity:.15}to{opacity:1}}
.label{position:absolute;left:60px;right:60px;top:300px;text-align:center;font-weight:900;font-size:104px;
  line-height:1.02;letter-spacing:-2px;text-transform:uppercase;text-shadow:0 8px 0 rgba(0,0,0,.4),0 0 40px rgba(0,0,0,.45);
  animation:pop .45s cubic-bezier(.2,1.6,.4,1) both}
.label b{color:#ffd400}
@keyframes pop{from{scale:.3;opacity:0}to{scale:1;opacity:1}}
.p{position:absolute;display:flex;align-items:center;justify-content:center}
.p .e{font-family:'Noto Color Emoji';line-height:1;filter:drop-shadow(0 14px 0 rgba(0,0,0,.25))}
.moon{border-radius:50%;background:radial-gradient(circle at 36% 34%,#fffdf2 0%,#f4ebc8 40%,#dccb98 72%,#bfae7a 100%);
  box-shadow:0 0 90px 25px rgba(255,238,190,.38);position:relative}
.moon i{position:absolute;border-radius:50%;background:rgba(150,130,90,.35)}
.earth{border-radius:50%;overflow:hidden;position:relative;
  background:radial-gradient(circle at 35% 30%,#7fd3ff 0%,#2f8be0 45%,#14408f 100%);box-shadow:0 0 80px 20px rgba(80,170,255,.35)}
.earth i{position:absolute;border-radius:45% 55% 50% 40%;background:#3fbf5f}
.sun{border-radius:50%;background:radial-gradient(circle at 40% 38%,#fff6b0 0%,#ffd23f 45%,#ff9f1c 100%);
  box-shadow:0 0 120px 50px rgba(255,190,60,.55);animation:glow 1.6s ease-in-out infinite alternate}
@keyframes glow{from{box-shadow:0 0 90px 35px rgba(255,190,60,.45)}to{box-shadow:0 0 150px 70px rgba(255,190,60,.65)}}
.ground{position:absolute;left:0;right:0;bottom:0;background:#070b26}
.bld{position:absolute;bottom:0;background:#0a0f2e;border-top:6px solid #1c2557}
.bld s{position:absolute;width:22px;height:30px;background:#ffd86b;opacity:.85;animation:tw 1.7s ease-in-out infinite alternate}
.hill{position:absolute;border-radius:50% 50% 0 0}
.wave{position:absolute;left:-200px;width:1480px;border-radius:45%;animation:wv 3s ease-in-out infinite alternate}
@keyframes wv{from{translate:-60px 0}to{translate:60px 0}}
.bub{position:absolute;border-radius:50%;border:5px solid rgba(160,255,230,.55);animation:up 3.5s linear infinite}
@keyframes up{from{translate:0 0;opacity:0}15%{opacity:1}to{translate:0 -700px;opacity:0}}
.cell{position:absolute;border-radius:50%;background:radial-gradient(circle,#ff5a7a 0%,#c2185b 70%);opacity:.5;
  animation:late 1.2s ease-in-out infinite alternate}
.big{position:absolute;left:0;right:0;text-align:center;font-weight:900;color:#ffd400;text-shadow:0 10px 0 rgba(0,0,0,.35)}
.unit{position:absolute;left:0;right:0;text-align:center;font-weight:900;font-size:86px;text-shadow:0 6px 0 rgba(0,0,0,.35)}
.stamp{position:absolute;left:150px;right:150px;padding:26px 0;text-align:center;font-weight:900;font-size:90px;
  border:12px solid currentColor;border-radius:28px;background:rgba(10,10,30,.55);rotate:-8deg}
.mid{position:absolute;left:0;right:0;text-align:center;font-weight:900;font-size:170px;color:#ffd400;
  text-shadow:0 10px 0 rgba(0,0,0,.35)}
@keyframes rebota{from{translate:0 0;rotate:-5deg}to{translate:0 -26px;rotate:5deg}}
@keyframes flota{from{translate:0 0}to{translate:0 -40px}}
@keyframes late{from{scale:1}to{scale:1.12}}
@keyframes gira{to{rotate:360deg}}
@keyframes crece{0%{scale:.55}30%{scale:.55}100%{scale:1.3}}
@keyframes achica{from{scale:1;opacity:1}to{scale:.3;opacity:.8}}
@keyframes se_aleja{from{translate:0 0;scale:1}to{translate:150px -170px;scale:.65}}
@keyframes entra{from{translate:0 900px;rotate:25deg}to{translate:0 0;rotate:0deg}}
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

BG = {"noche": "radial-gradient(ellipse at 50% 32%,#24357e 0%,#101a52 45%,#060824 100%)",
      "ciudad": "radial-gradient(ellipse at 50% 32%,#2a3a8a 0%,#121c58 45%,#060824 100%)",
      "campo": "radial-gradient(ellipse at 50% 30%,#2b3f8f 0%,#13205c 50%,#070a2a 100%)",
      "espacio": "radial-gradient(ellipse at 50% 40%,#1d1250 0%,#0b0a2e 55%,#020210 100%)",
      "mar": "linear-gradient(180deg,#0f2a6b 0%,#0a3d7a 45%,#05244d 100%)",
      "laboratorio": "radial-gradient(ellipse at 50% 35%,#0d5b63 0%,#08343f 55%,#03161c 100%)",
      "cocina": "radial-gradient(ellipse at 50% 30%,#7a3a14 0%,#3d1b0a 55%,#1a0b04 100%)",
      "cuerpo": "radial-gradient(ellipse at 50% 35%,#5b1236 0%,#300a22 55%,#12040d 100%)"}


def _esc(s):
    s = str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return s.replace("&lt;b&gt;", "<b>").replace("&lt;/b&gt;", "</b>")


def _stars(r, n, top=1250):
    return "".join(f'<div class="star" style="left:{r.randint(0, W)}px;top:{r.randint(0, top)}px;'
                   f'width:{(z := r.choice([3, 4, 5, 6, 8]))}px;height:{z}px;animation-delay:-{r.uniform(0, 2.4):.2f}s"></div>'
                   for _ in range(n))


def _city(r):
    out, x = [], -20
    while x < W:
        w, h = r.randint(90, 170), r.randint(160, 400)
        win = "".join(f'<s style="left:{18 + 40 * cx}px;bottom:{30 + 55 * cy}px;animation-delay:-{r.uniform(0, 1.7):.2f}s"></s>'
                      for cx in range((w - 20) // 40) for cy in range((h - 40) // 55) if r.random() < .45)
        out.append(f'<div class="bld" style="left:{x}px;width:{w}px;height:{h}px">{win}</div>')
        x += w + r.randint(4, 18)
    return '<div style="position:absolute;bottom:560px;left:0;right:0;height:420px">' + "".join(out) + "</div>"


def backdrop(kind, seed):
    """Lo que va detrás de los objetos. Todo se mueve (estrellas, ventanas, olas, burbujas, células)."""
    r = random.Random(seed)
    if kind == "ciudad":
        return _stars(r, 60) + _city(r) + '<div class="ground" style="height:560px"></div>'
    if kind == "campo":
        return (_stars(r, 90) + '<div class="hill" style="left:-200px;bottom:520px;width:900px;height:300px;background:#0c1238"></div>'
                '<div class="hill" style="left:420px;bottom:520px;width:900px;height:220px;background:#0e1640"></div>'
                '<div class="ground" style="height:530px"></div>')
    if kind == "espacio":
        return (_stars(r, 160, 1900) + '<div class="p" style="left:820px;top:1280px;width:260px;height:260px;opacity:.45">'
                '<div class="e" style="font-size:200px;animation:flota 3s ease-in-out infinite alternate">🪐</div></div>')
    if kind == "mar":
        return (_stars(r, 25, 500) + "".join(
            f'<div class="wave" style="top:{1120 + k * 90}px;height:900px;background:{c};animation-delay:-{k * .7:.1f}s"></div>'
            for k, c in enumerate(("#1565c0", "#0d47a1", "#0a3880", "#072a63"))))
    if kind == "laboratorio":
        return (''.join(f'<div class="bub" style="left:{r.randint(40, 1000)}px;top:{r.randint(900, 1500)}px;'
                        f'width:{(z := r.randint(30, 90))}px;height:{z}px;animation-delay:-{r.uniform(0, 3.5):.2f}s"></div>'
                        for _ in range(16))
                + '<div style="position:absolute;inset:0;background-image:linear-gradient(rgba(120,255,230,.07) 2px,transparent 2px),'
                  'linear-gradient(90deg,rgba(120,255,230,.07) 2px,transparent 2px);background-size:90px 90px"></div>')
    if kind == "cocina":
        return ('<div style="position:absolute;left:0;right:0;top:0;height:1400px;opacity:.12;background-image:'
                'linear-gradient(#fff 3px,transparent 3px),linear-gradient(90deg,#fff 3px,transparent 3px);background-size:120px 120px"></div>'
                '<div class="ground" style="height:520px;background:#2a1408;border-top:18px solid #5d3418"></div>')
    if kind == "cuerpo":
        return "".join(f'<div class="cell" style="left:{r.randint(-60, 1000)}px;top:{r.randint(80, 1500)}px;'
                       f'width:{(z := r.randint(70, 200))}px;height:{z}px;animation-delay:-{r.uniform(0, 1.2):.2f}s"></div>'
                       for _ in range(14))
    return _stars(r, 110)  # noche


def _drawn(kind, size):
    if kind == "luna":
        c = [(.22, .30, .16), (.55, .22, .11), (.60, .58, .19), (.30, .65, .10), (.75, .45, .08)]
        return (f'<div class="moon" style="width:{size}px;height:{size}px">'
                + "".join(f'<i style="left:{a * size:.0f}px;top:{b * size:.0f}px;width:{s * size:.0f}px;height:{s * size:.0f}px"></i>'
                          for a, b, s in c) + "</div>")
    if kind == "tierra":
        b = [(.12, .18, .38, .26), (.55, .45, .34, .30), (.25, .66, .30, .18), (.68, .12, .2, .14)]
        return (f'<div class="earth" style="width:{size}px;height:{size}px">'
                + "".join(f'<i style="left:{a * size:.0f}px;top:{c * size:.0f}px;width:{w * size:.0f}px;height:{h * size:.0f}px"></i>'
                          for a, c, w, h in b) + "</div>")
    return f'<div class="sun" style="width:{size}px;height:{size}px"></div>'


def prop_html(p, d, i):
    x, y = POS.get(p.get("pos"), POS["centro"])
    size = TAM.get(p.get("tam"), TAM["medio"])
    anim = p.get("anim") if p.get("anim") in ANIMS else "rebota"
    loop = {"rebota": "rebota 1.4s ease-in-out infinite alternate", "flota": "flota 2.4s ease-in-out infinite alternate",
            "late": "late .7s ease-in-out infinite alternate", "gira": "gira 4s linear infinite",
            "crece": f"crece {d:.2f}s ease-in-out both", "achica": f"achica {d:.2f}s ease-in both",
            "se_aleja": f"se_aleja {d:.2f}s ease-in-out both",
            "entra": "entra .7s cubic-bezier(.2,1.2,.3,1) both"}[anim]
    if anim == "entra":
        loop += ", rebota 1.4s ease-in-out .7s infinite alternate"
    e = str(p.get("e") or "✨")
    inner = _drawn(e, size) if e in DIBUJOS else f'<div class="e" style="font-size:{size}px">{_esc(e)}</div>'
    delay = 0.12 + 0.18 * i
    return (f'<div class="p" style="left:{x - 300}px;top:{y - 300}px;width:600px;height:600px;'
            f'animation:pop .45s cubic-bezier(.2,1.6,.4,1) {delay:.2f}s both">'
            f'<div style="animation:{loop}">{inner}</div></div>')


def scene_html(spec, d, seed):
    """spec: {fondo, titulo, objetos:[{e,pos,tam,anim}], numero:{valor,unidad}, sello, entre}"""
    hit = min(max(d * 0.5, 0.5), d - 0.3)
    fondo = spec.get("fondo") if spec.get("fondo") in FONDOS else "noche"
    body = backdrop(fondo, seed)
    objs = [o for o in (spec.get("objetos") or []) if isinstance(o, dict)][:4]
    body += "".join(prop_html(o, d, i) for i, o in enumerate(objs))
    if spec.get("entre") in ("=", "VS", "→"):
        body += f'<div class="mid" style="top:800px;animation:pop .4s cubic-bezier(.2,1.6,.4,1) {hit * 0.8:.2f}s both">{spec["entre"]}</div>'
    num = spec.get("numero")
    if isinstance(num, dict) and num.get("valor") is not None:
        try:
            v = float(str(num["valor"]).replace(",", "."))
            dec = 0 if v == int(v) else 1
            top = 520 if objs else 640
            body += (f'<div class="big" style="top:{top}px;font-size:250px" data-count="0,{v},0.2,{max(hit, 0.5):.2f},{dec}">0</div>'
                     f'<div class="unit" style="top:{top + 290}px;animation:pop .4s cubic-bezier(.2,1.6,.4,1) {hit:.2f}s both">'
                     f'{_esc(num.get("unidad", ""))}</div>')
        except Exception:
            pass
    if spec.get("sello"):
        color = "#ff3b5c" if str(spec["sello"]).upper() in ("FALSO", "MITO", "NO", "TRUCO") else "#2ee59d"
        body += (f'<div class="stamp" style="top:780px;color:{color};animation:stamp .35s cubic-bezier(.2,1.8,.4,1) '
                 f'{hit:.2f}s both">{_esc(str(spec["sello"])[:12]).upper()}</div>'
                 '<style>@keyframes stamp{from{scale:2.4;opacity:0}to{scale:1;opacity:1}}</style>')
    title = f'<div class="label">{_esc(spec.get("titulo", ""))}</div>' if spec.get("titulo") else ""
    return (f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head>"
            f"<body style='--bg:{BG[fondo]};--d:{d:.2f}s'><div class='stage'>{body}{title}</div>"
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


SPEC_PROMPT = """Sos el animador de un Short de datos curiosos con estilo ilustrado (fondo oscuro, objetos que se mueven).
Hay una escena por frase de la narración. Para cada frase armá una escena con varias cosas que cuenten lo que se dice:
- "fondo": uno de noche, ciudad, campo, espacio, mar, laboratorio, cocina, cuerpo (el que mejor ambiente la frase).
- "titulo": 1 a 4 palabras en español con la palabra clave entre <b> y </b> (sale en amarillo).
- "objetos": de 1 a 3 objetos. Cada uno: {"e": un emoji, o "luna", "tierra" o "sol" (dibujados);
  "pos": centro, izq, der, arriba, abajo, arriba_izq o arriba_der; "tam": chico, medio o grande;
  "anim": rebota, crece, achica, se_aleja, entra, gira, flota o late}. Que los objetos muestren lo que dice la frase
  (ej. "la Luna se aleja de la Tierra" → tierra a la izq rebotando y luna a la der con se_aleja).
  Si usás pos izq y der, no pongas otro objeto en el centro.
- Opcionales: "numero": {"valor": número, "unidad": texto corto} solo si la frase dice una cifra (con números, poné
  como máximo 1 objeto, en pos abajo); "sello": FALSO, MITO, TRUCO, REAL o WOW cuando la frase desmiente o
  confirma algo; "entre": "=", "VS" o "→" para poner entre un objeto izq y uno der.
Variá fondos y movimientos para que cada escena se vea distinta.
Respondé SOLO un JSON: una lista con exactamente {n} escenas, en orden.
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
    import time
    for ronda in range(5):  # Gemini a veces está saturado (503): espera y reintenta
        for model in models:
            try:
                req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                                             data=body, headers={"Content-Type": "application/json", "x-goog-api-key": key})
                with urllib.request.urlopen(req, timeout=90) as r:
                    v = json.loads(json.loads(r.read())["candidates"][0]["content"]["parts"][0]["text"])
                if isinstance(v, dict):  # a veces viene envuelto: {"escenas": [...]}
                    v = next((x for x in v.values() if isinstance(x, list)), None)
                if isinstance(v, list) and len(v) == len(sentences):
                    return v
                print(f"[anim] Gemini {model} mandó otra cantidad de escenas", flush=True)
            except Exception as e:
                print(f"[anim] Gemini {model} no pudo diseñar las escenas: {e}", flush=True)
        if ronda < 4:
            time.sleep(20 * (ronda + 1))
    return None


FALLBACK = {"Espacio": ("espacio", "🚀 🪐 ☄️ 🌙 ⭐ 🛰️"), "Cuerpo humano": ("cuerpo", "🧠 🫀 👀 🦴 💪 👂"),
            "Ciencia loca": ("laboratorio", "🧪 ⚡ 🔬 🧲 💥 🌡️"), "Comida increíble": ("cocina", "🍔 🍕 🍫 🍌 🍓 🧂"),
            "Inventos por accidente": ("laboratorio", "💡 🛠️ ⚙️ 🔧 🏭 📦"), "Mitos falsos": ("noche", "🤔 ❌ 🧐 ✅ 😮 🔍"),
            "Naturaleza": ("campo", "🌋 🌳 🌊 🍂 🌈 ☀️"), "Lugares increíbles": ("ciudad", "🗺️ 🏛️ 🗼 🌍 🏔️ 🧭")}
STOP = set("que como para pero cuando donde porque esto esta este eso esa tiene tienen hace hacen sobre entre muy más "
           "todo toda todos todas cada desde hasta solo sola también aunque mientras".split())


def clean_specs(specs, sentences, idea):
    """Arregla o completa lo que mande Gemini; si no mandó nada, arma escenas simples del tema."""
    fondo0, pool = FALLBACK.get(idea.get("playlist"), ("noche", "🤯 😮 🔥 💥 👀 ✨"))
    pool = pool.split()
    out = []
    for i, s in enumerate(sentences):
        sp = specs[i] if specs and i < len(specs) and isinstance(specs[i], dict) else {}
        if sp.get("fondo") not in FONDOS:
            sp["fondo"] = fondo0
        objs = [o for o in (sp.get("objetos") or []) if isinstance(o, dict) and o.get("e")]
        if not objs and not isinstance(sp.get("numero"), dict):
            objs = [{"e": pool[i % len(pool)], "pos": "centro", "tam": "grande", "anim": "entra" if i == 0 else "rebota"}]
        sp["objetos"] = objs[:3]
        if not sp.get("titulo"):  # las 2 palabras más largas de la frase, en el orden en que aparecen
            words = [w for w in re.findall(r"\w+", s) if w.lower() not in STOP and len(w) > 3]
            keep = [w.upper() for w in sorted(sorted(words, key=len, reverse=True)[:2], key=words.index)]
            sp["titulo"] = " ".join(keep[:-1] + [f"<b>{keep[-1]}</b>"]) if keep else ""
        sp["titulo"] = re.sub(r"\s+", " ", str(sp["titulo"]))[:60]
        out.append(sp)
    return out


def make_visuals(idea, timeline, total, work, models):
    """Una toma por frase, del largo exacto de la frase."""
    from playwright.sync_api import sync_playwright
    sentences = [s for s, _, _ in timeline]
    specs = clean_specs(gemini_specs(sentences, models), sentences, idea)
    (work / "anim_specs.json").write_text(json.dumps(specs, ensure_ascii=False, indent=1), encoding="utf-8")
    starts = [0.0] + [timeline[k][1] for k in range(1, len(timeline))]
    ends = starts[1:] + [total]
    seed0 = int(re.sub(r"\D", "", idea["id"]) or 0)
    visuals = []
    with sync_playwright() as pw:
        br = pw.chromium.launch()
        for j, (sp, a, b) in enumerate(zip(specs, starts, ends)):
            clip = work / f"anim{j + 1}.mp4"
            render(scene_html(sp, b - a, seed0 * 10 + j), b - a, clip, br)
            visuals.append((clip, True, b - a))
        br.close()
    return visuals, starts[1:]
