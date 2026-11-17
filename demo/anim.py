"""
Animación hecha con código (sin IA de video): cada escena es una página HTML con animaciones CSS que se
"filma" cuadro por cuadro con Chromium (Playwright) y se codifica con ffmpeg. Todo se mueve siempre
(estrellas, deriva de cámara, objetos), así que nunca hay imagen congelada.

Uso: render_scene(html_body, segundos, destino.mp4)
"""
import random, subprocess
from pathlib import Path

W, H, FPS = 1080, 1920, 30

BASE_CSS = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1920px;overflow:hidden}
body{font-family:'Inter','Noto Color Emoji',sans-serif;color:#fff;
  background:radial-gradient(ellipse at 50% 32%,#24357e 0%,#101a52 45%,#060824 100%)}
.stage{position:absolute;inset:0;transform-origin:50% 45%;animation:drift var(--d) linear forwards}
@keyframes drift{from{transform:scale(1)}to{transform:scale(1.08)}}
.star{position:absolute;border-radius:50%;background:#fff;animation:tw 2.4s ease-in-out infinite alternate}
@keyframes tw{from{opacity:.15}to{opacity:1}}
.label{position:absolute;left:60px;right:60px;top:300px;text-align:center;font-weight:900;
  font-size:104px;line-height:1.02;letter-spacing:-2px;text-transform:uppercase;
  text-shadow:0 8px 0 rgba(0,0,0,.35),0 0 40px rgba(0,0,0,.4);
  animation:pop .45s cubic-bezier(.2,1.6,.4,1) both}
.label b{color:#ffd400}
@keyframes pop{from{transform:scale(.3);opacity:0}to{transform:scale(1);opacity:1}}
.moon{position:absolute;border-radius:50%;
  background:radial-gradient(circle at 36% 34%,#fffdf2 0%,#f4ebc8 40%,#dccb98 72%,#bfae7a 100%);
  box-shadow:0 0 90px 25px rgba(255,238,190,.38)}
.moon i{position:absolute;border-radius:50%;background:rgba(150,130,90,.35)}
.earth{position:absolute;border-radius:50%;overflow:hidden;
  background:radial-gradient(circle at 35% 30%,#7fd3ff 0%,#2f8be0 45%,#14408f 100%);
  box-shadow:0 0 80px 20px rgba(80,170,255,.35)}
.earth i{position:absolute;border-radius:45% 55% 50% 40%;background:#3fbf5f;opacity:.95}
.emoji{position:absolute;font-family:'Noto Color Emoji';line-height:1}
.city{position:absolute;bottom:560px;left:0;right:0;height:420px}
.bld{position:absolute;bottom:0;background:#0a0f2e;border-top:6px solid #1c2557}
.bld s{position:absolute;width:22px;height:30px;background:#ffd86b;opacity:.85;animation:tw 1.7s ease-in-out infinite alternate}
.ground{position:absolute;left:0;right:0;bottom:0;height:560px;background:#070b26}
.hill{position:absolute;bottom:520px;border-radius:50% 50% 0 0;background:#0c1238}
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


def stars(n=70, seed=1):
    r = random.Random(seed)
    return "".join(
        f'<div class="star" style="left:{r.randint(0, W)}px;top:{r.randint(0, 1250)}px;'
        f'width:{(z := r.choice([3, 4, 5, 6, 8]))}px;height:{z}px;animation-delay:-{r.uniform(0, 2.4):.2f}s"></div>'
        for _ in range(n))


def moon(x, y, size, extra=""):
    c = [(.22, .30, .16), (.55, .22, .11), (.60, .58, .19), (.30, .65, .10), (.75, .45, .08)]
    craters = "".join(f'<i style="left:{a*size:.0f}px;top:{b*size:.0f}px;width:{s*size:.0f}px;height:{s*size:.0f}px"></i>'
                      for a, b, s in c)
    return f'<div class="moon" style="left:{x}px;top:{y}px;width:{size}px;height:{size}px;{extra}">{craters}</div>'


def earth(x, y, size, extra=""):
    b = [(.12, .18, .38, .26), (.55, .45, .34, .30), (.25, .66, .30, .18), (.68, .12, .2, .14)]
    land = "".join(f'<i style="left:{a*size:.0f}px;top:{c*size:.0f}px;width:{w*size:.0f}px;height:{h*size:.0f}px"></i>'
                   for a, c, w, h in b)
    return f'<div class="earth" style="left:{x}px;top:{y}px;width:{size}px;height:{size}px;{extra}">{land}</div>'


def city(seed=3):
    r = random.Random(seed)
    out, x = [], -20
    while x < W:
        w, h = r.randint(90, 170), r.randint(160, 410)
        win = "".join(f'<s style="left:{18 + 40*cx}px;bottom:{30 + 55*cy}px;animation-delay:-{r.uniform(0,1.7):.2f}s"></s>'
                      for cx in range((w - 20) // 40) for cy in range((h - 40) // 55) if r.random() < .45)
        out.append(f'<div class="bld" style="left:{x}px;width:{w}px;height:{h}px">{win}</div>')
        x += w + r.randint(4, 18)
    return '<div class="city">' + "".join(out) + "</div>"


def _font_css():
    """La tipografía del canal (fonts/Inter-Black.otf) va adentro de la página: así se ve igual en GitHub."""
    import base64
    f = Path(__file__).resolve().parent.parent / "fonts" / "Inter-Black.otf"
    if not f.exists():
        return ""
    data = base64.b64encode(f.read_bytes()).decode()
    return f"@font-face{{font-family:'Inter';font-weight:900;src:url(data:font/otf;base64,{data}) format('opentype')}}"


FONT_CSS = _font_css()


def page(body, secs, css=""):
    return (f"<!doctype html><html><head><meta charset='utf-8'><style>{FONT_CSS}{BASE_CSS}{css}</style></head>"
            f"<body style='--d:{secs:.2f}s'><div class='stage'>{body}</div><script>{JS}</script></body></html>")


def render_scene(html, secs, dest, browser=None):
    """Filma la página cuadro por cuadro (JPEG 92) y la codifica en un mp4 de exactamente `secs` segundos."""
    from playwright.sync_api import sync_playwright
    dest = Path(dest)
    tmp = dest.with_name(dest.stem + ".part.mp4")
    n = int(round(secs * FPS))
    own = browser is None
    pw = sync_playwright().start() if own else None
    br = pw.chromium.launch() if own else browser
    pg = br.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
    pg.set_content(html, wait_until="load")
    pg.evaluate("document.fonts.ready")
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg",
                           "-i", "-", "-c:v", "libx264", "-crf", "18", "-preset", "veryfast", "-pix_fmt", "yuv420p",
                           "-r", str(FPS), str(tmp)], stdin=subprocess.PIPE)
    try:
        for f in range(n):
            pg.evaluate(f"setTime({f / FPS:.4f})")
            ff.stdin.write(pg.screenshot(type="jpeg", quality=92))
    finally:
        ff.stdin.close()
        ok = ff.wait() == 0
        pg.close()
        if own:
            br.close(); pw.stop()
    if not ok:
        raise RuntimeError(f"ffmpeg falló filmando {dest.name}")
    tmp.rename(dest)
    return dest


def snapshot(html, t, dest):
    """Un cuadro suelto (para revisar el diseño antes de filmar todo)."""
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        br = pw.chromium.launch()
        pg = br.new_page(viewport={"width": W, "height": H})
        pg.set_content(html, wait_until="load")
        pg.evaluate("document.fonts.ready")
        pg.evaluate(f"setTime({t})")
        pg.screenshot(path=str(dest), type="jpeg", quality=92)
        br.close()
