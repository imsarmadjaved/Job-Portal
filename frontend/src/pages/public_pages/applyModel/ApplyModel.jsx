import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faFileAlt,
  faUpload,
  faCheckCircle,
  faSpinner,
  faTrash,
  faBuilding,
  faMapMarkerAlt,
  faDollarSign,
  faBriefcase,
  faFilePdf,
  faTag,
  faGift,
  faCode,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import { applyForJob } from "../../../services/applicationService";
import { uploadResume, getStoredUser } from "../../../services/authService";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

function ApplyModal({ job, onClose, onSuccess }) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const [useExistingResume, setUseExistingResume] = useState(false);
  const [hasExistingResume, setHasExistingResume] = useState(false);
  const [existingResumeUrl, setExistingResumeUrl] = useState(null);
  const [existingResumeName, setExistingResumeName] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    checkExistingResume();
  }, [user]);

  const checkExistingResume = () => {
    const storedUser = getStoredUser();
    const currentUser = user || storedUser;

    if (currentUser?.resume) {
      setHasExistingResume(true);
      setExistingResumeUrl(currentUser.resume);
      setExistingResumeName(currentUser.resumeFileName || "Your Resume");
      setUseExistingResume(true);
    } else {
      setHasExistingResume(false);
      setExistingResumeUrl(null);
      setExistingResumeName("");
      setUseExistingResume(false);
    }
  };

  const handleResumeSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid file (PDF, DOC, DOCX)");
      return;
    }

    setResumeFile(file);
    setResumeName(file.name);
    setUseExistingResume(false);
  };

  const handleRemoveNewResume = () => {
    setResumeFile(null);
    setResumeName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (hasExistingResume) setUseExistingResume(true);
  };

  const handleUseExistingResume = () => {
    setUseExistingResume(true);
    setResumeFile(null);
    setResumeName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!coverLetter.trim()) {
      toast.error("Please write a cover letter");
      return;
    }

    if (!useExistingResume && !resumeFile) {
      toast.error("Please upload your resume");
      return;
    }

    if (useExistingResume && !existingResumeUrl) {
      toast.error("Please select or upload a resume");
      return;
    }

    setLoading(true);

    try {
      let finalResumeUrl = existingResumeUrl;

      if (!useExistingResume && resumeFile) {
        try {
          const uploadResponse = await uploadResume(resumeFile);
          if (uploadResponse.success) {
            finalResumeUrl = uploadResponse.resume.url;
            updateUser(uploadResponse.user);
            toast.success("Resume uploaded!");
          } else {
            throw new Error("Resume upload failed");
          }
        } catch (error) {
          toast.error(error.message || "Failed to upload resume");
          setLoading(false);
          return;
        }
      }

      const applicationData = {
        jobId: job._id || job.id,
        coverLetter: coverLetter,
        resume: finalResumeUrl,
      };

      console.log("Submitting application:", applicationData);

      const response = await applyForJob(applicationData);

      if (response.success) {
        toast.success("Application submitted successfully!");
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Job data received:", job);
    console.log("Skills:", job?.skills);
    console.log("Benefits:", job?.benefits);
  }, [job]);

  const handleViewResume = (url) => window.open(url, "_blank");

  if (!job) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-secondary-100 px-5 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-secondary-900">
            Apply for {job?.title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-secondary-100 flex items-center justify-center text-secondary-500"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          {/* Job Summary */}
          <div className="bg-secondary-50 rounded-xl p-4 mb-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faBuilding}
                  className="text-primary-500"
                />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900">
                  {job?.title}
                </h3>
                <p className="text-sm text-secondary-600">{job?.company}</p>
              </div>
            </div>

            {/* Job Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-secondary-600">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs" />
                <span>{job?.location}</span>
              </div>
              <div className="flex items-center gap-2 text-secondary-600">
                <FontAwesomeIcon icon={faDollarSign} className="text-xs" />
                <span>{job?.salary}</span>
              </div>
              <div className="flex items-center gap-2 text-secondary-600">
                <FontAwesomeIcon icon={faBriefcase} className="text-xs" />
                <span>{job?.type}</span>
              </div>
              <div className="flex items-center gap-2 text-secondary-600">
                <FontAwesomeIcon icon={faGraduationCap} className="text-xs" />
                <span>{job?.experience}</span>
              </div>
            </div>

            {/* Skills Section */}
            {job?.skills && job.skills.length > 0 && (
              <div className="mt-3 pt-3 border-t border-secondary-200">
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon
                    icon={faCode}
                    className="text-primary-500 text-xs"
                  />
                  <span className="text-xs font-medium text-secondary-700">
                    Required Skills:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits Section */}
            {job?.benefits && job.benefits.length > 0 && (
              <div className="mt-3 pt-3 border-t border-secondary-200">
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon
                    icon={faGift}
                    className="text-green-500 text-xs"
                  />
                  <span className="text-xs font-medium text-secondary-700">
                    Benefits & Perks:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {job.benefits.map((benefit, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resume Section */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Resume <span className="text-red-500">*</span>
            </label>

            {hasExistingResume && (
              <div className="mb-3">
                <button
                  type="button"
                  onClick={handleUseExistingResume}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                    useExistingResume
                      ? "border-primary-500 bg-primary-50"
                      : "border-secondary-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon
                        icon={faFilePdf}
                        className="text-green-600 text-lg"
                      />
                      <div>
                        <p className="font-medium text-secondary-900">
                          Use existing resume
                        </p>
                        <p className="text-sm text-secondary-500">
                          {existingResumeName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewResume(existingResumeUrl);
                        }}
                        className="text-primary-500 text-sm underline"
                      >
                        View
                      </button>
                      {useExistingResume && (
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="text-primary-500"
                        />
                      )}
                    </div>
                  </div>
                </button>
              </div>
            )}

            {hasExistingResume && (
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-xs text-secondary-400">
                    OR
                  </span>
                </div>
              </div>
            )}

            <div>
              {!resumeFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                    !useExistingResume && !hasExistingResume
                      ? "border-primary-400 bg-primary-50"
                      : "border-secondary-200"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faUpload}
                    className="text-secondary-400 text-xl mb-1"
                  />
                  <p className="text-secondary-600 font-medium text-sm">
                    {hasExistingResume
                      ? "Upload new resume"
                      : "Upload your resume"}
                  </p>
                  <p className="text-xs text-secondary-400 mt-1">
                    PDF, DOC, DOCX (Max 5MB)
                  </p>
                </button>
              ) : (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faFileAlt}
                        className="text-primary-600"
                      />
                      <span className="text-sm text-secondary-700">
                        {resumeName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveNewResume}
                      className="text-red-500 p-1"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.doc,.docx"
              onChange={handleResumeSelect}
              className="hidden"
            />
          </div>

          {/* Cover Letter */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Cover Letter <span className="text-red-500">*</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:border-primary-500 resize-none text-sm"
              placeholder="Tell the employer why you're a great fit for this position..."
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-secondary-100">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />{" "}
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-secondary-200 rounded-lg text-secondary-600 hover:bg-secondary-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApplyModal;
