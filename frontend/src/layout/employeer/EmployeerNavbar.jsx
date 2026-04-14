import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faUser,
  faEnvelope,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";

function EmployerNavbar({
  toggleDesktopSidebar,
  toggleMobileSidebar,
  sidebarCollapsed,
  isMobile,
}) {
  // ✅ Add useAuth back
  const { user, companyRefreshTrigger } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [company, setCompany] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Add useEffect to fetch company
  useEffect(() => {
    fetchCompanyInfo();
  }, [companyRefreshTrigger]);

  const fetchCompanyInfo = async () => {
    try {
      const { getMyCompany } = await import("../../services/companyService");
      const response = await getMyCompany();
      if (response.success && response.company) {
        setCompany(response.company);
      }
    } catch (error) {
      console.log("Company not found or error fetching");
    }
  };

  const handleToggle = () => {
    if (isMobile) {
      toggleMobileSidebar();
    } else {
      toggleDesktopSidebar();
    }
  };

  // ✅ Remove handleSwitchToPublic since it's not needed

  return (
    <header className="bg-white border-b border-secondary-200 px-4 lg:px-6 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Menu Toggle Button */}
          <button
            onClick={handleToggle}
            className="text-secondary-600 hover:text-primary-600 p-2 rounded-lg hover:bg-secondary-100 transition-all lg:hidden"
            aria-label="Toggle Sidebar"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
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
            <p className="text-xs text-secondary-500">Employer Portal</p>
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
          {/* Company Badge */}
          {company?.name && (
            <div className="hidden md:flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
              <FontAwesomeIcon
                icon={faBuilding}
                className="text-purple-500 text-xs"
              />
              <span className="text-xs font-medium text-purple-600 truncate max-w-[120px]">
                {company.name}
              </span>
            </div>
          )}

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-secondary-50 transition-all"
            >
              {/* Company Logo / Avatar */}
              {company?.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-8 h-8 lg:w-9 lg:h-9 rounded-full object-cover border-2 border-purple-200 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-sm ring-2 ring-purple-100">
                  <FontAwesomeIcon
                    icon={faBuilding}
                    className="text-white text-xs lg:text-sm"
                  />
                </div>
              )}

              {/* Company Name - Hidden on mobile */}
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-secondary-900 leading-tight truncate max-w-[120px]">
                  {company?.name || user?.companyName || "Company"}
                </p>
                <p className="text-xs text-secondary-500">Employer</p>
              </div>

              <FontAwesomeIcon
                icon={faChevronDown}
                className={`hidden lg:block text-secondary-400 text-xs transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-secondary-200 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-secondary-50 border-b border-secondary-100">
                  <div className="flex items-center gap-3">
                    {company?.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-sm">
                        <FontAwesomeIcon
                          icon={faBuilding}
                          className="text-white"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-secondary-900 truncate">
                        {company?.name || user?.companyName || "Company"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <FontAwesomeIcon
                          icon={faUser}
                          className="text-secondary-400 text-xs"
                        />
                        <p className="text-xs text-secondary-500 truncate">
                          {user?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <FontAwesomeIcon
                          icon={faEnvelope}
                          className="text-secondary-400 text-xs"
                        />
                        <p className="text-xs text-secondary-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Switch to Public View */}
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-primary-600 hover:bg-primary-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FontAwesomeIcon icon={faGlobe} className="w-4 h-4" />
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

export default EmployerNavbar;
