import { useEffect, useState } from "react";
import axios from "axios";
import bgImage from "/images/dashboard-bg-1.jpg"; 
import { useNavigate } from "react-router-dom";
export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  const fetchTickets = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/tickets/all",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    setTickets(res.data);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

const updateStatus = async (id, newStatus) => {
  try {
    await axios.put(
      `http://localhost:5000/api/tickets/${id}/status`,
      { status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    fetchTickets(); // refresh UI
  } catch (error) {
    console.error("Update failed:", error.response?.data || error);
  }
};

  return (
    <div
  style={{
    minHeight: "100vh",
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    padding: "40px"
  }}
>
    <div
  style={{
    background: "rgba(0,0,0,0.65)",
    padding: "30px",
    borderRadius: "15px",
    color: "white"
  }}
>
  {/* Your table here */}
    <div style={{ padding: "40px" }}>
      <h2>Ticket Management</h2>

      <table width="100%" border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Issue</th>
            <th>Type</th>
            <th>Principal</th>
            <th>Student Details</th>
            <th>Status</th>
            <th>Change Status</th>
          </tr>
        </thead>

        <tbody>
          {tickets.map(ticket => (
            <tr key={ticket._id}>
              <td>{ticket.issue}</td>
              <td>{ticket.type}</td>
              <td>{ticket.principalId?.name}</td>
              <td>
  {ticket.type === "student" && ticket.studentId ? (
    <>
      👤 {ticket.studentId.name} <br />
      🎓 Class: {ticket.studentId.class} <br />
      🆔 Roll: {ticket.studentId.rollNo}
    </>
  ) : (
    "—"
  )}
</td>
              <td>{ticket.status}</td>

              <td>
               <select
  value={ticket.status}
  onChange={(e) => updateStatus(ticket._id, e.target.value)}
>
  <option value="Open">Open</option>
  <option value="In Progress">In Progress</option>
  <option value="Resolved">Resolved</option>
</select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        <button
    onClick={() => navigate("/admin")}
    style={{
      padding: "8px 16px",
      background: "#2196F3",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "bold"
    }}
  >
    ← Back to Dashboard
  </button>
    </div>
    </div>
    </div>
  );
}