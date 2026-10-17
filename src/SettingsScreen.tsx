import React from "react";
import { Pressable, View } from "react-native";
import { FONT_KEYS, FONTS, FontKey } from "./fonts";
import { DateFormat, FORMAT_LABELS, formatDate, Settings } from "./settings";
import { styles } from "./styles";
import { today } from "./types";
import { Text } from "./ui";

type Props = {
  settings: Settings;
  onChange: (s: Settings) => void;
  onBack: () => void;
};

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

      <Text style={[styles.label, { marginTop: 14 }]}>Font for your entries</Text>
      <Text style={[styles.cardSub, { marginTop: 0, marginBottom: 12 }]}>
        Applies to what you write and the entries you save. Titles and labels always use Lora.
      </Text>
      {FONT_KEYS.map((k: FontKey) => (
        <Pressable
          key={k}
          style={[styles.option, settings.font === k && styles.optionOn]}
          onPress={() => onChange({ ...settings, font: k })}
        >
          <View style={{ flex: 1 }}>
            <Text kind="entry" fontKey={k} style={styles.cardName}>{FONTS[k].label}</Text>
            <Text kind="entry" fontKey={k} style={styles.cardSub}>Dana, met at the cafe. Has 3 kids.</Text>
          </View>
          <Text style={styles.cardSub}>{settings.font === k ? "✓" : ""}</Text>
        </Pressable>
      ))}
    </>
  );
}
