import multer from "multer";
import path from "path";

// ✅ STORAGE CONFIG
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/modules"); // folder
  },

  filename: (req, file, cb) => {
    const cleanName = req.body.name
      ? req.body.name.toLowerCase().replace(/\s+/g, "-")
      : "module";

    const ext = path.extname(file.originalname);

    cb(null, `${Date.now()}-${cleanName}${ext}`);
  }
});

// ✅ FILE FILTER (optional but good)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image") || file.mimetype.startsWith("video")) {
    cb(null, true);
  } else {
    cb(new Error("Only image/video files allowed"), false);
  }
};

// ✅ FINAL UPLOAD EXPORT
const upload = multer({
  storage,
  fileFilter
});

export default upload;