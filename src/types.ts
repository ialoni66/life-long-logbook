export type Person = {
  id: string;
  name: string;
  relationship?: string;
  notes?: string;
};

export type Interaction = {
  id: string;
  personId: string;
  date: string; // YYYY-MM-DD
  summary: string;
  details?: string;
};

export type Data = {
  people: Person[];
  interactions: Interaction[];
};

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const today = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};
