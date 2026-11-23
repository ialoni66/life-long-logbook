import React, { useEffect, useRef, useState } from "react";
import { ABOUT, TAGLINE } from "./about";
import { inAppBrowserName, rememberBrowserChoice, usingOtherBrowser } from "./install";

// The page someone sees when they open the link in a browser instead of the installed app:
// a welcome, then four steps to put Rolodex on the Home Screen, one at a time.

const C = { bg: "#1b2130", card: "#283046", line: "#44506b", fg: "#f4f6fb", mut: "#c6cee0", cream: "#f4ecc2", blue: "#6ea6ff", ink: "#0e1420" };
const SERIF = "Lora_400Regular, Lora, Georgia, serif";
const SERIF_BOLD = "Lora_600SemiBold, Lora, Georgia, serif";

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

function FigureShare() {
  return (
    <div>
      <svg viewBox="0 0 320 120" role="img" aria-label="The Safari toolbar with the Share button highlighted" style={{ width: "100%", display: "block" }}>
        <rect x="8" y="6" width="304" height="108" rx="24" fill="#232b40" />
        <rect x="22" y="52" width="276" height="52" rx="26" fill="#343f5c" />
        <path d="M56 69 l-9 9 l9 9" stroke={C.mut} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M100 71 l7 7 l-7 7" stroke={C.mut} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <ShareIcon x={160} y={78} />
        <g stroke={C.mut} strokeWidth="2.2" fill="none" strokeLinejoin="round"><path d="M205 68 h20 v20 l-10 -6 l-10 6 z" /></g>
        <g stroke={C.mut} strokeWidth="2.2" fill="none"><rect x="252" y="68" width="18" height="18" rx="3" /><rect x="257" y="63" width="18" height="18" rx="3" /></g>
        <Ring cx={160} cy={78} r={27} />
        <text x="160" y="36" textAnchor="middle" fontFamily={SERIF_BOLD} fontSize="15" fill={C.cream}>Tap here</text>
      </svg>
      <div style={{ textAlign: "center", color: C.mut, fontSize: 13, margin: "10px 0 6px" }}>On some iPhones you will see this instead:</div>
      <svg viewBox="0 0 320 70" role="img" aria-label="The Safari address bar with the more button highlighted" style={{ width: "100%", display: "block" }}>
        <rect x="8" y="8" width="304" height="54" rx="27" fill="#343f5c" />
        <text x="36" y="40" fontFamily={SERIF} fontSize="14" fill={C.mut}>ialoni66.github.io</text>
        <circle cx="276" cy="35" r="19" fill="#232b40" />
        <Dots x={276} y={35} />
        <Ring cx={276} cy={35} r={25} />
      </svg>
      <div style={{ textAlign: "center", color: C.cream, fontSize: 14, marginTop: 6, fontFamily: SERIF_BOLD }}>Tap the dots, then tap Share</div>
    </div>
  );
}

function FigureSheet() {
  const row = (y: number, label: string, icon: React.ReactNode, hot = false) => (
    <g>
      {hot && <rect x="26" y={y - 2} width="268" height="36" rx="10" fill="#3b4a78" />}
      <text x="42" y={y + 22} fontFamily={hot ? SERIF_BOLD : SERIF} fontSize="15" fill={C.fg}>{label}</text>
      {icon}
      {hot && <rect x="26" y={y - 2} width="268" height="36" rx="10" fill="none" stroke={C.blue} strokeWidth="3" className="rxg-glow" />}
    </g>
  );
  const stroke = { stroke: C.mut, strokeWidth: 2, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 320 184" role="img" aria-label="The Share menu with Add to Home Screen highlighted" style={{ width: "100%", display: "block" }}>
      <rect x="10" y="4" width="300" height="176" rx="20" fill="#2e3752" />
      {row(14, "Copy", <rect x="262" y="24" width="14" height="16" rx="3" {...stroke} />)}
      {row(50, "Add to Bookmarks", <path d="M262 59 h14 v18 l-7 -5 l-7 5 z" {...stroke} />)}
      {row(86, "Add to Home Screen", <g {...stroke} stroke={C.cream}><rect x="261" y="94" width="16" height="16" rx="3" /><path d="M269 98 v8 M265 102 h8" /></g>, true)}
      {row(122, "Find on Page", <circle cx="270" cy="139" r="6" {...stroke} />)}
    </svg>
  );
}

