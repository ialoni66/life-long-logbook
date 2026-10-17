import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { highlight, Query } from "./searchEngine";
import { formatDate, useSettings } from "./settings";
import { colors, styles } from "./styles";
import { Entry } from "./types";

type Props = {
  entry: Entry;
  query?: Query | null; // when searching, matched words are highlighted
  onEdit: (e: Entry) => void;
  onDelete: (id: string) => void;
};

// Plain text with the words that matched the search marked.
function Marked({ text, query }: { text: string; query?: Query | null }) {
  return (
    <>
      {highlight(text, query ?? null).map((s, i) =>
        s.hit ? <Text key={i} style={local.hit}>{s.text}</Text> : <React.Fragment key={i}>{s.text}</React.Fragment>
      )}
    </>
  );
}

export function EntryCard({ entry, query, onEdit, onDelete }: Props) {
  const { dateFormat } = useSettings();
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardName}>
          {entry.name ? <Marked text={entry.name} query={query} /> : "(no name)"}
        </Text>
        <Text style={styles.cardDate}>{formatDate(entry.date, dateFormat)}</Text>
      </View>
      {!!entry.location && (
        <Text style={styles.cardSub}>📍 <Marked text={entry.location} query={query} /></Text>
      )}
      {!!entry.contact && (
        <Text style={styles.cardSub}>📞 <Marked text={entry.contact} query={query} /></Text>
      )}
      {!!entry.notes && (
        <Text style={styles.cardText}><Marked text={entry.notes} query={query} /></Text>
      )}
      <View style={[styles.cardTop, { marginTop: 8 }]}>
        <Pressable onPress={() => onEdit(entry)}><Text style={styles.link}>Edit</Text></Pressable>
        <Pressable onPress={() => onDelete(entry.id)}><Text style={styles.cardSub}>Delete</Text></Pressable>
      </View>
    </View>
  );
}

const local = StyleSheet.create({
  hit: { backgroundColor: colors.inputBg, color: colors.inputFg },
});
