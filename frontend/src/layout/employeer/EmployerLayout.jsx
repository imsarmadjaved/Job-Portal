import React, { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import EmployerSidebar from "./EmployeerSidebar";
import EmployerNavbar from "./EmployeerNavbar";
import { useAuth } from "../../context/AuthContext";

function EmployerLayout() {
  const { isLoggedIn, user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleDesktopSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <div className="flex h-screen bg-secondary-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:block ${
          sidebarCollapsed ? "w-20" : "w-64"
        } transition-all duration-300 ease-in-out h-screen sticky top-0`}
      >
        <EmployerSidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <EmployerSidebar collapsed={false} onMobileClose={closeMobileSidebar} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <EmployerNavbar
          toggleDesktopSidebar={toggleDesktopSidebar}
          toggleMobileSidebar={toggleMobileSidebar}
          sidebarCollapsed={sidebarCollapsed}
          isMobile={isMobile}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-secondary-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default EmployerLayout;
