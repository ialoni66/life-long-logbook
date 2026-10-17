// On-device search. No network, no model download: everything below is plain code.
//
// How a query word is matched against a word in an entry (strongest wins):
//   1.00  same word after normalizing (case, accents, plurals, number words)
//   0.85  the entry word starts with what you typed ("park" -> "parking")
//   0.70  a built-in synonym ("kids" -> "children")
//   0.60  what you typed appears inside the entry word
//   0.50  within one or two typos ("huski" -> "husky")
// Every query word has to match somewhere (AND). Matches in the nickname count
// most, then where you met, then notes.
import type { Entry } from "./types";

// ---------- normalizing ----------

// A word is any run of characters that isn't whitespace or punctuation. Written
// without \p{L} so it works for every language (Hebrew, Arabic, accents...).
const TOKEN = /[^\s!-\/:-@\[-`{-~“”‘’…–—]+/g;

function fold(s: string) {
  let t = s.toLowerCase();
  try {
    t = t.normalize("NFD").replace(/[̀-ͯ]/g, "");
  } catch {}
  return t;
}

const NUMBER_WORDS: Record<string, string> = {
  zero: "0", one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7",
  eight: "8", nine: "9", ten: "10", eleven: "11", twelve: "12", dozen: "12", thirteen: "13",
  fourteen: "14", fifteen: "15", sixteen: "16", seventeen: "17", eighteen: "18", nineteen: "19",
  twenty: "20", thirty: "30", forty: "40", fifty: "50",
};

const IRREGULAR: Record<string, string> = {
  children: "child", men: "man", women: "woman", people: "person", feet: "foot", teeth: "tooth",
  mice: "mouse", geese: "goose", wives: "wife", knives: "knife", lives: "life", halves: "half",
};

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "of", "in", "on", "at", "to", "for", "with", "is", "are", "was",
  "were", "be", "been", "has", "have", "had", "he", "she", "they", "them", "his", "her", "their",
  "it", "its", "who", "that", "this", "as", "by", "from", "about", "do", "does", "did", "i", "we",
  "my", "our", "me",
]);

const memo = new Map<string, string>();

// Reduces a word to a rough root so "kids", "kid" and "kidding" line up.
export function stem(raw: string): string {
  const hit = memo.get(raw);
  if (hit !== undefined) return hit;
  const w = fold(raw);
  let out = w;
  if (/^\d+$/.test(w)) out = String(Number(w));
  else if (NUMBER_WORDS[w]) out = NUMBER_WORDS[w];
  else if (IRREGULAR[w]) out = IRREGULAR[w];
  else if (w.length > 3) {
    out = w;
    if (/ies$/.test(out) && out.length > 4) out = out.slice(0, -3) + "y";
    else if (/(ches|shes|sses|xes|zes)$/.test(out)) out = out.slice(0, -2);
    else if (!/(ss|us|is)$/.test(out) && /s$/.test(out)) out = out.slice(0, -1);
    else if (/ing$/.test(out) && out.length > 5) out = undouble(out.slice(0, -3));
    else if (/ied$/.test(out) && out.length > 4) out = out.slice(0, -3) + "y";
    else if (/ed$/.test(out) && out.length > 4) out = undouble(out.slice(0, -2));
    if (out.length > 3 && /e$/.test(out)) out = out.slice(0, -1);
  }
  memo.set(raw, out);
  return out;
}

const undouble = (s: string) => (/([^aeiou])\1$/.test(s) ? s.slice(0, -1) : s);

type Piece = { text: string; start: number; end: number; stem: string };

// Splits text into words, remembering where each one sits (used for highlighting).
function pieces(text: string): Piece[] {
  const out: Piece[] = [];
  TOKEN.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TOKEN.exec(text))) {
    out.push({ text: m[0], start: m.index, end: m.index + m[0].length, stem: stem(m[0]) });
  }
  return out;
}

// ---------- synonyms ----------

// Words in a group are treated as related. Roots are stemmed when the table is built.
const SYNONYM_GROUPS: string[][] = [
  ["child", "children", "kid", "son", "daughter", "offspring", "toddler", "baby", "teen", "teenager"],
  ["wife", "husband", "spouse", "partner", "married", "fiance", "fiancee"],
  ["mother", "mom", "mum", "mommy", "mama", "mum"],
  ["father", "dad", "daddy", "papa", "pop"],
  ["brother", "bro", "sibling"],
  ["sister", "sis", "sibling"],
  ["friend", "buddy", "pal", "mate", "bestie"],
  ["boyfriend", "girlfriend", "dating", "relationship"],
  ["job", "work", "career", "occupation", "profession", "employed"],
  ["coworker", "colleague", "workmate", "teammate"],
  ["boss", "manager", "supervisor"],
  ["teacher", "professor", "instructor", "lecturer", "tutor"],
  ["student", "pupil"],
  ["doctor", "physician", "dr", "nurse", "medic"],
  ["lawyer", "attorney", "counsel"],
  ["car", "vehicle", "auto"],
  ["dog", "puppy", "pup", "hound"],
  ["cat", "kitten", "kitty"],
  ["restaurant", "cafe", "diner", "eatery", "bistro"],
  ["bar", "pub", "tavern"],
  ["gym", "fitness", "workout", "exercise", "training"],
  ["house", "home", "apartment", "flat", "residence"],
  ["phone", "mobile", "cell"],
  ["university", "college", "uni", "campus"],
  ["party", "gathering", "celebration", "event", "wedding"],
  ["birthday", "bday"],
  ["tall", "lanky"],
  ["short", "petite"],
  ["funny", "hilarious", "humorous", "witty"],
  ["nice", "kind", "friendly", "sweet", "pleasant"],
  ["rich", "wealthy", "affluent"],
  ["trip", "travel", "vacation", "holiday", "journey"],
  ["music", "band", "singer", "musician", "song"],
  ["run", "jog", "running", "marathon"],
  ["hike", "hiking", "trek", "trail"],
  ["climb", "climbing", "boulder", "bouldering"],
];

const GROUP_OF = new Map<string, number[]>();
SYNONYM_GROUPS.forEach((group, i) => {
  for (const word of group) {
    const s = stem(word);
    const list = GROUP_OF.get(s) ?? [];
    if (!list.includes(i)) list.push(i);
    GROUP_OF.set(s, list);
  }
});

// ---------- typo tolerance ----------

// True if the two strings are within `max` single-letter edits.
function withinEdits(a: string, b: string, max: number): boolean {
  if (Math.abs(a.length - b.length) > max) return false;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      cur.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return false;
    prev = cur;
  }
  return prev[b.length] <= max;
}

// ---------- queries ----------

export type QueryWord = { stem: string; groups: number[] };
export type Query = QueryWord[];

export function compileQuery(text: string): Query | null {
  const all = pieces(text);
  if (!all.length) return null;
  const meaningful = all.filter((p) => !STOP_WORDS.has(fold(p.text)));
  const use = meaningful.length ? meaningful : all;
  return use.map((p) => ({ stem: p.stem, groups: GROUP_OF.get(p.stem) ?? [] }));
}

// How well one query word matches one entry word, from 0 (no) to 1 (exact).
export function strength(q: QueryWord, docStem: string): number {
  if (q.stem === docStem) return 1;
  if (/^\d+$/.test(q.stem) || /^\d+$/.test(docStem)) return 0; // numbers only match exactly
  if (q.stem.length >= 2 && docStem.startsWith(q.stem)) return 0.85;
  if (q.groups.length) {
    const other = GROUP_OF.get(docStem);
    if (other && other.some((g) => q.groups.includes(g))) return 0.7;
  }
  if (q.stem.length >= 3 && docStem.includes(q.stem)) return 0.6;
  if (q.stem.length >= 4 && docStem.length >= 4) {
    const max = q.stem.length >= 8 ? 2 : 1;
    if (withinEdits(q.stem, docStem, max)) return 0.5;
  }
  return 0;
}

// ---------- searching ----------

const WEIGHTS = { name: 3, location: 2, date: 1.5, notes: 1.2 };

export function searchEntries(entries: Entry[], text: string): { results: Entry[]; query: Query | null } {
  const query = compileQuery(text);
  const byDate = (a: Entry, b: Entry) => b.date.localeCompare(a.date);
  if (!query) return { results: [...entries].sort(byDate), query: null };

  const scored: { entry: Entry; score: number }[] = [];
  for (const entry of entries) {
    const fields: [number, string[]][] = [
      [WEIGHTS.name, pieces(entry.name).map((p) => p.stem)],
      [WEIGHTS.location, pieces(entry.location).map((p) => p.stem)],
      [WEIGHTS.date, pieces(entry.date).map((p) => p.stem)],
      [WEIGHTS.notes, pieces(entry.notes).map((p) => p.stem)],
    ];
    let total = 0;
    let ok = true;
    for (const word of query) {
      let best = 0;
      for (const [weight, stems] of fields) {
        for (const s of stems) {
          const v = strength(word, s) * weight;
          if (v > best) best = v;
        }
      }
      if (best === 0) { ok = false; break; }
      total += best;
    }
    if (ok) scored.push({ entry, score: total });
  }
  scored.sort((a, b) => b.score - a.score || byDate(a.entry, b.entry));
  return { results: scored.map((s) => s.entry), query };
}

// ---------- highlighting ----------

export type Segment = { text: string; hit: boolean };

// Cuts text into pieces, marking the words that matched the query.
export function highlight(text: string, query: Query | null): Segment[] {
  if (!query || !text) return [{ text, hit: false }];
  const words = pieces(text);
  const segs: Segment[] = [];
  let cursor = 0;
  for (const w of words) {
    if (!query.some((q) => strength(q, w.stem) > 0)) continue;
    if (w.start > cursor) segs.push({ text: text.slice(cursor, w.start), hit: false });
    segs.push({ text: text.slice(w.start, w.end), hit: true });
    cursor = w.end;
  }
  if (cursor < text.length) segs.push({ text: text.slice(cursor), hit: false });
  return segs.length ? segs : [{ text, hit: false }];
}
