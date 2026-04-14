import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faUsers,
  faEye,
  faChartLine,
  faArrowRight,
  faUserPlus,
  faBuilding,
  faSpinner,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { getMyJobs } from "../../services/jobService";
import { getJobApplications } from "../../services/applicationService";
import { useAuth } from "../../context/AuthContext";

function EmployerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplicants: 0,
    pendingApplications: 0,
    shortlistedApplications: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const jobsResponse = await getMyJobs();

      if (jobsResponse.success) {
        const jobsData = jobsResponse.jobs || [];
        const activeJobsCount = jobsData.filter(
          (job) => job.status === "active",
        ).length;

        let allApplicants = [];
        let totalApplicants = 0;
        let pendingCount = 0;
        let shortlistedCount = 0;

        for (const job of jobsData) {
          try {
            const jobId = job._id || job.id;
            const appsResponse = await getJobApplications(jobId);

            if (appsResponse.success && appsResponse.applications) {
              const applications = appsResponse.applications;
              totalApplicants += applications.length;
              pendingCount += applications.filter(
                (app) => app.status === "pending",
              ).length;
              shortlistedCount += applications.filter(
                (app) => app.status === "shortlisted",
              ).length;

              const appsWithJobInfo = applications.map((app) => ({
                ...app,
                jobTitle: job.title,
                jobId: jobId,
              }));

              allApplicants = [...allApplicants, ...appsWithJobInfo];
            }
          } catch (err) {
            console.error(`Error fetching apps for job ${job.title}:`, err);
          }
        }

        const sortedApplicants = allApplicants
          .sort(
            (a, b) =>
              new Date(b.appliedAt || b.createdAt) -
              new Date(a.appliedAt || a.createdAt),
          )
          .slice(0, 4);

        setJobs(jobsData.slice(0, 4));
        setRecentApplicants(sortedApplicants);

        setStats({
          totalJobs: jobsData.length,
          activeJobs: activeJobsCount,
          totalApplicants,
          pendingApplications: pendingCount,
          shortlistedApplications: shortlistedCount,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-emerald-100 text-emerald-700",
      pending: "bg-amber-100 text-amber-700",
      closed: "bg-gray-100 text-gray-600",
    };
    const labels = {
      active: "Active",
      pending: "Pending",
      closed: "Closed",
    };
    return (
      <span
        className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[status] || styles.pending}`}
      >
        {labels[status] || "Pending"}
      </span>
    );
  };

  const getAppStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700",
      reviewed: "bg-blue-100 text-blue-700",
      shortlisted: "bg-purple-100 text-purple-700",
      rejected: "bg-red-100 text-red-700",
      accepted: "bg-emerald-100 text-emerald-700",
    };
    const labels = {
      pending: "Pending",
      reviewed: "Reviewed",
      shortlisted: "Shortlisted",
      rejected: "Rejected",
      accepted: "Accepted",
    };
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] || styles.pending}`}
      >
        {labels[status] || "Pending"}
      </span>
    );
  };

  const statsCards = [
    {
      label: "Total Jobs",
      value: stats.totalJobs,
      icon: faBriefcase,
      color: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
      link: "/employer/jobs",
    },
    {
      label: "Active Jobs",
      value: stats.activeJobs,
      icon: faBuilding,
      color: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50",
      link: "/employer/jobs?status=active",
    },
    {
      label: "Total Applicants",
      value: stats.totalApplicants,
      icon: faUsers,
      color: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50",
      link: "/employer/jobs",
    },
    {
      label: "Pending",
      value: stats.pendingApplications,
      icon: faEye,
      color: "from-amber-500 to-amber-600",
      bgLight: "bg-amber-50",
      link: "/employer/jobs",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-5 lg:px-6 py-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary-900">
          Welcome back, {user?.name?.split(" ")[0]}!
        </h1>
        <p className="text-secondary-500 text-sm mt-1">
          Here's what's happening with your jobs.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statsCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4 sm:p-5 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
              >
                <FontAwesomeIcon
                  icon={stat.icon}
                  className="text-white text-base sm:text-lg"
                />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-secondary-900">
                {stat.value}
              </span>
            </div>
            <p className="text-secondary-600 text-xs sm:text-sm">
              {stat.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent Jobs & Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Recent Jobs */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-secondary-200 flex justify-between items-center">
            <h3 className="font-semibold text-secondary-900 text-base sm:text-lg">
              Recent Jobs
            </h3>
            <Link
              to="/employer/jobs"
              className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
            >
              View All{" "}
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </Link>
          </div>
          <div className="divide-y divide-secondary-100">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <Link
                  key={job._id}
                  to={`/employer/jobs/${job._id}/applicants`}
                  className="block p-4 hover:bg-secondary-50 transition-all"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-secondary-900 truncate">
                        {job.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="text-xs text-secondary-500">
                          {job.location}
                        </span>
                        <span className="text-xs text-secondary-500">
                          {job.salary}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-secondary-400">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-primary-600 font-medium">
                          {job.applicationsCount || 0} applicants
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-secondary-500 text-sm">No jobs posted yet</p>
                <Link
                  to="/employer/post-job"
                  className="inline-block mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Post your first job →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Applicants */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-secondary-200 flex justify-between items-center">
            <h3 className="font-semibold text-secondary-900 text-base sm:text-lg">
              Recent Applicants
            </h3>
            <Link
              to="/employer/jobs"
              className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
            >
              View Jobs{" "}
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </Link>
          </div>
          <div className="divide-y divide-secondary-100">
            {recentApplicants.length > 0 ? (
              recentApplicants.map((applicant) => (
                <Link
                  key={applicant._id}
                  to={`/employer/jobs/${applicant.jobId}/applicants`}
                  className="block p-4 hover:bg-secondary-50 transition-all"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-secondary-900 truncate">
                          {applicant.applicant?.name || "Anonymous"}
                        </h4>
                        {getAppStatusBadge(applicant.status)}
                      </div>
                      <p className="text-xs text-secondary-500 mt-1 truncate">
                        Applied for: {applicant.jobTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-secondary-400">
                          {new Date(applicant.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="text-4xl mb-2">👥</div>
                <p className="text-secondary-500 text-sm">
                  No applications yet
                </p>
                <p className="text-xs text-secondary-400 mt-1">
                  When job seekers apply, they'll appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Link
          to="/employer/post-job"
          className="bg-primary-50 hover:bg-primary-100 border border-primary-200 p-4 sm:p-5 rounded-xl text-center transition-all group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
            <FontAwesomeIcon icon={faPlus} className="text-white text-lg" />
          </div>
          <p className="font-medium text-primary-700">Post a New Job</p>
          <p className="text-xs text-primary-500 mt-0.5">
            Create a new job listing
          </p>
        </Link>
        <Link
          to="/employer/company"
          className="bg-secondary-50 hover:bg-secondary-100 border border-secondary-200 p-4 sm:p-5 rounded-xl text-center transition-all group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-secondary-600 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
            <FontAwesomeIcon icon={faBuilding} className="text-white text-lg" />
          </div>
          <p className="font-medium text-secondary-700">Company Profile</p>
          <p className="text-xs text-secondary-500 mt-0.5">
            Update company information
          </p>
        </Link>
        <Link
          to="/employer/analytics"
          className="bg-purple-50 hover:bg-purple-100 border border-purple-200 p-4 sm:p-5 rounded-xl text-center transition-all group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
            <FontAwesomeIcon
              icon={faChartLine}
              className="text-white text-lg"
            />
          </div>
          <p className="font-medium text-purple-700">View Analytics</p>
          <p className="text-xs text-purple-500 mt-0.5">
            Track your performance
          </p>
        </Link>
      </div>
    </div>
  );
}

export default EmployerDashboard;
