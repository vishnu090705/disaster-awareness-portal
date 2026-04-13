import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ModuleView() {
  const { moduleId } = useParams();

  const titles = ["Before", "During", "After", "Do's", "Don'ts"];

  const [module, setModule] = useState(null);
  const [activeTab, setActiveTab] = useState("Before");
  const [watchedSections, setWatchedSections] = useState([]);
  const [progress, setProgress] = useState(0);
  const [openTranscript, setOpenTranscript] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/modules/${moduleId}`)
      .then(res => res.json())
      .then(data => setModule(data));

    fetch(`http://localhost:5000/api/progress/${moduleId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setWatchedSections(data.watchedSections || []);
        setProgress(data.completionPercentage || 0);
      });
  }, [moduleId]);

  if (!module) return <p>Loading...</p>;

  const isUnlocked = (title) => {
    const index = titles.indexOf(title);
    if (index === 0) return true;

    const previousSection =
      module.sections[index - 1];

    return watchedSections.includes(previousSection._id);
  };

  const isCompleted = (title) => {
    const section =
      module.sections.find(s => s.title === title);
    return watchedSections.includes(section._id);
  };

  const activeSection =
    module.sections.find(s => s.title === activeTab);

  const markSectionWatched = async (sectionId) => {
    const res = await fetch(
      "http://localhost:5000/api/progress/watch",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          moduleId,
          sectionId
        })
      }
    );

    const data = await res.json();

    setWatchedSections(data.watchedSections);
    setProgress(data.completionPercentage);

    const currentIndex = titles.indexOf(activeTab);
    if (currentIndex < 4) {
      setActiveTab(titles[currentIndex + 1]);
    }
  };

return (
  <div
    style={{
      position: "relative",
      minHeight: "100vh"
    }}
  >
    {/* 🔥 DARK OVERLAY */}
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.6)", // 🔥 MAIN FIX
        zIndex: 0
      }}
    />

    {/* 🔥 CONTENT */}
    <div style={{ position: "relative", zIndex: 1 }}></div>

    {/* 🔥 HEADER (NEW) */}
    <div
      style={{
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "20px"
      }}
    >
      <h1
        style={{
          color: "white",
          fontSize: "28px",
          fontWeight: "bold",
          textShadow: "0 2px 8px rgba(0,0,0,0.8)"
        }}
      >
        {module.name}
      </h1>

      {/* 🔥 PROGRESS BAR */}
      <div style={{ marginTop: "10px" }}>
        <div
          style={{
            height: "10px",
            background: "rgba(255,255,255,0.2)",
            borderRadius: "20px",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #22c55e, #4ade80)",
              transition: "width 0.4s ease"
            }}
          />
        </div>

        <p
          style={{
            color: "white",
            fontSize: "14px",
            marginTop: "5px",
            textShadow: "0 1px 5px rgba(0,0,0,0.8)"
          }}
        >
          {Math.round(progress)}% Completed
        </p>
      </div>
    </div>

    {/* EXISTING TABS */}
    <div className="tabs">
      {titles.map(title => {
        const unlocked = isUnlocked(title);
        const completed = isCompleted(title);

        return (
          <button
            key={title}
            disabled={!unlocked}
            className={`
              ${activeTab === title ? "active-tab" : ""}
              ${completed ? "completed-tab" : ""}
              ${!unlocked ? "locked-tab" : ""}
            `}
            onClick={() => unlocked && setActiveTab(title)}
          >
            {completed ? "✅ " : !unlocked ? "🔒 " : ""}
            {title}
          </button>
        );
      })}
    </div>

    {/* EXISTING DASH CARD */}
    <div className="dash-card">
      <h2>{activeSection.title}</h2>

      <video
        controls
        width="100%"
        onEnded={() => markSectionWatched(activeSection._id)}
      >
        <source
          src={`http://localhost:5000${activeSection.videoUrl}`}
          type="video/mp4"
        />
      </video>

      <button onClick={() => setOpenTranscript(!openTranscript)}>
        View Transcript
      </button>

      {openTranscript && (
        <div>{activeSection.transcript}</div>
      )}

      {/* (OPTIONAL) you can remove this duplicate progress */}
      {/* <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p>{Math.round(progress)}% Completed</p> */}
    </div>

  </div>
);
}