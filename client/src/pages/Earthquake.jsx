import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout"; 
import "../index.css"; 
import AiChatBubble from "../components/AiChatBubble";

  export default function Earthquake() 
{
   const navigate = useNavigate(); 
     const [progress, setProgress] = useState(null); 
     const [watchedSections, setWatchedSections] = useState({}); 
      const moduleName = "earthquake"; 
      const sections = [ 
        { 
          key: "Before", 
          title: "Before an Earthquake", 
          video: "/videos/before.mp4", 
          content:[ 
            "Secure heavy furniture.",
            "Keep emergency kit ready.",
            "Know safe spots." 
          ]
        }, 
        { 
          key: "During",
          title: "During an Earthquake", 
          video: "/videos/during.mp4",
          content: [ 
            "Drop, Cover, Hold.", 
            "Stay away from windows.", 
            "Do not use elevators."
           ] 
        }, 
        { 
          key: "After", 
          title: "After an Earthquake",
          video: "/videos/after.mp4", 
          content:[ 
            "Check for injuries.", 
            "Expect aftershocks.", 
            "Avoid damaged buildings." 
          ]
        },
        { 
          key: "Do's", 
          title: "Do's", 
          video: "/videos/dos.mp4", 
          content: [ 
            "Stay calm.", 
            "Follow instructions.", 
            "Help others safely." 
          ] 
        }, 
        { 
          key: "Don'ts", 
          title: "Don'ts", 
          video: "/videos/donts.mp4", 
          content: [ 
            "Don't panic.", 
            "Don't run outside during shaking.", 
            "Don't spread rumors." 
          ]
        } 
      ]; 

      /* =========================
     FETCH PROGRESS FROM BACKEND
  ========================= */
   useEffect(() => {
   const role = localStorage.getItem("role");
       if (role !== "student") { 
        navigate("/dashboard");
        return;
        } 
         const fetchProgress = async () => {
          try {
           const res = await fetch( 
            "http://localhost:5000/api/progress/${moduleName}", 
              { 
                method: "PUT",
                headers:{ 
                   Authorization: `Bearer ${localStorage.getItem("token")}`
                 }
              }
           );
           const data = await res.json();
           setProgress(data); 
          } catch (err) { 
                    console.error(err);
               } 
              };
              fetchProgress();
            }, []);
    /* =========================
     FETCH PROGRESS FROM BACKEND
  ========================= */
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "student") {
      navigate("/dashboard");
      return;
    }

    const fetchProgress = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/progress/${moduleName}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }	
          }
        );

        const data = await res.json();
        	
      } catch (err) {
        console.error(err);
      }
    };

    fetchProgress();
  }, []);

  /* =========================
     MARK SECTION COMPLETE
  ========================= */
  const markSectionComplete = async (section) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/progress/${moduleName}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({ section })
        }
      );

      const updated = await res.json();
      setProgress(updated);

    } catch (err) {
      console.error(err);
    }
  };

  /* =========================
     PROGRESS CALCULATION
  ========================= */
  const percentage = progress?.percentage || 0;

  return (
    <DashboardLayout>
      <div className="dashboard-container">
        <h1>Earthquake Safety Module 🌍</h1>

        <div className="card-grid">
          {sections.map((section) => (
            <div
              key={section.key}
              className="dash-card"
            >
              <h3>{section.title}</h3>

              <video
                width="100%"
                controls
                onEnded={() =>
                  handleVideoEnd(section.key)
                }
              >
                <source
                  src={section.video}
                  type="video/mp4"
                />
              </video>

              <ul>
                {section.content.map(
                  (item, index) => (
                    <li key={index}>{item}</li>
                  )
                )}
              </ul>

              {progress && progress[section.key] ? (
                <p>✅ Completed</p>
              ) : watchedSections[section.key] ? (
                <button
                  onClick={() =>
                    markSectionComplete(section.key)
                  }
                >
                  Mark as Complete
                </button>
              ) : (
                <p>
                  🔒 Watch video to unlock
                </p>
              )}
            </div>
          ))}
        </div>

        {/* PROGRESS SUMMARY */}
        <div
          style={{
            marginTop: "40px",
            textAlign: "center"
          }}
        >
          <h2>
            Progress: {percentage}%
          </h2>

          {percentage === 100 && (
            <>
              <h3>
                🎉 Module Completed!
              </h3>

              <button
                className="nav-btn nav-btn-primary"
                onClick={() =>
                  navigate("/earthquake-quiz")
                }
                style={{
                  margin: "10px",
                  padding: "10px 20px"
                }}
              >
                Start Earthquake Quiz
              </button>
            </>
          )}

          <button
            className="nav-btn nav-btn-secondary"
            onClick={() =>
              navigate("/dashboard")
            }
            style={{
              marginTop: "10px",
              padding: "8px 20px"
            }}
          >
            Back to Dashboard
          </button>
        </div>
       <AiChatBubble moduleName={moduleName} />
      </div>
    </DashboardLayout>
  );
}