function FigureAdd({ iconUrl }: { iconUrl: string }) {
  return (
    <svg viewBox="0 0 320 210" role="img" aria-label="The Add to Home Screen window with the switch and the Add button highlighted" style={{ width: "100%", display: "block" }}>
      <rect x="10" y="4" width="300" height="202" rx="22" fill="#2e3752" />
      <text x="30" y="38" fontFamily={SERIF} fontSize="14" fill={C.mut}>Cancel</text>
      <text x="160" y="38" textAnchor="middle" fontFamily={SERIF_BOLD} fontSize="14" fill={C.fg}>Add to Home Screen</text>
      <rect x="254" y="19" width="48" height="26" rx="13" fill={C.blue} />
      <text x="278" y="37" textAnchor="middle" fontFamily={SERIF_BOLD} fontSize="14" fill={C.ink}>Add</text>
      <Ring cx={278} cy={32} r={21} />
      <rect x="26" y="62" width="268" height="62" rx="12" fill="#232b40" />
      <defs><clipPath id="rxg-clip-add"><rect x="36" y="70" width="46" height="46" rx="10.5" /></clipPath></defs>
      <image href={iconUrl} x="36" y="70" width="46" height="46" clipPath="url(#rxg-clip-add)" />
      <text x="96" y="90" fontFamily={SERIF_BOLD} fontSize="16" fill={C.fg}>Rolodex</text>
      <text x="96" y="110" fontFamily={SERIF} fontSize="12" fill={C.mut}>ialoni66.github.io</text>
      <rect x="26" y="138" width="268" height="52" rx="12" fill="#232b40" />
      <text x="42" y="169" fontFamily={SERIF} fontSize="15" fill={C.fg}>Open as Web App</text>
      <rect x="236" y="152" width="46" height="26" rx="13" fill="#34c759" />
      <circle cx="269" cy="165" r="10" fill="#ffffff" />
      <rect x="26" y="138" width="268" height="52" rx="12" fill="none" stroke={C.blue} strokeWidth="3" className="rxg-glow" />
    </svg>
  );
}

function FigureHome({ iconUrl }: { iconUrl: string }) {
  const shades = ["#3a4666", "#4a3f66", "#3f5e66", "#66543f", "#3f4b66", "#5e3f50", "#3f6652", "#4b4b4b"];
  const cells = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <svg viewBox="0 0 320 214" role="img" aria-label="The Home Screen with the new Rolodex icon highlighted" style={{ width: "100%", display: "block" }}>
      <rect x="22" y="4" width="276" height="206" rx="28" fill="#232b40" />
      {cells.map((i) => {
        const col = i % 4, row = Math.floor(i / 4);
        if (i === 6) return null; // that spot holds the Rolodex icon
        return <rect key={i} x={38 + col * 64} y={22 + row * 84} width="50" height="50" rx="12" fill={shades[i]} opacity="0.75" />;
      })}
      <defs><clipPath id="rxg-clip-home"><rect x={38 + 2 * 64} y={22 + 84} width="50" height="50" rx="11.5" /></clipPath></defs>
      <image href={iconUrl} x={38 + 2 * 64} y={22 + 84} width="50" height="50" clipPath="url(#rxg-clip-home)" />
      <Ring cx={38 + 2 * 64 + 25} cy={22 + 84 + 25} r={36} />
      <text x={38 + 2 * 64 + 25} y={22 + 84 + 72} textAnchor="middle" fontFamily={SERIF_BOLD} fontSize="13" fill={C.fg}>Rolodex</text>
    </svg>
  );
}

