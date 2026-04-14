import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faUsers,
  faChartLine,
  faSpinner,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getEmployerAnalytics } from "../../services/analyticsService";

function EmployerAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    stats: {
      totalJobs: 0,
      activeJobs: 0,
      closedJobs: 0,
      totalApplications: 0,
      avgApplicationsPerJob: 0,
      statusBreakdown: {
        pending: 0,
        reviewed: 0,
        shortlisted: 0,
        rejected: 0,
        accepted: 0,
      },
    },
    jobs: [],
    trendData: [],
    recentApplications: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await getEmployerAnalytics();
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const COLORS = {
    pending: "#eab308",
    reviewed: "#3b82f6",
    shortlisted: "#8b5cf6",
    rejected: "#ef4444",
    accepted: "#10b981",
  };

  const pieData = [
    {
      name: "Pending",
      value: data.stats.statusBreakdown.pending,
      color: COLORS.pending,
    },
    {
      name: "Reviewed",
      value: data.stats.statusBreakdown.reviewed,
      color: COLORS.reviewed,
    },
    {
      name: "Shortlisted",
      value: data.stats.statusBreakdown.shortlisted,
      color: COLORS.shortlisted,
    },
    {
      name: "Rejected",
      value: data.stats.statusBreakdown.rejected,
      color: COLORS.rejected,
    },
    {
      name: "Accepted",
      value: data.stats.statusBreakdown.accepted,
      color: COLORS.accepted,
    },
  ].filter((item) => item.value > 0);

  const maxApplications =
    data.jobs.length > 0
      ? Math.max(...data.jobs.map((j) => j.applicationsCount || 0), 10)
      : 10;
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md mx-auto">
        <p className="text-red-600 mb-3">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-5 lg:px-6 py-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary-900">
          Analytics
        </h1>
        <p className="text-secondary-500 text-sm mt-1">
          Track your job performance and applicant insights
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Total Jobs */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon
                icon={faBriefcase}
                className="text-blue-600 text-base"
              />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-secondary-900">
              {data.stats.totalJobs}
            </span>
          </div>
          <p className="text-secondary-600 text-xs sm:text-sm">Total Jobs</p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {data.stats.activeJobs} Active
            </span>
            <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {data.stats.closedJobs} Closed
            </span>
          </div>
        </div>

        {/* Total Applications */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon
                icon={faUsers}
                className="text-emerald-600 text-base"
              />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-secondary-900">
              {data.stats.totalApplications}
            </span>
          </div>
          <p className="text-secondary-600 text-xs sm:text-sm">
            Total Applications
          </p>
          <p className="text-xs text-secondary-500 mt-1">
            Avg {data.stats.avgApplicationsPerJob} per job
          </p>
        </div>

        {/* Shortlist Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon
                icon={faChartLine}
                className="text-purple-600 text-base"
              />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-secondary-900">
              {data.stats.totalApplications > 0
                ? Math.round(
                    (data.stats.statusBreakdown.shortlisted /
                      data.stats.totalApplications) *
                      100,
                  )
                : 0}
              %
            </span>
          </div>
          <p className="text-secondary-600 text-xs sm:text-sm">
            Shortlist Rate
          </p>
          <div className="w-full bg-secondary-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-purple-600 h-1.5 rounded-full transition-all"
              style={{
                width: `${
                  data.stats.totalApplications > 0
                    ? (data.stats.statusBreakdown.shortlisted /
                        data.stats.totalApplications) *
                      100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Hiring Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon
                icon={faChartLine}
                className="text-emerald-600 text-base"
              />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-secondary-900">
              {data.stats.totalApplications > 0
                ? Math.round(
                    (data.stats.statusBreakdown.accepted /
                      data.stats.totalApplications) *
                      100,
                  )
                : 0}
              %
            </span>
          </div>
          <p className="text-secondary-600 text-xs sm:text-sm">Hiring Rate</p>
          <div className="w-full bg-secondary-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all"
              style={{
                width: `${
                  data.stats.totalApplications > 0
                    ? (data.stats.statusBreakdown.accepted /
                        data.stats.totalApplications) *
                      100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mb-6 sm:mb-8">
        {/* Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4 sm:p-5">
          <h3 className="font-semibold text-secondary-900 mb-3 text-sm sm:text-base">
            Applications Trend
          </h3>
          {data.trendData?.length > 0 ? (
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [
                      `${value} applications`,
                      "Applications",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-secondary-400 text-sm">
              No trend data available
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4 sm:p-5">
          <h3 className="font-semibold text-secondary-900 mb-3 text-sm sm:text-base">
            Applications by Status
          </h3>
          {pieData.length > 0 ? (
            <>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={70}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [`${value} applications`, "Count"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-3">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-secondary-600">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-secondary-400 text-sm">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployerAnalytics;
