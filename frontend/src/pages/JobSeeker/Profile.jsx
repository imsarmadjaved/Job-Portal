import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faBriefcase,
  faGraduationCap,
  faPlus,
  faTrash,
  faSave,
  faArrowLeft,
  faCheckCircle,
  faUpload,
  faFileAlt,
  faMapMarkerAlt,
  faPhone,
  faCode,
  faCamera,
  faTimes,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import {
  updateUserProfile,
  uploadProfileImage,
  uploadResume,
  deleteResumeFile,
} from "../../services/authService";

function JobSeekerProfile() {
  const navigate = useNavigate();
  const { user, updateUser, isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Protect route - only job_seeker can access
  if (!isLoggedIn) return <Navigate to="/auth" replace />;
  if (user?.role !== "job_seeker") return <Navigate to="/" replace />;

  // Profile Image states
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  // Resume states
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const [removeResumeRequested, setRemoveResumeRequested] = useState(false);

  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  // Profile Data
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    headline: "",
    bio: "",
  });

  // Skills
  const [skills, setSkills] = useState([""]);

  // Experience
  const [experience, setExperience] = useState([
    {
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  ]);

  // Education
  const [education, setEducation] = useState([
    {
      degree: "",
      institution: "",
      field: "",
      startYear: "",
      endYear: "",
      current: false,
    },
  ]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        headline: user.headline || "",
        bio: user.bio || "",
      });
      setSkills(user.skills?.length ? user.skills : [""]);
      setExperience(
        user.experience?.length
          ? user.experience
          : [
              {
                title: "",
                company: "",
                location: "",
                startDate: "",
                endDate: "",
                current: false,
                description: "",
              },
            ],
      );
      setEducation(
        user.education?.length
          ? user.education
          : [
              {
                degree: "",
                institution: "",
                field: "",
                startYear: "",
                endYear: "",
                current: false,
              },
            ],
      );
      setResumeName(
        user.resumeFileName || (user.resume ? "Resume uploaded" : ""),
      );
      setProfileImagePreview(user.profileImage || null);
    }
    setFetching(false);
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  const addSkill = () => setSkills([...skills, ""]);

  const removeSkill = (index) => {
    const newSkills = [...skills];
    newSkills.splice(index, 1);
    setSkills(newSkills);
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...experience];
    newExperience[index][field] = value;
    setExperience(newExperience);
  };

  const addExperience = () => {
    setExperience([
      ...experience,
      {
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ]);
  };

  const removeExperience = (index) => {
    const newExperience = [...experience];
    newExperience.splice(index, 1);
    setExperience(newExperience);
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...education];
    newEducation[index][field] = value;
    setEducation(newEducation);
  };

  const addEducation = () => {
    setEducation([
      ...education,
      {
        degree: "",
        institution: "",
        field: "",
        startYear: "",
        endYear: "",
        current: false,
      },
    ]);
  };

  const removeEducation = (index) => {
    const newEducation = [...education];
    newEducation.splice(index, 1);
    setEducation(newEducation);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, WEBP)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be less than 2MB");
      return;
    }
    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfileImagePreview(reader.result);
    reader.readAsDataURL(file);
    setError("");
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleResumeSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a valid file (PDF, DOC, DOCX)");
      return;
    }
    setResumeFile(file);
    setResumeName(file.name);
    setRemoveResumeRequested(false);
    setError("");
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setResumeName("");
    setRemoveResumeRequested(true);
    if (resumeInputRef.current) resumeInputRef.current.value = "";
  };

  const handleDeleteExistingResume = () => {
    setResumeName("");
    setRemoveResumeRequested(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Upload profile image if selected
      if (profileImage) {
        const imageResponse = await uploadProfileImage(profileImage);
        if (imageResponse.success) updateUser(imageResponse.user);
      }

      // Upload resume if selected
      if (resumeFile) {
        const resumeResponse = await uploadResume(resumeFile);
        if (resumeResponse.success) updateUser(resumeResponse.user);
      }

      // Delete resume if requested
      if (removeResumeRequested && user?.resume) {
        await deleteResumeFile();
        updateUser({ ...user, resume: null, resumeFileName: null });
      }

      // Update profile data
      const userData = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        headline: profileData.headline,
        bio: profileData.bio,
        skills: skills.filter((s) => s.trim() !== ""),
        experience: experience.filter(
          (exp) => exp.title.trim() !== "" || exp.company.trim() !== "",
        ),
        education: education.filter(
          (edu) => edu.degree.trim() !== "" || edu.institution.trim() !== "",
        ),
      };

      const response = await updateUserProfile(userData);
      if (response.success) {
        updateUser(response.user);
        setProfileImage(null);
        setResumeFile(null);
        setRemoveResumeRequested(false);
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-secondary-500 hover:text-primary-600 mb-4 inline-flex items-center gap-2 transition-colors text-sm"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Back to
            Dashboard
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">
            My Profile
          </h1>
          <p className="text-secondary-500 text-sm mt-1">
            Manage your personal information, profile picture, and resume
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-xl text-primary-700 text-sm flex items-center gap-2">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-primary-600"
            />{" "}
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Profile Card */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-2xl shadow-sm border border-secondary-200 overflow-hidden sticky top-6">
                <div className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative group">
                      {profileImagePreview ? (
                        <img
                          src={profileImagePreview}
                          alt=""
                          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-4xl font-semibold">
                            {profileData.name?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-white p-2 rounded-full w-10 shadow-md border border-secondary-200 hover:bg-secondary-50 hover:scale-105 transition-all"
                      >
                        <FontAwesomeIcon
                          icon={faCamera}
                          className="text-primary-500 text-sm"
                        />
                      </button>
                      {profileImagePreview && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md"
                        >
                          <FontAwesomeIcon icon={faTimes} className="text-xs" />
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <h3 className="text-xl font-semibold text-secondary-900 mt-4">
                      {profileData.name || "Your Name"}
                    </h3>
                    <p className="text-secondary-500 text-sm mt-1">
                      {profileData.headline || "Add your headline"}
                    </p>
                    <span className="mt-2 text-xs px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full font-medium">
                      Job Seeker
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-secondary-600">
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="w-4 text-secondary-400"
                      />
                      <span className="text-sm truncate">
                        {profileData.email}
                      </span>
                    </div>
                    {profileData.phone && (
                      <div className="flex items-center gap-3 text-secondary-600">
                        <FontAwesomeIcon
                          icon={faPhone}
                          className="w-4 text-secondary-400"
                        />
                        <span className="text-sm">{profileData.phone}</span>
                      </div>
                    )}
                    {profileData.location && (
                      <div className="flex items-center gap-3 text-secondary-600">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="w-4 text-secondary-400"
                        />
                        <span className="text-sm">{profileData.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-secondary-100">
                    <h4 className="font-medium text-secondary-900 mb-3">
                      Resume
                    </h4>
                    {user?.resume && !resumeFile && !removeResumeRequested ? (
                      <div className="bg-secondary-50 rounded-lg p-3 border border-secondary-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon
                              icon={faFileAlt}
                              className="text-primary-500"
                            />
                            <span className="text-sm text-secondary-700 truncate max-w-[150px]">
                              {user.resumeFileName || "Resume"}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => window.open(user.resume, "_blank")}
                              className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={handleDeleteExistingResume}
                              className="text-red-500 hover:text-red-600 text-xs font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : resumeFile ? (
                      <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon
                              icon={faFileAlt}
                              className="text-primary-500"
                            />
                            <span className="text-sm text-secondary-700 truncate max-w-[150px]">
                              {resumeName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveResume}
                            className="text-red-500 hover:text-red-600"
                          >
                            <FontAwesomeIcon
                              icon={faTimes}
                              className="text-sm"
                            />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => resumeInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-secondary-200 rounded-xl p-4 text-center hover:border-primary-400 hover:bg-primary-50/50 transition-all group"
                      >
                        <FontAwesomeIcon
                          icon={faUpload}
                          className="text-secondary-400 group-hover:text-primary-500 text-xl mb-1"
                        />
                        <p className="text-sm text-secondary-500 group-hover:text-primary-600">
                          Upload Resume
                        </p>
                        <p className="text-xs text-secondary-400 mt-1">
                          PDF, DOC, DOCX (Max 5MB)
                        </p>
                      </button>
                    )}
                    <input
                      type="file"
                      ref={resumeInputRef}
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="lg:w-2/3 space-y-5">
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-secondary-100 bg-secondary-50/50">
                  <h2 className="font-semibold text-secondary-900 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-primary-500"
                    />
                    Basic Information
                  </h2>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg bg-secondary-50 text-secondary-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={profileData.location}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                        placeholder="City, Country"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                        Professional Headline
                      </label>
                      <input
                        type="text"
                        name="headline"
                        value={profileData.headline}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                        placeholder="e.g., Senior Frontend Developer"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                        Bio / Summary
                      </label>
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 resize-none text-sm"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-secondary-100 bg-secondary-50/50 flex items-center justify-between">
                  <h2 className="font-semibold text-secondary-900 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faCode}
                      className="text-primary-500"
                    />
                    Skills
                  </h2>
                  <button
                    type="button"
                    onClick={addSkill}
                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-xs" /> Add
                  </button>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-secondary-100 rounded-full pl-3 pr-1 py-1.5 border border-secondary-200"
                      >
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) =>
                            handleSkillChange(index, e.target.value)
                          }
                          className="bg-transparent text-sm text-secondary-700 focus:outline-none w-24"
                          placeholder="Skill"
                        />
                        {skills.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSkill(index)}
                            className="text-secondary-400 hover:text-red-500 p-1"
                          >
                            <FontAwesomeIcon
                              icon={faTimes}
                              className="w-3 h-3"
                            />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-secondary-100 bg-secondary-50/50 flex items-center justify-between">
                  <h2 className="font-semibold text-secondary-900 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faBriefcase}
                      className="text-primary-500"
                    />
                    Work Experience
                  </h2>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-xs" /> Add
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  {experience.map((exp, index) => (
                    <div
                      key={index}
                      className="border border-secondary-200 rounded-lg p-4 relative"
                    >
                      {experience.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExperience(index)}
                          className="absolute top-3 right-3 text-secondary-400 hover:text-red-500"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-sm" />
                        </button>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) =>
                            handleExperienceChange(
                              index,
                              "title",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                          placeholder="Job Title"
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) =>
                            handleExperienceChange(
                              index,
                              "company",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                          placeholder="Company"
                        />
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) =>
                            handleExperienceChange(
                              index,
                              "location",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                          placeholder="Location"
                        />
                        <div className="flex gap-2">
                          <input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) =>
                              handleExperienceChange(
                                index,
                                "startDate",
                                e.target.value,
                              )
                            }
                            className="flex-1 px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                          />
                          <input
                            type="month"
                            value={exp.endDate}
                            onChange={(e) =>
                              handleExperienceChange(
                                index,
                                "endDate",
                                e.target.value,
                              )
                            }
                            className="flex-1 px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                            disabled={exp.current}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={exp.current}
                              onChange={(e) =>
                                handleExperienceChange(
                                  index,
                                  "current",
                                  e.target.checked,
                                )
                              }
                              className="rounded text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-secondary-700">
                              I currently work here
                            </span>
                          </label>
                        </div>
                        <div className="col-span-2">
                          <textarea
                            value={exp.description}
                            onChange={(e) =>
                              handleExperienceChange(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            rows={2}
                            className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 resize-none text-sm"
                            placeholder="Description..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-secondary-100 bg-secondary-50/50 flex items-center justify-between">
                  <h2 className="font-semibold text-secondary-900 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faGraduationCap}
                      className="text-primary-500"
                    />
                    Education
                  </h2>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-xs" /> Add
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  {education.map((edu, index) => (
                    <div
                      key={index}
                      className="border border-secondary-200 rounded-lg p-4 relative"
                    >
                      {education.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEducation(index)}
                          className="absolute top-3 right-3 text-secondary-400 hover:text-red-500"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-sm" />
                        </button>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) =>
                            handleEducationChange(
                              index,
                              "degree",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                          placeholder="Degree"
                        />
                        <input
                          type="text"
                          value={edu.field}
                          onChange={(e) =>
                            handleEducationChange(
                              index,
                              "field",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                          placeholder="Field of Study"
                        />
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) =>
                            handleEducationChange(
                              index,
                              "institution",
                              e.target.value,
                            )
                          }
                          className="px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                          placeholder="Institution"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={edu.startYear}
                            onChange={(e) =>
                              handleEducationChange(
                                index,
                                "startYear",
                                e.target.value,
                              )
                            }
                            className="flex-1 px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                            placeholder="Start Year"
                          />
                          <input
                            type="number"
                            value={edu.endYear}
                            onChange={(e) =>
                              handleEducationChange(
                                index,
                                "endYear",
                                e.target.value,
                              )
                            }
                            className="flex-1 px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                            placeholder="End Year"
                            disabled={edu.current}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={edu.current}
                              onChange={(e) =>
                                handleEducationChange(
                                  index,
                                  "current",
                                  e.target.checked,
                                )
                              }
                              className="rounded text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-secondary-700">
                              I currently study here
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="animate-spin"
                      />{" "}
                      Saving...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} /> Save All Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JobSeekerProfile;
