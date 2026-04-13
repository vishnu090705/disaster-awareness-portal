import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminVideo() {
  const [file, setFile] = useState(null);
  const [mediaList, setMediaList] = useState([]);

  const fetchMedia = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/upload/earthquake"
    );
    setMediaList(res.data);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    await axios.post(
      "http://localhost:5000/api/upload/earthquake",
      formData,
      {
        headers: {
          role: "admin"
        }
      }
    );

    fetchMedia();
  };

  const handleDelete = async (id) => {
    await axios.delete(
      `http://localhost:5000/api/upload/${id}`,
      {
        headers: {
          role: "admin"
        }
      }
    );

    fetchMedia();
  };

  return (
    <div className="landing">
      <h2>Upload Earthquake Media</h2>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button className="btn" onClick={handleUpload}>
        Upload
      </button>

      <h3>Uploaded Media</h3>

      {mediaList.map((item) => (
        <div key={item._id}>
          {item.type === "image" ? (
            <img
              src={`http://localhost:5000${item.filePath}`}
              width="200"
            />
          ) : (
            <video
              src={`http://localhost:5000${item.filePath}`}
              width="300"
              controls
            />
          )}

          <button onClick={() => handleDelete(item._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}