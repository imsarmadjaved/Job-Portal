import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faBriefcase,
  faClock,
  faDollarSign,
  faHeart,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";

function JobCard({
  job,
  viewMode = "grid",
  isSaved = false,
  onSave,
  onClick,
  companyLogo,
  index = 0,
}) {
  const jobId = job._id || job.id;

  const handleSave = (e) => {
    e.stopPropagation();
    onSave(jobId, isSaved);
  };

  if (viewMode === "grid") {
    return (
      <div
        className="bg-white rounded-xl shadow-md border border-secondary-200 hover:shadow-xl hover:border-primary-200 transition-all duration-300 group cursor-pointer transform hover:-translate-y-1 animate-slide-up"
        style={{ animationDelay: `${index * 50}ms` }}
        onClick={onClick}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-linear-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-all">
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
                <h3 className="font-bold text-secondary-900 mb-1 truncate group-hover:text-primary-600 transition-colors">
                  {job.title}
                </h3>
                <p className="text-sm text-secondary-600 truncate">
                  {job.company}
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              className="text-secondary-400 hover:text-red-500 transition-all p-2 hover:scale-110 transform"
            >
              <FontAwesomeIcon
                icon={faHeart}
                className={`text-lg ${isSaved ? "text-red-500" : ""}`}
              />
            </button>
          </div>

          <div className="space-y-2.5 mb-4">
            <div className="flex items-center gap-2 text-sm text-secondary-600">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="w-4 h-4 text-primary-500"
              />
              <span className="truncate">{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-secondary-600">
              <FontAwesomeIcon
                icon={faDollarSign}
                className="w-4 h-4 text-green-500"
              />
              <span className="truncate font-medium">{job.salary}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-secondary-600">
              <FontAwesomeIcon
                icon={faBriefcase}
                className="w-4 h-4 text-blue-500"
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
                  className="text-xs bg-linear-to-r from-secondary-100 to-secondary-50 text-secondary-700 px-2.5 py-1.5 rounded-full border border-secondary-200"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 3 && (
                <span className="text-xs bg-primary-50 text-primary-600 px-2.5 py-1.5 rounded-full border border-primary-200 font-medium">
                  +{job.skills.length - 3} more
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
            <div className="flex items-center gap-1.5 text-sm text-secondary-500">
              <FontAwesomeIcon icon={faClock} className="w-3.5 h-3.5" />
              <span>{new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
            {job.urgent && (
              <span className="bg-linear-to-r from-red-100 to-red-50 text-red-600 text-xs px-3 py-1.5 rounded-full font-semibold border border-red-200 animate-pulse-soft">
                Urgent
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div
      className="bg-white rounded-xl shadow-md border border-secondary-200 hover:shadow-xl hover:border-primary-200 transition-all duration-300 group cursor-pointer animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
    >
      <div className="p-5 flex items-center justify-between group-hover:bg-linear-to-r group-hover:from-primary-50/30 transition-all duration-300">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-14 h-14 bg-linear-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
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
              <h3 className="font-bold text-secondary-900 truncate group-hover:text-primary-600 transition-colors">
                {job.title}
              </h3>
              {job.urgent && (
                <span className="bg-linear-to-r from-red-100 to-red-50 text-red-600 text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 border border-red-200 animate-pulse-soft">
                  Urgent
                </span>
              )}
            </div>
            <p className="text-sm text-secondary-600 mb-2 truncate">
              {job.company}
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-secondary-500">
              <span className="flex items-center gap-1.5">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="w-3.5 h-3.5 text-primary-500"
                />
                {job.location}
              </span>
              <span className="flex items-center gap-1.5">
                <FontAwesomeIcon
                  icon={faDollarSign}
                  className="w-3.5 h-3.5 text-green-500"
                />
                {job.salary}
              </span>
              <span className="flex items-center gap-1.5">
                <FontAwesomeIcon
                  icon={faBriefcase}
                  className="w-3.5 h-3.5 text-blue-500"
                />
                {job.type}
              </span>
              <span className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={faClock} className="w-3.5 h-3.5" />
                {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="ml-4 text-secondary-400 hover:text-red-500 transition-all p-2 hover:scale-110 transform"
        >
          <FontAwesomeIcon
            icon={faHeart}
            className={`text-xl ${isSaved ? "text-red-500" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}

export default JobCard;
