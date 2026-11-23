import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { ABOUT } from "./about";
import { loadHebrewFont } from "./fonts";
import { Guide, GUIDE } from "./guideStrings";
import {
  androidBrowser, canPromptInstall, detectedPhone, inAppBrowserName, onInstallChange, Phone,
  promptInstall, rememberBrowserChoice, requestedGuide, usingOtherIPhoneBrowser, wasInstalledJustNow,
} from "./install";
import { isRTL, Lang, LANG_NAMES, LANGS } from "./lang";

// The page someone sees when they open the link in a browser instead of the installed app:
// a welcome, a choice between iPhone and Android, then four steps for that phone, one at a time.
// It comes in English and Hebrew; in Hebrew the page and the little phone drawings are mirrored.

const C = { bg: "#1b2130", card: "#283046", line: "#44506b", fg: "#f4f6fb", mut: "#c6cee0", cream: "#f4ecc2", blue: "#6ea6ff", ink: "#0e1420" };
// Hebrew letters come from Frank Ruhl Libre (the Lora files have none).
const SERIF = "Lora_400Regular, FrankRuhlLibre_400Regular, Lora, Georgia, serif";
const SERIF_BOLD = "Lora_600SemiBold, FrankRuhlLibre_700Bold, Lora, Georgia, serif";

const GUIDE_LANG_KEY = "rx-guide-lang";
function initialLang(): Lang {
  try {
    const s = localStorage.getItem(GUIDE_LANG_KEY);
    if (s === "en" || s === "he") return s;
  } catch {}
  try {
    const saved = JSON.parse(localStorage.getItem("logbook.settings.v1") || "{}").language;
    if (saved === "he" || saved === "en") return saved;
  } catch {}
  // First visit: a phone set to Hebrew gets the Hebrew guide (the buttons at the top can switch it).
  return /^(he|iw)\b/i.test(navigator.language || "") ? "he" : "en";
}

const View = createContext<{ g: Guide; rtl: boolean }>({ g: GUIDE.en, rtl: false });
const useView = () => useContext(View);

// ---------- drawing helpers: mirror a drawing for right-to-left, keeping words and pictures upright ----------

// Wraps a drawing (all drawings are 320 wide). In Hebrew the whole layout is flipped left to right.
const Flip = ({ children }: { children: React.ReactNode }) => {
  const { rtl } = useView();
  return rtl ? <g transform="translate(320 0) scale(-1 1)">{children}</g> : <>{children}</>;
};

// Text that sits at x. In a mirrored drawing it is flipped back so the letters read correctly.
const Txt = ({ x, y, anchor = "start", children, ...rest }: { x: number; y: number; anchor?: "start" | "middle" | "end"; children: React.ReactNode } & Record<string, any>) => {
  const { rtl } = useView();
  if (!rtl) return <text x={x} y={y} textAnchor={anchor} {...rest}>{children}</text>;
  // In a right-to-left page SVG reads "start" as the right edge, so the anchor needs no swapping here.
  return (
    <g transform={`translate(${x} 0) scale(-1 1)`}>
      <text x={0} y={y} textAnchor={anchor} {...rest}>{children}</text>
    </g>
  );
};

// An image that stays the right way round inside a mirrored drawing.
const Img = ({ href, x, y, size, clip }: { href: string; x: number; y: number; size: number; clip: string }) => {
  const { rtl } = useView();
  const img = <image href={href} x={x} y={y} width={size} height={size} clipPath={`url(#${clip})`} />;
  return rtl ? <g transform={`translate(${2 * x + size} 0) scale(-1 1)`}>{img}</g> : img;
};

// ---------- little drawings of what the person will see on their phone ----------

const Ring = ({ cx, cy, r }: { cx: number; cy: number; r: number }) => (
  <circle className="rxg-glow" cx={cx} cy={cy} r={r} fill="none" stroke={C.blue} strokeWidth="3" />
);

