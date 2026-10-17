import React, { useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatDate, useSettings } from "./settings";
import { colors, styles } from "./styles";
import { ymd } from "./types";

type Props = { value: string; onChange: (v: string) => void };

// Small date chip meant to sit in a screen header. It shows the date in the
// user's chosen format; the value itself is always YYYY-MM-DD.
export function DateField({ value, onChange }: Props) {
  const { dateFormat } = useSettings();
  const [open, setOpen] = useState(false);
  const label = formatDate(value, dateFormat);

  if (Platform.OS === "web") {
    // A transparent native date input sits on top of the chip, so a tap opens the
    // browser's picker while the chip shows our own format.
    return React.createElement(
      "div",
      {
        style: {
          position: "relative",
          background: "#fff3a8",
          color: "#1b1f2a",
          border: "1px solid #e0cf6a",
          borderRadius: 10,
          padding: "6px 10px",
          fontSize: 14,
          cursor: "pointer",
        },
      },
      label,
      React.createElement("input", {
        type: "date",
        value,
        onChange: (e: any) => e.target.value && onChange(e.target.value),
        onClick: (e: any) => { try { e.target.showPicker(); } catch {} },
        style: { position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" },
      })
    );
  }

  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const chip = (
    <Pressable style={[styles.input, { marginBottom: 0, paddingVertical: 6 }]} onPress={() => setOpen(true)}>
      <Text style={{ color: colors.inputFg }}>{label}</Text>
    </Pressable>
  );

  if (Platform.OS === "ios") {
    return (
      <>
        {chip}
        <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.modalBack} onPress={() => setOpen(false)}>
            <View style={styles.modalCard}>
              <DateTimePicker
                value={date}
                mode="date"
                display="inline"
                themeVariant="dark"
                accentColor={colors.acc}
                onChange={(_, picked) => picked && onChange(ymd(picked))}
              />
              <Pressable style={styles.btn} onPress={() => setOpen(false)}>
                <Text style={styles.btnText}>Done</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </>
    );
  }

  return (
    <>
      {chip}
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
