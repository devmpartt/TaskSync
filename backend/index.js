const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

let tasks = [];

app.get('/tasks', (req, res) => {
    res.json(tasks);
});

app.post('/tasks', (req, res) => {
    const task = { id: Date.now(), ...req.body };
    tasks.push(task);
    res.status(201).json(task);
});

app.put('/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    tasks = tasks.map(t => t.id === id ? { ...t, ...req.body } : t);
    res.json({ message: "Updated" });
});

app.delete('/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    tasks = tasks.filter(t => t.id !== id);
    res.json({ message: "Deleted" });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