// the square with an arrow pointing up
const ShareIcon = ({ x, y, s = 1, color = C.fg }: { x: number; y: number; s?: number; color?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M-8 -2 V9 a2 2 0 0 0 2 2 H6 a2 2 0 0 0 2 -2 V-2" />
    <path d="M0 6 V-11" />
    <path d="M-5 -6 L0 -11 L5 -6" />
  </g>
);

const Dots = ({ x, y, color = C.fg }: { x: number; y: number; color?: string }) => (
  <g fill={color}><circle cx={x - 7} cy={y} r="2.4" /><circle cx={x} cy={y} r="2.4" /><circle cx={x + 7} cy={y} r="2.4" /></g>
);

const svgStyle = { width: "100%", display: "block" } as const;

// ---- iPhone

function FigureShare() {
  const { g } = useView();
  return (
    <div>
      <svg viewBox="0 0 320 120" role="img" aria-label={g.aria.share} style={svgStyle}>
        <Flip>
          <rect x="8" y="6" width="304" height="108" rx="24" fill="#232b40" />
          <rect x="22" y="52" width="276" height="52" rx="26" fill="#343f5c" />
          <path d="M56 69 l-9 9 l9 9" stroke={C.mut} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M100 71 l7 7 l-7 7" stroke={C.mut} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <ShareIcon x={160} y={78} />
          <g stroke={C.mut} strokeWidth="2.2" fill="none" strokeLinejoin="round"><path d="M205 68 h20 v20 l-10 -6 l-10 6 z" /></g>
          <g stroke={C.mut} strokeWidth="2.2" fill="none"><rect x="252" y="68" width="18" height="18" rx="3" /><rect x="257" y="63" width="18" height="18" rx="3" /></g>
          <Ring cx={160} cy={78} r={27} />
          <Txt x={160} y={36} anchor="middle" fontFamily={SERIF_BOLD} fontSize="15" fill={C.cream}>{g.fig.tapHere}</Txt>
        </Flip>
      </svg>
      <div style={{ textAlign: "center", color: C.mut, fontSize: 13, margin: "10px 0 6px" }}>{g.fig.onSome}</div>
      <svg viewBox="0 0 320 70" role="img" aria-label={g.aria.more} style={svgStyle}>
        <Flip>
          <rect x="8" y="8" width="304" height="54" rx="27" fill="#343f5c" />
          <Txt x={36} y={40} fontFamily={SERIF} fontSize="14" fill={C.mut}>ialoni66.github.io</Txt>
          <circle cx="276" cy="35" r="19" fill="#232b40" />
          <Dots x={276} y={35} />
          <Ring cx={276} cy={35} r={25} />
        </Flip>
      </svg>
      <div style={{ textAlign: "center", color: C.cream, fontSize: 14, marginTop: 6, fontFamily: SERIF_BOLD }}>{g.fig.tapDots}</div>
    </div>
  );
}

function FigureSheet() {
  const { g } = useView();
  const row = (y: number, label: string, icon: React.ReactNode, hot = false) => (
    <g>
      {hot && <rect x="26" y={y - 2} width="268" height="36" rx="10" fill="#3b4a78" />}
      <Txt x={42} y={y + 22} fontFamily={hot ? SERIF_BOLD : SERIF} fontSize="15" fill={C.fg}>{label}</Txt>
      {icon}
      {hot && <rect x="26" y={y - 2} width="268" height="36" rx="10" fill="none" stroke={C.blue} strokeWidth="3" className="rxg-glow" />}
    </g>
  );
  const stroke = { stroke: C.mut, strokeWidth: 2, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 320 184" role="img" aria-label={g.aria.sheet} style={svgStyle}>
      <Flip>
        <rect x="10" y="4" width="300" height="176" rx="20" fill="#2e3752" />
        {row(14, g.fig.copy, <rect x="262" y="24" width="14" height="16" rx="3" {...stroke} />)}
        {row(50, g.fig.bookmarks, <path d="M262 59 h14 v18 l-7 -5 l-7 5 z" {...stroke} />)}
        {row(86, g.fig.addHome, <g {...stroke} stroke={C.cream}><rect x="261" y="94" width="16" height="16" rx="3" /><path d="M269 98 v8 M265 102 h8" /></g>, true)}
        {row(122, g.fig.findPage, <circle cx="270" cy="139" r="6" {...stroke} />)}
      </Flip>
    </svg>
  );
}

function FigureAdd({ iconUrl }: { iconUrl: string }) {
  const { g } = useView();
  return (
    <svg viewBox="0 0 320 210" role="img" aria-label={g.aria.add} style={svgStyle}>
      <Flip>
        <rect x="10" y="4" width="300" height="202" rx="22" fill="#2e3752" />
        <Txt x={30} y={38} fontFamily={SERIF} fontSize="14" fill={C.mut}>{g.fig.cancel}</Txt>
        <Txt x={160} y={38} anchor="middle" fontFamily={SERIF_BOLD} fontSize="14" fill={C.fg}>{g.fig.addTitle}</Txt>
        <rect x="254" y="19" width="48" height="26" rx="13" fill={C.blue} />
        <Txt x={278} y={37} anchor="middle" fontFamily={SERIF_BOLD} fontSize="14" fill={C.ink}>{g.fig.add}</Txt>
        <rect x="249" y="14" width="58" height="36" rx="18" fill="none" stroke={C.blue} strokeWidth="3" className="rxg-glow" />
        <rect x="26" y="62" width="268" height="62" rx="12" fill="#232b40" />
        <defs><clipPath id="rxg-clip-add"><rect x="36" y="70" width="46" height="46" rx="10.5" /></clipPath></defs>
        <Img href={iconUrl} x={36} y={70} size={46} clip="rxg-clip-add" />
        <Txt x={96} y={90} fontFamily={SERIF_BOLD} fontSize="16" fill={C.fg}>Rolodex</Txt>
        <Txt x={96} y={110} fontFamily={SERIF} fontSize="12" fill={C.mut}>ialoni66.github.io</Txt>
        <rect x="26" y="138" width="268" height="52" rx="12" fill="#232b40" />
        <Txt x={42} y={169} fontFamily={SERIF} fontSize="15" fill={C.fg}>{g.fig.openWebApp}</Txt>
        <rect x="236" y="152" width="46" height="26" rx="13" fill="#34c759" />
        <circle cx="269" cy="165" r="10" fill="#ffffff" />
        <rect x="26" y="138" width="268" height="52" rx="12" fill="none" stroke={C.blue} strokeWidth="3" className="rxg-glow" />
      </Flip>
    </svg>
  );
}

function FigureHome({ iconUrl }: { iconUrl: string }) {
  const { g } = useView();
  const shades = ["#3a4666", "#4a3f66", "#3f5e66", "#66543f", "#3f4b66", "#5e3f50", "#3f6652", "#4b4b4b"];
  const cells = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <svg viewBox="0 0 320 214" role="img" aria-label={g.aria.home} style={svgStyle}>
      <Flip>
        <rect x="22" y="4" width="276" height="206" rx="28" fill="#232b40" />
        {cells.map((i) => {
          const col = i % 4, row = Math.floor(i / 4);
          if (i === 6) return null; // that spot holds the Rolodex icon
          return <rect key={i} x={38 + col * 64} y={22 + row * 84} width="50" height="50" rx="12" fill={shades[i]} opacity="0.75" />;
        })}
        <defs><clipPath id="rxg-clip-home"><rect x={38 + 2 * 64} y={22 + 84} width="50" height="50" rx="11.5" /></clipPath></defs>
        <Img href={iconUrl} x={38 + 2 * 64} y={22 + 84} size={50} clip="rxg-clip-home" />
        <Ring cx={38 + 2 * 64 + 25} cy={22 + 84 + 25} r={36} />
        <Txt x={38 + 2 * 64 + 25} y={22 + 84 + 72} anchor="middle" fontFamily={SERIF_BOLD} fontSize="13" fill={C.fg}>Rolodex</Txt>
      </Flip>
    </svg>
  );
}

