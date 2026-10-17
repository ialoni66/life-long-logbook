import React, { useEffect, useRef, useState } from "react";
import {
  Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView,
  ScrollView, View,
} from "react-native";
import { Text } from "./src/ui";
import { DEFAULT_FONT, FONT_KEYS, FONTS, loadFont, UI_FONT } from "./src/fonts";
import { StatusBar } from "expo-status-bar";
import { CalendarScreen } from "./src/CalendarScreen";
import { LogScreen } from "./src/LogScreen";
import { SearchScreen } from "./src/SearchScreen";
import { SettingsScreen } from "./src/SettingsScreen";
import { defaultSettings, Settings, SettingsProvider } from "./src/settings";
import { load, loadSettings, save, saveSettings } from "./src/storage";
import { styles } from "./src/styles";
import { Data, Entry, uid } from "./src/types";

// "settings" is reached from the gear on the Search page and has no tab of its own.
type Tab = "log" | "search" | "calendar" | "settings";
const TABS: { key: Tab; label: string }[] = [
  { key: "log", label: "+ Log" },
  { key: "search", label: "Search" },
  { key: "calendar", label: "Calendar" },
];

const confirmDelete = (onYes: () => void) => {
  if (Platform.OS === "web") {
    if (window.confirm("Delete this entry?")) onYes();
  } else {
    Alert.alert("Delete this entry?", undefined, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onYes },
    ]);
  }
};

export default function App() {
  const [data, setData] = useState<Data>({ entries: [] });
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("log");
  const [editing, setEditing] = useState<Entry | null>(null);

  // The ref always holds the latest data, so several updates in one event don't overwrite each other.
  const latest = useRef(data);
  const update = (d: Data) => { latest.current = d; setData(d); save(d); };

  const [settings, setSettings] = useState<Settings>(defaultSettings());
  // Make sure a font is loaded before it is used, so text never flashes in a fallback face.
  const changeSettings = async (s: Settings) => {
    await loadFont(s.font);
    setSettings(s);
    saveSettings(s);
  };

  useEffect(() => {
    Promise.all([load(), loadSettings()]).then(async ([d, loaded]) => {
      const s = FONTS[loaded.font] ? loaded : { ...loaded, font: DEFAULT_FONT };
      await Promise.all([loadFont(UI_FONT), loadFont(s.font)]);
      latest.current = d; setData(d); setSettings(s); setReady(true);
      FONT_KEYS.forEach((k) => loadFont(k)); // the rest load quietly for the Settings previews
    });
  }, []);

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
    confirmDelete(() => update({ entries: latest.current.entries.filter((e) => e.id !== id) }));
  const edit = (e: Entry) => { setEditing(e); setTab("log"); };

  if (!ready) return null;

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
              data={data} onEdit={edit} onDelete={deleteEntry} onImport={update}
              onOpenSettings={() => setTab("settings")}
            />
          )}
          {tab === "settings" && (
            <SettingsScreen settings={settings} onChange={changeSettings} onBack={() => setTab("search")} />
          )}
          {tab === "calendar" && <CalendarScreen data={data} onEdit={edit} onDelete={deleteEntry} />}
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable
            key={t.key} style={styles.tab}
            onPress={() => { if (t.key !== "log") setEditing(null); setTab(t.key); }}
          >
            <Text style={[styles.tabText, (tab === t.key || (tab === "settings" && t.key === "search")) && styles.tabOn]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
    </SettingsProvider>
  );
}
