import React, { useState } from "react";
import { Platform, Pressable, Share, View } from "react-native";
import { Text, TextInput } from "./ui";
import { EntryCard } from "./EntryCard";
import { searchEntries } from "./searchEngine";
import { parseBackup } from "./storage";
import { colors, styles } from "./styles";
import { Data, Entry, today } from "./types";

type Props = {
  data: Data;
  onEdit: (e: Entry) => void;
  onDelete: (id: string) => void;
  onImport: (d: Data) => void;
  onOpenSettings: () => void;
};

export function SearchScreen({ data, onEdit, onDelete, onImport, onOpenSettings }: Props) {
  const [q, setQ] = useState("");
  // Matching, ranking and typo/synonym handling live in searchEngine.ts.
  const { results, query } = searchEntries(data.entries, q);

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
      <View style={styles.headerRow}>
        <Text style={[styles.title, { marginBottom: 0 }]}>Search</Text>
        <Pressable onPress={onOpenSettings} hitSlop={10} accessibilityLabel="Settings">
          <Text style={styles.gear}>⚙</Text>
        </Pressable>
      </View>
      <TextInput
        style={styles.input} value={q} onChangeText={setQ}
        placeholder="Search nickname, place, date, contact or notes"
        placeholderTextColor={colors.placeholder}
      />
      <Text style={styles.label}>{results.length} {results.length === 1 ? "entry" : "entries"}</Text>
      {results.length === 0 && <Text style={styles.empty}>{data.entries.length ? "No matches." : 'Nothing logged yet. Tap "+ Log".'}</Text>}
      {results.map((e) => <EntryCard key={e.id} entry={e} query={query} onEdit={onEdit} onDelete={onDelete} />)}
      <Text style={[styles.label, { marginTop: 16 }]}>Backup (data stays on this device)</Text>
      <Pressable style={styles.btn2} onPress={exportData}><Text style={styles.btn2Text}>Export backup</Text></Pressable>
      {Platform.OS === "web" && (
        <Pressable style={styles.btn2} onPress={importWeb}><Text style={styles.btn2Text}>Import backup</Text></Pressable>
      )}
    </>
  );
}
