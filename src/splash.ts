import { Platform } from "react-native";

// The loading screen is part of the page itself (added at build time by scripts/postbuild.js),
// so it shows before any app code has arrived. This fades it away once the app is ready.
// A short minimum stops it from flickering when the app is ready almost at once. It used to be 0.7 s,
// but now that repeat opens are instant it would only have slowed them down.
const MIN_VISIBLE_MS = 300;
const FADE_MS = 300;

export function hideSplash() {
  if (Platform.OS !== "web" || typeof document === "undefined") return;
  const el = document.getElementById("rx-splash");
  if (!el) return; // the development server has no loading screen
  // performance.now() counts from the moment the page started opening
  const wait = Math.max(0, MIN_VISIBLE_MS - performance.now());
  setTimeout(() => {
    el.classList.add("rx-hide");
    setTimeout(() => el.remove(), FADE_MS + 150);
  }, wait);
}
