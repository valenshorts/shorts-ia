"""Genera solo el audio del guion de una carpeta con varias configuraciones de ElevenLabs, para comparar.
Uso: python demo/manual/voz_variantes.py saturno  -> demo/voz_variantes/<carpeta>_<variante>.mp3
Necesita ELEVEN_API_KEY y ELEVEN_VOICE_ID. No toca videos ni publica nada."""
import json, os, sys, time, urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "voz_variantes"

VARIANTES = {
    # nombre: (modelo, ajustes de voz, guion entero de una vez)
    "A_v3_natural": ("eleven_v3", {"stability": 0.5, "similarity_boost": 0.75}, True),
    "B_v2_entero_normal": ("eleven_multilingual_v2", {"stability": 0.5, "similarity_boost": 0.75, "style": 0.0,
                                                       "use_speaker_boost": True, "speed": 1.0}, True),
    "C_v2_entero_rapido": ("eleven_multilingual_v2", {"stability": 0.5, "similarity_boost": 0.75, "style": 0.0,
                                                       "use_speaker_boost": True, "speed": 1.08}, True),
    "D_v2_expresivo": ("eleven_multilingual_v2", {"stability": 0.35, "similarity_boost": 0.8, "style": 0.35,
                                                   "use_speaker_boost": True, "speed": 1.0}, True),
}


def tts(text, model, settings):
    url = ("https://api.elevenlabs.io/v1/text-to-speech/" + os.environ["ELEVEN_VOICE_ID"].strip()
           + "?output_format=mp3_44100_128")
    body = json.dumps({"text": text, "model_id": model, "voice_settings": settings}).encode()
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, data=body, headers={"xi-api-key": os.environ["ELEVEN_API_KEY"].strip(),
                                                                  "Content-Type": "application/json"})
            return urllib.request.urlopen(req, timeout=180).read()
        except urllib.error.HTTPError as e:
            print(f"  error {e.code}: {e.read()[:300]!r}", flush=True)
            if e.code in (400, 401, 403, 422):
                return None
        except Exception as e:
            print(f"  error: {str(e)[:200]}", flush=True)
        time.sleep(5 * (attempt + 1))
    return None


def main():
    name = sys.argv[1]
    sb = json.loads((HERE / name / "storyboard.json").read_text(encoding="utf-8"))
    text = " ".join(s["text"] for s in sb["scenes"])
    OUT.mkdir(parents=True, exist_ok=True)
    for var, (model, settings, _) in VARIANTES.items():
        t0 = time.time()
        audio = tts(text, model, settings)
        if audio:
            (OUT / f"{name}_{var}.mp3").write_bytes(audio)
            print(f"{var}: listo en {time.time() - t0:.1f} s ({len(audio) // 1024} KB)", flush=True)
        else:
            print(f"{var}: falló", flush=True)


if __name__ == "__main__":
    main()
