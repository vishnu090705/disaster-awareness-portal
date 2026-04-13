import express from "express";
import {verifyToken} from "../middleware/verifyToken.js";
import {verifyAdmin} from "../middleware/verifyAdmin.js";
import User from "../models/User.js";

const router = express.Router();

/* ================================
   ASSIGN PRINCIPAL TO STUDENT
================================ */
router.put("/assign", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { studentId, principalId } = req.body;

    const student = await User.findById(studentId);
    const principal = await User.findById(principalId);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!principal || principal.role !== "principal") {
      return res.status(404).json({ message: "Principal not found" });
    }

    student.principalId = principal._id;
    await student.save();

    res.json({ message: "Principal assigned successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;