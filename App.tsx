import React, { useEffect, useRef, useState } from "react";
import {
  Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView,
  ScrollView, Share, Text, TextInput, View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { DateField } from "./src/DateField";
import { load, parseBackup, save } from "./src/storage";
import { colors, styles } from "./src/styles";
import { Data, Interaction, Person, today, uid } from "./src/types";

type Tab = "timeline" | "add" | "people";

const confirm = (msg: string, onYes: () => void) => {
  if (Platform.OS === "web") {
    if (window.confirm(msg)) onYes();
  } else {
    Alert.alert(msg, undefined, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onYes },
    ]);
  }
};

export default function App() {
  const [data, setData] = useState<Data>({ people: [], interactions: [] });
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("timeline");
  const [personFilter, setPersonFilter] = useState<string | null>(null);

  useEffect(() => {
    load().then((d) => { latest.current = d; setData(d); setReady(true); });
  }, []);

  // The ref always holds the latest data, so several updates in one event don't overwrite each other.
  const latest = useRef(data);
  const update = (d: Data) => { latest.current = d; setData(d); save(d); };
  const nameOf = (id: string) => data.people.find((p) => p.id === id)?.name ?? "Unknown";

  const addPerson = (p: Omit<Person, "id">) => {
    const person = { ...p, id: uid() };
    const d = latest.current;
    update({ ...d, people: [...d.people, person] });
    return person;
  };
  const addInteraction = (i: Omit<Interaction, "id">) => {
    const d = latest.current;
    update({ ...d, interactions: [...d.interactions, { ...i, id: uid() }] });
  };
  const delInteraction = (id: string) => {
    const d = latest.current;
    update({ ...d, interactions: d.interactions.filter((i) => i.id !== id) });
  };
  const delPerson = (id: string) => {
    const d = latest.current;
    update({
      people: d.people.filter((p) => p.id !== id),
      interactions: d.interactions.filter((i) => i.personId !== id),
    });
  };

  if (!ready) return null;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {tab === "timeline" && (
            <Timeline
              data={data}
              nameOf={nameOf}
              filter={personFilter}
              setFilter={setPersonFilter}
              onDelete={(id) => confirm("Delete this interaction?", () => delInteraction(id))}
            />
          )}
          {tab === "add" && (
            <AddForm
              people={data.people}
              initialPerson={personFilter}
              addPerson={addPerson}
              onSave={(i) => { addInteraction(i); setPersonFilter(i.personId); setTab("timeline"); }}
            />
          )}
          {tab === "people" && (
            <People
              data={data}
              addPerson={addPerson}
              onOpen={(id) => { setPersonFilter(id); setTab("timeline"); }}
              onDelete={(id) => confirm("Delete this person and all their interactions?", () => delPerson(id))}
              onImport={update}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.tabs}>
        {(["timeline", "add", "people"] as Tab[]).map((t) => (
          <Pressable key={t} style={styles.tab} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabOn]}>
              {t === "timeline" ? "Timeline" : t === "add" ? "+ Log" : "People"}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.chip, on && styles.chipOn]} onPress={onPress}>
      <Text style={on ? styles.chipTextOn : styles.chipText}>{label}</Text>
    </Pressable>
  );
}

