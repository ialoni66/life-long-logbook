// Reading a saved file back into the logbook. This file is pure logic with no storage or
// screens, so it can be tested on its own. Nothing here writes anything.
import { uid } from "./types";
import type { Entry } from "./types";

export type ParsedBackup = {
  entries: Entry[]; // valid entries found in the file, duplicates inside the file removed
  invalid: number; // entries in the file that were unreadable and left out
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function validDate(s: string) {
  if (!DATE.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

// Turns one raw item from a file into a clean entry, or null if it can't be used.
function cleanEntry(raw: any): Entry | null {
  if (!raw || typeof raw !== "object") return null;
  const date = str(raw.date).trim();
  if (!validDate(date)) return null;
  const entry: Entry = {
    id: str(raw.id).trim() || uid(),
    date,
    name: str(raw.name),
    location: str(raw.location),
    contact: str(raw.contact),
    notes: str(raw.notes),
  };
  // an entry with nothing in it is not worth keeping
  if (!entry.name.trim() && !entry.location.trim() && !(entry.contact ?? "").trim() && !entry.notes.trim()) {
    return null;
  }
  return entry;
}

// The first version of the app stored people and interactions separately.
export function fromV1(d: any): { entries: Entry[] } {
  const nameOf = (id: string) => d.people?.find((p: any) => p.id === id)?.name ?? "";
  return {
    entries: (d.interactions ?? []).map((i: any) => ({
      id: i.id,
      date: i.date,
      name: nameOf(i.personId),
      location: "",
      notes: [i.summary, i.details].filter(Boolean).join("\n"),
    })),
  };
}

// Reads the text of a saved file. Throws a plain-English error if it isn't a logbook file.
export function parseBackupText(text: string): ParsedBackup {
  let data: any;
  try {
    data = JSON.parse(text.trim().replace(/^﻿/, ""));
  } catch {
    throw new Error("This file can't be read. It doesn't look like a saved Logbook file.");
  }

  let list: unknown[];
  if (Array.isArray(data)) list = data;
  else if (Array.isArray(data?.entries)) list = data.entries;
  else if (Array.isArray(data?.interactions)) list = fromV1(data).entries;
  else throw new Error("This file doesn't look like a Logbook file, so nothing was imported.");

  const seen = new Set<string>();
  const entries: Entry[] = [];
  let invalid = 0;
  for (const raw of list) {
    const e = cleanEntry(raw);
    if (!e) { invalid++; continue; }
    if (seen.has(e.id)) continue; // the same entry twice in one file counts once
    seen.add(e.id);
    entries.push(e);
  }
  if (entries.length === 0) {
    throw new Error(
      list.length === 0
        ? "This file has no entries in it, so nothing was imported."
        : "None of the entries in this file could be read, so nothing was imported."
    );
  }
  return { entries, invalid };
}

// Two entries with the same content count as the same entry, even if their ids differ.
const signature = (e: Entry) =>
  [e.date, e.name, e.location, e.contact ?? "", e.notes].map((s) => s.trim().toLowerCase()).join("\u0001");

// Works out what an import would add, without changing anything.
export function planImport(current: Entry[], incoming: Entry[]) {
  const ids = new Set(current.map((e) => e.id));
  const sigs = new Set(current.map(signature));
  const fresh: Entry[] = [];
  let alreadyHere = 0;
  for (const e of incoming) {
    if (ids.has(e.id) || sigs.has(signature(e))) { alreadyHere++; continue; }
    ids.add(e.id);
    sigs.add(signature(e));
    fresh.push(e);
  }
  return { fresh, alreadyHere };
}
