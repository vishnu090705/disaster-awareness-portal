import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    enum: ["Before", "During", "After", "Do's", "Don'ts"],
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  transcript: {
    type: String,
    required: true
  }
});

const moduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },

    description: {
      type: String
    },

    thumbnail: {
      type: String
    },

    category: {
      type: String,
      enum: ["natural", "man-made"],
      required: true
    },

    backgroundImage: {
      type: String,
      default: ""
    },

    themeColor: {
      type: String,
      default: "#1e3a8a"
    },

    // ✅ NEW SECTION STRUCTURE
    sections: {
      type: [sectionSchema],
      required: true
    },

    aiSummary: {
    type:String},
    

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }

);

export default mongoose.model("Module", moduleSchema);