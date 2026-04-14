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
  faDollarSign, // ADD THIS LINE
} from "@fortawesome/free-solid-svg-icons";
import {
  faLinkedin,
  faTwitter,
  faFacebook,
} from "@fortawesome/free-brands-svg-icons";
import { getCompanies } from "../../services/companyService";
import { getJobs } from "../../services/jobService";

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
    // Navigate to jobs page with company name as search query
    navigate(`/jobs?search=${encodeURIComponent(company.name)}`);
  };

  const handleViewJobDetails = (jobId) => {
    // Navigate to jobs page and open job modal (you can implement this)
    navigate(`/jobs?jobId=${jobId}`);
  };

  // Get unique values for filters from API data
  const industries = [
    ...new Set(allCompanies.map((company) => company.industry)),
  ];
  const sizes = [...new Set(allCompanies.map((company) => company.size))];
  const locations = [
    ...new Set(
      allCompanies.map(
        (company) =>
          company.location?.split(",")[0]?.trim() || company.location,
      ),
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
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
              Top Companies Hiring Now
            </h1>
            <p className="text-base md:text-xl text-primary-100 mb-6 md:mb-8 px-4">
              Discover amazing companies and find your perfect workplace
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-lg p-2 flex flex-col sm:flex-row gap-2 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 md:py-3 rounded-lg focus:outline-none text-secondary-900 text-sm md:text-base"
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
                  className="w-full pl-10 pr-4 py-2.5 md:py-3 rounded-lg focus:outline-none text-secondary-900 text-sm md:text-base"
                />
              </div>
              <button
                onClick={() => fetchCompanies()}
                className="bg-primary-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-medium hover:bg-primary-700 transition-all text-sm md:text-base"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 mb-4 md:mb-6">
          <div className="p-3 md:p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 md:gap-2 text-secondary-600 hover:text-primary-600 transition-all text-sm md:text-base"
              >
                <FontAwesomeIcon
                  icon={faSlidersH}
                  className="text-xs md:text-sm"
                />
                <span>Filters</span>
                <FontAwesomeIcon
                  icon={showFilters ? faChevronUp : faChevronDown}
                  className="text-xs"
                />
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs md:text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-1 md:gap-2">
                <span className="text-xs md:text-sm text-secondary-500 hidden sm:inline">
                  View:
                </span>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 md:p-2 rounded ${viewMode === "grid" ? "bg-primary-50 text-primary-600" : "text-secondary-400"}`}
                >
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5"
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
                  className={`p-1.5 md:p-2 rounded ${viewMode === "list" ? "bg-primary-50 text-primary-600" : "text-secondary-400"}`}
                >
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5"
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
            <div className="border-t border-secondary-200 p-3 md:p-4 bg-secondary-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-secondary-700 mb-1 md:mb-2">
                    Industry
                  </label>
                  <select
                    value={industryFilter}
                    onChange={(e) => setIndustryFilter(e.target.value)}
                    className="w-full border border-secondary-200 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-sm focus:outline-none focus:border-primary-500"
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
                  <label className="block text-xs md:text-sm font-medium text-secondary-700 mb-1 md:mb-2">
                    Location
                  </label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full border border-secondary-200 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-sm focus:outline-none focus:border-primary-500"
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
                  <label className="block text-xs md:text-sm font-medium text-secondary-700 mb-1 md:mb-2">
                    Company Size
                  </label>
                  <select
                    value={sizeFilter}
                    onChange={(e) => setSizeFilter(e.target.value)}
                    className="w-full border border-secondary-200 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-sm focus:outline-none focus:border-primary-500"
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
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 md:mb-6">
          <p className="text-sm md:text-base text-secondary-600">
            Found{" "}
            <span className="font-semibold text-secondary-900">
              {filteredCompanies.length}
            </span>{" "}
            companies
            {hasActiveFilters && " matching your criteria"}
          </p>
        </div>

        {/* Companies Listings */}
        {filteredCompanies.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                : "space-y-3 md:space-y-4"
            }
          >
            {filteredCompanies.map((company) => (
              <div
                key={company._id || company.id}
                onClick={() => {
                  setSelectedCompany(company);
                  fetchCompanyJobs(company.name);
                }}
                className="bg-white rounded-xl shadow-sm border border-secondary-200 hover:shadow-md transition-all cursor-pointer group overflow-hidden"
              >
                {viewMode === "grid" ? (
                  // Grid View Card
                  <div className="p-4 md:p-6">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt={company.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://via.placeholder.com/64x64?text=${company.name?.charAt(0) || "C"}`;
                              }}
                            />
                          ) : (
                            <span className="text-2xl font-bold text-primary-600">
                              {company.name?.charAt(0) || "C"}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                            <h3 className="font-semibold text-secondary-900 text-sm md:text-lg">
                              {company.name}
                            </h3>
                            {company.verified && (
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="text-primary-500 text-xs md:text-sm"
                                title="Verified Company"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-secondary-600 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
                      {company.description}
                    </p>

                    <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                      <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-secondary-500">
                        <FontAwesomeIcon
                          icon={faBuilding}
                          className="w-3 h-3 md:w-4 md:h-4"
                        />
                        <span className="truncate">{company.industry}</span>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-secondary-500">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="w-3 h-3 md:w-4 md:h-4"
                        />
                        <span className="truncate">{company.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-secondary-500">
                        <FontAwesomeIcon
                          icon={faUsers}
                          className="w-3 h-3 md:w-4 md:h-4"
                        />
                        <span className="truncate">{company.size}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
                      {company.specialties
                        ?.slice(0, 2)
                        .map((specialty, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-secondary-100 text-secondary-600 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      {company.specialties?.length > 2 && (
                        <span className="text-xs bg-secondary-100 text-secondary-600 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                          +{company.specialties.length - 2}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-secondary-200">
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon
                          icon={faBriefcase}
                          className="text-primary-500 text-xs md:text-sm"
                        />
                        <span className="text-xs md:text-sm font-medium text-primary-600">
                          {company.openJobs || 0} open positions
                        </span>
                      </div>
                      {company.featured && (
                        <span className="bg-accent-100 text-accent-600 text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  // List View Card
                  <div className="p-3 md:p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://via.placeholder.com/64x64?text=${company.name?.charAt(0) || "C"}`;
                            }}
                          />
                        ) : (
                          <span className="text-2xl font-bold text-primary-600">
                            {company.name?.charAt(0) || "C"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 md:gap-2 flex-wrap mb-0.5 md:mb-1">
                          <h3 className="font-semibold text-secondary-900 text-sm md:text-base truncate">
                            {company.name}
                          </h3>
                          {company.verified && (
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="text-primary-500 text-xs"
                            />
                          )}
                        </div>
                        <p className="text-secondary-600 text-xs md:text-sm mb-1 md:mb-2 line-clamp-1 hidden sm:block">
                          {company.description}
                        </p>
                        <div className="flex flex-wrap gap-2 md:gap-3 text-xs text-secondary-500">
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faBuilding}
                              className="w-3 h-3"
                            />
                            <span className="hidden xs:inline">
                              {company.industry}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faMapMarkerAlt}
                              className="w-3 h-3"
                            />
                            <span className="truncate">{company.location}</span>
                          </span>
                          <span className="flex items-center gap-1 hidden sm:flex">
                            <FontAwesomeIcon
                              icon={faUsers}
                              className="w-3 h-3"
                            />
                            <span>{company.size}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faBriefcase}
                              className="w-3 h-3"
                            />
                            <span>{company.openJobs || 0} positions</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // No Results
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-8 md:p-12 text-center">
            <div className="text-5xl md:text-6xl mb-4">🏢</div>
            <h3 className="text-lg md:text-xl font-semibold text-secondary-900 mb-2">
              No companies found
            </h3>
            <p className="text-sm md:text-base text-secondary-500 mb-4">
              Try adjusting your search or filters
            </p>
            <button
              onClick={clearFilters}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm md:text-base"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Company Details Modal */}
      {selectedCompany && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4"
          onClick={() => setSelectedCompany(null)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-secondary-200 p-3 md:p-4 flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-bold text-secondary-900">
                Company Profile
              </h2>
              <button
                onClick={() => setSelectedCompany(null)}
                className="text-secondary-400 hover:text-secondary-600 p-1"
              >
                <FontAwesomeIcon
                  icon={faTimes}
                  className="text-lg md:text-xl"
                />
              </button>
            </div>
            <div className="p-4 md:p-6">
              {/* Company Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 mb-6">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  {selectedCompany.logo ? (
                    <img
                      src={selectedCompany.logo}
                      alt={selectedCompany.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-primary-600">
                      {selectedCompany.name?.charAt(0) || "C"}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="text-xl md:text-2xl font-bold text-secondary-900">
                      {selectedCompany.name}
                    </h3>
                    {selectedCompany.verified && (
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-primary-500"
                        title="Verified Company"
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 md:gap-4 text-sm text-secondary-600">
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faBuilding} />
                      {selectedCompany.industry}
                    </span>
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      {selectedCompany.location}
                    </span>
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faUsers} />
                      {selectedCompany.size}
                    </span>
                    {selectedCompany.founded && (
                      <span className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendar} />
                        Founded {selectedCompany.founded}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleViewJobs(selectedCompany)}
                  className="w-full sm:w-auto bg-primary-600 text-white px-4 md:px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-all text-sm md:text-base"
                >
                  View All Jobs ({selectedCompany.openJobs || 0})
                </button>
              </div>

              {/* Company Description */}
              <div className="mb-6">
                <h4 className="text-base md:text-lg font-semibold text-secondary-900 mb-2 md:mb-3">
                  About
                </h4>
                <p className="text-secondary-600 text-sm md:text-base leading-relaxed">
                  {selectedCompany.description}
                </p>
              </div>

              {/* Specialties */}
              {selectedCompany.specialties &&
                selectedCompany.specialties.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-base md:text-lg font-semibold text-secondary-900 mb-2 md:mb-3">
                      Specialties
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCompany.specialties.map((specialty, idx) => (
                        <span
                          key={idx}
                          className="bg-secondary-100 text-secondary-700 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm"
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
                  <div className="mb-6">
                    <h4 className="text-base md:text-lg font-semibold text-secondary-900 mb-2 md:mb-3">
                      Benefits & Perks
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCompany.benefits.map((benefit, idx) => (
                        <span
                          key={idx}
                          className="bg-green-50 text-green-600 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Jobs List */}
              <div className="mt-6">
                <h4 className="text-base md:text-lg font-semibold text-secondary-900 mb-3">
                  Open Positions
                </h4>
                {loadingJobs ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : companyJobs.length > 0 ? (
                  <div className="space-y-3">
                    {companyJobs.map((job) => (
                      <div
                        key={job._id || job.id}
                        onClick={() => handleViewJobDetails(job._id || job.id)}
                        className="border border-secondary-200 rounded-lg p-4 hover:bg-secondary-50 cursor-pointer transition-all"
                      >
                        <h5 className="font-semibold text-secondary-900">
                          {job.title}
                        </h5>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-secondary-500">
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary-500 text-sm">
                    No open positions at this time.
                  </p>
                )}
              </div>

              {/* Contact & Social */}
              <div className="pt-4 mt-6 border-t border-secondary-200">
                <h4 className="text-base md:text-lg font-semibold text-secondary-900 mb-2 md:mb-3">
                  Connect
                </h4>
                <div className="flex flex-wrap gap-3 md:gap-4">
                  {selectedCompany.website && (
                    <a
                      href={selectedCompany.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm md:text-base"
                    >
                      <FontAwesomeIcon icon={faGlobe} />
                      <span>Website</span>
                    </a>
                  )}
                  {selectedCompany.email && (
                    <a
                      href={`mailto:${selectedCompany.email}`}
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm md:text-base"
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
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm md:text-base"
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
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm md:text-base"
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
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm md:text-base"
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
