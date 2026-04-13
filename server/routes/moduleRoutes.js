import express from "express";
import Module from "../models/Module.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";
import upload from "../middleware/upload.js";
import multer from "multer";
const router = express.Router();




/* ===============================
   ADMIN: Create Module
================================ */


/* ===============================
   ADMIN: Activate / Deactivate
================================ */
router.put("/:id/status", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    module.isActive = !module.isActive;
    await module.save();

    res.json({ message: "Status updated", isActive: module.isActive });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   STUDENT: Get Active Modules
================================ */
router.get("/active", verifyToken, async (req, res) => {
  try {
    const modules = await Module.find({ isActive: true });
    res.json(modules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   GET Single Module (Dynamic Page)
================================ */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module || !module.isActive) {
      return res.status(404).json({ message: "Module not available" });
    }

    res.json(module);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const modules = await Module.find({ isActive: true });
    res.json(modules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Module.findByIdAndDelete(req.params.id);
    res.json({ message: "Module deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put(
  "/:id",
  verifyToken,
  verifyAdmin,
  upload.fields([
    { name: "videos", maxCount: 5 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { name, description, category, transcripts, changedVideos } = req.body;

      const module = await Module.findById(req.params.id);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }

      // ✅ Basic fields
      if (name) module.name = name;
      if (description) module.description = description;
      if (category) module.category = category;

      // ✅ THUMBNAIL UPDATE (MISSING PIECE)
const thumbnailFile =
  req.files?.thumbnail?.[0] || req.files?.["thumbnail"]?.[0];

if (thumbnailFile) {
  module.thumbnail =
    "/uploads/modules/" + thumbnailFile.filename;

  console.log("✅ NEW THUMBNAIL SET:", module.thumbnail);
}

console.log("FILES:", req.files);
      // ✅ Safe parsing
      let parsedTranscripts = [];
      let changedIndexes = [];

      try {
        parsedTranscripts = JSON.parse(transcripts || "[]");
        changedIndexes = JSON.parse(changedVideos || "[]");
      } catch (err) {
        console.error("JSON parse error:", err);
      }

      // 🔥 CASE 1: If changedIndexes provided
      if (changedIndexes.length > 0) {
        changedIndexes.forEach((sectionIndex, i) => {
          if (!module.sections[sectionIndex]) return;

          // transcript
          if (parsedTranscripts[sectionIndex] !== undefined) {
            module.sections[sectionIndex].transcript =
              parsedTranscripts[sectionIndex];
          }

          // video
          if (req.files?.videos?.[i]) {
            module.sections[sectionIndex].videoUrl =
              "/uploads/modules/" +
              req.files.videos[i].filename;
          }
        });
      }

      // 🔥 CASE 2: No changedIndexes → fallback (update sequentially)
      else if (req.files?.videos?.length > 0) {
        req.files.videos.forEach((file, i) => {
          if (!module.sections[i]) return;

          module.sections[i].videoUrl =
            "/uploads/modules/" + file.filename;
        });
      }

      // 🔥 CASE 3: Only transcripts updated
      if (parsedTranscripts.length > 0 && changedIndexes.length === 0) {
        parsedTranscripts.forEach((text, i) => {
          if (module.sections[i] && text !== undefined) {
            module.sections[i].transcript = text;
          }
        });
      }
      console.log("BEFORE SAVE:", module.thumbnail);
      await module.save();
console.log("AFTER SAVE:", module.thumbnail);
      res.json({ message: "Module updated successfully" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;