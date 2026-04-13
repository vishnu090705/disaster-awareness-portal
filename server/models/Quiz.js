import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["MCQ", "TRUE_FALSE", "SHORT"],
    required: true
  },

  questionText: {
    type: String,
    required: true
  },

  options: [String], // Only for MCQ

correctAnswer: {
  type: String,
  required: function () {
    return this.type !== "SHORT";
  }
},

  marks: {
    type: Number,
    default: 1
  }
});

const quizSchema = new mongoose.Schema(
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

    description: {
      type: String
    },

  level: {
  type: String,
  enum: ["very-easy", "easy", "medium", "hard"],
  required: true
},

    isUnlocked: {
      type: Boolean,
      default: false
    },

    questions: [questionSchema],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);