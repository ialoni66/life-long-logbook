import React, { useEffect, useRef, useState } from "react";
import {
  Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView,
  ScrollView, View,
} from "react-native";
import { Text } from "./src/ui";
import { DEFAULT_FONT, FONTS, loadFont, loadHebrewFont, UI_FONT } from "./src/fonts";
import { STRINGS, Strings } from "./src/strings";
import { isRTL } from "./src/lang";
import { StatusBar } from "expo-status-bar";
import { CalendarScreen } from "./src/CalendarScreen";
import { LogScreen } from "./src/LogScreen";
import { SearchScreen } from "./src/SearchScreen";
import { SettingsScreen } from "./src/SettingsScreen";
import { hideSplash } from "./src/splash";
import { InstallGuide } from "./src/InstallGuide";
import { shouldShowInstallGuide } from "./src/install";
import { defaultSettings, Settings, SettingsProvider } from "./src/settings";
import { load, loadSettings, save, saveSettings } from "./src/storage";
import { styles } from "./src/styles";
import { Data, Entry, uid } from "./src/types";

// "settings" is reached from the gear on the Search page and has no tab of its own.
type Tab = "log" | "search" | "calendar" | "settings";
const tabLabel = (s: Strings, k: Tab) => (k === "log" ? s.tabLog : k === "search" ? s.tabSearch : s.tabCalendar);
const TAB_KEYS: Tab[] = ["log", "search", "calendar"];

const confirmDelete = (s: Strings, onYes: () => void) => {
  if (Platform.OS === "web") {
    if (window.confirm(s.deleteConfirm)) onYes();
  } else {
    Alert.alert(s.deleteConfirm, undefined, [
      { text: s.cancel, style: "cancel" },
      { text: s.delete, style: "destructive", onPress: onYes },
    ]);
  }
};

export default function App() {
  const [data, setData] = useState<Data>({ entries: [] });
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("log");
  const [editing, setEditing] = useState<Entry | null>(null);
  // Someone who opens the link in a browser on an iPhone sees the install guide instead of the app.
  const [guide, setGuide] = useState(() => shouldShowInstallGuide());

  // The ref always holds the latest data, so several updates in one event don't overwrite each other.
  const latest = useRef(data);
  const update = (d: Data) => { latest.current = d; setData(d); save(d); };
  // For whole-logbook changes like an import: store first, and only then show the new data,
  // so a failed save leaves everything exactly as it was.
  const replaceData = async (d: Data) => {
    await save(d);
    latest.current = d;
    setData(d);
  };

  const [settings, setSettings] = useState<Settings>(defaultSettings());
  // Make sure a font is loaded before it is used, so text never flashes in a fallback face.
  const changeSettings = async (s: Settings) => {
    await Promise.all([loadFont(s.font), s.language === "he" ? loadHebrewFont() : null]);
    setSettings(s);
    saveSettings(s);
  };

  useEffect(() => {
    Promise.all([load(), loadSettings()]).then(async ([d, loaded]) => {
      const s = FONTS[loaded.font] ? loaded : { ...loaded, font: DEFAULT_FONT };
      await Promise.all([loadFont(UI_FONT), loadFont(s.font), s.language === "he" ? loadHebrewFont() : null]);
      latest.current = d; setData(d); setSettings(s); setReady(true);
      // The other fonts are NOT loaded here: they are only fetched if Settings is opened (see SettingsScreen).
    });
  }, []);

  // The page's direction and language follow the chosen language (this also flips every row on screen).
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    document.documentElement.dir = isRTL(settings.language) ? "rtl" : "ltr";
    document.documentElement.lang = settings.language;
  }, [settings.language]);

  // Once everything is loaded, fade out the loading screen.
  useEffect(() => { if (ready) hideSplash(); }, [ready]);

  const saveEntry = (fields: Omit<Entry, "id">, id?: string) => {
    const d = latest.current;
    update({
      entries: id
        ? d.entries.map((e) => (e.id === id ? { ...fields, id } : e))
        : [...d.entries, { ...fields, id: uid() }],
    });
    if (id) { setEditing(null); setTab("search"); }
  };
  const deleteEntry = (id: string) =>
    confirmDelete(STRINGS[settings.language], () => update({ entries: latest.current.entries.filter((e) => e.id !== id) }));
  const edit = (e: Entry) => { setEditing(e); setTab("log"); };

  if (!ready) return null;
  if (guide) return <InstallGuide onUseInBrowser={() => setGuide(false)} />;

  return (
    <SettingsProvider value={settings}>
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {tab === "log" && (
            <LogScreen
              key={editing?.id ?? "new"}
              editing={editing}
              onSave={saveEntry}
              onCancel={() => { setEditing(null); setTab("search"); }}
            />
          )}
          {tab === "search" && (
            <SearchScreen
              data={data} onEdit={edit} onDelete={deleteEntry}
              onOpenSettings={() => setTab("settings")}
            />
          )}
          {tab === "settings" && (
            <SettingsScreen
              settings={settings} onChange={changeSettings} onBack={() => setTab("search")}
              data={data} onReplaceData={replaceData}
            />
          )}
          {tab === "calendar" && <CalendarScreen data={data} onEdit={edit} onDelete={deleteEntry} />}
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.tabs}>
        {TAB_KEYS.map((k) => (
          <Pressable
            key={k} style={styles.tab}
            onPress={() => { if (k !== "log") setEditing(null); setTab(k); }}
          >
            <Text style={[styles.tabText, (tab === k || (tab === "settings" && k === "search")) && styles.tabOn]}>
              {tabLabel(STRINGS[settings.language], k)}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
    </SettingsProvider>
  );
}