// ---------- the four steps ----------

type Step = { title: string; body: string; note: string; figure: (iconUrl: string) => React.ReactNode };

const STEPS: Step[] = [
  {
    title: "Tap the Share button",
    body: "It is the square with an arrow pointing up, in Safari's toolbar.",
    note: "Safari looks a little different on every iPhone. Either way, Share is the one you are looking for.",
    figure: () => <FigureShare />,
  },
  {
    title: "Choose “Add to Home Screen”",
    body: "Scroll down the list until you see it, then tap it.",
    note: "Not in the list? Scroll to the very bottom, tap Edit Actions, then tap the + next to Add to Home Screen.",
    figure: () => <FigureSheet />,
  },
  {
    title: "Tap Add",
    body: "The name is already Rolodex. If you see an “Open as Web App” switch, leave it on (green). Then tap Add in the top corner.",
    note: "On newer iPhones, if that switch is off the icon opens Safari instead of the app. If that happens, delete the icon and add it again with the switch on. Older iPhones don't show the switch, so just tap Add.",
    figure: (iconUrl) => <FigureAdd iconUrl={iconUrl} />,
  },
  {
    title: "Open Rolodex from your Home Screen",
    body: "Find the new icon and tap it. It opens full screen, like any other app.",
    note: "Always open it from that icon. Anything you type into this browser page stays in the browser and will not appear in the app.",
    figure: (iconUrl) => <FigureHome iconUrl={iconUrl} />,
  },
];

const css = `
.rxg-glow{animation:rxg-glow 1.6s ease-in-out infinite}
@keyframes rxg-glow{0%,100%{opacity:.25}50%{opacity:1}}
.rxg-btn{cursor:pointer;-webkit-tap-highlight-color:transparent;border:0;font-family:${SERIF_BOLD};font-size:17px;border-radius:14px;padding:15px 18px}
.rxg-btn:active{opacity:.8}
@media (prefers-reduced-motion:reduce){.rxg-glow{animation:none}}
`;

type Props = { onUseInBrowser: () => void };

