import { useNavigate } from "react-router-dom";
import "../index.css";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="admin-layout">

      {/* Sidebar */}
      <div className="admin-sidebar">
        <h2>⚡ DAP</h2>
        <p className="role-label">ADMIN</p>

        <button onClick={() => navigate("/admin")}>
          Dashboard
        </button>

        <button onClick={() => navigate("/admin/schools")}>
          Schools
        </button>

        <button onClick={() => navigate("/admin/principals")}>
          Principals
        </button>

        <button onClick={() => navigate("/admin/students")}>
          Students
          </button>
        <button
  className="sidebar-btn"
  onClick={() => navigate("/admin/modules")}
>
  Modules
</button>

<button
  onClick={() => navigate("/admin/tickets")}
>
  Manage Support Tickets
</button>

<button
  onClick={() => navigate("/admin/create-quiz")}
>
  Create Quiz
</button>

<button onClick={() => navigate("/admin/quizzes")}>
  Manage Quizzes
</button>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          minHeight: "100vh",
          width: "100%",
          position: "relative"
        }}
       className="admin-main">
        {children}
      </div>

    </div>
  );
}