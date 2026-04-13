import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["student", "principal", "admin"],
      required: true
    },

    rollNo: {
      type: String,
      unique: true,
      sparse: true
    },

    class: {
      type: String
    },

   

    email: {
      type: String,
      unique: true,
      sparse: true
    },

    schoolName: {
  type: String,
  default: ""
},

principalId: {
  type: String,
  default: null
},

    mobile: {
      type: String
    },

    password: {
      type: String,
      required: true
    },
      mustChangePassword: {
      type: Boolean,
      default: false
    },
    badges: [
  {
    type: String
  }
],
currentModule: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Module",
  default: null
},
progress: {
  type: Number,
  default: 0
},
quizScore: {
  type: Number,
  default: 0
},
className: {
  type: String,
  default: "N/A"
},
status: {
  type: String,
  default: "Active"
},

    isActive: {
      type: Boolean,
      default: true
    }
   
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);