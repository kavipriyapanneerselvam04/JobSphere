import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../ui/auth.css";
import GoogleSignInButton from "./GoogleSignInButton";
// import logo from "../logo.svg";
import logo from "../assets/jobsphere-logo.png";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    try {
      const res = await api.post("/api/users/login", {
        email,
        password,
      });

      const { id, name, email: userEmail, role } = res.data.user;
      const token = res.data.token;

      localStorage.setItem("userId", id);
      localStorage.setItem("userName", name);
      localStorage.setItem("userEmail", userEmail);
      localStorage.setItem("role", role);
      if (token) localStorage.setItem("authToken", token);

      if (role === "ADMIN") navigate("/admin");
      else if (role === "RECRUITER") navigate("/recruiter");
      else navigate("/user");
    } catch (err) {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-backdrop-shape auth-backdrop-shape--one" />
      <div className="auth-backdrop-shape auth-backdrop-shape--two" />

      <div className="auth-shell">
        <header className="auth-hero">
          <div className="auth-logo-ring">
            <img src={logo} alt="JobSphere Logo" className="auth-logo-img" />
          </div>
          <h1>JobSphere</h1>
          <p>Smart Resume and Job Matching Platform</p>
        </header>

        <div className="auth-container">
          <h2>Login</h2>
          <p className="auth-subtitle">Welcome back. Continue your job journey.</p>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button onClick={handleLogin}>Login</button>
          <div className="auth-link-row">
            <button type="button" className="inline-link-btn" onClick={() => navigate("/forgot-password")}>
              Forgot password?
            </button>
          </div>

          <div className="auth-divider"><span>or</span></div>
          <GoogleSignInButton role="USER" />

          <p>
            New user? <a href="/register">Register here</a>
          </p>
        </div>
      </div>

      <footer className="auth-footer">
        <span>� {new Date().getFullYear()} JobSphere</span>
        <span>Built for students and recruiters</span>
      </footer>
    </div>
  );
}

export default Login;
