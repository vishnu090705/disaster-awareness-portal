
import dotenv from "dotenv";
import path from "path";
dotenv.config();
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);





import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import adminSchoolRoutes from "./routes/adminSchoolRoutes.js";
import schoolRoutes from "./routes/schoolRoutes.js";

import adminStudentRoutes from "./routes/adminStudentRoutes.js";
import adminStatsRoutes from "./routes/adminStatsRoutes.js";
import adminAssignRoutes from "./routes/adminAssignRoutes.js";
import adminPrincipalRoutes from "./routes/adminPrincipalRoutes.js";
import passwordRoutes from "./routes/passwordRoutes.js";
import moduleRoutes from "./routes/moduleRoutes.js";
import sectionRoutes from "./routes/sectionRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import aiRoutes from "./routes/ai.js";
import principalRoutes from "./routes/principalRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";









const app = express();
app.use(  
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json());

app.use(
  "/uploads",
  express.static(path.resolve(__dirname, "./uploads"))
);

console.log("Static path:", path.join(__dirname, "uploads"));

// ✅ MongoDB Connection
mongoose.set("bufferCommands", false);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });

    console.log("MongoDB Connected ✅");

    app.listen(5000, () => {
      console.log("🚀 Server running on port 5000");
    });

  } catch (err) {
    console.error("DB Failed, retrying...", err.message);
    setTimeout(connectDB, 5000);
  }
};

connectDB();


// ✅ Enable Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/admin/schools", adminSchoolRoutes);
app.use("/api/admin/students", adminStudentRoutes);
app.use("/api/admin/stats", adminStatsRoutes);
app.use("/api/admin", adminAssignRoutes);
app.use("/api/admin/principals", adminPrincipalRoutes);
app.use("/api/auth", passwordRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/principal", principalRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/tickets/stats", ticketRoutes);
app.use("/api/schools", schoolRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("Disaster Awareness Portal Backend Running 🚀");
});

