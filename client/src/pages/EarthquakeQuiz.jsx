import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

export default function EarthquakeQuiz() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="dashboard-container">
        <h1>Earthquake Quiz 🌍</h1>

      <div className="dash-card quiz-card">
          <p>
            Quiz system will be implemented
            next.
          </p>
        </div>

        <div style={{ marginTop: "20px" }}>
          <button
  className="nav-btn nav-btn-success"
  onClick={() => navigate(`/${currentModule}-quiz`)}
>
  Start Earthquake Quiz
</button>

<button
  className="nav-btn nav-btn-secondary"
  onClick={() => navigate("/dashboard")}
>
  Back to Dashboard
</button>

          <button
            className="nav-btn nav-btn-primary"
            onClick={() =>
              navigate("/module")
            }
            style={{ marginLeft: "10px" }}
          >
            Go to Courses
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}