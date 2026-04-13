 /*import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import "../index.css";

export default function Profile() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    if (role !== "student") {
      navigate("/dashboard");
      return;
    }

    const students =
      JSON.parse(localStorage.getItem("students")) || [];

    const current = students.find(
      (s) => s.rollNo === userId
    );

    if (current) {
      setStudent(current);
      setMobile(current.mobile || "");
      setPassword(current.dob);
    }
  }, []);

  const getProgress = () => {
    const progress =
      JSON.parse(
        localStorage.getItem(
          `progress-earthquake-${student?.rollNo}`
        )
      ) || {};

    const completed =
      Object.values(progress).filter(Boolean).length;

    return Math.round((completed / 5) * 100);
  };

  const handleSave = () => {
    if (password !== confirmPassword) {
      setMessage("Passwords do not match ❌");
      return;
    }

    if (mobile.length !== 10) {
      setMessage("Enter valid 10-digit mobile number ❌");
      return;
    }

    const students =
      JSON.parse(localStorage.getItem("students")) || [];

    const updated = students.map((s) =>
      s.rollNo === student.rollNo
        ? { ...s, mobile, dob: password }
        : s
    );

    localStorage.setItem("students", JSON.stringify(updated));

    setMessage("Profile Updated Successfully ✅");
  };

  if (!student) return null;

  return (
    <DashboardLayout>
      <div className="profile-wrapper">
        <h1>Student Profile</h1>

        <div className="profile-card">

          {/* PROFILE INFO */ /*}
          <div className="profile-section">
            <h3>Basic Information</h3>
            <p><strong>Name:</strong> {student.name}</p>
            <p><strong>Class:</strong> {student.class}</p>
            <p><strong>Roll No:</strong> {student.rollNo}</p>
            <p><strong>Progress:</strong> {getProgress()}%</p>
          </div>

          {/* EDIT SECTION */ /*}
          <div className="profile-section">
            <h3>Edit Details</h3>

            <label>Mobile Number</label>
            <input
              type="text"
              value={mobile}
              onChange={(e) =>
                setMobile(e.target.value)
              }
              className="profile-input"
            />

            <label>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="profile-input"
            />

            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              className="profile-input"
            />

            <button 
            onClick={handleSave}>
              Save Changes
            </button>

            {message && (
              <p className="profile-message">
                {message}
              </p>
            )}
          </div>
            <button
  onClick={() => navigate("/dashboard")}
>
  Back to Dashboard
</button>
        </div>
      </div>
    </DashboardLayout>
  );
} */

  import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import DashboardLayout from "../layouts/DashboardLayout";


export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobile, setMobile] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [editMobile, setEditMobile] = useState(false);
const [showPasswordSection, setShowPasswordSection] = useState(false);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
//const [editMobile, setEditMobile] = useState(false);
const [originalMobile, setOriginalMobile] = useState("");


  /* ========================
     FETCH CURRENT USER
  ======================== */
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await res.json();

        if (!res.ok) {
          navigate("/login");
          return;
        }

        setUser(data);
        setMobile(data.mobile || "");
        setOriginalMobile(data.mobile || "");

      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    fetchUser();
  }, []);

  /* ========================
     UPDATE PROFILE
  ======================== */
  const handleUpdateProfile = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/users/update-profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ mobile })
        }
      );

      const data = await res.json();
      alert(data.message);

    } catch (err) {
      alert("Error updating profile");
    }
  };

  /* ========================
     CHANGE PASSWORD
  ======================== */
  const handleChangePassword = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/users/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword,
            newPassword
          })
        }
      );

      const data = await res.json();
      alert(data.message);

      setCurrentPassword("");
      setNewPassword("");

    } catch (err) {
      alert("Error changing password");
    }
  };

  if (!user) return <div className="profile-loading">Loading...</div>;

  return (
  <DashboardLayout>
    <div className="profile-container">

      {/* HEADER */}
      <div className="profile-name-wrapper">
  <h1 className="profile-name">
    {user.name}
  </h1>
  <div className={`role-badge ${role}`}>
    {role.toUpperCase()}
  </div>
</div>

      {/* PROFILE INFO CARD */}
      <div className="profile-card">

        {role === "student" && (
          <>
            <p><strong>Roll No:</strong> {user.rollNo}</p>
            <p><strong>Class:</strong> {user.class}</p>
            <p><strong>School:</strong> {user.schoolName || "N/A"}</p>
          </>
        )}

        {role === "principal" && (
          <>
            <p><strong>Principal ID:</strong> {user.principalId}</p>
            <p><strong>School:</strong> {user.schoolName}</p>
          </>
        )}

        {role === "admin" && (
          <>
            <p><strong>Email:</strong> {user.email}</p>
          </>
        )}


<p><strong>Mobile:</strong></p>

{!editMobile ? (
  <>
    <div className="profile-inline-row">
      <span>{mobile || "Not Provided"}</span>
    </div>

    <button
      className="nav-btn nav-btn-primary"
      onClick={() => setEditMobile(true)}
    >
      Update Profile
    </button>
  </>
) : (
  <>
    <input
      type="text"
      value={mobile}
      onChange={(e) => setMobile(e.target.value)}
    />

    <div className="profile-inline-row">
      <button
        className="nav-btn nav-btn-primary"
        onClick={async () => {
          await handleUpdateProfile();
          setOriginalMobile(mobile);
          setEditMobile(false);
        }}
      >
        Save
      </button>

      <button
        className="link-btn"
        onClick={() => {
          setMobile(originalMobile);
          setEditMobile(false);
        }}
      >
        Cancel
      </button>
    </div>
  </>
)}
      </div>

      {/* CHANGE PASSWORD */}
      <div className="profile-card">

  <div className="profile-inline-row">
    <h3>Security</h3>
    {!showPasswordSection && (
      <button
        className="link-btn"
        onClick={() => setShowPasswordSection(true)}
      >
        Change Password
      </button>
    )}
  </div>

  {showPasswordSection && (
    <>
      <input
        type="password"
        placeholder="Current Password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <div className="profile-inline-row">
        <button
          className="nav-btn nav-btn-primary"
          onClick={handleChangePassword}
        >
          Update Password
        </button>

        <button
          className="link-btn"
          onClick={() => setShowPasswordSection(false)}
        >
          Cancel
        </button>
      </div>
    </>
  )}

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