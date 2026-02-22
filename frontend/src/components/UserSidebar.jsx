import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import "../ui/sidebar.css";

function UserSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

//   const logout = () => {
//   localStorage.clear();

//   // Force hard redirect (kills React state)
//   window.location.href = "/";
// };
const logout = () => {
  localStorage.clear();
  navigate("/", { replace: true });
};

  return (
    <motion.aside
      className="sidebar"
      initial={{ x: -70, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="sidebar-header">
        <div className="avatar">👤</div>
        <h3>Hi Applicant!</h3>
      </div>

      {/* Menu */}
      <div className="sidebar-menu">
        <button
          className={location.pathname === "/user" ? "active" : ""}
          onClick={() => navigate("/user")}
        >
          💼 <span>Jobs</span>
        </button>

        <button
          className={location.pathname === "/profile" ? "active" : ""}
          onClick={() => navigate("/profile")}
        >
          👤 <span>Profile</span>
        </button>
      </div>

      {/* Logout */}
      <button className="logout-btn" onClick={logout}>
        🚪 Logout
      </button>
    </motion.aside>
  );
}

export default UserSidebar;
