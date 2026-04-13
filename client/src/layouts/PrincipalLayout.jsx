import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import "../index.css";

export default function PrincipalLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="admin-layout principal-layout">

      {/* Sidebar */}
      <div className="admin-sidebar">
        <h2>🏫 DAP</h2>
        <p className="role-label">PRINCIPAL</p>

        <button onClick={() => navigate("/principal")}>
          Dashboard
        </button>

        <button onClick={() => navigate("/principal/students")}>
          Students
        </button>

        <button onClick={() => navigate("/principal/analytics")}>
          Analytics
        </button>

        <button onClick={() => navigate("/principal/reports")}>
          Reports
        </button>

        <button onClick={() => navigate("/principal/tickets")}>
          Raise Ticket
        </button>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <Outlet />
      </div>

    </div>
  );
}