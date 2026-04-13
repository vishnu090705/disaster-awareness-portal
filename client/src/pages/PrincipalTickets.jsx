import { useState, useEffect } from "react";
import PrincipalLayout from "../layouts/PrincipalLayout";
import axios from "axios";
export default function PrincipalTickets() {
  const [issue, setIssue] = useState("");
  const [type, setType] = useState("school"); // principal or student
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
 const [ticketStats, setTicketStats] = useState({
  totalRequests: 0,
  studentIssues: 0,
  schoolIssues: 0,
  open: 0,
  inProgress: 0,
  resolved: 0
});


  useEffect(() => {
  fetchTicketStats();
}, []);

const fetchTicketStats = async () => {
  const res = await axios.get(
    "http://localhost:5000/api/tickets/stats",
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );
  setTicketStats(res.data);
};

  // Load students under principal
  useEffect(() => {
    const fetchStudents = async () => {
      const res = await fetch("http://localhost:5000/api/principal/students", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const data = await res.json();
      setStudents(data);
    };

    fetchStudents();
  }, []);

  const submitTicket = async () => {
    await fetch("http://localhost:5000/api/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        issue,
        type, // student or principal
        studentId: type === "student" ? selectedStudent : null
      })
    });

    alert("Ticket raised successfully!");
    setIssue("");
    setSelectedStudent("");
  };

  return (


    <div>
      <h2>Raise Support Ticket</h2>

      {/* Ticket Type */}
      <label>
        <input
          type="radio"
          value="school"
checked={type === "school"}
onChange={() => setType("school")}
        />
        For Whole School (Principal Issue)
      </label>

      <br />

      <label>
        <input
          type="radio"
          value="student"
          checked={type === "student"}
          onChange={() => setType("student")}
        />
        For Specific Student
      </label>

      {/* Student Dropdown */}
      {type === "student" && (
        <div style={{ marginTop: "10px" }}>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">Select Student</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Issue */}
      <textarea
        value={issue}
        onChange={(e) => setIssue(e.target.value)}
        placeholder="Describe the issue..."
        style={{ width: "100%", height: "120px", marginTop: "15px" }}
      />

      <br />

      <button className="nav-btn nav-btn-primary"
      onClick={submitTicket} style={{ marginTop: "10px" }}>
        Submit Ticket
      </button>
    </div>
  );
}