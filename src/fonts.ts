import * as Font from "expo-font";

// All fonts ship inside the app (no internet needed). Each one has a regular and a
// bold face; fonts with a single weight use it for both.
export type FontKey = "lora" | "caveat" | "patrick" | "elite" | "cormorant";

type Face = {
  label: string;
  tag: string;
  regular: string;
  bold: string;
  scale: number; // evens out how big each face looks at the same nominal size
  charWidth: number; // average character width in em, used to fit titles on one line
  files: Record<string, number>;
};

export const FONTS: Record<FontKey, Face> = {
  lora: {
    label: "Lora",
    tag: "Book serif",
    regular: "Lora_400Regular",
    bold: "Lora_600SemiBold",
    scale: 1,
    charWidth: 0.56,
    files: {
      Lora_400Regular: require("@expo-google-fonts/lora/400Regular/Lora_400Regular.ttf"),
      Lora_600SemiBold: require("@expo-google-fonts/lora/600SemiBold/Lora_600SemiBold.ttf"),
    },
  },
  caveat: {
    label: "Caveat",
    tag: "Handwritten script",
    regular: "Caveat_400Regular",
    bold: "Caveat_700Bold",
    scale: 1.28,
    charWidth: 0.38,
    files: {
      Caveat_400Regular: require("@expo-google-fonts/caveat/400Regular/Caveat_400Regular.ttf"),
      Caveat_700Bold: require("@expo-google-fonts/caveat/700Bold/Caveat_700Bold.ttf"),
    },
  },
  patrick: {
    label: "Patrick Hand",
    tag: "Neat handwriting",
    regular: "PatrickHand_400Regular",
    bold: "PatrickHand_400Regular",
    scale: 1.08,
    charWidth: 0.45,
    files: {
      PatrickHand_400Regular: require("@expo-google-fonts/patrick-hand/400Regular/PatrickHand_400Regular.ttf"),
    },
  },
  elite: {
    label: "Special Elite",
    tag: "Typewriter",
    regular: "SpecialElite_400Regular",
    bold: "SpecialElite_400Regular",
    scale: 0.94,
    charWidth: 0.6,
    files: {
      SpecialElite_400Regular: require("@expo-google-fonts/special-elite/400Regular/SpecialElite_400Regular.ttf"),
    },
  },
  cormorant: {
    label: "Cormorant Garamond",
    tag: "Classic literary",
    regular: "CormorantGaramond_500Medium",
    bold: "CormorantGaramond_700Bold",
    scale: 1.2,
    charWidth: 0.42,
    files: {
      CormorantGaramond_500Medium: require("@expo-google-fonts/cormorant-garamond/500Medium/CormorantGaramond_500Medium.ttf"),
      CormorantGaramond_700Bold: require("@expo-google-fonts/cormorant-garamond/700Bold/CormorantGaramond_700Bold.ttf"),
    },
  },
};

export const FONT_KEYS = Object.keys(FONTS) as FontKey[];
// Titles, labels and buttons always use Lora; DEFAULT_FONT is the starting choice for
// the text you write, which you can change in Settings.
export const UI_FONT: FontKey = "lora";
export const DEFAULT_FONT: FontKey = "patrick";

const loading = new Map<FontKey, Promise<void>>();

// Loads a font once; later calls reuse the same promise.
export function loadFont(key: FontKey): Promise<void> {
  let p = loading.get(key);
  if (!p) {
    p = Font.loadAsync(FONTS[key].files).catch(() => {});
    loading.set(key, p);
  }
  return p;
}
