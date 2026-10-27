"""
Sube el Short del día también a Instagram Reels y a TikTok.
Lee output/meta.json (lo escribe generate.py). Si faltan los datos de una red, la saltea.

Instagram: IG_USER_ID + IG_TOKEN (token de "Instagram API con inicio de sesión de Instagram", dura 60 días).
TikTok:    TIKTOK_CLIENT_KEY + TIKTOK_CLIENT_SECRET + tt_token.enc (refresh token cifrado; se crea con
           `python crosspost.py --tiktok-code CODIGO`). Queda en tus borradores de TikTok hasta que la app esté auditada.
"""
import json, os, time, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
_M = ROOT / "output" / "meta.json"
META = json.loads(_M.read_text(encoding="utf-8")) if _M.exists() else {}
VIDEO = ROOT / "output" / META.get("file", "")
TT_TOKEN = ROOT / "tt_token.enc"  # refresh token de TikTok, cifrado con TIKTOK_CLIENT_SECRET
IG_API = "https://graph.instagram.com/v23.0"


def log(*a):
    print("[crosspost]", *a, flush=True)


def http(url, data=None, headers=None, method=None):
    if isinstance(data, dict):
        data = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    with urllib.request.urlopen(req, timeout=300) as r:
        body = r.read()
    return json.loads(body) if body else {}


def temp_link(path):
    """Sube el video a un alojamiento temporal (se borra solo en pocas horas) y devuelve el link directo."""
    import subprocess
    ua = ["-A", "Mozilla/5.0 (X11; Linux x86_64)"]
    tries = [
        ("uguu", ["-F", f"files[]=@{path}", "https://uguu.se/upload"],
         lambda t: json.loads(t)["files"][0]["url"]),
        ("tmpfiles", ["-F", f"file=@{path}", "https://tmpfiles.org/api/v1/upload"],
         lambda t: json.loads(t)["data"]["url"].replace("tmpfiles.org/", "tmpfiles.org/dl/", 1)),
        ("litterbox", ["-F", "reqtype=fileupload", "-F", "time=1h", "-F", f"fileToUpload=@{path}",
                       "https://litterbox.catbox.moe/resources/internals/api.php"], lambda t: t.strip()),
    ]
    for name, args, parse in tries:
        out = subprocess.run(["curl", "-s", "-m", "240", *ua, *args], capture_output=True, text=True).stdout
        try:
            url = parse(out)
            if url.startswith("https://"):
                return url
        except Exception:
            pass
        log(f"{name} no funcionó: {out[:120]!r}")
    raise RuntimeError("No pude subir el video a ningún alojamiento temporal")


def instagram():
    uid, tok = os.environ.get("IG_USER_ID"), os.environ.get("IG_TOKEN")
    if not (uid and tok):
        log("Instagram: sin datos, lo salteo.")
        return
    try:  # alarga la vida del token (si ya tiene más de 24 h)
        http(f"https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token={tok}")
    except Exception:
        pass
    # Instagram baja el video desde un link: lo subo a un alojamiento temporal que se borra solo
    link = temp_link(VIDEO)
    log("Link temporal listo")
    c = http(f"{IG_API}/{uid}/media", {"media_type": "REELS", "video_url": link,
                                        "caption": META["caption"], "share_to_feed": "true", "access_token": tok})
    cid = c["id"]
    for _ in range(60):  # Instagram procesa el video
        st = http(f"{IG_API}/{cid}?fields=status_code,status&access_token={tok}")
        if st.get("status_code") == "FINISHED":
            break
        if st.get("status_code") == "ERROR":
            raise RuntimeError(f"Instagram rechazó el video: {st}")
        time.sleep(10)
    res = http(f"{IG_API}/{uid}/media_publish", {"creation_id": cid, "access_token": tok})
    log("Instagram: publicado", res.get("id"))
    p = ROOT / "ig_done.json"  # anota lo subido para que la cola no lo repita
    d = json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}
    d[META["id"]] = {"ig_id": res.get("id"), "date": time.strftime("%Y-%m-%d")}
    p.write_text(json.dumps(d, indent=2, ensure_ascii=False), encoding="utf-8")


