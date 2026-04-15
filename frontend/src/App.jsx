import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ScrollToTop from "./pages/scrollToTop";

//layout
import MainMenu from "./layout/MainMenu";
import EmployerLayout from "./layout/employeer/EmployerLayout";
import JobSeekerLayout from "./layout/JobSeeker/JobSeekerLayout";

//auth pages
import Auth from "./pages/public_pages/Auth";
import ForgotPassword from "./pages/public_pages/ForgotPassword";
import ResetPassword from "./pages/public_pages/ResetPassword";

// Job Seeker
import Home from "./pages/public_pages/Home";
import Jobs from "./pages/public_pages/Jobs";
import Companies from "./pages/public_pages/Companies";
import JobSeekerDashboard from "./pages/JobSeeker/Dashboard";
import About from "./pages/public_pages/About";
import Contact from "./pages/public_pages/Contact";
import NotFound from "./pages/public_pages/NotFound";
import JobSeekerProfile from "./pages/JobSeeker/Profile";
import SavedJobs from "./pages/JobSeeker/SavedJobs";

//employeer
import EmployerDashboard from "./pages/Employeer/Dashboard";
import EmployerAnalytics from "./pages/Employeer/Analytics";
import MyJobs from "./pages/Employeer/MyJobs";
import PostJob from "./pages/Employeer/PostJob";
import Applicants from "./pages/Employeer/Applicants";
import CompanyProfile from "./pages/Employeer/CompanyProfile";

//admin
import AdminLayout from "./layout/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageJobs from "./pages/admin/ManageJobs";
import ManageCompanies from "./pages/admin/ManageCompanies";
import ManageApplications from "./pages/admin/ManageApplication";

//protected route
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          {/* PUBLIC ROUTES - Accessible by everyone */}
          <Route path="auth" element={<Auth />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
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
