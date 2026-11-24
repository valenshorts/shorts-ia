"""Prepara una película del plugin animation-studio (demo/plugin/<carpeta>) para filmarla en Actions.
Usa la voz y los tiempos por palabra del video hecho a mano de la misma idea (demo/manual/<base>):
  assets/data.js  escenas, palabras y subtítulos (con las palabras clave en amarillo)
  assets/voz.wav  el audio del video hecho a mano (voz de Valentín + música + efectos)
Uso: python demo/plugin/preparar.py monje"""
import json, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
folder = HERE / sys.argv[1]
cfg = json.loads((folder / "plugin.json").read_text(encoding="utf-8"))
base = HERE.parent / "manual" / cfg["base"]
d = json.loads((base / "timeline.json").read_text(encoding="utf-8"))
subs = [{"t": c["a"], "end": c["b"], "text": " ".join(w["x"] for w in c["w"]),
         "words": [{"w": w["x"], "t": w["t"]} for w in c["w"]], "k": [w["k"] for w in c["w"]]} for c in d["chunks"]]
words = [{"n": w["n"], "t": w["t"], "s": w["s"]} for w in d["words"]]
data = {"scenes": d["scenes"], "subs": subs, "words": words, "total": d["total"]}
(folder / "assets").mkdir(exist_ok=True)
(folder / "assets" / "data.js").write_text(
    "globalThis.MONJE=" + json.dumps(data, ensure_ascii=False) + ";\nif(typeof module!=='undefined')module.exports=globalThis.MONJE;\n",
    encoding="utf-8")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(base / "video.mp4"), "-vn", "-ac", "2", "-ar", "48000",
                str(folder / "assets" / "voz.wav")], check=True)
print(f"{sys.argv[1]}: {len(subs)} subtítulos, {d['total']:.2f} s, id {cfg['id']}")
