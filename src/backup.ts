// Getting your entries out of the app as a file, and a file back in.
import { Platform, Share } from "react-native";
import { Data, today } from "./types";

export type SaveResult = "shared" | "downloaded" | "cancelled" | "text";

const isIPhone = () =>
  typeof navigator !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

// Writes your entries to a file. On iPhone this opens the share sheet, where you choose
// "Save to Files" (or iCloud Drive); on a computer the file downloads.
export async function saveBackupFile(data: Data): Promise<SaveResult> {
  const json = JSON.stringify(
    { app: "life-long-logbook", savedAt: new Date().toISOString(), entries: data.entries },
    null,
    2
  );
  const filename = `logbook-${today()}.json`;

  if (Platform.OS !== "web") {
    await Share.share({ message: json });
    return "text";
  }

  const file = new File([json], filename, { type: "application/json" });
  if (isIPhone() && (navigator as any).canShare?.({ files: [file] })) {
    try {
      await (navigator as any).share({ files: [file], title: "Logbook backup" });
      return "shared";
    } catch (e: any) {
      if (e?.name === "AbortError") return "cancelled"; // the user closed the share sheet
      // anything else: fall through to a normal download
    }
  }

  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return "downloaded";
}

const MAX_FILE_BYTES = 25 * 1024 * 1024;

// Opens the file picker and returns the text of the chosen file, or null if nothing was chosen.
// Must be called straight from a tap so the browser allows the picker to open.
export function pickBackupText(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json,text/plain";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      if (file.size > MAX_FILE_BYTES) return reject(new Error("That file is too large to be a Logbook file."));
      try {
        resolve(await file.text());
      } catch {
        reject(new Error("That file couldn't be opened."));
      }
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}
