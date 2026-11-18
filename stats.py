"""
Estadísticas semanales de El Porqué de Todo → stats/semana.json (+ copia en stats/historial/AAAA-MM-DD.json).

YouTube:   vistas, likes y comentarios de siempre (YouTube Data API) + de la última semana: vistas, likes,
           retención (% promedio visto y segundos promedio) y vistas que vinieron del feed de Shorts
           (YouTube Analytics API). Usa YT_CLIENT_ID / YT_CLIENT_SECRET / YT_REFRESH_TOKEN.
Instagram: vistas, alcance, likes, comentarios, guardados, compartidos y segundos promedio vistos de cada Reel
           (con el token de igtoken.py). La "retención" de Instagram es aproximada: segundos promedio / duración.

Si una parte falla (por ejemplo, falta un permiso), sigue con el resto y lo anota en "avisos".
"""
import json, os, re, sys, time, urllib.error, urllib.parse, urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
AR = timezone(timedelta(hours=-3))
IG_API = "https://graph.instagram.com/v23.0"
START = "2026-10-01"  # antes de esto el canal no existía
avisos = []


def log(*a):
    print("[stats]", *a, flush=True)


def aviso(msg):
    log("⚠️", msg)
    avisos.append(msg)


def iso_dur(s):
    """PT1M2S → 62.0"""
    m = re.fullmatch(r"P(?:\d+D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?", s or "")
    if not m:
        return None
    h, mi, se = (float(x) if x else 0 for x in m.groups())
    return h * 3600 + mi * 60 + se


def chunks(xs, n):
    for i in range(0, len(xs), n):
        yield xs[i:i + n]


def err_text(e):
    try:
        return json.loads(e.content)["error"]["message"]
    except Exception:
        return str(e)[:300]


# ---------------------------------------------------------------- YouTube
def yt_refresh_token():
    """El token con permiso de estadísticas (yt_token.enc, lo crea yt_auth.yml el 18/11); si no, YT_REFRESH_TOKEN."""
    import subprocess
    enc = ROOT / "yt_token.enc"
    if enc.exists():
        try:
            r = subprocess.run(["openssl", "enc", "-d", "-aes-256-cbc", "-pbkdf2", "-a", "-A", "-pass", "env:YTPASS"],
                               input=enc.read_text().strip() + "\n", capture_output=True, text=True, check=True,
                               env={**os.environ, "YTPASS": "yt:" + os.environ["YT_CLIENT_SECRET"]})
            if r.stdout.strip():
                log("YouTube: uso el token de estadísticas (yt_token.enc)")
                return r.stdout.strip()
        except Exception:
            log("No pude leer yt_token.enc: uso YT_REFRESH_TOKEN")
    return os.environ["YT_REFRESH_TOKEN"]


