import { useLocation, useNavigate } from "react-router-dom";

 function QuizResult() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return <div>No Data</div>;

  const { percentage, passed, results } = state;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "#0f172a",
        color: "white"
      }}
    >
      {/* HEADER */}
      <div style={{ textAlign: "center" }}>
        <h1>{passed ? "🎉 Passed!" : "❌ Try Again"}</h1>
        <h2>Score: {Math.round(percentage)}%</h2>
      </div>

      {/* REVIEW */}
      <div
        style={{
          marginTop: "30px",
          maxWidth: "900px",
          marginInline: "auto"
        }}
      >
        <h2>📊 Review Answers</h2>

        {results.map((r, i) => (
          <div
            key={i}
            style={{
              background: r.isCorrect ? "#065f46" : "#7f1d1d",
              padding: "15px",
              borderRadius: "12px",
              marginBottom: "15px"
            }}
          >
            <p><strong>Q:</strong> {r.question}</p>

            <p>
              Your Answer:{" "}
              <span style={{ color: "#facc15" }}>
                {r.studentAnswer || "Not Answered"}
              </span>
            </p>

            {!r.isCorrect && (
              <p>
                Correct Answer:{" "}
                <span style={{ color: "#22c55e" }}>
                  {r.correctAnswer}
                </span>
              </p>
            )}

            <p>{r.isCorrect ? "✅ Correct" : "❌ Wrong"}</p>
          </div>
        ))}
      </div>

      {/* ACTIONS */}
     <div
  style={{
    marginTop: "40px",
    display: "flex",
    justifyContent: "center",
    gap: "20px"
  }}
>
  <button
  className="nav-btn nav-btn-primary"
    onClick={() => navigate("/modules")}
    style={{
      padding: "12px 24px",
      borderRadius: "10px",
      border: "none",
      background: "#3b82f6",
      color: "white",
      fontWeight: "600",
      cursor: "pointer",
      transition: "0.3s",
      boxShadow: "0 0 15px rgba(59,130,246,0.6)"
    }}
    onMouseEnter={(e) => (e.target.style.background = "#2563eb")}
    onMouseLeave={(e) => (e.target.style.background = "#3b82f6")}
  >
    ⬅ Back to Modules
  </button>

  <button
  className="nav-btn nav-btn-secondary"
    onClick={() => navigate(-1)}
    style={{
      padding: "12px 24px",
      borderRadius: "10px",
      border: "none",
      background: "#f97316",
      color: "white",
      fontWeight: "600",
      cursor: "pointer",
      transition: "0.3s",
      boxShadow: "0 0 15px rgba(59,130,246,0.6)"
    }}
    onMouseEnter={(e) => (e.target.style.background = "#ea580c")}
    onMouseLeave={(e) => (e.target.style.background = "#f97316")}
  >
    🔁 Retry Quiz
  </button>
</div>
    </div>
  );
}

export default QuizResult;