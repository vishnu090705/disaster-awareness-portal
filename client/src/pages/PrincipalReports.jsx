import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function PrincipalReports() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [classFilter, setClassFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const reportRef = useRef();

  useEffect(() => {
    fetchReports();
  }, [classFilter, riskFilter]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/principal/reports?className=${classFilter}&risk=${riskFilter}`,
        {
   headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  }
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/principal/classes",
        {
   headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  }
      );
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const exportPDF = async () => {
  const element = reportRef.current;

   element.classList.add("pdf-mode");

     await new Promise((resolve) => setTimeout(resolve, 500));

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff"
  });

    // 🔥 Remove PDF mode (restore UI)
  element.classList.remove("pdf-mode");

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 10, imgWidth, imgHeight);

  pdf.save("report.pdf");
};

  if (!data) return <div style={{ color: "white" }}>Loading...</div>;

  const chartData = data.students.map((s) => ({
    name: s.name,
    score: s.quizScore || 0
  }));

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
        padding: "40px",
        color: "white",
        backgroundImage: "url('/images/dashboard-bg-1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative"
      }}
    >
      {/* Dark Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          zIndex: 0
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <h1 style={{ fontSize: "32px" }}>Reports Center</h1>

          <div>
            <button
              onClick={() => navigate("/principal")}
              style={{
                padding: "8px 15px",
                marginRight: "10px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer"
              }}
            >
              ← Dashboard
            </button>

            <button
              onClick={exportPDF}
              style={{
                padding: "8px 15px",
                borderRadius: "6px",
                border: "none",
                background: "#4CAF50",
                color: "white",
                cursor: "pointer"
              }}
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px" }}
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px" }}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="At Risk">At Risk</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

  <div
  ref={reportRef}
  className="pdf-content"
  style={{
    marginTop: "20px"
  }}
>

  <h2 style={{ textAlign: "center" }}>
    Disaster Awareness Report
  </h2>
        {/* Summary */}
        <div style={{ marginTop: "30px" }}>
          <h3>Total Students: {data.totalStudents}</h3>
          <h3>At Risk: {data.atRisk}</h3>
          <h3>Average Quiz: {data.avgQuiz}%</h3>
        </div>

        {/* Chart */}
        <div style={{ marginTop: "40px" }}>
          <BarChart  width={700} height={300} data={chartData}>
            <CartesianGrid  stroke="#ccc" strokeDasharray="3 3" />
             <XAxis 
    dataKey="name" 
    stroke="#000"   // 🔥 important
    tick={{ fill: "#000", fontSize: 12 }}
  />
             <YAxis 
    stroke="#000" 
    tick={{ fill: "#000", fontSize: 12 }}
  />
            <Tooltip />
   <Bar
  dataKey="score"
  fill="#4CAF50"
  isAnimationActive={false}
  label={{ position: "top", fill: "#000" }}  // 🔥 important
/>
          </BarChart>
        </div>

        {/* Table */}
        <div style={{ marginTop: "40px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              borderRadius: "10px",
              overflow: "hidden"
            }}
          >
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.5)" }}>
                <th style={{ padding: "12px" }}>Name</th>
                <th style={{ padding: "12px" }}>Class</th>
                <th style={{ padding: "12px" }}>Quiz Score</th>
                <th style={{ padding: "12px" }}>Status</th>
              </tr>
            </thead>

            <tbody>
              {data.students.map((s) => (
                <tr key={s._id} style={{ textAlign: "center" }}>
                  <td style={{ padding: "10px" }}>{s.name}</td>
                  <td>{s.className || "N/A"}</td>
                  <td>{s.quizScore || 0}%</td>
                  <td>{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

      </div>
    </div>
  );
}