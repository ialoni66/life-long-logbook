import { Platform } from "react-native";

// Works out whether someone opening the app in a web browser should be shown the install guide.
// The guide appears on iPhone and iPad when the app is opened in a browser tab. Once the app has
// been added to the Home Screen it opens full screen instead, and the guide never shows.

const isWeb = () => Platform.OS === "web" && typeof window !== "undefined" && typeof navigator !== "undefined";

export function isIOSDevice(): boolean {
  if (!isWeb()) return false;
  // iPads can pretend to be Macs, so a touch screen on a "Mac" counts too
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

// True when opened from the Home Screen icon (full screen, no browser bars).
export function isInstalled(): boolean {
  if (!isWeb()) return false;
  const nav = navigator as any;
  return nav.standalone === true || (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
}

// Browsers built into other apps (Instagram, Facebook, TikTok and so on) can't add to the Home Screen.
export function inAppBrowserName(): string | null {
  if (!isWeb()) return null;
  const ua = navigator.userAgent;
  const found = ua.match(/(FBAN|FBAV|Instagram|Line\/|Snapchat|TikTok|BytedanceWebview|musical_ly|Twitter|LinkedInApp|Pinterest|GSA\/|MicroMessenger|WhatsApp)/i);
  return found ? found[1].replace("/", "") : null;
}

// Other iPhone browsers can add to the Home Screen too, but Safari is the simplest to explain.
export function usingOtherBrowser(): boolean {
  return isWeb() && /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/.test(navigator.userAgent);
}

const BROWSER_OK = "rx-browser-ok";

export function rememberBrowserChoice() {
  try { sessionStorage.setItem(BROWSER_OK, "1"); } catch {}
}

export function shouldShowInstallGuide(): boolean {
  if (!isWeb()) return false;
  const q = new URLSearchParams(window.location.search);
  if (q.get("app") === "1") rememberBrowserChoice(); // lets the app be opened in a browser on purpose
  if (q.get("guide") === "1") return true; // preview the guide on any device
  if (isInstalled()) return false;
  try { if (sessionStorage.getItem(BROWSER_OK) === "1") return false; } catch {}
  return isIOSDevice();
}
