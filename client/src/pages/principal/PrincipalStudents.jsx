import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function PrincipalStudents() {
  const [search, setSearch] = useState("");
    const navigate = useNavigate();
 const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState("all");
 const totalStudents = students.length;
const activeStudents = students.filter(s => s.status === "Active").length;
const atRiskStudents = students.filter(s => s.status === "At Risk").length;
const completedStudents = students.filter(s => s.status === "Completed").length;


useEffect(() => {

 const fetchStudents = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      "http://localhost:5000/api/principal/students",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setStudents(res.data);

  } catch (err) {
    console.error(err);
  }
};

  fetchStudents();
}, []);

const filteredStudents = students.filter(student => {
  const matchesSearch =
    student.name?.toLowerCase().includes(search.toLowerCase());

  const matchesFilter =
    filter === "all" || student.status?.trim() === filter;

  return matchesSearch && matchesFilter;
});

 return (
  <div style={styles.wrapper}>

    {/* Overview Cards */}
    <div style={styles.statsRow}>
    <StatCard title="Total Students" value={totalStudents} />
<StatCard title="Active" value={activeStudents} />
<StatCard title="At Risk" value={atRiskStudents} />
<StatCard title="Completed" value={completedStudents} />
    </div>

    {/* Content Card */}
    <div style={styles.contentCard}>

      {/* Filters */}
      <div style={styles.filterRow}>
        <input
          type="text"
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={styles.dropdown}
        >
          <option value="all">All</option>
          <option value="Active">Active</option>
          <option value="At Risk">At Risk</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* TABLE GOES HERE (Outside select) */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Class</th>
            <th style={styles.th}>Progress</th>
            <th style={styles.th}>Quiz Score</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
       <tbody>
  {filteredStudents.map((s) => (
    <tr key={s._id}>
      <td style={styles.td}>{s.name || "N/A"}</td>

      <td style={styles.td}>
        {s.class || "N/A"}
      </td>

      <td style={styles.td}>
        {s.progressPercent ?? 0}%
      </td>

      <td style={styles.td}>
        {s.avgQuiz ?? 0}%
      </td>

      <td style={styles.td}>
        <span style={statusStyle(s.status)}>
          {s.status}
        </span>
      </td>

      <td style={styles.td}>
        <button
          style={styles.viewBtn}
          onClick={() => navigate(`/principal/students/${s._id}`)}
        >
          👁 View
        </button>
      </td>
    </tr>
  ))}
</tbody>
      </table>

    </div>
    <div style={{ marginBottom: "20px" }}>
  <button
    style={styles.backBtn}
    onClick={() => navigate("/principal")}
  >
    ← Back to Dashboard
  </button>
</div>
  </div>
);
}

function StatCard({ title, value }) {
  return (
    <div style={styles.statCard}>
      <h3>{value}</h3>
      <p>{title}</p>
    </div>
  );
}

const statusStyle = (status) => ({
  padding: "5px 10px",
  borderRadius: "12px",
  fontSize: "12px",
  background:
    status === "Active"
      ? "#16a34a"
      : status === "Completed"
      ? "#2563eb"
      : "#dc2626",
  color: "white",
});

const styles = {
 wrapper: {
  minHeight: "100vh",
  padding: "30px",
  color: "white",
  backgroundImage: "url('/public/images/auth-bg-1.jpg')", // put image in public folder
  backgroundSize: "cover",
  backgroundPosition: "center",
},

  statsRow: {
    display: "flex",
    gap: "20px",
    marginBottom: "25px",
  },

  statCard: {
    flex: 1,
    background: "rgba(38, 37, 37, 0.85)",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
  },

  contentCard: {
    background: "rgba(38, 37, 37, 0.85)",
    padding: "25px",
    borderRadius: "15px",
  },

  filterRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },

  search: {
    padding: "8px",
    borderRadius: "6px",
    border: "none",
    width: "250px",
  },

  dropdown: {
    padding: "8px",
    borderRadius: "6px",
    border: "none",
  },

  table: {
  width: "100%",
  borderCollapse: "collapse",
  textAlign: "left",
},

th: {
  padding: "12px",
  borderBottom: "1px solid rgba(255,255,255,0.2)",
},

td: {
  padding: "12px",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
},
backBtn: {
  padding: "8px 15px",
  borderRadius: "6px",
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
},

viewBtn: {
  padding: "6px 10px",
  borderRadius: "6px",
  border: "none",
  background: "#16a34a",
  color: "white",
  cursor: "pointer",
},
};