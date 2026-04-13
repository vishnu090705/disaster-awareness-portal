import express from "express";
import School from "../models/School.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();

/* ================================
   CREATE SCHOOL
================================ */
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { schoolName } = req.body;

    if (!schoolName)
      return res.status(400).json({ message: "School name required" });

    const exists = await School.findOne({ schoolName });

    if (exists)
      return res.status(400).json({ message: "School already exists" });

    const school = await School.create({ schoolName });

    res.status(201).json(school);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================================
   GET ACTIVE SCHOOLS
================================ */
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const schools = await School.find()
      .populate("principalId", "name")
      .lean();

    const schoolsWithCounts = await Promise.all(
      schools.map(async (school) => {
        const studentCount = await User.countDocuments({
  role: "student",
  schoolName: school.schoolName
});

        return {
          ...school,
          studentCount
        };
      })
    );

    res.json(schoolsWithCounts);
  } catch (err) {
  console.error("🔥 ADMIN SCHOOL ROUTE ERROR:");
  console.error(err);
  console.error(err.stack);
  res.status(500).json({ 
    message: "Server error",
    error: err.message 
  });
}
});

/* ================================
   GET ARCHIVED SCHOOLS
================================ */
router.get("/archived", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const schools = await School.find({ isActive: false });
    res.json(schools);
  } catch (err) {
  console.error("🔥 ADMIN SCHOOL ROUTE ERROR:");
  console.error(err);
  console.error(err.stack);
  res.status(500).json({ 
    message: "Server error",
    error: err.message 
  });
}
});

/* ================================
   RENAME SCHOOL (CASCADE)
================================ */
router.put("/:id/rename", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { newName } = req.body;

    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ message: "School not found" });

    const duplicate = await School.findOne({ schoolName: newName });
    if (duplicate)
      return res.status(400).json({ message: "School name already exists" });

    const oldName = school.schoolName;

    school.schoolName = newName;
    await school.save();

    await User.updateMany(
      { schoolName: oldName },
      { schoolName: newName }
    );

    res.json({ message: "School renamed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================================
   ARCHIVE SCHOOL (CASCADE)
================================ */
router.put("/:id/archive", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ message: "School not found" });

    school.isActive = false;
    await school.save();

    // Archive principal
    await User.updateMany(
      { role: "principal", schoolName: school.schoolName },
      { isActive: false }
    );

    // Unassign students
    await User.updateMany(
      { schoolName: school.schoolName },
      { schoolName: null, principalId: null }
    );

    res.json({ message: "School archived successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================================
   RESTORE SCHOOL
================================ */
router.put("/:id/restore", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ message: "School not found" });

    school.isActive = true;
    await school.save();

    res.json({ message: "School restored successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/status", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    // Toggle status
    school.isActive = !school.isActive;

    await school.save();

    res.json({
      message: `School ${school.isActive ? "activated" : "deactivated"} successfully`,
      isActive: school.isActive
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    await School.findByIdAndDelete(req.params.id);

    res.json({ message: "School deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;