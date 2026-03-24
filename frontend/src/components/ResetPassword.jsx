import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import "../ui/auth.css";
import logo from "../assets/jobsphere-logo.png";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!password || !confirmPassword) {
      alert("Enter and confirm your new password");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setSaving(true);
      const res = await api.post("/api/users/reset-password", { email, token, password });
      alert(res.data?.message || "Password reset successful");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reset password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <header className="auth-hero">
          <div className="auth-logo-ring">
            <img src={logo} alt="JobSphere Logo" className="auth-logo-img" />
          </div>
          <h1>JobSphere</h1>
          <p>Choose a new password for your account</p>
        </header>

        <div className="auth-container">
          <h2>Reset Password</h2>
          <p className="auth-subtitle">Set a new password for {email || "your account"}.</p>
          <div className="password-field">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="password-field">
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="auth-btn-group">
            <button onClick={submit} disabled={saving}>
              {saving ? "Saving..." : "Reset Password"}
            </button>
            <button className="secondary-auth-btn" onClick={() => navigate("/")}>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
