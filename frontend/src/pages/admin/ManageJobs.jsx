import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faEye,
  faTrash,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faBuilding,
  faMapMarkerAlt,
  faDollarSign,
  faBriefcase,
  faClock,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  getAdminJobs,
  updateAdminJobStatus,
  deleteAdminJob,
} from "../../services/adminService";
import { getCompanies } from "../../services/companyService";
import ConfirmModal from "../components/ConfirmationModel";

function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [companyLogos, setCompanyLogos] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
  });

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    config: {},
    onConfirm: null,
  });

  useEffect(() => {
    fetchJobs();
    fetchCompanyLogos();
  }, [pagination.page, statusFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getAdminJobs({
        status: statusFilter,
        search: searchTerm,
        page: pagination.page,
        limit: 10,
      });
      if (response.success) {
        setJobs(response.jobs);
        setPagination({
          page: response.page,
          total: response.total,
          pages: response.pages,
        });
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyLogos = async () => {
    try {
      const response = await getCompanies({ limit: 100 });
      if (response.success && response.companies) {
        const logoMap = {};
        response.companies.forEach((company) => {
          if (company.logo) logoMap[company.name] = company.logo;
        });
        setCompanyLogos(logoMap);
      }
    } catch (err) {
      console.error("Error fetching company logos:", err);
    }
  };

  const getCompanyLogo = (companyName) => companyLogos[companyName] || null;

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

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchJobs();
  };

  const handleStatusChange = async (jobId, newStatus, jobTitle) => {
    const actionText = newStatus === "active" ? "approve" : "close";
    const confirmed = await showConfirmation({
      type: newStatus === "active" ? "success" : "warning",
      title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Job`,
      message: `Are you sure you want to ${actionText} "${jobTitle}"?`,
      confirmText: actionText.charAt(0).toUpperCase() + actionText.slice(1),
    });

    if (!confirmed) return;

    setUpdatingId(jobId);
    try {
      const response = await updateAdminJobStatus(jobId, newStatus);
      if (response.success) {
        setJobs(
          jobs.map((job) =>
            job._id === jobId ? { ...job, status: newStatus } : job,
          ),
        );
        if (selectedJob?._id === jobId) {
          setSelectedJob({ ...selectedJob, status: newStatus });
        }
      }
    } catch (err) {
      alert("Failed to update job status");
    } finally {
      setUpdatingId(null);
    }
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
      const response = await deleteAdminJob(jobId);
      if (response.success) {
        setJobs(jobs.filter((job) => job._id !== jobId));
        if (selectedJob?._id === jobId) {
          setShowViewModal(false);
          setSelectedJob(null);
        }
      }
    } catch (err) {
      alert("Failed to delete job");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-50 text-green-700 border-green-200",
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
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

  const statusCounts = {
    all: jobs.length,
    active: jobs.filter((j) => j.status === "active").length,
    pending: jobs.filter((j) => j.status === "pending").length,
    closed: jobs.filter((j) => j.status === "closed").length,
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-secondary-900">
          Manage Jobs
        </h1>
        <p className="text-secondary-500 text-sm mt-1">
          View and manage all job listings
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 text-sm"
            />
            <input
              type="text"
              placeholder="Search by job title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-200 text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
          >
            Search
          </button>
          <div className="flex flex-wrap gap-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === status
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
                }`}
              >
                {status === "all" ? "All" : status}
                <span
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${statusFilter === status ? "bg-white/20" : "bg-secondary-200"}`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Job
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Posted By
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider hidden md:table-cell">
                  Posted
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <tr
                    key={job._id}
                    className="hover:bg-secondary-50 transition-all"
                  >
                    <td className="px-4 sm:px-5 py-4">
                      <p className="font-medium text-secondary-900 text-sm">
                        {job.title}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-secondary-500">
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
                            icon={faBriefcase}
                            className="w-3 h-3"
                          />
                          {job.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
                          {getCompanyLogo(job.company) ? (
                            <img
                              src={getCompanyLogo(job.company)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faBuilding}
                                className="text-primary-500 text-sm"
                              />
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-secondary-600">
                          {job.company}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-4 text-sm text-secondary-600">
                      {job.postedBy?.name || "Unknown"}
                    </td>
                    <td className="px-4 sm:px-5 py-4">
                      {getStatusBadge(job.status)}
                    </td>
                    <td className="px-4 sm:px-5 py-4 text-sm text-secondary-500 hidden md:table-cell">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setShowViewModal(true);
                          }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          title="View"
                        >
                          <FontAwesomeIcon icon={faEye} className="text-sm" />
                        </button>
                        {job.status === "pending" && (
                          <button
                            onClick={() =>
                              handleStatusChange(job._id, "active", job.title)
                            }
                            disabled={updatingId === job._id}
                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50"
                            title="Approve"
                          >
                            {updatingId === job._id ? (
                              <FontAwesomeIcon
                                icon={faSpinner}
                                className="animate-spin text-sm"
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="text-sm"
                              />
                            )}
                          </button>
                        )}
                        {job.status === "active" && (
                          <button
                            onClick={() =>
                              handleStatusChange(job._id, "closed", job.title)
                            }
                            disabled={updatingId === job._id}
                            className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-all disabled:opacity-50"
                            title="Close"
                          >
                            {updatingId === job._id ? (
                              <FontAwesomeIcon
                                icon={faSpinner}
                                className="animate-spin text-sm"
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon={faTimesCircle}
                                className="text-sm"
                              />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(job._id, job.title)}
                          disabled={deletingId === job._id}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === job._id ? (
                            <FontAwesomeIcon
                              icon={faSpinner}
                              className="animate-spin text-sm"
                            />
                          ) : (
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="text-sm"
                            />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-16 text-center text-secondary-500"
                  >
                    <FontAwesomeIcon
                      icon={faBriefcase}
                      className="text-4xl text-secondary-300 mb-3"
                    />
                    <p className="text-base font-medium text-secondary-700">
                      No jobs found
                    </p>
                    <p className="text-sm text-secondary-400 mt-1">
                      Try adjusting your filters
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page - 1 })
            }
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-secondary-200 rounded-lg disabled:opacity-50 hover:bg-secondary-50 text-sm transition-all"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-secondary-600 text-sm">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page + 1 })
            }
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 border border-secondary-200 rounded-lg disabled:opacity-50 hover:bg-secondary-50 text-sm transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedJob && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowViewModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-secondary-100 px-5 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-lg font-bold text-secondary-900">
                Job Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="w-8 h-8 rounded-full hover:bg-secondary-100 flex items-center justify-center text-secondary-500 hover:text-secondary-700 transition-all"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
                  {getCompanyLogo(selectedJob.company) ? (
                    <img
                      src={getCompanyLogo(selectedJob.company)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faBuilding}
                        className="text-primary-500 text-xl"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-secondary-900">
                    {selectedJob.title}
                  </h3>
                  <p className="text-secondary-600">{selectedJob.company}</p>
                  <div className="mt-1.5">
                    {getStatusBadge(selectedJob.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <div className="bg-secondary-50 p-3 rounded-xl">
                  <div className="text-xs text-secondary-500 mb-1">
                    Location
                  </div>
                  <div className="text-sm font-medium">
                    {selectedJob.location}
                  </div>
                </div>
                <div className="bg-secondary-50 p-3 rounded-xl">
                  <div className="text-xs text-secondary-500 mb-1">Salary</div>
                  <div className="text-sm font-medium">
                    {selectedJob.salary}
                  </div>
                </div>
                <div className="bg-secondary-50 p-3 rounded-xl">
                  <div className="text-xs text-secondary-500 mb-1">
                    Job Type
                  </div>
                  <div className="text-sm font-medium">{selectedJob.type}</div>
                </div>
                <div className="bg-secondary-50 p-3 rounded-xl">
                  <div className="text-xs text-secondary-500 mb-1">
                    Experience
                  </div>
                  <div className="text-sm font-medium">
                    {selectedJob.experience}
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <h4 className="font-semibold text-secondary-900 mb-2">
                  Description
                </h4>
                <p className="text-secondary-600 text-sm leading-relaxed">
                  {selectedJob.description}
                </p>
              </div>

              {selectedJob.requirements?.length > 0 && (
                <div className="mb-5">
                  <h4 className="font-semibold text-secondary-900 mb-2">
                    Requirements
                  </h4>
                  <ul className="space-y-1 text-secondary-600 text-sm">
                    {selectedJob.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary-500">•</span> {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.benefits?.length > 0 && (
                <div className="mb-5">
                  <h4 className="font-semibold text-secondary-900 mb-2">
                    Benefits
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.benefits.map((benefit, idx) => (
                      <span
                        key={idx}
                        className="bg-green-50 text-green-600 px-3 py-1.5 rounded-full text-xs border border-green-200"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedJob.skills?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2">
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-secondary-100 text-secondary-700 px-3 py-1.5 rounded-full text-xs border border-secondary-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
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

export default ManageJobs;
