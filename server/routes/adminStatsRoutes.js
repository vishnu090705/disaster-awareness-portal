import express from "express";
import {verifyToken} from "../middleware/verifyToken.js";
import {verifyAdmin} from "../middleware/verifyAdmin.js";
import User from "../models/User.js";
import School from "../models/School.js";

const router = express.Router();   // 🔥 THIS WAS MISSING

router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalSchools = await School.countDocuments();
    const activeSchools = await School.countDocuments({ isActive: true });
    const inactiveSchools = await School.countDocuments({ isActive: false });

    const totalStudents = await User.countDocuments({ role: "student" });
    const totalPrincipals = await User.countDocuments({ role: "principal" });

    const unassignedStudents = await User.countDocuments({
      role: "student",
      schoolName: { $in: [null, ""] }
    });

 // Find schools that have a principal
const schoolsWithPrincipal = await School.find({
  principalId: { $ne: null }
});

const schoolNames = schoolsWithPrincipal.map(s => s.schoolName);

// Students supervised by principal
const principalSupervised = await User.countDocuments({
  role: "student",
  schoolName: { $in: schoolNames }
});

// Students supervised by admin
const adminSupervised = await User.countDocuments({
  role: "student",
  schoolName: { $nin: schoolNames }
});

    // 🔥 Schools Breakdown
    const schools = await School.find();

    const schoolsBreakdown = await Promise.all(
      schools.map(async (school) => {
        const studentCount = await User.countDocuments({
          role: "student",
          schoolName: school.schoolName
        });

        const principal = await User.findOne({
          role: "principal",
          schoolName: school.schoolName
        });

        return {
          schoolName: school.schoolName,
          isActive: school.isActive,
          studentCount,
          principalName: principal ? principal.name : "None"
        };
      })
    );

    res.json({
      totalSchools,
      activeSchools,
      inactiveSchools,
      totalStudents,
      totalPrincipals,
      unassignedStudents,
      adminSupervised,
      principalSupervised,
      schools: schoolsBreakdown
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;   // 🔥 REQUIRED