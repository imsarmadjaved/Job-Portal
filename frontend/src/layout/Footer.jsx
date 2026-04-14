import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faTwitter,
  faLinkedin,
  faGithub,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faArrowRight,
  faHeart,
  faBriefcase,
  faBuilding,
  faUserGraduate,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { contact } from "../data/contact";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const contactInfo = contact[0];
  const { user, isLoggedIn } = useAuth();

  // Get role-specific links for the third column
  const getRoleSpecificLinks = () => {
    // Not logged in - show default job seeker links
    if (!isLoggedIn || !user) {
      return [
        { to: "/auth", label: "Create Account", icon: faUserGraduate },
        { to: "/auth", label: "Upload Resume", icon: faBriefcase },
        { to: "/jobs", label: "Browse Jobs", icon: faBriefcase },
        { to: "/companies", label: "Top Companies", icon: faBuilding },
      ];
    }

    // Logged in - show role-specific links
    switch (user.role) {
      case "job_seeker":
        return [
          {
            to: "/dashboard/profile",
            label: "My Profile",
            icon: faUserGraduate,
          },
          { to: "/dashboard/saved-jobs", label: "Saved Jobs", icon: faHeart },
          {
            to: "/dashboard",
            label: "My Applications",
            icon: faBriefcase,
          },
          { to: "/jobs", label: "Browse Jobs", icon: faBriefcase },
        ];
      case "employer":
        return [
          {
            to: "/employer/dashboard",
            label: "Employer Dashboard",
            icon: faBuilding,
          },
          {
            to: "/employer/company",
            label: "Company Profile",
            icon: faBuilding,
          },
          { to: "/employer/post-job", label: "Post a Job", icon: faBriefcase },
          { to: "/employer/jobs", label: "Manage Jobs", icon: faBriefcase },
        ];
      case "admin":
        return [
          {
            to: "/admin/dashboard",
            label: "Admin Dashboard",
            icon: faUserGraduate,
          },
          { to: "/admin/users", label: "Manage Users", icon: faUserGraduate },
          { to: "/admin/jobs", label: "Manage Jobs", icon: faBriefcase },
          {
            to: "/admin/companies",
            label: "Manage Companies",
            icon: faBuilding,
          },
        ];
      default:
        return [
          { to: "/auth", label: "Create Account", icon: faUserGraduate },
          { to: "/jobs", label: "Browse Jobs", icon: faBriefcase },
          { to: "/companies", label: "Top Companies", icon: faBuilding },
        ];
    }
  };

  // Get section title based on user role
  const getSectionTitle = () => {
    if (!isLoggedIn || !user) return "For Job Seekers";

    switch (user.role) {
      case "job_seeker":
        return "Job Seeker Tools";
      case "employer":
        return "Employer Tools";
      case "admin":
        return "Admin Tools";
      default:
        return "Quick Tools";
    }
  };

  const roleSpecificLinks = getRoleSpecificLinks();
  const sectionTitle = getSectionTitle();

  return (
    <footer className="bg-secondary-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info Section */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent">
                JobPortal
              </h3>
            </Link>
            <p className="text-secondary-300 text-sm leading-relaxed">
              Connecting talented professionals with amazing opportunities. Find
              your dream job or hire the best talent.
            </p>
            <div className="flex space-x-3 pt-2">
              <a
                href={contactInfo.Linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-secondary-800 rounded-lg flex items-center justify-center text-secondary-400 hover:text-primary-400 hover:bg-secondary-700 transition-all duration-200"
                aria-label="LinkedIn"
              >
                <FontAwesomeIcon icon={faLinkedin} className="h-4 w-4" />
              </a>
              <a
                href={contactInfo.Github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-secondary-800 rounded-lg flex items-center justify-center text-secondary-400 hover:text-primary-400 hover:bg-secondary-700 transition-all duration-200"
                aria-label="GitHub"
              >
                <FontAwesomeIcon icon={faGithub} className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white relative inline-block">
              Quick Links
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-primary-500 rounded-full"></span>
            </h4>
            <ul className="space-y-2.5">
              {[
                { to: "/", label: "Home" },
                { to: "/jobs", label: "Browse Jobs" },
                { to: "/companies", label: "Companies" },
                { to: "/about", label: "About Us" },
                { to: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-secondary-300 hover:text-primary-400 transition-all duration-200 text-sm flex items-center gap-2 group"
                  >
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="text-[10px] text-secondary-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Role-Specific Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white relative inline-block">
              {sectionTitle}
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-primary-500 rounded-full"></span>
            </h4>
            <ul className="space-y-2.5">
              {roleSpecificLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-secondary-300 hover:text-primary-400 transition-all duration-200 text-sm flex items-center gap-2 group"
                  >
                    <FontAwesomeIcon
                      icon={link.icon || faArrowRight}
                      className="text-[10px] text-secondary-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Show login prompt if not logged in */}
            {!isLoggedIn && (
              <div className="mt-4 pt-4 border-t border-secondary-800">
                <p className="text-xs text-secondary-400 mb-2">
                  Already have an account?
                </p>
                <Link
                  to="/auth"
                  className="text-primary-400 hover:text-primary-300 text-sm font-medium"
                >
                  Sign In →
                </Link>
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white relative inline-block">
              Contact Info
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-primary-500 rounded-full"></span>
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-secondary-800 rounded-lg flex items-center justify-center shrink-0">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="h-4 w-4 text-primary-400"
                  />
                </div>
                <span className="text-secondary-300 text-sm leading-relaxed">
                  {contactInfo.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary-800 rounded-lg flex items-center justify-center shrink-0">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="h-4 w-4 text-primary-400"
                  />
                </div>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-secondary-300 hover:text-primary-400 text-sm transition-colors duration-200"
                >
                  {contactInfo.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary-800 rounded-lg flex items-center justify-center shrink-0">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="h-4 w-4 text-primary-400"
                  />
                </div>
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="text-secondary-300 hover:text-primary-400 text-sm transition-colors duration-200"
                >
                  {contactInfo.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section - Only show for job seekers or not logged in
        {(!isLoggedIn || user?.role === "job_seeker") && (
          <div className="mt-12 p-6 bg-secondary-800/50 rounded-2xl border border-secondary-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">
                  Get Job Alerts
                </h4>
                <p className="text-secondary-400 text-sm">
                  Subscribe to our newsletter and never miss an opportunity
                </p>
              </div>
              <div className="flex w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 md:w-64 px-4 py-2.5 bg-secondary-700 border border-secondary-600 rounded-l-xl focus:outline-none focus:border-primary-500 text-white text-sm placeholder:text-secondary-400"
                />
                <button className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-r-xl font-medium transition-all text-sm">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        )} */}

        {/* Bottom Bar */}
        <div className="border-t border-secondary-800 mt-10 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-secondary-400 text-sm flex items-center gap-1">
              © {currentYear} JobPortal. Made with
              <FontAwesomeIcon
                icon={faHeart}
                className="h-3 w-3 text-red-500 mx-0.5"
              />
              for job seekers
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link
                to="#"
                className="text-secondary-400 hover:text-primary-400 text-sm transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                to="#"
                className="text-secondary-400 hover:text-primary-400 text-sm transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
