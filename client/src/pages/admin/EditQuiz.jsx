import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import bgImage from "/images/dashboard-bg-1.jpg"; 

export default function EditQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/quizzes/single/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );
    setQuiz(res.data);
  };

  const updateField = (field, value) => {
    setQuiz({ ...quiz, [field]: value });
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...quiz.questions];
    updated[index][field] = value;
    setQuiz({ ...quiz, questions: updated });
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...quiz.questions];
    updated[qIndex].options[optIndex] = value;
    setQuiz({ ...quiz, questions: updated });
  };

  const addQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          type: "MCQ",
          questionText: "",
          options: ["", "", "", ""],
          correctAnswer: "",
          marks: 1
        }
      ]
    });
  };

  const removeQuestion = (index) => {
    const updated = quiz.questions.filter((_, i) => i !== index);
    setQuiz({ ...quiz, questions: updated });
  };

  const handleUpdate = async () => {
    await axios.put(
      `http://localhost:5000/api/quizzes/${id}`,
      quiz,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    alert("Quiz Updated Successfully ✅");
    navigate("/admin/quizzes");
  };

  if (!quiz) return <div>Loading...</div>;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        padding: "40px"
      }}
    >
        <div
      style={{
        background: "rgba(0,0,0,0.65)",
        padding: "30px",
        borderRadius: "15px",
        color: "white"
      }}
    >
        <div className="edit-quiz-container">
  <div className="edit-quiz-card">
    <div style={{ padding: "40px" }}>
      <h2>Edit Quiz</h2>

      <input
        value={quiz.title}
        onChange={(e) => updateField("title", e.target.value)}
        placeholder="Title"
      />

      <input
        value={quiz.description}
        onChange={(e) => updateField("description", e.target.value)}
        placeholder="Description"
      />

      <div>
         <label>Quiz Level:</label>
<select
  value={quiz.level}
  onChange={(e) =>
    setQuiz({
      ...quiz,
      level: e.target.value
    })
  }
>
  <option value="very-easy">Very Easy</option>
  <option value="easy">Easy</option>
  <option value="medium">Medium</option>
  <option value="hard">Hard</option>
</select>
      </div>

      <div>
        <label>Unlocked:</label>
        <label className="switch">
  <input
    type="checkbox"
    checked={quiz.isUnlocked}
    onChange={(e) =>
      setQuiz({ ...quiz, isUnlocked: e.target.checked })
    }
  />
  <span className="slider"></span>
</label>
      </div>

      <hr />

      <h3>Questions</h3>

      {quiz.questions.map((q, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "20px"
          }}
        >
          <select
            value={q.type}
            onChange={(e) =>
              updateQuestion(index, "type", e.target.value)
            }
          >
            <option value="MCQ">MCQ</option>
            <option value="TRUE_FALSE">True/False</option>
            <option value="SHORT">Short Answer</option>
          </select>

          <input
            value={q.questionText}
            onChange={(e) =>
              updateQuestion(index, "questionText", e.target.value)
            }
            placeholder="Question"
          />

          {q.type === "MCQ" &&
            q.options.map((opt, optIndex) => (
              <input
                key={optIndex}
                value={opt}
                placeholder={`Option ${optIndex + 1}`}
                onChange={(e) =>
                  updateOption(index, optIndex, e.target.value)
                }
              />
            ))}

          <input
            value={q.correctAnswer}
            onChange={(e) =>
              updateQuestion(index, "correctAnswer", e.target.value)
            }
            placeholder="Correct Answer"
          />

          <input
            type="number"
            value={q.marks}
            onChange={(e) =>
              updateQuestion(index, "marks", Number(e.target.value))
            }
            placeholder="Marks"
          />

          <button onClick={() => removeQuestion(index)}>
            Remove Question
          </button>
        </div>
      ))}

      <button onClick={addQuestion}>Add Question</button>

      <br /><br />

      <button onClick={handleUpdate}>Update Quiz</button>
    </div>
    </div>
    </div>
    
    </div>
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
  );
}