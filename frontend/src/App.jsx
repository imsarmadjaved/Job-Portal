import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ScrollToTop from "./pages/scrollToTop";
import MainMenu from "./layout/MainMenu";
import EmployerLayout from "./layout/employeer/EmployerLayout";
import JobSeekerLayout from "./layout/JobSeeker/JobSeekerLayout";
import Auth from "./pages/public_pages/Auth";
import Home from "./pages/public_pages/Home";
import Jobs from "./pages/public_pages/Jobs";
import Companies from "./pages/public_pages/Companies";
import About from "./pages/public_pages/About";
import Contact from "./pages/public_pages/Contact";
import NotFound from "./pages/public_pages/NotFound";
import EmployerDashboard from "./pages/Employeer/Dashboard";
import PostJob from "./pages/Employeer/PostJob";
import MyJobs from "./pages/Employeer/MyJobs";
import CompanyProfile from "./pages/Employeer/CompanyProfile";
import Applicants from "./pages/Employeer/Applicants";
import JobSeekerDashboard from "./pages/JobSeeker/Dashboard";
import JobSeekerProfile from "./pages/JobSeeker/Profile";
import EmployerAnalytics from "./pages/Employeer/Analytics";
import SavedJobs from "./pages/JobSeeker/SavedJobs";

import AdminLayout from "./layout/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageJobs from "./pages/admin/ManageJobs";
import ManageCompanies from "./pages/admin/ManageCompanies";
import ManageApplications from "./pages/admin/ManageApplication";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          {/* PUBLIC ROUTES - Accessible by everyone */}
          <Route path="auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<MainMenu />}>
            <Route index element={<Home />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="companies" element={<Companies />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* JOB SEEKER ROUTES - Only for job_seeker role */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["job_seeker"]}>
                <JobSeekerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<JobSeekerDashboard />} />
            <Route path="profile" element={<JobSeekerProfile />} />
            <Route path="saved-jobs" element={<SavedJobs />} />
          </Route>

          {/* ADMIN ROUTES - Only for admin role */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="Dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="jobs" element={<ManageJobs />} />
            <Route path="companies" element={<ManageCompanies />} />
            <Route path="applications" element={<ManageApplications />} />
          </Route>

          {/* EMPLOYER ROUTES - Only for employer role */}
          <Route
            path="/employer"
            element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <EmployerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<EmployerDashboard />} />
            <Route path="jobs" element={<MyJobs />} />
            <Route path="post-job" element={<PostJob />} />
            <Route path="jobs/:id/edit" element={<PostJob />} />
            <Route path="company" element={<CompanyProfile />} />
            <Route path="jobs/:jobId/applicants" element={<Applicants />} />
            <Route path="analytics" element={<EmployerAnalytics />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
