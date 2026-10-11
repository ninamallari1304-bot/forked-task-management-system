import Task from "../models/Task.js";

const allowed = [
  "name",
  "description",
  "status",
  "priority",
  "project",
  "startDate",
  "dueDate",
  "tags",
];

// Only copy the fields we expect from the request body
const pick = (body) => {
  const data = {};
  allowed.forEach((key) => {
    if (body[key] !== undefined) data[key] = body[key];
  });
  return data;
};

export const getTasks = async (req, res) => {
  try {
    const filter = { owner: req.user._id };
    if (req.query.project) filter.project = req.query.project;
    const tasks = await Task.find(filter).sort({ createdAt: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const task = await Task.create({ ...pick(req.body), owner: req.user._id });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      pick(req.body),
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};