import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faSearch,
  faBriefcase,
  faArrowLeft,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 Number */}
        <div className="relative mb-8">
          <div className="text-8xl md:text-9xl font-bold text-primary-600 opacity-20 animate-pulse">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-6xl md:text-7xl text-primary-500 animate-bounce"
            />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-secondary-600 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link
            to="/"
            className="group flex items-center justify-center gap-2 px-6 py-3 bg-white border border-secondary-200 rounded-xl hover:border-primary-500 hover:shadow-md transition-all duration-300"
          >
            <FontAwesomeIcon
              icon={faHome}
              className="text-primary-500 group-hover:scale-110 transition-transform"
            />
            <span className="font-medium text-secondary-700">Home</span>
          </Link>
          <Link
            to="/jobs"
            className="group flex items-center justify-center gap-2 px-6 py-3 bg-white border border-secondary-200 rounded-xl hover:border-primary-500 hover:shadow-md transition-all duration-300"
          >
            <FontAwesomeIcon
              icon={faSearch}
              className="text-primary-500 group-hover:scale-110 transition-transform"
            />
            <span className="font-medium text-secondary-700">Browse Jobs</span>
          </Link>
          <Link
            to="/companies"
            className="group flex items-center justify-center gap-2 px-6 py-3 bg-white border border-secondary-200 rounded-xl hover:border-primary-500 hover:shadow-md transition-all duration-300"
          >
            <FontAwesomeIcon
              icon={faBriefcase}
              className="text-primary-500 group-hover:scale-110 transition-transform"
            />
            <span className="font-medium text-secondary-700">Companies</span>
          </Link>
        </div>

        {/* Go Back Button */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Go Back
        </button>

        {/* Decorative Elements */}
        <div className="mt-12 pt-8 border-t border-secondary-200">
          <p className="text-sm text-secondary-400">
            Need help?{" "}
            <Link
              to="/contact"
              className="text-primary-600 hover:text-primary-700"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