def _tt_save(refresh, sec):
    import subprocess
    r = subprocess.run(["openssl", "enc", "-aes-256-cbc", "-pbkdf2", "-salt", "-a", "-A", "-pass", "env:TTPASS"],
                       input=refresh, capture_output=True, text=True, env={**os.environ, "TTPASS": sec}, check=True)
    TT_TOKEN.write_text(r.stdout.strip() + "\n")


def _tt_load(sec):
    import subprocess
    r = subprocess.run(["openssl", "enc", "-d", "-aes-256-cbc", "-pbkdf2", "-a", "-A", "-pass", "env:TTPASS"],
                       input=TT_TOKEN.read_text().strip() + "\n", capture_output=True, text=True,
                       env={**os.environ, "TTPASS": sec}, check=True)
    return r.stdout.strip()


def _tt_token(body):
    return http("https://open.tiktokapis.com/v2/oauth/token/", body,
                headers={"Content-Type": "application/x-www-form-urlencoded"})


def tiktok_connect(code):
    """Cambia el código de autorización por tokens y guarda el refresh token cifrado."""
    key, sec = os.environ["TIKTOK_CLIENT_KEY"], os.environ["TIKTOK_CLIENT_SECRET"]
    t = _tt_token({"client_key": key, "client_secret": sec, "code": code, "grant_type": "authorization_code",
                   "redirect_uri": os.environ.get("TIKTOK_REDIRECT", "https://valenshorts.github.io/")})
    if "refresh_token" not in t:
        raise RuntimeError(f"TikTok no devolvió tokens: {t}")
    _tt_save(t["refresh_token"], sec)
    log("TikTok conectado: token guardado (cifrado).")


def tiktok():
    key, sec = os.environ.get("TIKTOK_CLIENT_KEY"), os.environ.get("TIKTOK_CLIENT_SECRET")
    if not (key and sec and TT_TOKEN.exists() and META):
        log("TikTok: sin datos, lo salteo.")
        return
    t = _tt_token({"client_key": key, "client_secret": sec, "grant_type": "refresh_token",
                   "refresh_token": _tt_load(sec)})
    if "access_token" not in t:
        raise RuntimeError(f"TikTok no renovó el token: {t}")
    if t.get("refresh_token"):
        _tt_save(t["refresh_token"], sec)
    at = t["access_token"]
    size = VIDEO.stat().st_size  # el archivo original, sin recomprimir
    chunk = size if size <= 64 * 1024 * 1024 else 10 * 1024 * 1024
    count = 1 if chunk == size else size // chunk
    init = http("https://open.tiktokapis.com/v2/post/publish/inbox/video/init/",
                data=json.dumps({"source_info": {"source": "FILE_UPLOAD", "video_size": size,
                                                 "chunk_size": chunk, "total_chunk_count": count}}).encode(),
                headers={"Authorization": f"Bearer {at}", "Content-Type": "application/json; charset=UTF-8"})
    url, data = init["data"]["upload_url"], VIDEO.read_bytes()
    for n in range(count):
        a = n * chunk
        b = size if n == count - 1 else a + chunk
        http(url, data=data[a:b], method="PUT",
             headers={"Content-Type": "video/mp4", "Content-Range": f"bytes {a}-{b - 1}/{size}"})
    p = ROOT / "tt_done.json"
    d = json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}
    d[META["id"]] = {"publish_id": init["data"].get("publish_id"), "date": time.strftime("%Y-%m-%d"), "mode": "borrador"}
    p.write_text(json.dumps(d, indent=2, ensure_ascii=False), encoding="utf-8")
    log("TikTok: listo, el video está en tus borradores de TikTok (notificación en la app) para publicarlo.")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 2 and sys.argv[1] == "--tiktok-code":
        tiktok_connect(sys.argv[2])
        sys.exit(0)
    for fn in (instagram, tiktok):
        try:
            fn()
        except Exception as e:
            msg = e.read().decode()[:400] if hasattr(e, "read") else str(e)
            log(f"{fn.__name__} falló: {msg}")
