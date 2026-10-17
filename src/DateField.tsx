import React, { useState } from "react";
import { Modal, Platform, Pressable, View } from "react-native";
import { FONTS } from "./fonts";
import { entryFontSize, Text } from "./ui";
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatDate, useSettings } from "./settings";
import { colors, styles } from "./styles";
import { ymd } from "./types";

type Props = { value: string; onChange: (v: string) => void };

// A date box that matches the text boxes. It fills the height of the column it sits
// in, so it lines up with the box beside it. It shows the date in the user's chosen
// format; the value itself is always YYYY-MM-DD.
export function DateField({ value, onChange }: Props) {
  const { dateFormat, font } = useSettings();
  const [open, setOpen] = useState(false);
  const label = formatDate(value, dateFormat);

  if (Platform.OS === "web") {
    // A transparent native date input sits on top of the box, so a tap opens the
    // browser's picker while the box shows our own format.
    return React.createElement(
      "div",
      {
        style: {
          position: "relative",
          flex: 1,
          display: "flex",
          alignItems: "center",
          boxSizing: "border-box",
          background: colors.inputBg,
          color: colors.inputFg,
          border: `1px solid ${colors.inputLine}`,
          borderRadius: 10,
          padding: "10px 12px",
          // Same font and size as the other text boxes.
          fontSize: entryFontSize(font),
          fontFamily: FONTS[font].regular,
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
      style={[styles.input, { marginBottom: 0, marginHorizontal: 0, flex: 1, justifyContent: "center" }]}
      onPress={() => setOpen(true)}
    >
      <Text kind="entry" noScale style={{ color: colors.inputFg, fontSize: entryFontSize(font) }}>{label}</Text>
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
