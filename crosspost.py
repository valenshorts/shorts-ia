"""
Sube el Short del día también a Instagram Reels y a TikTok.
Lee output/meta.json (lo escribe generate.py). Si faltan los datos de una red, la saltea.

Instagram: IG_USER_ID + IG_TOKEN (token de "Instagram API con inicio de sesión de Instagram", dura 60 días).
TikTok:    TIKTOK_CLIENT_KEY + TIKTOK_CLIENT_SECRET + TIKTOK_REFRESH_TOKEN (queda en tus borradores de TikTok
           y lo publicás con un toque desde la app).
"""
import json, os, time, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
META = json.loads((ROOT / "output" / "meta.json").read_text(encoding="utf-8"))
VIDEO = ROOT / "output" / META["file"]
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


def tiktok():
    key, sec, ref = (os.environ.get(k) for k in ("TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET", "TIKTOK_REFRESH_TOKEN"))
    if not (key and sec and ref):
        log("TikTok: sin datos, lo salteo.")
        return
    t = http("https://open.tiktokapis.com/v2/oauth/token/",
             {"client_key": key, "client_secret": sec, "grant_type": "refresh_token", "refresh_token": ref},
             headers={"Content-Type": "application/x-www-form-urlencoded"})
    at = t["access_token"]
    size = VIDEO.stat().st_size
    init = http("https://open.tiktokapis.com/v2/post/publish/inbox/video/init/",
                data=json.dumps({"source_info": {"source": "FILE_UPLOAD", "video_size": size,
                                                 "chunk_size": size, "total_chunk_count": 1}}).encode(),
                headers={"Authorization": f"Bearer {at}", "Content-Type": "application/json; charset=UTF-8"})
    url = init["data"]["upload_url"]
    http(url, data=VIDEO.read_bytes(), method="PUT",
         headers={"Content-Type": "video/mp4", "Content-Range": f"bytes 0-{size - 1}/{size}"})
    log("TikTok: listo, el video está en tus borradores de TikTok para publicarlo.")


if __name__ == "__main__":
    for fn in (instagram, tiktok):
        try:
            fn()
        except Exception as e:
            msg = e.read().decode()[:400] if hasattr(e, "read") else str(e)
            log(f"{fn.__name__} falló: {msg}")