def youtube(videos, desde, hasta):
    need = ("YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN")
    if not all(os.environ.get(k) for k in need):
        aviso("Sin datos de YouTube (faltan secretos YT_*)")
        return
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    creds = Credentials(None, refresh_token=yt_refresh_token(),
                        client_id=os.environ["YT_CLIENT_ID"], client_secret=os.environ["YT_CLIENT_SECRET"],
                        token_uri="https://oauth2.googleapis.com/token")
    by_id = {v["youtube"]["id"]: v for v in videos if v.get("youtube")}
    ids = list(by_id)
    if not ids:
        return

    # 1) Totales de siempre (Data API: esto ya funciona con el token actual)
    try:
        yt = build("youtube", "v3", credentials=creds, cache_discovery=False)
        for part in chunks(ids, 50):
            res = yt.videos().list(part="statistics,contentDetails,status", id=",".join(part)).execute()
            for it in res.get("items", []):
                y = by_id[it["id"]]["youtube"]
                st = it.get("statistics", {})
                y.update(vistas=int(st.get("viewCount", 0)), likes=int(st.get("likeCount", 0)),
                         comentarios=int(st.get("commentCount", 0)),
                         duracion_s=iso_dur(it.get("contentDetails", {}).get("duration")),
                         estado=it.get("status", {}).get("privacyStatus"))
        log(f"YouTube: totales de {len(ids)} videos")
    except Exception as e:
        aviso(f"YouTube Data API falló: {err_text(e)}")

    # 2) Semana, retención y feed de Shorts (Analytics API)
    try:
        ya = build("youtubeAnalytics", "v2", credentials=creds, cache_discovery=False)

        def report(start, end, metrics, part, dims="video"):
            return ya.reports().query(ids="channel==MINE", startDate=start, endDate=end, metrics=metrics,
                                      dimensions=dims, filters="video==" + ",".join(part), maxResults=200).execute()

        for clave, start in (("semana", desde), ("total", START)):
            for part in chunks(ids, 100):
                res = report(start, hasta, "views,likes,averageViewDuration,averageViewPercentage", part)
                cols = [c["name"] for c in res.get("columnHeaders", [])]
                for row in res.get("rows", []) or []:
                    r = dict(zip(cols, row))
                    by_id[r["video"]]["youtube"][clave] = {
                        "vistas": int(r["views"]), "likes": int(r["likes"]),
                        "retencion_pct": round(float(r["averageViewPercentage"]), 1),
                        "seg_medio_visto": round(float(r["averageViewDuration"]), 1)}
        for vid in ids:  # de dónde vinieron las vistas: lo que importa es el feed de Shorts
            res = report(START, hasta, "views", [vid], dims="insightTrafficSourceType")
            src = {row[0]: int(row[1]) for row in res.get("rows", []) or []}
            y = by_id[vid]["youtube"]
            y.setdefault("total", {})["vistas_feed_shorts"] = src.get("SHORTS", 0)
            y["total"]["origen_vistas"] = src
        log("YouTube: semana, retención y origen de vistas listos")
    except Exception as e:
        msg = err_text(e)
        hint = ""
        if "insufficient" in msg.lower() or "scope" in msg.lower() or "403" in str(e):
            hint = (" → Falta el permiso de estadísticas: generar un refresh token nuevo en OAuth Playground con los "
                    "scopes youtube.force-ssl Y yt-analytics.readonly (y habilitar \"YouTube Analytics API\" en Google "
                    "Cloud, proyecto shorts-ia), y reemplazar el secreto YT_REFRESH_TOKEN.")
        elif "has not been used" in msg or "disabled" in msg:
            hint = " → Habilitar \"YouTube Analytics API\" en Google Cloud (proyecto shorts-ia)."
        aviso(f"YouTube Analytics (semana/retención) falló: {msg}{hint}")


# ---------------------------------------------------------------- Instagram
def ig_get(path, tok, **params):
    url = f"{IG_API}/{path}?" + urllib.parse.urlencode({**params, "access_token": tok})
    try:
        with urllib.request.urlopen(url, timeout=60) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        try:
            return {"error": json.loads(e.read())["error"].get("message", "error")}
        except Exception:
            return {"error": f"HTTP {e.code}"}
    except Exception as e:
        return {"error": str(e)[:200]}


def instagram(videos):
    import igtoken
    tok = igtoken.load()
    rows = [v for v in videos if v.get("instagram")]
    if not tok:
        aviso("Sin token de Instagram")
        return
    fallo_insights = None
    for v in rows:
        g = v["instagram"]
        m = ig_get(g["id"], tok, fields="like_count,comments_count,permalink,timestamp")
        if "error" in m:
            g["error"] = m["error"]
            continue
        g.update(likes=m.get("like_count"), comentarios=m.get("comments_count"), url=m.get("permalink"),
                 publicado=m.get("timestamp"))
        if fallo_insights:
            continue
        ins = ig_get(f"{g['id']}/insights", tok, metric="views,reach,saved,shares,ig_reels_avg_watch_time")
        if "error" in ins:
            fallo_insights = ins["error"]
            continue
        val = {d["name"]: (d.get("values") or [{}])[0].get("value") for d in ins.get("data", [])}
        g.update(vistas=val.get("views"), alcance=val.get("reach"), guardados=val.get("saved"),
                 compartidos=val.get("shares"))
        if val.get("ig_reels_avg_watch_time") is not None:
            g["seg_medio_visto"] = round(val["ig_reels_avg_watch_time"] / 1000, 1)
            dur = (v.get("youtube") or {}).get("duracion_s")
            if dur:
                g["retencion_aprox_pct"] = round(min(100.0, g["seg_medio_visto"] / dur * 100), 1)
    if fallo_insights:
        aviso(f"Instagram: no pude leer vistas/alcance ({fallo_insights}). Puede faltar el permiso "
              "instagram_business_manage_insights en el token.")
    log(f"Instagram: {len(rows)} reels")


