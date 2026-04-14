import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faMapMarkerAlt,
  faBriefcase,
  faClock,
  faDollarSign,
  faHeart,
  faTimes,
  faSlidersH,
  faChevronDown,
  faChevronUp,
  faBuilding,
  faGraduationCap,
  faAward,
} from "@fortawesome/free-solid-svg-icons";
import { getJobs } from "../../services/jobService";
import { saveJob, unsaveJob, getSavedJobs } from "../../services/authService";
import { getCompanies } from "../../services/companyService";
import { useAuth } from "../../context/AuthContext";
import ApplyModal from "./applyModel/ApplyModel";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

function Jobs() {
  const { isLoggedIn } = useAuth();
  const [searchParams] = useSearchParams();
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [companyLogos, setCompanyLogos] = useState({});

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedJob, setSelectedJob] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

  useEffect(() => {
    fetchJobs();
    fetchCompanyLogos();
    if (isLoggedIn) {
      fetchSavedJobs();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const jobId = searchParams.get("jobId");
    if (jobId && allJobs.length > 0) {
      const job = allJobs.find((j) => j._id === jobId);
      if (job) {
        setSelectedJob(job);
      }
    }
  }, [searchParams, allJobs]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getJobs({ limit: 50 });
      if (response.success) {
        setAllJobs(response.jobs);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs");
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
        const savedIds = response.savedJobs.map((job) => job._id || job);
        setSavedJobs(savedIds);
      }
    } catch (err) {
      console.error("Error fetching saved jobs:", err);
    }
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
        toast.success("Job removed from saved");
      } else {
        await saveJob(jobId);
        setSavedJobs([...savedJobs, jobId]);
        toast.success("Job saved successfully");
      }
    } catch (error) {
      toast.error(error.message || "Failed to save job");
    }
  };

  // Get unique job types and experience levels
  const jobTypes = [...new Set(allJobs.map((job) => job.type).filter(Boolean))];
  const experienceLevels = [
    ...new Set(allJobs.map((job) => job.experience).filter(Boolean)),
  ];
  const salaryRanges = ["$0 - $50k", "$50k - $80k", "$80k - $100k", "$100k+"];

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

    let matchesSalary = true;
    if (salaryRange) {
      const salaryStr = job.salary?.replace(/[^0-9]/g, "") || "0";
      const jobSalary = parseInt(salaryStr) || 0;
      if (salaryRange === "$0 - $50k") matchesSalary = jobSalary < 50000;
      else if (salaryRange === "$50k - $80k")
        matchesSalary = jobSalary >= 50000 && jobSalary < 80000;
      else if (salaryRange === "$80k - $100k")
        matchesSalary = jobSalary >= 80000 && jobSalary < 100000;
      else if (salaryRange === "$100k+") matchesSalary = jobSalary >= 100000;
    }

    return (
      matchesSearch &&
      matchesLocation &&
      matchesJobType &&
      matchesExperience &&
      matchesSalary
    );
  });

  // Apply sorting
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

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setJobTypeFilter("");
    setExperienceFilter("");
    setSalaryRange("");
    setSortBy("latest");
  };

  const hasActiveFilters =
    searchTerm ||
    locationFilter ||
    jobTypeFilter ||
    experienceFilter ||
    salaryRange;

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

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Browse All Jobs
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Find the perfect opportunity that matches your skills and career
              goals
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-lg p-2 flex flex-col md:flex-row gap-2 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
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
                  placeholder="City, state, or remote"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none text-secondary-900"
                />
              </div>
              <button
                onClick={() => {}}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-all"
              >
                Search Jobs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 mb-6">
          <div className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-secondary-600 hover:text-primary-600 transition-all"
              >
                <FontAwesomeIcon icon={faSlidersH} />
                <span>Filters</span>
                <FontAwesomeIcon
                  icon={showFilters ? faChevronUp : faChevronDown}
                  className="text-xs"
                />
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear all filters
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-secondary-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-secondary-200 rounded-lg px-3 py-1 focus:outline-none focus:border-primary-500"
                >
                  <option value="latest">Latest</option>
                  <option value="salary-high">Salary: High to Low</option>
                  <option value="salary-low">Salary: Low to High</option>
                </select>
              </div>
              <div className="flex items-center gap-2 border-l border-secondary-200 pl-4">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-all ${viewMode === "grid" ? "bg-primary-50 text-primary-600" : "text-secondary-400 hover:bg-secondary-50"}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-all ${viewMode === "list" ? "bg-primary-50 text-primary-600" : "text-secondary-400 hover:bg-secondary-50"}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="border-t border-secondary-200 p-4 bg-secondary-50 rounded-b-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Job Type
                  </label>
                  <select
                    value={jobTypeFilter}
                    onChange={(e) => setJobTypeFilter(e.target.value)}
                    className="w-full border border-secondary-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500 bg-white"
                  >
                    <option value="">All Types</option>
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={experienceFilter}
                    onChange={(e) => setExperienceFilter(e.target.value)}
                    className="w-full border border-secondary-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500 bg-white"
                  >
                    <option value="">All Levels</option>
                    {experienceLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Salary Range
                  </label>
                  <select
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    className="w-full border border-secondary-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500 bg-white"
                  >
                    <option value="">Any Salary</option>
                    {salaryRanges.map((range) => (
                      <option key={range} value={range}>
                        {range}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-secondary-600">
            Found{" "}
            <span className="font-semibold text-secondary-900">
              {filteredJobs.length}
            </span>{" "}
            jobs
            {hasActiveFilters && " matching your criteria"}
          </p>
        </div>

        {/* Job Listings */}
        {filteredJobs.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredJobs.map((job) => {
              const jobId = job._id || job.id;
              const companyLogo = getCompanyLogo(job.company);

              return (
                <div
                  key={jobId}
                  className="bg-white rounded-xl shadow-sm border border-secondary-200 hover:shadow-md transition-all group cursor-pointer"
                  onClick={() => setSelectedJob(job)}
                >
                  {viewMode === "grid" ? (
                    // Grid View Card
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
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
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-secondary-900 mb-1 truncate">
                              {job.title}
                            </h3>
                            <p className="text-sm text-secondary-600 truncate">
                              {job.company}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveJob(jobId, savedJobs.includes(jobId));
                          }}
                          className="text-secondary-400 hover:text-red-500 transition-all p-1"
                        >
                          <FontAwesomeIcon
                            icon={faHeart}
                            className={
                              savedJobs.includes(jobId) ? "text-red-500" : ""
                            }
                          />
                        </button>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-secondary-500">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="w-4 h-4"
                          />
                          <span className="truncate">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-secondary-500">
                          <FontAwesomeIcon
                            icon={faDollarSign}
                            className="w-4 h-4"
                          />
                          <span className="truncate">{job.salary}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-secondary-500">
                          <FontAwesomeIcon
                            icon={faBriefcase}
                            className="w-4 h-4"
                          />
                          <span className="truncate">
                            {job.type} • {job.experience}
                          </span>
                        </div>
                      </div>

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {job.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-secondary-100 text-secondary-600 px-2 py-1 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="text-xs bg-secondary-100 text-secondary-600 px-2 py-1 rounded-full">
                              +{job.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
                        <div className="flex items-center gap-1 text-sm text-secondary-500">
                          <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                          <span>
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {job.urgent && (
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    // List View Card
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
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
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-secondary-900 truncate">
                              {job.title}
                            </h3>
                            {job.urgent && (
                              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium flex-shrink-0">
                                Urgent
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-secondary-600 mb-2 truncate">
                            {job.company}
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs text-secondary-500">
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
                            <span className="flex items-center gap-1">
                              <FontAwesomeIcon
                                icon={faClock}
                                className="w-3 h-3"
                              />
                              {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveJob(jobId, savedJobs.includes(jobId));
                        }}
                        className="ml-4 text-secondary-400 hover:text-red-500 transition-all p-2"
                      >
                        <FontAwesomeIcon
                          icon={faHeart}
                          className={`text-lg ${savedJobs.includes(jobId) ? "text-red-500" : ""}`}
                        />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // No Results
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              No jobs found
            </h3>
            <p className="text-secondary-500 mb-4">
              Try adjusting your search or filters to find what you're looking
              for.
            </p>
            <button
              onClick={clearFilters}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-secondary-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-secondary-900">
                Job Details
              </h2>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-secondary-400 hover:text-secondary-600 p-1 rounded-lg hover:bg-secondary-100"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  {getCompanyLogo(selectedJob.company) ? (
                    <img
                      src={getCompanyLogo(selectedJob.company)}
                      alt={selectedJob.company}
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
                  <h3 className="text-2xl font-bold text-secondary-900 mb-1">
                    {selectedJob.title}
                  </h3>
                  <p className="text-secondary-600">{selectedJob.company}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-secondary-50 p-3 rounded-lg">
                  <div className="text-xs text-secondary-500 mb-1">
                    Location
                  </div>
                  <div className="text-sm font-medium">
                    {selectedJob.location}
                  </div>
                </div>
                <div className="bg-secondary-50 p-3 rounded-lg">
                  <div className="text-xs text-secondary-500 mb-1">Salary</div>
                  <div className="text-sm font-medium">
                    {selectedJob.salary}
                  </div>
                </div>
                <div className="bg-secondary-50 p-3 rounded-lg">
                  <div className="text-xs text-secondary-500 mb-1">
                    Job Type
                  </div>
                  <div className="text-sm font-medium">{selectedJob.type}</div>
                </div>
                <div className="bg-secondary-50 p-3 rounded-lg">
                  <div className="text-xs text-secondary-500 mb-1">
                    Experience
                  </div>
                  <div className="text-sm font-medium">
                    {selectedJob.experience}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-secondary-900 mb-2">
                  Description
                </h4>
                <p className="text-secondary-600 leading-relaxed">
                  {selectedJob.description}
                </p>
              </div>

              {selectedJob.requirements?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-secondary-900 mb-2">
                    Requirements
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-secondary-600">
                    {selectedJob.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.benefits?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-secondary-900 mb-2">
                    Benefits
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.benefits.map((benefit, idx) => (
                      <span
                        key={idx}
                        className="bg-green-50 text-green-600 px-3 py-1.5 rounded-full text-sm"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedJob.skills?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-secondary-900 mb-2">
                    Skills Required
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-secondary-100 text-secondary-700 px-3 py-1.5 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-secondary-200 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-secondary-500 mb-1">
                    <FontAwesomeIcon
                      icon={faGraduationCap}
                      className="text-sm"
                    />
                    <span className="text-xs">Education</span>
                  </div>
                  <p className="text-secondary-900 font-medium">
                    {selectedJob.education || "Not specified"}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-secondary-500 mb-1">
                    <FontAwesomeIcon icon={faAward} className="text-sm" />
                    <span className="text-xs">Experience</span>
                  </div>
                  <p className="text-secondary-900 font-medium">
                    {selectedJob.experience}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedJob(null);
                    handleApplyClick(selectedJob);
                  }}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-all"
                >
                  Apply Now
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const jobId = selectedJob._id || selectedJob.id;
                    handleSaveJob(jobId, savedJobs.includes(jobId));
                  }}
                  className="px-6 py-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-all"
                >
                  <FontAwesomeIcon
                    icon={faHeart}
                    className={`text-xl ${savedJobs.includes(selectedJob._id || selectedJob.id) ? "text-red-500" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            toast.success("Application submitted successfully!");
          }}
        />
      )}
    </div>
  );
}

export default Jobs;
