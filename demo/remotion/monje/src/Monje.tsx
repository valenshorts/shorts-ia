import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { DATA } from "./data";

// Estilo "informe forense": interfaz de tomógrafo (HUD), grilla, datos que cuentan y escaneos.
const NAVY = "#080D2B", YEL = "#FFD22E", TEAL = "#19B8B2", CY = "#7FE3FF";
const font = "M, Montserrat, sans-serif";
const fontFace = `@font-face{font-family:"M";src:url(${staticFile("Montserrat.ttf")});font-weight:100 900}`;

const cue = (si: number, pre: string, frac = 0.5) => {
  const w = DATA.words.find((x) => x.s === si && x.n.startsWith(pre));
  const s = DATA.scenes[si];
  return w ? w.t : s.a + (s.b - s.a) * frac;
};
const T = {
  estatua: cue(0, "estatua"), monje: cue(0, "monje"), tomo: cue(1, "tomógrafo"), esq: cue(1, "esqueleto"),
  med: cue(1, "meditación"), liu: cue(2, "liuquan"), org: cue(3, "órganos"), pap: cue(3, "papel"),
  chinas: cue(3, "chinas"), siglos: cue(4, "siglos"), adentro: cue(4, "adentro"),
};
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ramp = (t: number, a: number, d = 0.35) => Easing.out(Easing.cubic)(clamp((t - a) / d));

const Head: React.FC<{ t: number; a: number; kick: string; h1: React.ReactNode }> = ({ t, a, kick, h1 }) => {
  const p = ramp(t, a, 0.3);
  return (
    <div style={{ position: "absolute", top: 170, left: 60, right: 60, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>
      <div style={{ font: `800 40px ${font}`, letterSpacing: "0.08em", color: TEAL, textTransform: "uppercase" }}>{kick}</div>
      <div style={{ font: `900 96px/0.98 ${font}`, letterSpacing: "-0.015em", textTransform: "uppercase", color: "#fff", textShadow: "0 6px 24px rgba(0,0,0,.5)" }}>{h1}</div>
    </div>
  );
};
const Y: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: YEL }}>{children}</span>;

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = DATA.chunks.find((x) => t >= x.a && t < x.b);
  if (!c) return null;
  const p = ramp(t, c.a, 0.14);
  return (
    <div style={{ position: "absolute", top: 1330, left: 70, right: 70, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(8,13,43,.82)", borderRadius: 26, padding: "20px 34px 22px", textAlign: "center", maxWidth: 940,
        font: `800 58px/1.12 ${font}`, textTransform: "uppercase", opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>
        {c.w.map((w, i) => (
          <React.Fragment key={i}><span style={{ whiteSpace: "nowrap", color: w.k ? YEL : "#fff", opacity: t >= w.t - 0.04 ? 1 : 0.42 }}>
            {w.x.replace(/[,;:]$/, "").replace(/\.$/, "")}</span>{i < c.w.length - 1 ? " " : ""}</React.Fragment>
        ))}
      </div>
    </div>
  );
};

// marco del monitor del tomógrafo
const Hud: React.FC<{ t: number; label: string; color?: string; children: React.ReactNode }> = ({ t, label, color = CY, children }) => (
  <div style={{ position: "absolute", left: 90, top: 520, width: 900, height: 760 }}>
    <svg width={900} height={760} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <pattern id="g" width="45" height="45" patternUnits="userSpaceOnUse"><path d="M45 0H0V45" fill="none" stroke={color} strokeOpacity=".12" strokeWidth="2" /></pattern>
      </defs>
      <rect x="0" y="0" width="900" height="760" rx="28" fill="rgba(6,18,40,.75)" stroke={color} strokeOpacity=".5" strokeWidth="3" />
      <rect x="0" y="0" width="900" height="760" rx="28" fill="url(#g)" />
      {[[0, 0, 1, 1], [900, 0, -1, 1], [0, 760, 1, -1], [900, 760, -1, -1]].map(([x, y, sx, sy], i) => (
        <path key={i} d={`M${x + sx * 10} ${y + sy * 70} V${y + sy * 10} H${x + sx * 70}`} stroke={color} strokeWidth="8" fill="none" strokeLinecap="round" />
      ))}
      <circle cx="40" cy="40" r="9" fill="#ff5a3a" opacity={0.5 + 0.5 * Math.sin(t * 6)} />
    </svg>
    <div style={{ position: "absolute", left: 62, top: 22, font: `800 26px ${font}`, color, letterSpacing: "0.12em" }}>{label}</div>
    <div style={{ position: "absolute", right: 30, top: 22, font: `700 26px ${font}`, color, opacity: 0.8, fontVariantNumeric: "tabular-nums" }}>
      {String(Math.floor(t / 60)).padStart(2, "0")}:{(t % 60).toFixed(2).padStart(5, "0")}
    </div>
    {children}
  </div>
);

const Statue: React.FC<{ fill?: string; stroke?: string; glow?: boolean }> = ({ fill = "#E8B54A", stroke = "#7a4a10", glow }) => (
  <g style={glow ? { filter: `drop-shadow(0 0 14px ${CY})` } : undefined}>
    <ellipse cx="0" cy="40" rx="260" ry="52" fill={fill} stroke={stroke} strokeWidth="6" />
    <ellipse cx="0" cy="-20" rx="215" ry="62" fill={fill} stroke={stroke} strokeWidth="6" />
    <path d="M-130 -40 L-95 -300 L95 -300 L130 -40 Z" fill={fill} stroke={stroke} strokeWidth="6" strokeLinejoin="round" />
    <ellipse cx="0" cy="-45" rx="80" ry="22" fill={fill} stroke={stroke} strokeWidth="6" />
    <ellipse cx="0" cy="-365" rx="72" ry="80" fill={fill} stroke={stroke} strokeWidth="6" />
    <ellipse cx="-74" cy="-360" rx="16" ry="36" fill={fill} stroke={stroke} strokeWidth="6" />
    <ellipse cx="74" cy="-360" rx="16" ry="36" fill={fill} stroke={stroke} strokeWidth="6" />
    <circle cx="0" cy="-455" r="28" fill={fill} stroke={stroke} strokeWidth="6" />
  </g>
);
const Skeleton: React.FC<{ o: number }> = ({ o }) => (
  <g opacity={o} stroke={CY} strokeWidth="9" fill="none" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${CY})` }}>
    <ellipse cx="0" cy="-365" rx="48" ry="56" />
    <circle cx="-17" cy="-372" r="10" fill={CY} /><circle cx="17" cy="-372" r="10" fill={CY} />
    <path d="M0 -300 V-70" strokeDasharray="14 10" />
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M-6 ${-280 + i * 34} Q-80 ${-262 + i * 34} -66 ${-236 + i * 34} M6 ${-280 + i * 34} Q80 ${-262 + i * 34} 66 ${-236 + i * 34}`} />)}
    <path d="M-80 -290 L-140 -140 L-50 -60 M80 -290 L140 -140 L50 -60" />
    <path d="M-60 -40 L-180 -15 L-40 5 M60 -40 L180 -15 L40 5" />
  </g>
);

