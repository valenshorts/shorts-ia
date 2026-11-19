"""Borra de YouTube videos PROGRAMADOS (privados con fecha de publicación futura) para volver a subirlos.
Uso: python borrar_programados.py "070 064"  (ids de ideas, como en done.json)
Seguro: si el video ya es público o no está programado, NO lo borra. Saca de done.json los ids borrados
(o que ya no existen), así el Short diario los vuelve a subir desde manual/<id>.mp4. Se puede correr dos veces."""
import json, os, sys
from datetime import datetime, timezone
from pathlib import Path

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

ids = sys.argv[1].split()
p = Path("done.json")
done = json.loads(p.read_text(encoding="utf-8"))
creds = Credentials(None, refresh_token=os.environ["YT_REFRESH_TOKEN"], client_id=os.environ["YT_CLIENT_ID"],
                    client_secret=os.environ["YT_CLIENT_SECRET"], token_uri="https://oauth2.googleapis.com/token")
yt = build("youtube", "v3", credentials=creds)
now = datetime.now(timezone.utc)
for k in ids:
    v = done.get(k)
    if not v or not v.get("youtube_id"):
        print(f"{k}: no está en done.json, nada que hacer")
        continue
    if not Path(f"manual/{k}.mp4").exists():
        print(f"{k}: NO lo borro: no hay manual/{k}.mp4 para volver a subirlo")
        continue
    vid = v["youtube_id"]
    items = yt.videos().list(part="status,snippet", id=vid).execute().get("items", [])
    if not items:
        print(f"{k}: {vid} ya no existe en YouTube; lo saco de done.json")
        done.pop(k)
        continue
    st, title = items[0]["status"], items[0]["snippet"]["title"]
    pa = st.get("publishAt")
    programado = st.get("privacyStatus") == "private" and pa and datetime.fromisoformat(pa.replace("Z", "+00:00")) > now
    if not programado:
        print(f"{k}: NO lo borro ({title}): ya es público o no está programado")
        continue
    yt.videos().delete(id=vid).execute()
    print(f"{k}: borrado {vid} ({title}), estaba programado para {pa}")
    done.pop(k)
p.write_text(json.dumps(done, indent=2, ensure_ascii=False), encoding="utf-8")
