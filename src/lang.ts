// The languages the app can be shown in. Kept in its own tiny file so nothing imports in a circle.
export type Lang = "en" | "he";
export const LANGS: Lang[] = ["en", "he"];
// Each language is always named in itself, so it can be found even when the page is in the wrong one.
export const LANG_NAMES: Record<Lang, string> = { en: "English", he: "עברית" };
export const isRTL = (l: Lang) => l === "he";
// Locale used for month names, weekdays and times.
export const LOCALE: Record<Lang, string> = { en: "en-US", he: "he-IL" };
