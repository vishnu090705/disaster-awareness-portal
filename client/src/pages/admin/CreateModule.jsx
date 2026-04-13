import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import "./AdminForms.css";

export default function CreateModule() {
  const titles = ["Before", "During", "After", "Do's", "Don'ts"];
   const [activeSection, setActiveSection] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: ""
  });

  const [transcripts, setTranscripts] = useState(Array(5).fill(""));
  const [videos, setVideos] = useState(Array(5).fill(null));
  const [thumbnail, setThumbnail] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
  
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

    await fetch("http://localhost:5000/api/modules", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: formData
    });

    alert("Module created successfully");
  };

  return (
    <AdminLayout>
      <div className="admin-form-container">
        <h2>Create Module</h2>

        <form onSubmit={handleSubmit}>

          {/* Module Info Section */}
          <div className="section-card">
            <h3>Module Details</h3>

            <input
              type="text"
              placeholder="Module Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />

            <textarea
              placeholder="Module Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />

            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              required
            >
              <option value="">Select Category</option>
              <option value="natural">Natural</option>
              <option value="man-made">Man-Made</option>
            </select>
              <h3>Thumbnail</h3>
            <input
              type="file"
              onChange={(e) => setThumbnail(e.target.files[0])}
            />
          </div>

          {/* Sections */}
          {titles.map((title, index) => (
  <div key={index} className="section-card">

    <div
      className="section-header"
      onClick={() =>
        setActiveSection(activeSection === index ? null : index)
      }
    >
      <h3>{title}</h3>
      <span>{activeSection === index ? "▲" : "▼"}</span>
    </div>

    {activeSection === index && (
      <div className="section-content">

        <input
          type="file"
          onChange={(e) => {
            const newVideos = [...videos];
            newVideos[index] = e.target.files[0];
            setVideos(newVideos);
          }}
        />

        <textarea
          placeholder="Transcript"
          value={transcripts[index]}
          onChange={(e) => {
            const newTranscripts = [...transcripts];
            newTranscripts[index] = e.target.value;
            setTranscripts(newTranscripts);
          }}
        />

      </div>
    )}
  </div>
))}
          <button type="submit" className="primary-btn">
            Create Module
          </button>

        </form>
      </div>
    </AdminLayout>
  );
}