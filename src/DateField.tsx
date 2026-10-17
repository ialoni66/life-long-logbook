import React, { useState } from "react";
import { Platform, Pressable, Text } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, styles } from "./styles";

type Props = { value: string; onChange: (v: string) => void };

const fmt = (d: Date) => {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

export function DateField({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  if (Platform.OS === "web") {
    return React.createElement("input", {
      type: "date",
      value,
      onChange: (e: any) => e.target.value && onChange(e.target.value),
      style: {
        padding: 10,
        fontSize: 16,
        borderRadius: 10,
        border: "1px solid #3f4860",
        background: "#2b3245",
        color: "#f4f6fb",
        colorScheme: "dark",
        marginBottom: 10,
      },
    });
  }

  const [y, m, d] = value.split("-").map(Number);
  return (
    <>
      <Pressable style={styles.input} onPress={() => setOpen(true)}>
        <Text style={{ color: colors.inputFg }}>{value}</Text>
      </Pressable>
      {open && (
        <DateTimePicker
          value={new Date(y, m - 1, d)}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(_, date) => {
            setOpen(Platform.OS === "ios");
            if (date) onChange(fmt(date));
          }}
        />
      )}
    </>
  );
}
