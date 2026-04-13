import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true
    },

    title: {
      type: String,
      required: true
    },

    content: {
      type: String
    },

    videoUrl: {
      type: String
    },

    order: {
      type: Number,
      default: 1
    }
  },
  { timestamps: true }
);

export default mongoose.model("Section", sectionSchema);