import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faBriefcase,
  faBuilding,
  faFileAlt,
  faUserGraduate,
  faUserTie,
  faShieldAlt,
  faCheckCircle,
  faClock,
  faSpinner,
  faArrowRight,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { getAdminStats } from "../../services/adminService";

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobSeekers: 0,
    totalEmployers: 0,
    totalAdmins: 0,
    totalJobs: 0,
    activeJobs: 0,
    pendingJobs: 0,
    closedJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    reviewedApplications: 0,
    shortlistedApplications: 0,
    rejectedApplications: 0,
    acceptedApplications: 0,
    totalCompanies: 0,
    verifiedCompanies: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getAdminStats();
      if (response.success) {
        setStats(response.stats);
        setRecentUsers(response.recentUsers || []);
        setRecentJobs(response.recentJobs || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Summary cards - clean and minimal
  const summaryCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: faUsers,
      color: "bg-blue-500",
      link: "/admin/users",
    },
    {
      label: "Total Jobs",
      value: stats.totalJobs,
      icon: faBriefcase,
      color: "bg-emerald-500",
      link: "/admin/jobs",
    },
    {
      label: "Applications",
      value: stats.totalApplications,
      icon: faFileAlt,
      color: "bg-purple-500",
      link: "/admin/applications",
    },
    {
      label: "Companies",
      value: stats.totalCompanies,
      icon: faBuilding,
      color: "bg-orange-500",
      link: "/admin/companies",
    },
  ];

  // User breakdown for pie chart
  const userBreakdownData = [
    { name: "Job Seekers", value: stats.totalJobSeekers, color: "#10b981" },
    { name: "Employers", value: stats.totalEmployers, color: "#8b5cf6" },
    { name: "Admins", value: stats.totalAdmins, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  // Job status data for pie chart
  const jobStatusData = [
    { name: "Active", value: stats.activeJobs, color: "#10b981" },
    { name: "Pending", value: stats.pendingJobs, color: "#f59e0b" },
    { name: "Closed", value: stats.closedJobs, color: "#6b7280" },
  ].filter((item) => item.value > 0);

  // Application status data for bar chart
  const applicationData = [
    { name: "Pending", value: stats.pendingApplications, color: "#f59e0b" },
    { name: "Reviewed", value: stats.reviewedApplications, color: "#3b82f6" },
    {
      name: "Shortlisted",
      value: stats.shortlistedApplications,
      color: "#8b5cf6",
    },
    { name: "Accepted", value: stats.acceptedApplications, color: "#10b981" },
    { name: "Rejected", value: stats.rejectedApplications, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  // Sample growth data (will be replaced with real API later)
  const growthData = [
    { month: "Jan", users: 120, jobs: 45, applications: 230 },
    { month: "Feb", users: 150, jobs: 52, applications: 280 },
    { month: "Mar", users: 180, jobs: 60, applications: 340 },
    { month: "Apr", users: 220, jobs: 75, applications: 420 },
    { month: "May", users: 280, jobs: 90, applications: 520 },
    { month: "Jun", users: 350, jobs: 110, applications: 650 },
  ];

  const getRoleBadge = (role) => {
    const styles = {
      job_seeker: "bg-green-100 text-green-700",
      employer: "bg-purple-100 text-purple-700",
      admin: "bg-red-100 text-red-700",
    };
    const labels = {
      job_seeker: "Job Seeker",
      employer: "Employer",
      admin: "Admin",
    };
    return (
      <span
        className={`text-xs px-2 py-1 rounded-full font-medium ${styles[role]}`}
      >
        {labels[role] || role}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-700",
      pending: "bg-amber-100 text-amber-700",
      closed: "bg-gray-100 text-gray-700",
    };
    return (
      <span
        className={`text-xs px-2 py-1 rounded-full font-medium ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">
            Dashboard
          </h1>
          <p className="text-secondary-500 mt-1">
            Welcome back to your admin dashboard
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className="bg-white rounded-xl shadow-sm border border-secondary-200 p-5 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-secondary-900">
                  {card.value}
                </p>
                <p className="text-sm text-secondary-500 mt-1">{card.label}</p>
              </div>
              <div
                className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
              >
                <FontAwesomeIcon
                  icon={card.icon}
                  className="text-white text-lg"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon
                icon={faChartLine}
                className="text-primary-600 text-sm"
              />
            </div>
            <h3 className="font-semibold text-secondary-900">
              Platform Growth
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="jobs"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="applications"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* User Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon
                icon={faUsers}
                className="text-green-600 text-sm"
              />
            </div>
            <h3 className="font-semibold text-secondary-900">
              User Distribution
            </h3>
          </div>
          {userBreakdownData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={userBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {userBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-secondary-400">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Status */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon
                icon={faBriefcase}
                className="text-emerald-600 text-sm"
              />
            </div>
            <h3 className="font-semibold text-secondary-900">Job Status</h3>
          </div>
          {jobStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={jobStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {jobStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-secondary-400">
              No data available
            </div>
          )}
        </div>

        {/* Applications Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon
                icon={faFileAlt}
                className="text-purple-600 text-sm"
              />
            </div>
            <h3 className="font-semibold text-secondary-900">
              Applications Overview
            </h3>
          </div>
          {applicationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={applicationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {applicationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-secondary-400">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
          <div className="p-5 border-b border-secondary-100 flex justify-between items-center">
            <h3 className="font-semibold text-secondary-900">Recent Users</h3>
            <Link
              to="/admin/users"
              className="text-primary-600 text-sm hover:text-primary-700 flex items-center gap-1"
            >
              View All{" "}
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </Link>
          </div>
          <div className="divide-y divide-secondary-100">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div
                  key={user._id}
                  className="p-4 hover:bg-secondary-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-sm text-secondary-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    {getRoleBadge(user.role)}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-secondary-500">
                No recent users
              </div>
            )}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
          <div className="p-5 border-b border-secondary-100 flex justify-between items-center">
            <h3 className="font-semibold text-secondary-900">Recent Jobs</h3>
            <Link
              to="/admin/jobs"
              className="text-primary-600 text-sm hover:text-primary-700 flex items-center gap-1"
            >
              View All{" "}
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </Link>
          </div>
          <div className="divide-y divide-secondary-100">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div
                  key={job._id}
                  className="p-4 hover:bg-secondary-50 transition-all"
                >
                  <p className="font-medium text-secondary-900">{job.title}</p>
                  <p className="text-sm text-secondary-500">{job.company}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(job.status)}
                    <span className="text-xs text-secondary-400">
                      by {job.postedBy?.name || "Unknown"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-secondary-500">
                No recent jobs
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
