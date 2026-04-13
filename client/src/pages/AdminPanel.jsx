import { useState, useEffect } from "react";
import "../index.css";
import { useNavigate } from "react-router-dom";


export default function AdminPanel() {
  const [role, setRole] = useState("teacher");
  const [formData, setFormData] = useState({});
  const [staffList, setStaffList] = useState([]);
  const navigate = useNavigate();

useEffect(() => {
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    navigate("/login");
  }
}, []);
  useEffect(() => {
    const staff = JSON.parse(localStorage.getItem("staff")) || [];
    setStaffList(staff);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreate = () => {
    const staff = JSON.parse(localStorage.getItem("staff")) || [];

    const newStaff = {
      role,
      ...formData
    };

    staff.push(newStaff);
    localStorage.setItem("staff", JSON.stringify(staff));
    setStaffList(staff);

    alert(`${role.toUpperCase()} Created Successfully!`);
  };

  const handleDelete = (index) => {
    const staff = [...staffList];
    staff.splice(index, 1);
    localStorage.setItem("staff", JSON.stringify(staff));
    setStaffList(staff);
  };

  return (
  <div className="admin-bg">

    {/* Overlay */}
    <div className="admin-overlay">

      <div className="admin-container">

        <h1 className="admin-title">👑 Admin Panel</h1>

        {/* Create Staff Card */}
        <div className="login-card">
          <h2>Create Staff Account</h2>

          <select
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>

          <input
            className="input"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
          />

          {role === "teacher" && (
            <input
              className="input"
              name="teacherId"
              placeholder="Teacher ID"
              onChange={handleChange}
            />
          )}

          {role === "admin" && (
            <input
              className="input"
              name="email"
              placeholder="Admin Email"
              onChange={handleChange}
            />
          )}

          <input
            className="input"
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
          />

          <button className="btn" onClick={handleCreate}>
            Create Account
          </button>
        </div>

        {/* Existing Staff Section */}
        <h2 className="section-title">Existing Staff</h2>

        <div className="staff-grid">
          {staffList.map((staff, index) => (
            <div key={index} className="login-card">
              <p><strong>Name:</strong> {staff.name}</p>
              <p><strong>Role:</strong> {staff.role}</p>
              {staff.teacherId && <p>ID: {staff.teacherId}</p>}
              {staff.email && <p>Email: {staff.email}</p>}

              <button
                className="delete-btn"
                onClick={() => handleDelete(index)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  </div>
);
}