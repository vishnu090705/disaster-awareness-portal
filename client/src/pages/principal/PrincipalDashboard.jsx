import { useEffect, useState } from "react";
import axios from "axios";

export default function PrincipalDashboard() {
const [stats, setStats] = useState({
  preparednessScore: 0,
  totalStudents: 0,
  active: 0,
  completed: 0,
  avgProgress: 0,
  avgQuiz: 0, 
  atRisk: 0
});
const [ticketStats, setTicketStats] = useState({
  total: 0,
  studentSpecific: 0,
  schoolWide: 0,
  open: 0,
  inProgress: 0,
  resolved: 0
});
  useEffect(() => {
     const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/principal/stats", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
})
    setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!stats) return <h2>Loading...</h2>;
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchTicketStats = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/tickets/stats",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    setTicketStats(res.data);
  } catch (error) {
    console.error("Ticket Stats Error:", error);
  }
};
  fetchTicketStats();
}, []);


  return (
    
      <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>

        {/* Big Card */}
        <div style={bigCard}>
          <h2>School Preparedness Score</h2>
          <h2>{stats?.preparednessScore || 0}%</h2>
        </div>

        {/* Stats Grid */}
        <div style={grid}>
         <StatCard title="Total Students" value={stats?.totalStudents || 0} />

<StatCard title="Active Students" value={stats?.active || 0} />

<StatCard title="Completed Students" value={stats?.completed || 0} />

<StatCard 
  title="Avg Progress" 
  value={`${stats?.avgProgress || 0}%`} 
/>

<StatCard 
  title="Avg Quiz Score" 
  value={`${stats?.avgQuiz || 0}%`} 
/>

<StatCard 
  title="Students At Risk" 
  value={stats?.atRisk || 0} 
/>
          <StatCard title="Total Support Requests" value={ticketStats?.totalRequests || 0} />
          <StatCard title="Student-Specific Issues" value={ticketStats?.studentIssues || 0} />
          <StatCard title="School-Wide Issues" value={ticketStats?.schoolIssues || 0} />
          <StatCard title="Open Tickets" value={ticketStats?.open || 0} />
          <StatCard title="In Progress" value={ticketStats?.inProgress || 0} />
          <StatCard title="Resolved" value={ticketStats?.resolved || 0} />

        </div>
      </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div style={card}>
      <h2>{value}</h2>
      <p>{title}</p>
    </div>
  );
}

const bigCard = {
   background: "rgba(38, 37, 37, 0.85)",
  backdropFilter: "blur(8px)",
  borderRadius: "16px",
  padding: "30px",
  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
  textAlign: "center"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "20px"
};

const card = {
  background: "rgba(38, 37, 37,0.85)",
  backdropFilter: "blur(8px)",
  borderRadius: "16px",
  padding: "30px",
  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
  textAlign: "center"
};
