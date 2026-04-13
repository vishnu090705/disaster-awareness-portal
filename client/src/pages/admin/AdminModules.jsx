import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import ConfirmModal from "../../components/ConfirmModal";

export default function AdminModules() {
  const [modules, setModules] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchModules = async () => {
    const res = await fetch("http://localhost:5000/api/modules");
    const data = await res.json();
    setModules(data);
  };

  useEffect(() => {
    fetchModules();
  }, []);


const [showModal, setShowModal] = useState(false);
const [selectedModule, setSelectedModule] = useState(null);


const handleDelete = async (id) => {
  try {
    await fetch(`http://localhost:5000/api/modules/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    fetchModules();
  } catch (err) {
    console.error("Delete failed:", err);
  }
};

  const filteredModules = modules.filter((module) =>
    module.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="admin-container">
   {/* Existing content */}
      <div className="module-table-container">
        <h1>Module Management</h1>

        {/* Search Bar */}
        <div className="module-header">
        <input
          type="text"
          placeholder="Search modules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px",
            width: "250px",
            marginBottom: "15px"
          }}
        />

        <button
          className="nav-btn nav-btn-primary"
          onClick={() => navigate("/admin/modules/create")}
        >
          + Create New Module
        </button>
            </div>
        <table className="module-table">
          <thead>
            <tr>
                <th>Thumbnail</th>
                <th>Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredModules.map((module) => (
              <tr key={module._id}>
                <td>
                    <img
                        src={`http://localhost:5000${module.thumbnail}`}
                        alt="thumb"
                        style={{
                        width: "60px",
                        height: "40px",
                        objectFit: "cover",
                        borderRadius: "6px"
                        }}
                    />
                    </td>
                <td>{module.name}</td>
                <td>{module.category}</td>
                <td>
                  {module.isActive ? "Active" : "Inactive"}
                </td>
                <td className="action-buttons">
                  <button
                  className="edit-btn"
                    onClick={() =>
                      navigate(`/admin/modules/edit/${module._id}`)
                    }
                  >
                    Edit
                  </button>
                  <button
                      className="delete-btn"
                      onClick={() => {
                        setSelectedModule(module._id);
                        setShowModal(true);
                      }}
                    >
                      Delete
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {showModal && (
  <ConfirmModal
    message="Are you sure you want to delete this module?"
    onCancel={() => setShowModal(false)}
   onConfirm={async () => {
  await handleDelete(selectedModule);
  setShowModal(false);
}}
  />
)}
      </div>
      </div>
    </AdminLayout>
  );
}