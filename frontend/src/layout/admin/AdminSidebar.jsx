import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDashboard,
  faUsers,
  faBriefcase,
  faBuilding,
  faFileAlt,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";

function AdminSidebar({ collapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { path: "/admin/dashboard", icon: faDashboard, label: "Dashboard" },
    { path: "/admin/users", icon: faUsers, label: "Users" },
    { path: "/admin/jobs", icon: faBriefcase, label: "Jobs" },
    { path: "/admin/companies", icon: faBuilding, label: "Companies" },
    { path: "/admin/applications", icon: faFileAlt, label: "Applications" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => {
    if (path === "/admin/dashboard" && location.pathname === "/admin") {
      return true;
    }
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <aside className="h-full bg-secondary-900 text-white flex flex-col">
      {/* Logo Section */}
      <div
        className={`py-6 ${collapsed ? "px-2" : "px-5"} border-b border-secondary-800`}
      >
        <Link to="/admin/dashboard" className="block">
          {collapsed ? (
            <div className="w-10 h-10 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
          ) : (
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          )}
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className={`space-y-1 ${collapsed ? "px-2" : "px-3"}`}>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 py-3 rounded-lg transition-all duration-200 ${
                  collapsed ? "justify-center px-2" : "px-4"
                } ${
                  isActive(item.path)
                    ? "bg-primary-600 text-white"
                    : "text-secondary-300 hover:bg-secondary-800 hover:text-white"
                }`}
                title={collapsed ? item.label : ""}
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className="w-5 h-5 flex-shrink-0"
                />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div
        className={`py-4 border-t border-secondary-800 ${collapsed ? "px-2" : "px-3"}`}
      >
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full py-3 rounded-lg transition-all duration-200 text-secondary-300 hover:bg-secondary-800 hover:text-white ${
            collapsed ? "justify-center px-2" : "px-4"
          }`}
          title={collapsed ? "Sign Out" : ""}
        >
          <FontAwesomeIcon
            icon={faSignOutAlt}
            className="w-5 h-5 flex-shrink-0"
          />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
