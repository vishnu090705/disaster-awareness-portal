import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";


export default function PrincipalAnalytics() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [range, setRange] = useState("monthly");
const reportRef = useRef();
  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    const res = await axios.get(
  "http://localhost:5000/api/principal/analytics",
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  }
);
    setStats(res.data);
  };

const exportReport = async () => {
  const element = reportRef.current;

  // 🔥 Hide buttons / UI elements
  const buttons = document.querySelectorAll(".no-print");
  buttons.forEach(el => (el.style.display = "none"));

  // 🔥 Capture screen
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true
  });

  // 🔥 Show buttons again
  buttons.forEach(el => (el.style.display = "block"));

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // First page
  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // Extra pages if needed
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save("analytics-report.pdf");
};

  if (!stats) return <div>Loading...</div>;

  const pieData = [
    { name: "Active", value: stats.active },
    { name: "At Risk", value: stats.atRisk },
    { name: "Completed", value: stats.completed }
  ];

return (
  <div
    style={{
      position: "relative",
      minHeight: "100vh",
      width: "100%",
      padding: "40px",
      backgroundImage: "url('/images/dashboard-bg-1.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
    }}
  >
    {/* Dark Overlay */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0, 0, 0, 0.65)",
        zIndex: 0
      }}
    />

    {/* Content Layer */}
    <div ref={reportRef} style={{ position: "relative", zIndex: 1 }}>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <h2>Analytics Dashboard</h2>

      <div>
        <div className="no-print">
        <button
          onClick={() => navigate("/principal")}
          style={{
            marginRight: "10px",
            padding: "8px 15px",
            background: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "6px"
          }}
        >
          ← Back to Dashboard
        </button>
        <button
          onClick={exportReport}
          style={{
            padding: "8px 15px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "6px"
          }}
        >
          Export Report
        </button>
        </div>
      </div>
    </div>

    {/* Date Filter */}
    <div style={{ marginTop: "20px", marginBottom: "30px" }}>
      <select
        value={range}
        onChange={(e) => setRange(e.target.value)}
        style={{
          padding: "8px",
          borderRadius: "6px"
        }}
      >
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
    </div>

    {/* Overview Cards */}
    <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
      {[
        { title: "Total Students", value: stats.totalStudents },
        { title: "Active", value: stats.active },
        { title: "At Risk", value: stats.atRisk },
        { title: "Completed", value: stats.completed },
        { title: "Avg Quiz Score", value: stats.avgQuiz + "%" }
      ].map((card, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            padding: "20px",
            background: "rgba(38,37,37,0.85)",
            borderRadius: "12px",
            color: "white",
            textAlign: "center"
          }}
        >
          <h3>{card.value}</h3>
          <p>{card.title}</p>
        </div>
      ))}
    </div>

{/* Charts */}
<div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
  {/* Line Chart Card */}
  <div
    style={{
      background: "rgba(38,37,37,0.85)",
      padding: "20px",
      borderRadius: "12px"
    }}
  >
    <h4 style={{ color: "white", textAlign: "center" }}>
      Performance Trend
    </h4>

    <LineChart isAnimationActive={false} width={350} height={250} data={stats.performanceTrend}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="score" stroke="#4CAF50" />
    </LineChart>
  </div>


  {/* Bar Chart Card */}
  <div
    style={{
      background: "rgba(38,37,37,0.85)",
      padding: "20px",
      borderRadius: "12px"
    }}
  >
    <h4 style={{ color: "white", textAlign: "center" }}>
      Class Performance
    </h4>

    <BarChart  isAnimationActive={false} width={350} height={250} data={stats.classPerformance}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="class" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="avg" fill="#2196F3" />
    </BarChart>
  </div>


  {/* 🔥 PIE CHART CARD */}
  <div
    style={{
      background: "rgba(38,37,37,0.85)",
      padding: "20px",
      borderRadius: "12px"
    }}
  >
    <h4 style={{ color: "white", textAlign: "center" }}>
      Student Distribution
    </h4>

    <PieChart  isAnimationActive={false} width={350} height={250}>
      <Pie
        data={pieData}
        cx="50%"
        cy="50%"
        outerRadius={90}
        dataKey="value"
      >
        <Cell fill="#2ecc71" />   {/* Active */}
        <Cell fill="#e74c3c" />   {/* At Risk */}
        <Cell fill="#3498db" />   {/* Completed */}
      </Pie>

      <Tooltip />
      <Legend />
    </PieChart>
  </div>

</div>
 
  </div>
  </div>
);
}