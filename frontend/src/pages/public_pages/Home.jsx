import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faMapMarkerAlt,
  faBriefcase,
  faClock,
  faDollarSign,
  faHeart,
  faFilter,
  faBuilding,
  faArrowLeft,
  faGraduationCap,
  faAward,
  faUserPlus,
  faSignInAlt,
  faCheckCircle,
  faUsers,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { getJobs } from "../../services/jobService";
import { saveJob, unsaveJob, getSavedJobs } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { getCompanies } from "../../services/companyService";
import ApplyModal from "./applyModel/ApplyModel";

function Home() {
  const { isLoggedIn } = useAuth();
  const [selectedJob, setSelectedJob] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedJobs, setSavedJobs] = useState([]);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [companyLogos, setCompanyLogos] = useState({});

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

  useEffect(() => {
    fetchJobs();
    if (isLoggedIn) {
      fetchSavedJobs();
    }
  }, [isLoggedIn]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getJobs({ limit: 20 });
      if (response.success) {
        setAllJobs(response.jobs);
        if (response.jobs.length > 0 && !showMobileDetail) {
          setSelectedJob(response.jobs[0]);
        }
        // Fetch company logos for all jobs
        fetchCompanyLogos(response.jobs);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyLogos = async (jobs) => {
    try {
      const response = await getCompanies({ limit: 100 });
      if (response.success && response.companies) {
        const logoMap = {};
        response.companies.forEach((company) => {
          if (company.logo) {
            logoMap[company.name] = company.logo;
          }
        });
        setCompanyLogos(logoMap);
      }
    } catch (err) {
      console.error("Error fetching company logos:", err);
    }
  };

  const getCompanyLogo = (companyName) => {
    return companyLogos[companyName] || null;
  };

  const fetchSavedJobs = async () => {
    try {
      const response = await getSavedJobs();
      if (response.success) {
        const savedIds = response.savedJobs.map((job) => job._id);
        setSavedJobs(savedIds);
      }
    } catch (err) {
      console.error("Error fetching saved jobs:", err);
    }
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setShowMobileDetail(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToList = () => {
    setShowMobileDetail(false);
  };

  const handleApplyClick = (job) => {
    if (!isLoggedIn) {
      sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
      window.location.href = "/auth";
      return;
    }
    setSelectedJobForApply(job);
    setShowApplyModal(true);
  };

  const handleSaveJob = async (jobId, isCurrentlySaved) => {
    if (!isLoggedIn) {
      sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
      window.location.href = "/auth";
      return;
    }

    try {
      if (isCurrentlySaved) {
        await unsaveJob(jobId);
        setSavedJobs(savedJobs.filter((id) => id !== jobId));
      } else {
        await saveJob(jobId);
        setSavedJobs([...savedJobs, jobId]);
      }
    } catch (error) {
      console.error("Error saving job:", error);
    }
  };

  // Apply filters and sorting
  let filteredJobs = allJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = job.location
      .toLowerCase()
      .includes(locationFilter.toLowerCase());
    const matchesJobType = jobTypeFilter === "" || job.type === jobTypeFilter;
    const matchesExperience =
      experienceFilter === "" || job.experience === experienceFilter;

    return (
      matchesSearch && matchesLocation && matchesJobType && matchesExperience
    );
  });

  filteredJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === "salary-high") {
      const aSalary = parseInt(a.salary?.replace(/[^0-9]/g, "") || "0");
      const bSalary = parseInt(b.salary?.replace(/[^0-9]/g, "") || "0");
      return bSalary - aSalary;
    } else if (sortBy === "salary-low") {
      const aSalary = parseInt(a.salary?.replace(/[^0-9]/g, "") || "0");
      const bSalary = parseInt(b.salary?.replace(/[^0-9]/g, "") || "0");
      return aSalary - bSalary;
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  // NOT LOGGED IN - Show Landing Page
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-900 mb-6">
              Find Your <span className="text-primary-600">Dream Job</span>{" "}
              Today
            </h1>
            <p className="text-lg md:text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
              Connect with top employers and discover opportunities that match
              your skills and aspirations.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/auth?mode=register"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faUserPlus} />
                Create Free Account
              </Link>
              <Link
                to="/auth"
                className="bg-white hover:bg-secondary-50 text-secondary-700 border-2 border-secondary-200 px-8 py-4 rounded-xl font-semibold text-lg transition-all inline-flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faSignInAlt} />
                Sign In
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-secondary-500">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-green-500"
                />
                <span className="text-sm">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-green-500"
                />
                <span className="text-sm">Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-green-500"
                />
                <span className="text-sm">
                  {allJobs.length}+ jobs available
                </span>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-secondary-200">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon
                  icon={faBriefcase}
                  className="text-primary-600 text-xl"
                />
              </div>
              <div className="text-3xl font-bold text-secondary-900 mb-1">
                {allJobs.length}+
              </div>
              <div className="text-secondary-500">Active Jobs</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-secondary-200">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon
                  icon={faBuilding}
                  className="text-primary-600 text-xl"
                />
              </div>
              <div className="text-3xl font-bold text-secondary-900 mb-1">
                500+
              </div>
              <div className="text-secondary-500">Top Companies</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-secondary-200">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon
                  icon={faUsers}
                  className="text-primary-600 text-xl"
                />
              </div>
              <div className="text-3xl font-bold text-secondary-900 mb-1">
                50K+
              </div>
              <div className="text-secondary-500">Job Seekers</div>
            </div>
          </div>

          {/* Featured Jobs Preview */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-secondary-900 text-center mb-8">
              Featured Jobs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.slice(0, 3).map((job) => (
                <div
                  key={job._id}
                  className="bg-white rounded-xl p-5 shadow-sm border border-secondary-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {getCompanyLogo(job.company) ? (
                        <img
                          src={getCompanyLogo(job.company)}
                          alt={job.company}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faBuilding}
                          className="text-primary-500"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900 truncate">
                        {job.title}
                      </h3>
                      <p className="text-sm text-secondary-500 truncate">
                        {job.company}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-secondary-500 mb-4">
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
                  </div>
                  <Link
                    to="/auth"
                    className="block w-full text-center bg-primary-50 text-primary-600 py-2 rounded-lg font-medium hover:bg-primary-100 transition-all"
                    onClick={() =>
                      sessionStorage.setItem(
                        "redirectAfterLogin",
                        window.location.pathname,
                      )
                    }
                  >
                    Sign in to Apply
                  </Link>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <p className="text-secondary-500">
                Sign in to view all {allJobs.length}+ jobs
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN - Show regular home content
  // Mobile Job Detail View
  if (showMobileDetail && selectedJob) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-40">
          <div className="px-4 py-4">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 text-secondary-600 hover:text-primary-600 transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
              <span>Back to jobs</span>
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-6">
          <JobDetailView
            job={selectedJob}
            isSaved={savedJobs.includes(selectedJob._id)}
            onSave={handleSaveJob}
            onApply={handleApplyClick}
            companyLogo={getCompanyLogo(selectedJob.company)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
              Find Your Dream Job Today
            </h1>
            <p className="text-base md:text-xl text-primary-100 mb-6 md:mb-8">
              Connect with top employers and discover opportunities that match
              your skills
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-lg p-3 md:p-2 flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                />
                <input
                  type="text"
                  placeholder="Job title or keyword"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none text-secondary-900"
                />
              </div>
              <div className="flex-1 relative">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none text-secondary-900"
                />
              </div>
              <button className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-all">
                Search
              </button>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex justify-center gap-6 md:gap-8 mt-6 md:mt-8">
              <div>
                <div className="text-xl md:text-2xl font-bold">
                  {allJobs.length}+
                </div>
                <div className="text-primary-100 text-xs md:text-sm">
                  Jobs Available
                </div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold">500+</div>
                <div className="text-primary-100 text-xs md:text-sm">
                  Companies
                </div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold">50,000+</div>
                <div className="text-primary-100 text-xs md:text-sm">
                  Job Seekers
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Split View */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex gap-8">
          <div className="w-2/5">
            <JobListings
              jobs={filteredJobs}
              selectedJob={selectedJob}
              savedJobs={savedJobs}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              jobTypeFilter={jobTypeFilter}
              setJobTypeFilter={setJobTypeFilter}
              experienceFilter={experienceFilter}
              setExperienceFilter={setExperienceFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onJobClick={setSelectedJob}
              onSaveJob={handleSaveJob}
              getCompanyLogo={getCompanyLogo}
            />
          </div>

          <div className="w-3/5">
            {selectedJob && (
              <div className="sticky top-24">
                <JobDetailView
                  job={selectedJob}
                  isSaved={savedJobs.includes(selectedJob._id)}
                  onSave={handleSaveJob}
                  onApply={handleApplyClick}
                  companyLogo={getCompanyLogo(selectedJob.company)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet View */}
      <div className="lg:hidden max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
          <div className="p-4 border-b border-secondary-200 bg-secondary-50">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-secondary-900">
                {filteredJobs.length} Jobs Available
              </h2>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 text-secondary-600 hover:text-primary-600 transition-all"
              >
                <FontAwesomeIcon icon={faFilter} />
                <span>Filter</span>
              </button>
            </div>

            {isFilterOpen && (
              <div className="grid grid-cols-1 gap-3 mt-3 pt-3 border-t border-secondary-200">
                <select
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                  className="w-full text-sm border border-secondary-200 rounded-lg px-3 py-2.5"
                >
                  <option value="">All Job Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                  <option value="Internship">Internship</option>
                </select>
                <select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  className="w-full text-sm border border-secondary-200 rounded-lg px-3 py-2.5"
                >
                  <option value="">All Experience Levels</option>
                  <option value="Entry">Entry Level</option>
                  <option value="Mid-Level">Mid Level</option>
                  <option value="Senior">Senior Level</option>
                  <option value="Lead">Lead</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortBy("latest")}
                    className={`flex-1 text-sm py-2 rounded-lg border ${
                      sortBy === "latest"
                        ? "border-primary-500 bg-primary-50 text-primary-600"
                        : "border-secondary-200"
                    }`}
                  >
                    Latest
                  </button>
                  <button
                    onClick={() => setSortBy("salary-high")}
                    className={`flex-1 text-sm py-2 rounded-lg border ${
                      sortBy === "salary-high"
                        ? "border-primary-500 bg-primary-50 text-primary-600"
                        : "border-secondary-200"
                    }`}
                  >
                    Salary ↑
                  </button>
                  <button
                    onClick={() => setSortBy("salary-low")}
                    className={`flex-1 text-sm py-2 rounded-lg border ${
                      sortBy === "salary-low"
                        ? "border-primary-500 bg-primary-50 text-primary-600"
                        : "border-secondary-200"
                    }`}
                  >
                    Salary ↓
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="divide-y divide-secondary-200">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  isSaved={savedJobs.includes(job._id)}
                  onSave={handleSaveJob}
                  onClick={() => handleJobClick(job)}
                  companyLogo={getCompanyLogo(job.company)} // Add this
                />
              ))
            ) : (
              <div className="p-8 text-center text-secondary-500">
                No jobs found matching your criteria
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal
          job={selectedJobForApply}
          onClose={() => {
            setShowApplyModal(false);
            setSelectedJobForApply(null);
          }}
          onSuccess={() => {
            setShowApplyModal(false);
            setSelectedJobForApply(null);
          }}
        />
      )}
    </div>
  );
}

// Job Card Component
function JobCard({ job, isSaved, onSave, onClick, companyLogo }) {
  return (
    <div
      onClick={onClick}
      className="p-4 cursor-pointer transition-all hover:bg-secondary-50 active:bg-secondary-100"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-linear-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={job.company}
              className="w-full h-full object-cover"
            />
          ) : (
            <FontAwesomeIcon
              icon={faBuilding}
              className="text-primary-500 text-xl"
            />
          )}
        </div>
        {/* rest of JobCard remains the same */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-secondary-900 mb-1 truncate">
                {job.title}
              </h3>
              <p className="text-sm text-secondary-600 mb-2 truncate">
                {job.company}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSave(job._id, isSaved);
              }}
              className="text-secondary-400 hover:text-red-500 transition-all p-1"
            >
              <FontAwesomeIcon
                icon={faHeart}
                className={isSaved ? "text-red-500" : ""}
              />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-secondary-500">
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3" />
              <span className="truncate">{job.location}</span>
            </span>
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faDollarSign} className="w-3 h-3" />
              <span className="truncate">{job.salary}</span>
            </span>
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faBriefcase} className="w-3 h-3" />
              <span className="truncate">{job.type}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Job Listings Component (Desktop)