// ---- Android

function FigureChromeBar() {
  const { g } = useView();
  return (
    <svg viewBox="0 0 320 112" role="img" aria-label={g.aria.chromeBar} style={svgStyle}>
      <Flip>
        <rect x="8" y="6" width="304" height="100" rx="24" fill="#232b40" />
        <rect x="22" y="24" width="208" height="46" rx="23" fill="#343f5c" />
        <rect x="40" y="42" width="11" height="9" rx="2" fill={C.mut} />
        <path d="M42.5 42 v-3 a3 3 0 0 1 6 0 v3" stroke={C.mut} strokeWidth="1.6" fill="none" />
        <Txt x={62} y={52} fontFamily={SERIF} fontSize="13" fill={C.mut}>ialoni66.github.io</Txt>
        <rect x="244" y="35" width="24" height="24" rx="6" fill="none" stroke={C.mut} strokeWidth="2" />
        <Txt x={256} y={52} anchor="middle" fontFamily={SERIF_BOLD} fontSize="12" fill={C.mut}>1</Txt>
        <g fill={C.fg}><circle cx="292" cy="37" r="2.6" /><circle cx="292" cy="47" r="2.6" /><circle cx="292" cy="57" r="2.6" /></g>
        <Ring cx={292} cy={47} r={22} />
        <Txt x={160} y={94} anchor="middle" fontFamily={SERIF_BOLD} fontSize="14" fill={C.cream}>{g.fig.threeDots}</Txt>
      </Flip>
    </svg>
  );
}

