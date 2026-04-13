import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";

export default function EditModule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const titles = ["Before", "During", "After", "Do's", "Don'ts"];

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: ""
  });

  const [transcripts, setTranscripts] = useState(Array(5).fill(""));
  const [videos, setVideos] = useState(Array(5).fill(null));
  const [thumbnail, setThumbnail] = useState(null);
  const [existingThumbnail, setExistingThumbnail] = useState("");
  const [moduleData, setModuleData] = useState(null);
  const BASE_URL = "http://localhost:5000";
  const getFullUrl = (path) => {
  if (!path) return "";
  return `http://localhost:5000${path.startsWith("/") ? "" : "/"}${path}`;
};
  // Fetch module data
 useEffect(() => {
  const fetchModule = async () => {
  


    try {
      const res = await fetch(
        `http://localhost:5000/api/modules/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Unauthorized or failed request");
      }

      const data = await res.json();
      setModuleData(data);
      setForm({
        name: data.name || "",
        description: data.description || "",
        category: data.category || ""
      });

      setTranscripts(
        data.sections?.map(section => section.transcript || "") || Array(5).fill("")
      );

      setExistingThumbnail(data.thumbnail || "");
      

    } catch (err) {
      console.error("Fetch module error:", err);
    }
  };

  fetchModule();
}, [id, token]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("changedVideos", JSON.stringify(
  videos.map((v, i) => (v ? i : null)).filter(v => v !== null)
));
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("category", form.category);
    formData.append("transcripts", JSON.stringify(transcripts));

    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    videos.forEach(video => {
      if (video) {
        formData.append("videos", video);
      }
    });

    await fetch(
      `http://localhost:5000/api/modules/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      }
    );

    alert("Module updated successfully");
    navigate("/admin/modules");
  };

  return (
    <AdminLayout>
      <div className="edit-module-container">
  <form className="edit-module-form" onSubmit={handleUpdate}>
    {/* existing form fields */}
    <h2>Edit Module</h2>

<div className="form-row">
  <input
  type="text"
  value={form.name}
  onChange={(e) =>
    setForm({ ...form, name: e.target.value })
  }
/>
  <input
  type="text"
  value={form.description}
  onChange={(e) =>
    setForm({ ...form, description: e.target.value })
  }
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
</div>

<div className="section-divider">Thumbnail
  {moduleData?.thumbnail && (
    
  <img src={getFullUrl(moduleData.thumbnail)} className="thumbnail-preview" />
)}
</div>
<label className="file-upload">
  <input
  type="file"
  hidden
  onChange={(e) => setThumbnail(e.target.files[0])}
/>
  <span>Upload Thumbnail</span>
</label>

<div className="section-divider">Before</div>
<div className="section-block">
  {moduleData?.sections?.[0]?.videoUrl && (
  <video
    src={getFullUrl(moduleData.sections[0].videoUrl)}
    controls
    className="video-preview"
  />
)}
  <label className="file-upload">
  <input
  type="file"
  hidden
  onChange={(e) => {
    const updated = [...videos];
    updated[0] = e.target.files[0];
    setVideos(updated);
  }}
/>
  <span>Upload Video</span>
</label>
  <textarea
  value={transcripts[0]}
  onChange={(e) => {
    const updated = [...transcripts];
    updated[0] = e.target.value;
    setTranscripts(updated);
  }}
/>
</div>

<div className="section-divider">During</div>
<div className="section-block">
  {moduleData?.sections?.[1]?.videoUrl && (
  <video
     src={getFullUrl(moduleData.sections[1].videoUrl)}
    controls
    className="video-preview"
  />
)}
  <label className="file-upload">
<input
  type="file"
  hidden
  onChange={(e) => {
    const updated = [...videos];
    updated[1] = e.target.files[0]; 
    setVideos(updated);
  }}
/>
  <span>Upload Video</span>
</label>
   <textarea
  value={transcripts[1]}
  onChange={(e) => {
    const updated = [...transcripts];
    updated[1] = e.target.value;
    setTranscripts(updated);
  }}
/>
</div>

<div className="section-divider">After</div>
<div className="section-block">
  {moduleData?.sections?.[2]?.videoUrl && (
  <video
     src={getFullUrl(moduleData.sections[2].videoUrl)}
    controls
    className="video-preview"
  />
)}
  <label className="file-upload">
 <input
  type="file"
  hidden
  onChange={(e) => {
    const updated = [...videos];
    updated[2] = e.target.files[0];
    setVideos(updated);
  }}
/>
  <span>Upload Video</span>
</label>
 <textarea
  value={transcripts[2]}
  onChange={(e) => {
    const updated = [...transcripts];
    updated[2] = e.target.value;
    setTranscripts(updated);
  }}
/>
</div>

<div className="section-divider">Do's</div>
<div className="section-block">
  {moduleData?.sections?.[3]?.videoUrl && (
  <video
    src={getFullUrl(moduleData.sections[3].videoUrl)}
    controls
    className="video-preview"
  />
)}
  <label className="file-upload">
  <input
  type="file"
  hidden
  onChange={(e) => {
    const updated = [...videos];
    updated[3] = e.target.files[0];
    setVideos(updated);
  }}
/>
  <span>Upload Video</span>
</label>
   <textarea
  value={transcripts[3]}
  onChange={(e) => {
    const updated = [...transcripts];
    updated[3] = e.target.value;
    setTranscripts(updated);
  }}
/>
</div>

<div className="section-divider">Don'ts</div>
<div className="section-block">
  {moduleData?.sections?.[4]?.videoUrl && (
  <video
     src={getFullUrl(moduleData.sections[4].videoUrl)}
    controls
    className="video-preview"
  />
)}
  <label className="file-upload">
  <input
  type="file"
  hidden
  onChange={(e) => {
    const updated = [...videos];
    updated[4] = e.target.files[0];
    setVideos(updated);
  }}
/>
  <span>Upload Video</span>
</label>
 <textarea
  value={transcripts[4]}
  onChange={(e) => {
    const updated = [...transcripts];
    updated[4] = e.target.value;
    setTranscripts(updated);
  }}
/>
</div>

<button className="update-btn">Update Module</button>
  </form>
</div>
    </AdminLayout>
  );
}