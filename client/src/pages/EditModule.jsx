import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";

export default function EditModule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: ""
  });
  const [videos, setVideos] = useState(Array(5).fill(null));
const [thumbnail, setThumbnail] = useState(null);
const [changedIndexes, setChangedIndexes] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/modules/${id}`)
      .then(res => res.json())
      .then(data => setForm(data));
  }, [id]);

 const handleUpdate = async () => {
  const formData = new FormData();

  // ✅ text fields
  formData.append("name", form.name);
  formData.append("description", form.description);
  formData.append("category", form.category);

  // ✅ videos
  videos.forEach((video) => {
    if (video) {
      formData.append("videos", video);
    }
  });

  // ✅ thumbnail
  if (thumbnail) {
    formData.append("thumbnail", thumbnail);
  }

  // ✅ changed indexes
  formData.append("changedVideos", JSON.stringify(changedIndexes));

  await fetch(`http://localhost:5000/api/modules/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  alert("Module updated successfully");
  navigate("/admin/modules");
};
  return (
    <AdminLayout>
      <div style={{ padding: "20px" }}>
        <h1>Edit Module</h1>

        <input
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          placeholder="Module Name"
        />

        <textarea
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          placeholder="Description"
        />

        <select
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
        >
          <option value="">Select Category</option>
          <option value="natural">Natural</option>
          <option value="man-made">Man-Made</option>
        </select>

        <button onClick={handleUpdate}>
          Update Module
        </button>
      </div>
    </AdminLayout>
  );
}