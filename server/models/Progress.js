import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  module: {
    type: String,
    required: true
  },
  sectionsCompleted: {
    before: { type: Boolean, default: false },
    during: { type: Boolean, default: false },
    after: { type: Boolean, default: false },
    dos: { type: Boolean, default: false },
    donts: { type: Boolean, default: false }
  },
  percentage: {
    type: Number,
    default: 0
  },
  quizUnlocked: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model("Progress", progressSchema);