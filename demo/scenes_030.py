"""Escenas de prueba para la idea 030 ("La Luna se está yendo"): una por frase de la narración."""
from anim import page, stars, moon, earth, city


def s1(d):  # La Luna se está alejando de la Tierra, y se puede medir.
    css = f"""
    .m1{{animation:away {d}s ease-in-out forwards}}
    @keyframes away{{from{{transform:translate(0,0) scale(1)}}to{{transform:translate(120px,-120px) scale(.75)}}}}
    .line{{position:absolute;left:470px;top:930px;height:8px;width:260px;transform-origin:0 50%;
      transform:rotate(-24deg);background:repeating-linear-gradient(90deg,#ffd400 0 26px,transparent 26px 44px);
      animation:grow {d}s ease-in-out forwards}}
    @keyframes grow{{from{{width:230px}}to{{width:520px}}}}
    .e1{{animation:bob 3s ease-in-out infinite alternate}}
    @keyframes bob{{from{{transform:translateY(0) rotate(0)}}to{{transform:translateY(-14px) rotate(6deg)}}}}"""
    body = (stars(80, 1) + earth(110, 830, 400, "").replace('class="earth"', 'class="earth e1"')
            + '<div class="line"></div>'
            + moon(640, 720, 210).replace('class="moon"', 'class="moon m1"')
            + '<div class="label">La Luna se está <b>yendo</b></div>')
    return page(body, d, css)


def s2(d):  # La luna en el horizonte parece gigante, pero es un truco de tu cerebro.
    css = f"""
    .big{{animation:rise {d*0.7:.2f}s cubic-bezier(.2,.8,.3,1) forwards;filter:sepia(.6) saturate(2.6) hue-rotate(-12deg)}}
    @keyframes rise{{from{{transform:translateY(420px)}}to{{transform:translateY(0)}}}}
    .stamp{{position:absolute;left:150px;right:150px;top:780px;padding:26px 0;text-align:center;
      font-weight:900;font-size:86px;color:#ff3b5c;border:12px solid #ff3b5c;border-radius:28px;
      background:rgba(10,10,30,.55);transform:rotate(-8deg);
      animation:stamp .35s cubic-bezier(.2,1.8,.4,1) {d*0.55:.2f}s both}}
    @keyframes stamp{{from{{transform:rotate(-8deg) scale(2.4);opacity:0}}to{{transform:rotate(-8deg) scale(1);opacity:1}}}}"""
    body = (stars(60, 2) + moon(190, 520, 700).replace('class="moon"', 'class="moon big"')
            + city(3) + '<div class="ground"></div>'
            + '<div class="label">Parece <b>gigante</b>…</div>'
            + '<div class="stamp">🧠 TRUCO</div>')
    return page(body, d, css)


def s3(d):  # Si la tapas con el dedo, mide lo mismo que cuando está bien arriba.
    css = f"""
    .thumb{{font-size:230px;left:300px;top:1000px;animation:cover {d*0.4:.2f}s ease-out forwards}}
    @keyframes cover{{from{{transform:translate(260px,240px) rotate(20deg)}}to{{transform:translate(0,0) rotate(-8deg)}}}}
    .br{{position:absolute;height:130px;border:8px solid #ffd400;border-top:none;border-radius:0 0 18px 18px;
      animation:pop .4s cubic-bezier(.2,1.6,.4,1) {d*0.5:.2f}s both}}
    .eq{{position:absolute;left:440px;top:800px;font-size:180px;font-weight:900;color:#ffd400;
      animation:pop .4s cubic-bezier(.2,1.6,.4,1) {d*0.62:.2f}s both}}
    .hi{{animation:float 2.6s ease-in-out infinite alternate}}
    @keyframes float{{from{{transform:translateY(0)}}to{{transform:translateY(-18px)}}}}"""
    body = (stars(80, 4) + moon(700, 560, 190).replace('class="moon"', 'class="moon hi"')
            + moon(180, 1080, 190)
            + '<div class="br" style="left:690px;top:700px;width:210px"></div>'
            + '<div class="br" style="left:170px;top:1220px;width:210px"></div>'
            + '<div class="eq">=</div>'
            + '<div class="emoji thumb">👍</div>'
            + '<div class="ground" style="height:520px"></div>'
            + '<div class="label">Mide <b>lo mismo</b></div>')
    return page(body, d, css)


