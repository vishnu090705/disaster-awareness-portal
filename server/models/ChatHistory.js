import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["student", "ai"],
    required: true
  },
  content: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module"
  },
  disasterName: String,
  studentClass: Number,
  messages: [messageSchema]
}, { timestamps: true });

export default mongoose.model("ChatHistory", chatHistorySchema);