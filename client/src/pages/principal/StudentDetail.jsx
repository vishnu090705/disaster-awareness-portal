import bgImage from  "/public/images/dashboard-bg-1.jpg";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ResponsiveContainer } from "recharts";
export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
axios.get(`http://localhost:5000/api/principal/students/${id}`)
  useEffect(() => {
    fetchStudent();
  }, []);

  const fetchStudent = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/principal/students/${id}`
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
<div
  style={{
    minHeight: "100vh",
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    position: "relative"
  }}
>
  {/* Dark overlay */}
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "rgba(0,0,0,0.65)"
    }}
  />

  {/* Content */}
  <div
    style={{
      position: "relative",
      padding: "60px",
      color: "white",
      maxWidth: "1000px"
    }}
  >
    {/* Your existing content here */}
    <div style={{ padding: "40px", color: "white" }}>
  
  <h2 style={{ fontSize: "28px", marginBottom: "10px" }}>
    {data.student.name}
  </h2>

  <p>Class: {data.student.class|| "N/A"}</p>

  <div style={{ marginBottom: "20px" }}>
    <h3>Overall Performance</h3>

      <p>Progress: {data.progressPercent}%</p>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <p style={{ margin: 0 }}>Average Quiz Score: {data.avgQuiz}%</p>

     <span
      style={{
        background:
          status === "Completed"
            ? "#28a745"
            : status === "At Risk"
            ? "#dc3545"
            : "#007bff",
        color: "white",
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "14px",
        fontWeight: "500"
      }}
    >
        {data.status}
      </span>
    </div>
  </div>

  <div style={{ marginTop: "40px" }}>
    <h3>Modules</h3>

    {data.modules.length === 0 ? (
      <p>No modules assigned</p>
    ) : (
      data.modules.map((m) => (
        <div
          key={m._id}
          style={{
            padding: "10px",
            marginBottom: "10px",
            background: "rgba(0,0,0,0.4)",
            borderRadius: "8px"
          }}
        >
          <strong>{m.module?.title}</strong>
          <p>
            {m.isCompleted ? "✅ Completed" : "❌ Not Completed"} |
            Score: {m.bestScore}%
          </p>
        </div>
      ))
    )}
  </div>

<div style={{ marginTop: "50px" }}>
  <h3>Performance Trend</h3>

  {data.modules.length > 0 && (
    <ResponsiveContainer width="100%" height={300}>
    <LineChart
      width={600}
      height={300}
      data={data.modules}
    >
      <CartesianGrid strokeDasharray="3 3" />
      
      <XAxis dataKey="moduleId.title" />
      
      <YAxis domain={[0, 100]} />
      
      <Tooltip />
      
      <Line
        type="monotone"
        dataKey="bestScore"
        stroke="#4CAF50"
        strokeWidth={3}
      />
    </LineChart>
    </ResponsiveContainer>
  )}
</div>

  <div style={{ marginTop: "30px" }}>
    <button
      onClick={() => navigate("/principal/students")}
      style={{
        padding: "10px 20px",
        background: "#4CAF50",
        border: "none",
        borderRadius: "6px",
        color: "white",
        cursor: "pointer"
      }}
    >
      ⬅ Back to Students
    </button>
  </div>

</div>
  </div>
</div>
  
  );
}




  
