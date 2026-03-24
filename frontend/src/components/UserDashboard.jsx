import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api, { resolveAssetUrl } from "../services/api";
import "../ui/dashboard.css";

function UserDashboard() {
  const userId = Number(localStorage.getItem("userId"));
  const navigate = useNavigate();

  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState(0);
  const [file, setFile] = useState(null);
  const [resumeSummary, setResumeSummary] = useState(null);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasResume, setHasResume] = useState(false);

  const matchJobs = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const res = await api.get(`/api/jobs/match/${userId}`);
      setMatchedJobs(res.data || []);
      setHasResume(true);
    } catch (err) {
      if (err.response?.status === 404) {
        setHasResume(false);
      }
      alert(err.response?.data?.message || "No jobs matched");
      setMatchedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;

    api
      .get(`/api/resume/user/${userId}`)
      .then((res) => {
        const resume = res.data || null;
        setResumeSummary(resume);
        setHasResume(Boolean(resume));
        if (resume) {
          setSkills(resume.skills || "");
          setExperience(Number(resume.experience || 0));
          matchJobs();
        }
      })
      .catch(() => {
        setResumeSummary(null);
        setHasResume(false);
        setMatchedJobs([]);
      });
  }, [userId]);

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

      const updatedResume = res.data?.resume || {
        skills: skills.trim(),
        experience: experience || 0,
      };

      alert(res.data?.message || "Resume uploaded successfully");
      setResumeSummary(updatedResume);
      setHasResume(true);
      setFile(null);
    } catch (err) {
      alert(err.response?.data?.message || "Resume upload failed");
    }
  };

  const resumeSkills = String(resumeSummary?.skills || skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  const uploadedResumeLink = resolveAssetUrl(resumeSummary?.resume_url || resumeSummary?.resume_file);

  return (
    <motion.div className="dashboard-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="app-title">JobSphere</h1>
      <p className="app-subtitle">Smart Resume and Job Matching Platform</p>

      <div className="form-card dashboard-panel">
        <h2>Upload Resume</h2>
        <p className="panel-subtitle">Upload or update your PDF resume here, then refresh your job matches.</p>

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
          <option value="3">3+ Years</option>
          <option value="5">5+ Years</option>
        </select>

        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0] || null)} />

        {resumeSummary ? (
          <div className="current-resume-card">
            <strong>{resumeSummary.original_file_name || "Latest uploaded resume"}</strong>
            <span>{resumeSkills.length} skills tracked</span>
            <span>{resumeSummary.experience ?? 0} year(s) of experience</span>
            {uploadedResumeLink ? (
              <div className="resume-link-row">
                <a href={uploadedResumeLink} target="_blank" rel="noreferrer" className="mini-action-btn">
                  View Uploaded Resume
                </a>
                <a href={uploadedResumeLink} download className="mini-action-btn mini-action-btn--dark">
                  Download Uploaded Resume
                </a>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="btn-row">
          <button className="primary-btn" onClick={uploadResume}>
            {resumeSummary ? "Update Resume" : "Upload Resume"}
          </button>
          <button className="secondary-btn" onClick={matchJobs} disabled={!hasResume && !loading}>
            {loading ? "Matching..." : "Refresh Matches"}
          </button>
        </div>
      </div>

      <h2 className="section-title">Recommended Jobs</h2>

      {loading && <p className="status-text">Finding the best matches...</p>}

      {!loading && matchedJobs.length === 0 && hasResume && (
        <div className="empty-state jobs-empty">
          <p>No jobs matched yet. Update your resume and try refreshing the matches.</p>
        </div>
      )}

      {!hasResume ? (
        <div className="empty-state jobs-empty">
          <p>No resume found yet. Upload your resume above to start getting job matches.</p>
        </div>
      ) : null}

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
                    <span key={`${job.id}-${skill}-${index}`} className="skill-chip">
                      {skill}
                    </span>
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
  );
}

export default UserDashboard;
