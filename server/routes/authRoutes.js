import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import School from "../models/School.js"; 
import {verifyToken} from "../middleware/verifyToken.js";


const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const {
  role,
  name,
  rollNo,
  class: studentClass,
  schoolId,
  mobile,
  password
} = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

   const newUser = new User({
  role,
  name,
  rollNo,
  class: studentClass,
  schoolId,
  mobile,
  password: hashedPassword
});

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { role, identifier, password } = req.body;

    if (!role || !identifier || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    let user;

    // 🔍 Find user based on role
    if (role === "student") {
      user = await User.findOne({ rollNo: identifier });
    } else if (role === "principal" || role === "admin") {
      user = await User.findOne({ email: identifier });
    } else {
      return res.status(400).json({ message: "Invalid role type" });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.role !== role) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    // 🔐 Password check
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🚫 Principal school validation
    if (role === "principal") {
      if (!user.schoolName) {
        return res.status(400).json({ message: "No school assigned" });
      }

      const school = await School.findOne({ schoolName: user.schoolName });

      if (!school || !school.isActive) {
        return res.status(400).json({
          message: "School is inactive. Contact admin."
        });
      }
    }

    // 🎟 Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      role: user.role,
      mustChangePassword: user.mustChangePassword || false
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password required" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(req.user.id, {
      password: hashedPassword,
      mustChangePassword: false
    });

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;