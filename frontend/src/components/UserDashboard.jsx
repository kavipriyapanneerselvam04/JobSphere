import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import UserSidebar from "./UserSidebar";
import "../ui/dashboard.css";

function UserDashboard() {
  const userId = Number(localStorage.getItem("userId"));
  const navigate = useNavigate();

  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState(0);
  const [file, setFile] = useState(null);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);

  const uploadResume = async () => {
    if (!skills || skills.trim() === "") {
      alert("Please enter skills");
      return;
    }

    if (!userId) {
      alert("User not found. Please login again.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("skills", skills.trim());
    formData.append("experience", experience || 0);

    if (file) {
      formData.append("resume", file);
    }

    try {
      const res = await api.post("/api/resume/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(res.data.message || "Resume uploaded successfully");
      setResumeUploaded(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Resume upload failed");
    }
  };

  const matchJobs = async () => {
    if (!resumeUploaded) return;

    setLoading(true);
    try {
      const res = await api.get(`/api/jobs/match/${userId}`);
      setMatchedJobs(res.data || []);
    } catch (err) {
      alert("No jobs matched");
      setMatchedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <UserSidebar />

      <motion.div className="dashboard-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="app-title">JobSphere 🚀</h1>
        <p className="app-subtitle">Smart Resume and Job Matching Platform</p>

        <div className="form-card dashboard-panel">
          <h2>Resume and Job Matching</h2>
          <p className="panel-subtitle">Keep your profile updated to get stronger role recommendations.</p>

          <input
            type="text"
            placeholder="Skills (java, react, spring boot)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />

          <select value={experience} onChange={(e) => setExperience(Number(e.target.value))}>
            <option value="0">Fresher</option>
            <option value="1">1 Year</option>
            <option value="2">2+ Years</option>
          </select>

          <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />

          <div className="btn-row">
            <button className="primary-btn" onClick={uploadResume}>Update Resume</button>

            <button
              className="secondary-btn"
              onClick={matchJobs}
              disabled={!resumeUploaded}
            >
              Match Jobs
            </button>
          </div>
        </div>

        <h2 className="section-title">Recommended Jobs</h2>

        {loading && <p className="status-text">Finding the best matches...</p>}

        {!loading && matchedJobs.length === 0 && (
          <div className="empty-state jobs-empty">
            <p>No jobs matched yet. Upload or update your resume, then click Match Jobs.</p>
          </div>
        )}

        <div className="job-grid">
          {matchedJobs.map((job) => {
            const skillList = String(job.skills || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);

            return (
              <motion.div key={job.id} className="job-card professional-job-card" whileHover={{ y: -4 }}>
                <div className="job-card-head">
                  <h3>{job.title}</h3>
                  <span className="job-badge">Recommended</span>
                </div>

                <div className="skills-row">
                  {skillList.length > 0 ? (
                    skillList.map((skill, index) => (
                      <span key={`${job.id}-${skill}-${index}`} className="skill-chip">{skill}</span>
                    ))
                  ) : (
                    <span className="skill-chip">General</span>
                  )}
                </div>

                <p className="job-description">{job.description}</p>

                <button className="apply-btn" onClick={() => navigate(`/apply/${job.id}`)}>
                  Apply Now
                </button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

export default UserDashboard;
