import React, { useState } from "react";
import { Alert, Platform, Pressable, useWindowDimensions, View } from "react-native";
import { FONTS } from "./fonts";
import { INDENT } from "./styles";
import { Text, TextInput } from "./ui";
import { DateField } from "./DateField";
import { colors, styles } from "./styles";
import { Entry, today } from "./types";

type Props = { editing: Entry | null; onSave: (e: Omit<Entry, "id">, id?: string) => void; onCancel: () => void };
type Field = "name" | "location" | "notes";

const LABELS: Record<Field, string> = { name: "Nickname", location: "Where we met", notes: "Notes" };
const PLACEHOLDERS: Record<Field, string> = {
  name: "Name (if you remember it)",
  location: "Location",
  notes: "What they were like, what you talked about, anything else",
};

const notify = (msg: string) =>
  Platform.OS === "web" ? window.alert(msg) : Alert.alert("Missing info", msg);

const DATE_CHIP_WIDTH = 74; // date chip plus the gap beside the title
const MAX_TITLE_SIZE = 25;

export function LogScreen({ editing, onSave, onCancel }: Props) {
  // Size the title so it always fits on one line next to the date chip.
  const { width } = useWindowDimensions();
  const title = editing ? "Edit entry" : "New Character Entry";
  const room = Math.min(width, 640) - 40 - DATE_CHIP_WIDTH;
  const titleSize = Math.max(16, Math.min(MAX_TITLE_SIZE, room / (title.length * FONTS.lora.charWidth)));

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
  // Contact is always optional: it has no Skip button and never triggers the empty-field alert.
  const [contact, setContact] = useState(editing?.contact ?? "");
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
    if (!out("name") && !out("location") && !out("notes") && !contact.trim()) {
      return notify("Add at least one of Nickname, Where we met, Contact or Notes.");
    }
    onSave(
      { date, name: out("name"), location: out("location"), contact: contact.trim(), notes: out("notes") },
      editing?.id
    );
    if (!editing) {
      setDate(today());
      setContact("");
      setValues({ name: "", location: "", notes: "" });
      setSkipped({ name: false, location: false, notes: false });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  // A labelled box with its Skip button.
  const field = (f: Field) => (
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
  );

  return (
    <>
      <View style={styles.headerRow}>
        <Text noScale numberOfLines={1} style={[styles.title, { marginBottom: 0, fontSize: titleSize, flexShrink: 1, marginRight: 8 }]}>
          {title}
        </Text>
        <DateField value={date} onChange={setDate} />
      </View>
      {saved && <Text style={[styles.link, { fontWeight: "600" }]}>Saved ✓</Text>}
      {field("name")}
      {field("location")}
      {field("notes")}
      <View style={styles.labelRow}>
        <Text style={styles.label}>Contact</Text>
      </View>
      <TextInput
        style={styles.input}
        value={contact}
        onChangeText={setContact}
        placeholder="Phone, email, social handle..."
        placeholderTextColor={colors.placeholder}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Pressable style={[styles.btn, { marginHorizontal: INDENT }]} onPress={submit}>
        <Text style={styles.btnText}>{editing ? "Save changes" : "Save"}</Text>
      </Pressable>
      {editing && (
        <Pressable style={[styles.btn2, { marginHorizontal: INDENT }]} onPress={onCancel}><Text style={styles.btn2Text}>Cancel</Text></Pressable>
      )}
    </>
  );
}
