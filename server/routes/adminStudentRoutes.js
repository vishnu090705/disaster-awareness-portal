import express from "express";
import {verifyToken} from "../middleware/verifyToken.js";
import {verifyAdmin} from "../middleware/verifyAdmin.js";
import User from "../models/User.js";
import School from "../models/School.js";

const router = express.Router();

/* =========================================
   GET ALL STUDENTS (WITH OPTIONAL FILTER)
========================================= */
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { school } = req.query;

    let filter = { role: "student" };

    if (school) {
      filter.schoolName = school;
    }

    const students = await User.find(filter);

    const result = [];

    for (const student of students) {

      let supervisor = "Admin";

      if (student.schoolName) {

        const schoolData = await School
          .findOne({ schoolName: student.schoolName })
          .populate("principalId", "name");

        if (schoolData && schoolData.principalId) {
          supervisor = schoolData.principalId.name;
        }

      }

      result.push({
        ...student._doc,
        supervisor
      });
    }

    res.json(result);

  } catch (err) {
    console.error("Student fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================================
   DELETE STUDENT
========================================= */
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    await student.deleteOne();

    res.json({ message: "Student deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================================
   REASSIGN STUDENT
========================================= */
router.put("/:id/reassign", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { schoolName } = req.body;

    const student = await User.findById(req.params.id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    // If empty school → admin supervision
    if (!schoolName) {
      student.schoolName = "";
      student.supervisorType = "admin";
      await student.save();
      return res.json(student);
    }

    const school = await School.findOne({ schoolName });

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    student.schoolName = schoolName;

    // If school has principal
    if (school.principalId) {
      student.supervisorType = "principal";
    } else {
      student.supervisorType = "admin";
    }

    await student.save();

    res.json(student);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;