function FigureChromeMenu() {
  const { g } = useView();
  return (
    <svg viewBox="0 0 320 206" role="img" aria-label={g.aria.chromeMenu} style={svgStyle}>
      <Flip>
        <rect x="36" y="4" width="278" height="198" rx="16" fill="#2e3752" />
        {g.fig.chromeRows.map((label, n) => {
          const y = 14 + n * 30, hot = n === g.fig.chromeHot;
          return (
            <g key={n}>
              {hot && <rect x="44" y={y - 2} width="262" height="30" rx="9" fill="#3b4a78" />}
              <Txt x={60} y={y + 19} fontFamily={hot ? SERIF_BOLD : SERIF} fontSize="14.5" fill={C.fg}>{label}</Txt>
              {hot && (
                <g fill="none" stroke={C.cream} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="276" y={y + 4} width="14" height="20" rx="3" />
                  <path d={`M283 ${y + 9} v7 M279.5 ${y + 13} l3.5 3.5 l3.5 -3.5`} />
                </g>
              )}
              {hot && <rect x="44" y={y - 2} width="262" height="30" rx="9" fill="none" stroke={C.blue} strokeWidth="3" className="rxg-glow" />}
            </g>
          );
        })}
      </Flip>
    </svg>
  );
}

function FigureAndroidDialog({ iconUrl }: { iconUrl: string }) {
  const { g } = useView();
  return (
    <svg viewBox="0 0 320 188" role="img" aria-label={g.aria.dialog} style={svgStyle}>
      <Flip>
        <rect x="18" y="8" width="284" height="172" rx="26" fill="#2e3752" />
        <Txt x={42} y={46} fontFamily={SERIF_BOLD} fontSize="18" fill={C.fg}>{g.fig.installQ}</Txt>
        <defs><clipPath id="rxg-clip-and"><rect x="42" y="64" width="46" height="46" rx="10.5" /></clipPath></defs>
        <Img href={iconUrl} x={42} y={64} size={46} clip="rxg-clip-and" />
        <Txt x={102} y={84} fontFamily={SERIF_BOLD} fontSize="16" fill={C.fg}>Rolodex</Txt>
        <Txt x={102} y={104} fontFamily={SERIF} fontSize="12" fill={C.mut}>ialoni66.github.io</Txt>
        <Txt x={168} y={156} fontFamily={SERIF} fontSize="15" fill={C.blue}>{g.fig.cancel}</Txt>
        <rect x="232" y="134" width="56" height="30" rx="15" fill={C.blue} />
        <Txt x={260} y={154} anchor="middle" fontFamily={SERIF_BOLD} fontSize="14.5" fill={C.ink}>{g.fig.install}</Txt>
        <rect x="226" y="128" width="68" height="42" rx="21" fill="none" stroke={C.blue} strokeWidth="3" className="rxg-glow" />
      </Flip>
    </svg>
  );
}

// ---------- which drawing goes with which step ----------

const figureFor = (phone: Phone, n: number, iconUrl: string): React.ReactNode => {
  if (phone === "android") {
    return [<FigureChromeBar />, <FigureChromeMenu />, <FigureAndroidDialog iconUrl={iconUrl} />, <FigureHome iconUrl={iconUrl} />][n];
  }
  return [<FigureShare />, <FigureSheet />, <FigureAdd iconUrl={iconUrl} />, <FigureHome iconUrl={iconUrl} />][n];
};