export function InstallGuide({ onUseInBrowser }: Props) {
  const [i, setI] = useState(0);
  const [warn, setWarn] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  // After tapping Next or Back, bring the new step to the top of the screen so it is never half off-screen.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    card.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [i]);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  const inApp = inAppBrowserName();
  const other = usingOtherBrowser();
  const iconUrl = new URL("icon-192.png", document.baseURI).href;

  const page: React.CSSProperties = { position: "fixed", inset: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" as any, background: C.bg, color: C.fg, fontFamily: SERIF };
  const col: React.CSSProperties = { maxWidth: 480, margin: "0 auto", padding: "max(20px, env(safe-area-inset-top)) 22px max(40px, env(safe-area-inset-bottom))" };

  return (
    <div style={page}>
      <style>{css}</style>
      <div style={col}>
        <div style={{ textAlign: "center" }}>
          <img src={iconUrl} width={68} height={68} alt="" style={{ borderRadius: 16, boxShadow: "0 6px 22px rgba(0,0,0,.45)" }} />
          <h1 style={{ fontFamily: SERIF_BOLD, fontSize: 30, margin: "10px 0 4px", color: C.cream, fontWeight: 400 }}>Rolodex</h1>
          <p style={{ margin: 0, color: C.mut, fontSize: 16, lineHeight: 1.4 }}>{TAGLINE}</p>
        </div>

        {inApp && (
          <div style={{ marginTop: 22, padding: "14px 16px", background: "#4a2f20", border: `1px solid ${C.cream}`, borderRadius: 14, fontSize: 15, lineHeight: 1.5 }}>
            <b style={{ fontFamily: SERIF_BOLD, fontWeight: 400 }}>Open this page in Safari first.</b> You are inside another app's browser, which can't add apps to the Home Screen.
            Tap the ⋯ or the compass icon and choose <b style={{ fontFamily: SERIF_BOLD, fontWeight: 400 }}>Open in Safari</b>.
          </div>
        )}
        {!inApp && other && (
          <div style={{ marginTop: 22, padding: "12px 16px", background: C.card, borderRadius: 14, fontSize: 14, lineHeight: 1.5, color: C.mut }}>
            The steps below are for Safari. Your browser may work too, but if anything looks different, open this link in Safari.
          </div>
        )}

        <div ref={card} style={{ marginTop: 22, background: C.card, borderRadius: 22, padding: "22px 20px 20px", scrollMarginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ color: C.mut, fontSize: 14, letterSpacing: ".04em", textTransform: "uppercase" }}>Step {i + 1} of {STEPS.length}</span>
            <span style={{ display: "flex", gap: 7 }} aria-hidden="true">
              {STEPS.map((_, n) => <span key={n} style={{ width: n === i ? 22 : 8, height: 8, borderRadius: 4, background: n <= i ? C.blue : C.line, transition: "width .2s" }} />)}
            </span>
          </div>
          <h2 style={{ fontFamily: SERIF_BOLD, fontSize: 24, lineHeight: 1.25, margin: "0 0 8px", fontWeight: 400 }}>{step.title}</h2>
          <p style={{ margin: "0 0 18px", fontSize: 17, lineHeight: 1.5 }}>{step.body}</p>
          <div style={{ background: C.bg, borderRadius: 16, padding: "14px 12px" }}>{step.figure(iconUrl)}</div>
          <p style={{ margin: "16px 0 0", fontSize: 14.5, lineHeight: 1.5, color: C.mut }}>{step.note}</p>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            {i > 0 && (
              <button className="rxg-btn" style={{ background: "transparent", color: C.fg, border: `1px solid ${C.line}`, flex: "0 0 auto" }} onClick={() => setI(i - 1)}>Back</button>
            )}
            {!last ? (
              <button className="rxg-btn" style={{ background: C.blue, color: C.ink, flex: 1 }} onClick={() => setI(i + 1)}>Next step</button>
            ) : (
              <div style={{ flex: 1, textAlign: "center", color: C.cream, fontFamily: SERIF_BOLD, fontSize: 17, padding: "14px 4px" }}>That's it. Enjoy Rolodex.</div>
            )}
          </div>
        </div>

        {(ABOUT.bio || ABOUT.name) && (
          <div style={{ marginTop: 26, padding: "4px 4px 0" }}>
            <div style={{ color: C.mut, fontSize: 13, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>{ABOUT.name ? `About ${ABOUT.name}` : "About"}</div>
            <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.6 }}>{ABOUT.bio}</p>
          </div>
        )}

        <p style={{ margin: "30px 0 0", textAlign: "center", color: C.mut, fontSize: 14, lineHeight: 1.5 }}>Free. No account. Your entries are stored only on your own phone.</p>

        <div style={{ marginTop: 18, textAlign: "center" }}>
          {!warn ? (
            <button style={{ background: "none", border: 0, color: C.mut, textDecoration: "underline", fontFamily: SERIF, fontSize: 14, cursor: "pointer" }} onClick={() => setWarn(true)}>
              Use it in this browser instead
            </button>
          ) : (
            <div style={{ background: C.card, borderRadius: 14, padding: "14px 16px", fontSize: 14, lineHeight: 1.5, textAlign: "left" }}>
              Entries made in the browser stay in the browser. They will not move to the app on your Home Screen later, except by using Save file and Import data in Settings.
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button className="rxg-btn" style={{ background: "transparent", color: C.fg, border: `1px solid ${C.line}`, fontSize: 15, padding: "11px 14px" }} onClick={() => setWarn(false)}>Go back</button>
                <button className="rxg-btn" style={{ background: C.cream, color: C.ink, fontSize: 15, padding: "11px 14px", flex: 1 }} onClick={() => { rememberBrowserChoice(); onUseInBrowser(); }}>Continue in the browser</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
