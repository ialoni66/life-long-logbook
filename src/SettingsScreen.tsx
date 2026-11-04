import React, { useEffect, useState } from "react";
import { Alert, Platform, Pressable, View } from "react-native";
import { pickBackupText, saveBackupFile } from "./backup";
import { FONT_KEYS, FONTS, FontKey } from "./fonts";
import { parseBackupText, planImport } from "./importer";
import { DateFormat, FORMAT_LABELS, formatDate, Settings } from "./settings";
import { loadSafety, Safety, saveSafety } from "./storage";
import { colors, styles } from "./styles";
import { Data, Entry, today } from "./types";
import { Text } from "./ui";

type Props = {
  settings: Settings;
  onChange: (s: Settings) => void;
  onBack: () => void;
  data: Data;
  // Replaces all entries. Rejects if the new entries could not be stored.
  onReplaceData: (d: Data) => Promise<void>;
};

type Status = { kind: "ok" | "error" | "info"; text: string } | null;
type Review = { entries: Entry[]; invalid: number; fresh: Entry[]; alreadyHere: number };

const ERROR_COLOR = "#ff9b9b";
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const when = (iso: string) => new Date(iso).toLocaleString();

export function SettingsScreen({ settings, onChange, onBack, data, onReplaceData }: Props) {
  const [status, setStatus] = useState<Status>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [busy, setBusy] = useState(false);
  const [safety, setSafety] = useState<Safety | null>(null);

  useEffect(() => { loadSafety().then(setSafety); }, []);

  // ---- Save file
  const saveFile = async () => {
    setReview(null);
    if (data.entries.length === 0) {
      return setStatus({ kind: "info", text: "You have no entries yet, so there is nothing to save." });
    }
    try {
      const result = await saveBackupFile(data);
      if (result === "cancelled") return setStatus(null);
      onChange({ ...settings, lastSaved: today() });
      setStatus({
        kind: "ok",
        text:
          result === "shared"
            ? "Choose “Save to Files” in the sheet that opened to keep your file."
            : result === "text"
            ? "Your entries were shared as text."
            : "Your file was saved to your downloads.",
      });
    } catch {
      setStatus({ kind: "error", text: "The file couldn't be created. Your entries are unchanged." });
    }
  };

  // ---- Import data
  const importData = async () => {
    setStatus(null);
    setConfirmReplace(false);
    if (Platform.OS !== "web") {
      return Alert.alert("Import isn't available in this build yet.");
    }
    try {
      const text = await pickBackupText();
      if (text === null) return; // nothing chosen
      const parsed = parseBackupText(text);
      const plan = planImport(data.entries, parsed.entries);
      // Nothing is changed yet: the user reviews first.
      setReview({ entries: parsed.entries, invalid: parsed.invalid, fresh: plan.fresh, alreadyHere: plan.alreadyHere });
    } catch (e: any) {
      setReview(null);
      setStatus({ kind: "error", text: e?.message ?? "That file couldn't be imported. Nothing was changed." });
    }
  };

  // Keeps a safety copy first. If that fails, nothing is changed.
  const apply = async (next: Entry[], done: string) => {
    setBusy(true);
    try {
      const copy: Safety = { savedAt: new Date().toISOString(), reason: "import", data };
      try {
        await saveSafety(copy);
      } catch {
        setStatus({ kind: "error", text: "A safety copy couldn't be saved, so nothing was changed." });
        return;
      }
      try {
        await onReplaceData({ entries: next });
      } catch {
        setStatus({ kind: "error", text: "Your entries couldn't be stored, so nothing was changed." });
        return;
      }
      setSafety(copy);
      setReview(null);
      setConfirmReplace(false);
      setStatus({ kind: "ok", text: done });
    } finally {
      setBusy(false);
    }
  };

  const addNew = () => {
    if (!review) return;
    apply([...data.entries, ...review.fresh], `Added ${plural(review.fresh.length, "new entry", "new entries")}. Your previous entries are kept as a safety copy.`);
  };
  const replaceAll = () => {
    if (!review) return;
    apply(review.entries, `Replaced your entries with the ${plural(review.entries.length, "entry", "entries")} from the file. Your previous entries are kept as a safety copy.`);
  };

  // Swaps your entries with the safety copy, keeping the current ones so it can be reversed.
  const undo = async () => {
    if (!safety) return;
    setBusy(true);
    try {
      const swap: Safety = { savedAt: new Date().toISOString(), reason: safety.reason === "import" ? "undo" : "import", data };
      try {
        await saveSafety(swap);
        await onReplaceData(safety.data);
      } catch {
        setStatus({ kind: "error", text: "That couldn't be done, so nothing was changed." });
        return;
      }
      setSafety(swap);
      setReview(null);
      setStatus({
        kind: "ok",
        text: safety.reason === "import" ? "Your entries are back to how they were before the import." : "The import was applied again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const statusColor = status?.kind === "error" ? ERROR_COLOR : status?.kind === "ok" ? colors.acc : colors.mut;

  return (
    <>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { marginBottom: 0 }]}>Settings</Text>
        <Pressable onPress={onBack} hitSlop={10}><Text style={styles.skip}>Done</Text></Pressable>
      </View>

      <Text style={styles.label}>Your data</Text>
      <Text style={[styles.cardSub, { marginTop: 0, marginBottom: 12 }]}>
        Your entries are stored only on this phone. Save a file to keep a copy you can import later.
      </Text>
      <Pressable style={[styles.btn2, busy && { opacity: 0.5 }]} disabled={busy} onPress={saveFile}>
        <Text style={styles.btn2Text}>Save file</Text>
      </Pressable>
      <Pressable style={[styles.btn2, busy && { opacity: 0.5 }]} disabled={busy} onPress={importData}>
        <Text style={styles.btn2Text}>Import data</Text>
      </Pressable>
      <Text style={[styles.cardSub, { marginTop: 0, marginBottom: 12 }]}>
        {settings.lastSaved
          ? `Last file saved: ${formatDate(settings.lastSaved, settings.dateFormat)}`
          : "You haven't saved a file yet."}
      </Text>

      {status && (
        <Text style={[styles.cardSub, { marginTop: 0, marginBottom: 12, color: statusColor }]}>{status.text}</Text>
      )}

      {review && (
        <View style={[styles.card, { marginBottom: 14 }]}>
          <Text style={styles.cardName}>Review before importing</Text>
          <Text style={styles.cardText}>
            The file has {plural(review.entries.length, "entry", "entries")}.{" "}
            {plural(review.fresh.length, "is new", "are new")}, and {review.alreadyHere} {review.alreadyHere === 1 ? "is" : "are"} already in your Rolodex.
          </Text>
          {review.invalid > 0 && (
            <Text style={styles.cardSub}>
              {plural(review.invalid, "item in the file couldn't be read and will be skipped", "items in the file couldn't be read and will be skipped")}.
            </Text>
          )}
          <Text style={styles.cardSub}>Nothing has been changed yet.</Text>

          {!confirmReplace && (
            <View style={{ marginTop: 14 }}>
              {review.fresh.length > 0 ? (
                <Pressable style={[styles.btn, { marginHorizontal: 0 }, busy && { opacity: 0.5 }]} disabled={busy} onPress={addNew}>
                  <Text style={styles.btnText}>Add {plural(review.fresh.length, "new entry", "new entries")}</Text>
                </Pressable>
              ) : (
                <Text style={[styles.cardText, { marginBottom: 10 }]}>
                  There's nothing new to add. Everything in this file is already in your Rolodex.
                </Text>
              )}
              {data.entries.length > 0 && (
                <Pressable style={[styles.btn2, { marginHorizontal: 0 }]} disabled={busy} onPress={() => setConfirmReplace(true)}>
                  <Text style={styles.btn2Text}>Replace everything with this file…</Text>
                </Pressable>
              )}
              <Pressable style={[styles.btn2, { marginHorizontal: 0, marginBottom: 0 }]} disabled={busy} onPress={() => setReview(null)}>
                <Text style={styles.btn2Text}>Cancel</Text>
              </Pressable>
            </View>
          )}

          {confirmReplace && (
            <View style={{ marginTop: 14 }}>
              <Text style={[styles.cardText, { color: ERROR_COLOR, marginTop: 0, marginBottom: 12 }]}>
                This swaps your {plural(data.entries.length, "entry", "entries")} for the {plural(review.entries.length, "entry", "entries")} in the file.
                Anything not in the file is removed from the app. A safety copy is kept, so you can undo it.
              </Text>
              <Pressable style={[styles.btn, { marginHorizontal: 0 }, busy && { opacity: 0.5 }]} disabled={busy} onPress={replaceAll}>
                <Text style={styles.btnText}>Yes, replace everything</Text>
              </Pressable>
              <Pressable style={[styles.btn2, { marginHorizontal: 0, marginBottom: 0 }]} disabled={busy} onPress={() => setConfirmReplace(false)}>
                <Text style={styles.btn2Text}>Go back</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {safety && (
        <>
          <Pressable style={[styles.btn2, busy && { opacity: 0.5 }]} disabled={busy} onPress={undo}>
            <Text style={styles.btn2Text}>{safety.reason === "import" ? "Undo last import" : "Redo the import"}</Text>
          </Pressable>
          <Text style={[styles.cardSub, { marginTop: 0, marginBottom: 12 }]}>
            Safety copy from {when(safety.savedAt)} ({plural(safety.data.entries.length, "entry", "entries")}). Switching never loses the other version.
          </Text>
        </>
      )}

      <Text style={[styles.label, { marginTop: 14 }]}>Date format</Text>
      {(Object.keys(FORMAT_LABELS) as DateFormat[]).map((f) => (
        <Pressable
          key={f}
          style={[styles.option, settings.dateFormat === f && styles.optionOn]}
          onPress={() => onChange({ ...settings, dateFormat: f })}
        >
          <Text style={styles.cardName}>{FORMAT_LABELS[f]}</Text>
          <Text style={styles.cardSub}>
            {settings.dateFormat === f ? "✓  " : ""}{formatDate(today(), f)}
          </Text>
        </Pressable>
      ))}

      <Text style={[styles.label, { marginTop: 14 }]}>Font for your entries</Text>
      <Text style={[styles.cardSub, { marginTop: 0, marginBottom: 12 }]}>
        Applies to what you write and the entries you save. Titles and labels always use Lora.
      </Text>
      {FONT_KEYS.map((k: FontKey) => (
        <Pressable
          key={k}
          style={[styles.option, settings.font === k && styles.optionOn]}
          onPress={() => onChange({ ...settings, font: k })}
        >
          <View style={{ flex: 1 }}>
            <Text kind="entry" fontKey={k} style={styles.cardName}>{FONTS[k].label}</Text>
            <Text kind="entry" fontKey={k} style={styles.cardSub}>Dana, met at the cafe. Has 3 kids.</Text>
          </View>
          <Text style={styles.cardSub}>{settings.font === k ? "✓" : ""}</Text>
        </Pressable>
      ))}
    </>
  );
}
