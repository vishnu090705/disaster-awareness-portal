import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PrincipalLayout from "../layouts/PrincipalLayout";
export default function ChangePassword() {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

 const handleSubmit = async () => {
  const res = await fetch(
    "http://localhost:5000/api/auth/change-password",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ newPassword })
    }
  );

  const data = await res.json();

  if (!res.ok) {
    alert(data.message);
    return;
  }

  alert("Password changed successfully");

  const role = localStorage.getItem("role");

  if (role === "principal") {
    navigate("/principal");
  } else {
    navigate("/dashboard");
  }
};

  return (
   
    <div className="auth-container">
      <div className="auth-card">
        <h2>Change Your Password</h2>

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button className="nav-btn nav-btn-secondary"
        onClick={handleSubmit}>
          Update Password
        </button>
      </div>
    </div>
    
  );
}