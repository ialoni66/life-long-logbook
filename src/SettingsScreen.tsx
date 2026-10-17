import React from "react";
import { Pressable, Text, View } from "react-native";
import { DateFormat, FORMAT_LABELS, formatDate, Settings } from "./settings";
import { styles } from "./styles";
import { today } from "./types";

type Props = { settings: Settings; onChange: (s: Settings) => void; onBack: () => void };

export function SettingsScreen({ settings, onChange, onBack }: Props) {
  return (
    <>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { marginBottom: 0 }]}>Settings</Text>
        <Pressable onPress={onBack} hitSlop={10}><Text style={styles.skip}>Done</Text></Pressable>
      </View>
      <Text style={styles.label}>Date format</Text>
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
    </>
  );
}