function JobListings({
  jobs,
  selectedJob,
  savedJobs,
  isFilterOpen,
  setIsFilterOpen,
  jobTypeFilter,
  setJobTypeFilter,
  experienceFilter,
  setExperienceFilter,
  sortBy,
  setSortBy,
  onJobClick,
  onSaveJob,
  getCompanyLogo,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
      <div className="p-4 border-b border-secondary-200 bg-secondary-50">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-secondary-900">
            Recent Jobs ({jobs.length})
          </h2>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 text-secondary-600 hover:text-primary-600 transition-all"
          >
            <FontAwesomeIcon icon={faFilter} />
            <span className="text-sm">Filter</span>
          </button>
        </div>

        {isFilterOpen && (
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-secondary-200">
            <div>
              <label className="text-xs text-secondary-500 block mb-1">
                Job Type
              </label>
              <select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
                className="w-full text-sm border border-secondary-200 rounded-lg px-3 py-2"
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-secondary-500 block mb-1">
                Experience
              </label>
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="w-full text-sm border border-secondary-200 rounded-lg px-3 py-2"
              >
                <option value="">All Levels</option>
                <option value="Entry">Entry Level</option>
                <option value="Mid-Level">Mid Level</option>
                <option value="Senior">Senior Level</option>
                <option value="Lead">Lead</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-secondary-500 block mb-1">
                Sort By
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy("latest")}
                  className={`flex-1 text-sm px-3 py-2 rounded-lg border transition-all ${
                    sortBy === "latest"
                      ? "border-primary-500 bg-primary-50 text-primary-600"
                      : "border-secondary-200 hover:bg-secondary-50"
                  }`}
                >
                  Latest
                </button>
                <button
                  onClick={() => setSortBy("salary-high")}
                  className={`flex-1 text-sm px-3 py-2 rounded-lg border transition-all ${
                    sortBy === "salary-high"
                      ? "border-primary-500 bg-primary-50 text-primary-600"
                      : "border-secondary-200 hover:bg-secondary-50"
                  }`}
                >
                  Salary ↑
                </button>
                <button
                  onClick={() => setSortBy("salary-low")}
                  className={`flex-1 text-sm px-3 py-2 rounded-lg border transition-all ${
                    sortBy === "salary-low"
                      ? "border-primary-500 bg-primary-50 text-primary-600"
                      : "border-secondary-200 hover:bg-secondary-50"
                  }`}
                >
                  Salary ↓
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="divide-y divide-secondary-200 max-h-150 overflow-y-auto">
        {jobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            isSaved={savedJobs.includes(job._id)}
            onSave={onSaveJob}
            onClick={() => onJobClick(job)}
            companyLogo={getCompanyLogo(job.company)}
          />
        ))}
      </div>
    </div>
  );
}

