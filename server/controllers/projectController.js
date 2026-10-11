import Project from "../models/Project.js";
import Task from "../models/Task.js";

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user._id }).sort({ createdAt: 1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description, theme } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Project name is required" });
    }
    const exists = await Project.findOne({ name: name.trim(), owner: req.user._id });
    if (exists) {
      return res.status(400).json({ message: "You already have a project with that name" });
    }
    const project = await Project.create({
      name,
      description,
      theme,
      owner: req.user._id,
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { description, theme } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { description, theme },
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });
    await Task.deleteMany({ project: project.name, owner: req.user._id });
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};