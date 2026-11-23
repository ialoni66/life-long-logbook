// Phones and the build tools use this empty stand-in; the real guide is in InstallGuide.web.tsx.
import type { Lang } from "./lang";
type Props = { onUseInBrowser: (lang: Lang) => void };
export function InstallGuide(_props: Props) {
  return null;
}
