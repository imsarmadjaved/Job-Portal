import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faMapMarkerAlt,
  faUsers,
  faCalendar,
  faGlobe,
  faPlus,
  faTrash,
  faEdit,
  faCheckCircle,
  faBriefcase,
  faLink,
  faInfoCircle,
  faExclamationCircle,
  faChevronLeft,
  faUpload,
  faTimes,
  faImage,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import {
  faLinkedin,
  faTwitter,
  faFacebook,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import {
  getMyCompany,
  createCompany,
  updateMyCompany,
  uploadCompanyLogo,
} from "../../services/companyService";
import { useAuth } from "../../context/AuthContext";

function CompanyProfile() {
  const navigate = useNavigate();
  const { user, updateUser, refreshCompanyData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [company, setCompany] = useState(null);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    location: "",
    size: "",
    founded: "",
    website: "",
    description: "",
    specialties: [""],
    benefits: [""],
    social: { linkedin: "", twitter: "", facebook: "", instagram: "" },
  });

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      setFetching(true);
      const response = await getMyCompany();
      if (response.success && response.company) {
        setCompany(response.company);
        setFormData({
          name: response.company.name || "",
          industry: response.company.industry || "",
          location: response.company.location || "",
          size: response.company.size || "",
          founded: response.company.founded || "",
          website: response.company.website || "",
          description: response.company.description || "",
          specialties: response.company.specialties?.length
            ? response.company.specialties
            : [""],
          benefits: response.company.benefits?.length
            ? response.company.benefits
            : [""],
          social: {
            linkedin: response.company.social?.linkedin || "",
            twitter: response.company.social?.twitter || "",
            facebook: response.company.social?.facebook || "",
            instagram: response.company.social?.instagram || "",
          },
        });
        setIsEditMode(false);
      } else {
        setCompany(null);
        setIsEditMode(true);
        if (user?.companyName)
          setFormData((prev) => ({ ...prev, name: user.companyName }));
      }
    } catch (err) {
      setCompany(null);
      setIsEditMode(true);
      if (user?.companyName)
        setFormData((prev) => ({ ...prev, name: user.companyName }));
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSocialChange = (platform, value) => {
    setFormData({
      ...formData,
      social: { ...formData.social, [platform]: value },
    });
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/svg+xml",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, SVG, WEBP)");
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      setError("File size must be less than 1MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
    setLogoFile(file);
    setError("");
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    const fileInput = document.getElementById("logo-upload");
    if (fileInput) fileInput.value = "";
    if (company?.logo) {
      setCompany((prev) => ({ ...prev, logo: null }));
      setFormData((prev) => ({ ...prev, removeLogo: true }));
    }
  };

  const handleArrayChange = (index, field, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field) =>
    setFormData({ ...formData, [field]: [...formData[field], ""] });

  const removeArrayField = (index, field) => {
    const newArray = [...formData[field]];
    newArray.splice(index, 1);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const companyData = {
        ...formData,
        specialties: formData.specialties.filter((s) => s.trim() !== ""),
        benefits: formData.benefits.filter((b) => b.trim() !== ""),
      };
      delete companyData.removeLogo;

      let response;
      if (company) {
        response = await updateMyCompany(companyData);
        setSuccess("Company profile updated successfully!");
        if (logoFile) {
          setUploadingLogo(true);
          try {
            await uploadCompanyLogo(logoFile);
            const refreshed = await getMyCompany();
            if (refreshed.success) setCompany(refreshed.company);
          } catch (err) {
            setError("Company saved but logo upload failed: " + err.message);
          } finally {
            setUploadingLogo(false);
          }
        }
        if (formData.removeLogo && company.logo) {
          await updateMyCompany({ logo: null });
        }
      } else {
        response = await createCompany(companyData);
        setSuccess("Company profile created successfully!");
        if (logoFile && response.company) {
          setUploadingLogo(true);
          try {
            await uploadCompanyLogo(logoFile);
          } catch (err) {
            setError("Company created but logo upload failed: " + err.message);
          } finally {
            setUploadingLogo(false);
          }
        }
      }

      const refreshed = await getMyCompany();
      if (refreshed.success) setCompany(refreshed.company);
      if (response.company && updateUser)
        updateUser({ ...user, companyName: response.company.name });
      refreshCompanyData();

      setLogoFile(null);
      setLogoPreview(null);
      const fileInput = document.getElementById("logo-upload");
      if (fileInput) fileInput.value = "";
      setIsEditMode(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save company profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setLogoFile(null);
    setLogoPreview(null);
    const fileInput = document.getElementById("logo-upload");
    if (fileInput) fileInput.value = "";
    setFormData((prev) => ({ ...prev, removeLogo: false }));
    setIsEditMode(true);
  };

  const handleCancel = () => {
    if (company) {
      setFormData({
        name: company.name || "",
        industry: company.industry || "",
        location: company.location || "",
        size: company.size || "",
        founded: company.founded || "",
        website: company.website || "",
        description: company.description || "",
        specialties: company.specialties?.length ? company.specialties : [""],
        benefits: company.benefits?.length ? company.benefits : [""],
        social: {
          linkedin: company.social?.linkedin || "",
          twitter: company.social?.twitter || "",
          facebook: company.social?.facebook || "",
          instagram: company.social?.instagram || "",
        },
        removeLogo: false,
      });
    }
    setLogoFile(null);
    setLogoPreview(null);
    const fileInput = document.getElementById("logo-upload");
    if (fileInput) fileInput.value = "";
    setIsEditMode(false);
  };

  const sizeOptions = [
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "501-1000",
    "1000+",
  ];
  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Retail",
    "Manufacturing",
    "Consulting",
    "Media",
    "Real Estate",
    "Transportation",
    "Energy",
    "Hospitality",
    "Nonprofit",
    "Other",
  ];

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading Companies...</p>
        </div>
      </div>
    );
  }

  // View Mode
  if (!isEditMode && company) {
    return (
      <div className="px-3 sm:px-5 lg:px-6 py-5 max-w-8xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/employer/dashboard")}
            className="text-secondary-500 hover:text-primary-600 mb-4 inline-flex items-center gap-2 text-sm"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-xs" /> Back to
            Dashboard
          </button>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-secondary-900">
                Company Profile
              </h1>
              <p className="text-secondary-500 text-sm mt-1">
                View your company information
              </p>
            </div>
            <button
              onClick={handleEdit}
              className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all"
            >
              <FontAwesomeIcon icon={faEdit} className="text-sm" /> Edit Profile
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm flex items-center gap-2">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-emerald-500"
            />{" "}
            {success}
          </div>
        )}

        {/* Company Header */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-5 sm:p-6 mb-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-linear-to-br from-primary-50 to-primary-100 border border-primary-200 flex items-center justify-center">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt=""
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
              <h2 className="text-xl font-bold text-secondary-900">
                {company.name}
              </h2>
              <p className="text-secondary-500 text-sm">{company.industry}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs bg-secondary-50 text-secondary-600 px-2.5 py-1 rounded-full border border-secondary-200 flex items-center gap-1">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3" />
                  {company.location}
                </span>
                <span className="text-xs bg-secondary-50 text-secondary-600 px-2.5 py-1 rounded-full border border-secondary-200 flex items-center gap-1">
                  <FontAwesomeIcon icon={faUsers} className="w-3 h-3" />
                  {company.size} employees
                </span>
                {company.founded && (
                  <span className="text-xs bg-secondary-50 text-secondary-600 px-2.5 py-1 rounded-full border border-secondary-200">
                    <FontAwesomeIcon
                      icon={faCalendar}
                      className="w-3 h-3 mr-1"
                    />
                    {company.founded}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-5 sm:p-6 mb-5">
          <h3 className="font-semibold text-secondary-900 mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faBriefcase} className="text-primary-500" />
            About
          </h3>
          <p className="text-secondary-600 text-sm leading-relaxed">
            {company.description}
          </p>
        </div>

        {/* Specialties */}
        {company.specialties?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-5 sm:p-6 mb-5">
            <h3 className="font-semibold text-secondary-900 mb-3">
              Specialties
            </h3>
            <div className="flex flex-wrap gap-2">
              {company.specialties.map((spec, idx) => (
                <span
                  key={idx}
                  className="bg-secondary-50 text-secondary-700 px-3 py-1.5 rounded-full text-xs border border-secondary-200"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Benefits */}
        {company.benefits?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-5 sm:p-6 mb-5">
            <h3 className="font-semibold text-secondary-900 mb-3">Benefits</h3>
            <div className="flex flex-wrap gap-2">
              {company.benefits.map((benefit, idx) => (
                <span
                  key={idx}
                  className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs border border-emerald-200"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Social Links */}
        {(company.website ||
          company.social?.linkedin ||
          company.social?.twitter ||
          company.social?.facebook ||
          company.social?.instagram) && (
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-5 sm:p-6">
            <h3 className="font-semibold text-secondary-900 mb-3">Connect</h3>
            <div className="flex flex-wrap gap-4">
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 transition-all"
                >
                  <FontAwesomeIcon icon={faGlobe} /> Website
                </a>
              )}
              {company.social?.linkedin && (
                <a
                  href={company.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 transition-all"
                >
                  <FontAwesomeIcon icon={faLinkedin} className="text-xl" />
                </a>
              )}
              {company.social?.twitter && (
                <a
                  href={company.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 transition-all"
                >
                  <FontAwesomeIcon icon={faTwitter} className="text-xl" />
                </a>
              )}
              {company.social?.facebook && (
                <a
                  href={company.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 transition-all"
                >
                  <FontAwesomeIcon icon={faFacebook} className="text-xl" />
                </a>
              )}
              {company.social?.instagram && (
                <a
                  href={company.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 transition-all"
                >
                  <FontAwesomeIcon icon={faInstagram} className="text-xl" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Edit/Create Mode
  return (
    <div className="px-3 sm:px-5 lg:px-6 py-5 max-w-8xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/employer/dashboard")}
          className="text-secondary-500 hover:text-primary-600 mb-4 inline-flex items-center gap-2 text-sm"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-xs" /> Back to
          Dashboard
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-secondary-900">
          {company ? "Edit Company Profile" : "Create Company Profile"}
        </h1>
        <p className="text-secondary-500 text-sm mt-1">
          {company
            ? "Update your company information"
            : "Create your company profile to start posting jobs"}
        </p>
      </div>

      {!company && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm flex items-start gap-3">
          <FontAwesomeIcon
            icon={faExclamationCircle}
            className="text-amber-500 mt-0.5"
          />
          <div>
            <p className="font-medium">No company profile found</p>
            <p className="text-xs mt-1">
              Fill out the form below to create your company profile.
            </p>
          </div>
        </div>
      )}

      {!company && user?.companyName && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm flex items-start gap-3">
          <FontAwesomeIcon
            icon={faInfoCircle}
            className="text-blue-500 mt-0.5"
          />
          <div>
            <p className="font-medium">
              Company name auto-filled: <strong>{user.companyName}</strong>
            </p>
            <p className="text-xs mt-1">You can update this below.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm flex items-center gap-2">
          <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" />
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-secondary-200 p-5 sm:p-6"
      >
        <div className="space-y-5">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
              Company Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FontAwesomeIcon
                icon={faBuilding}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
              />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-200 text-sm"
                placeholder="Your company name"
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
              Company Logo
            </label>
            <div className="flex items-start gap-4">
              <div className="relative">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt=""
                    className="w-20 h-20 rounded-lg object-cover border border-secondary-200"
                  />
                ) : company?.logo ? (
                  <img
                    src={company.logo}
                    alt=""
                    className="w-20 h-20 rounded-lg object-cover border border-secondary-200"
                  />
                ) : (
                  <div className="w-20 h-20 bg-secondary-50 rounded-lg border-2 border-dashed border-secondary-200 flex flex-col items-center justify-center">
                    <FontAwesomeIcon
                      icon={faImage}
                      className="text-secondary-400 text-xl mb-1"
                    />
                    <span className="text-xs text-secondary-400">No logo</span>
                  </div>
                )}
                {(logoPreview || company?.logo) && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-all"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-xs" />
                  </button>
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp"
                  onChange={handleLogoSelect}
                  className="hidden"
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer inline-flex items-center gap-2 bg-white border border-secondary-200 rounded-lg px-4 py-2 text-sm hover:bg-secondary-50 transition-all"
                >
                  <FontAwesomeIcon icon={faUpload} /> Choose Logo
                </label>
                <p className="text-xs text-secondary-400 mt-2">
                  Square image, max 1MB (JPEG, PNG, SVG, WEBP)
                </p>
                {logoFile && (
                  <p className="text-xs text-primary-600 mt-1">
                    ✓ Will upload when you save
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Industry <span className="text-red-500">*</span>
              </label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm bg-white"
              >
                <option value="">Select Industry</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Company Size <span className="text-red-500">*</span>
              </label>
              <select
                name="size"
                value={formData.size}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm bg-white"
              >
                <option value="">Select Size</option>
                {sizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} employees
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Founded Year
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faCalendar}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                />
                <input
                  type="text"
                  name="founded"
                  value={formData.founded}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  placeholder="e.g., 2015"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Website
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faGlobe}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 resize-none text-sm"
                placeholder="Tell us about your company..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-secondary-100">
            <button
              type="submit"
              disabled={loading || uploadingLogo}
              className="bg-primary-600 hover:bg-primary-700 text-white py-2.5 px-6 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 order-2 sm:order-1 transition-all"
            >
              {loading || uploadingLogo ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />{" "}
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} />{" "}
                  {company ? "Update Profile" : "Create Profile"}
                </>
              )}
            </button>
            {company && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 border border-secondary-200 rounded-lg text-secondary-600 hover:bg-secondary-50 transition-all text-sm font-medium order-1 sm:order-2"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default CompanyProfile;
