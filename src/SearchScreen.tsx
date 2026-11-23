import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Text, TextInput } from "./ui";
import { EntryCard } from "./EntryCard";
import { searchEntries } from "./searchEngine";
import { colors, styles } from "./styles";
import { Data, Entry } from "./types";
import { useT } from "./i18n";

type Props = {
  data: Data;
  onEdit: (e: Entry) => void;
  onDelete: (id: string) => void;
  onOpenSettings: () => void;
};

export function SearchScreen({ data, onEdit, onDelete, onOpenSettings }: Props) {
  const t = useT();
  const [q, setQ] = useState("");
  // Matching, ranking and typo/synonym handling live in searchEngine.ts.
  const { results, query } = searchEntries(data.entries, q);

  return (
    <>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { marginBottom: 0 }]}>{t.searchTitle}</Text>
        <Pressable onPress={onOpenSettings} hitSlop={10} accessibilityLabel={t.settingsA11y}>
          <Text style={styles.gear}>⚙</Text>
        </Pressable>
      </View>
      <TextInput
        style={[styles.input, styles.searchBox]} value={q} onChangeText={setQ}
        placeholder={t.searchPh}
        placeholderTextColor={colors.placeholder}
      />
      <Text style={styles.label}>{t.entries(results.length)}</Text>
      {results.length === 0 && <Text style={styles.empty}>{data.entries.length ? t.noMatches : t.nothingYet}</Text>}
      {results.map((e) => <EntryCard key={e.id} entry={e} query={query} onEdit={onEdit} onDelete={onDelete} />)}
    </>
  );
}
