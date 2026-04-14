import React, { createContext, useState, useContext, useEffect } from "react";
import {
  getStoredUser,
  isAuthenticated,
  logout as logoutService,
  getCurrentUser,
} from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [companyRefreshTrigger, setCompanyRefreshTrigger] = useState(0);
  const [publicViewMode, setPublicViewMode] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const storedUser = getStoredUser();

      setIsLoggedIn(authenticated);
      setUser(storedUser);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (userData, token) => {
    localStorage.setItem("token", token);

    // Fetch fresh user data from backend to ensure we have latest profile image
    try {
      const response = await getCurrentUser();
      if (response.success && response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
        setUser(response.user);
      } else {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      // Fallback to login response data
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }

    setIsLoggedIn(true);

    // Return redirect path if exists
    const redirectPath = sessionStorage.getItem("redirectAfterLogin");
    if (redirectPath) {
      sessionStorage.removeItem("redirectAfterLogin");
      return redirectPath;
    }
    return null;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("redirectAfterLogin");
    setUser(null);
    setIsLoggedIn(false);
    logoutService();
  };

  const enablePublicView = () => {
    setPublicViewMode(true);
  };

  const disablePublicView = () => {
    setPublicViewMode(false);
  };

  const updateUser = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const refreshCompanyData = () => {
    setCompanyRefreshTrigger((prev) => prev + 1);
  };

  const isAdmin = () => {
    if (publicViewMode) return false;
    return user?.role === "admin";
  };

  const isEmployer = () => {
    if (publicViewMode) return false;
    return user?.role === "employer";
  };

  const isJobSeeker = () => {
    if (publicViewMode) return false;
    return user?.role === "job_seeker";
  };

  const isBlocked = () => {
    return user?.status === "blocked";
  };

  const hasResume = () => {
    return !!user?.resume;
  };

  const hasProfileImage = () => {
    return !!user?.profileImage;
  };

  const hasCompany = () => {
    return !!user?.companyId;
  };

  const value = {
    user,
    loading,
    isLoggedIn,
    login,
    logout,
    updateUser,
    setUser,
    refreshCompanyData,
    companyRefreshTrigger,
    isAdmin,
    isEmployer,
    isJobSeeker,
    publicViewMode,
    enablePublicView,
    disablePublicView,
    isBlocked,
    hasResume,
    hasProfileImage,
    hasCompany,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
