import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faBars,
  faTimes,
  faUserCircle,
  faSignOutAlt,
  faDashboard,
  faBriefcase,
  faBuilding,
  faHeart,
  faUser,
  faCog,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsProfileOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return "/auth";
    if (user.role === "employer") return "/employer/dashboard";
    if (user.role === "admin") return "/admin/dashboard";
    return "/dashboard";
  };

  const getDashboardName = () => {
    if (!user) return "Dashboard";
    if (user.role === "employer") return "Employer Portal";
    if (user.role === "admin") return "Admin Panel";
    return "My Dashboard";
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <Link to="/" className="shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                JobPortal
              </h1>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className="px-4 py-2 text-secondary-600 hover:text-primary-600 font-medium transition-colors duration-200 rounded-lg hover:bg-secondary-50"
              >
                Home
              </Link>
              <Link
                to="/jobs"
                className="px-4 py-2 text-secondary-600 hover:text-primary-600 font-medium transition-colors duration-200 rounded-lg hover:bg-secondary-50"
              >
                Find Jobs
              </Link>
              <Link
                to="/companies"
                className="px-4 py-2 text-secondary-600 hover:text-primary-600 font-medium transition-colors duration-200 rounded-lg hover:bg-secondary-50"
              >
                Companies
              </Link>
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Desktop Search Bar */}
              <div className="hidden md:block">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search jobs..."
                      className="w-64 lg:w-72 pl-10 pr-4 py-2 border border-secondary-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-secondary-50 transition-all"
                    />
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                    />
                  </div>
                </form>
              </div>

              {/* Mobile Search Button */}
              <button
                onClick={toggleSearch}
                className="md:hidden p-2.5 rounded-xl text-secondary-600 hover:bg-secondary-100 transition-all"
              >
                <FontAwesomeIcon icon={faSearch} className="h-5 w-5" />
              </button>

              {/* Auth Section */}
              {isLoggedIn && user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-secondary-50 transition-all"
                  >
                    {/* Profile Image */}
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-primary-100"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-sm ring-2 ring-primary-100">
                        <span className="text-white text-sm font-semibold">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                    )}

                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-secondary-900 leading-tight">
                        {user.name?.split(" ")[0]}
                      </p>
                      <p className="text-xs text-secondary-500 capitalize">
                        {user.role === "job_seeker" ? "Job Seeker" : user.role}
                      </p>
                    </div>

                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`hidden sm:block text-secondary-400 text-xs transition-transform duration-200 ${
                        isProfileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-secondary-200 py-2 z-50 overflow-hidden">
                      {/* User Info Header */}
                      <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-secondary-100">
                        <div className="flex items-center gap-3">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-sm">
                              <span className="text-white text-lg font-semibold">
                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-secondary-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-secondary-500 truncate">
                              {user.email}
                            </p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full capitalize">
                              {user.role === "job_seeker"
                                ? "Job Seeker"
                                : user.role}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Dashboard Link */}
                      <Link
                        to={getDashboardLink()}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                      >
                        <FontAwesomeIcon
                          icon={faDashboard}
                          className="w-4 h-4 text-primary-500"
                        />
                        <span className="flex-1">{getDashboardName()}</span>
                      </Link>
                      {/* Job Seeker Links */}
                      {user.role === "job_seeker" && (
                        <>
                          <Link
                            to="/dashboard/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                          >
                            <FontAwesomeIcon
                              icon={faUser}
                              className="w-4 h-4 text-primary-500"
                            />
                            <span>My Profile</span>
                          </Link>

                          <Link
                            to="/dashboard/saved-jobs"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                          >
                            <FontAwesomeIcon
                              icon={faHeart}
                              className="w-4 h-4 text-primary-500"
                            />
                            <span>Saved Jobs</span>
                          </Link>
                        </>
                      )}
                      {/* Employer Links */}
                      {user.role === "employer" && (
                        <>
                          <Link
                            to="/employer/company"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                          >
                            <FontAwesomeIcon
                              icon={faBuilding}
                              className="w-4 h-4 text-primary-500"
                            />
                            <span>Company Profile</span>
                          </Link>
                          <Link
                            to="/employer/jobs"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                          >
                            <FontAwesomeIcon
                              icon={faBriefcase}
                              className="w-4 h-4 text-primary-500"
                            />
                            <span>Manage Jobs</span>
                          </Link>
                          <Link
                            to="/employer/post-job"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                          >
                            <FontAwesomeIcon
                              icon={faBuilding}
                              className="w-4 h-4 text-primary-500"
                            />
                            <span>Post a Job</span>
                          </Link>
                        </>
                      )}
                      {/* Admin Links
                      {user.role === "admin" && (
                        <Link
                          to="/admin/settings"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                        >
                          <FontAwesomeIcon
                            icon={faCog}
                            className="w-4 h-4 text-primary-500"
                          />
                          <span>Settings</span>
                        </Link>
                      )} */}
                      {/* Divider */}
                      <div className="border-t border-secondary-100 my-1"></div>
                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FontAwesomeIcon
                          icon={faSignOutAlt}
                          className="w-4 h-4"
                        />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Not Logged In
                <div className="flex items-center gap-2">
                  <Link
                    to="/auth"
                    className="hidden sm:block px-4 py-2 text-secondary-600 hover:text-primary-600 font-medium transition-colors duration-200"
                  >
                    Login
                  </Link>

                  <Link
                    to="/auth"
                    className="bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
                  >
                    Post Job
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2.5 rounded-xl text-secondary-600 hover:bg-secondary-100 transition-all"
              >
                <FontAwesomeIcon
                  icon={isMobileMenuOpen ? faTimes : faBars}
                  className="h-5 w-5"
                />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="md:hidden bg-white border-b border-secondary-200 px-4 py-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs..."
                className="w-full pl-10 pr-4 py-2.5 border border-secondary-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-secondary-50"
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
              />
            </div>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-secondary-200 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            <Link
              to="/"
              className="block px-4 py-3 text-secondary-600 hover:text-primary-600 font-medium transition-colors duration-200 rounded-lg hover:bg-secondary-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/jobs"
              className="block px-4 py-3 text-secondary-600 hover:text-primary-600 font-medium transition-colors duration-200 rounded-lg hover:bg-secondary-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Find Jobs
            </Link>
            <Link
              to="/companies"
              className="block px-4 py-3 text-secondary-600 hover:text-primary-600 font-medium transition-colors duration-200 rounded-lg hover:bg-secondary-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Companies
            </Link>

            {/* Mobile Auth Section */}
            <div className="pt-3 mt-2 border-t border-secondary-200 space-y-2">
              {isLoggedIn && user ? (
                <>
                  <div className="flex items-center gap-3 px-2 py-2">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white text-lg font-semibold">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-secondary-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-secondary-500">{user.email}</p>
                    </div>
                  </div>

                  <Link
                    to={getDashboardLink()}
                    className="block w-full px-4 py-3 text-center bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {getDashboardName()}
                  </Link>

                  {user.role === "job_seeker" && (
                    <>
                      <Link
                        to="/dashboard/profile"
                        className="block w-full px-4 py-3 text-center text-secondary-600 border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-colors font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/dashboard/saved-jobs"
                        className="block w-full px-4 py-3 text-center text-secondary-600 border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-colors font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Saved Jobs
                      </Link>
                    </>
                  )}

                  {user.role === "employer" && (
                    <Link
                      to="/employer/company"
                      className="block w-full px-4 py-3 text-center text-secondary-600 border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-colors font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Company Profile
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-center text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="block w-full px-4 py-3 text-center text-secondary-600 border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth?mode=register"
                    className="block w-full px-4 py-3 text-center bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
