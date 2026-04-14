import React, { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faMapMarkerAlt,
  faDollarSign,
  faClock,
  faTrash,
  faArrowLeft,
  faBuilding,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { getSavedJobs, unsaveJob } from "../../services/authService";
import { getCompanies } from "../../services/companyService";
import { useAuth } from "../../context/AuthContext";

function SavedJobs() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [companyLogos, setCompanyLogos] = useState({});

  if (!isLoggedIn) return <Navigate to="/auth" replace />;
  if (user?.role !== "job_seeker") return <Navigate to="/" replace />;

  useEffect(() => {
    fetchSavedJobs();
    fetchCompanyLogos();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const response = await getSavedJobs();
      if (response.success) {
        const validJobs = response.savedJobs.filter((job) => job && job._id);
        setJobs(validJobs);
      }
    } catch (err) {
      console.error("Error fetching saved jobs:", err);
      setError("Failed to load saved jobs");
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

  const handleRemove = async (jobId) => {
    if (!window.confirm("Remove this job from saved?")) return;
    try {
      await unsaveJob(jobId);
      setJobs(jobs.filter((job) => job._id !== jobId));
    } catch (err) {
      alert("Failed to remove job");
    }
  };

  const handleJobClick = (jobId) => {
    navigate(`/jobs?jobId=${jobId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-5 lg:px-6 py-5  mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-secondary-500 hover:text-green-600 mb-4 inline-flex items-center gap-2 transition-colors text-sm"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          Back to Dashboard
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-secondary-900">
            Saved Jobs
          </h1>
          <p className="text-secondary-500 text-sm mt-1">
            Jobs you've saved for later ({jobs.length})
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-12 text-center">
          <div className="text-5xl mb-3">💚</div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            No saved jobs yet
          </h3>
          <p className="text-secondary-500 text-sm mb-4">
            Start saving jobs you're interested in and they'll appear here.
          </p>
          <Link
            to="/jobs"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const companyLogo = getCompanyLogo(job.company);
            return (
              <div
                key={job._id}
                className="bg-white rounded-xl shadow-sm border border-secondary-200 p-5 hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleJobClick(job._id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-green-200">
                        {companyLogo ? (
                          <img
                            src={companyLogo}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faBuilding}
                            className="text-green-500 text-xl"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-1 hover:text-green-600 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-secondary-600 text-sm mb-2">
                          {job.company}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-secondary-500">
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faMapMarkerAlt}
                              className="w-4 h-4"
                            />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faDollarSign}
                              className="w-4 h-4"
                            />
                            {job.salary}
                          </span>
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faClock}
                              className="w-4 h-4"
                            />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-xs bg-secondary-100 text-secondary-600 px-2.5 py-1 rounded-full">
                            {job.type}
                          </span>
                          <span className="text-xs bg-secondary-100 text-secondary-600 px-2.5 py-1 rounded-full">
                            {job.experience}
                          </span>
                          {job.urgent && (
                            <span className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-medium">
                              Urgent
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRemove(job._id)}
                      className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2 text-sm"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                    <button
                      onClick={() => handleJobClick(job._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 text-sm"
                    >
                      View Job
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SavedJobs;
