import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bgImage from "/images/dashboard-bg-1.jpg"; 

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/quizzes",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );
    setQuizzes(res.data);
  };

  const deleteQuiz = async (id) => {
    if (!window.confirm("Delete this quiz?")) return;

    await axios.delete(
      `http://localhost:5000/api/quizzes/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    fetchQuizzes();
  };

  const viewAnalytics = async (id) => {
    const res = await axios.get(
      `http://localhost:5000/api/quizzes/${id}/analytics`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    alert(`
Attempts: ${res.data.totalAttempts}
Passed: ${res.data.totalPass}
Avg Score: ${res.data.avgScore}%
`);
  };

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
    <div style={{ padding: "40px" }}>
      <h2>All Quizzes</h2>

      <table border="1" width="100%">
        <thead>
          <tr>
            <th>Title</th>
            <th>Module</th>
            <th>Class Range</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {quizzes.map(q => (
            <tr key={q._id}>
              <td>{q.title}</td>
              <td>{q.moduleId?.name || "No Module"}</td>
              <td>
  {q.level?.replace("-", " ").toUpperCase()}
</td>
              <td>
                <button onClick={() => navigate(`/admin/edit-quiz/${q._id}`)}>
                  Edit
                </button>

                <button onClick={() => deleteQuiz(q._id)}>
                  Delete
                </button>

                <button onClick={() => viewAnalytics(q._id)}>
                  Analytics
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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