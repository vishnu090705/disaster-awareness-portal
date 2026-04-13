import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import bgImage from "/images/dashboard-bg-1.jpg";
export default function Quiz() {

  
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [showResult, setShowResult] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [review, setReview] = useState(null);
const [score, setScore] = useState(null);
const [passed, setPassed] = useState(false);

useEffect(() => {
  console.log("MODULE ID:", moduleId);
  if (!moduleId) return;

  fetch(`http://localhost:5000/api/quizzes/module/${moduleId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      if (!res.ok) throw new Error("Quiz not found");
      return res.json();
    })
    .then(data => {
      setQuiz(data);
    })
    .catch(err => {
      console.error(err);
      navigate("/modules");
    });
}, [moduleId]);

  /* 🔐 LOCK QUIZ */
  useEffect(() => {
    fetch(`http://localhost:5000/api/progress/can-attempt/${moduleId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.allowed) {
          alert(data.message);
          navigate("/modules");
        }
      });
  }, [moduleId]);

  /* 📥 FETCH QUIZ FROM DB */


  /* 🏆 LEADERBOARD */
  useEffect(() => {
    fetch(`http://localhost:5000/api/progress/leaderboard/${moduleId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setLeaderboard(data));
  }, [moduleId]);

  /* ⏳ TIMER */
useEffect(() => {
  if (!quiz) return;

  const timer = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(timer);
        handleSubmit();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [quiz]);

  const handleAnswer = (value) => {
    setAnswers({
      ...answers,
      [current]: value
    });
  };

const handleSubmit = async () => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/quizzes/${quiz._id}/attempt`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers })
      }
    );

    const result = await response.json(); // ✅ correct
      // 👉 Navigate to result page
    navigate(`/quiz-result/${quiz._id}`, {
      state: result   // 🔥 PASS DATA
    });

    // ✅ SET DATA PROPERLY
    setScore(result.percentage);
    setPassed(result.passed);
    setReview(result.results); // 🔥 IMPORTANT
    setShowResult(true);

  } catch (err) {
    console.error(err);
  }
};
  if (!quiz || !quiz.questions) {
  return <div style={{ padding: 40 }}>Loading...</div>;
}

  const question = quiz.questions?.[current];
if (!question) return null;

  return (

   <div
  className="quiz-container"
  style={{
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center"
  }}
>     <div>
      <div className="quiz-card">

        <div className="quiz-header">
          <h2>{quiz.title}</h2>
          <div className="timer">
            ⏳ {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </div>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${((current + 1) / quiz.questions.length) * 100}%`
            }}
          />
        </div>

        <h3>
          Question {current + 1} of {quiz.questions.length}
        </h3>

        <p>{question.questionText}</p>

        {/* MCQ */}
        {question.type === "MCQ" &&
          question.options.map((opt, index) => (
            <label key={index} className="option">
              <input
                type="radio"
                checked={answers[current] === opt}
                onChange={() => handleAnswer(opt)}
              />
              {opt}
            </label>
          ))}

        {/* TRUE/FALSE */}
        {question.type === "TRUE_FALSE" && (
          <>
            <label className="option">
              <input
                type="radio"
                checked={answers[current] === "True"}
                onChange={() => handleAnswer("True")}
              />
              True
            </label>
            <label className="option">
              <input
                type="radio"
                checked={answers[current] === "False"}
                onChange={() => handleAnswer("False")}
              />
              False
            </label>
          </>
        )}

        {/* SHORT */}
        {question.type === "SHORT" && (
          <input
            type="text"
            value={answers[current] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Type your answer..."
          />
        )}

        <div className="navigation">
          <button className="nav-btn nav-btn-primary"
            disabled={current === 0}
            onClick={() => setCurrent(current - 1)}
          >
            Previous
          </button>

          {current === quiz.questions.length - 1 ? (
            <button  className="nav-btn nav-btn-primary" onClick={handleSubmit}>
              Submit
            </button>
          ) : (
            <button className="nav-btn nav-btn-primary"
            onClick={() => setCurrent(current + 1)}>
              Next
            </button>
          )}
        </div>


        {/* LEADERBOARD */}
        <div style={{ marginTop: 40 }}>
          <h3>🏆 Leaderboard</h3>
          {leaderboard.map((entry, index) => (
            <div key={entry._id}>
              {index + 1}. {entry.userId?.name || "Unknown"} - {entry.bestScore.toFixed(0)}%
            </div>
          ))}
        </div>
      </div>
        <button
  className="nav-btn nav-btn-secondary"
  onClick={() => navigate("/dashboard")}
>
  Back to Dashboard
</button>   
      </div>   
    </div>
    
  );
}
