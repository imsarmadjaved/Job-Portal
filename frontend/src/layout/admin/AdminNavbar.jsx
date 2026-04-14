import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faShieldAlt,
  faGlobe,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";

function AdminNavbar({
  toggleDesktopSidebar,
  toggleMobileSidebar,
  sidebarCollapsed,
  isMobile,
}) {
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (isMobile) {
      toggleMobileSidebar();
    } else {
      toggleDesktopSidebar();
    }
  };

  return (
    <header className="bg-white border-b border-secondary-200 px-4 lg:px-6 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Menu Toggle Button */}
          <button
            onClick={handleToggle}
            className="text-secondary-600 hover:text-primary-600 p-2 rounded-lg hover:bg-secondary-100 transition-all"
            aria-label="Toggle Sidebar"
          >
            <FontAwesomeIcon icon={faBars} className="text-lg" />
          </button>

          {/* Desktop Collapse/Expand Button */}
          {!isMobile && (
            <button
              onClick={toggleDesktopSidebar}
              className="hidden lg:flex items-center text-secondary-500 hover:text-primary-600 p-2 rounded-lg hover:bg-secondary-100 transition-all"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <FontAwesomeIcon
                icon={sidebarCollapsed ? faChevronRight : faChevronLeft}
                className="text-sm"
              />
            </button>
          )}

          {/* Welcome Text */}
          <div className="hidden sm:block">
            <h2 className="text-base lg:text-lg font-semibold text-secondary-800">
              Welcome back,{" "}
              <span className="text-primary-600">
                {user?.name?.split(" ")[0]}
              </span>
            </h2>
            <p className="text-xs text-secondary-500">Administrator Portal</p>
          </div>

          {/* Mobile Welcome Text */}
          <div className="sm:hidden">
            <h2 className="text-sm font-semibold text-secondary-800">
              <span className="text-primary-600">
                {user?.name?.split(" ")[0]}
              </span>
            </h2>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Admin Badge */}
          <div className="hidden md:flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
            <FontAwesomeIcon
              icon={faShieldAlt}
              className="text-red-500 text-xs"
            />
            <span className="text-xs font-medium text-red-600">Admin</span>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-secondary-50 transition-all"
            >
              {/* Avatar */}
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-8 h-8 lg:w-9 lg:h-9 rounded-full object-cover border-2 border-red-200 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-sm ring-2 ring-red-100">
                  <FontAwesomeIcon
                    icon={faShieldAlt}
                    className="text-white text-xs lg:text-sm"
                  />
                </div>
              )}

              {/* Name - Hidden on mobile */}
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-secondary-900 leading-tight">
                  {user?.name?.split(" ")[0]}
                </p>
                <p className="text-xs text-secondary-500">Admin</p>
              </div>

              <FontAwesomeIcon
                icon={faChevronDown}
                className={`hidden lg:block text-secondary-400 text-xs transition-transform duration-200 ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-secondary-200 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-secondary-50 border-b border-secondary-100">
                  <div className="flex items-center gap-3">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-sm">
                        <FontAwesomeIcon
                          icon={faShieldAlt}
                          className="text-white"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-secondary-900 truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-secondary-500 truncate">
                        {user?.email}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                        Administrator
                      </span>
                    </div>
                  </div>
                </div>

                {/* Switch to Public View */}
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <FontAwesomeIcon
                    icon={faGlobe}
                    className="w-4 h-4 text-primary-500"
                  />
                  <span>Switch to Public View</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;
