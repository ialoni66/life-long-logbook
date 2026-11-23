import React, { useEffect, useRef, useState } from "react";
import { ABOUT, TAGLINE } from "./about";
import {
  androidBrowser, canPromptInstall, detectedPhone, inAppBrowserName, onInstallChange, Phone,
  promptInstall, rememberBrowserChoice, requestedGuide, usingOtherIPhoneBrowser, wasInstalledJustNow,
} from "./install";

// The page someone sees when they open the link in a browser instead of the installed app:
// a welcome, a choice between iPhone and Android, then four steps for that phone, one at a time.

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

// ---- iPhone

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
      <rect x="249" y="14" width="58" height="36" rx="18" fill="none" stroke={C.blue} strokeWidth="3" className="rxg-glow" />
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

// ---- Android

function FigureChromeBar() {
  return (
    <svg viewBox="0 0 320 112" role="img" aria-label="Chrome's address bar with the three-dot menu button highlighted" style={{ width: "100%", display: "block" }}>
      <rect x="8" y="6" width="304" height="100" rx="24" fill="#232b40" />
      <rect x="22" y="24" width="208" height="46" rx="23" fill="#343f5c" />
      <rect x="40" y="42" width="11" height="9" rx="2" fill={C.mut} />
      <path d="M42.5 42 v-3 a3 3 0 0 1 6 0 v3" stroke={C.mut} strokeWidth="1.6" fill="none" />
      <text x="62" y="52" fontFamily={SERIF} fontSize="13" fill={C.mut}>ialoni66.github.io</text>
      <rect x="244" y="35" width="24" height="24" rx="6" fill="none" stroke={C.mut} strokeWidth="2" />
      <text x="256" y="52" textAnchor="middle" fontFamily={SERIF_BOLD} fontSize="12" fill={C.mut}>1</text>
      <g fill={C.fg}><circle cx="292" cy="37" r="2.6" /><circle cx="292" cy="47" r="2.6" /><circle cx="292" cy="57" r="2.6" /></g>
      <Ring cx={292} cy={47} r={22} />
      <text x="160" y="94" textAnchor="middle" fontFamily={SERIF_BOLD} fontSize="14" fill={C.cream}>Tap the three dots</text>
    </svg>
  );
}

