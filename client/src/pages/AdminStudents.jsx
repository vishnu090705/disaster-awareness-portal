import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import "../index.css";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");

  const token = localStorage.getItem("token");

  const fetchStudents = async (school = "") => {
    try {
      const url = school
        ? `http://localhost:5000/api/admin/students?school=${school}`
        : `http://localhost:5000/api/admin/students`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchools = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/schools",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await res.json();
      setSchools(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;

    await fetch(
      `http://localhost:5000/api/admin/students/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    fetchStudents(selectedSchool);
  };

  const handleReassign = async (id, schoolName) => {
    await fetch(
      `http://localhost:5000/api/admin/students/${id}/reassign`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ schoolName })
      }
    );

    fetchStudents(selectedSchool);
  };

  useEffect(() => {
    fetchStudents();
    fetchSchools();
  }, []);

  return (
    <AdminLayout>
      <div className="admin-page">

        <h1>🎓 Student Management</h1>

        <div className="filter-bar">
          <select
            value={selectedSchool}
            onChange={(e) => {
              setSelectedSchool(e.target.value);
              fetchStudents(e.target.value);
            }}
          >
            <option value="">All Schools</option>
            {schools.map((s) => (
              <option key={s._id} value={s.schoolName}>
                {s.schoolName}
              </option>
            ))}
          </select>
        </div>

        {/* TABLE VIEW (Desktop) */}
        <div className="student-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>School</th>
                <th>Supervisor</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.class}</td>
                  <td>{student.schoolName || "None"}</td>
                  <td>{student.supervisor}</td>
                  <td>
                    <select
                      onChange={(e) =>
                        handleReassign(
                          student._id,
                          e.target.value
                        )
                      }
                    >
                      <option value="">Reassign</option>
                      {schools.map((s) => (
                        <option
                          key={s._id}
                          value={s.schoolName}
                        >
                          {s.schoolName}
                        </option>
                      ))}
                      <option value="">Remove School</option>
                    </select>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(student._id)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CARD VIEW (Mobile) */}
        <div className="student-cards">
          {students.map((student) => (
            <div key={student._id} className="student-card">
              <h3>{student.name}</h3>
              <p>Class: {student.class}</p>
              <p>School: {student.schoolName || "None"}</p>
              <p>Supervisor: {student.supervisorType}</p>

              <select
                onChange={(e) =>
                  handleReassign(
                    student._id,
                    e.target.value
                  )
                }
              >
                <option value="">Reassign</option>
                {schools.map((s) => (
                  <option
                    key={s._id}
                    value={s.schoolName}
                  >
                    {s.schoolName}
                  </option>
                ))}
                <option value="">Remove School</option>
              </select>

              <button
                className="delete-btn"
                onClick={() =>
                  handleDelete(student._id)
                }
              >
                Delete
              </button>
            </div>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
}