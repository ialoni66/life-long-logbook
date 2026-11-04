import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Text, TextInput } from "./ui";
import { EntryCard } from "./EntryCard";
import { searchEntries } from "./searchEngine";
import { colors, styles } from "./styles";
import { Data, Entry } from "./types";

type Props = {
  data: Data;
  onEdit: (e: Entry) => void;
  onDelete: (id: string) => void;
  onOpenSettings: () => void;
};

export function SearchScreen({ data, onEdit, onDelete, onOpenSettings }: Props) {
  const [q, setQ] = useState("");
  // Matching, ranking and typo/synonym handling live in searchEngine.ts.
  const { results, query } = searchEntries(data.entries, q);

  return (
    <>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { marginBottom: 0 }]}>Search</Text>
        <Pressable onPress={onOpenSettings} hitSlop={10} accessibilityLabel="Settings">
          <Text style={styles.gear}>⚙</Text>
        </Pressable>
      </View>
      <TextInput
        style={[styles.input, styles.searchBox]} value={q} onChangeText={setQ}
        placeholder="Search nickname, place, date, contact or notes"
        placeholderTextColor={colors.placeholder}
      />
      <Text style={styles.label}>{results.length} {results.length === 1 ? "entry" : "entries"}</Text>
      {results.length === 0 && <Text style={styles.empty}>{data.entries.length ? "No matches." : 'Nothing logged yet. Tap "+ Log".'}</Text>}
      {results.map((e) => <EntryCard key={e.id} entry={e} query={query} onEdit={onEdit} onDelete={onDelete} />)}
    </>
  );
}
