import React, { useState } from "react";
import { Modal, Platform, Pressable, View } from "react-native";
import { FONTS } from "./fonts";
import { Text } from "./ui";
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
          background: colors.inputBg,
          color: colors.inputFg,
          border: `1px solid ${colors.inputLine}`,
          borderRadius: 8,
          padding: "4px 8px",
          fontSize: 12,
          fontFamily: FONTS.lora.regular,
          cursor: "pointer",
        },
      },
      label,
      React.createElement("input", {
        type: "date",
        value,
        onChange: (e: any) => e.target.value && onChange(e.target.value),
        onClick: (e: any) => { try { e.target.showPicker(); } catch {} },
        // 16px keeps iPhone Safari from zooming in when this hidden input is tapped.
        style: { position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", fontSize: 16 },
      })
    );
  }

  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const chip = (
    <Pressable
      style={[styles.input, { marginBottom: 0, marginHorizontal: 0, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 }]}
      onPress={() => setOpen(true)}
    >
      <Text style={{ color: colors.inputFg, fontSize: 12 }}>{label}</Text>
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
