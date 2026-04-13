import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

export default function AdminPrincipals() {
  const [principals, setPrincipals] = useState([]);
  const [schools, setSchools] = useState([]);
  const token = localStorage.getItem("token");
  const [newName, setNewName] = useState("");
const [newEmail, setNewEmail] = useState("");
const [selectedSchool, setSelectedSchool] = useState("");
const [generatedPassword, setGeneratedPassword] = useState("");
const [showPasswordPopup, setShowPasswordPopup] = useState(false);
const createPrincipal = async () => {

  if (!newName || !newEmail || !selectedSchool) {
    alert("Please fill all fields");
    return;
  }     


  const res = await fetch("http://localhost:5000/api/admin/principals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name: newName,
      email: newEmail,
      schoolName: selectedSchool
    })
  });

 const data = await res.json();

 console.log("Backend Response:", data); // debug

if (!res.ok) {
  alert(data.message);
  return;
}

if (res.ok) {
  setGeneratedPassword(data.generatedPassword);
  setShowPasswordPopup(true);
}

  setNewName("");
  setNewEmail("");
  setSelectedSchool("");

  fetchData();
};
const copyPassword = () => {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(generatedPassword)
      .then(() => {
        alert("Password copied!");
      })
      .catch(() => fallbackCopy());
  } else {
    fallbackCopy();
  }
};

const fallbackCopy = () => {
  const textArea = document.createElement("textarea");
  textArea.value = generatedPassword;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);

  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
    alert("Password copied!");
  } catch (err) {
    alert("Failed to copy password");
  }

  document.body.removeChild(textArea);
};
  const fetchData = async () => {
    const pRes = await fetch("http://localhost:5000/api/admin/principals", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const sRes = await fetch("http://localhost:5000/api/admin/schools", {
      headers: { Authorization: `Bearer ${token}` }
    });

    setPrincipals(await pRes.json());
    setSchools(await sRes.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

const assignPrincipal = async (principalId, schoolName) => {
  await fetch(
    `http://localhost:5000/api/admin/principals/${principalId}/assign`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ schoolName })
    }
  );

  fetchData(); // VERY IMPORTANT
};

const removePrincipal = async (id) => {
  try {
    await fetch(
      `http://localhost:5000/api/admin/principals/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // refresh properly
    fetchData();

  } catch (err) {
    console.error(err);
  }
};

  return (
    <AdminLayout>

     {showPasswordPopup && (
      <div style={{ position:"fixed", top:0, left:0, width:"100%", height:"100%", background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999 }}>
        <div style={{ background:"#222", padding:"30px", borderRadius:"10px", color:"white", textAlign:"center" }}>
          <h3>Principal Created 🎉</h3>

          <p>Password:</p>

          <div style={{ background:"#333", padding:"10px", borderRadius:"6px", marginBottom:"15px", fontWeight:"bold" }}>
            {generatedPassword}
          </div>

          <button onClick={copyPassword}>
            Copy Password
          </button>

          <button onClick={() => setShowPasswordPopup(false)}>
            Close
          </button>
        </div>
      </div>
    )}   
      <h1>Principals Management</h1>

      <div
  style={{
    background: "rgba(0, 0, 0, 0.65)",
    padding: "25px",
    borderRadius: "12px",
    marginTop: "30px",
    backdropFilter: "blur(8px)"
  }}
>
  <div
  style={{
    background: "rgba(0,0,0,0.6)",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "25px"
  }}
>
  <h3 style={{ marginBottom: "15px" }}>Create Principal</h3>

  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
    <input
      type="text"
      placeholder="Name"
      value={newName}
      onChange={(e) => setNewName(e.target.value)}
      style={{ padding: "8px", borderRadius: "6px" }}
    />

    <input
      type="email"
      placeholder="Email"
      value={newEmail}
      onChange={(e) => setNewEmail(e.target.value)}
      style={{ padding: "8px", borderRadius: "6px" }}
    />

    <select
  value={selectedSchool}
  onChange={(e) => setSelectedSchool(e.target.value)}
  style={{ padding: "8px", borderRadius: "6px" }}
>
  <option value="">Select School</option>

  {schools.map((school) => (
    <option key={school._id} value={school.schoolName}>
      {school.schoolName}
    </option>
  ))}
</select>

    <button
      style={{
        background: "#ff8800",
        color: "white",
        border: "none",
        padding: "8px 16px",
        borderRadius: "6px",
        cursor: "pointer"
      }}
      onClick={createPrincipal}
    >
      Create
    </button>
  </div>
</div>
  <table
    style={{
      width: "100%",
      color: "white",
      borderCollapse: "collapse"
    }}
  >
    <thead>
      <tr style={{ borderBottom: "2px solid #444" }}>
        <th style={{ textAlign: "left", padding: "12px" }}>Name</th>
        <th style={{ textAlign: "left", padding: "12px" }}>Email</th>
        <th style={{ textAlign: "left", padding: "12px" }}>School</th>
        <th style={{ textAlign: "left", padding: "12px" }}>Actions</th>
      </tr>
    </thead>

    <tbody>
      {principals.length === 0 ? (
        <tr>
          <td colSpan="4" style={{ padding: "15px", textAlign: "center" }}>
            No principals found
          </td>
        </tr>
      ) : (
        principals.map((principal) => (
          <tr
            key={principal._id}
            style={{ borderBottom: "1px solid #333" }}
          >
            <td style={{ padding: "12px" }}>{principal.name}</td>

            <td style={{ padding: "12px" }}>{principal.email}</td>

            <td style={{ padding: "12px" }}>
              {principal.schoolName || (
                <span style={{ color: "#ffcc00" }}>
                  Not Assigned
                </span>
              )}
            </td>

            <td style={{ padding: "12px" }}>
              <select
                style={{
                  padding: "6px",
                  borderRadius: "6px",
                  marginRight: "10px"
                }}
              
  onChange={(e) =>
    assignPrincipal(principal._id, e.target.value)
  }
>
  <option value="">Select School</option>
  {schools.map((school) => (
    <option key={school._id} value={school.schoolName}>
      {school.schoolName}
    </option>
  ))}
</select>

              {principal.schoolName && (
                <button
  disabled={!principal.schoolName}
  style={{
    background: principal.schoolName ? "#e74c3c" : "#555",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: principal.schoolName ? "pointer" : "not-allowed",
    opacity: principal.schoolName ? 1 : 0.5
  }}
onClick={() => removePrincipal(principal._id)}
>
  Remove
</button>
              )}
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>
    </AdminLayout>
  );
}