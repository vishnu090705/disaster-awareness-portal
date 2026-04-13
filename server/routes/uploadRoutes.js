import express from "express";
import multer from "multer";
import path from "path";
import Media from "../models/Media.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/modules/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Upload media


// Get media for disaster
router.get("/:disaster", async (req, res) => {
  const media = await Media.find({
    disaster: req.params.disaster
  }).sort({ createdAt: -1 });

  res.json(media);
});

// Delete media
router.delete("/:id", isAdmin, async (req, res) => {
  await Media.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
});

export default router;