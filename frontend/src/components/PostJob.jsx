import { useState } from "react";
import api from "../services/api";
import "../ui/dashboard.css";
import "../ui/common.css";

function PostJob() {
  const [title, setTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");

  const handlePost = async () => {
    try {
      await api.post("/api/jobs/add", {
        title,
        skills,
        description
      });
      alert("Job posted successfully");
      setTitle("");
      setSkills("");
      setDescription("");
    } catch {
      alert("Job posting failed");
    }
  };

  return (
    <div className="dashboard-card">
      <h3>Post New Job</h3>

      <input placeholder="Job Title" onChange={(e) => setTitle(e.target.value)} />
      <input placeholder="Required Skills" onChange={(e) => setSkills(e.target.value)} />
      <textarea
        placeholder="Job Description"
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>

      <button onClick={handlePost}>Post Job</button>
    </div>
  );
}

export default PostJob;
