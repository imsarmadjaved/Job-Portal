import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faUser,
  faBuilding,
  faArrowRight,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { register, login } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

function Auth() {
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "job_seeker",
    companyName: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        // Sign Up validation
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }

        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        };

        // Add company name for employers
        if (formData.role === "employer" && formData.companyName) {
          userData.companyName = formData.companyName;
        }

        const response = await register(userData);

        if (response.success) {
          // Use context login to update state immediately
          contextLogin(response.user, response.token);

          // Redirect based on role
          if (response.user.role === "employer") {
            navigate("/employer/dashboard");
          } else {
            navigate("/");
          }
        }
      } else {
        // Sign In
        const response = await login({
          email: formData.email,
          password: formData.password,
        });

        if (response.success) {
          // Use context login to update state immediately
          contextLogin(response.user, response.token);

          // Redirect based on role
          if (response.user.role === "employer") {
            navigate("/employer/dashboard");
          } else if (response.user.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
        }
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "job_seeker",
      companyName: "",
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-secondary-50 to-accent-50 flex items-center justify-center ">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:flex items-center relative min-h-162.5">
          {/* LEFT COLUMN - Login Form */}
          <div className="w-1/2 p-8 lg:p-10 overflow-y-auto">
            <div className="max-w-sm mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-secondary-900 mb-2">
                  Welcome Back
                </h2>
                <p className="text-secondary-500">
                  Sign in to continue your journey
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-secondary-700 font-medium mb-2 text-sm">
                    Email Address
                  </label>
                  <div className="relative group">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors"
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-secondary-700 font-medium mb-2 text-sm">
                    Password
                  </label>
                  <div className="relative group">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors"
                    />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-secondary-600">
                      Remember me
                    </span>
                  </label>
                  <a
                    href="#"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Forgot Password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Sign In"}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN - Signup Form */}
          <div className="w-1/2 p-8 lg:p-10 overflow-y-auto">
            <div className="max-w-sm mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-secondary-900 mb-2">
                  Create Account
                </h2>
                <p className="text-secondary-500">Join our community today</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-secondary-700 font-medium mb-2 text-sm">
                    Full Name
                  </label>
                  <div className="relative group">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors"
                    />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-secondary-700 font-medium mb-2 text-sm">
                    Email Address
                  </label>
                  <div className="relative group">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors"
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-secondary-700 font-medium mb-2 text-sm">
                    Password
                  </label>
                  <div className="relative group">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors"
                    />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      placeholder="Create a password"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-secondary-700 font-medium mb-2 text-sm">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors"
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-secondary-700 font-medium mb-2 text-sm">
                    I am a
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="job_seeker"
                        checked={formData.role === "job_seeker"}
                        onChange={handleChange}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-secondary-700">
                        Job Seeker
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="employer"
                        checked={formData.role === "employer"}
                        onChange={handleChange}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-secondary-700">Employer</span>
                    </label>
                  </div>
                </div>

                {formData.role === "employer" && (
                  <div className="animate-fadeIn">
                    <label className="block text-secondary-700 font-medium mb-2 text-sm">
                      Company Name
                    </label>
                    <div className="relative group">
                      <FontAwesomeIcon
                        icon={faBuilding}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors"
                      />
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                        placeholder="Enter company name"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>
              </form>
            </div>
          </div>

          {/* Sliding Overlay - Message Section */}
          <div
            className={`absolute top-0 w-1/2 h-full bg-gradient-to-br from-primary-600 to-primary-800 transition-all duration-500 ease-in-out shadow-2xl`}
            style={{
              left: isSignUp ? "0%" : "50%",
              transition: "left 0.6s ease-in-out",
            }}
          >
            <div className="w-full h-full p-8 lg:p-10 flex items-center justify-center">
              <div className="text-white max-w-sm mx-auto text-center">
                {isSignUp ? (
                  // Signup Mode - Show Join Us
                  <>
                    <div className="mb-6">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg
                          className="w-10 h-10"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                          />
                        </svg>
                      </div>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                      Join Us Today!
                    </h2>
                    <p className="text-primary-100 text-base lg:text-lg mb-8">
                      Create your account and start your journey towards finding
                      the perfect job or candidate.
                    </p>
                    <div className="space-y-4 mb-8 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <FontAwesomeIcon
                            icon={faArrowRight}
                            className="text-white text-sm"
                          />
                        </div>
                        <p className="text-primary-50 text-sm">
                          Access to 10,000+ jobs
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <FontAwesomeIcon
                            icon={faArrowRight}
                            className="text-white text-sm"
                          />
                        </div>
                        <p className="text-primary-50 text-sm">
                          Connect with top employers
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <FontAwesomeIcon
                            icon={faArrowRight}
                            className="text-white text-sm"
                          />
                        </div>
                        <p className="text-primary-50 text-sm">
                          Free career resources
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleForm}
                      className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-2.5 rounded-xl font-medium hover:bg-primary-50 transition-all duration-200 shadow-lg"
                    >
                      Sign In to Account
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className="text-sm"
                      />
                    </button>
                  </>
                ) : (
                  // Login Mode - Show Welcome Back
                  <>
                    <div className="mb-6">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg
                          className="w-10 h-10"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                      Welcome Back!
                    </h2>
                    <p className="text-primary-100 text-base lg:text-lg mb-8">
                      Sign in to access your dashboard, track applications, and
                      discover new opportunities.
                    </p>
                    <div className="space-y-4 mb-8 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <FontAwesomeIcon
                            icon={faArrowRight}
                            className="text-white text-sm"
                          />
                        </div>
                        <p className="text-primary-50 text-sm">
                          Track your job applications
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <FontAwesomeIcon
                            icon={faArrowRight}
                            className="text-white text-sm"
                          />
                        </div>
                        <p className="text-primary-50 text-sm">
                          Save favorite jobs
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <FontAwesomeIcon
                            icon={faArrowRight}
                            className="text-white text-sm"
                          />
                        </div>
                        <p className="text-primary-50 text-sm">
                          Get personalized job alerts
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleForm}
                      className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-2.5 rounded-xl font-medium hover:bg-primary-50 transition-all duration-200 shadow-lg"
                    >
                      Create New Account
                      <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View - Same as your original, just add error and loading states */}
        <div className="md:hidden">
          {!isSignUp ? (
            // Login Mode Mobile
            <div className="min-h-[600px] flex flex-col">
              {/* Hero Section with Message */}
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Join Us Today!
                </h2>
                <p className="text-primary-100 text-sm mb-4">
                  Create your account and start your journey
                </p>
                <button
                  onClick={toggleForm}
                  className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-2 rounded-lg font-medium hover:bg-primary-50 transition-all duration-200 shadow-lg"
                >
                  Create New Account
                  <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                </button>
              </div>

              {/* Login Form */}
              <div className="flex-1 p-6 bg-white">
                <div className="max-w-sm mx-auto">
                  <h3 className="text-2xl font-bold text-secondary-900 mb-6 text-center">
                    Sign In
                  </h3>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <div className="relative group">
                        <FontAwesomeIcon
                          icon={faEnvelope}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                        />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                          placeholder="Email Address"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="relative group">
                        <FontAwesomeIcon
                          icon={faLock}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                        />
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                          placeholder="Password"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-secondary-600">
                          Remember me
                        </span>
                      </label>
                      <a
                        href="#"
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Forgot Password?
                      </a>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition-all duration-200 font-medium shadow-md disabled:opacity-50"
                    >
                      {loading ? "Loading..." : "Sign In"}
                    </button>
                  </form>

                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-secondary-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-secondary-500">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button className="flex items-center justify-center gap-2 px-4 py-2 border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-all">
                        <FontAwesomeIcon
                          icon={faGoogle}
                          className="text-red-500"
                        />
                        <span className="text-sm text-secondary-700">
                          Google
                        </span>
                      </button>
                      <button className="flex items-center justify-center gap-2 px-4 py-2 border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-all">
                        <FontAwesomeIcon
                          icon={faLinkedin}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-secondary-700">
                          LinkedIn
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Signup Mode Mobile
            <div className="min-h-[600px] flex flex-col">
              {/* Hero Section with Message */}
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Welcome Back!
                </h2>
                <p className="text-primary-100 text-sm mb-4">
                  Sign in to access your dashboard
                </p>
                <button
                  onClick={toggleForm}
                  className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-2 rounded-lg font-medium hover:bg-primary-50 transition-all duration-200 shadow-lg"
                >
                  Sign In to Account
                  <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
                </button>
              </div>

              {/* Signup Form */}
              <div className="flex-1 p-6 bg-white overflow-y-auto">
                <div className="max-w-sm mx-auto">
                  <h3 className="text-2xl font-bold text-secondary-900 mb-6 text-center">
                    Create Account
                  </h3>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <div className="relative group">
                        <FontAwesomeIcon
                          icon={faUser}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                        />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                          placeholder="Full Name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="relative group">
                        <FontAwesomeIcon
                          icon={faEnvelope}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                        />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                          placeholder="Email Address"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="relative group">
                        <FontAwesomeIcon
                          icon={faLock}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                        />
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                          placeholder="Password"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="relative group">
                        <FontAwesomeIcon
                          icon={faLock}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                        />
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                          placeholder="Confirm Password"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-secondary-700 font-medium mb-2 text-sm">
                        I am a
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="role"
                            value="job_seeker"
                            checked={formData.role === "job_seeker"}
                            onChange={handleChange}
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-secondary-700">
                            Job Seeker
                          </span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="role"
                            value="employer"
                            checked={formData.role === "employer"}
                            onChange={handleChange}
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-secondary-700">
                            Employer
                          </span>
                        </label>
                      </div>
                    </div>

                    {formData.role === "employer" && (
                      <div className="animate-fadeIn">
                        <div className="relative group">
                          <FontAwesomeIcon
                            icon={faBuilding}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                          />
                          <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                            placeholder="Company Name"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition-all duration-200 font-medium shadow-md disabled:opacity-50"
                    >
                      {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                  </form>

                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-secondary-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-secondary-500">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button className="flex items-center justify-center gap-2 px-4 py-2 border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-all">
                        <FontAwesomeIcon
                          icon={faGoogle}
                          className="text-red-500"
                        />
                        <span className="text-sm text-secondary-700">
                          Google
                        </span>
                      </button>
                      <button className="flex items-center justify-center gap-2 px-4 py-2 border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-all">
                        <FontAwesomeIcon
                          icon={faLinkedin}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-secondary-700">
                          LinkedIn
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;
