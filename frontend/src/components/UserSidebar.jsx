import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import "../ui/sidebar.css";

function UserSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const isActive = (paths) =>
    paths.some((path) =>
      path === "/apply" ? location.pathname.startsWith("/apply/") : location.pathname === path
    );

  return (
    <motion.aside
      className="sidebar"
      initial={{ x: -70, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="sidebar-header">
        <div className="avatar">JS</div>
        <div>
          <h3>Hi Applicant!</h3>
          <p className="sidebar-subtitle">Keep your profile fresh</p>
        </div>
      </div>

      <div className="sidebar-menu">
        <button className={isActive(["/user", "/apply"]) ? "active" : ""} onClick={() => navigate("/user")}>
          <span className="sidebar-icon">Jobs</span>
        </button>

        <button
          className={isActive(["/profile", "/edit-profile"]) ? "active" : ""}
          onClick={() => navigate("/profile")}
        >
          <span className="sidebar-icon">Profile</span>
        </button>

        <button className={isActive(["/resume"]) ? "active" : ""} onClick={() => navigate("/resume")}>
          <span className="sidebar-icon">Resume</span>
        </button>
      </div>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </motion.aside>
  );
}

export default UserSidebar;
