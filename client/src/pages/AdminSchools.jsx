import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

export default function AdminSchools() {
  const [schools, setSchools] = useState([]);
  const [schoolName, setSchoolName] = useState("");

  const token = localStorage.getItem("token");

 const fetchSchools = async () => {
  const res = await fetch(
    "http://localhost:5000/api/admin/schools",
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await res.json();
  console.log("Schools Page Data:", data); // 🔥 ADD THIS
  setSchools(data);
};

  useEffect(() => {
    fetchSchools();
  }, []);

  const createSchool = async () => {
    if (!schoolName) {
      alert("Enter school name");
      return;
    }

    const res = await fetch(
      "http://localhost:5000/api/admin/schools",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ schoolName })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    setSchoolName("");
    fetchSchools();
  };
const deleteSchool = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this school?"
  );

  if (!confirmDelete) return;

  await fetch(
    `http://localhost:5000/api/admin/schools/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  fetchSchools(); // refresh list
};

const toggleStatus = async (id) => {
  await fetch(
    `http://localhost:5000/api/admin/schools/${id}/status`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  fetchSchools(); // refresh list
};


  return (
    <AdminLayout>
      <h1>Schools Management</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          className="auth-input"
          placeholder="New School Name"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
        />
        <button
          className="nav-btn nav-btn-primary"
          onClick={createSchool}
        >
          Add School
        </button>
      </div>
      <table className="school-table">
  <thead>
    <tr>
      <th>School</th>
      <th>Status</th>
      <th>Principal</th>
      <th>Students</th>
      <th>Actions</th>
    </tr>
  </thead>

  <tbody>
    {schools.map((school) => (
      <tr key={school._id}>
        <td>{school.schoolName}</td>

        <td>
          <span
            className={`status-badge ${
              school.isActive ? "active" : "inactive"
            }`}
          >
            {school.isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </td>

       <td>
  {school.principalId ? (
    school.principalId.name
  ) : (
    <span style={{ color: "#ffcc00" }}>Not Assigned</span>
  )}
</td>

        <td>{school.studentCount}</td>

        <td>
          <div className="action-buttons">
            <button
              className="toggle-btn"
              onClick={() => toggleStatus(school._id)}
            >
              {school.isActive ? "Deactivate" : "Activate"}
            </button>

            <button
              className="delete-btn"
              onClick={() => deleteSchool(school._id)}
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>

    </AdminLayout>
  );
}