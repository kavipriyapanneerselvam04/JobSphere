import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import "../ui/apply.css";

function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const userId = Number(localStorage.getItem("userId"));
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");

  const [form, setForm] = useState({
    name: userName || "",
    email: userEmail || "",
    phone: "",
    location: "",
    linkedIn: "",
    portfolio: "",
    experienceYears: "0",
    expectedSalary: "",
    noticePeriod: "Immediate",
    workMode: "Hybrid",
    relocate: false,
    coverLetter: "",
  });

  const [loading, setLoading] = useState(false);
  const coverLetterCount = useMemo(() => form.coverLetter.length, [form.coverLetter]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submitApplication = async () => {
    if (!form.phone.trim()) {
      alert("Please enter phone number");
      return;
    }

    if (!form.location.trim()) {
      alert("Please enter your location");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/api/jobs/apply", {
        user_id: userId,
        job_id: Number(jobId),
        name: form.name,
        email: form.email,
        phone: form.phone,
        location: form.location,
        linkedIn: form.linkedIn,
        portfolio: form.portfolio,
        experienceYears: Number(form.experienceYears || 0),
        expectedSalary: form.expectedSalary,
        noticePeriod: form.noticePeriod,
        workMode: form.workMode,
        relocate: form.relocate,
        coverLetter: form.coverLetter,
      });

      alert(res.data?.message || "Successfully applied for this job");
      navigate("/user");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.response?.data?.sqlMessage || "Failed to apply. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apply-page">
      <motion.div
        className="apply-shell"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <aside className="apply-info">
          <p className="chip">Application Form</p>
          <h2>Apply for Job #{jobId}</h2>
          <p className="sub-text">
            Share complete details so recruiters can review your profile faster.
          </p>

          <ul className="checklist">
            <li>Profile information</li>
            <li>Contact and work preferences</li>
            <li>Short cover letter</li>
          </ul>
        </aside>

        <section className="apply-card">
          <div className="field-grid">
            <div className="field full">
              <label>Full Name *</label>
              <input name="name" value={form.name} disabled />
            </div>

            <div className="field full">
              <label>Email *</label>
              <input name="email" value={form.email} disabled />
            </div>

            <div className="field">
              <label>Phone *</label>
              <input
                name="phone"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={onChange}
              />
            </div>

            <div className="field">
              <label>Current Location *</label>
              <input
                name="location"
                placeholder="City, State"
                value={form.location}
                onChange={onChange}
              />
            </div>

            <div className="field">
              <label>LinkedIn</label>
              <input
                name="linkedIn"
                placeholder="https://linkedin.com/in/..."
                value={form.linkedIn}
                onChange={onChange}
              />
            </div>

            <div className="field">
              <label>Portfolio / GitHub</label>
              <input
                name="portfolio"
                placeholder="https://github.com/..."
                value={form.portfolio}
                onChange={onChange}
              />
            </div>

            <div className="field">
              <label>Experience</label>
              <select
                name="experienceYears"
                value={form.experienceYears}
                onChange={onChange}
              >
                <option value="0">Fresher</option>
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3+ years</option>
                <option value="5">5+ years</option>
              </select>
            </div>

            <div className="field">
              <label>Expected Salary (LPA)</label>
              <input
                name="expectedSalary"
                placeholder="e.g. 6"
                value={form.expectedSalary}
                onChange={onChange}
              />
            </div>

            <div className="field">
              <label>Notice Period</label>
              <select
                name="noticePeriod"
                value={form.noticePeriod}
                onChange={onChange}
              >
                <option>Immediate</option>
                <option>15 Days</option>
                <option>30 Days</option>
                <option>60 Days</option>
                <option>90 Days</option>
              </select>
            </div>

            <div className="field">
              <label>Preferred Work Mode</label>
              <select name="workMode" value={form.workMode} onChange={onChange}>
                <option>Remote</option>
                <option>Hybrid</option>
                <option>On-site</option>
              </select>
            </div>

            <div className="field full check-row">
              <input
                id="relocate"
                type="checkbox"
                name="relocate"
                checked={form.relocate}
                onChange={onChange}
              />
              <label htmlFor="relocate">Open to relocation</label>
            </div>

            <div className="field full">
              <label>Cover Letter</label>
              <textarea
                name="coverLetter"
                rows="5"
                maxLength={600}
                placeholder="Briefly explain why you are a good fit for this role."
                value={form.coverLetter}
                onChange={onChange}
              />
              <small className="count">{coverLetterCount}/600</small>
            </div>
          </div>

          <motion.button
            className="submit-btn"
            onClick={submitApplication}
            disabled={loading}
            whileHover={{ scale: 1.01 }}
          >
            {loading ? "Submitting..." : "Submit Application"}
          </motion.button>

          <button className="cancel-btn" onClick={() => navigate("/user")}>
            Cancel
          </button>
        </section>
      </motion.div>
    </div>
  );
}

export default ApplyJob;

