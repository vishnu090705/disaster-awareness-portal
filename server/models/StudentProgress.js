import mongoose from "mongoose";

const studentProgressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module",
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  quizScore: {
    type: Number,
    default: 0
  }
});

export default mongoose.model("StudentProgress", studentProgressSchema);