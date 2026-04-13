import mongoose from "mongoose";

const moduleProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true
    },
    watchedSections: [
    {
      type: mongoose.Schema.Types.ObjectId
    }
  ],

    quizAttempts: [
      {
        score: Number,
        passed: Boolean,
        attemptedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    bestScore: {
      type: Number,
      default: 0
    },
    xpEarned: {
  type: Number,
  default: 0
},
quizCompleted: {
  type: Boolean,
  default: false
},  
isCompleted: {
  type: Boolean,
  default: false
},

    completionPercentage: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("ModuleProgress", moduleProgressSchema);