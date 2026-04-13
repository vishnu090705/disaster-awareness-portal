import express from "express";
import Section from "../models/Section.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();

/* ADMIN: Add Section */
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { moduleId, title, content, videoUrl, order } = req.body;

    const section = await Section.create({
      moduleId,
      title,
      content,
      videoUrl,
      order
    });

    res.json({ message: "Section added", section });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* STUDENT: Get Sections by Module */
router.get("/:moduleId", verifyToken, async (req, res) => {
  try {
    const sections = await Section.find({
      moduleId: req.params.moduleId
    }).sort({ order: 1 });

    res.json(sections);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;