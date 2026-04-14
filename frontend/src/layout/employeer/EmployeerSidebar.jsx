import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDashboard,
  faBriefcase,
  faPlusCircle,
  faBuilding,
  faChartLine,
  faSignOutAlt,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";

function EmployerSidebar({ collapsed, onMobileClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { path: "/employer/dashboard", icon: faDashboard, label: "Dashboard" },
    { path: "/employer/analytics", icon: faChartLine, label: "Analytics" },
    { path: "/employer/jobs", icon: faBriefcase, label: "My Jobs" },
    { path: "/employer/post-job", icon: faPlusCircle, label: "Post a Job" },
    { path: "/employer/company", icon: faBuilding, label: "Company Profile" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
    if (onMobileClose) onMobileClose();
  };

  const isActive = (path) => {
    if (path === "/employer/dashboard" && location.pathname === "/employer") {
      return true;
    }
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const handleLinkClick = () => {
    if (onMobileClose) onMobileClose();
  };

  return (
    <aside className="h-full bg-secondary-900 text-white flex flex-col">
      {/* Mobile Close Button */}
      {onMobileClose && (
        <div className="flex justify-end p-4 lg:hidden">
          <button
            onClick={onMobileClose}
            className="text-secondary-400 hover:text-white p-2 rounded-lg hover:bg-secondary-800 transition-all"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>
      )}

      {/* Logo Section */}
      <div
        className={`py-6 ${collapsed ? "px-2" : "px-5"} border-b border-secondary-800`}
      >
        <Link
          to="/employer/dashboard"
          className="block"
          onClick={handleLinkClick}
        >
          {collapsed ? (
            <div className="w-10 h-10 mx-auto bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
          ) : (
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent">
              Employer Portal
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
                onClick={handleLinkClick}
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

export default EmployerSidebar;
