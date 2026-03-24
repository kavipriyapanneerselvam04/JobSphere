import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../ui/auth.css";
import logo from "../assets/jobsphere-logo.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    if (!email.trim()) {
      alert("Enter your email");
      return;
    }

    try {
      setSending(true);
      const res = await api.post("/api/users/forgot-password", { email: email.trim() });
      alert(res.data?.message || "Reset link sent");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setSending(false);
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
          <p>Reset your password and get back into your account</p>
        </header>

        <div className="auth-container">
          <h2>Forgot Password</h2>
          <p className="auth-subtitle">Enter your email and we will send you a reset link.</p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="auth-btn-group">
            <button onClick={submit} disabled={sending}>
              {sending ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;