function Timeline(p: {
  data: Data; nameOf: (id: string) => string; filter: string | null;
  setFilter: (id: string | null) => void; onDelete: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const list = p.data.interactions
    .filter((i) => !p.filter || i.personId === p.filter)
    .filter((i) => !q || `${i.summary} ${i.details ?? ""} ${p.nameOf(i.personId)}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <Text style={styles.title}>Timeline</Text>
      <TextInput style={styles.input} placeholder="Search" value={q} onChangeText={setQ} />
      <View style={styles.chips}>
        <Chip label="Everyone" on={!p.filter} onPress={() => p.setFilter(null)} />
        {p.data.people.map((x) => (
          <Chip key={x.id} label={x.name} on={p.filter === x.id} onPress={() => p.setFilter(x.id)} />
        ))}
      </View>
      {list.length === 0 && <Text style={styles.empty}>No interactions yet. Tap "+ Log".</Text>}
      {list.map((i) => (
        <View key={i.id} style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.cardName}>{p.nameOf(i.personId)}</Text>
            <Text style={styles.cardDate}>{i.date}</Text>
          </View>
          <Text style={styles.cardText}>{i.summary}</Text>
          {!!i.details && <Text style={styles.cardSub}>{i.details}</Text>}
          <Pressable onPress={() => p.onDelete(i.id)}><Text style={[styles.cardSub, { textAlign: "right" }]}>Delete</Text></Pressable>
        </View>
      ))}
    </>
  );
}

function AddForm(p: {
  people: Person[]; initialPerson: string | null;
  addPerson: (x: Omit<Person, "id">) => Person; onSave: (i: Omit<Interaction, "id">) => void;
}) {
  const [personId, setPersonId] = useState<string | null>(p.initialPerson);
  const [newName, setNewName] = useState("");
  const [date, setDate] = useState(today());
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");

  const submit = () => {
    let id = personId;
    if (!id && newName.trim()) id = p.addPerson({ name: newName.trim() }).id;
    if (!id || !summary.trim()) return Alert.alert("Pick or add a person and write a summary.");
    p.onSave({ personId: id, date, summary: summary.trim(), details: details.trim() || undefined });
  };

  return (
    <>
      <Text style={styles.title}>Log an interaction</Text>
      <Text style={styles.label}>Person</Text>
      <View style={styles.chips}>
        {p.people.map((x) => (
          <Chip key={x.id} label={x.name} on={personId === x.id} onPress={() => { setPersonId(x.id); setNewName(""); }} />
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="…or add a new person"
        value={newName}
        onChangeText={(t) => { setNewName(t); if (t) setPersonId(null); }}
      />
      <Text style={styles.label}>Date</Text>
      <DateField value={date} onChange={setDate} />
      <Text style={styles.label}>What happened?</Text>
      <TextInput style={styles.input} value={summary} onChangeText={setSummary} placeholder="Short summary" />
      <Text style={styles.label}>Other details</Text>
      <TextInput
        style={[styles.input, styles.multi]} multiline value={details} onChangeText={setDetails}
        placeholder="Where, mood, follow-ups, anything else"
      />
      <Pressable style={styles.btn} onPress={submit}><Text style={styles.btnText}>Save</Text></Pressable>
    </>
  );
}

function People(p: {
  data: Data; addPerson: (x: Omit<Person, "id">) => Person;
  onOpen: (id: string) => void; onDelete: (id: string) => void; onImport: (d: Data) => void;
}) {
  const [name, setName] = useState("");
  const [rel, setRel] = useState("");

  const add = () => {
    if (!name.trim()) return;
    p.addPerson({ name: name.trim(), relationship: rel.trim() || undefined });
    setName(""); setRel("");
  };

  const exportData = async () => {
    const json = JSON.stringify(p.data, null, 2);
    if (Platform.OS === "web") {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
      a.download = `logbook-${today()}.json`;
      a.click();
    } else {
      await Share.share({ message: json });
    }
  };

  const importWeb = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "application/json";
    input.onchange = async () => {
      const f = input.files?.[0]; if (!f) return;
      try { p.onImport(parseBackup(await f.text())); } catch { window.alert("Not a valid backup file."); }
    };
    input.click();
  };

  return (
    <>
      <Text style={styles.title}>People</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Relationship (optional)" value={rel} onChangeText={setRel} />
      <Pressable style={styles.btn} onPress={add}><Text style={styles.btnText}>Add person</Text></Pressable>
      {p.data.people.map((x) => {
        const n = p.data.interactions.filter((i) => i.personId === x.id).length;
        return (
          <Pressable key={x.id} style={styles.card} onPress={() => p.onOpen(x.id)}>
            <View style={styles.cardTop}>
              <Text style={styles.cardName}>{x.name}</Text>
              <Text style={styles.cardDate}>{n} interaction{n === 1 ? "" : "s"}</Text>
            </View>
            {!!x.relationship && <Text style={styles.cardSub}>{x.relationship}</Text>}
            <Pressable onPress={() => p.onDelete(x.id)}><Text style={[styles.cardSub, { textAlign: "right" }]}>Delete</Text></Pressable>
          </Pressable>
        );
      })}
      <Text style={[styles.label, { marginTop: 16 }]}>Backup</Text>
      <Pressable style={styles.btn2} onPress={exportData}><Text style={styles.btn2Text}>Export backup</Text></Pressable>
      {Platform.OS === "web" && (
        <Pressable style={styles.btn2} onPress={importWeb}><Text style={styles.btn2Text}>Import backup</Text></Pressable>
      )}
    </>
  );
}
