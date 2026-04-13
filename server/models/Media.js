import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  disaster: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["image", "video"],
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: String,
    default: "admin"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Media", mediaSchema);