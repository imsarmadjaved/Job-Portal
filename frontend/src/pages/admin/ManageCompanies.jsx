import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faEye,
  faTrash,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faBuilding,
  faMapMarkerAlt,
  faUsers,
  faGlobe,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  faLinkedin,
  faTwitter,
  faFacebook,
} from "@fortawesome/free-brands-svg-icons";
import {
  getAdminCompanies,
  verifyAdminCompany,
  unverifyAdminCompany,
  deleteAdminCompany,
} from "../../services/adminService";
import ConfirmModal from "../components/ConfirmationModel";

function ManageCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
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
    fetchCompanies();
  }, [pagination.page, verifiedFilter]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      let verifiedParam = null;
      if (verifiedFilter === "verified") verifiedParam = "true";
      if (verifiedFilter === "unverified") verifiedParam = "false";

      const response = await getAdminCompanies({
        verified: verifiedParam,
        search: searchTerm,
        page: pagination.page,
        limit: 10,
      });
      if (response.success) {
        setCompanies(response.companies);
        setPagination({
          page: response.page,
          total: response.total,
          pages: response.pages,
        });
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
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
    fetchCompanies();
  };

  const handleVerify = async (companyId, companyName) => {
    const confirmed = await showConfirmation({
      type: "success",
      title: "Verify Company",
      message: `Are you sure you want to verify "${companyName}"?`,
      details:
        "Verified companies appear as trusted employers and can post jobs immediately.",
      confirmText: "Verify Company",
    });

    if (!confirmed) return;

    setUpdatingId(companyId);
    try {
      const response = await verifyAdminCompany(companyId);
      if (response.success) {
        setCompanies(
          companies.map((c) =>
            c._id === companyId ? { ...c, verified: true } : c,
          ),
        );
        if (selectedCompany?._id === companyId) {
          setSelectedCompany({ ...selectedCompany, verified: true });
        }
      }
    } catch (err) {
      alert("Failed to verify company");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUnverify = async (companyId, companyName) => {
    const confirmed = await showConfirmation({
      type: "warning",
      title: "Unverify Company",
      message: `Are you sure you want to unverify "${companyName}"?`,
      details: "Unverified companies may lose trust badges and features.",
      confirmText: "Unverify Company",
    });

    if (!confirmed) return;

    setUpdatingId(companyId);
    try {
      const response = await unverifyAdminCompany(companyId);
      if (response.success) {
        setCompanies(
          companies.map((c) =>
            c._id === companyId ? { ...c, verified: false } : c,
          ),
        );
        if (selectedCompany?._id === companyId) {
          setSelectedCompany({ ...selectedCompany, verified: false });
        }
      }
    } catch (err) {
      alert("Failed to unverify company");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (companyId, companyName) => {
    const confirmed = await showConfirmation({
      type: "danger",
      title: "Delete Company",
      message: `Are you sure you want to delete "${companyName}"?`,
      details:
        "This will permanently delete:\n• The company profile\n• All jobs posted by this company\n• All applications for those jobs\n\nThis action CANNOT be undone.",
      confirmText: "Delete Company",
    });

    if (!confirmed) return;

    setDeletingId(companyId);
    try {
      const response = await deleteAdminCompany(companyId);
      if (response.success) {
        setCompanies(companies.filter((c) => c._id !== companyId));
        if (selectedCompany?._id === companyId) {
          setShowViewModal(false);
          setSelectedCompany(null);
        }
      }
    } catch (err) {
      alert("Failed to delete company");
    } finally {
      setDeletingId(null);
    }
  };

  const getVerifiedBadge = (verified) => {
    return verified ? (
      <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 flex items-center gap-1.5 w-fit font-medium">
        <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" />
        Verified
      </span>
    ) : (
      <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 flex items-center gap-1.5 w-fit font-medium">
        <FontAwesomeIcon icon={faTimesCircle} className="w-3 h-3" />
        Unverified
      </span>
    );
  };

  const verifiedCounts = {
    all: companies.length,
    verified: companies.filter((c) => c.verified).length,
    unverified: companies.filter((c) => !c.verified).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading Companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-secondary-900">
          Manage Companies
        </h1>
        <p className="text-secondary-500 text-sm mt-1">
          View, verify, and manage all company profiles
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
              placeholder="Search by company name..."
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
            {Object.entries(verifiedCounts).map(([key, count]) => (
              <button
                key={key}
                type="button"
                onClick={() => setVerifiedFilter(key)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  verifiedFilter === key
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
                }`}
              >
                {key === "all"
                  ? "All"
                  : key === "verified"
                    ? "Verified"
                    : "Unverified"}
                <span
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${verifiedFilter === key ? "bg-white/20" : "bg-secondary-200"}`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Industry
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider hidden lg:table-cell">
                  Size
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Verified
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {companies.length > 0 ? (
                companies.map((company) => (
                  <tr
                    key={company._id}
                    className="hover:bg-secondary-50 transition-all"
                  >
                    <td className="px-4 sm:px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faBuilding}
                                className="text-primary-500"
                              />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900 text-sm">
                            {company.name}
                          </p>
                          {company.website && (
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary-600 hover:underline"
                            >
                              {company.website.replace(/^https?:\/\//, "")}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-4 text-sm text-secondary-600">
                      {company.industry || "—"}
                    </td>
                    <td className="px-4 sm:px-5 py-4 text-sm text-secondary-600">
                      {company.location || "—"}
                    </td>
                    <td className="px-4 sm:px-5 py-4 text-sm text-secondary-600 hidden lg:table-cell">
                      {company.size || "—"}
                    </td>
                    <td className="px-4 sm:px-5 py-4">
                      <p className="text-sm text-secondary-900">
                        {company.user?.name || "—"}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {company.user?.email || "—"}
                      </p>
                    </td>
                    <td className="px-4 sm:px-5 py-4">
                      {getVerifiedBadge(company.verified)}
                    </td>
                    <td className="px-4 sm:px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedCompany(company);
                            setShowViewModal(true);
                          }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          title="View"
                        >
                          <FontAwesomeIcon icon={faEye} className="text-sm" />
                        </button>
                        {!company.verified ? (
                          <button
                            onClick={() =>
                              handleVerify(company._id, company.name)
                            }
                            disabled={updatingId === company._id}
                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50"
                            title="Verify"
                          >
                            {updatingId === company._id ? (
                              <FontAwesomeIcon
                                icon={faSpinner}
                                className="animate-spin text-sm"
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="text-sm"
                              />
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleUnverify(company._id, company.name)
                            }
                            disabled={updatingId === company._id}
                            className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-lg transition-all disabled:opacity-50"
                            title="Unverify"
                          >
                            {updatingId === company._id ? (
                              <FontAwesomeIcon
                                icon={faSpinner}
                                className="animate-spin text-sm"
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon={faTimesCircle}
                                className="text-sm"
                              />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleDelete(company._id, company.name)
                          }
                          disabled={deletingId === company._id}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === company._id ? (
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
                    colSpan="7"
                    className="px-5 py-16 text-center text-secondary-500"
                  >
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className="text-4xl text-secondary-300 mb-3"
                    />
                    <p className="text-base font-medium text-secondary-700">
                      No companies found
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
      {showViewModal && selectedCompany && (
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
                {selectedCompany.name}
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="w-8 h-8 rounded-full hover:bg-secondary-100 flex items-center justify-center text-secondary-500 hover:text-secondary-700 transition-all"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
                  {selectedCompany.logo ? (
                    <img
                      src={selectedCompany.logo}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faBuilding}
                        className="text-primary-500 text-2xl"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getVerifiedBadge(selectedCompany.verified)}
                  </div>
                  <p className="text-secondary-600">
                    {selectedCompany.industry}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <div className="bg-secondary-50 p-3 rounded-xl">
                  <div className="text-xs text-secondary-500 mb-1">
                    Location
                  </div>
                  <div className="text-sm font-medium">
                    {selectedCompany.location || "—"}
                  </div>
                </div>
                <div className="bg-secondary-50 p-3 rounded-xl">
                  <div className="text-xs text-secondary-500 mb-1">Size</div>
                  <div className="text-sm font-medium">
                    {selectedCompany.size || "—"}
                  </div>
                </div>
                <div className="bg-secondary-50 p-3 rounded-xl">
                  <div className="text-xs text-secondary-500 mb-1">Founded</div>
                  <div className="text-sm font-medium">
                    {selectedCompany.founded || "—"}
                  </div>
                </div>
                <div className="bg-secondary-50 p-3 rounded-xl">
                  <div className="text-xs text-secondary-500 mb-1">Website</div>
                  {selectedCompany.website ? (
                    <a
                      href={selectedCompany.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:underline"
                    >
                      {selectedCompany.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    <span className="text-sm text-secondary-400">—</span>
                  )}
                </div>
              </div>

              <div className="mb-5">
                <h4 className="font-semibold text-secondary-900 mb-2">About</h4>
                <p className="text-secondary-600 text-sm">
                  {selectedCompany.description || "No description"}
                </p>
              </div>

              {selectedCompany.specialties?.length > 0 && (
                <div className="mb-5">
                  <h4 className="font-semibold text-secondary-900 mb-2">
                    Specialties
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.specialties.map((s, i) => (
                      <span
                        key={i}
                        className="bg-secondary-100 text-secondary-700 px-3 py-1.5 rounded-full text-xs border border-secondary-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCompany.benefits?.length > 0 && (
                <div className="mb-5">
                  <h4 className="font-semibold text-secondary-900 mb-2">
                    Benefits
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.benefits.map((b, i) => (
                      <span
                        key={i}
                        className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs border border-green-200"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-secondary-100 pt-4">
                <h4 className="font-semibold text-secondary-900 mb-2">Owner</h4>
                <p className="text-sm font-medium">
                  {selectedCompany.user?.name || "—"}
                </p>
                <p className="text-xs text-secondary-500">
                  {selectedCompany.user?.email || "—"}
                </p>
              </div>

              {/* Social Links */}
              {(selectedCompany.social?.linkedin ||
                selectedCompany.social?.twitter ||
                selectedCompany.social?.facebook) && (
                <div className="border-t border-secondary-100 pt-4 mt-4">
                  <h4 className="font-semibold text-secondary-900 mb-2">
                    Social Media
                  </h4>
                  <div className="flex gap-3">
                    {selectedCompany.social?.linkedin && (
                      <a
                        href={selectedCompany.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <FontAwesomeIcon
                          icon={faLinkedin}
                          className="text-xl"
                        />
                      </a>
                    )}
                    {selectedCompany.social?.twitter && (
                      <a
                        href={selectedCompany.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <FontAwesomeIcon icon={faTwitter} className="text-xl" />
                      </a>
                    )}
                    {selectedCompany.social?.facebook && (
                      <a
                        href={selectedCompany.social.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <FontAwesomeIcon
                          icon={faFacebook}
                          className="text-xl"
                        />
                      </a>
                    )}
                  </div>
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

export default ManageCompanies;
