import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bgImage from "/images/dashboard-bg-1.jpg";

export default function CreateQuiz() {

  const [moduleId, setModuleId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [modules, setModules] = useState([]);
  const [quizLevel, setQuizLevel] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchModules();
  }, []);

const fetchModules = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/modules", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    console.log("Modules fetched:", res.data);   // 👈 add this
    setModules(res.data);

  } catch (error) {
    console.error("Error fetching modules:", error);
  }
};


  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        type: "MCQ",
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        marks: 1
      }
    ]);
  };

 const updateQuestion = (index, field, value) => {
  const updated = [...questions];
  updated[index][field] = value;

  if (field === "type") {

    if (value === "SHORT") {
      updated[index].options = [];
      updated[index].correctAnswer = "";
    }

    if (value === "TRUE_FALSE") {
      updated[index].options = ["True", "False"];
      updated[index].correctAnswer = "";
    }

    if (value === "MCQ") {
      updated[index].options = ["", "", "", ""];
      updated[index].correctAnswer = "";
    }

  }

  setQuestions(updated);
};

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };
  const deleteQuestion = (index) => {
  const updated = questions.filter((_, i) => i !== index);
  setQuestions(updated);
};

const moveQuestionUp = (index) => {
  if (index === 0) return;
  const updated = [...questions];
  [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
  setQuestions(updated);
};

const moveQuestionDown = (index) => {
  if (index === questions.length - 1) return;
  const updated = [...questions];
  [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
  setQuestions(updated);
};

const handleSubmit = async () => {
  console.log({
  moduleId,
  title,
  description,
  quizLevel,
  questions
});

if (questions.length === 0) {
  alert("Please add at least one question");
  return;
}
console.log(JSON.stringify(questions, null, 2));


const formattedQuestions = questions.map((q) => {
  if (q.type === "SHORT") {
    return {
      type: "SHORT",
      questionText: q.questionText,
      options: [],              // ✅ empty array
      correctAnswer: q.correctAnswer,
      marks: q.marks || 1
    };
  }

  if (q.type === "TRUE_FALSE") {
    return {
      type: "TRUE_FALSE",
      questionText: q.questionText,
      options: ["True", "False"],
      correctAnswer: q.correctAnswer,
      marks: q.marks || 1
    };
  }

  // MCQ
  return {
    type: "MCQ",
    questionText: q.questionText,
    options: q.options.filter(opt => opt.trim() !== ""), // remove empty strings
    correctAnswer: q.correctAnswer,
    marks: q.marks || 1
  };
});
  try {
await axios.post(
  "http://localhost:5000/api/quizzes",
  {
    moduleId,
    title,
    description,
    level: quizLevel,
    questions: formattedQuestions
  },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    alert("Quiz Created Successfully ✅");
    navigate("/admin/quizzes");

  } catch (err) {
    console.error(err);
    alert("Error creating quiz");
  }
};
      
return (
  <div
    style={{
      minHeight: "100vh",
      backgroundImage: `url(${bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "40px"
    }}
  >
    <div className="quiz-card">
      <h2>🧠 Create New Quiz</h2>

      <div className="form-row">
        <label>Module</label>
        <select value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
          <option value="">Select Module</option>
          {modules.map((mod) => (
            <option key={mod._id} value={mod._id}>
              {mod.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>Quiz Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter quiz title"
        />
      </div>

      <div className="form-row">
        <label>Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
        />
      </div>

     <div className="form-row">
  <label>Quiz Level</label>
  <select
    value={quizLevel}
    onChange={(e) => setQuizLevel(e.target.value)}
  >
    <option value="">Select Level</option>
    <option value="very-easy">Very Easy (Below 3rd)</option>
    <option value="easy">Easy (3rd - 5th)</option>
    <option value="medium">Medium (6th - 8th)</option>
    <option value="hard">Hard (9th - 10th)</option>
  </select>
</div>

      <hr style={{ margin: "25px 0", opacity: 0.3 }} />

<h3 style={{ marginBottom: "15px" }}>📝 Questions</h3>

{questions.map((q, index) => (
  <div key={index} className="question-box">

    {/* Header */}
    <div className="question-header">
      <strong>Question {index + 1}</strong>
      <div className="question-actions">
        <button onClick={() => moveQuestionUp(index)}>⬆</button>
        <button onClick={() => moveQuestionDown(index)}>⬇</button>
        <button onClick={() => deleteQuestion(index)}>❌</button>
      </div>
    </div>

    {/* Question Type */}
    <select
      value={q.type}
      onChange={(e) =>
        updateQuestion(index, "type", e.target.value)
      }
    >
      <option value="MCQ">MCQ</option>
      <option value="TRUE_FALSE">True / False</option>
      <option value="SHORT">Short Answer</option>
    </select>

    {/* Question Text */}
    <input
      type="text"
      placeholder="Enter question"
      value={q.questionText}
      onChange={(e) =>
        updateQuestion(index, "questionText", e.target.value)
      }
    />

    {/* ================= MCQ ================= */}
    {q.type === "MCQ" && (
      <>
        {q.options.map((opt, optIndex) => (
          <input
            key={optIndex}
            type="text"
            placeholder={`Option ${optIndex + 1}`}
            value={opt}
            onChange={(e) =>
              updateOption(index, optIndex, e.target.value)
            }
          />
        ))}

        <select
          value={q.correctAnswer}
          onChange={(e) =>
            updateQuestion(index, "correctAnswer", e.target.value)
          }
        >
          <option value="">Select Correct Answer</option>
          {q.options.map((opt, optIndex) => (
            <option key={optIndex} value={opt}>
              {opt || `Option ${optIndex + 1}`}
            </option>
          ))}
        </select>
      </>
    )}

    {/* ================= TRUE / FALSE ================= */}
    {q.type === "TRUE_FALSE" && (
      <select
        value={q.correctAnswer}
        onChange={(e) =>
          updateQuestion(index, "correctAnswer", e.target.value)
        }
      >
        <option value="">Select Correct Answer</option>
        <option value="True">True</option>
        <option value="False">False</option>
      </select>
    )}

    {/* ================= SHORT ANSWER ================= */}
    {q.type === "SHORT" && (
      <input
        type="text"
        placeholder="Enter correct answer"
        value={q.correctAnswer}
        onChange={(e) =>
          updateQuestion(index, "correctAnswer", e.target.value)
        }
      />
    )}

  </div>
))}

<button
  type="button"
  className="add-question-btn"
  onClick={addQuestion}
>
  + Add Question
</button>

<button
  type="button"
  className="preview-btn"
  onClick={() => setShowPreview(true)}
>
  👁 Preview Quiz
</button>
      <button className="create-btn" onClick={handleSubmit}>
        Create Quiz
      </button>


{showPreview && (
  <div className="preview-overlay">
    <div className="preview-card">
      <h2>Quiz Preview</h2>

      <h3>{title}</h3>
      <p>{description}</p>
      <p><strong>Level:</strong> {quizLevel}</p>

      {questions.map((q, index) => (
        <div key={index} className="preview-question">
          <p><strong>Q{index + 1}:</strong> {q.questionText}</p>

          {q.type === "MCQ" &&
            q.options.map((opt, i) => (
              <p key={i}>• {opt}</p>
            ))}

          {q.type === "TRUE_FALSE" && (
            <>
              <p>• True</p>
              <p>• False</p>
            </>
          )}
        </div>
      ))}

      <button onClick={() => setShowPreview(false)}>
        Close Preview
      </button>
    </div>
  </div>
)}
  <button
    onClick={() => navigate("/admin")}
    style={{
      padding: "8px 16px",
      background: "#2196F3",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "bold"
    }}
  >
    ← Back to Dashboard
  </button>
    </div>
    
  </div>
)
}