// Job Detail View Component
function JobDetailView({ job, isSaved, onSave, onApply, companyLogo }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4 md:p-6">
      <div className="flex items-start justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-linear-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={job.company}
                className="w-full h-full object-cover"
              />
            ) : (
              <FontAwesomeIcon
                icon={faBuilding}
                className="text-primary-500 text-2xl"
              />
            )}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-secondary-900 mb-1 md:mb-2">
              {job.title}
            </h1>
            <p className="text-secondary-600 text-sm md:text-base">
              {job.company}
            </p>
            <div className="flex flex-wrap gap-2 md:gap-3 mt-2 text-xs md:text-sm text-secondary-500">
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faDollarSign} />
                {job.salary}
              </span>
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faBriefcase} />
                {job.type}
              </span>
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faClock} />
                {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onSave(job._id, isSaved)}
          className="text-secondary-400 hover:text-red-500 transition-all p-2"
        >
          <FontAwesomeIcon
            icon={faHeart}
            className={`text-xl ${isSaved ? "text-red-500" : ""}`}
          />
        </button>
      </div>

      <button
        onClick={() => onApply(job)}
        className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-all shadow-md mb-6"
      >
        Apply Now
      </button>

      <div className="space-y-4 md:space-y-6">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-secondary-900 mb-2 md:mb-3">
            Job Description
          </h3>
          <p className="text-sm md:text-base text-secondary-600 leading-relaxed">
            {job.description}
          </p>
        </div>

        {job.requirements?.length > 0 && (
          <div>
            <h3 className="text-base md:text-lg font-semibold text-secondary-900 mb-2 md:mb-3">
              Requirements
            </h3>
            <ul className="space-y-2">
              {job.requirements.map((req, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm md:text-base text-secondary-600"
                >
                  <span className="text-primary-600 mt-1">•</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {job.benefits?.length > 0 && (
          <div>
            <h3 className="text-base md:text-lg font-semibold text-secondary-900 mb-2 md:mb-3">
              Benefits
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.benefits.map((benefit, idx) => (
                <span
                  key={idx}
                  className="bg-green-50 text-green-600 px-3 py-1.5 rounded-full text-xs md:text-sm"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:gap-4 pt-4 border-t border-secondary-200">
          <div>
            <div className="flex items-center gap-2 text-secondary-500 mb-1">
              <FontAwesomeIcon icon={faGraduationCap} className="text-sm" />
              <span className="text-xs md:text-sm">Education</span>
            </div>
            <p className="text-sm md:text-base text-secondary-900 font-medium">
              {job.education || "Not specified"}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-secondary-500 mb-1">
              <FontAwesomeIcon icon={faAward} className="text-sm" />
              <span className="text-xs md:text-sm">Experience</span>
            </div>
            <p className="text-sm md:text-base text-secondary-900 font-medium">
              {job.experience}
            </p>
          </div>
        </div>

        {job.skills?.length > 0 && (
          <div>
            <h3 className="text-base md:text-lg font-semibold text-secondary-900 mb-2 md:mb-3">
              Skills Required
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-secondary-100 text-secondary-700 px-3 py-1.5 rounded-full text-xs md:text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
