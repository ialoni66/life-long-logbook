// One note about meeting someone, tagged with Who / When / Where.
// Name and location are optional: sometimes you only remember one identifier.
export type Entry = {
  id: string;
  date: string; // YYYY-MM-DD (When)
  name: string; // Who
  location: string; // Where
  notes: string;
};

export type Data = { entries: Entry[] };

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const ymd = (d: Date) => {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

export const today = () => ymd(new Date());
