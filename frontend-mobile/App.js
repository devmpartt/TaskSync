// frontend-mobile/App.js
import { useEffect, useState } from "react";
import {
  SafeAreaView, View, Text, TextInput, Button,
  FlatList, Switch, TouchableOpacity, StyleSheet, Alert
} from "react-native";
import { getBaseURL } from "./config";

export default function App() {
  const baseURL = getBaseURL();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  async function fetchTasks() {
    try {
      setErr("");
      setLoading(true);
      const res = await fetch(`${baseURL}/tasks`);
      if (!res.ok) throw new Error("Virhe ladattaessa tehtäviä");
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      setErr(e.message || "Tuntematon virhe");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTasks(); }, []);

  async function addTask() {
    if (!title.trim()) return Alert.alert("Otsikko on pakollinen");
    try {
      const res = await fetch(`${baseURL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          deadline: deadline || null,
          completed: false,
        }),
      });
      if (!res.ok) throw new Error("Lisäys epäonnistui");
      const created = await res.json();
      setTasks((t) => [created, ...t]);
      setTitle(""); setDescription(""); setDeadline("");
    } catch (e) {
      setErr(e.message || "Tuntematon virhe");
    }
  }

  async function toggleCompleted(id) {
    const current = tasks.find((t) => t.id === id);
    if (!current) return;
    try {
      await fetch(`${baseURL}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !current.completed }),
      });
      setTasks((all) => all.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    } catch {
      Alert.alert("Päivitys epäonnistui");
    }
  }

  async function removeTask(id) {
    try {
      await fetch(`${baseURL}/tasks/${id}`, { method: "DELETE" });
      setTasks((all) => all.filter((t) => t.id !== id));
    } catch {
      Alert.alert("Poisto epäonnistui");
    }
  }

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, item.completed && { textDecorationLine: "line-through", color: "#777" }]}>
          {item.title}
        </Text>
        {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
        {item.deadline ? <Text style={styles.meta}>DL: {item.deadline}</Text> : null}
      </View>
      <View style={styles.actions}>
        <Switch value={!!item.completed} onValueChange={() => toggleCompleted(item.id)} />
        <TouchableOpacity onPress={() => removeTask(item.id)} style={styles.deleteBtn}>
          <Text>Poista</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.h1}>TaskSync (Mobile)</Text>

        <View style={styles.card}>
          <TextInput placeholder="Otsikko *" value={title} onChangeText={setTitle} style={styles.input} />
          <TextInput placeholder="Kuvaus" value={description} onChangeText={setDescription} style={styles.input} />
          <TextInput placeholder="Deadline (YYYY-MM-DD)" value={deadline} onChangeText={setDeadline} style={styles.input} />
          <Button title="Lisää" onPress={addTask} />
        </View>

        {err ? <Text style={styles.error}>{err}</Text> : null}
        {loading ? (
          <Text>Haetaan…</Text>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
        <View style={{ height: 12 }} />
        <Button title="Päivitä" onPress={fetchTasks} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 16 },
  h1: { fontSize: 24, fontWeight: "600", marginBottom: 12 },
  card: { gap: 8, backgroundColor: "#f7f7f7", padding: 12, borderRadius: 12, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10 },
  error: { backgroundColor: "#ffe9e9", borderWidth: 1, borderColor: "#ffb3b3", padding: 8, borderRadius: 8, marginBottom: 8 },
  item: { flexDirection: "row", alignItems: "center", padding: 12, borderWidth: 1, borderColor: "#eee", borderRadius: 10 },
  title: { fontSize: 16, fontWeight: "600" },
  desc: { color: "#555", marginTop: 2 },
  meta: { fontSize: 12, color: "#666", marginTop: 2 },
  actions: { alignItems: "center", gap: 8, marginLeft: 12 },
  deleteBtn: { borderWidth: 1, borderColor: "#ddd", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
});
