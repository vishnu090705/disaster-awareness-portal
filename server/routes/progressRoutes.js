import express from "express";
import ModuleProgress from "../models/ModuleProgress.js";
import Module from "../models/Module.js";
import { verifyToken } from "../middleware/verifyToken.js";
import User from "../models/User.js";

const router = express.Router();





// 2️⃣ Update Watched Section
router.post("/watch", verifyToken, async (req, res) => {
  const { moduleId, sectionId } = req.body;

  let progress = await ModuleProgress.findOne({
    userId: req.user.id,
    moduleId
  });

  if (!progress) {
    progress = await ModuleProgress.create({
      userId: req.user.id,
      moduleId,
      watchedSections: [],
      xpEarned: 0
    });
  }

  if (!progress.watchedSections.includes(sectionId)) {
    progress.watchedSections.push(sectionId);

    // Add XP for new section
    progress.xpEarned += 20;
  }

  const module = await Module.findById(moduleId);
  const totalSections = module.sections.length;

  const watchedCount = progress.watchedSections.length;

  progress.completionPercentage = Math.round(
    (watchedCount / totalSections) * 70
  );

  await progress.save();

  res.json(progress);
});

router.get("/:moduleId", verifyToken, async (req, res) => {
  try {
    const progress = await ModuleProgress.findOne({
      userId: req.user.id,
      moduleId: req.params.moduleId
    });

    if (!progress) {
      return res.json({
        watchedSections: [],
        completionPercentage: 0
      });
    }

    res.json(progress);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 3️⃣ Submit Quiz
router.post("/quiz", verifyToken, async (req, res) => {
  const { moduleId, score, totalQuestions } = req.body;

  let progress = await ModuleProgress.findOne({
    userId: req.user.id,
    moduleId
  });

  if (!progress) {
    progress = await ModuleProgress.create({
      userId: req.user.id,
      moduleId
    });
  }

  const percentage = (score / totalQuestions) * 100;
  const passed = percentage >= 60;

  // Store attempt
  progress.quizAttempts.push({
    score: percentage,
    passed
  });

  // 🧠 BEST SCORE UPDATE
  progress.bestScore = Math.max(progress.bestScore, percentage);

  // ✅ GIVE REWARDS ONLY FIRST TIME PASS
  if (passed && !progress.quizCompleted) {
    progress.quizCompleted = true;

    // 🎯 Add quiz completion XP
    progress.xpEarned += 50;

    // 🎯 High score bonus
    if (percentage >= 90) {
      progress.xpEarned += 50;
    }

    // 🎯 Module completion bonus
    progress.xpEarned += 30;

    // 🎯 Add 30% quiz contribution
    progress.completionPercentage = Math.min(
      progress.completionPercentage + 30,
      100
    );

    progress.isCompleted = true;
  }

  await progress.save();

  // 🏅 BADGE LOGIC
  if (passed && percentage >= 90) {
    const user = await User.findById(req.user.id);

    if (!user.badges.includes("Top Scorer")) {
      user.badges.push("Top Scorer");
      await user.save();
    }
  }

  res.json({
    message: passed ? "Quiz Passed 🎉" : "Quiz Failed ❌",
    passed,
    percentage
  });
});


// 🧠 Progress Calculation Logic
async function calculateProgress(progress) {
  const module = await Module.findById(progress.moduleId);

  const totalSections = module.sections.length;

  const watchedCount = progress.watchedSections.length;

  const sectionProgress = (watchedCount / totalSections) * 70; // 70% weight

  const quizProgress = progress.quizCompleted ? 30 : 0; // 30% weight

  progress.completionPercentage = Math.round(sectionProgress + quizProgress);

  await progress.save();
}


router.get("/can-attempt/:moduleId", verifyToken, async (req, res) => {
  const progress = await ModuleProgress.findOne({
    userId: req.user.id,
    moduleId: req.params.moduleId
  });

  if (!progress) {
    return res.json({ allowed: false });
  }

  const module = await Module.findById(req.params.moduleId);
  if (!module) {
  return res.status(200).json({
    totalSections: 0,
    completedSections: 0,
    progress: 0,
    message: "No modules available"
  });
}
  const totalSections = module.sections.length;

  const watchedPercent =
    (progress.watchedSections.length / totalSections) * 100;

  if (watchedPercent >= 80) {
    return res.json({ allowed: true });
  }

  res.json({
    allowed: false,
    message: "Watch at least 80% of sections to unlock quiz."
  });
});

router.get("/leaderboard/:moduleId", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id);

  const leaderboard = await ModuleProgress.find({
    moduleId: req.params.moduleId
  })
    .populate("userId", "name schoolName")
    .sort({ xpEarned: -1 })

  const schoolLeaderboard = leaderboard.filter(
    entry => entry.userId.schoolName === user.schoolName
  );

  res.json(schoolLeaderboard);
});

router.get("/total-xp/me", verifyToken, async (req, res) => {
  const result = await ModuleProgress.aggregate([
    { $match: { userId: req.user.id } },
    {
      $group: {
        _id: null,
        totalXP: { $sum: "$xpEarned" }
      }
    }
  ]);

  res.json(result[0] || { totalXP: 0 });
});
export default router;