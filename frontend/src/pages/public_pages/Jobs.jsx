import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faMapMarkerAlt,
  faTimes,
  faStar,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { getJobs } from "../../services/jobService";
import { saveJob, unsaveJob, getSavedJobs } from "../../services/authService";
import { getCompanies } from "../../services/companyService";
import { useAuth } from "../../context/AuthContext";
import ApplyModal from "./applyModel/ApplyModel";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import HeroSection from "./components/common/HeroSection";
import JobCard from "./components/common/JobCard";
import FilterBar from "./components/common/FilterBar";
import EmptyState from "./components/common/EmptyState";
import LoadingSpinner from "./components/common/LoadingSpinner";
import JobDetailView from "./components/common/JobDetailModal";

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

  const handleSearch = () => {
    // Search is already handled by the filter states
  };

  if (loading) {
    return <LoadingSpinner message="Loading amazing opportunities..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      {/* Hero Section */}
      <HeroSection
        title="Find Your"
        highlightedWord="Perfect Job"
        subtitle="Discover opportunities that match your skills and career aspirations"
        badgeText={`${allJobs.length}+ opportunities waiting for you`}
        badgeIcon={faStar}
        stats={[
          { value: `${allJobs.length}+`, label: "Active Jobs" },
          { value: "500+", label: "Companies" },
          { value: "50K+", label: "Job Seekers" },
        ]}
        showSearch={true}
        searchPlaceholder="Job title, keywords, or company"
        locationPlaceholder="City, state, or remote"
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        locationValue={locationFilter}
        onLocationChange={(e) => setLocationFilter(e.target.value)}
        onSearch={handleSearch}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <FilterBar
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Job Type
              </label>
              <select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
                className="w-full border border-secondary-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 bg-white cursor-pointer hover:border-primary-300 transition-all"
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
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Experience Level
              </label>
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="w-full border border-secondary-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 bg-white cursor-pointer hover:border-primary-300 transition-all"
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
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Salary Range
              </label>
              <select
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                className="w-full border border-secondary-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 bg-white cursor-pointer hover:border-primary-300 transition-all"
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
        </FilterBar>

        {/* Results Count */}
        <div className="mb-6 animate-fade-in">
          <p className="text-secondary-600 text-lg">
            Found{" "}
            <span className="font-bold text-primary-600 text-xl">
              {filteredJobs.length}
            </span>{" "}
            jobs
            {hasActiveFilters && (
              <span className="ml-2 text-sm bg-primary-50 text-primary-600 px-3 py-1 rounded-full">
                matching your criteria
              </span>
            )}
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
            {filteredJobs.map((job, index) => {
              const jobId = job._id || job.id;
              const companyLogo = getCompanyLogo(job.company);

              return (
                <JobCard
                  key={jobId}
                  job={job}
                  viewMode={viewMode}
                  isSaved={savedJobs.includes(jobId)}
                  onSave={handleSaveJob}
                  onClick={() => setSelectedJob(job)}
                  companyLogo={companyLogo}
                  index={index}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="🔍"
            title="No jobs found"
            description="Try adjusting your search or filters to find more opportunities that match your criteria."
            buttonText="Clear all filters"
            onButtonClick={clearFilters}
          />
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailView
          job={selectedJob}
          isSaved={savedJobs.includes(selectedJob._id || selectedJob.id)}
          onSave={handleSaveJob}
          onApply={handleApplyClick}
          onClose={() => setSelectedJob(null)}
          companyLogo={getCompanyLogo(selectedJob.company)}
        />
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
