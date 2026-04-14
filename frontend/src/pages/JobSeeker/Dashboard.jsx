import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faEye,
  faSpinner,
  faBuilding,
  faMapMarkerAlt,
  faDollarSign,
  faCalendar,
  faTimes,
  faExclamationTriangle,
  faArrowRight,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { getMyApplications } from "../../services/applicationService";
import { getCompanies } from "../../services/companyService";
import { useAuth } from "../../context/AuthContext";
import { getJobById } from "../../services/jobService";

function JobSeekerDashboard() {
  const { user, isLoggedIn } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [companyLogos, setCompanyLogos] = useState({});

  if (!isLoggedIn) return <Navigate to="/auth" replace />;
  if (user?.role !== "job_seeker") return <Navigate to="/" replace />;

  useEffect(() => {
    fetchApplications();
    fetchCompanyLogos();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await getMyApplications();
      if (response.success) {
        const validApplications = response.applications.filter(
          (app) => app.job && app.job._id,
        );
        setApplications(validApplications);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("Failed to load applications");
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

  const handleViewJob = async (jobId) => {
    if (!jobId) return;
    try {
      const response = await getJobById(jobId);
      if (response.success) {
        setSelectedJob(response.job);
        setShowJobModal(true);
      }
    } catch (err) {
      alert("Job details not available. The job may have been deleted.");
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: {
        style: "bg-amber-50 text-amber-700 border-amber-200",
        icon: faClock,
      },
      reviewed: {
        style: "bg-blue-50 text-blue-700 border-blue-200",
        icon: faEye,
      },
      shortlisted: {
        style: "bg-purple-50 text-purple-700 border-purple-200",
        icon: faCheckCircle,
      },
      rejected: {
        style: "bg-red-50 text-red-700 border-red-200",
        icon: faTimesCircle,
      },
      accepted: {
        style: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: faCheckCircle,
      },
    };
    const c = config[status] || config.pending;
    return (
      <span
        className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 w-fit font-medium ${c.style}`}
      >
        <FontAwesomeIcon icon={c.icon} className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredApplications = applications.filter((app) =>
    filter === "all" ? true : app.status === filter,
  );

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    reviewed: applications.filter((a) => a.status === "reviewed").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const filterOptions = [
    { value: "all", label: "All", count: stats.total },
    { value: "pending", label: "Pending", count: stats.pending },
    { value: "reviewed", label: "Reviewed", count: stats.reviewed },
    { value: "shortlisted", label: "Shortlisted", count: stats.shortlisted },
    { value: "accepted", label: "Accepted", count: stats.accepted },
    { value: "rejected", label: "Rejected", count: stats.rejected },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-12 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-red-500 text-2xl"
          />
        </div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
          Something went wrong
        </h3>
        <p className="text-secondary-500 mb-4">{error}</p>
        <button
          onClick={fetchApplications}
          className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-5 lg:px-6 py-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-secondary-900">
          My Applications
        </h1>
        <p className="text-secondary-500 text-sm mt-1">
          Welcome back, {user?.name?.split(" ")[0]}! Track your job applications
          here.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {filterOptions.map((stat) => (
          <div
            key={stat.value}
            className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4 text-center hover:shadow-md transition-all"
          >
            <p className="text-2xl font-bold text-secondary-900">
              {stat.count}
            </p>
            <p className="text-xs text-secondary-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-3 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-secondary-500 flex items-center gap-2">
            <FontAwesomeIcon
              icon={faSearch}
              className="text-secondary-400 text-xs"
            />
            Filter by status:
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {filterOptions.map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === item.value
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
                }`}
              >
                {item.label}
                <span
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === item.value ? "bg-white/20" : "bg-secondary-200"}`}
                >
                  {item.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-12 text-center">
          <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon
              icon={faBriefcase}
              className="text-secondary-400 text-3xl"
            />
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            No applications found
          </h3>
          <p className="text-secondary-500 text-sm mb-5">
            {filter !== "all"
              ? `You don't have any ${filter} applications.`
              : "Start applying to jobs to see them here."}
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
          >
            Browse Jobs{" "}
            <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const companyLogo = getCompanyLogo(application.job?.company);
            const isJobDeleted = !application.job;

            return (
              <div
                key={application._id}
                className={`bg-white rounded-xl shadow-sm border transition-all ${isJobDeleted ? "border-red-200 bg-red-50/30" : "border-secondary-200 hover:shadow-md"}`}
              >
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                        {companyLogo ? (
                          <img
                            src={companyLogo}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faBuilding}
                            className="text-primary-500 text-lg"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-secondary-900 text-base">
                            {application.job?.title || "Deleted Job"}
                          </h3>
                          {getStatusBadge(application.status)}
                        </div>
                        <p className="text-secondary-600 text-sm mb-2">
                          {application.job?.company || "Company unavailable"}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary-500">
                          {application.job?.location && (
                            <span className="flex items-center gap-1">
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="w-3 h-3"
                              />
                              {application.job.location}
                            </span>
                          )}
                          {application.job?.salary && (
                            <span className="flex items-center gap-1">
                              <FontAwesomeIcon
                                icon={faDollarSign}
                                className="w-3 h-3"
                              />
                              {application.job.salary}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faCalendar}
                              className="w-3 h-3"
                            />
                            Applied{" "}
                            {new Date(
                              application.appliedAt,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        {isJobDeleted && (
                          <div className="mt-3 flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-xs">
                            <FontAwesomeIcon
                              icon={faExclamationTriangle}
                              className="text-xs"
                            />
                            <span>
                              This job has been deleted by the employer
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {application.job?._id && (
                      <button
                        onClick={() => handleViewJob(application.job._id)}
                        className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all flex items-center gap-2 text-sm font-medium border border-transparent hover:border-primary-200"
                      >
                        <FontAwesomeIcon icon={faEye} className="text-sm" />
                        <span>View Job</span>
                      </button>
                    )}
                  </div>
                  {application.coverLetter && (
                    <div className="mt-4 pt-4 border-t border-secondary-100">
                      <p className="text-sm text-secondary-500 line-clamp-2">
                        <span className="font-medium text-secondary-700">
                          Cover Letter:
                        </span>{" "}
                        {application.coverLetter}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowJobModal(false)}
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
                onClick={() => setShowJobModal(false)}
                className="w-8 h-8 rounded-full hover:bg-secondary-100 flex items-center justify-center text-secondary-500 hover:text-secondary-700 transition-all"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center overflow-hidden">
                  {getCompanyLogo(selectedJob.company) ? (
                    <img
                      src={getCompanyLogo(selectedJob.company)}
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
                    {selectedJob.title}
                  </h3>
                  <p className="text-secondary-600">{selectedJob.company}</p>
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

              <div className="flex pt-4 border-t border-secondary-100">
                <button
                  onClick={() => setShowJobModal(false)}
                  className="px-6 py-2.5 border border-secondary-200 rounded-lg text-secondary-600 hover:bg-secondary-50 transition-all text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobSeekerDashboard;
