import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

export default function Signup() {
  const navigate = useNavigate();
  const [showNote, setShowNote] = useState(true);
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schools, setSchools] = useState([]);

useEffect(() => {
  const fetchSchools = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/schools/public");
      const data = await res.json();
      setSchools(data);
    } catch (err) {
      console.error("Error fetching schools:", err);
    }
  };

  fetchSchools();
}, []);

  const handleSignup = async () => {
  if (!name || !rollNo || !studentClass || !password) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/signup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          role: "student",
          name,
          email: "", // backend expects it
          class: studentClass,
          rollNo,
          password
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || data.message);
      return;
    }

    alert("Signup successful!");
    navigate("/login");

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
};

  return (
  <div className="auth-container">
    {showNote && (
      <div className="note-overlay">
        <div className="note-card">
          <h3>Important Notice</h3>
          <p>
            Registration on this page is intended only for students.
            School heads and administrators receive their login
            credentials directly from the system administrator.
          </p>
          <button onClick={() => setShowNote(false)}>
            Understood
          </button>
        </div>
      </div>
    )}
    <div className="auth-card modern-signup">

      <h2>Student Sign Up</h2>

      <div className="signup-column">

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Roll Number"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
        />

        <input
          type="text"
          placeholder="Class"
          value={studentClass}
          onChange={(e) => setStudentClass(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password (DOB)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="text"
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />

        <select
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
        >
          <option value="">
            Select School (Optional)
          </option>

          {schools.map((s) => (
            <option
              key={s.schoolName}
              value={s.schoolName}
            >
              {s.schoolName}
            </option>
          ))}
        </select>

      </div>

      <button
        className="nav-btn nav-btn-primary signup-btn"
        onClick={handleSignup}
      >
        Sign Up
      </button>

    </div>
  </div>
);
}