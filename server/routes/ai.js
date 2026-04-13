import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import ChatHistory from "../models/ChatHistory.js";
import Module from "../models/Module.js";
import User from "../models/User.js";


const router = express.Router();


router.post("/chat", verifyToken, async (req, res) => {
  try {
    const { message, moduleId } = req.body;

    const user = await User.findById(req.user.id);
    const module = await Module.findById(moduleId);

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    const disasterName = module.name;
    const studentClass = user.class;

    // 🎯 SYSTEM PROMPT
const systemPrompt = `
You are a disaster safety tutor for school students.

STRICT RULES:
- Answer ONLY about: ${disasterName}
- Maximum 5 bullet points ONLY
- Each point = ONE SHORT LINE
- Use symbol "•" for bullets
- NO paragraphs
- NO long explanations
- Use VERY SIMPLE words

Class Level: ${studentClass}

Rules by class:
- 1–5 → very simple words (like a child)
- 6–8 → simple explanation
- 9–10 → slightly detailed but still short

Focus ONLY on:
✔ What to do
✔ Safety steps

DO NOT:
❌ Give general advice  
❌ Write stories  
❌ Use complex words  
❌ Add unnecessary details  

EXAMPLE FORMAT:

• Stay calm  
• Move away from danger  
• Call for help  
• Follow safety instructions  
• Go to safe place  

Follow this format strictly.
`;
    // 📦 Chat history
    let chat = await ChatHistory.findOne({
      userId: user._id,
      moduleId
    });

    if (!chat) {
      chat = await ChatHistory.create({
        userId: user._id,
        moduleId,
        disasterName,
        studentClass,
        messages: []
      });
    }

    // Save student message
    chat.messages.push({
      role: "student",
      content: message
    });

    // 🧠 Prepare conversation
   const recentMessages = chat.messages.slice(-3); // 🔥 reduce

const conversation = recentMessages
  .map(m => `${m.role === "student" ? "User" : "AI"}: ${m.content}`)
  .join("\n");
    const fullPrompt = `
${systemPrompt}

Conversation:
${conversation}

AI:
`;
// 🤖 OLLAMA CALL
// 🤖 OLLAMA CALL
console.log("STEP 1 - OLLAMA");

const aires = await fetch("http://localhost:11434/api/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "phi3",
    prompt: fullPrompt,
    stream: false,
    format: "json",
    options: {
      temperature: 0.3,
      num_predict: 150
    }
  })
});
const text = await aires.text();

// 🧠 Extract last valid JSON
const lines = text.trim().split("\n");
const lastLine = lines[lines.length - 1];

const data = JSON.parse(lastLine);

console.log("OLLAMA RESPONSE:", data);

// ✅ CORRECT WAY
let aiReply = data.response?.trim();

if (!aiReply) {
  aiReply = "⚠️ Try asking in a simpler way (short question)";
}

console.log("STEP 2");



  // 🧹 FORCE CLEAN FORMAT
aiReply = aiReply
  .split("\n")
  .filter(line => line.trim() !== "")
  .slice(0, 5)
  .map(line => line.startsWith("•") ? line : `• ${line}`)
  .join("\n");

// ✅ NOW SAVE CLEAN DATA
chat.messages.push({
  role: "ai",
  content: aiReply
});

await chat.save();

   return res.json({ reply: aiReply.trim() });

  } catch (error) {
  console.error("FULL AI ERROR:", error);
  console.error("MESSAGE:", error.message);

   return res.json({
      reply: "AI is temporarily unavailable. Please try again."
    });
   
  }
});

export default router;