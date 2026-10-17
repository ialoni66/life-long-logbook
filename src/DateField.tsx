import React, { useState } from "react";
import { Platform, Pressable, Text } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, styles } from "./styles";
import { ymd } from "./types";

type Props = { value: string; onChange: (v: string) => void };

// Small date chip meant to sit in a screen header.
export function DateField({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  if (Platform.OS === "web") {
    return React.createElement("input", {
      type: "date",
      value,
      onChange: (e: any) => e.target.value && onChange(e.target.value),
      style: {
        padding: "6px 8px",
        fontSize: 14,
        borderRadius: 10,
        border: "1px solid #e0cf6a",
        background: "#fff3a8",
        color: "#1b1f2a",
        colorScheme: "light",
      },
    });
  }

  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);

  // iPhone: the system's compact date chip opens its own calendar popover.
  if (Platform.OS === "ios") {
    return (
      <DateTimePicker
        value={date}
        mode="date"
        display="compact"
        accentColor={colors.acc}
        onChange={(_, picked) => picked && onChange(ymd(picked))}
      />
    );
  }

  return (
    <>
      <Pressable style={[styles.input, { marginBottom: 0, paddingVertical: 6 }]} onPress={() => setOpen(true)}>
        <Text style={{ color: colors.inputFg }}>{value}</Text>
      </Pressable>
      {open && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(_, picked) => {
            setOpen(false);
            if (picked) onChange(ymd(picked));
          }}
        />
      )}
    </>
  );
}
