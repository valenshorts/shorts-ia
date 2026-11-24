"""Anota para REHACER y volver a subir a YouTube videos que pegaron en Instagram pero quedaron trabados en YouTube.

Uso: python resubir.py "011 017 016 009"   (ids de ideas, como en done.json)

Solo anota en resubidos.json los que siguen públicos en YouTube con menos de RESUBIR_MAX_VISTAS vistas (100 por
defecto). El Short diario los rehace de cero con el mismo guion (1080x1920, igual que cualquier video nuevo; nunca usa
la copia de Instagram, que viene en menor calidad), uno por día, y cuando el nuevo está subido pasa el viejo a PRIVADO
(no lo borra: se puede volver atrás desde YouTube Studio). No toca Instagram ni TikTok.
"""
import json, os, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MAX_VISTAS = int(os.environ.get("RESUBIR_MAX_VISTAS") or 100)


def main(ids):
    done = json.loads((ROOT / "done.json").read_text(encoding="utf-8"))
    rp = ROOT / "resubidos.json"
    resub = json.loads(rp.read_text(encoding="utf-8")) if rp.exists() else {}
    from generate import youtube_client
    yt = youtube_client()
    hechos = 0
    for k in ids:
        k = k.strip().zfill(3)
        v = done.get(k)
        if resub.get(k, {}).get("estado") in ("rehacer", "subido"):
            print(f"{k}: ya está anotado ({resub[k]['estado']}), lo salteo"); continue
        if not v or not v.get("youtube_id"):
            print(f"{k}: no está subido a YouTube, lo salteo"); continue
        items = yt.videos().list(part="status,statistics", id=v["youtube_id"]).execute().get("items", [])
        if not items:
            print(f"{k}: el video de YouTube ya no existe, lo salteo"); continue
        st, vistas = items[0]["status"], int(items[0]["statistics"].get("viewCount", 0))
        if st.get("privacyStatus") != "public":
            print(f"{k}: el video de YouTube no es público ({st.get('privacyStatus')}), lo salteo"); continue
        if vistas >= MAX_VISTAS:
            print(f"{k}: ya tiene {vistas} vistas en YouTube (no está trabado), lo salteo"); continue
        resub[k] = {"titulo": v.get("title"), "youtube_viejo": v["youtube_id"], "vistas_viejo": vistas,
                    "estado": "rehacer", "anotado": time.strftime("%Y-%m-%d")}
        hechos += 1
        print(f"{k}: anotado para rehacer ({v.get('title')}; {vistas} vistas en YouTube)")
    rp.write_text(json.dumps(resub, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{hechos} video(s) en la cola para rehacer y volver a subir a YouTube (uno por día).")


if __name__ == "__main__":
    main(" ".join(sys.argv[1:]).replace(",", " ").split())
