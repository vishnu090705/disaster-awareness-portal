import express from "express";
import bcrypt from "bcryptjs";
import {verifyToken} from "../middleware/verifyToken.js";
import {verifyAdmin} from "../middleware/verifyAdmin.js";
import User from "../models/User.js";
import School from "../models/School.js";
import Module from "../models/Module.js";
import StudentProgress from "../models/StudentProgress.js";
import PDFDocument from "pdfkit";
import ModuleProgress from "../models/ModuleProgress.js";




const router = express.Router();


/* =========================================
   GET ALL PRINCIPALS
========================================= */
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const principals = await User.find({ role: "principal" });
    res.json(principals);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================================
   CREATE PRINCIPAL
========================================= */
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, email, password, schoolName } = req.body;

    if (!name || !email || !password || !schoolName) {
      return res.status(400).json({ message: "All fields required" });
    }

    const school = await School.findOne({ schoolName });

if (!school) {
  return res.status(404).json({ message: "School not found" });
}

if (school.principalId) {
  return res.status(400).json({
    message: "School already has a principal"
  });
}

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const principal = new User({
      name,
      email,
      password: hashed,
      role: "principal",
      schoolName,
      supervisorType: "principal"
    });

    await principal.save();

    school.principalId = principal._id;
    await school.save();

    // 🔥 Auto assign students to principal
    await User.updateMany(
      { role: "student", schoolName },
      { supervisorType: "principal" }
    );

    res.status(201).json(principal);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================================
   DELETE PRINCIPAL
