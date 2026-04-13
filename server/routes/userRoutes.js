import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {verifyToken} from "../middleware/verifyToken.js";

const router = express.Router();

/* =========================
   UPDATE PROFILE (Mobile)
========================= */
router.put("/update-profile", verifyToken, async (req, res) => {
  try {
    const { mobile } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.mobile = mobile;
    await user.save();

    res.json({ message: "Profile updated successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   CHANGE PASSWORD
========================= */
router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid)
      return res.status(400).json({ message: "Current password incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password changed successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/current-module", verifyToken, async (req, res) => {
  try {
    const { moduleId } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.currentModule = moduleId;
    await user.save();

    res.json({ message: "Current module updated" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;