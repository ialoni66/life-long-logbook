import AsyncStorage from "@react-native-async-storage/async-storage";
import { Data } from "./types";

const KEY = "logbook.data.v1";

export async function load(): Promise<Data> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { people: [], interactions: [] };
}

export async function save(data: Data) {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export function parseBackup(text: string): Data {
  const d = JSON.parse(text);
  if (!Array.isArray(d.people) || !Array.isArray(d.interactions)) {
    throw new Error("Not a logbook backup");
  }
  return d;
}
