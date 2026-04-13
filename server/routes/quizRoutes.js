import express from "express";
import Quiz from "../models/Quiz.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";
import User from "../models/User.js";
import ModuleProgress from "../models/ModuleProgress.js";
const router = express.Router();


router.get("/test", (req, res) => {
  res.json({ message: "Quiz route working" });
});

router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { moduleId, title, description, level, questions } = req.body;

    const quiz = await Quiz.create({
  moduleId,
  title,
  description,
  level,
  questions
});

    res.json({ message: "Quiz created", quiz });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/", verifyToken, verifyAdmin, async (req, res) => {
 try {

    const quizzes = await Quiz.find()
         .populate("moduleId", "name");  

    res.json(quizzes);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/single/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/module/:moduleId", verifyToken, async (req, res) => {
  try {
    // 🔥 1. Get student
    const student = await User.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 🔥 2. Convert class properly
    const studentClass = parseInt(student.class);

    // 🔥 3. Map class → level
    let level;

    if (studentClass < 3) level = "very-easy";
    else if (studentClass <= 5) level = "easy";
    else if (studentClass <= 8) level = "medium";
    else level = "hard";

    console.log("Class:", studentClass);
    console.log("Level:", level);

    // 🔥 4. Fetch correct quiz
    const quiz = await Quiz.findOne({
      moduleId: req.params.moduleId,
      level: level   // ✅ THIS IS THE FIX
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found for your level"
      });
    }

    // 🔥 5. Filter questions (same as your code)
    const filteredQuestions = quiz.questions.map(q => ({
      type: q.type,
      questionText: q.questionText,
      options: q.options,
      marks: q.marks
    }));

    res.json({
      _id: quiz._id,
      title: quiz.title,
      questions: filteredQuestions
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:quizId/attempt", verifyToken, async (req, res) => {
  try {
    const { answers } = req.body;

    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    let totalMarks = 0;
    let obtainedMarks = 0;
    let results = [];
    quiz.questions.forEach((q, index) => {
      totalMarks += q.marks;

      const studentAnswer = answers[index];

     const isCorrect =
    studentAnswer &&
    studentAnswer.toString().trim().toLowerCase() ===
    q.correctAnswer.toString().trim().toLowerCase();

  if (isCorrect) {
    obtainedMarks += q.marks;
  }
      results.push({
    question: q.questionText,
    correctAnswer: q.correctAnswer,
    studentAnswer: studentAnswer || "Not Answered",
    isCorrect
  });
    });

    const percentage = (obtainedMarks / totalMarks) * 100;
    const passed = percentage >= 60;

    // 🔥 Update ModuleProgress
    let progress = await ModuleProgress.findOne({
      userId: req.user.id,
      moduleId: quiz.moduleId
    });

    if (!progress) {
      progress = await ModuleProgress.create({
        userId: req.user.id,
        moduleId: quiz.moduleId
      });
    }

    progress.quizAttempts.push({
      score: percentage,
      passed
    });

    progress.bestScore = Math.max(progress.bestScore, percentage);

    // XP only first pass
    if (passed && !progress.quizCompleted) {
      progress.quizCompleted = true;

      progress.xpEarned += 50;

      if (percentage >= 90) {
        progress.xpEarned += 50;
      }

      progress.xpEarned += 30;

      progress.completionPercentage = Math.min(
        progress.completionPercentage + 30,
        100
      );

      progress.isCompleted = true;
    }

    await progress.save();

    res.json({
      percentage,
      passed,
      results 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: "Quiz deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id/analytics", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    const attempts = await ModuleProgress.find({
      moduleId: quiz.moduleId
    });

    let totalAttempts = 0;
    let totalPass = 0;
    let avgScore = 0;

    attempts.forEach(progress => {
      progress.quizAttempts.forEach(a => {
        totalAttempts++;
        avgScore += a.score;
        if (a.passed) totalPass++;
      });
    });

    avgScore = totalAttempts ? avgScore / totalAttempts : 0;

    res.json({
      totalAttempts,
      totalPass,
      avgScore: avgScore.toFixed(2)
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ADMIN: Update Quiz */
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, description, level, questions } = req.body;

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        level,
        questions
      },
      { new: true }
    );

    if (!updatedQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json({ message: "Quiz updated successfully", updatedQuiz });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/student/:quizId", verifyToken, async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);

  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  const filteredQuestions = quiz.questions.map(q => ({
    type: q.type,
    questionText: q.questionText,
    options: q.options,
    marks: q.marks
  }));

  res.json({
    _id: quiz._id,
    title: quiz.title,
    questions: filteredQuestions
  });
});

router.get("/module/:moduleId", verifyToken, async (req, res) => {
 console.log("Module route hit");
  res.json({ message: "Module route hit" });
});
export default router;
