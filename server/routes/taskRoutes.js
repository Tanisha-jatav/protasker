import express from "express";
import Task from "../models/Task.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 🟢 Create a new task
 */
router.post("/", protect, async (req, res) => {
  try {
    const { title, desc, priority, deadline } = req.body;

    if (!title?.trim() || !desc?.trim()) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }

    const newTask = await Task.create({
      user: req.user._id,
      title: title.trim(),
      desc: desc.trim(),
      priority: priority || "Low",
      deadline: deadline || null,
    });

    res.status(201).json({
      success: true,
      message: "✅ Task created successfully",
      task: newTask,
    });
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ success: false, message: "Server error while creating task" });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const { status } = req.query; // Optional filter: ?status=Completed or Pending
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ success: false, message: "Server error while fetching tasks" });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const { title, desc, priority, status, deadline } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task)
      return res.status(404).json({ success: false, message: "Task not found" });
    if (task.user.toString() !== req.user._id.toString())
      return res.status(401).json({ success: false, message: "Not authorized to update this task" });

    if (title) task.title = title.trim();
    if (desc) task.desc = desc.trim();
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (deadline) task.deadline = deadline;

    await task.save();

    res.json({
      success: true,
      message: "✅ Task updated successfully",
      task,
    });
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ success: false, message: "Server error while updating task" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task)
      return res.status(404).json({ success: false, message: "Task not found" });
    if (task.user.toString() !== req.user._id.toString())
      return res.status(401).json({ success: false, message: "Not authorized to delete this task" });

    await task.deleteOne();

    res.json({
      success: true,
      message: "🗑️ Task deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ success: false, message: "Server error while deleting task" });
  }
});

export default router;
