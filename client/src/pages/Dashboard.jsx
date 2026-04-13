import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import "../index.css";
import AiChatBubble from "../components/AiChatBubble"

export default function Dashboard() {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [currentStudent, setCurrentStudent] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [badges, setBadges] = useState([]);
  const [progress, setProgress] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  const [quizUnlocked, setQuizUnlocked] = useState(false);

useEffect(() => {
  if (!currentModule) return;

  fetch(`http://localhost:5000/api/progress/can-attempt/${currentModule}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => res.json())
    .then(data => setQuizUnlocked(data.allowed));
}, [currentModule, progress]);

useEffect(() => {
  fetch("http://localhost:5000/api/users/me", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => res.json())
    .then(data => setUser(data));
}, []);

useEffect(() => {
  fetch("http://localhost:5000/api/auth/me", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => res.json())
    .then(data => setBadges(data.badges || []));
}, []);

  /* =========================
     FETCH USER
  ========================= */
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          navigate("/login");
          return;
        }

        setCurrentStudent(data);
        setRole(data.role);

        // IMPORTANT: load selected module
        const savedModule = localStorage.getItem("currentModule");
        if (savedModule) {
          setCurrentModule(savedModule);
        }

      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    fetchUser();
  }, []);
  useEffect(() => {
  const fetchCurrentModule = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const userData = await res.json();

      if (userData.currentModule) {
        setCurrentModule(userData.currentModule);

        // 🔥 FETCH MODULE DETAILS
       const moduleRes = await fetch(
  `http://localhost:5000/api/modules/${userData.currentModule}`,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  }
);

        const moduleData = await moduleRes.json();

        setSelectedModule(moduleData); // store full module object

        // 🔥 FETCH PROGRESS
        const progressRes = await fetch(
          `http://localhost:5000/api/progress/${userData.currentModule}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        const progressData = await progressRes.json();
        setProgress(progressData);
      }

    } catch (err) {
      console.log("Dashboard load error:", err);
    }
  };

  fetchCurrentModule();
}, []);
          


  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const percentage = progress?.percentage || 0;


  return (
    <DashboardLayout>
      <div className="dash-wrapper">

        {/* SIDEBAR */}
        <div className="sidebar">
          <h2>⚡ DAP</h2>
          <p>{role.toUpperCase()}</p>

          {role === "student" && currentStudent && (
            <>
              <button
                onClick={() => navigate("/profile")}
              >
                Profile
              </button>

              <button
                onClick={() => navigate("/module")}
              >
                Courses
              </button>

             <button
  onClick={() => {
    if (!currentModule) {
      alert("Select a course first.");
      navigate("/module");
      return;
    }

    if (quizUnlocked) {
      navigate(`/quiz/${currentModule}`);
    } else {
      alert("Complete required sections to unlock quiz.");
    }
  }}
>
  {quizUnlocked ? "Quiz" : "Quiz 🔒"}
</button>
            </>
          )}

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div className="main-content">

          {role === "student" && currentStudent && (
            <>
              <h1>
                Welcome {currentStudent.name} 👋
              </h1>
              <p>Class: {currentStudent.class}</p>

              {selectedModule ? (
                <>
                  <h2>
                    Current Course:{" "}
                    {selectedModule?.name}
                  </h2>

                  <div className="card-grid">

                    {/* PROGRESS */}
                    <div className="dash-card">
                      <h3>Progress</h3>
                      <div className="progress-bar">
                        <div className="progress-fill"
                          style={{ width: `${progress?.completionPercentage || 0}%` }}
                        />
                        <p>{progress?.completionPercentage || 0}% Completed</p>
                      </div>
                     
                    </div>

                    {/* QUIZ STATUS */}
                    <div className="dash-card">
                      <h3>Quiz Status</h3>

                      {quizUnlocked ? (
                        <>
                          <p>Quiz Unlocked ✅</p>
                          <button
                            onClick={() =>
                              navigate(`/quiz/${selectedModule._id}`)
                            }
                          >
                            Start Quiz
                          </button>
                        </>
                      ) : (
                        <p>Complete module to unlock quiz 🔒</p>
                      )}
                    </div>

                    {/* BADGE */}
                    <div className="dash-card">
                       <h3>XP: {progress?.xpEarned || 0}</h3>

                      <div>
                        {badges.map((badge, index) => (
                          <span key={index} style={{
                            background: "#f97316",
                            padding: "5px 10px",
                            borderRadius: "10px",
                            marginRight: "10px"
                          }}>
                            🏅 {badge}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                </>
              ) : (
                <div className="dash-card">
                  <h3>No Course Selected</h3>
                  <button
                    onClick={() =>
                      navigate("/module")
                    }
                  >
                    Select Course
                  </button>
                </div>
              )}
              
            </>
          )}
 
        </div>
      </div>
    </DashboardLayout>
  );
}
