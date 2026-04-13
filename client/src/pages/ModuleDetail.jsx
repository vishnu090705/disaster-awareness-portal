import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AiChatBubble from "../components/AiChatBubble";
export default function ModuleDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [module, setModule] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(null);
  const [quizUnlocked, setQuizUnlocked] = useState(false);
  
  useEffect(() => {
    fetch(`http://localhost:5000/api/modules/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
        
      },
       cache: "no-store" // 🔥 VERY IMPORTANT
    })
      .then(res => res.json())
      .then(data => setModule(data));
  }, [id]);


  useEffect(() => {
    fetch(`http://localhost:5000/api/progress/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())  
      .then(data => setProgress(data));
  }, [id]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/progress/can-attempt/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(data => setQuizUnlocked(data.allowed));
  }, [id, progress]);

  

  if (!module || !module.sections) {
  return <div>Loading or Module not available...</div>;
}

  const isUnlocked = (index) => {
    if (!progress) return index === 0;

    const watchedCount = progress.watchedSections?.length || 0;

    return index <= watchedCount;
  };
  const handleVideoEnd = async () => {
  const sectionId = module.sections[activeIndex]._id;

  const res = await fetch("http://localhost:5000/api/progress/watch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({
      moduleId: id,
      sectionId
    })
  });

  const updatedProgress = await res.json();

  // Update state immediately
  setProgress(updatedProgress);

  // Move to next section
  if (activeIndex < module.sections.length - 1) {
    setActiveIndex(prev => prev + 1);
  }
};
const fixedUrl =
  module.sections?.[activeIndex]?.videoUrl?.replace(/\\/g, "/");
console.log("VIDEO URL:",
  `http://localhost:5000/${fixedUrl}`
);
return (
  <div
    style={{
      position: "relative",
      minHeight: "100vh",
      backgroundImage: `url(http://localhost:5000${module.thumbnail})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed"
    }}
  >
    {/* 🔥 SOFT OVERLAY (lighter now) */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.45)"
      }}
    />

    {/* CONTENT */}
    <div
      style={{
        position: "relative",
        zIndex: 1,
        padding: "30px",
        color: "white"
      }}
    >
      {/* TITLE */}
      <h1 style={{ textShadow: "0 3px 10px black" }}>
        {module.name}
      </h1>

      {/* PROGRESS */}
      <div style={{ margin: "15px 0" }}>
        <div
          style={{
            height: "8px",
            background: "rgba(255,255,255,0.2)",
            borderRadius: "20px",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: `${progress?.completionPercentage || 0}%`,
              height: "100%",
              background: "#22c55e"
            }}
          />
        </div>
        <p>{progress?.completionPercentage || 0}% Completed</p>
      </div>

      {/* MAIN LAYOUT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: "25px",
          marginTop: "20px"
        }}
      >
        {/* LEFT SIDEBAR */}
        <div>
          {module.sections.map((sec, index) => {
            const unlocked = isUnlocked(index);
            const isActive = index === activeIndex;
            const isCompleted =
              progress?.watchedSections?.includes(sec._id);

            return (
              <div
                key={sec._id}
                onClick={() => unlocked && setActiveIndex(index)}
                style={{
                  padding: "14px",
                  marginBottom: "10px",
                  borderRadius: "10px",
                  cursor: unlocked ? "pointer" : "not-allowed",
                  background: isActive
                    ? "rgba(30,41,59,0.9)"
                    : "rgba(255,255,255,0.05)",
                  border: isActive
                    ? "2px solid #22c55e"
                    : "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  opacity: unlocked ? 1 : 0.5,
                  transition: "0.3s"
                }}
              >
                {isCompleted ? "✅ " : !unlocked ? "🔒 " : ""}
                {sec.title}
              </div>
            );
          })}
        </div>

        {/* RIGHT CONTENT */}
        <div>
          <h2>{module.sections?.[activeIndex]?.title}</h2>

          {/* 🔥 SMALLER FLOATING VIDEO */}
          <div
            style={{
              marginTop: "10px",
              maxWidth: "750px",
               marginLeft: "auto", // 🔥 reduced width
              borderRadius: "15px",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.6)"
            }}
          >
            
            <video
              key={activeIndex} 
              controls
              onEnded={handleVideoEnd}
              style={{
                width: "100%",
                height: "420px",
                 // 🔥 reduced height
                objectFit: "cover"
              }}
            >
              <source
                src={`http://localhost:5000${fixedUrl}`}
                type="video/mp4"
              />
            </video>
          </div>

          {/* 🔥 TRANSCRIPT GLASS CARD */}
          <div
            style={{
              marginTop: "20px",
              maxWidth: "750px",
              maxHeight: "250px",
               marginLeft: "auto",
              overflowY: "auto",
              padding: "20px",
              borderRadius: "15px",
             
              backdropFilter: "blur(12px)",
              lineHeight: "1.6",
              boxShadow: "0 8px 20px rgba(0,0,0,0.4)"
            }}
          >
            {module.sections?.[activeIndex]?.transcript}
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div style={{ marginTop: "30px" }}>
        <button
          className="nav-btn nav-btn-secondary"
          onClick={() => navigate("/module")}
        >
          ⬅ Back to Module
        </button>

        <button
          className="nav-btn nav-btn-primary"
          onClick={() => navigate(`/quiz/${id}`)}
          style={{ marginLeft: "10px" }}
        >
          Go to Quiz
        </button>
      </div>

      <AiChatBubble moduleId={id} />
    </div>
  </div>
);
}
