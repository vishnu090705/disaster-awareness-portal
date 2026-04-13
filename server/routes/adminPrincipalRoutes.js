import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import School from "../models/School.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();


router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, email, schoolName } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const generatedPassword = "Temp@" + Math.floor(1000 + Math.random() * 9000);

    console.log("Generated Password:", generatedPassword);

    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

   const principal = await User.create({
  name,
  email,
  password: hashedPassword,
  role: "principal",
  schoolName: schoolName || "",
  mustChangePassword: true
});

    res.json({
      message: "Principal created successfully",
      generatedPassword // ✅ return plain password
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const principals = await User.find({ role: "principal" });
    res.json(principals);
    console.log("Incoming:", req.body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/assign", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { schoolName, principalId } = req.body;

    const school = await School.findOne({ schoolName });

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    // 🔒 Rule: One school = One principal
    if (school.principalId) {
      return res.status(400).json({
        message: "School already has a principal assigned"
      });
    }

    // 🔒 Rule: Principal cannot manage multiple schools
    const alreadyAssigned = await School.findOne({ principalId });
    if (alreadyAssigned) {
      return res.status(400).json({
        message: "Principal already assigned to another school"
      });
    }

    // ✅ Assign principal to school
    school.principalId = principalId;
    await school.save();

    // ✅ Automatic student assignment
    await User.updateMany(
      { role: "student", schoolName },
      { $set: { principalId } }
    );

    res.json({
      message: "Principal assigned successfully and students updated"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/remove", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { schoolName } = req.body;

    const school = await School.findOne({ schoolName });

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    const removedPrincipalId = school.principalId;

    if (!removedPrincipalId) {
      return res.status(400).json({ message: "No principal assigned to this school" });
    }

    // 1️⃣ Remove principal from school
    school.principalId = null;
    await school.save();

    // 2️⃣ Remove school reference from principal
    await User.findByIdAndUpdate(
      removedPrincipalId,
      { $set: { schoolName: null } }
    );

    // 3️⃣ Revert students
    await User.updateMany(
      { role: "student", schoolName },
      { $set: { principalId: null } }
    );

    res.json({
      message: "Principal removed successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const principal = await User.findById(req.params.id);

    if (!principal) {
      return res.status(404).json({ message: "Principal not found" });
    }

    if (principal.schoolName) {
      const schoolExists = await School.findOne({
        schoolName: principal.schoolName
      });

      if (schoolExists) {
        return res.status(400).json({
          message: "Remove school first before deleting principal"
        });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "Principal deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/assign", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { schoolName } = req.body;

    if (!schoolName) {
      return res.status(400).json({ message: "School name required" });
    }

    const principal = await User.findById(req.params.id);

    if (!principal || principal.role !== "principal") {
      return res.status(404).json({ message: "Principal not found" });
    }

    principal.schoolName = schoolName;
    await principal.save();

    res.json({ message: "Principal assigned successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;