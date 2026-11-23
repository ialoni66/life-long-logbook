import { useSettings } from "./settings";
import { isRTL, LOCALE } from "./lang";
import { Strings, STRINGS } from "./strings";

// The text of the language chosen in Settings, plus a few helpers that depend on it.
export function useT(): Strings & { rtl: boolean; locale: string } {
  const { language } = useSettings();
  return { ...STRINGS[language], rtl: isRTL(language), locale: LOCALE[language] };
}
