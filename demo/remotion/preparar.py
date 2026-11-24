"""Prepara un video de Remotion (demo/remotion/<carpeta>) para filmarlo en Actions.
Usa la voz y los tiempos por palabra del video hecho a mano de la misma idea (demo/manual/<base>):
  src/data.ts      escenas, palabras y subtítulos (palabras clave en amarillo)
  public/voz.wav   el audio del video hecho a mano (voz de Valentín + música + efectos)
Uso: python demo/remotion/preparar.py monje"""
import json, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
folder = HERE / sys.argv[1]
cfg = json.loads((folder / "plugin.json").read_text(encoding="utf-8"))
base = HERE.parent / "manual" / cfg["base"]
d = json.loads((base / "timeline.json").read_text(encoding="utf-8"))
out = {"scenes": d["scenes"], "total": d["total"], "words": [{"n": w["n"], "t": w["t"], "s": w["s"]} for w in d["words"]],
       "chunks": [{"a": c["a"], "b": c["b"], "w": [{"x": w["x"], "t": w["t"], "k": w["k"]} for w in c["w"]]} for c in d["chunks"]]}
(folder / "src" / "data.ts").write_text("export const DATA = " + json.dumps(out, ensure_ascii=False) + " as const;\n", encoding="utf-8")
(folder / "public").mkdir(exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(base / "video.mp4"), "-vn", "-ac", "2", "-ar", "48000",
                str(folder / "public" / "voz.wav")], check=True)
print(f"{sys.argv[1]}: {d['total']:.2f} s, id {cfg['id']}")
