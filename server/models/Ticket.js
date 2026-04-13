import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  principalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  type: {
    type: String,
    enum: ["student", "school"],
    required: true
  },
  issue: String,
 status: {
  type: String,
  enum: ["Open", "In Progress", "Resolved"],
  default: "Open"
}
}, { timestamps: true });

export default mongoose.model("Ticket", ticketSchema);