const css = `
.rxg-glow{animation:rxg-glow 1.6s ease-in-out infinite}
@keyframes rxg-glow{0%,100%{opacity:.25}50%{opacity:1}}
.rxg-btn{cursor:pointer;-webkit-tap-highlight-color:transparent;border:0;font-family:${SERIF_BOLD};font-size:17px;border-radius:14px;padding:15px 18px}
.rxg-btn:active{opacity:.8}
@media (prefers-reduced-motion:reduce){.rxg-glow{animation:none}}
`;

// A simple outline of a phone, so each choice has a picture.
const PhoneGlyph = ({ kind }: { kind: Phone }) => (
  <svg width="34" height="54" viewBox="0 0 34 54" aria-hidden="true" style={{ flex: "0 0 auto" }}>
    <rect x="2" y="2" width="30" height="50" rx="8" fill="none" stroke={C.cream} strokeWidth="2.4" />
    {kind === "ios" ? <rect x="11" y="7" width="12" height="4" rx="2" fill={C.cream} /> : <circle cx="17" cy="8.5" r="2" fill={C.cream} />}
    <rect x="11" y="45" width="12" height="2.4" rx="1.2" fill={C.cream} opacity="0.7" />
  </svg>
);

type Props = { onUseInBrowser: (lang: Lang) => void };

