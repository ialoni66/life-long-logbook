import React, { useEffect, useState } from "react";
import { Alert, Platform, Pressable, View } from "react-native";
import { pickBackupText, saveBackupFile } from "./backup";
import { FONT_KEYS, FONTS, FontKey, loadFont } from "./fonts";
import { ImportProblem, parseBackupText, planImport } from "./importer";
import { useT } from "./i18n";
import { LANG_NAMES, LANGS } from "./lang";
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

export function SettingsScreen({ settings, onChange, onBack, data, onReplaceData }: Props) {
  const t = useT();
  const when = (iso: string) => new Date(iso).toLocaleString(t.locale);
  const [status, setStatus] = useState<Status>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [busy, setBusy] = useState(false);
  const [safety, setSafety] = useState<Safety | null>(null);

  useEffect(() => { loadSafety().then(setSafety); }, []);
  // The font previews need every font, so they are fetched only now, not when the app starts.
  useEffect(() => { FONT_KEYS.forEach((k) => loadFont(k)); }, []);

  // ---- Save file
  const saveFile = async () => {
    setReview(null);
    if (data.entries.length === 0) {
      return setStatus({ kind: "info", text: t.noEntriesToSave });
    }
    try {
      const result = await saveBackupFile(data);
      if (result === "cancelled") return setStatus(null);
      onChange({ ...settings, lastSaved: today() });
      setStatus({
        kind: "ok",
        text:
          result === "shared"
            ? t.savedShared
            : result === "text"
            ? t.savedText
            : t.savedDownloads,
      });
    } catch {
      setStatus({ kind: "error", text: t.saveFail });
    }
  };

  // ---- Import data
  const importData = async () => {
    setStatus(null);
    setConfirmReplace(false);
    if (Platform.OS !== "web") {
      return Alert.alert(t.importUnavailable);
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
      const text = e instanceof ImportProblem
        ? { unreadable: t.importUnreadable, notRolodex: t.importNotRolodex, empty: t.importEmpty, noneReadable: t.importNoneReadable }[e.code]
        : t.importFailed;
      setStatus({ kind: "error", text });
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
        setStatus({ kind: "error", text: t.safetyFail });
        return;
      }
      try {
        await onReplaceData({ entries: next });
      } catch {
        setStatus({ kind: "error", text: t.storeFail });
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
    apply([...data.entries, ...review.fresh], t.addedDone(review.fresh.length));
  };
  const replaceAll = () => {
    if (!review) return;
    apply(review.entries, t.replacedDone(review.entries.length));
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
        setStatus({ kind: "error", text: t.undoFail });
        return;
      }
      setSafety(swap);
      setReview(null);
      setStatus({
        kind: "ok",
        text: safety.reason === "import" ? t.undone : t.redone,
      });
    } finally {
      setBusy(false);
    }
  };

  const statusColor = status?.kind === "error" ? ERROR_COLOR : status?.kind === "ok" ? colors.acc : colors.mut;

  return (
    <>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { marginBottom: 0 }]}>{t.settings}</Text>
        <Pressable onPress={onBack} hitSlop={10}><Text style={styles.skip}>{t.done}</Text></Pressable>
      </View>

      <Text style={styles.label}>{t.yourData}</Text>
      <Text style={[styles.cardSub, { marginTop: 0, marginBottom: 12 }]}>
        {t.dataNote}
      </Text>
      <Pressable style={[styles.btn2, busy && { opacity: 0.5 }]} disabled={busy} onPress={saveFile}>
        <Text style={styles.btn2Text}>{t.saveFile}</Text>
      </Pressable>
      <Pressable style={[styles.btn2, busy && { opacity: 0.5 }]} disabled={busy} onPress={importData}>
        <Text style={styles.btn2Text}>{t.importData}</Text>
      </Pressable>
      <Text style={[styles.cardSub, { marginTop: 0, marginBottom: 12 }]}>
        {settings.lastSaved
          ? t.lastSaved(formatDate(settings.lastSaved, settings.dateFormat))
          : t.neverSaved}
      </Text>

      {status && (
        <Text style={[styles.cardSub, { marginTop: 0, marginBottom: 12, color: statusColor }]}>{status.text}</Text>
      )}

      {review && (
        <View style={[styles.card, { marginBottom: 14 }]}>
          <Text style={styles.cardName}>{t.reviewTitle}</Text>
          <Text style={styles.cardText}>
            {t.fileHas(review.entries.length)} {t.newAndHere(review.fresh.length, review.alreadyHere)}
          </Text>
          {review.invalid > 0 && (
            <Text style={styles.cardSub}>
              {t.unreadable(review.invalid)}
            </Text>
          )}
          <Text style={styles.cardSub}>{t.nothingChanged}</Text>

          {!confirmReplace && (
            <View style={{ marginTop: 14 }}>
              {review.fresh.length > 0 ? (
                <Pressable style={[styles.btn, { marginHorizontal: 0 }, busy && { opacity: 0.5 }]} disabled={busy} onPress={addNew}>
                  <Text style={styles.btnText}>{t.addNew(review.fresh.length)}</Text>
                </Pressable>
              ) : (
                <Text style={[styles.cardText, { marginBottom: 10 }]}>
                  {t.nothingNew}
                </Text>
              )}
              {data.entries.length > 0 && (
                <Pressable style={[styles.btn2, { marginHorizontal: 0 }]} disabled={busy} onPress={() => setConfirmReplace(true)}>
                  <Text style={styles.btn2Text}>{t.replaceAll}</Text>
                </Pressable>
              )}
              <Pressable style={[styles.btn2, { marginHorizontal: 0, marginBottom: 0 }]} disabled={busy} onPress={() => setReview(null)}>
                <Text style={styles.btn2Text}>{t.cancel}</Text>
              </Pressable>
            </View>
          )}

          {confirmReplace && (
            <View style={{ marginTop: 14 }}>
              <Text style={[styles.cardText, { color: ERROR_COLOR, marginTop: 0, marginBottom: 12 }]}>
                {t.replaceWarn(data.entries.length, review.entries.length)}
              </Text>
              <Pressable style={[styles.btn, { marginHorizontal: 0 }, busy && { opacity: 0.5 }]} disabled={busy} onPress={replaceAll}>
                <Text style={styles.btnText}>{t.yesReplace}</Text>
              </Pressable>
              <Pressable style={[styles.btn2, { marginHorizontal: 0, marginBottom: 0 }]} disabled={busy} onPress={() => setConfirmReplace(false)}>
                <Text style={styles.btn2Text}>{t.goBack}</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {safety && (
        <>
          <Pressable style={[styles.btn2, busy && { opacity: 0.5 }]} disabled={busy} onPress={undo}>
            <Text style={styles.btn2Text}>{safety.reason === "import" ? t.undoImport : t.redoImport}</Text>
          </Pressable>
          <Text style={[styles.cardSub, { marginTop: 0, marginBottom: 12 }]}>
            {t.safetyCopy(when(safety.savedAt), safety.data.entries.length)}
          </Text>
        </>
      )}

      <Text style={[styles.label, { marginTop: 14 }]}>{t.language}</Text>
      {LANGS.map((l) => (
        <Pressable
          key={l}
          style={[styles.option, settings.language === l && styles.optionOn]}
          onPress={() => onChange({ ...settings, language: l })}
        >
          <Text style={styles.cardName}>{LANG_NAMES[l]}</Text>
          <Text style={styles.cardSub}>{settings.language === l ? "✓" : ""}</Text>
        </Pressable>
      ))}

      <Text style={[styles.label, { marginTop: 14 }]}>{t.dateFormat}</Text>
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

      <Text style={[styles.label, { marginTop: 14 }]}>{t.fontTitle}</Text>
      <Text style={[styles.cardSub, { marginTop: 0, marginBottom: 12 }]}>
        {t.fontNote}{t.fontHebrewNote ? ` ${t.fontHebrewNote}` : ""}
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
