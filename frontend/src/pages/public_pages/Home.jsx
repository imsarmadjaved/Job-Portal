import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faBuilding,
  faUserPlus,
  faSignInAlt,
  faCheckCircle,
  faUsers,
  faStar,
  faArrowRight,
  faArrowLeft,
  faMapMarkerAlt,
  faDollarSign,
  faAward,
  faCode,
  faGift,
  faGraduationCap,
  faClock,
  faHeart,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { getJobs } from "../../services/jobService";
import { saveJob, unsaveJob, getSavedJobs } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { getCompanies } from "../../services/companyService";
import ApplyModal from "./applyModel/ApplyModel";
import HeroSection from "./components/common/HeroSection";
import JobCard from "./components/common/JobCard";
import StatsCard from "./components/common/StatsCard";
import LoadingSpinner from "./components/common/LoadingSpinner";
import JobDetailModal from "./components/common/JobDetailModal";

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
    return <LoadingSpinner message="Loading amazing opportunities..." />;
  }

  // NOT LOGGED IN - Show Landing Page
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <HeroSection
          title="Find Your"
          highlightedWord="Dream Job"
          subtitle="Connect with top employers and discover opportunities that match your skills and aspirations."
          badgeText="Join 50,000+ job seekers today"
          badgeIcon={faStar}
          stats={[
            { value: `${allJobs.length}+`, label: "Active Jobs" },
            { value: "500+", label: "Top Companies" },
            { value: "50K+", label: "Job Seekers" },
          ]}
          showSearch={false}
        />

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-3xl mx-auto animate-slide-up">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 text-center mb-6">
              Start Your Career Journey Today
            </h2>
            <p className="text-secondary-600 text-center mb-8">
              Join thousands of professionals who've found their dream jobs
              through our platform
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth?mode=register"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2 transform hover:scale-105"
              >
                <FontAwesomeIcon icon={faUserPlus} />
                Create Free Account
              </Link>
              <Link
                to="/auth"
                className="bg-white hover:bg-secondary-50 text-secondary-700 border-2 border-secondary-200 px-8 py-4 rounded-xl font-semibold text-lg transition-all inline-flex items-center justify-center gap-2 transform hover:scale-105"
              >
                <FontAwesomeIcon icon={faSignInAlt} />
                Sign In
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-secondary-500 mt-8 pt-8 border-t border-secondary-100">
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
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <StatsCard
              icon={faBriefcase}
              value={`${allJobs.length}+`}
              label="Active Jobs"
            />
            <StatsCard icon={faBuilding} value="500+" label="Top Companies" />
            <StatsCard icon={faUsers} value="50K+" label="Job Seekers" />
          </div>
        </div>

        {/* Featured Jobs Preview */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Featured Jobs
            </h2>
            <p className="text-secondary-600">
              Discover opportunities handpicked for you
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.slice(0, 6).map((job, index) => (
              <JobCard
                key={job._id}
                job={job}
                viewMode="grid"
                isSaved={false}
                onSave={() => {}}
                companyLogo={getCompanyLogo(job.company)}
                index={index}
              />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors"
            >
              Sign in to view all {allJobs.length}+ jobs
              <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN - Mobile Job Detail View (using JobDetailModal)
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
          {/* Using JobDetailModal but without the modal wrapper - just the content */}
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4 md:p-6">
            <JobDetailContent
              job={selectedJob}
              isSaved={savedJobs.includes(selectedJob._id)}
              onSave={handleSaveJob}
              onApply={handleApplyClick}
              companyLogo={getCompanyLogo(selectedJob.company)}
            />
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN - Desktop View
  return (
    <div className="min-h-screen bg-secondary-50">
      <HeroSection
        title="Find Your"
        highlightedWord="Dream Job"
        subtitle="Connect with top employers and discover opportunities that match your skills"
        badgeText="Welcome back! New jobs available"
        stats={[
          { value: `${allJobs.length}+`, label: "Active Jobs" },
          { value: "500+", label: "Companies" },
          { value: "50K+", label: "Job Seekers" },
        ]}
        showSearch={true}
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        locationValue={locationFilter}
        onLocationChange={(e) => setLocationFilter(e.target.value)}
        onSearch={() => {}}
      />

      {/* Desktop Split View */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex gap-8">
          <div className="w-2/5">
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
              <div className="p-4 border-b border-secondary-200 bg-gradient-to-r from-secondary-50 to-white">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold text-secondary-900">
                    Recent Jobs ({filteredJobs.length})
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

              <div className="divide-y divide-secondary-200 max-h-[600px] overflow-y-auto">
                {filteredJobs.map((job, index) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    viewMode="list"
                    isSaved={savedJobs.includes(job._id)}
                    onSave={handleSaveJob}
                    onClick={() => setSelectedJob(job)}
                    companyLogo={getCompanyLogo(job.company)}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="w-3/5">
            {selectedJob && (
              <div className="sticky top-24">
                {/* Use JobDetailModal but render as inline content */}
                <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
                  <JobDetailContent
                    job={selectedJob}
                    isSaved={savedJobs.includes(selectedJob._id)}
                    onSave={handleSaveJob}
                    onApply={handleApplyClick}
                    companyLogo={getCompanyLogo(selectedJob.company)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet View */}
      <div className="lg:hidden max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
          <div className="p-4 border-b border-secondary-200 bg-gradient-to-r from-secondary-50 to-white">
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
              filteredJobs.map((job, index) => (
                <JobCard
                  key={job._id}
                  job={job}
                  viewMode="list"
                  isSaved={savedJobs.includes(job._id)}
                  onSave={handleSaveJob}
                  onClick={() => handleJobClick(job)}
                  companyLogo={getCompanyLogo(job.company)}
                  index={index}
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

// Helper component for job detail content (reused from JobDetailModal without modal wrapper)
function JobDetailContent({ job, isSaved, onSave, onApply, companyLogo }) {
  const jobId = job._id || job.id;

  // Helper to check if array has items
  const hasItems = (arr) => arr && Array.isArray(arr) && arr.length > 0;

  return (
    <>
      <div className="flex items-start justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md">
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
              <span className="flex items-center gap-1 bg-secondary-100 px-2 py-1 rounded-full">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                {job.location}
              </span>
              <span className="flex items-center gap-1 bg-secondary-100 px-2 py-1 rounded-full">
                <FontAwesomeIcon icon={faDollarSign} />
                {job.salary}
              </span>
              <span className="flex items-center gap-1 bg-secondary-100 px-2 py-1 rounded-full">
                <FontAwesomeIcon icon={faBriefcase} />
                {job.type}
              </span>
              <span className="flex items-center gap-1 bg-secondary-100 px-2 py-1 rounded-full">
                <FontAwesomeIcon icon={faAward} />
                {job.experience}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onSave(jobId, isSaved)}
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
        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] mb-6"
      >
        Apply Now
      </button>

      <div className="space-y-4">
        {/* Description */}
        <div>
          <h3 className="font-semibold text-secondary-900 mb-2 text-lg">
            Description
          </h3>
          <p className="text-secondary-600 leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {/* Requirements */}
        {hasItems(job.requirements) && (
          <div>
            <h3 className="font-semibold text-secondary-900 mb-2 text-lg">
              Requirements
            </h3>
            <ul className="space-y-2">
              {job.requirements.map((req, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-secondary-600"
                >
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-primary-500 text-xs mt-1"
                  />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skills Required - NEW */}
        {hasItems(job.skills) && (
          <div>
            <h3 className="font-semibold text-secondary-900 mb-2 text-lg flex items-center gap-2">
              <FontAwesomeIcon icon={faCode} className="text-primary-500" />
              Skills Required
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-gradient-to-r from-secondary-100 to-secondary-50 text-secondary-700 px-3 py-1.5 rounded-full text-sm font-medium border border-secondary-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Benefits - NEW */}
        {hasItems(job.benefits) && (
          <div>
            <h3 className="font-semibold text-secondary-900 mb-2 text-lg flex items-center gap-2">
              <FontAwesomeIcon icon={faGift} className="text-green-500" />
              Benefits & Perks
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.benefits.map((benefit, idx) => (
                <span
                  key={idx}
                  className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {job.education && (
          <div>
            <h3 className="font-semibold text-secondary-900 mb-2 text-lg flex items-center gap-2">
              <FontAwesomeIcon
                icon={faGraduationCap}
                className="text-purple-500"
              />
              Education
            </h3>
            <p className="text-secondary-600">{job.education}</p>
          </div>
        )}

        {/* Posted Date */}
        <div className="pt-4 border-t border-secondary-200">
          <div className="flex items-center gap-2 text-sm text-secondary-500">
            <FontAwesomeIcon icon={faClock} />
            <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
