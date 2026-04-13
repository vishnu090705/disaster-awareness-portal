import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

export default function Modules() {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [filter, setFilter] = useState("all");

  const token = localStorage.getItem("token");

useEffect(() => {
  const fetchModules = async () => {
    const moduleRes = await fetch("http://localhost:5000/api/modules");
    const moduleData = await moduleRes.json();

    const modulesWithProgress = await Promise.all(
      moduleData.map(async (mod) => {
        try {
          const progressRes = await fetch(
            `http://localhost:5000/api/progress/${mod._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          const progressData = await progressRes.json();

          return {
            ...mod,
            progress: progressData?.completionPercentage || 0
          };

        } catch (err) {
          return { ...mod, progress: 0 };
        }
      })
    );

    setModules(modulesWithProgress);
  };

  fetchModules();
}, []);

  const filteredModules =
    filter === "all"
      ? modules
      : modules.filter(m => m.category === filter);


  return (
    <DashboardLayout>
      <div className="modules-page">

        {/* Hero Section */}
        <div className="modules-hero">
          <h1>Disaster Courses</h1>

          <div className="filter-buttons">
            <button onClick={() => setFilter("all")}>All</button>
            <button onClick={() => setFilter("natural")}>Natural</button>
            <button onClick={() => setFilter("man-made")}>Man-Made</button>
          </div>
        </div>

        {/* Module Cards Grid */}
        <div className="modules-grid">
          {filteredModules.map(module => (
            <div key={module._id} className="module-card">

              <h2>{module.name}</h2>
              <p>{module.description}</p>

              <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${module.progress}%` }}
              />
            </div>

            <p>{module.progress}% Completed</p>

             <button
  className="open-btn"
  onClick={async () => {

    await fetch("http://localhost:5000/api/users/current-module", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ moduleId: module._id })
    });

    navigate(`/module/${module._id}`);
  }}
>
  Open
</button>

            </div>
          ))}
        </div>
          <button
  className="nav-btn nav-btn-secondary"
  onClick={() => navigate("/dashboard")}
>
  Back to Dashboard
</button>
      </div>
    </DashboardLayout>
  );
}