# ---------------------------------------------------------------- Principal
def main():
    done = json.loads((ROOT / "done.json").read_text(encoding="utf-8"))
    igd = json.loads((ROOT / "ig_done.json").read_text(encoding="utf-8")) if (ROOT / "ig_done.json").exists() else {}
    now = datetime.now(timezone.utc)
    hoy_ar = now.astimezone(AR).date()
    hasta = (hoy_ar - timedelta(days=1)).isoformat()   # Analytics tiene los datos hasta ayer (a veces 2 días)
    desde = (hoy_ar - timedelta(days=7)).isoformat()

    videos = []
    for iid, d in sorted(done.items()):
        if not d.get("youtube_id") and not (igd.get(iid) or {}).get("ig_id"):
            continue
        pub = d.get("publish_at")
        hora = datetime.fromisoformat(pub.replace("Z", "+00:00")).astimezone(AR).strftime("%H:%M") if pub else None
        v = {"id": iid, "titulo": d.get("title"), "estilo": d.get("style"), "fecha": d.get("date"), "hora_ar": hora}
        if d.get("youtube_id"):
            v["youtube"] = {"id": d["youtube_id"], "url": f"https://youtube.com/shorts/{d['youtube_id']}"}
        if (igd.get(iid) or {}).get("ig_id"):
            v["instagram"] = {"id": igd[iid]["ig_id"]}
        videos.append(v)

    youtube(videos, desde, hasta)
    instagram(videos)

    def n(x):
        return x or 0
    yt_vids = [v for v in videos if v.get("youtube")]
    semana = sorted((v for v in yt_vids if v["youtube"].get("semana")),
                    key=lambda v: -v["youtube"]["semana"]["vistas"])
    resumen = {
        "videos_youtube": len(yt_vids),
        "videos_instagram": sum(1 for v in videos if v.get("instagram")),
        "youtube_vistas_total": sum(n(v["youtube"].get("vistas")) for v in yt_vids),
        "youtube_vistas_semana": sum(v["youtube"]["semana"]["vistas"] for v in semana) if semana else None,
        "instagram_vistas_total": sum(n((v.get("instagram") or {}).get("vistas")) for v in videos),
        "publicados_esta_semana": [v["id"] for v in videos if v.get("fecha") and desde <= v["fecha"] <= hoy_ar.isoformat()],
        "top_semana_youtube": [{"id": v["id"], "titulo": v["titulo"], "vistas": v["youtube"]["semana"]["vistas"],
                                "retencion_pct": v["youtube"]["semana"]["retencion_pct"]} for v in semana[:5]],
    }
    out = {"generado": now.strftime("%Y-%m-%dT%H:%M:%SZ"), "semana": {"desde": desde, "hasta": hasta},
           "resumen": resumen, "avisos": avisos, "videos": videos}
    sdir = ROOT / "stats"
    (sdir / "historial").mkdir(parents=True, exist_ok=True)
    txt = json.dumps(out, indent=2, ensure_ascii=False)
    (sdir / "semana.json").write_text(txt, encoding="utf-8")
    (sdir / "historial" / f"{hoy_ar.isoformat()}.json").write_text(txt, encoding="utf-8")
    log(f"Listo: stats/semana.json ({len(videos)} videos, {len(avisos)} avisos)")
    log(json.dumps(resumen, ensure_ascii=False))
    if not any(v.get("youtube", {}).get("vistas") is not None for v in yt_vids) and yt_vids:
        sys.exit("No se pudo leer ningún dato de YouTube")  # corrida en rojo = mail


if __name__ == "__main__":
    main()
