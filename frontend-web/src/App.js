import React, { useEffect, useState } from "react";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", deadline: "" });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function fetchTasks() {
    try {
      setErr("");
      setLoading(true);
      const res = await fetch("/tasks");
      if (!res.ok) throw new Error("Virhe ladattaessa tehtäviä");
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      setErr(e.message || "Tuntematon virhe");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function addTask(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setErr("Otsikko on pakollinen.");
      return;
    }
    try {
      setErr("");
      const res = await fetch("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          deadline: form.deadline || null,
          completed: false,
        }),
      });
      if (!res.ok) throw new Error("Tehtävän lisäys epäonnistui");
      const created = await res.json();
      setTasks((t) => [created, ...t]);
      setForm({ title: "", description: "", deadline: "" });
    } catch (e) {
      setErr(e.message || "Tuntematon virhe");
    }
  }

  async function toggleCompleted(id) {
    const current = tasks.find((t) => t.id === id);
    if (!current) return;
    try {
      setErr("");
      await fetch(`/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !current.completed }),
      });
      setTasks((all) =>
        all.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    } catch (e) {
      setErr("Päivitys epäonnistui");
    }
  }

  async function removeTask(id) {
    try {
      setErr("");
      await fetch(`/tasks/${id}`, { method: "DELETE" });
      setTasks((all) => all.filter((t) => t.id !== id));
    } catch {
      setErr("Poisto epäonnistui");
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.h1}>TaskSync (Web)</h1>

      <form onSubmit={addTask} style={styles.card}>
        <div style={styles.row}>
          <input
            style={styles.input}
            placeholder="Otsikko *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="Kuvaus"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            style={styles.input}
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          />
          <button style={styles.button} type="submit">Lisää</button>
        </div>
        <small>* pakollinen</small>
      </form>

      {err && <div style={styles.error}>{err}</div>}
      {loading ? (
        <div>Haetaan tehtäviä…</div>
      ) : tasks.length === 0 ? (
        <div>Ei tehtäviä vielä.</div>
      ) : (
        <ul style={styles.list}>
          {tasks.map((t) => (
            <li key={t.id} style={styles.listItem}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={!!t.completed}
                  onChange={() => toggleCompleted(t.id)}
                />
                <div>
                  <div style={{ ...styles.title, textDecoration: t.completed ? "line-through" : "none" }}>
                    {t.title}
                  </div>
                  {t.description && <div style={styles.desc}>{t.description}</div>}
                  {t.deadline && <div style={styles.meta}>DL: {t.deadline}</div>}
                </div>
              </div>
              <button style={styles.delete} onClick={() => removeTask(t.id)}>Poista</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 900,
    margin: "40px auto",
    padding: 16,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  },
  h1: { marginBottom: 16 },
  card: {
    background: "#fafafa",
    border: "1px solid #eaeaea",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr 160px 120px", gap: 8 },
  input: {
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: 8,
    outline: "none",
  },
  button: {
    border: "none",
    borderRadius: 8,
    padding: "10px 12px",
    cursor: "pointer",
    background: "black",
    color: "white",
  },
  error: { background: "#ffe9e9", border: "1px solid #ffb3b3", padding: 8, borderRadius: 8, marginBottom: 12 },
  list: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 },
  listItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 12,
    border: "1px solid #eee",
    borderRadius: 10,
  },
  title: { fontWeight: 600 },
  desc: { color: "#555", marginTop: 4 },
  meta: { fontSize: 12, color: "#666", marginTop: 4 },
  delete: {
    background: "transparent",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "8px 10px",
    cursor: "pointer",
  },
};
