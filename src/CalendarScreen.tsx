import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./ui";
import { EntryCard } from "./EntryCard";
import { formatDate, useSettings } from "./settings";
import { colors, styles } from "./styles";
import { Data, Entry, today, ymd } from "./types";

type Props = { data: Data; onEdit: (e: Entry) => void; onDelete: (id: string) => void };

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarScreen({ data, onEdit, onDelete }: Props) {
  const { dateFormat } = useSettings();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState(today());

  const counts: Record<string, number> = {};
  for (const e of data.entries) counts[e.date] = (counts[e.date] ?? 0) + 1;

  const first = new Date(year, month, 1);
  const total = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array(first.getDay()).fill(null),
    ...Array.from({ length: total }, (_, i) => ymd(new Date(year, month, i + 1))),
  ];
  while (cells.length % 7) cells.push(null);

  const shift = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear()); setMonth(d.getMonth());
  };

  const dayEntries = data.entries.filter((e) => e.date === selected);

  return (
    <>
      <View style={cal.header}>
        <Pressable onPress={() => shift(-1)}><Text style={cal.arrow}>‹</Text></Pressable>
        <Text style={styles.title}>
          {first.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </Text>
        <Pressable onPress={() => shift(1)}><Text style={cal.arrow}>›</Text></Pressable>
      </View>
      <View style={cal.row}>
        {DAYS.map((d) => <Text key={d} style={cal.dow}>{d}</Text>)}
      </View>
      <View style={cal.grid}>
        {cells.map((c, i) => (
          <Pressable key={i} style={cal.cell} disabled={!c} onPress={() => c && setSelected(c)}>
            {c && (
              <View style={[cal.day, c === selected && cal.daySel, c === today() && cal.dayToday]}>
                <Text style={[cal.dayText, c === selected && { color: "#fff" }]}>{Number(c.slice(8))}</Text>
                {counts[c] ? <View style={[cal.dot, c === selected && { backgroundColor: "#fff" }]} /> : null}
              </View>
            )}
          </Pressable>
        ))}
      </View>
      <Text style={[styles.label, { marginTop: 14 }]}>{formatDate(selected, dateFormat)}</Text>
      {dayEntries.length === 0 && <Text style={styles.empty}>Nothing logged this day.</Text>}
      {dayEntries.map((e) => <EntryCard key={e.id} entry={e} onEdit={onEdit} onDelete={onDelete} />)}
    </>
  );
}

const cal = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  arrow: { fontSize: 32, color: colors.acc, paddingHorizontal: 12 },
  row: { flexDirection: "row" },
  dow: { flex: 1, textAlign: "center", color: colors.mut, fontSize: 12, marginBottom: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
  day: { flex: 1, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: colors.card },
  daySel: { backgroundColor: colors.acc },
  dayToday: { borderWidth: 1, borderColor: colors.acc },
  dayText: { color: colors.fg },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.acc, marginTop: 3 },
});
