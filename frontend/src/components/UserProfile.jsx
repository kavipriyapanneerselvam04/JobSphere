import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import "../ui/profile.css";

function UserProfile() {
  const userId = Number(localStorage.getItem("userId"));
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [resume, setResume] = useState(null);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    api.get(`/api/users/profile/${userId}`).then((res) => {
      setProfile(res.data);
    });

    api.get(`/api/resume/user/${userId}`).then((res) => {
      setResume(res.data);
    });

    api
      .get(`/api/jobs/applications/user/${userId}`)
      .then((res) => {
        setApplications(res.data || []);
      })
      .catch(() => {
        setApplications([]);
      });
  }, [userId]);

  const deleteAccount = async () => {
    const ok = window.confirm(
      "Delete account permanently? This will remove your profile, resumes, applications and posted data. You can register again later."
    );

    if (!ok) return;

    try {
      const res = await api.delete(`/api/users/delete/${userId}`);
      alert(res.data?.message || "Account deleted permanently");
      localStorage.clear();
      navigate("/register");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete account");
    }
  };

  if (!profile) {
    return <div className="loading">Loading profile...</div>;
  }

  const skills = resume?.skills
    ? String(resume.skills)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const hasPersonal = [profile.father_name, profile.dob, profile.phone, profile.address]
    .map((item) => (item ? String(item).trim() : ""))
    .filter(Boolean).length;

  const completeness = Math.round((hasPersonal / 4) * 100);

  return (
    <div className="profile-container">
      <motion.div
        className="profile-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="profile-header">
          <div className="avatar-wrapper">
            {profile.profile_photo ? (
              <img
                src={`http://localhost:5000/profile/${profile.profile_photo}`}
                alt="profile"
                className="avatar-img"
              />
            ) : (
              <div className="avatar">{profile.name?.charAt(0).toUpperCase() || "U"}</div>
            )}
          </div>

          <div>
            <h3 className="profile-title">{profile.name || "User"}</h3>
            <p className="email">{profile.email || "No email available"}</p>
            <span className="role">{profile.role || "User"}</span>
          </div>
        </div>

        <p className="tagline">
          Build a stronger first impression for recruiters by keeping your profile and resume details clear,
          complete, and up to date.
        </p>

        <div className="insight-grid">
          <div className="insight-item">
            <strong>{completeness}%</strong>
            <span>Profile completion</span>
          </div>
          <div className="insight-item">
            <strong>{resume?.experience ?? 0}</strong>
            <span>Years experience</span>
          </div>
          <div className="insight-item">
            <strong>{skills.length}</strong>
            <span>Skills listed</span>
          </div>
        </div>

        <div className="profile-section">
          <h4>Personal Details</h4>
          <div className="details-grid">
            <div className="detail-item">
              <small>Father Name</small>
              <p>{profile.father_name || "-"}</p>
            </div>
            <div className="detail-item">
              <small>Date of Birth</small>
              <p>{profile.dob ? String(profile.dob).slice(0, 10) : "-"}</p>
            </div>
            <div className="detail-item">
              <small>Phone</small>
              <p>{profile.phone || "-"}</p>
            </div>
            <div className="detail-item">
              <small>Address</small>
              <p>{profile.address || "-"}</p>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h4>Skills</h4>
          {skills.length > 0 ? (
            <ul className="skills-wrap">
              {skills.map((skill) => (
                <li key={skill} className="skill-chip">
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-resume">No skills added yet. Add your resume to highlight your expertise.</p>
          )}
        </div>

        {resume?.resume_file ? (
          <div className="resume-box">
            <div className="resume-meta">
              <span>Resume</span>
              <span>Keep this updated for better opportunities</span>
            </div>
            <a
              href={`http://localhost:5000/uploads/${resume.resume_file}`}
              target="_blank"
              rel="noreferrer"
              className="view-btn"
            >
              View
            </a>
          </div>
        ) : (
          <div className="no-resume">No resume uploaded yet. Add one to improve your profile visibility.</div>
        )}

        <div className="profile-section applications-section">
          <h4>Job Applications</h4>
          {applications.length === 0 ? (
            <p className="no-resume">No job applications yet.</p>
          ) : (
            <div className="application-status-list">
              {applications.map((app) => (
                <div key={app.id} className="application-status-item">
                  <div className="application-status-top">
                    <p className="application-job-title">{app.job_title}</p>
                    <span className={`profile-status-badge profile-${String(app.status || "").toLowerCase()}`}>
                      {app.status}
                    </span>
                  </div>
                  {app.status === "DECLINED" && app.status_reason ? (
                    <p className="application-status-reason">Declined because: {app.status_reason}</p>
                  ) : null}
                  <p className="application-date">Applied on: {new Date(app.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="profile-actions">
          <button className="secondary-btn" onClick={() => navigate("/edit-profile")}>
            Edit Profile
          </button>
          <button className="primary-btn" onClick={() => navigate("/user")}>
            Update Resume
          </button>
        </div>

        <div className="danger-zone">
          <p>Danger Zone</p>
          <button className="danger-btn" onClick={deleteAccount}>
            Delete Account Permanently
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default UserProfile;
