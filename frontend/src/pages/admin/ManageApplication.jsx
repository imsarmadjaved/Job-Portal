import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faEye,
  faTrash,
  faSpinner,
  faTimes,
  faBriefcase,
  faUser,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faFileAlt,
  faMapMarkerAlt,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../services/axios";
import ConfirmModal from "../components/ConfirmationModel";

function ManageApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
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
    fetchApplications();
  }, [pagination.page, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);
      params.append("page", pagination.page);
      params.append("limit", 10);

      const response = await api.get(
        `/admin/applications?${params.toString()}`,
      );
      if (response.data.success) {
        setApplications(response.data.applications);
        setPagination({
          page: response.data.page,
          total: response.data.total,
          pages: response.data.pages,
        });
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
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

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchApplications();
  };

  const handleDelete = async (applicationId, applicantName, jobTitle) => {
    const confirmed = await showConfirmation({
      type: "danger",
      title: "Delete Application",
      message: `Are you sure you want to delete this application?`,
      details: `Applicant: ${applicantName}\nJob: ${jobTitle}\n\nThis action CANNOT be undone.`,
      confirmText: "Delete Application",
    });

    if (!confirmed) return;

    setDeletingId(applicationId);
    try {
      const response = await api.delete(`/admin/applications/${applicationId}`);
      if (response.data.success) {
        setApplications(
          applications.filter((app) => app._id !== applicationId),
        );
        if (selectedApplication?._id === applicationId) {
          setShowViewModal(false);
          setSelectedApplication(null);
        }
      }
    } catch (err) {
      alert("Failed to delete application");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      reviewed: "bg-blue-50 text-blue-700 border-blue-200",
      shortlisted: "bg-purple-50 text-purple-700 border-purple-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      accepted: "bg-green-50 text-green-700 border-green-200",
    };
    const icons = {
      pending: faClock,
      reviewed: faEye,
      shortlisted: faCheckCircle,
      rejected: faTimesCircle,
      accepted: faCheckCircle,
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

  const isJobDeleted = (application) =>
    !application.job || !application.job._id;

  const statusCounts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    reviewed: applications.filter((a) => a.status === "reviewed").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading Applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-secondary-900">
          Manage Applications
        </h1>
        <p className="text-secondary-500 text-sm mt-1">
          View and manage all job applications
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
              placeholder="Search by applicant, email, or job title..."
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

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Job
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider hidden sm:table-cell">
                  Applied
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {applications.length > 0 ? (
                applications.map((application) => (
                  <tr
                    key={application._id}
                    className={`hover:bg-secondary-50 transition-all ${isJobDeleted(application) ? "bg-red-50/30" : ""}`}
                  >
                    <td className="px-4 sm:px-5 py-4">
                      {isJobDeleted(application) ? (
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            className="text-red-500 text-sm"
                          />
                          <div>
                            <p className="font-medium text-red-600 text-sm">
                              Job Deleted
                            </p>
                            <p className="text-xs text-red-400">
                              This posting has been removed
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-secondary-900 text-sm">
                            {application.job?.title || "Unknown"}
                          </p>
                          <p className="text-xs text-secondary-500">
                            {application.job?.company || "Unknown"}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
                          {application.applicant?.profileImage ? (
                            <img
                              src={application.applicant.profileImage}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faUser}
                                className="text-primary-500 text-xs"
                              />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900 text-sm">
                            {application.applicant?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-secondary-500">
                            {application.applicant?.email || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-4 text-sm text-secondary-500 hidden sm:table-cell">
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-5 py-4">
                      {getStatusBadge(application.status)}
                    </td>
                    <td className="px-4 sm:px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowViewModal(true);
                          }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          title="View"
                        >
                          <FontAwesomeIcon icon={faEye} className="text-sm" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              application._id,
                              application.applicant?.name || "Unknown",
                              application.job?.title || "Unknown",
                            )
                          }
                          disabled={deletingId === application._id}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === application._id ? (
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
                    colSpan="5"
                    className="px-5 py-16 text-center text-secondary-500"
                  >
                    <FontAwesomeIcon
                      icon={faFileAlt}
                      className="text-4xl text-secondary-300 mb-3"
                    />
                    <p className="text-base font-medium text-secondary-700">
                      No applications found
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
      {showViewModal && selectedApplication && (
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
                Application Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="w-8 h-8 rounded-full hover:bg-secondary-100 flex items-center justify-center text-secondary-500 hover:text-secondary-700 transition-all"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                {/* Job Details */}
                <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-100">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faBriefcase}
                      className="text-primary-500"
                    />{" "}
                    Job Details
                  </h4>
                  {isJobDeleted(selectedApplication) ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-600 mb-1">
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        <span className="font-medium">Job Deleted</span>
                      </div>
                      <p className="text-sm text-red-500">
                        This job posting has been deleted.
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium">
                        {selectedApplication.job?.title}
                      </p>
                      <p className="text-sm text-secondary-600 mb-2">
                        {selectedApplication.job?.company}
                      </p>
                      <div className="space-y-1 text-sm text-secondary-600">
                        <p className="flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="w-3 h-3"
                          />
                          {selectedApplication.job?.location}
                        </p>
                        <p className="flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faDollarSign}
                            className="w-3 h-3"
                          />
                          {selectedApplication.job?.salary}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Applicant Details */}
                <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-100">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-primary-500"
                    />{" "}
                    Applicant Details
                  </h4>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
                      {selectedApplication.applicant?.profileImage ? (
                        <img
                          src={selectedApplication.applicant.profileImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FontAwesomeIcon
                            icon={faUser}
                            className="text-primary-500"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {selectedApplication.applicant?.name}
                      </p>
                      <p className="text-sm text-secondary-600">
                        {selectedApplication.applicant?.email}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-secondary-600">
                    Applied:{" "}
                    {new Date(
                      selectedApplication.appliedAt,
                    ).toLocaleDateString()}
                  </p>
                  <div className="mt-2">
                    {getStatusBadge(selectedApplication.status)}
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div className="mb-5">
                <h4 className="font-semibold text-secondary-900 mb-2">
                  Cover Letter
                </h4>
                <div className="bg-secondary-50 rounded-xl p-4 border border-secondary-100">
                  <p className="text-secondary-600 whitespace-pre-wrap text-sm">
                    {selectedApplication.coverLetter ||
                      "No cover letter provided"}
                  </p>
                </div>
              </div>

              {/* Resume */}
              {selectedApplication.resume && (
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faFileAlt}
                      className="text-primary-500"
                    />{" "}
                    Resume
                  </h4>
                  <a
                    href={selectedApplication.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-lg border border-primary-200 text-sm"
                  >
                    <FontAwesomeIcon icon={faEye} /> View Resume
                  </a>
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

export default ManageApplications;
