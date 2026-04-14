import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faMapMarkerAlt,
  faDollarSign,
  faClock,
  faEye,
  faEdit,
  faTrash,
  faUsers,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faTimes,
  faBuilding,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { getMyJobs, deleteJob, updateJob } from "../../services/jobService";
import { useAuth } from "../../context/AuthContext";
import ConfirmModal from "../components/ConfirmationModel";

function MyJobs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [previewJob, setPreviewJob] = useState(null);
  const [editJob, setEditJob] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [company, setCompany] = useState(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    config: {},
    onConfirm: null,
  });

  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    company: "",
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
    fetchJobs();
    fetchCompanyInfo();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getMyJobs();
      if (response.success) {
        setJobs(response.jobs || []);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyInfo = async () => {
    try {
      const { getMyCompany } = await import("../../services/companyService");
      const response = await getMyCompany();
      if (response.success && response.company) {
        setCompany(response.company);
      }
    } catch (error) {
      console.log("Company not found");
    }
  };

  const showConfirmation = (config) => {
    return new Promise((resolve) => {
      setConfirmModal({
        isOpen: true,
        config,
        onConfirm: () => {
          resolve(true);
          setConfirmModal({ isOpen: false, config: {}, onConfirm: null });
        },
      });
    });
  };

  const handleDelete = async (jobId, jobTitle) => {
    const confirmed = await showConfirmation({
      type: "danger",
      title: "Delete Job",
      message: `Are you sure you want to delete "${jobTitle}"?`,
      details:
        "This will also permanently delete ALL applications for this job.\n\nThis action CANNOT be undone.",
      confirmText: "Delete Job",
    });

    if (!confirmed) return;

    setDeletingId(jobId);
    try {
      await deleteJob(jobId);
      setJobs(jobs.filter((job) => (job._id || job.id) !== jobId));
    } catch (err) {
      alert("Failed to delete job");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePreview = (job) => setPreviewJob(job);

  const handleEditClick = (job) => {
    setEditFormData({
      title: job.title || "",
      description: job.description || "",
      company: user?.companyName || job.company || "",
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
    setEditJob(job);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditArrayChange = (index, field, value) => {
    const newArray = [...editFormData[field]];
    newArray[index] = value;
    setEditFormData({ ...editFormData, [field]: newArray });
  };

  const addEditArrayField = (field) => {
    setEditFormData({ ...editFormData, [field]: [...editFormData[field], ""] });
  };

  const removeEditArrayField = (index, field) => {
    const newArray = [...editFormData[field]];
    newArray.splice(index, 1);
    setEditFormData({ ...editFormData, [field]: newArray });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");

    const jobData = {
      ...editFormData,
      requirements: editFormData.requirements.filter(
        (req) => req.trim() !== "",
      ),
      benefits: editFormData.benefits.filter((ben) => ben.trim() !== ""),
      skills: editFormData.skills.filter((skill) => skill.trim() !== ""),
    };

    try {
      const jobId = editJob._id || editJob.id;
      await updateJob(jobId, jobData);
      setJobs(
        jobs.map((job) =>
          (job._id || job.id) === jobId ? { ...job, ...jobData } : job,
        ),
      );
      setEditJob(null);
    } catch (err) {
      setEditError(err.message || "Failed to update job");
    } finally {
      setEditLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      closed: "bg-gray-50 text-gray-600 border-gray-200",
    };
    const icons = {
      active: faCheckCircle,
      pending: faClock,
      closed: faTimesCircle,
    };
    return (
      <span
        className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit font-medium border ${styles[status] || styles.pending}`}
      >
        <FontAwesomeIcon icon={icons[status] || faClock} className="w-3 h-3" />
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const jobTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Remote",
    "Internship",
  ];
  const experienceLevels = ["Entry", "Mid-Level", "Senior", "Lead"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading Jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-5 lg:px-6 py-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-secondary-900">
            My Jobs
          </h1>
          <p className="text-secondary-500 text-sm mt-1">
            Manage all your job postings
          </p>
        </div>
        <Link
          to="/employer/post-job"
          className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm"
        >
          <FontAwesomeIcon icon={faPlus} className="text-sm" /> Post New Job
        </Link>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-12 text-center">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon
              icon={faBriefcase}
              className="text-primary-500 text-3xl"
            />
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            No jobs posted yet
          </h3>
          <p className="text-secondary-500 text-sm mb-5">
            Start by posting your first job
          </p>
          <Link
            to="/employer/post-job"
            className="inline-block bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 text-sm font-medium"
          >
            Post a Job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const jobId = job._id || job.id;
            return (
              <div
                key={jobId}
                className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4 sm:p-5 hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-primary-200">
                        <FontAwesomeIcon
                          icon={faBriefcase}
                          className="text-primary-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-secondary-900 truncate">
                            {job.title}
                          </h3>
                          {getStatusBadge(job.status)}
                        </div>
                        <p className="text-secondary-600 text-sm mb-2">
                          {job.company}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary-500">
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faMapMarkerAlt}
                              className="w-3 h-3"
                            />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faDollarSign}
                              className="w-3 h-3"
                            />
                            {job.salary}
                          </span>
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faClock}
                              className="w-3 h-3"
                            />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faUsers}
                              className="w-3 h-3"
                            />
                            {job.applicationsCount || 0} applicants
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePreview(job)}
                      className="p-2 text-secondary-500 hover:bg-secondary-100 rounded-lg transition-all"
                      title="Preview"
                    >
                      <FontAwesomeIcon icon={faEye} className="text-sm" />
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/employer/jobs/${jobId}/applicants`)
                      }
                      className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg transition-all"
                      title="Applicants"
                    >
                      <FontAwesomeIcon icon={faUsers} className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleEditClick(job)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleDelete(jobId, job.title)}
                      disabled={deletingId === jobId}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === jobId ? (
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="animate-spin text-sm"
                        />
                      ) : (
                        <FontAwesomeIcon icon={faTrash} className="text-sm" />
                      )}
                    </button>
                  </div>
                </div>

                {job.skills?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-secondary-100">
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-secondary-100 text-secondary-600 px-2.5 py-1 rounded-full border border-secondary-200"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="text-xs bg-secondary-100 text-secondary-600 px-2.5 py-1 rounded-full border border-secondary-200">
                          +{job.skills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewJob && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewJob(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-secondary-100 px-5 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-lg font-bold text-secondary-900">
                Job Preview
              </h2>
              <button
                onClick={() => setPreviewJob(null)}
                className="w-8 h-8 rounded-full hover:bg-secondary-100 flex items-center justify-center text-secondary-500 hover:text-secondary-700 transition-all"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center overflow-hidden border border-primary-200">
                  {company?.logo ? (
                    <img
                      src={company.logo}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className="text-primary-500 text-xl"
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-secondary-900">
                    {previewJob.title}
                  </h3>
                  <p className="text-secondary-600">{previewJob.company}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <div className="bg-secondary-50 p-3 rounded-xl">
                  <div className="text-xs text-secondary-500 mb-1">
                    Location
                  </div>
                  <div className="text-sm font-medium">
                    {previewJob.location}
                  </div>
                </div>
                <div className="bg-secondary-50 p-3 rounded-xl">
                  <div className="text-xs text-secondary-500 mb-1">Salary</div>
                  <div className="text-sm font-medium">{previewJob.salary}</div>
                </div>
                <div className="bg-secondary-50 p-3 rounded-xl">
                  <div className="text-xs text-secondary-500 mb-1">Type</div>
                  <div className="text-sm font-medium">{previewJob.type}</div>
                </div>
                <div className="bg-secondary-50 p-3 rounded-xl">
                  <div className="text-xs text-secondary-500 mb-1">
                    Experience
                  </div>
                  <div className="text-sm font-medium">
                    {previewJob.experience}
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <h4 className="font-semibold text-secondary-900 mb-2">
                  Description
                </h4>
                <p className="text-secondary-600 text-sm leading-relaxed">
                  {previewJob.description}
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-secondary-100">
                <button
                  onClick={() => {
                    setPreviewJob(null);
                    handleEditClick(previewJob);
                  }}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-medium transition-all"
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-2" /> Edit Job
                </button>
                <button
                  onClick={() => setPreviewJob(null)}
                  className="px-5 py-2.5 border border-secondary-200 rounded-lg text-secondary-600 hover:bg-secondary-50 transition-all text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editJob && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setEditJob(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-secondary-100 px-5 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-lg font-bold text-secondary-900">Edit Job</h2>
              <button
                onClick={() => setEditJob(null)}
                className="w-8 h-8 rounded-full hover:bg-secondary-100 flex items-center justify-center text-secondary-500 hover:text-secondary-700 transition-all"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {editError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  name="company"
                  value={editFormData.company}
                  readOnly
                  className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg bg-secondary-50 text-secondary-600 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={editFormData.location}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Salary <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={editFormData.salary}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Job Type
                  </label>
                  <select
                    name="type"
                    value={editFormData.type}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm bg-white"
                  >
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Experience
                  </label>
                  <select
                    name="experience"
                    value={editFormData.experience}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm bg-white"
                  >
                    {experienceLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
                    required
                    rows="3"
                    className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 resize-none text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-secondary-100">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                >
                  {editLoading ? "Saving..." : "Update Job"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditJob(null)}
                  className="px-5 py-2.5 border border-secondary-200 rounded-lg text-secondary-600 hover:bg-secondary-50 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({ isOpen: false, config: {}, onConfirm: null })
        }
        onConfirm={confirmModal.onConfirm}
        config={confirmModal.config}
      />
    </div>
  );
}

export default MyJobs;
