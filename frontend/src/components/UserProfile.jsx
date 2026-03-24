import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api, { resolveAssetUrl } from "../services/api";
import "../ui/profile.css";

function UserProfile() {
  const userId = Number(localStorage.getItem("userId"));
  const navigate = useNavigate();
  const photoInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [resume, setResume] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (!userId) {
      setError("User not logged in. Please sign in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.allSettled([
      api.get(`/api/users/profile/${userId}`),
      api.get(`/api/resume/user/${userId}`),
      api.get(`/api/jobs/applications/user/${userId}`),
    ])
      .then(([profileResult, resumeResult, applicationResult]) => {
        if (profileResult.status === "fulfilled") {
          setProfile(profileResult.value.data || null);
          setError("");
        } else {
          setError(profileResult.reason?.response?.data?.message || "Failed to load profile");
        }

        setResume(resumeResult.status === "fulfilled" ? resumeResult.value.data || null : null);
        setApplications(applicationResult.status === "fulfilled" ? applicationResult.value.data || [] : []);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const uploadProfilePhoto = async (selectedFile) => {
    if (!selectedFile) return;

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("photo", selectedFile);

      const res = await api.post("/api/users/profile-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const nextPhoto = res.data?.url || res.data?.filename || "";
      setProfile((prev) => (prev ? { ...prev, profile_photo: nextPhoto } : prev));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to upload profile photo");
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }
    }
  };

  const onAvatarClick = () => {
    if (!uploadingPhoto) {
      photoInputRef.current?.click();
    }
  };

  const onPhotoChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    uploadProfilePhoto(selectedFile);
  };

  const deleteProfilePhoto = async () => {
    try {
      try {
        await api.delete(`/api/users/profile-photo/${userId}`);
      } catch (primaryErr) {
        await api.post("/api/users/profile-photo/delete", { userId });
      }
      setProfile((prev) => (prev ? { ...prev, profile_photo: null } : prev));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete profile photo");
    }
  };

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

  const skills = useMemo(
    () =>
      resume?.skills
        ? String(resume.skills)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    [resume]
  );

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <h2>Profile</h2>
          <div className="no-resume">{error || "Unable to load profile right now."}</div>
          <div className="profile-actions">
            <button className="primary-btn" onClick={() => navigate("/user")}>
              Back to Dashboard
            </button>
            <button className="secondary-btn" onClick={() => navigate("/")}>
              Login Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasPersonal = [profile.father_name, profile.dob, profile.phone, profile.address]
    .map((item) => (item ? String(item).trim() : ""))
    .filter(Boolean).length;

  const completeness = Math.round((hasPersonal / 4) * 100);
  const profilePhoto = resolveAssetUrl(profile.profile_photo);
  const resumeLink = resolveAssetUrl(resume?.resume_url || resume?.resume_file);

  return (
    <div className="profile-container">
      <motion.div
        className="profile-card profile-dashboard-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="profile-header">
          <div className="avatar-upload-panel">
            <button
              type="button"
              className={`avatar-wrapper avatar-upload-trigger${uploadingPhoto ? " is-uploading" : ""}`}
              onClick={onAvatarClick}
            >
              {profilePhoto ? (
                <img src={profilePhoto} alt="profile" className="avatar-img" />
              ) : (
                <div className="avatar">{profile.name?.charAt(0).toUpperCase() || "U"}</div>
              )}
            </button>
            {profilePhoto ? (
              <button
                type="button"
                className="delete-photo-btn"
                onClick={deleteProfilePhoto}
                disabled={uploadingPhoto}
              >
                Delete Profile Photo
              </button>
            ) : null}
          </div>

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden-file-input"
            onChange={onPhotoChange}
          />

          <div className="profile-top-meta">
            <h3 className="profile-title">{profile.name || "User"}</h3>
            <p className="email">{profile.email || "No email available"}</p>
            <span className="role">{profile.role || "User"}</span>
          </div>
        </div>

        <div className="profile-dashboard-grid">
          <section>
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
                <div className="detail-item">
                  <small>GitHub</small>
                  {profile.github_url ? (
                    <a href={profile.github_url} target="_blank" rel="noreferrer" className="detail-link">
                      Open GitHub
                    </a>
                  ) : (
                    <p>-</p>
                  )}
                </div>
                <div className="detail-item">
                  <small>LinkedIn</small>
                  {profile.linkedin_url ? (
                    <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="detail-link">
                      Open LinkedIn
                    </a>
                  ) : (
                    <p>-</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section>
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

            {resumeLink ? (
              <div className="resume-box">
                <div className="resume-meta">
                  <span>{resume?.original_file_name || "Resume"}</span>
                  <span>Keep this updated for better opportunities</span>
                </div>
                <div className="resume-actions-inline">
                  <a href={resumeLink} target="_blank" rel="noreferrer" className="view-btn">
                    View
                  </a>
                  <a href={resumeLink} download className="download-btn">
                    Download
                  </a>
                </div>
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
          </section>
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
