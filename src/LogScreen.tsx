import React, { useState } from "react";
import { Alert, Platform, Pressable, Text, TextInput, View } from "react-native";
import { DateField } from "./DateField";
import { colors, styles } from "./styles";
import { Entry, today } from "./types";

type Props = { editing: Entry | null; onSave: (e: Omit<Entry, "id">, id?: string) => void; onCancel: () => void };
type Field = "name" | "location" | "notes";

const LABELS: Record<Field, string> = { name: "Who", location: "Where", notes: "Notes" };
const PLACEHOLDERS: Record<Field, string> = {
  name: "Name (if you remember it)",
  location: "Location",
  notes: "What they were like, what you talked about, anything else",
};

const notify = (msg: string) =>
  Platform.OS === "web" ? window.alert(msg) : Alert.alert("Missing info", msg);

export function LogScreen({ editing, onSave, onCancel }: Props) {
  const [date, setDate] = useState(editing?.date ?? today());
  const [values, setValues] = useState<Record<Field, string>>({
    name: editing?.name ?? "",
    location: editing?.location ?? "",
    notes: editing?.notes ?? "",
  });
  // When editing, fields that were saved empty start out as skipped.
  const [skipped, setSkipped] = useState<Record<Field, boolean>>({
    name: !!editing && !editing.name,
    location: !!editing && !editing.location,
    notes: !!editing && !editing.notes,
  });
  const [saved, setSaved] = useState(false);

  const set = (f: Field, v: string) => setValues((p) => ({ ...p, [f]: v }));
  const toggleSkip = (f: Field) => setSkipped((p) => ({ ...p, [f]: !p[f] }));

  const submit = () => {
    const fields = Object.keys(LABELS) as Field[];
    const empty = fields.filter((f) => !skipped[f] && !values[f].trim());
    if (empty.length) {
      // Nothing is cleared: the user keeps everything typed so far.
      return notify(
        `Please fill in ${empty.map((f) => LABELS[f]).join(", ")}, or tap Skip if you have nothing to add.`
      );
    }
    const out = (f: Field) => (skipped[f] ? "" : values[f].trim());
    if (!out("name") && !out("location") && !out("notes")) {
      return notify("Add at least one of Who, Where or Notes.");
    }
    onSave({ date, name: out("name"), location: out("location"), notes: out("notes") }, editing?.id);
    if (!editing) {
      setDate(today());
      setValues({ name: "", location: "", notes: "" });
      setSkipped({ name: false, location: false, notes: false });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <>
      <Text style={styles.title}>{editing ? "Edit entry" : "Log a meeting"}</Text>
      {saved && <Text style={[styles.link, { fontWeight: "600" }]}>Saved ✓</Text>}
      <Text style={styles.label}>When</Text>
      <DateField value={date} onChange={setDate} />
      {(Object.keys(LABELS) as Field[]).map((f) => (
        <React.Fragment key={f}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{LABELS[f]}</Text>
            <Pressable onPress={() => toggleSkip(f)} hitSlop={10}>
              <Text style={styles.skip}>{skipped[f] ? "Undo skip" : "Skip"}</Text>
            </Pressable>
          </View>
          <TextInput
            style={[styles.input, f === "notes" && styles.multi, skipped[f] && styles.inputOff]}
            value={values[f]}
            onChangeText={(v) => set(f, v)}
            placeholder={skipped[f] ? "Skipped" : PLACEHOLDERS[f]}
            placeholderTextColor={colors.placeholder}
            multiline={f === "notes"}
            editable={!skipped[f]}
          />
        </React.Fragment>
      ))}
      <Pressable style={styles.btn} onPress={submit}>
        <Text style={styles.btnText}>{editing ? "Save changes" : "Save"}</Text>
      </Pressable>
      {editing && (
        <Pressable style={styles.btn2} onPress={onCancel}><Text style={styles.btn2Text}>Cancel</Text></Pressable>
      )}
    </>
  );
}
