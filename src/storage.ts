import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultSettings, Settings } from "./settings";
import { Data, Entry } from "./types";

const KEY = "logbook.data.v2";
const OLD_KEY = "logbook.data.v1";

// Converts the earlier people + interactions format into entries.
function fromV1(d: any): Data {
  const nameOf = (id: string) => d.people?.find((p: any) => p.id === id)?.name ?? "";
  return {
    entries: (d.interactions ?? []).map((i: any): Entry => ({
      id: i.id,
      date: i.date,
      name: nameOf(i.personId),
      location: "",
      notes: [i.summary, i.details].filter(Boolean).join("\n"),
    })),
  };
}

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
