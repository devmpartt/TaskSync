const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;
const DATA_FILE = path.join(__dirname, 'tasks.json');

app.use(cors());
app.use(express.json());

// Lataa tiedot käynnistyksessä
function loadTasks() {
  try {
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Virhe ladattaessa tasks.json:', e);
    return [];
  }
}

// Tallenna tiedot levyyn (atomisesti)
function saveTasks(tasks) {
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(tasks, null, 2), 'utf-8');
  fs.renameSync(tmp, DATA_FILE);
}

let tasks = loadTasks();

app.get('/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/tasks', (req, res) => {
  const { title, description = '', deadline = null, completed = false } = req.body || {};
  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  const task = {
    id: Date.now(),
    title: String(title).trim(),
    description: String(description || '').trim(),
    deadline: deadline || null,
    completed: !!completed,
  };
  tasks.unshift(task);
  saveTasks(tasks);
  res.status(201).json(task);
});

app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  let found = false;
  tasks = tasks.map(t => {
    if (t.id === id) {
      found = true;
      return { ...t, ...req.body };
    }
    return t;
  });
  if (!found) return res.status(404).json({ error: 'not found' });
  saveTasks(tasks);
  res.json({ message: 'Updated' });
});

app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const before = tasks.length;
  tasks = tasks.filter(t => t.id !== id);
  if (tasks.length === before) return res.status(404).json({ error: 'not found' });
  saveTasks(tasks);
  res.json({ message: 'Deleted' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
