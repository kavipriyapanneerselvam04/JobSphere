import { Outlet } from "react-router-dom";
import UserSidebar from "./UserSidebar";
import "../ui/user-layout.css";

function UserLayout() {
  return (
    <div className="user-layout">
      <UserSidebar />
      <main className="user-layout-content">
        <Outlet />
      </main>
    </div>
  );
}

export default UserLayout;
