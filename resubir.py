"""Vuelve a subir a YouTube videos que pegaron en Instagram pero quedaron trabados en YouTube (casi sin vistas).

Uso: python resubir.py "011 017 016 009"   (ids de ideas, como en done.json)

Para cada id:
  1. Revisa que el video de YouTube siga público y con pocas vistas (menos de RESUBIR_MAX_VISTAS, 100 por defecto).
  2. Baja el video desde Instagram (el reel que ya está publicado) a manual/<id>.mp4.
  3. Lo anota en resubidos.json como "pendiente".
El Short diario lo sube de nuevo a YouTube en el próximo horario libre (uno por día como máximo, con la misma revisión
de calidad que los hechos a mano). Recién cuando el nuevo está subido, el viejo pasa a PRIVADO (no se borra: se puede
volver atrás desde YouTube Studio). No toca Instagram ni TikTok.
"""
import json, os, sys, time, urllib.parse, urllib.request
from pathlib import Path

import igtoken

ROOT = Path(__file__).resolve().parent
IG_API = "https://graph.instagram.com/v23.0"
MAX_VISTAS = int(os.environ.get("RESUBIR_MAX_VISTAS") or 100)


def main(ids):
    done = json.loads((ROOT / "done.json").read_text(encoding="utf-8"))
    ig = json.loads((ROOT / "ig_done.json").read_text(encoding="utf-8"))
    rp = ROOT / "resubidos.json"
    resub = json.loads(rp.read_text(encoding="utf-8")) if rp.exists() else {}
    tok = igtoken.load()
    if not tok:
        sys.exit("Falta el token de Instagram")
    from generate import youtube_client
    yt = youtube_client()
    hechos = 0
    for k in ids:
        k = k.strip().zfill(3)
        v, g = done.get(k), ig.get(k) or {}
        if resub.get(k, {}).get("estado") in ("pendiente", "subido"):
            print(f"{k}: ya está anotado ({resub[k]['estado']}), lo salteo"); continue
        if not v or not v.get("youtube_id"):
            print(f"{k}: no está subido a YouTube, lo salteo"); continue
        if not g.get("ig_id"):
            print(f"{k}: no está en Instagram, no tengo de dónde bajarlo"); continue
        items = yt.videos().list(part="status,statistics", id=v["youtube_id"]).execute().get("items", [])
        if not items:
            print(f"{k}: el video de YouTube ya no existe, lo salteo"); continue
        st, vistas = items[0]["status"], int(items[0]["statistics"].get("viewCount", 0))
        if st.get("privacyStatus") != "public":
            print(f"{k}: el video de YouTube no es público ({st.get('privacyStatus')}), lo salteo"); continue
        if vistas >= MAX_VISTAS:
            print(f"{k}: ya tiene {vistas} vistas en YouTube (no está trabado), lo salteo"); continue
        q = urllib.parse.urlencode({"fields": "media_url,media_type", "access_token": tok})
        with urllib.request.urlopen(f"{IG_API}/{g['ig_id']}?{q}", timeout=60) as r:
            url = json.loads(r.read()).get("media_url")
        if not url:
            print(f"{k}: Instagram no me dio el link del video, lo salteo"); continue
        dest = ROOT / "manual" / f"{k}.mp4"
        dest.parent.mkdir(exist_ok=True)
        urllib.request.urlretrieve(url, dest)
        if dest.stat().st_size < 200_000:
            dest.unlink()
            print(f"{k}: el archivo que bajé de Instagram es demasiado chico, lo salteo"); continue
        resub[k] = {"titulo": v.get("title"), "youtube_viejo": v["youtube_id"], "vistas_viejo": vistas,
                    "estado": "pendiente", "anotado": time.strftime("%Y-%m-%d")}
        hechos += 1
        print(f"{k}: listo para resubir ({v.get('title')}; {vistas} vistas en YouTube) — {dest.stat().st_size // 1024} KB")
    rp.write_text(json.dumps(resub, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{hechos} video(s) en la cola para volver a subir a YouTube (uno por día).")


if __name__ == "__main__":
    main(" ".join(sys.argv[1:]).replace(",", " ").split())
