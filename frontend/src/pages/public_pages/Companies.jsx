import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faMapMarkerAlt,
  faBriefcase,
  faUsers,
  faBuilding,
  faFilter,
  faShare,
  faGlobe,
  faEnvelope,
  faCalendar,
  faChevronDown,
  faChevronUp,
  faSlidersH,
  faTimes,
  faCheckCircle,
  faDollarSign,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import {
  faLinkedin,
  faTwitter,
  faFacebook,
} from "@fortawesome/free-brands-svg-icons";
import { getCompanies } from "../../services/companyService";
import { getJobs } from "../../services/jobService";
import HeroSection from "./components/common/HeroSection";
import FilterBar from "./components/common/FilterBar";
import EmptyState from "./components/common/EmptyState";
import LoadingSpinner from "./components/common/LoadingSpinner";

function Companies() {
  const navigate = useNavigate();
  const [allCompanies, setAllCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  // Fetch companies from API
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await getCompanies({ limit: 50 });
      if (response.success) {
        setAllCompanies(response.companies);
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyJobs = async (companyName) => {
    try {
      setLoadingJobs(true);
      const response = await getJobs({ search: companyName, limit: 20 });
      if (response.success) {
        setCompanyJobs(response.jobs);
      }
    } catch (err) {
      console.error("Error fetching company jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleViewJobs = (company) => {
    navigate(`/jobs?search=${encodeURIComponent(company.name)}`);
  };

  const handleViewJobDetails = (jobId) => {
    navigate(`/jobs?jobId=${jobId}`);
  };

  // Get unique values for filters from API data
  const industries = [
    ...new Set(allCompanies.map((company) => company.industry).filter(Boolean)),
  ];
  const sizes = [
    ...new Set(allCompanies.map((company) => company.size).filter(Boolean)),
  ];
  const locations = [
    ...new Set(
      allCompanies
        .map(
          (company) =>
            company.location?.split(",")[0]?.trim() || company.location,
        )
        .filter(Boolean),
    ),
  ];

  // Apply filters
  let filteredCompanies = allCompanies.filter((company) => {
    const matchesSearch =
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry =
      industryFilter === "" || company.industry === industryFilter;
    const matchesLocation =
      locationFilter === "" || company.location?.includes(locationFilter);
    const matchesSize = sizeFilter === "" || company.size === sizeFilter;

    return matchesSearch && matchesIndustry && matchesLocation && matchesSize;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setIndustryFilter("");
    setLocationFilter("");
    setSizeFilter("");
  };

  const hasActiveFilters =
    searchTerm || industryFilter || locationFilter || sizeFilter;

  if (loading) {
    return <LoadingSpinner message="Loading amazing companies..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      {/* Hero Section */}
      <HeroSection
        title="Top Companies"
        highlightedWord="Hiring Now"
        subtitle="Discover amazing companies and find your perfect workplace"
        badgeText={`${allCompanies.length}+ companies hiring`}
        badgeIcon={faBuilding}
        stats={[
          { value: `${allCompanies.length}+`, label: "Companies" },
          { value: "1000+", label: "Open Positions" },
          { value: "50K+", label: "Employees Hired" },
        ]}
        showSearch={true}
        searchPlaceholder="Search companies..."
        locationPlaceholder="Location"
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        locationValue={locationFilter}
        onLocationChange={(e) => setLocationFilter(e.target.value)}
        onSearch={fetchCompanies}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <FilterBar
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          hideSort={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Industry
              </label>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full border border-secondary-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 bg-white cursor-pointer hover:border-primary-300 transition-all"
              >
                <option value="">All Industries</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Location
              </label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full border border-secondary-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 bg-white cursor-pointer hover:border-primary-300 transition-all"
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Company Size
              </label>
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="w-full border border-secondary-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 bg-white cursor-pointer hover:border-primary-300 transition-all"
              >
                <option value="">All Sizes</option>
                {sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
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
              {filteredCompanies.length}
            </span>{" "}
            companies
            {hasActiveFilters && (
              <span className="ml-2 text-sm bg-primary-50 text-primary-600 px-3 py-1 rounded-full">
                matching your criteria
              </span>
            )}
          </p>
        </div>

        {/* Companies Listings */}
        {filteredCompanies.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredCompanies.map((company, index) => (
              <div
                key={company._id || company.id}
                onClick={() => {
                  setSelectedCompany(company);
                  fetchCompanyJobs(company.name);
                }}
                className="bg-white rounded-xl shadow-md border border-secondary-200 hover:shadow-xl hover:border-primary-200 transition-all duration-300 group cursor-pointer transform hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {viewMode === "grid" ? (
                  // Grid View Card
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-all">
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt={company.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=6366f1&color=fff`;
                              }}
                            />
                          ) : (
                            <span className="text-2xl font-bold text-primary-600">
                              {company.name?.charAt(0) || "C"}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">
                              {company.name}
                            </h3>
                            {company.verified && (
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="text-primary-500 text-sm"
                                title="Verified Company"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      {company.featured && (
                        <span className="bg-gradient-to-r from-accent-100 to-accent-50 text-accent-600 text-xs px-2.5 py-1.5 rounded-full font-semibold border border-accent-200">
                          Featured
                        </span>
                      )}
                    </div>

                    <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
                      {company.description}
                    </p>

                    <div className="space-y-2.5 mb-4">
                      <div className="flex items-center gap-2 text-sm text-secondary-600">
                        <FontAwesomeIcon
                          icon={faBuilding}
                          className="w-4 h-4 text-primary-500"
                        />
                        <span className="truncate">{company.industry}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-secondary-600">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="w-4 h-4 text-green-500"
                        />
                        <span className="truncate">{company.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-secondary-600">
                        <FontAwesomeIcon
                          icon={faUsers}
                          className="w-4 h-4 text-blue-500"
                        />
                        <span className="truncate">{company.size}</span>
                      </div>
                    </div>

                    {company.specialties && company.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {company.specialties
                          .slice(0, 3)
                          .map((specialty, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gradient-to-r from-secondary-100 to-secondary-50 text-secondary-700 px-2.5 py-1.5 rounded-full border border-secondary-200"
                            >
                              {specialty}
                            </span>
                          ))}
                        {company.specialties.length > 3 && (
                          <span className="text-xs bg-primary-50 text-primary-600 px-2.5 py-1.5 rounded-full border border-primary-200 font-medium">
                            +{company.specialties.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
                      <div className="flex items-center gap-1.5">
                        <FontAwesomeIcon
                          icon={faBriefcase}
                          className="text-primary-500 text-sm"
                        />
                        <span className="text-sm font-medium text-primary-600">
                          {company.openJobs || 0} open positions
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewJobs(company);
                        }}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View Jobs →
                      </button>
                    </div>
                  </div>
                ) : (
                  // List View Card
                  <div className="p-5 flex items-center justify-between group-hover:bg-gradient-to-r group-hover:from-primary-50/30 transition-all duration-300">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=6366f1&color=fff`;
                            }}
                          />
                        ) : (
                          <span className="text-2xl font-bold text-primary-600">
                            {company.name?.charAt(0) || "C"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-secondary-900 truncate group-hover:text-primary-600 transition-colors">
                            {company.name}
                          </h3>
                          {company.verified && (
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="text-primary-500 text-xs"
                            />
                          )}
                          {company.featured && (
                            <span className="bg-gradient-to-r from-accent-100 to-accent-50 text-accent-600 text-xs px-2 py-0.5 rounded-full font-semibold">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-secondary-600 text-sm mb-2 line-clamp-1">
                          {company.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-secondary-500">
                          <span className="flex items-center gap-1.5">
                            <FontAwesomeIcon
                              icon={faBuilding}
                              className="w-3.5 h-3.5 text-primary-500"
                            />
                            {company.industry}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <FontAwesomeIcon
                              icon={faMapMarkerAlt}
                              className="w-3.5 h-3.5 text-green-500"
                            />
                            {company.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <FontAwesomeIcon
                              icon={faUsers}
                              className="w-3.5 h-3.5 text-blue-500"
                            />
                            {company.size}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <FontAwesomeIcon
                              icon={faBriefcase}
                              className="w-3.5 h-3.5"
                            />
                            {company.openJobs || 0} positions
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewJobs(company);
                      }}
                      className="ml-4 text-primary-600 hover:text-primary-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View Jobs →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🏢"
            title="No companies found"
            description="Try adjusting your search or filters to find more companies."
            buttonText="Clear all filters"
            onButtonClick={clearFilters}
          />
        )}
      </div>

      {/* Company Details Modal */}
      {selectedCompany && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setSelectedCompany(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-secondary-200 p-5 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-secondary-900">
                Company Profile
              </h2>
              <button
                onClick={() => setSelectedCompany(null)}
                className="text-secondary-400 hover:text-secondary-600 p-2 rounded-lg hover:bg-secondary-100 transition-all"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            <div className="p-6">
              {/* Company Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
                  {selectedCompany.logo ? (
                    <img
                      src={selectedCompany.logo}
                      alt={selectedCompany.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCompany.name)}&background=6366f1&color=fff&size=96`;
                      }}
                    />
                  ) : (
                    <span className="text-4xl font-bold text-primary-600">
                      {selectedCompany.name?.charAt(0) || "C"}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="text-2xl font-bold text-secondary-900">
                      {selectedCompany.name}
                    </h3>
                    {selectedCompany.verified && (
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-primary-500 text-lg"
                        title="Verified Company"
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-secondary-600">
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faBuilding}
                        className="text-primary-500"
                      />
                      {selectedCompany.industry}
                    </span>
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="text-green-500"
                      />
                      {selectedCompany.location}
                    </span>
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faUsers}
                        className="text-blue-500"
                      />
                      {selectedCompany.size}
                    </span>
                    {selectedCompany.founded && (
                      <span className="flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faCalendar}
                          className="text-purple-500"
                        />
                        Founded {selectedCompany.founded}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleViewJobs(selectedCompany)}
                  className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-105 shadow-lg"
                >
                  View All Jobs ({selectedCompany.openJobs || 0})
                </button>
              </div>

              {/* Company Description */}
              <div className="mb-8">
                <h4 className="font-bold text-secondary-900 mb-3 text-lg">
                  About
                </h4>
                <p className="text-secondary-600 leading-relaxed">
                  {selectedCompany.description}
                </p>
              </div>

              {/* Specialties */}
              {selectedCompany.specialties &&
                selectedCompany.specialties.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-bold text-secondary-900 mb-3 text-lg">
                      Specialties
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCompany.specialties.map((specialty, idx) => (
                        <span
                          key={idx}
                          className="bg-gradient-to-r from-secondary-100 to-secondary-50 text-secondary-700 px-4 py-2 rounded-full text-sm font-medium border border-secondary-200"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Benefits */}
              {selectedCompany.benefits &&
                selectedCompany.benefits.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-bold text-secondary-900 mb-3 text-lg">
                      Benefits & Perks
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCompany.benefits.map((benefit, idx) => (
                        <span
                          key={idx}
                          className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium border border-green-200"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Jobs List */}
              <div className="mt-8">
                <h4 className="font-bold text-secondary-900 mb-4 text-lg">
                  Open Positions at {selectedCompany.name}
                </h4>
                {loadingJobs ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : companyJobs.length > 0 ? (
                  <div className="space-y-3">
                    {companyJobs.map((job) => (
                      <div
                        key={job._id || job.id}
                        onClick={() => handleViewJobDetails(job._id || job.id)}
                        className="border border-secondary-200 rounded-xl p-5 hover:bg-gradient-to-r hover:from-primary-50/30 hover:to-transparent cursor-pointer transition-all group"
                      >
                        <h5 className="font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">
                          {job.title}
                        </h5>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-secondary-500">
                          <span className="flex items-center gap-1.5">
                            <FontAwesomeIcon
                              icon={faMapMarkerAlt}
                              className="w-4 h-4 text-primary-500"
                            />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <FontAwesomeIcon
                              icon={faDollarSign}
                              className="w-4 h-4 text-green-500"
                            />
                            {job.salary}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <FontAwesomeIcon
                              icon={faBriefcase}
                              className="w-4 h-4 text-blue-500"
                            />
                            {job.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary-500 text-center py-8">
                    No open positions at this time.
                  </p>
                )}
              </div>

              {/* Contact & Social */}
              <div className="pt-6 mt-8 border-t border-secondary-200">
                <h4 className="font-bold text-secondary-900 mb-4 text-lg">
                  Connect with {selectedCompany.name}
                </h4>
                <div className="flex flex-wrap gap-6">
                  {selectedCompany.website && (
                    <a
                      href={selectedCompany.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                      <FontAwesomeIcon icon={faGlobe} />
                      <span>Website</span>
                    </a>
                  )}
                  {selectedCompany.email && (
                    <a
                      href={`mailto:${selectedCompany.email}`}
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                      <FontAwesomeIcon icon={faEnvelope} />
                      <span>Email</span>
                    </a>
                  )}
                  {selectedCompany.social?.linkedin && (
                    <a
                      href={selectedCompany.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                      <FontAwesomeIcon icon={faLinkedin} />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {selectedCompany.social?.twitter && (
                    <a
                      href={selectedCompany.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                      <FontAwesomeIcon icon={faTwitter} />
                      <span>Twitter</span>
                    </a>
                  )}
                  {selectedCompany.social?.facebook && (
                    <a
                      href={selectedCompany.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                      <FontAwesomeIcon icon={faFacebook} />
                      <span>Facebook</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Companies;
