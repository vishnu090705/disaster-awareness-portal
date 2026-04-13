import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import Ticket from "../models/Ticket.js";

const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "principal") {
      return res.status(403).json({ message: "Only principal can raise ticket" });
    }

    const { issue, type, studentId } = req.body;

    const ticket = await Ticket.create({
      principalId: req.user.id,
      studentId: type === "student" ? studentId : null,
      type,
      issue
    });

    res.json(ticket);
  } catch (error) {
    console.error("Ticket Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/stats", verifyToken, async (req, res) => {
  try {
    const principalId = req.user.id;

    const total = await Ticket.countDocuments({ principalId });

    const studentIssues = await Ticket.countDocuments({
      principalId,
      type: "student"
    });

   const schoolIssues = await Ticket.countDocuments({ 
    principalId,
    type: "school" 
  });

    const open = await Ticket.countDocuments({
      principalId,
      status: "Open"
    });

    const inProgress = await Ticket.countDocuments({
      principalId,
      status: "In Progress"
    });

    const resolved = await Ticket.countDocuments({
      principalId,
      status: "Resolved"
    });

    res.json({
      totalRequests: total,
      studentIssues,
      schoolIssues,
      open,
      inProgress,
      resolved
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/all", verifyToken, async (req, res) => {
   try {
    if (req.user.role?.toLowerCase() !== "admin") {
  return res.status(403).json({ message: "Admin access required" });
    }

    const tickets = await Ticket.find()
      .populate("principalId", "name email")
      .populate("studentId", "name class rollNo")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/status", verifyToken, async (req, res) => {
  try {
    if (req.user.role?.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { status } = req.body;

    const updated = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;