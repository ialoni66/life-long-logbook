import { Platform } from "react-native";

// Works out whether someone opening the app in a web browser should be shown the install guide,
// and which phone they probably have. The guide appears on iPhones, iPads and Android phones when
// the app is opened in a browser tab. Once the app has been added to the Home Screen it opens full
// screen instead, and the guide never shows.

const isWeb = () => Platform.OS === "web" && typeof window !== "undefined" && typeof navigator !== "undefined";

export type Phone = "ios" | "android";

export function isIOSDevice(): boolean {
  if (!isWeb()) return false;
  // iPads can pretend to be Macs, so a touch screen on a "Mac" counts too
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function isAndroidDevice(): boolean {
  return isWeb() && /Android/i.test(navigator.userAgent);
}

// Which phone this probably is, so the guide can mark it as "looks like yours" (the visitor still chooses).
export function detectedPhone(): Phone | null {
  return isIOSDevice() ? "ios" : isAndroidDevice() ? "android" : null;
}

// True when opened from the Home Screen icon (full screen, no browser bars).
export function isInstalled(): boolean {
  if (!isWeb()) return false;
  const nav = navigator as any;
  return nav.standalone === true || (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
}

// Browsers built into other apps (Instagram, Facebook, TikTok and so on) can't install apps.
export function inAppBrowserName(): string | null {
  if (!isWeb()) return null;
  const ua = navigator.userAgent;
  const found = ua.match(/(FBAN|FBAV|Instagram|Line\/|Snapchat|TikTok|BytedanceWebview|musical_ly|Twitter|LinkedInApp|Pinterest|GSA\/|MicroMessenger|WhatsApp)/i);
  if (found) return found[1].replace("/", "");
  return /; wv\)/.test(ua) ? "WebView" : null; // a browser view built into an Android app
}

// Other iPhone browsers can add to the Home Screen too, but Safari is the simplest to explain.
export function usingOtherIPhoneBrowser(): boolean {
  return isWeb() && /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/.test(navigator.userAgent);
}

export type AndroidBrowser = "chrome" | "samsung" | "other";
export function androidBrowser(): AndroidBrowser {
  if (!isWeb()) return "other";
  const ua = navigator.userAgent;
  if (/SamsungBrowser/.test(ua)) return "samsung";
  if (/Chrome\/\d/.test(ua) && !/EdgA|OPR\/|Firefox|Vivaldi|DuckDuckGo|Brave/.test(ua)) return "chrome";
  return "other";
}

const BROWSER_OK = "rx-browser-ok";

export function rememberBrowserChoice() {
  try { sessionStorage.setItem(BROWSER_OK, "1"); } catch {}
}

// "?guide=ios" and "?guide=android" open the guide on that phone's steps (handy for previewing).
export function requestedGuide(): Phone | "choose" | null {
  if (!isWeb()) return null;
  const g = new URLSearchParams(window.location.search).get("guide");
  return g === "ios" || g === "android" ? g : g === "1" ? "choose" : null;
}

export function shouldShowInstallGuide(): boolean {
  if (!isWeb()) return false;
  const q = new URLSearchParams(window.location.search);
  if (q.get("app") === "1") rememberBrowserChoice(); // lets the app be opened in a browser on purpose
  if (requestedGuide()) return true; // preview the guide on any device
  if (isInstalled()) return false;
  try { if (sessionStorage.getItem(BROWSER_OK) === "1") return false; } catch {}
  return detectedPhone() !== null;
}

// ---- one-tap install (Chrome and some other Android browsers offer it)
// The browser announces "this can be installed" once, early on, so it is caught here at start-up
// and kept until the guide wants to use it.
let savedPrompt: any = null;
let installedJustNow = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

if (isWeb()) {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault(); // we show our own button instead of the browser's small banner
    savedPrompt = e;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    savedPrompt = null;
    installedJustNow = true;
    notify();
  });
}

export const canPromptInstall = () => savedPrompt !== null;
export const wasInstalledJustNow = () => installedJustNow;
export function onInstallChange(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!savedPrompt) return "unavailable";
  const p = savedPrompt;
  savedPrompt = null; // a prompt can only be used once
  try {
    await p.prompt();
    const choice = await p.userChoice;
    notify();
    return choice && choice.outcome === "accepted" ? "accepted" : "dismissed";
  } catch {
    notify();
    return "dismissed";
  }
}
