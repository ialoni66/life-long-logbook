import React, { useState } from "react";
import { Alert, Platform, Pressable, Text, TextInput } from "react-native";
import { DateField } from "./DateField";
import { styles } from "./styles";
import { Entry, today } from "./types";

type Props = { editing: Entry | null; onSave: (e: Omit<Entry, "id">, id?: string) => void; onCancel: () => void };

export function LogScreen({ editing, onSave, onCancel }: Props) {
  const [date, setDate] = useState(editing?.date ?? today());
  const [name, setName] = useState(editing?.name ?? "");
  const [location, setLocation] = useState(editing?.location ?? "");
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [saved, setSaved] = useState(false);

  const submit = () => {
    if (!name.trim() && !location.trim() && !notes.trim()) {
      const msg = "Add at least a name, a location or a note.";
      return Platform.OS === "web" ? window.alert(msg) : Alert.alert(msg);
    }
    onSave({ date, name: name.trim(), location: location.trim(), notes: notes.trim() }, editing?.id);
    if (!editing) {
      setDate(today()); setName(""); setLocation(""); setNotes("");
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
      <Text style={styles.label}>Who</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name (if you remember it)" />
      <Text style={styles.label}>Where</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Location" />
      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.multi]} multiline value={notes} onChangeText={setNotes}
        placeholder="What they were like, what you talked about, anything else"
      />
      <Pressable style={styles.btn} onPress={submit}><Text style={styles.btnText}>{editing ? "Save changes" : "Save"}</Text></Pressable>
      {editing && <Pressable style={styles.btn2} onPress={onCancel}><Text style={styles.btn2Text}>Cancel</Text></Pressable>}
    </>
  );
}