const Counter: React.FC<{ t: number; a: number; to: number; prefix?: string; suffix: string; x: number; y: number; color?: string }> = ({ t, a, to, prefix = "", suffix, x, y, color = YEL }) => {
  const p = ramp(t, a, 0.9);
  if (t < a) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, font: `900 64px ${font}`, color, textShadow: "0 4px 18px rgba(0,0,0,.6)" }}>
      {prefix}{Math.round(to * p).toLocaleString("es-AR")}<span style={{ font: `800 30px ${font}`, marginLeft: 8, color: "#fff" }}>{suffix}</span>
    </div>
  );
};

const Scene: React.FC<{ t: number; si: number }> = ({ t, si }) => {
  const s = DATA.scenes[si];
  if (si === 0) {
    const scan = clamp((t - (T.monje - 0.7)) / 1.3);
    const sy = -500 + 560 * scan;
    return (
      <>
        <Head t={t} a={s.a} kick="En 2015 escanearon" h1={<>una estatua de <Y>Buda</Y></>} />
        <Hud t={t} label="OBJETO 01 · ESTATUA">
          <svg width={900} height={760} style={{ position: "absolute", inset: 0 }}>
            <g transform={`translate(450 650) scale(${0.85 * spring({ frame: Math.round((t - s.a) * 30), fps: 30, config: { damping: 14 } })})`}>
              <Statue />
              <clipPath id="c0"><rect x="-300" y="-520" width="600" height={sy + 520} /></clipPath>
              <g clipPath="url(#c0)"><Statue fill="#173a5c" stroke={CY} /><Skeleton o={1} /></g>
              {scan > 0 && scan < 1 && <rect x="-320" y={sy - 4} width="640" height="8" fill={CY} style={{ filter: `drop-shadow(0 0 16px ${CY})` }} />}
            </g>
          </svg>
          <Counter t={t} a={T.estatua + 0.3} to={1000} prefix="≈" suffix="AÑOS" x={560} y={110} />
        </Hud>
      </>
    );
  }
  if (si === 1) {
    const ring = interpolate(t, [s.a, T.esq + 0.3], [-520, 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
    return (
      <>
        <Head t={t} a={t < T.esq ? s.a : T.esq} kick={t < T.esq ? "Los médicos usaron" : "Y apareció"} h1={t < T.esq ? <>un <Y>tomógrafo</Y></> : <>un <Y>esqueleto</Y> completo</>} />
        <Hud t={t} label="TOMOGRAFÍA · CORTE AXIAL">
          <svg width={900} height={760} style={{ position: "absolute", inset: 0 }}>
            <g transform="translate(450 650) scale(0.85)">
              <Statue fill="#122b48" stroke={CY} glow />
              <Skeleton o={ramp(t, T.esq - 0.3, 0.6)} />
              <ellipse cx="0" cy={ring + Math.sin(t * 2) * 6} rx="330" ry="60" fill="none" stroke="#E9F2FF" strokeWidth="24" />
              <ellipse cx="0" cy={ring + Math.sin(t * 2) * 6} rx="330" ry="60" fill="none" stroke={CY} strokeWidth="5" />
            </g>
          </svg>
          <Counter t={t} a={T.tomo} to={100} suffix="% ESCANEADO" x={470} y={70} color={CY} />
          {t > T.med - 0.2 && <div style={{ position: "absolute", right: 40, top: 170, padding: "10px 22px", borderRadius: 40, border: `3px solid ${TEAL}`, background: "rgba(8,13,43,.8)", font: `800 32px ${font}`, letterSpacing: "0.06em", color: "#fff", opacity: ramp(t, T.med - 0.2) }}>MEDITANDO</div>}
        </Hud>
      </>
    );
  }
  if (si === 2) {
    const u = ramp(t, T.liu - 0.3, 0.6);
    const typed = "LIUQUAN".slice(0, Math.floor(clamp((t - T.liu) / 0.6) * 7));
    return (
      <>
        <Head t={t} a={s.a} kick="Se cree que era" h1={<>el <Y>maestro</Y> Liuquan</>} />
        <Hud t={t} label="IDENTIFICACIÓN" color={YEL}>
          <svg width={900} height={760} style={{ position: "absolute", inset: 0 }}>
            <g transform="translate(450 640) scale(0.8)"><Statue fill="#3a2a10" stroke={YEL} /><Skeleton o={0.5} /></g>
          </svg>
          <div style={{ position: "absolute", left: 120, right: 120, top: 120, height: 130, borderRadius: 18, background: "rgba(8,13,43,.9)", border: `4px solid ${YEL}`,
            transform: `scaleX(${u})`, display: "flex", alignItems: "center", justifyContent: "center", font: `900 92px ${font}`, color: YEL, letterSpacing: "0.12em" }}>
            {typed}<span style={{ opacity: Math.sin(t * 10) > 0 ? 1 : 0 }}>|</span>
          </div>
        </Hud>
      </>
    );
  }
  if (si === 3) {
    const gone = ramp(t, T.org + 0.2, 0.6);
    const papers = [[-150, -380, -18], [110, -420, 14], [-30, -300, 6], [150, -260, -10], [-170, -200, 20], [60, -170, -6], [-60, -440, -8]];
    return (
      <>
        <Head t={t} a={t < T.pap ? s.a : T.pap} kick={t < T.pap ? "Lo más raro" : "En lugar de órganos"} h1={t < T.pap ? <>no estaban sus <Y>órganos</Y></> : <><Y>papeles</Y> con escrituras</>} />
        <Hud t={t} label="ANÁLISIS INTERNO">
          <svg width={900} height={760} style={{ position: "absolute", inset: 0 }}>
            <g transform="translate(450 700) scale(0.9)">
              <Skeleton o={1} />
              <g opacity={1 - gone}>
                <ellipse cx="-60" cy="-230" rx="48" ry="80" fill="#F08A9A" /><ellipse cx="60" cy="-230" rx="48" ry="80" fill="#F08A9A" />
                <path d="M10 -190 c0 -30 40 -30 40 0 c0 25 -40 45 -40 45 c0 0 -40 -20 -40 -45 c0 -30 40 -30 40 0z" fill="#ff5a3a" transform={`scale(${1 + 0.08 * Math.max(0, Math.sin(t * 7))})`} />
              </g>
              {papers.map(([x, y, r], i) => {
                const q = spring({ frame: Math.round((t - (T.pap - 0.3 + i * 0.12)) * 30), fps: 30, config: { damping: 12 } });
                if (q <= 0.001) return null;
                return (
                  <g key={i} transform={`translate(${x + (1 - q) * (i % 2 ? 500 : -500)} ${y + Math.sin(t * 2 + i) * 5}) rotate(${r})`} opacity={q}>
                    <rect x="-42" y="-56" width="84" height="112" rx="6" fill="#F1E2B8" stroke="#a07a3a" strokeWidth="4" />
                    {[0, 1, 2, 3].map((k) => <path key={k} d={`M${-24 + k * 16} -40 V40`} stroke="#5a3a1a" strokeWidth="5" strokeDasharray="10 6" />)}
                  </g>
                );
              })}
            </g>
          </svg>
          {t > T.chinas - 0.2 && <div style={{ position: "absolute", left: 40, bottom: 34, font: `800 30px ${font}`, color: YEL, letterSpacing: "0.08em", opacity: ramp(t, T.chinas - 0.2) }}>ESCRITURAS CHINAS ANTIGUAS</div>}
        </Hud>
      </>
    );
  }
  const k = ramp(t, T.adentro - 0.15, 0.5);
  return (
    <>
      <Head t={t} a={t < T.adentro ? s.a : T.adentro} kick="Durante siglos le rezaron" h1={t < T.adentro ? <>sin <Y>saber</Y></> : <>con alguien <Y>adentro</Y></>} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs><radialGradient id="halo"><stop offset="0" stopColor="#FFD27A" stopOpacity=".5" /><stop offset="1" stopColor="#FFD27A" stopOpacity="0" /></radialGradient></defs>
        <circle cx="540" cy="900" r="460" fill="url(#halo)" />
        <g transform="translate(540 1170) scale(0.95)">
          <Statue />
          <g opacity={k}><Statue fill="#173a5c" stroke={CY} /><Skeleton o={1} /></g>
        </g>
        {[0, 1, 2, 3, 4].map((i) => {
          const x = 140 + i * 200, b = Math.sin(t * 2.2 + i) * 10;
          return <g key={i} transform={`translate(${x} ${1250 + b})`}><ellipse cx="0" cy="40" rx="62" ry="20" fill="#3a2214" /><path d="M-50 40 Q0 -60 50 40 Z" fill={["#3E6FB0", "#A23B3B", "#4E8A5A", "#7A4FA0", "#B07A2E"][i]} /><circle cx="0" cy={-30 + b * 0.3} r="24" fill="#c9925f" /></g>;
        })}
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${200 + i * 140} 1240 q 20 -60 0 -120 q -20 -60 0 -120`} stroke="#fff" strokeOpacity=".2" strokeWidth="8" fill="none" transform={`translate(${Math.sin(t + i) * 12} ${-((t * 40 + i * 30) % 80)})`} />)}
      </svg>
    </>
  );
};

export const Monje: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  let si = 0;
  DATA.scenes.forEach((s, i) => { if (t >= s.a) si = i; });
  const s = DATA.scenes[si];
  const d = clamp((t - s.a) / (s.b - s.a));
  const flash = si > 0 ? 0.6 * Math.exp(-(t - s.a) * 10) : 0;
  const warm = si === 2 || si === 4;
  return (
    <AbsoluteFill style={{ background: warm ? "linear-gradient(180deg,#1d0f0a,#4a2414 85%,#080D2B)" : `linear-gradient(180deg,#060b26,#10306a 85%,${NAVY})`, fontFamily: font, color: "#fff" }}>
      <style>{fontFace}</style>
      <Audio src={staticFile("voz.wav")} />
      <AbsoluteFill style={{ transform: `scale(${1 + 0.05 * d}) translate(${Math.sin(t * 1.1) * 8}px, ${Math.cos(t * 0.8) * 6}px)` }}>
        <Scene t={t} si={si} />
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 96, left: 0, right: 0, textAlign: "center", font: `700 28px ${font}`, letterSpacing: "0.12em", color: "rgba(255,255,255,.55)" }}>EL PORQUÉ DE TODO</div>
      <Captions t={t} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.5) 100%)" }} />
      {flash > 0.01 && <AbsoluteFill style={{ background: `rgba(255,248,230,${flash})` }} />}
    </AbsoluteFill>
  );
};
