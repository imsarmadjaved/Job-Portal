import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faBuilding,
  faMapMarkerAlt,
  faDollarSign,
  faBriefcase,
  faClock,
  faHeart,
  faGraduationCap,
  faAward,
} from "@fortawesome/free-solid-svg-icons";

function JobDetailModal({
  job,
  isSaved = false,
  onSave,
  onApply,
  onClose,
  companyLogo,
}) {
  const jobId = job._id || job.id;

  const handleSave = (e) => {
    e.stopPropagation();
    onSave(jobId, isSaved);
  };

  const handleApply = () => {
    onApply(job);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-secondary-200 p-5 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-secondary-900">Job Details</h2>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 p-2 rounded-lg hover:bg-secondary-100 transition-all"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Company and Title Section */}
          <div className="flex items-center gap-5 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={job.company}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FontAwesomeIcon
                  icon={faBuilding}
                  className="text-primary-500 text-3xl"
                />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-1">
                {job.title}
              </h3>
              <p className="text-secondary-600 text-lg">{job.company}</p>
            </div>
          </div>

          {/* Job Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-secondary-50 to-white p-4 rounded-xl border border-secondary-200">
              <div className="text-xs text-secondary-500 mb-1">Location</div>
              <div className="text-sm font-semibold flex items-center gap-1.5">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="text-primary-500 text-xs"
                />
                {job.location}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-200">
              <div className="text-xs text-secondary-500 mb-1">Salary</div>
              <div className="text-sm font-semibold text-green-600 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faDollarSign} className="text-xs" />
                {job.salary}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-200">
              <div className="text-xs text-secondary-500 mb-1">Job Type</div>
              <div className="text-sm font-semibold text-blue-600 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faBriefcase} className="text-xs" />
                {job.type}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-200">
              <div className="text-xs text-secondary-500 mb-1">Experience</div>
              <div className="text-sm font-semibold text-purple-600 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faAward} className="text-xs" />
                {job.experience}
              </div>
            </div>
          </div>

          {/* Posted Date */}
          <div className="flex items-center gap-2 text-sm text-secondary-500 mb-6">
            <FontAwesomeIcon icon={faClock} className="text-xs" />
            <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h4 className="font-bold text-secondary-900 mb-3 text-lg">
              Description
            </h4>
            <p className="text-secondary-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="mb-8">
              <h4 className="font-bold text-secondary-900 mb-3 text-lg">
                Requirements
              </h4>
              <ul className="space-y-2">
                {job.requirements.map((req, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-secondary-600"
                  >
                    <span className="text-primary-600 mt-1.5 text-sm">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="mb-8">
              <h4 className="font-bold text-secondary-900 mb-3 text-lg">
                Benefits
              </h4>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((benefit, idx) => (
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

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="mb-8">
              <h4 className="font-bold text-secondary-900 mb-3 text-lg">
                Skills Required
              </h4>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-gradient-to-r from-secondary-100 to-secondary-50 text-secondary-700 px-4 py-2 rounded-full text-sm font-medium border border-secondary-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education & Experience */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-secondary-200 mb-6">
            <div>
              <div className="flex items-center gap-2 text-secondary-500 mb-1">
                <FontAwesomeIcon icon={faGraduationCap} className="text-sm" />
                <span className="text-xs font-medium">Education</span>
              </div>
              <p className="text-secondary-900 font-semibold">
                {job.education || "Not specified"}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-secondary-500 mb-1">
                <FontAwesomeIcon icon={faAward} className="text-sm" />
                <span className="text-xs font-medium">Experience Level</span>
              </div>
              <p className="text-secondary-900 font-semibold">
                {job.experience}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleApply}
              className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3.5 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-[1.02] shadow-lg"
            >
              Apply Now
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3.5 border-2 border-secondary-200 rounded-xl hover:bg-secondary-50 transition-all transform hover:scale-105"
            >
              <FontAwesomeIcon
                icon={faHeart}
                className={`text-xl ${isSaved ? "text-red-500" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetailModal;
