"""
Prueba de "animación con código" para la idea 030, con la misma voz, subtítulos, música y efectos que el canal.
No toca el flujo diario: escribe demo/demo_030.mp4. Se corre con: python demo/demo.py
"""
import json, shutil, sys, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path[:0] = [str(HERE), str(ROOT)]
import generate as g  # noqa: E402  (voz, subtítulos, efectos, armado y revisión anti-congelado del canal)
from anim import render_scene  # noqa: E402
from scenes_030 import SCENES  # noqa: E402


def main():
    ideas = {i["id"]: i for i in json.loads((ROOT / "ideas.json").read_text(encoding="utf-8"))}
    idea = ideas["030"]
    work = ROOT / "work_demo"
    shutil.rmtree(work, ignore_errors=True)
    work.mkdir(parents=True)
    voice, timeline = g.make_voice(idea["narration"], work)
    total = g.duration(voice) + g.CFG.get("end_padding", 0.15)
    subs = work / "subs.ass"
    g.make_subs(timeline, subs, idea.get("highlight", []), total)
    if len(timeline) != len(SCENES):
        raise SystemExit(f"La narración tiene {len(timeline)} frases y hay {len(SCENES)} escenas")
    starts = [0.0] + [timeline[k][1] for k in range(1, len(timeline))]
    ends = starts[1:] + [total]
    from playwright.sync_api import sync_playwright
    visuals = []
    with sync_playwright() as pw:
        br = pw.chromium.launch()
        for k, (fn, a, b) in enumerate(zip(SCENES, starts, ends), 1):
            t0 = time.time()
            clip = render_scene(fn(b - a), b - a, work / f"anim{k}.mp4", br)
            print(f"[demo] escena {k}: {b - a:.1f}s en {time.time() - t0:.0f}s", flush=True)
            visuals.append((clip, True, b - a))
        br.close()
    out_dir = ROOT / "demo"
    out_dir.mkdir(exist_ok=True)
    out = out_dir / "demo_030.mp4"
    sfx = g.make_sfx(work, total, starts[1:], [timeline[-1][1]])
    g.assemble(visuals, voice, subs, total, out, sfx, None)
    bad = g.verify_final(out, total, total / len(SCENES), len(SCENES))
    print(f"[demo] listo: {out} ({total:.1f}s); tramos quietos: {bad or 'ninguno'}", flush=True)


if __name__ == "__main__":
    main()
