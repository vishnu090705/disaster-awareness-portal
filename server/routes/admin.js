const ChatHistory = require("../models/ChatHistory");

router.get("/ai-logs", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const logs = await ChatHistory.find()
    .populate("userId", "name email")
    .populate("moduleId", "name");

  res.json(logs);
});