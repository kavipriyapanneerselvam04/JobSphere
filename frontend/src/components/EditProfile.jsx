import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../ui/profile.css";

function EditProfile() {
  const userId = Number(localStorage.getItem("userId"));
  const navigate = useNavigate();

  const [form, setForm] = useState({
    dob: "",
    father_name: "",
    phone: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;

    api
      .get(`/api/users/profile/${userId}`)
      .then((res) => {
        const p = res.data || {};
        const dob = p.dob ? String(p.dob).slice(0, 10) : "";
        setForm({
          dob,
          father_name: p.father_name || "",
          phone: p.phone || "",
          address: p.address || "",
        });
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load profile");
      });
  }, [userId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    try {
      setSaving(true);

      await api.put(`/api/users/profile/${userId}`, {
        dob: form.dob || null,
        father_name: form.father_name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      });

      alert("Profile updated successfully");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card edit-profile-card">
        <div className="edit-head">
          <span className="edit-chip">Profile Settings</span>
          <h2>Edit Profile</h2>
          <p className="edit-subtitle">Keep your details updated so your profile looks strong and complete.</p>
        </div>

        <div className="edit-grid">
          <div className="profile-section">
            <label>Date of Birth</label>
            <input type="date" name="dob" value={form.dob} onChange={onChange} />
            <p className="help-text">Use your official date of birth from certificates.</p>
          </div>

          <div className="profile-section">
            <label>Father Name</label>
            <input
              type="text"
              name="father_name"
              value={form.father_name}
              onChange={onChange}
              placeholder="Enter father name"
            />
          </div>

          <div className="profile-section">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="Enter phone number"
            />
            <p className="help-text">Add a reachable number for recruiter calls.</p>
          </div>

          <div className="profile-section full">
            <label>Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={onChange}
              rows={3}
              placeholder="Enter address"
            />
          </div>
        </div>

        <div className="edit-actions">
          <button className="primary-btn" onClick={saveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button className="secondary-btn" onClick={() => navigate("/profile")}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
