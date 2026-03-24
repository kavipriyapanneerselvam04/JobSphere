import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import RecruiterDashboard from "./components/RecruiterDashboard";
import UserDashboard from "./components/UserDashboard";
import ApplyJob from "./components/ApplyJob";
import PostJob from "./components/PostJob";
import UserProfile from "./components/UserProfile";
import EditProfile from "./components/EditProfile";
import UserResume from "./components/UserResume";
import UserLayout from "./components/UserLayout";
import ThemeToggle from "./components/ThemeToggle";
import "./ui/theme.css";

function App() {
  return (
    <BrowserRouter>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<UserLayout />}>
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/apply/:jobId" element={<ApplyJob />} />
          <Route path="/resume" element={<UserResume />} />
          <Route path="/upload-resume" element={<Navigate to="/resume" replace />} />
        </Route>

        <Route path="/recruiter" element={<RecruiterDashboard />} />
        <Route path="/post-job" element={<PostJob />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
