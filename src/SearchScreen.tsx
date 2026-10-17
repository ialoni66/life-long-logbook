import React, { useState } from "react";
import { Platform, Pressable, Share, Text, TextInput } from "react-native";
import { EntryCard } from "./EntryCard";
import { parseBackup } from "./storage";
import { colors, styles } from "./styles";
import { Data, Entry, today } from "./types";

type Props = {
  data: Data;
  onEdit: (e: Entry) => void;
  onDelete: (id: string) => void;
  onImport: (d: Data) => void;
};

// Every word typed must match somewhere in who / where / when / notes.
export function search(entries: Entry[], q: string) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  return entries
    .filter((e) => {
      const hay = `${e.name} ${e.location} ${e.date} ${e.notes}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function SearchScreen({ data, onEdit, onDelete, onImport }: Props) {
  const [q, setQ] = useState("");
  const results = search(data.entries, q);

  const exportData = async () => {
    const json = JSON.stringify(data, null, 2);
    if (Platform.OS === "web") {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
      a.download = `logbook-${today()}.json`;
      a.click();
    } else {
      await Share.share({ message: json });
    }
  };

  const importWeb = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "application/json";
    input.onchange = async () => {
      const f = input.files?.[0]; if (!f) return;
      try { onImport(parseBackup(await f.text())); } catch { window.alert("Not a valid backup file."); }
    };
    input.click();
  };

  return (
    <>
      <Text style={styles.title}>Search</Text>
      <TextInput
        style={styles.input} value={q} onChangeText={setQ}
        placeholder="Search by location, name, date or notes"
        placeholderTextColor={colors.placeholder}
      />
      <Text style={styles.label}>{results.length} {results.length === 1 ? "entry" : "entries"}</Text>
      {results.length === 0 && <Text style={styles.empty}>{data.entries.length ? "No matches." : 'Nothing logged yet. Tap "+ Log".'}</Text>}
      {results.map((e) => <EntryCard key={e.id} entry={e} onEdit={onEdit} onDelete={onDelete} />)}
      <Text style={[styles.label, { marginTop: 16 }]}>Backup (data stays on this device)</Text>
      <Pressable style={styles.btn2} onPress={exportData}><Text style={styles.btn2Text}>Export backup</Text></Pressable>
      {Platform.OS === "web" && (
        <Pressable style={styles.btn2} onPress={importWeb}><Text style={styles.btn2Text}>Import backup</Text></Pressable>
      )}
    </>
  );
}