function FigureChromeMenu() {
  const rows = ["New tab", "New Incognito tab", "History", "Install app", "Share…", "Settings"];
  return (
    <svg viewBox="0 0 320 206" role="img" aria-label="Chrome's menu with Install app highlighted" style={{ width: "100%", display: "block" }}>
      <rect x="36" y="4" width="278" height="198" rx="16" fill="#2e3752" />
      {rows.map((label, n) => {
        const y = 14 + n * 30, hot = n === 3;
        return (
          <g key={label}>
            {hot && <rect x="44" y={y - 2} width="262" height="30" rx="9" fill="#3b4a78" />}
            <text x="60" y={y + 19} fontFamily={hot ? SERIF_BOLD : SERIF} fontSize="14.5" fill={C.fg}>{label}</text>
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
    </svg>
  );
}

function FigureAndroidDialog({ iconUrl }: { iconUrl: string }) {
  return (
    <svg viewBox="0 0 320 188" role="img" aria-label="Chrome's Install app window with the Install button highlighted" style={{ width: "100%", display: "block" }}>
      <rect x="18" y="8" width="284" height="172" rx="26" fill="#2e3752" />
      <text x="42" y="46" fontFamily={SERIF_BOLD} fontSize="18" fill={C.fg}>Install app?</text>
      <defs><clipPath id="rxg-clip-and"><rect x="42" y="64" width="46" height="46" rx="10.5" /></clipPath></defs>
      <image href={iconUrl} x="42" y="64" width="46" height="46" clipPath="url(#rxg-clip-and)" />
      <text x="102" y="84" fontFamily={SERIF_BOLD} fontSize="16" fill={C.fg}>Rolodex</text>
      <text x="102" y="104" fontFamily={SERIF} fontSize="12" fill={C.mut}>ialoni66.github.io</text>
      <text x="168" y="156" fontFamily={SERIF} fontSize="15" fill={C.blue}>Cancel</text>
      <rect x="232" y="134" width="56" height="30" rx="15" fill={C.blue} />
      <text x="260" y="154" textAnchor="middle" fontFamily={SERIF_BOLD} fontSize="14.5" fill={C.ink}>Install</text>
      <rect x="226" y="128" width="68" height="42" rx="21" fill="none" stroke={C.blue} strokeWidth="3" className="rxg-glow" />
    </svg>
  );
}

// ---------- the steps for each phone ----------

type Step = { title: string; body: string; note: string; figure: (iconUrl: string) => React.ReactNode };

const IOS_STEPS: Step[] = [
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

const ANDROID_STEPS: Step[] = [
  {
    title: "Tap the three dots",
    body: "They are at the top right of Chrome, next to the address bar.",
    note: "If your address bar is at the bottom of the screen, the three dots are at the bottom right.",
    figure: () => <FigureChromeBar />,
  },
  {
    title: "Choose “Install app”",
    body: "Look for Install app in the menu and tap it.",
    note: "Depending on your Chrome version it may say “Install and create shortcut” or “Add to Home screen” instead. If you are offered both Install and Create shortcut, choose Install, because that makes a real app.",
    figure: () => <FigureChromeMenu />,
  },
  {
    title: "Tap Install",
    body: "Chrome asks you to confirm. Tap Install.",
    note: "Some phones then show a second box asking to add the icon to your Home screen. Tap Add, or touch and hold the icon and drag it where you want it.",
    figure: (iconUrl) => <FigureAndroidDialog iconUrl={iconUrl} />,
  },
  {
    title: "Open Rolodex from your phone",
    body: "Find the new Rolodex icon on your Home screen or in your app list and tap it. It opens full screen, like any other app.",
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

// A simple outline of a phone, so each choice has a picture.
const PhoneGlyph = ({ kind }: { kind: Phone }) => (
  <svg width="34" height="54" viewBox="0 0 34 54" aria-hidden="true" style={{ flex: "0 0 auto" }}>
    <rect x="2" y="2" width="30" height="50" rx="8" fill="none" stroke={C.cream} strokeWidth="2.4" />
    {kind === "ios" ? <rect x="11" y="7" width="12" height="4" rx="2" fill={C.cream} /> : <circle cx="17" cy="8.5" r="2" fill={C.cream} />}
    <rect x="11" y="45" width="12" height="2.4" rx="1.2" fill={C.cream} opacity="0.7" />
  </svg>
);

type Props = { onUseInBrowser: () => void };

export function InstallGuide({ onUseInBrowser }: Props) {
  const requested = requestedGuide();
  const [phone, setPhone] = useState<Phone | null>(requested === "ios" || requested === "android" ? requested : null);
  const [i, setI] = useState(0);
  const [warn, setWarn] = useState(false);
  const [, refresh] = useState(0);
  const [tapped, setTapped] = useState<"accepted" | "dismissed" | null>(null);
  const page = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const first = useRef(true);

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
  const steps = phone === "android" ? ANDROID_STEPS : IOS_STEPS;
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

  return (
    <div style={frame} ref={page}>
      <style>{css}</style>
      <div style={col}>
        <div style={{ textAlign: "center" }}>
          <img src={iconUrl} width={68} height={68} alt="" style={{ borderRadius: 16, boxShadow: "0 6px 22px rgba(0,0,0,.45)" }} />
          <h1 style={{ fontFamily: SERIF_BOLD, fontSize: 30, margin: "10px 0 4px", color: C.cream, fontWeight: 400 }}>Rolodex</h1>
          <p style={{ margin: 0, color: C.mut, fontSize: 16, lineHeight: 1.4 }}>{TAGLINE}</p>
        </div>

        {inApp && note(
          <>{strong(`Open this page in ${browserName} first.`)} You are inside another app's browser, which can't install apps. Tap the {phone === "android" ? "⋮" : "⋯"} menu or the browser icon and choose {strong(`Open in ${browserName}`)}.</>,
          "warn"
        )}

        {phone === null ? (
          <div style={{ marginTop: 26 }}>
            <h2 style={{ fontFamily: SERIF_BOLD, fontSize: 24, fontWeight: 400, margin: "0 0 6px", textAlign: "center" }}>Which phone do you have?</h2>
            <p style={{ margin: "0 0 18px", color: C.mut, fontSize: 16, textAlign: "center", lineHeight: 1.45 }}>Pick yours and we'll show you how to get Rolodex on it.</p>
            {(["ios", "android"] as Phone[]).map((p) => (
              <button
                key={p}
                className="rxg-btn"
                onClick={() => choose(p)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 16, textAlign: "left", background: C.card, color: C.fg, border: `2px solid ${detected === p ? C.blue : C.line}`, borderRadius: 18, padding: "16px 18px", marginBottom: 12 }}
              >
                <PhoneGlyph kind={p} />
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: 21 }}>{p === "ios" ? "iPhone or iPad" : "Android"}</span>
                  <span style={{ display: "block", fontFamily: SERIF, fontSize: 14, color: C.mut, marginTop: 3 }}>{p === "ios" ? "Install with Safari" : "Install with Chrome"}</span>
                </span>
                {detected === p && <span style={{ fontFamily: SERIF_BOLD, fontSize: 12, background: C.blue, color: C.ink, borderRadius: 10, padding: "4px 9px", whiteSpace: "nowrap" }}>Likely yours</span>}
              </button>
            ))}
          </div>
        ) : (
          <>
            <div style={{ marginTop: 18 }}>
              <button onClick={() => { setPhone(null); setTapped(null); }} style={{ background: "none", border: 0, color: C.blue, fontFamily: SERIF, fontSize: 15, cursor: "pointer", padding: "4px 0" }}>
                ← Wrong phone? Choose a different one
              </button>
            </div>

            {phone === "ios" && usingOtherIPhoneBrowser() && !inApp && note("The steps below are for Safari. Your browser may work too, but if anything looks different, open this link in Safari.")}
            {phone === "android" && !inApp && droidBrowser === "samsung" && note(<>{strong("Using Samsung Internet?")} Tap the ≡ menu, then {strong("Add page to")}, then {strong("Home screen")}. For the full app experience, Chrome works best.</>)}
            {phone === "android" && !inApp && droidBrowser === "other" && note("The steps below are for Chrome. Your browser may offer the same thing in its menu; if anything looks different, open this link in Chrome.")}

            {phone === "android" && installed && (
              <div style={{ marginTop: 20, padding: "16px 18px", background: "#1f4a33", border: "1px solid #34c759", borderRadius: 16, fontSize: 16, lineHeight: 1.5 }}>
                {strong("Rolodex is installed.")} Open it from your Home screen or app list. You can close this page.
              </div>
            )}
            {phone === "android" && !installed && canPromptInstall() && (
              <div style={{ marginTop: 20, padding: "18px", background: C.card, borderRadius: 18, textAlign: "center" }}>
                <div style={{ fontFamily: SERIF_BOLD, fontSize: 18, marginBottom: 4 }}>Install it in one tap</div>
                <div style={{ color: C.mut, fontSize: 14.5, lineHeight: 1.45, marginBottom: 14 }}>Your phone can do the steps for you. Or follow the steps below if you prefer.</div>
                <button className="rxg-btn" style={{ background: C.blue, color: C.ink, width: "100%" }} onClick={async () => { const r = await promptInstall(); if (r !== "unavailable") setTapped(r); }}>
                  Install Rolodex
                </button>
              </div>
            )}
            {/* The browser's offer can only be used once, so this stays visible after someone says no. */}
            {phone === "android" && !installed && !canPromptInstall() && tapped === "dismissed" && (
              <div style={{ marginTop: 20, padding: "14px 18px", background: C.card, borderRadius: 16, fontSize: 15, lineHeight: 1.5, color: C.mut }}>
                No problem. You can install it any time by following the steps below.
              </div>
            )}

            <div ref={card} style={{ marginTop: 22, background: C.card, borderRadius: 22, padding: "22px 20px 20px", scrollMarginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ color: C.mut, fontSize: 14, letterSpacing: ".04em", textTransform: "uppercase" }}>Step {i + 1} of {steps.length}</span>
                <span style={{ display: "flex", gap: 7 }} aria-hidden="true">
                  {steps.map((_, n) => <span key={n} style={{ width: n === i ? 22 : 8, height: 8, borderRadius: 4, background: n <= i ? C.blue : C.line, transition: "width .2s" }} />)}
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
          </>
        )}

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
              Entries made in the browser stay in the browser. They will not move to the app on your phone later, except by using Save file and Import data in Settings.
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
