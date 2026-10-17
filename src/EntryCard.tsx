import React from "react";
import { Pressable, Text, View } from "react-native";
import { formatDate, useSettings } from "./settings";
import { styles } from "./styles";
import { Entry } from "./types";

type Props = { entry: Entry; onEdit: (e: Entry) => void; onDelete: (id: string) => void };

export function EntryCard({ entry, onEdit, onDelete }: Props) {
  const { dateFormat } = useSettings();
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardName}>{entry.name || "(no name)"}</Text>
        <Text style={styles.cardDate}>{formatDate(entry.date, dateFormat)}</Text>
      </View>
      {!!entry.location && <Text style={styles.cardSub}>📍 {entry.location}</Text>}
      {!!entry.notes && <Text style={styles.cardText}>{entry.notes}</Text>}
      <View style={[styles.cardTop, { marginTop: 8 }]}>
        <Pressable onPress={() => onEdit(entry)}><Text style={styles.link}>Edit</Text></Pressable>
        <Pressable onPress={() => onDelete(entry.id)}><Text style={styles.cardSub}>Delete</Text></Pressable>
      </View>
    </View>
  );
}
