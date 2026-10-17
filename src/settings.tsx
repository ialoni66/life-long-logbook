import { createContext, useContext } from "react";
import { DEFAULT_FONT, FontKey } from "./fonts";

export type DateFormat = "MDY" | "DMY";
export type Settings = { dateFormat: DateFormat; font: FontKey };

// Until the user picks one, follow the device's own convention.
export function defaultSettings(): Settings {
  try {
    const parts = new Intl.DateTimeFormat(undefined).formatToParts(new Date(2026, 10, 25));
    const order = parts.map((p) => p.type).filter((t) => t === "day" || t === "month");
    return { dateFormat: order[0] === "day" ? "DMY" : "MDY", font: DEFAULT_FONT };
  } catch {
    return { dateFormat: "MDY", font: DEFAULT_FONT };
  }
}

export const FORMAT_LABELS: Record<DateFormat, string> = {
  MDY: "MM/DD/YYYY",
  DMY: "DD/MM/YYYY",
};

// Entries are stored as YYYY-MM-DD; this only changes how a date is shown.
export function formatDate(iso: string, fmt: DateFormat) {
  const [y, m, d] = iso.split("-");
  return fmt === "DMY" ? `${d}/${m}/${y}` : `${m}/${d}/${y}`;
}

const Ctx = createContext<Settings>({ dateFormat: "MDY", font: DEFAULT_FONT });
export const SettingsProvider = Ctx.Provider;
export const useSettings = () => useContext(Ctx);
