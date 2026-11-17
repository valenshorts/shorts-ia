"""
Prueba del estilo "animación con código" ya automático (Gemini elige las escenas) con la música hecha con código.
No toca el flujo diario ni sube nada a YouTube. Uso: python demo/demo2.py 030
Deja demo/demo_dopamina_<id>.mp4 y demo/demo_dopamina_<id>.json (las escenas que eligió Gemini).
"""
import json, shutil, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
import generate as g  # noqa: E402
import codeanim  # noqa: E402


def main(iid):
    g.CFG["music_code"] = True
    idea = {i["id"]: i for i in json.loads((ROOT / "ideas.json").read_text(encoding="utf-8"))}[iid]
    work = ROOT / "work_demo2"
    shutil.rmtree(work, ignore_errors=True)
    work.mkdir(parents=True)
    voice, timeline = g.make_voice(idea["narration"], work)
    total = g.duration(voice) + g.CFG.get("end_padding", 0.15)
    subs = work / "subs.ass"
    g.make_subs(timeline, subs, idea.get("highlight", []), total)
    visuals, cuts = codeanim.make_visuals(idea, timeline, total, work, g.CFG.get("gemini_models", []))
    sfx = g.make_sfx(work, total, cuts, codeanim.LAST_HITS or [timeline[-1][1]])  # "pop" en cada impacto
    out = ROOT / "demo" / f"demo_dopamina_{iid}.mp4"
    g.assemble(visuals, voice, subs, total, out, sfx, None)
    shutil.copy(work / "anim_specs.json", out.with_suffix(".json"))
    bad = g.verify_final(out, total, total / len(visuals), len(visuals))
    print(f"[demo] listo: {out} ({total:.1f}s, {len(visuals)} tomas); tramos quietos: {bad or 'ninguno'}", flush=True)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "030")
