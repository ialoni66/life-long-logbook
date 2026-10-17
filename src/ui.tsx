import React, { createContext, useContext } from "react";
import {
  StyleSheet, Text as RNText, TextInput as RNTextInput,
  TextInputProps, TextProps, TextStyle,
} from "react-native";
import { FONTS, FontKey, UI_FONT } from "./fonts";
import { useSettings } from "./settings";

// Drop-in replacements for Text and TextInput with two font roles:
//   "ui"    titles, labels, buttons, tabs: always Lora.
//   "entry" what you write (typed text and saved entries): the font chosen in Settings.

// Nested text inherits its parent's font and size, so it only needs to know the parent's font.
const ParentFont = createContext<FontKey | null>(null);

type Extra = {
  kind?: "ui" | "entry"; // Text defaults to "ui"; TextInput is always "entry"
  fontKey?: FontKey; // force a specific font (used for the previews in Settings)
  noScale?: boolean; // use the fontSize exactly as given (the title is pre-fitted)
};

// The size text boxes actually render at: the base size scaled for the font, never under
// 16px (iPhone Safari zooms into smaller text). The date box uses this to match them.
export const entryFontSize = (font: FontKey, base = 15) => Math.max(base * FONTS[font].scale, 16);

function resolve(style: any, font: FontKey, nested: boolean, noScale?: boolean): TextStyle {
  const flat: TextStyle = StyleSheet.flatten(style) ?? {};
  const face = FONTS[font];
  const bold = flat.fontWeight === "bold" || Number(flat.fontWeight) >= 600;
  const out: Record<string, any> = { ...flat, fontFamily: bold ? face.bold : face.regular };
  if (flat.fontWeight) out.fontWeight = "normal"; // weight is already part of the family
  if (!noScale && (!nested || flat.fontSize)) {
    out.fontSize = (flat.fontSize ?? 14) * face.scale;
    if (flat.lineHeight) out.lineHeight = flat.lineHeight * face.scale;
  }
  return out as TextStyle;
}

export function Text({ style, kind = "ui", fontKey, noScale, ...rest }: TextProps & Extra) {
  const parent = useContext(ParentFont);
  const { font } = useSettings();
  const own = fontKey ?? (kind === "entry" ? font : UI_FONT);
  const used = fontKey ?? parent ?? own;
  return (
    <ParentFont.Provider value={used}>
      <RNText {...rest} style={resolve(style, used, parent !== null, noScale)} />
    </ParentFont.Provider>
  );
}

export function TextInput({ style, fontKey, ...rest }: TextInputProps & Extra) {
  const { font } = useSettings();
  const resolved: Record<string, any> = resolve(style, fontKey ?? font, false);
  // iPhone Safari zooms the page when a box with text under 16px is tapped, so never go below 16.
  resolved.fontSize = Math.max(resolved.fontSize ?? 16, 16);
  return <RNTextInput {...rest} style={resolved} />;
}
