import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faMapMarkerAlt,
  faDollarSign,
  faGraduationCap,
  faPlus,
  faTrash,
  faChevronLeft,
  faSave,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { createJob, updateJob, getJobById } from "../../services/jobService";

function PostJob() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isLoggedIn } = useAuth();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState("");

  // Protect route - only employer can access
  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }
  if (user?.role !== "employer") {
    return <Navigate to="/" replace />;
  }

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company: user?.companyName || "",
    location: "",
    salary: "",
    type: "Full-time",
    experience: "Mid-Level",
    requirements: [""],
    benefits: [""],
    skills: [""],
    education: "",
    urgent: false,
  });

  useEffect(() => {
    if (isEditMode) {
      fetchJobForEdit();
    }
  }, [id]);

  const fetchJobForEdit = async () => {
    try {
      const response = await getJobById(id);
      if (response.success) {
        const job = response.job;
        setFormData({
          title: job.title || "",
          description: job.description || "",
          company: job.company || user?.companyName || "",
          location: job.location || "",
          salary: job.salary || "",
          type: job.type || "Full-time",
          experience: job.experience || "Mid-Level",
          requirements: job.requirements?.length ? job.requirements : [""],
          benefits: job.benefits?.length ? job.benefits : [""],
          skills: job.skills?.length ? job.skills : [""],
          education: job.education || "",
          urgent: job.urgent || false,
        });
      }
    } catch (err) {
      console.error("Error fetching job:", err);
      setError("Failed to load job for editing");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (index, field, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const removeArrayField = (index, field) => {
    const newArray = [...formData[field]];
    newArray.splice(index, 1);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.location ||
      !formData.salary
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    const jobData = {
      ...formData,
      requirements: formData.requirements.filter((req) => req.trim() !== ""),
      benefits: formData.benefits.filter((ben) => ben.trim() !== ""),
      skills: formData.skills.filter((skill) => skill.trim() !== ""),
    };

    try {
      if (isEditMode) {
        await updateJob(id, jobData);
      } else {
        await createJob(jobData);
      }
      navigate("/employer/jobs");
    } catch (err) {
      setError(err.message || "Failed to save job");
    } finally {
      setLoading(false);
    }
  };

  const jobTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Remote",
    "Internship",
  ];
  const experienceLevels = ["Entry", "Mid-Level", "Senior", "Lead"];

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            className="animate-spin text-3xl text-primary-500 mb-3"
          />
          <p className="text-secondary-500">Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-5 lg:px-6 py-5 ">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/employer/jobs")}
          className="text-secondary-500 hover:text-primary-600 mb-4 inline-flex items-center gap-2 transition-colors text-sm"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
          Back to My Jobs
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-secondary-900">
          {isEditMode ? "Edit Job" : "Post a New Job"}
        </h1>
        <p className="text-secondary-500 text-sm mt-1">
          {isEditMode
            ? "Update your job listing details"
            : "Fill in the details to create a new job listing"}
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-secondary-200 p-5 sm:p-6"
      >
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
              Company Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FontAwesomeIcon
                icon={faBriefcase}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
              />
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                readOnly
                className="w-full pl-10 pr-4 py-2.5 border border-secondary-200 rounded-lg bg-secondary-50 text-secondary-700 cursor-not-allowed text-sm"
                placeholder="Your company name"
              />
            </div>
            <p className="text-xs text-secondary-400 mt-1">
              Auto-filled from your profile
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Job Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-200 text-sm"
                placeholder="e.g., Senior Frontend Developer"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  placeholder="e.g., Remote, New York"
                />
              </div>
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Salary Range <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faDollarSign}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                />
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  placeholder="e.g., $80,000 - $100,000"
                />
              </div>
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Job Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm bg-white"
              >
                {jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Experience <span className="text-red-500">*</span>
              </label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm bg-white"
              >
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Education */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Education
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faGraduationCap}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                />
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  placeholder="e.g., Bachelor's in Computer Science"
                />
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 resize-none text-sm"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
              />
            </div>

            {/* Requirements */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Requirements
              </label>
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) =>
                      handleArrayChange(index, "requirements", e.target.value)
                    }
                    className="flex-1 px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                    placeholder={`Requirement ${index + 1}`}
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, "requirements")}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-sm" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField("requirements")}
                className="mt-2 text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" /> Add
                Requirement
              </button>
            </div>

            {/* Benefits */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Benefits
              </label>
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) =>
                      handleArrayChange(index, "benefits", e.target.value)
                    }
                    className="flex-1 px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                    placeholder={`Benefit ${index + 1}`}
                  />
                  {formData.benefits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, "benefits")}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-sm" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField("benefits")}
                className="mt-2 text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" /> Add
                Benefit
              </button>
            </div>

            {/* Skills */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Skills
              </label>
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) =>
                      handleArrayChange(index, "skills", e.target.value)
                    }
                    className="flex-1 px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                    placeholder={`Skill ${index + 1}`}
                  />
                  {formData.skills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, "skills")}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-sm" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField("skills")}
                className="mt-2 text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" /> Add Skill
              </button>
            </div>

            {/* Urgent Toggle */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="urgent"
                  checked={formData.urgent}
                  onChange={(e) =>
                    setFormData({ ...formData, urgent: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-secondary-700 text-sm">
                  Mark as Urgent/Hot Job
                </span>
              </label>
              <p className="text-xs text-secondary-400 mt-1">
                Urgent jobs will be highlighted and shown at the top
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-secondary-200">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 text-white py-2.5 px-6 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm order-2 sm:order-1"
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} />
                {isEditMode ? "Update Job" : "Post Job"}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/employer/jobs")}
            className="px-6 py-2.5 border border-secondary-200 rounded-lg text-secondary-600 hover:bg-secondary-50 transition-all text-sm order-1 sm:order-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostJob;