export function InstallGuide({ onUseInBrowser }: Props) {
  const requested = requestedGuide();
  const [lang, setLang] = useState<Lang>(initialLang);
  const [phone, setPhone] = useState<Phone | null>(requested === "ios" || requested === "android" ? requested : null);
  const [i, setI] = useState(0);
  const [warn, setWarn] = useState(false);
  const [, refresh] = useState(0);
  const [tapped, setTapped] = useState<"accepted" | "dismissed" | null>(null);
  const page = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  const g = GUIDE[lang];
  const rtl = isRTL(lang);
  const chooseLang = (l: Lang) => {
    setLang(l);
    try { localStorage.setItem(GUIDE_LANG_KEY, l); } catch {}
  };
  // The Hebrew letters come from a font that is only downloaded when Hebrew is showing.
  useEffect(() => { if (lang === "he") loadHebrewFont(); }, [lang]);

  // the browser's one-tap install can become available (or be used up) after the page opens
  useEffect(() => onInstallChange(() => refresh((n) => n + 1)), []);

  // After tapping Next or Back, bring the new step to the top of the screen so it is never half off-screen.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    card.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [i]);
  // Choosing a phone (or going back to the choice) starts at the top of the page.
  useEffect(() => { page.current?.scrollTo({ top: 0 }); }, [phone]);

  const detected = detectedPhone();
  const inApp = inAppBrowserName();
  const iconUrl = new URL("icon-192.png", document.baseURI).href;
  const steps = phone === "android" ? g.android : g.ios;
  const step = steps[i];
  const last = i === steps.length - 1;
  const browserName = phone === "android" ? "Chrome" : "Safari";
  const droidBrowser = androidBrowser();
  const installed = tapped === "accepted" || wasInstalledJustNow();

  const choose = (p: Phone) => { setPhone(p); setI(0); setTapped(null); };

  const frame: React.CSSProperties = { position: "fixed", inset: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" as any, background: C.bg, color: C.fg, fontFamily: SERIF };
  const col: React.CSSProperties = { maxWidth: 480, margin: "0 auto", padding: "max(20px, env(safe-area-inset-top)) 22px max(40px, env(safe-area-inset-bottom))" };
  const note = (children: React.ReactNode, tone: "warn" | "soft" = "soft") => (
    <div style={{ marginTop: 22, padding: "13px 16px", background: tone === "warn" ? "#4a2f20" : C.card, border: tone === "warn" ? `1px solid ${C.cream}` : "none", borderRadius: 14, fontSize: 14.5, lineHeight: 1.5, color: tone === "warn" ? C.fg : C.mut }}>{children}</div>
  );
  const strong = (t: string) => <b style={{ fontFamily: SERIF_BOLD, fontWeight: 400 }}>{t}</b>;
  const inAppRest = g.inAppRest(phone === "android" ? "⋮" : "⋯", browserName);

  return (
    <View.Provider value={{ g, rtl }}>
      <div style={frame} ref={page} dir={rtl ? "rtl" : "ltr"} lang={lang}>
        <style>{css}</style>
        <div style={col}>
          {/* language switch: each language is named in itself */}
          <div role="group" aria-label={g.toggleLabel} style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 14 }}>
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => chooseLang(l)}
                aria-pressed={lang === l}
                style={{ cursor: "pointer", fontFamily: l === "he" ? SERIF : SERIF, fontSize: 14, padding: "6px 14px", borderRadius: 16, border: `1px solid ${lang === l ? C.blue : C.line}`, background: lang === l ? C.blue : "transparent", color: lang === l ? C.ink : C.mut }}
              >
                {LANG_NAMES[l]}
              </button>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <img src={iconUrl} width={68} height={68} alt="" style={{ borderRadius: 16, boxShadow: "0 6px 22px rgba(0,0,0,.45)" }} />
            <h1 style={{ fontFamily: SERIF_BOLD, fontSize: 30, margin: "10px 0 4px", color: C.cream, fontWeight: 400 }}>Rolodex</h1>
            <p style={{ margin: 0, color: C.mut, fontSize: 16, lineHeight: 1.4 }}>{g.tagline}</p>
          </div>

          {inApp && note(
            <>{strong(g.inAppFirst(browserName))}{inAppRest.before}{strong(inAppRest.bold)}{inAppRest.after}</>,
            "warn"
          )}

          {phone === null ? (
            <div style={{ marginTop: 26 }}>
              <h2 style={{ fontFamily: SERIF_BOLD, fontSize: 24, fontWeight: 400, margin: "0 0 6px", textAlign: "center" }}>{g.which}</h2>
              <p style={{ margin: "0 0 18px", color: C.mut, fontSize: 16, textAlign: "center", lineHeight: 1.45 }}>{g.whichSub}</p>
              {(["ios", "android"] as Phone[]).map((p) => (
                <button
                  key={p}
                  className="rxg-btn"
                  onClick={() => choose(p)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 16, textAlign: "start", background: C.card, color: C.fg, border: `2px solid ${detected === p ? C.blue : C.line}`, borderRadius: 18, padding: "16px 18px", marginBottom: 12 }}
                >
                  <PhoneGlyph kind={p} />
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontSize: 21 }}>{p === "ios" ? g.iosName : g.androidName}</span>
                    <span style={{ display: "block", fontFamily: SERIF, fontSize: 14, color: C.mut, marginTop: 3 }}>{p === "ios" ? g.iosSub : g.androidSub}</span>
                  </span>
                  {detected === p && <span style={{ fontFamily: SERIF_BOLD, fontSize: 12, background: C.blue, color: C.ink, borderRadius: 10, padding: "4px 9px", whiteSpace: "nowrap" }}>{g.likely}</span>}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div style={{ marginTop: 18 }}>
                <button onClick={() => { setPhone(null); setTapped(null); }} style={{ background: "none", border: 0, color: C.blue, fontFamily: SERIF, fontSize: 15, cursor: "pointer", padding: "4px 0" }}>
                  {rtl ? "→" : "←"} {g.wrongPhone}
                </button>
              </div>

              {phone === "ios" && usingOtherIPhoneBrowser() && !inApp && note(g.otherIPhoneBrowser)}
              {phone === "android" && !inApp && droidBrowser === "samsung" && note(<>{strong(g.samsungTitle)} {g.samsungBody}</>)}
              {phone === "android" && !inApp && droidBrowser === "other" && note(g.otherAndroidBrowser)}

              {phone === "android" && installed && (
                <div style={{ marginTop: 20, padding: "16px 18px", background: "#1f4a33", border: "1px solid #34c759", borderRadius: 16, fontSize: 16, lineHeight: 1.5 }}>
                  {strong(g.installedBold)}{g.installedRest}
                </div>
              )}
              {phone === "android" && !installed && canPromptInstall() && (
                <div style={{ marginTop: 20, padding: "18px", background: C.card, borderRadius: 18, textAlign: "center" }}>
                  <div style={{ fontFamily: SERIF_BOLD, fontSize: 18, marginBottom: 4 }}>{g.oneTapTitle}</div>
                  <div style={{ color: C.mut, fontSize: 14.5, lineHeight: 1.45, marginBottom: 14 }}>{g.oneTapBody}</div>
                  <button className="rxg-btn" style={{ background: C.blue, color: C.ink, width: "100%" }} onClick={async () => { const r = await promptInstall(); if (r !== "unavailable") setTapped(r); }}>
                    {g.oneTapButton}
                  </button>
                </div>
              )}
              {/* The browser's offer can only be used once, so this stays visible after someone says no. */}
              {phone === "android" && !installed && !canPromptInstall() && tapped === "dismissed" && (
                <div style={{ marginTop: 20, padding: "14px 18px", background: C.card, borderRadius: 16, fontSize: 15, lineHeight: 1.5, color: C.mut }}>
                  {g.declined}
                </div>
              )}

              <div ref={card} style={{ marginTop: 22, background: C.card, borderRadius: 22, padding: "22px 20px 20px", scrollMarginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ color: C.mut, fontSize: 14, letterSpacing: rtl ? 0 : ".04em", textTransform: "uppercase" }}>{g.stepOf(i + 1, steps.length)}</span>
                  <span style={{ display: "flex", gap: 7 }} aria-hidden="true">
                    {steps.map((_, n) => <span key={n} style={{ width: n === i ? 22 : 8, height: 8, borderRadius: 4, background: n <= i ? C.blue : C.line, transition: "width .2s" }} />)}
                  </span>
                </div>
                <h2 style={{ fontFamily: SERIF_BOLD, fontSize: 24, lineHeight: 1.25, margin: "0 0 8px", fontWeight: 400 }}>{step.title}</h2>
                <p style={{ margin: "0 0 18px", fontSize: 17, lineHeight: 1.5 }}>{step.body}</p>
                <div style={{ background: C.bg, borderRadius: 16, padding: "14px 12px" }}>{figureFor(phone, i, iconUrl)}</div>
                <p style={{ margin: "16px 0 0", fontSize: 14.5, lineHeight: 1.5, color: C.mut }}>{step.note}</p>

                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  {i > 0 && (
                    <button className="rxg-btn" style={{ background: "transparent", color: C.fg, border: `1px solid ${C.line}`, flex: "0 0 auto" }} onClick={() => setI(i - 1)}>{g.back}</button>
                  )}
                  {!last ? (
                    <button className="rxg-btn" style={{ background: C.blue, color: C.ink, flex: 1 }} onClick={() => setI(i + 1)}>{g.next}</button>
                  ) : (
                    <div style={{ flex: 1, textAlign: "center", color: C.cream, fontFamily: SERIF_BOLD, fontSize: 17, padding: "14px 4px" }}>{g.done}</div>
                  )}
                </div>
              </div>
            </>
          )}

          {(ABOUT.bio || ABOUT.name) && (
            <div style={{ marginTop: 26, padding: "4px 4px 0" }}>
              <div style={{ color: C.mut, fontSize: 13, letterSpacing: rtl ? 0 : ".06em", textTransform: "uppercase", marginBottom: 8 }}>{ABOUT.name ? g.aboutName(ABOUT.name) : g.about}</div>
              <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.6 }}>{ABOUT.bio}</p>
            </div>
          )}

          <p style={{ margin: "30px 0 0", textAlign: "center", color: C.mut, fontSize: 14, lineHeight: 1.5 }}>{g.free}</p>

          <div style={{ marginTop: 18, textAlign: "center" }}>
            {!warn ? (
              <button style={{ background: "none", border: 0, color: C.mut, textDecoration: "underline", fontFamily: SERIF, fontSize: 14, cursor: "pointer" }} onClick={() => setWarn(true)}>
                {g.useBrowser}
              </button>
            ) : (
              <div style={{ background: C.card, borderRadius: 14, padding: "14px 16px", fontSize: 14, lineHeight: 1.5, textAlign: "start" }}>
                {g.warnText}
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button className="rxg-btn" style={{ background: "transparent", color: C.fg, border: `1px solid ${C.line}`, fontSize: 15, padding: "11px 14px" }} onClick={() => setWarn(false)}>{g.goBack}</button>
                  <button className="rxg-btn" style={{ background: C.cream, color: C.ink, fontSize: 15, padding: "11px 14px", flex: 1 }} onClick={() => { rememberBrowserChoice(); onUseInBrowser(lang); }}>{g.continueBrowser}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </View.Provider>
  );
}
