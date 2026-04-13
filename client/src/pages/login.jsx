import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    console.log("Identifier:", identifier);

    if (!identifier || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role,
            identifier,
            password
          })
        }
      );

      const data = await response.json();
      console.log("LOGIN RESPONSE:", data);
      if (!response.ok) {
        alert(data.message);
        return;
      }

      localStorage.setItem("token", data.token);
localStorage.setItem("role", data.role);

if (data.mustChangePassword) {
  navigate("/change-password");
  return;
}

if (data.role === "admin") {
  navigate("/admin");
} else if (data.role === "principal") {
  navigate("/principal");
} else {
  navigate("/dashboard");
}

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back 👋</h2>

        {/* Role Selector */}
        <select
          className="auth-input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="student">Student</option>
          <option value="principal">Principal</option>
          <option value="admin">Admin</option>
        </select>

        {/* Student Fields */}
        {role === "student" && (
          <>
            <input
              className="auth-input"
              name="rollNo"
              placeholder="Roll Number"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <input
              className="auth-input"
              name="dob"
              type="password"
              placeholder="Date of Birth (DD/MM/YYYY)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        )}

        {/* principal Fields */}
        {role === "principal" && (
          <>
            <input
              className="auth-input"
              name="principalId"
              placeholder="principal Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <input
              className="auth-input"
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        )}

        {/* Admin Fields */}
        {role === "admin" && (
          <>
            <input
              className="auth-input"
              name="email"
              placeholder="Admin Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <input
              className="auth-input"
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        )}
          
        <button className="auth-btn" onClick={handleLogin}>
          Login
        </button>

        {role === "student" && (
          <p
            className="auth-link"
            onClick={() => navigate("/signup")}
          >
            New Student? Create Account
          </p>
        )}
      </div>
    </div>
  );
}