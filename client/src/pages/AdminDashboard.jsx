import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchStats = async () => {
      const res = await fetch(
        "http://localhost:5000/api/admin/stats",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await res.json();
      setStats(data);
    };

    fetchStats();
  }, []);
  const [modules, setModules] = useState([]);
  const [moduleStats, setModuleStats] = useState({
  total: 0,
  natural: 0,
  manMade: 0
});
useEffect(() => {
  const fetchModules = async () => {
    const res = await fetch("http://localhost:5000/api/modules");
    const data = await res.json();

    setModules(data);   // 🔥 THIS LINE WAS MISSING

    setModuleStats({
      total: data.length,
      natural: data.filter(m => m.category === "natural").length,
      manMade: data.filter(m => m.category === "man-made").length
    });
  };

  fetchModules();
}, []);
  return (
    <AdminLayout>


      <h1>📊 Admin Dashboard</h1>

      {!stats ? (
        <p>Loading...</p>
      ) : (
        <div className="stats-grid">

  <div className="stat-card">
    <h3>{stats?.totalSchools}</h3>
    <p>Total Schools</p>
  </div>

  <div className="stat-card">
    <h3>{stats?.activeSchools}</h3>
    <p>Active Schools</p>
  </div>

  <div className="stat-card danger">
    <h3>{stats?.inactiveSchools}</h3>
    <p>Inactive Schools</p>
  </div>

  <div className="stat-card">
    <h3>{stats?.totalStudents}</h3>
    <p>Total Students</p>
  </div>

  <div className="stat-card">
    <h3>{stats?.totalPrincipals}</h3>
    <p>Total Principals</p>
  </div>

  <div className="stat-card warning">
    <h3>{stats?.unassignedStudents}</h3>
    <p>Unassigned Students</p>
  </div>

  <div className="stat-card">
  <h3>{stats?.principalSupervised}</h3>
  <p>Principal Supervised</p>
</div>

  <div className="stat-card">
    <h3>{stats?.adminSupervised}</h3>
    <p>Admin Supervised</p>
  </div>

  <div className="stat-card">
  <h2>{moduleStats.total}</h2>
  <p>Total Modules</p>
</div>

<div className="stat-card">
  <h2>{moduleStats.natural}</h2>
  <p>Natural Modules</p>
</div>

<div className="stat-card">
  <h2>{moduleStats.manMade}</h2>
  <p>Man-Made Modules</p>
</div>

</div>
      )}


      <h2 className="section-title">Quick Actions</h2>

<div className="quick-actions">
  <button
    className="action-btn"
    onClick={() => navigate("/admin/schools")}
  >
    ➕ Create School
  </button>

  <button
    className="action-btn"
    onClick={() => navigate("/admin/principals")}
  >
    👑 Create Principal
  </button>

  <button
    className="action-btn"
    onClick={() => navigate("/admin/students")}
  >
    🎓 Manage Students
  </button>

  <button 
  className="action-btn"
  onClick={() => navigate("/admin/modules/create")}>
  📚 Create Module
</button>
</div>
         {/* Schools Breakdown Section */}
<h2 className="section-title">Schools Overview</h2>

<div className="table-container">
  <table className="admin-table">
    <thead>
      <tr>
        <th>School Name</th>
        <th>Status</th>
        <th>Principal</th>
        <th>Students</th>
      </tr>
    </thead>
    <tbody>
      {stats?.schools?.map((school, index) => (
        <tr key={index}>
          <td>{school.schoolName}</td>

          <td>
            <span
              className={
                school.isActive
                  ? "status-badge active"
                  : "status-badge inactive"
              }
            >
              {school.isActive ? "Active" : "Inactive"}
            </span>
          </td>

          <td>{school.principalName}</td>

          <td>{school.studentCount}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

 <h2 className="section-title">Modules Overview</h2>
<div className="table-container">
<table className="admin-table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Category</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {modules.map(module => (
      <tr key={module._id}>
        <td>{module.name}</td>
        <td>{module.category}</td>
        <td>
          {module.isActive ? "Active" : "Inactive"}
        </td>
      </tr>
    ))}
  </tbody>
</table>
</div>

    </AdminLayout>
  );
}