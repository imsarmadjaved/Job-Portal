import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faUsers,
  faEye,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faClock,
  faFileAlt,
  faUser,
  faEnvelope,
  faCalendar,
  faBriefcase,
  faGraduationCap,
  faDownload,
  faFilter,
  faStar,
  faMapMarkerAlt,
  faPhone,
  faBuilding,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import {
  getJobApplications,
  updateApplicationStatus,
} from "../../services/applicationService";
import { getJobById } from "../../services/jobService";

function Applicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [showMobileDetails, setShowMobileDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const jobResponse = await getJobById(jobId);
      if (jobResponse.success) setJob(jobResponse.job);

      const appsResponse = await getJobApplications(jobId);
      if (appsResponse.success) {
        setApplications(appsResponse.applications);
        if (appsResponse.applications.length > 0 && !selectedApplication) {
          setSelectedApplication(appsResponse.applications[0]);
        }
      }
    } catch (err) {
      setError("Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      await updateApplicationStatus(applicationId, { status: newStatus });
      setApplications(
        applications.map((app) =>
          app._id === applicationId ? { ...app, status: newStatus } : app,
        ),
      );
      if (selectedApplication?._id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus });
      }
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSelectApplicant = (application) => {
    setSelectedApplication(application);
    setShowMobileDetails(true);
  };

  const handleBackToList = () => {
    setShowMobileDetails(false);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      reviewed: "bg-blue-50 text-blue-700 border-blue-200",
      shortlisted: "bg-purple-50 text-purple-700 border-purple-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    const icons = {
      pending: faClock,
      reviewed: faEye,
      shortlisted: faStar,
      rejected: faTimesCircle,
      accepted: faCheckCircle,
    };
    return (
      <span
        className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit font-medium border ${styles[status] || styles.pending}`}
      >
        <FontAwesomeIcon icon={icons[status] || faClock} className="w-3 h-3" />
        <span className="hidden xs:inline">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </span>
    );
  };

  const getInitials = (name) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const filteredApplications = applications.filter((app) =>
    statusFilter === "all" ? true : app.status === statusFilter,
  );

  const statusOptions = [
    "all",
    "pending",
    "reviewed",
    "shortlisted",
    "rejected",
    "accepted",
  ];
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
          <p className="text-secondary-600">Loading Applicants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-8 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon
            icon={faTimesCircle}
            className="text-red-500 text-2xl"
          />
        </div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
          Something went wrong
        </h3>
        <p className="text-secondary-500 mb-4">{error}</p>
        <button
          onClick={() => navigate("/employer/jobs")}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  // Mobile Detail View
  if (showMobileDetails && selectedApplication) {
    return (
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="bg-white border-b border-secondary-200 sticky top-0 z-30">
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={handleBackToList}
              className="p-2 -ml-2 text-secondary-600 hover:text-primary-600 transition-colors"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div>
              <h2 className="font-semibold text-secondary-900">
                {selectedApplication.applicant?.name || "Anonymous"}
              </h2>
              <p className="text-xs text-secondary-500">
                {selectedApplication.applicant?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Details Content */}
        <div className="p-4 space-y-4">
          <ApplicantDetails
            application={selectedApplication}
            job={job}
            getStatusBadge={getStatusBadge}
            handleStatusUpdate={handleStatusUpdate}
            updatingId={updatingId}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-4 lg:py-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 lg:mb-6">
        <button
          onClick={() => navigate("/employer/jobs")}
          className="text-secondary-500 hover:text-primary-600 mb-3 lg:mb-4 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Back to My
          Jobs
        </button>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-secondary-900">
              {job?.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <FontAwesomeIcon
                icon={faBuilding}
                className="text-secondary-400 text-sm"
              />
              <p className="text-secondary-500 text-sm">
                {job?.company} • {job?.location}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-primary-50 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg border border-primary-200">
            <FontAwesomeIcon
              icon={faUsers}
              className="text-primary-600 text-sm"
            />
            <span className="font-medium text-primary-700 text-sm">
              {applications.length} Applicant
              {applications.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar - Scrollable on mobile */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-3 lg:p-4 mb-4 lg:mb-6 overflow-x-auto">
        <div className="flex items-center gap-2 lg:gap-3 min-w-max">
          <FontAwesomeIcon
            icon={faFilter}
            className="text-secondary-400 text-sm"
          />
          <span className="text-sm text-secondary-500">Filter:</span>
          <div className="flex gap-1.5 lg:gap-2">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-xs lg:text-sm capitalize font-medium transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
                }`}
              >
                {status === "all" ? "All" : status}
                {statusCounts[status] > 0 && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${statusFilter === status ? "bg-white/20" : "bg-secondary-200"}`}
                  >
                    {statusCounts[status]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-8 lg:p-12 text-center">
          <div className="w-16 lg:w-20 h-16 lg:h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
            <FontAwesomeIcon
              icon={faUsers}
              className="text-secondary-400 text-2xl lg:text-3xl"
            />
          </div>
          <h3 className="text-base lg:text-lg font-semibold text-secondary-900 mb-1">
            No applicants yet
          </h3>
          <p className="text-secondary-500 text-xs lg:text-sm">
            {statusFilter !== "all"
              ? `No ${statusFilter} applications found.`
              : "When job seekers apply, they'll appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          {/* Left - Applicants List */}
          <div className="space-y-2 lg:space-y-3 max-h-[calc(100vh-300px)] lg:max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredApplications.map((application) => (
              <div
                key={application._id}
                onClick={() => handleSelectApplicant(application)}
                className={`bg-white rounded-xl shadow-sm border p-3 lg:p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedApplication?._id === application._id
                    ? "border-primary-500 bg-primary-50 ring-1 ring-primary-200"
                    : "border-secondary-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2 lg:gap-3">
                  <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
                      {application.applicant?.profileImage ? (
                        <img
                          src={application.applicant.profileImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
                          <span className="text-white font-semibold text-xs lg:text-sm">
                            {getInitials(application.applicant?.name)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-secondary-900 text-sm lg:text-base truncate">
                        {application.applicant?.name || "Anonymous"}
                      </h4>
                      <p className="text-xs lg:text-sm text-secondary-500 truncate">
                        {application.applicant?.email}
                      </p>
                      <p className="text-xs text-secondary-400 mt-0.5 lg:mt-1">
                        {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(application.status)}
                </div>
              </div>
            ))}
          </div>

          {/* Right - Details (Hidden on mobile, shown on lg+) */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-secondary-200 p-5 sticky top-24 max-h-[calc(100vh-150px)] overflow-y-auto">
            {selectedApplication ? (
              <ApplicantDetails
                application={selectedApplication}
                job={job}
                getStatusBadge={getStatusBadge}
                handleStatusUpdate={handleStatusUpdate}
                updatingId={updatingId}
              />
            ) : (
              <div className="text-center py-16 text-secondary-500">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FontAwesomeIcon
                    icon={faUsers}
                    className="text-2xl text-secondary-400"
                  />
                </div>
                <p className="font-medium text-secondary-700">
                  Select an applicant
                </p>
                <p className="text-sm text-secondary-400 mt-1">
                  Click on an applicant to view details
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Separate ApplicantDetails component for reusability
function ApplicantDetails({
  application,
  job,
  getStatusBadge,
  handleStatusUpdate,
  updatingId,
}) {
  return (
    <>
      <div className="flex items-start gap-3 lg:gap-4 mb-4 lg:mb-5">
        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
          {application.applicant?.profileImage ? (
            <img
              src={application.applicant.profileImage}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
              <span className="text-white font-semibold text-lg lg:text-xl">
                {application.applicant?.name
                  ?.split(" ")
                  .map((n) => n.charAt(0))
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "A"}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base lg:text-lg font-bold text-secondary-900 truncate">
            {application.applicant?.name || "Anonymous"}
          </h3>
          <p className="text-secondary-600 text-xs lg:text-sm truncate">
            {application.applicant?.headline || "Job Applicant"}
          </p>
          <div className="flex flex-wrap gap-x-2 lg:gap-x-3 gap-y-1 mt-1 text-xs text-secondary-500">
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3" />
              {application.applicant?.email}
            </span>
            {application.applicant?.phone && (
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faPhone} className="w-3 h-3" />
                {application.applicant.phone}
              </span>
            )}
            {application.applicant?.location && (
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3" />
                {application.applicant.location}
              </span>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          {getStatusBadge(application.status)}
          <p className="text-xs text-secondary-400 mt-1">
            {new Date(application.appliedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mb-4 lg:mb-5 p-3 lg:p-4 bg-secondary-50 rounded-xl border border-secondary-100">
        <label className="block text-xs lg:text-sm font-medium text-secondary-700 mb-2">
          Update Status
        </label>
        <div className="flex flex-wrap gap-1.5 lg:gap-2">
          {["reviewed", "shortlisted", "rejected", "accepted"].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusUpdate(application._id, status)}
              disabled={updatingId === application._id}
              className={`px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-lg text-xs lg:text-sm capitalize font-medium transition-all ${
                application.status === status
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-white border border-secondary-200 hover:bg-primary-50 hover:border-primary-300"
              } disabled:opacity-50`}
            >
              {updatingId === application._id ? (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="animate-spin mr-1"
                />
              ) : null}
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 lg:mb-5">
        <h4 className="font-semibold text-secondary-900 text-sm mb-2 flex items-center gap-2">
          <FontAwesomeIcon icon={faFileAlt} className="text-primary-500" />{" "}
          Cover Letter
        </h4>
        <div className="bg-secondary-50 rounded-lg p-3 text-xs lg:text-sm border border-secondary-100 max-h-32 lg:max-h-40 overflow-y-auto">
          {application.coverLetter || "No cover letter provided"}
        </div>
      </div>

      {application.applicant?.skills?.length > 0 && (
        <div className="mb-4 lg:mb-5">
          <h4 className="font-semibold text-secondary-900 text-sm mb-2">
            Skills
          </h4>
          <div className="flex flex-wrap gap-1 lg:gap-1.5">
            {application.applicant.skills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-primary-50 text-primary-700 px-2 lg:px-2.5 py-1 rounded-full text-xs border border-primary-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {application.applicant?.experience?.length > 0 && (
        <div className="mb-4 lg:mb-5">
          <h4 className="font-semibold text-secondary-900 text-sm mb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faBriefcase} className="text-primary-500" />{" "}
            Experience
          </h4>
          <div className="space-y-2">
            {application.applicant.experience.slice(0, 2).map((exp, idx) => (
              <div
                key={idx}
                className="bg-secondary-50 rounded-lg p-2.5 lg:p-3 border border-secondary-100"
              >
                <p className="font-medium text-secondary-900 text-xs lg:text-sm">
                  {exp.title}
                </p>
                <p className="text-secondary-600 text-xs">{exp.company}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {application.applicant?.education?.length > 0 && (
        <div className="mb-4 lg:mb-5">
          <h4 className="font-semibold text-secondary-900 text-sm mb-2 flex items-center gap-2">
            <FontAwesomeIcon
              icon={faGraduationCap}
              className="text-primary-500"
            />{" "}
            Education
          </h4>
          <div className="space-y-2">
            {application.applicant.education.slice(0, 2).map((edu, idx) => (
              <div
                key={idx}
                className="bg-secondary-50 rounded-lg p-2.5 lg:p-3 border border-secondary-100"
              >
                <p className="font-medium text-secondary-900 text-xs lg:text-sm">
                  {edu.degree}
                </p>
                <p className="text-secondary-600 text-xs">{edu.institution}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {(application.resume || application.applicant?.resume) && (
        <div>
          <h4 className="font-semibold text-secondary-900 text-sm mb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faDownload} className="text-primary-500" />{" "}
            Resume
          </h4>
          <a
            href={application.resume || application.applicant?.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 bg-primary-50 px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm border border-primary-200 transition-all"
          >
            <FontAwesomeIcon icon={faDownload} /> Download Resume
          </a>
        </div>
      )}
    </>
  );
}

export default Applicants;
