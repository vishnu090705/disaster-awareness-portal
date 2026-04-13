import express from "express";
import {verifyToken} from "../middleware/verifyToken.js";
import {verifyAdmin} from "../middleware/verifyAdmin.js";
import School from "../models/School.js";
import User from "../models/User.js";

const router = express.Router();

/* =========================================
   PUBLIC SCHOOL LIST (FOR SIGNUP)
========================================= */
router.get("/public", async (req, res) => {
  try {
    const schools = await School.find().select("schoolName");

    res.json(schools);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});



/* =========================================
   GET ALL SCHOOLS
========================================= */
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const schools = await School.find().populate("principalId", "name email");

    const enrichedSchools = await Promise.all(
      schools.map(async (school) => {
        const studentCount = await User.countDocuments({
          role: "student",
          schoolName: school.schoolName
        });

        return {
          ...school._doc,
          studentCount
        };
      })
    );

    res.json(enrichedSchools);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================================
   CREATE SCHOOL
========================================= */
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { schoolName } = req.body;

    if (!schoolName) {
      return res.status(400).json({ message: "School name required" });
    }

    const existing = await School.findOne({ schoolName });
    if (existing) {
      return res.status(400).json({ message: "School already exists" });
    }

    const school = new School({ schoolName });
    await school.save();

    res.status(201).json(school);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================================
   DELETE SCHOOL
========================================= */
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    if (school.principalId) {
      return res.status(400).json({
        message: "Remove principal before deleting school"
      });
    }

    // Move students to admin supervision
    await User.updateMany(
      { schoolName: school.schoolName },
      {
        schoolName: "",
        supervisorType: "admin"
      }
    );

    await school.deleteOne();

    res.json({ message: "School deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/assign-principal", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { principalId, schoolId } = req.body;

    const principal = await User.findById(principalId);
    const school = await School.findById(schoolId);

    if (!principal || !school) {
      return res.status(404).json({ message: "Principal or School not found" });
    }

    // Assign school to principal
    principal.schoolName = school.schoolName;
    await principal.save();

    // Assign principal to school
    school.principalId = principal._id;
    await school.save();

    res.json({ message: "Principal assigned successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;