def s4(d):  # Tu cerebro la compara con edificios y árboles, y la agranda.
    css = f"""
    .grow{{animation:swell {d}s ease-in-out forwards}}
    @keyframes swell{{0%{{transform:scale(.55)}}35%{{transform:scale(.55)}}100%{{transform:scale(1.25)}}}}
    .brain{{font-size:190px;left:445px;top:520px;animation:think 1.1s ease-in-out infinite alternate}}
    @keyframes think{{from{{transform:rotate(-8deg) scale(1)}}to{{transform:rotate(8deg) scale(1.08)}}}}
    .ar{{position:absolute;top:1010px;font-size:120px;font-weight:900;color:#ffd400;
      animation:push .8s ease-in-out infinite alternate}}
    @keyframes push{{from{{transform:translateX(0)}}to{{transform:translateX(var(--dx))}}}}"""
    body = (stars(70, 5) + '<div class="emoji brain">🧠</div>'
            + moon(390, 900, 300).replace('class="moon"', 'class="moon grow"')
            + '<div class="ar" style="left:230px;--dx:-30px">⟵</div><div class="ar" style="left:740px;--dx:30px">⟶</div>'
            + '<div class="emoji" style="font-size:200px;left:40px;top:1180px">🏢</div>'
            + '<div class="emoji" style="font-size:170px;left:850px;top:1210px">🌳</div>'
            + '<div class="ground" style="height:540px"></div>'
            + '<div class="label">Tu cerebro<br>la <b>agranda</b></div>')
    return page(body, d, css)


def s5(d):  # Cada año se aleja casi cuatro centímetros, lo que te crecen las uñas.
    css = f"""
    .num{{position:absolute;left:0;right:0;top:540px;text-align:center;font-weight:900;font-size:240px;
      color:#ffd400;text-shadow:0 10px 0 rgba(0,0,0,.35)}}
    .unit{{position:absolute;left:0;right:0;top:860px;text-align:center;font-weight:900;font-size:90px}}
    .ruler{{position:absolute;left:140px;top:1010px;height:110px;width:800px;border-radius:14px;
      background:repeating-linear-gradient(90deg,#1b1b1b 0 4px,transparent 4px 40px) 0 0/100% 40% no-repeat,#ffd86b;
      transform-origin:0 50%;animation:extend {d*0.6:.2f}s cubic-bezier(.2,.8,.3,1) forwards}}
    @keyframes extend{{from{{transform:scaleX(.05)}}to{{transform:scaleX(1)}}}}
    .nail{{font-size:200px;left:440px;top:1170px;animation:pop .45s cubic-bezier(.2,1.6,.4,1) {d*0.62:.2f}s both,
      wig 1s ease-in-out {d*0.62:.2f}s infinite alternate}}
    @keyframes wig{{from{{rotate:-6deg}}to{{rotate:6deg}}}}"""
    body = (stars(60, 6) + '<div class="label">Cada año</div>'
            + f'<div class="num" data-count="0,3.8,0.2,{d*0.6:.2f},1">0</div><div class="unit">CENTÍMETROS</div>'
            + '<div class="ruler"></div><div class="emoji nail">💅</div>')
    return page(body, d, css)


def s6(d):  # Dentro de muchísimo tiempo, se verá cada vez más chica.
    css = f"""
    .shrink{{animation:small {d}s ease-in forwards}}
    @keyframes small{{from{{transform:scale(1);opacity:1}}to{{transform:scale(.3);opacity:.75}}}}"""
    body = (stars(110, 7) + moon(290, 560, 500).replace('class="moon"', 'class="moon shrink"')
            + '<div class="hill" style="left:-200px;width:900px;height:300px"></div>'
            + '<div class="hill" style="left:420px;width:900px;height:220px;background:#0e1640"></div>'
            + '<div class="ground" style="height:530px"></div>'
            + '<div class="label">Cada vez<br><b>más chica</b></div>')
    return page(body, d, css)


SCENES = [s1, s2, s3, s4, s5, s6]
