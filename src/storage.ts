import AsyncStorage from "@react-native-async-storage/async-storage";
import { fromV1 } from "./importer";
import { defaultSettings, Settings } from "./settings";
import { Data } from "./types";

const KEY = "logbook.data.v2";
const OLD_KEY = "logbook.data.v1";

export function parseBackup(text: string): Data {
  const d = JSON.parse(text);
  if (Array.isArray(d.entries)) return { entries: d.entries };
  if (Array.isArray(d.interactions)) return fromV1(d);
  throw new Error("Not a logbook backup");
}

export async function load(): Promise<Data> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return parseBackup(raw);
    const old = await AsyncStorage.getItem(OLD_KEY);
    if (old) return parseBackup(old);
  } catch {}
  return { entries: [] };
}

export async function save(data: Data) {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

// A copy of your entries kept just before an import (or an undo), so either can be reversed.
export type Safety = { savedAt: string; reason: "import" | "undo"; data: Data };
const SAFETY_KEY = "logbook.safety.v1";

export async function loadSafety(): Promise<Safety | null> {
  try {
    const raw = await AsyncStorage.getItem(SAFETY_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && Array.isArray(s.data?.entries) && typeof s.savedAt === "string") return s;
    }
  } catch {}
  return null;
}

// Throws if the copy can't be written, so callers can stop before changing anything.
export async function saveSafety(s: Safety) {
  await AsyncStorage.setItem(SAFETY_KEY, JSON.stringify(s));
}

const SETTINGS_KEY = "logbook.settings.v1";

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaultSettings(), ...JSON.parse(raw) };
  } catch {}
  return defaultSettings();
}

export async function saveSettings(s: Settings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}
