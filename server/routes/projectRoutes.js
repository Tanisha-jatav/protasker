import express from "express";
import Project from "../models/Project.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description)
      return res.status(400).json({ message: "All fields are required" });

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json({ success: true, project });
  } catch (err) {
    console.error("❌ Project Create Error:", err);
    res.status(500).json({ message: "Failed to create project" });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id }).populate(
      "members",
      "name email"
    );
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/join", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!project.members.includes(req.user._id)) {
      project.members.push(req.user._id);
      await project.save();
    }

    res.json({ success: true, message: "Joined project successfully", project });
  } catch (err) {
    res.status(500).json({ message: "Failed to join project" });
  }
});


router.post("/:id/messages", protect, async (req, res) => {
  try {
    const { text, image } = req.body;
    if (!text && !image)
      return res.status(400).json({ message: "Message content required" });

    const message = await Message.create({
      project: req.params.id,
      sender: req.user._id,
      text: text || "",
      image: image || null,
    });

    res.status(201).json({ success: true, message });
  } catch (err) {
    console.error("Message Send Error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
});

router.get("/:id/messages", protect, async (req, res) => {
  try {
    const messages = await Message.find({ project: req.params.id })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    console.error("Fetch Message Error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

router.delete("/:projectId/messages/:messageId", protect, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    if (msg.sender.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized to delete this message" });

    await msg.deleteOne();
    res.json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error("Delete Message Error:", err);
    res.status(500).json({ message: "Failed to delete message" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only owner can delete this project" });

    await Message.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete project" });
  }
});

router.put("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only owner can update project status" });
    }

    project.status = status;
    await project.save();

    res.json({ success: true, message: "Project status updated", project });
  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ message: "Failed to update project status" });
  }
});


export default router;
