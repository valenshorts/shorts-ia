"""Voz de un video de la tanda (demo/plugin/<carpeta>/storyboard.json), con el mismo camino que los hechos a mano:
voz de Valentín (ElevenLabs) con tiempos por palabra, efectos de sonido y música. Escribe:
  assets/data.js   escenas, palabras y subtítulos (palabras clave en amarillo)
  assets/voz.wav   voz + efectos + música mezclados
  timeline.json    para revisar
Uso: python demo/plugin/voz.py <carpeta> [--fake]   (--fake: sin voz, tiempos aproximados, para probar la imagen)"""
import json, re, shutil, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "manual"))
import render as R  # noqa: E402

name = next(a for a in sys.argv[1:] if not a.startswith("--"))
fake = "--fake" in sys.argv
folder = HERE / name
sb = json.loads((folder / "storyboard.json").read_text(encoding="utf-8"))
work = (R.ROOT / "work_plugin" / name).resolve(); work.mkdir(parents=True, exist_ok=True)
voice, words, scenes, total = R.make_voice(sb, work, fake)
chunks = R.chunks(words, scenes, sb)
audio = R.mix(voice, R.sfx_track(sb, words, scenes, total, work), total, work, int(re.sub(r"\D", "", sb["id"]) or 1))
subs = [{"t": c["a"], "end": c["b"], "text": " ".join(w["x"] for w in c["w"]),
         "words": [{"w": w["x"], "t": w["t"]} for w in c["w"]], "k": [w["k"] for w in c["w"]]} for c in chunks]
data = {"scenes": scenes, "subs": subs, "words": [{"n": w["n"], "t": w["t"], "s": w["s"]} for w in words], "total": total}
(folder / "assets").mkdir(exist_ok=True)
(folder / "assets" / "data.js").write_text("globalThis.DATA=" + json.dumps(data, ensure_ascii=False) +
                                          ";\nif(typeof module!=='undefined')module.exports=globalThis.DATA;\n", encoding="utf-8")
shutil.copy(audio, folder / "assets" / "voz.wav")
(folder / "timeline.json").write_text(json.dumps({"scenes": scenes, "words": words, "chunks": chunks, "total": total},
                                                 ensure_ascii=False, indent=1), encoding="utf-8")
R.log(f"{name}: {total:.2f} s, {len(words)} palabras")
