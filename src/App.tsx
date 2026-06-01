import React, { useState, useEffect } from "react";
import AdminLogin from "./components/AdminLogin";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import StudentModule from "./components/StudentModule";
import AttendanceModule from "./components/AttendanceModule";
import MarksModule from "./components/MarksModule";
import FeeModule from "./components/FeeModule";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";

export default function App() {
  // Authentication states
  const [token, setToken] = useState<string | null>(localStorage.getItem("lyceum_token"));
  const [adminUser, setAdminUser] = useState<{ id: string; username: string; name: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(!!localStorage.getItem("lyceum_token"));

  // Layout states
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("lyceum_theme") === "dark" || 
      (!localStorage.getItem("lyceum_theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sync token validation on load
  useEffect(() => {
    const validateToken = async () => {
      const savedToken = localStorage.getItem("lyceum_token");
      if (!savedToken) {
        setCheckingAuth(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${savedToken}` }
        });

        if (response.ok) {
          const user = await response.json();
          setAdminUser(user);
          setToken(savedToken);
        } else {
          // Token expired or invalid
          handleLogout();
        }
      } catch (err) {
        console.error("Auth validation failed:", err);
      } finally {
        setCheckingAuth(false);
      }
    };

    validateToken();
  }, []);

  // Theme Syncing
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("lyceum_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("lyceum_theme", "light");
    }
  }, [darkMode]);

  const handleLoginSuccess = (newToken: string, user: { id: string; username: string; name: string }) => {
    localStorage.setItem("lyceum_token", newToken);
    setToken(newToken);
    setAdminUser(user);
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.error("Logout request error:", e);
      }
    }
    localStorage.removeItem("lyceum_token");
    setToken(null);
    setAdminUser(null);
    setActiveTab("dashboard");
  };

  // Quick navigation helpers passed to Dashboard
  const handleQuickNavStudents = () => {
    setActiveTab("students");
  };

  const handleQuickNavFees = () => {
    setActiveTab("fees");
  };

  // Rendering of active functional views
  const renderActiveContent = () => {
    if (!token) return null;

    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            token={token}
            onQuickNavStudents={handleQuickNavStudents}
            onQuickNavFees={handleQuickNavFees}
          />
        );
      case "students":
        return <StudentModule token={token} />;
      case "attendance":
        return <AttendanceModule token={token} />;
      case "marks":
        return <MarksModule token={token} />;
      case "fees":
        return <FeeModule token={token} />;
      default:
        return (
          <div className="flex-1 p-8 text-center text-gray-500">
            Navigation location not found.
          </div>
        );
    }
  };

  // Core Loading Check
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 transition-colors">
        <Loader2 className="w-9 h-9 text-indigo-600 animate-spin mb-3.5" />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Securing session credentials...</p>
      </div>
    );
  }

  // Not authenticated? Render secure login panel
  if (!token || !adminUser) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Complete Sidebar Layout */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        adminName={adminUser.name}
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen relative overflow-hidden">
        {/* Banner notification for print sessions (visible only during media print triggers) */}
        <div className="hidden print-only text-center py-2 text-[10px] text-gray-400 border-b border-gray-100 uppercase tracking-widest font-mono">
          Lyceum Registrar Security Protocol • Generated on June 1, 2026
        </div>

        {/* Dynamic active view content */}
        {renderActiveContent()}
      </main>
    </div>
  );
}