========================================= */
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const principal = await User.findById(req.params.id);

    if (!principal || principal.role !== "principal") {
      return res.status(404).json({ message: "Principal not found" });
    }

    // Remove principal from school
    const school = await School.findOne({ schoolName: principal.schoolName });

    if (school) {
      school.principalId = null;
      await school.save();
    }

    // 🔥 Revert students back to admin
    await User.updateMany(
      { role: "student", schoolName: principal.schoolName },
      { supervisorType: "admin" }
    );

    await principal.deleteOne();

    res.json({ message: "Principal removed successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/stats",verifyToken ,async (req, res) => {
  try {
    
    const principal = await User.findById(req.user.id);
console.log("PRINCIPAL SCHOOL:", principal.schoolName);

const students = await User.find({
  role: "student",
  schoolName: principal.schoolName
});

console.log("FOUND STUDENTS:", students.length);


    const totalModules = await Module.countDocuments();

     let active = 0;
    let atRisk = 0;
    let completed = 0;
    let totalQuizScore = 0;
    let totalProgressPercent = 0;

    for (let student of students) {

       const progressData = await ModuleProgress.find({
        userId: student._id
      });

      const completedModules =
        progressData.filter(p => p.isCompleted).length;

      const avgQuiz =
        progressData.length > 0
          ? progressData.reduce((acc, p) => acc + (p.bestScore || 0), 0) /
            progressData.length
          : 0;

      const progressPercent =
        totalModules > 0
          ? (completedModules / totalModules) * 100
          : 0;

           totalQuizScore += avgQuiz;
      totalProgressPercent += progressPercent;

       const status =
        avgQuiz < 40
          ? "At Risk"
          : progressPercent === 100
          ? "Completed"
          : "Active";

        if (status === "Active") active++;
      if (status === "At Risk") atRisk++;
      if (status === "Completed") completed++;
    }

     const avgQuizScore =
      students.length
        ? Math.round(totalQuizScore / students.length)
        : 0;


       const avgProgress =
      students.length
        ? Math.round(totalProgressPercent / students.length)
        : 0;

      const preparednessScore =
      Math.round((avgQuizScore * 0.6) + (avgProgress * 0.4));

       res.json({
      totalStudents: students.length,
      active,
      atRisk,
      completed,
      avgQuiz: avgQuizScore,
      avgProgress,
      preparednessScore
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/students", verifyToken, async (req, res) => {
  try {
    
    const principal = await User.findById(req.user.id);

const students = await User.find({
  role: "student",
  schoolName: principal.schoolName
});

    const result = await Promise.all(
      students.map(async (student) => {

        const progressData = await ModuleProgress.find({
          userId: student._id
        });

        const totalModules = await Module.countDocuments();

        const completedModules = progressData.filter(p => p.isCompleted);

        const avgQuiz =
          progressData.length > 0
            ? progressData.reduce((acc, p) => acc + p.bestScore, 0) /
              progressData.length
            : 0;

        const progressPercent =
          totalModules > 0
            ? Math.round((completedModules.length / totalModules) * 100)
            : 0;

        const status =
          avgQuiz < 40
            ? "At Risk"
            : progressPercent === 100
            ? "Completed"
            : "Active";

        return {
          _id: student._id,
          name: student.name,
          class: student.class,
          progressPercent,
          avgQuiz: Math.round(avgQuiz),
          status
        };
      })
    );

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/students/:id", async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const progressData = await ModuleProgress.find({
      userId: student._id
    });

    const totalModules = await Module.countDocuments();

    const completedModules = progressData.filter(
      p => p.isCompleted
    );

    const avgQuiz =
      progressData.length > 0
        ? progressData.reduce((acc, p) => acc + p.bestScore, 0) /
          progressData.length
        : 0;

    const progressPercent =
      totalModules > 0
        ? Math.round((completedModules.length / totalModules) * 100)
        : 0;

    let status = "Active";

    if (progressPercent === 100) {
      status = "Completed";
    } else if (avgQuiz < 40) {
      status = "At Risk";
    }

    res.json({
      student,
      progressPercent,
      avgQuiz: Math.round(avgQuiz),
      status,
      modules: progressData
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/analytics", verifyToken,async (req, res) => {
  try {
    
    const principal = await User.findById(req.user.id);

const students = await User.find({
  role: "student",
  schoolName: principal.schoolName
});


    const totalModules = await Module.countDocuments();

    let active = 0;
    let atRisk = 0;
    let completed = 0;
    let totalQuizScore = 0;

    const performanceTrendMap = {};
    const classMap = {};

    for (let student of students) {

      const progressData = await ModuleProgress.find({
        userId: student._id
      });

      const completedModules =
        progressData.filter(p => p.isCompleted).length;

      const avgQuiz =
        progressData.length > 0
          ? progressData.reduce((acc, p) => acc + (p.bestScore || 0), 0) /
            progressData.length
          : 0;

      totalQuizScore += avgQuiz;

      const progressPercent =
        totalModules > 0
          ? (completedModules / totalModules) * 100
          : 0;

      const status =
        avgQuiz < 40
          ? "At Risk"
          : progressPercent === 100
          ? "Completed"
          : "Active";

      if (status === "Active") active++;
      if (status === "At Risk") atRisk++;
      if (status === "Completed") completed++;

      // 📊 Monthly trend
      const month = new Date(student.createdAt)
        .toLocaleString("default", { month: "short" });

      if (!performanceTrendMap[month]) {
        performanceTrendMap[month] = [];
      }
      performanceTrendMap[month].push(avgQuiz);

      // 📊 Class performance
      const className = student.class || "N/A";
      if (!classMap[className]) {
        classMap[className] = [];
      }
      classMap[className].push(avgQuiz);
    }

    const performanceTrend = Object.keys(performanceTrendMap).map(month => ({
      month,
      score: Math.round(
        performanceTrendMap[month].reduce((a, b) => a + b, 0) /
        performanceTrendMap[month].length
      )
    }));

    const classPerformance = Object.keys(classMap).map(cls => ({
      class: cls,
      avg: Math.round(
        classMap[cls].reduce((a, b) => a + b, 0) /
        classMap[cls].length
      )
    }));

    res.json({
      totalStudents: students.length,
      active,
      atRisk,
      completed,
      avgQuiz: students.length
        ? Math.round(totalQuizScore / students.length)
        : 0,
      performanceTrend,
      classPerformance
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/reports", verifyToken,async (req, res) => {
  try {
    const { className, risk } = req.query;

    const principal = await User.findById(req.user.id);

let studentFilter = {
  role: "student",
  schoolName: principal.schoolName
};

if (className) studentFilter.class = className;
    if (className) studentFilter.class = className;

    const students = await User.find(studentFilter);
    const totalModules = await Module.countDocuments();

    const result = [];

    for (let student of students) {
      const progressData = await ModuleProgress.find({
        userId: student._id
      });

      const completedModules =
        progressData.filter(p => p.isCompleted).length;

      const avgQuiz =
        progressData.length > 0
          ? progressData.reduce((acc, p) => acc + (p.bestScore || 0), 0) /
            progressData.length
          : 0;

      const progressPercent =
        totalModules > 0
          ? Math.round((completedModules / totalModules) * 100)
          : 0;

      const status =
        avgQuiz < 40
          ? "At Risk"
          : progressPercent === 100
          ? "Completed"
          : "Active";

      if (risk && status !== risk) continue;

      result.push({
        _id: student._id,
        name: student.name,
        className: student.class || "N/A",
        quizScore: Math.round(avgQuiz),
        status
      });
    }

    const totalStudents = result.length;
    const atRisk = result.filter(s => s.status === "At Risk").length;
    const avgQuiz =
      totalStudents > 0
        ? Math.round(
            result.reduce((acc, s) => acc + s.quizScore, 0) /
              totalStudents
          )
        : 0;

    res.json({
      totalStudents,
      atRisk,
      avgQuiz,
      students: result
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/reports/export", verifyToken,async (req, res) => {
  
  const principal = await User.findById(req.user.id);

const students = await User.find({
  role: "student",
  schoolName: principal.schoolName
});

  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

  doc.pipe(res);

  doc.fontSize(20).text("Disaster Awareness Report", { align: "center" });
  doc.moveDown();

  students.forEach((s) => {
    doc
      .fontSize(12)
      .text(`${s.name} | ${s.className} | ${s.quizScore}% | ${s.status}`);
  });

  doc.end();
});

router.get("/classes", verifyToken,async (req, res) => {
  try {
    const principal = await User.findById(req.user.id);

const classes = await User.distinct("class", {
  role: "student",
  schoolName: principal.schoolName,
  class: { $ne: null }
});

    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



export default router;