import React from "react";
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  GraduationCap,
  CircleDollarSign,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ShieldAlert
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  adminName: string;
  onLogout: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  adminName,
  onLogout,
  mobileOpen,
  setMobileOpen
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "students", label: "Student Roster", icon: Users },
    { id: "attendance", label: "Attendance Module", icon: CalendarCheck2 },
    { id: "marks", label: "Marks & Cards", icon: GraduationCap },
    { id: "fees", label: "Fee Ledger", icon: CircleDollarSign },
  ];

  const handleNav = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false); // Close on mobile navigation
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between no-print sticky top-0 z-40 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold select-none">
            L
          </div>
          <span className="font-sans font-bold text-gray-900 dark:text-white tracking-tight">
            Lyceum System
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            id="mobile_menu_toggle"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-45 lg:hidden no-print"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 lg:static z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between transform transition-transform duration-200 lg:transform-none no-print ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="h-20 border-b border-gray-100 dark:border-gray-800/80 px-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/10">
              L
            </div>
            <div>
              <h1 className="font-sans font-bold text-gray-900 dark:text-white tracking-tight text-base leading-tight">
                Lyceum Academy
              </h1>
              <p className="text-[11px] text-indigo-500 dark:text-indigo-400 uppercase tracking-wider font-mono font-bold">
                Admin Suite
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav_${item.id}`}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-300"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600 dark:text-indigo-300" : "text-gray-400"}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-6 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer controls (Theme and User profile) */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800/80 space-y-4">
          <div className="hidden lg:flex items-center justify-between bg-gray-50 dark:bg-gray-950 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium pl-1">
              {darkMode ? "Dark Theme" : "Light Theme"}
            </span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:text-indigo-500 cursor-pointer transition-all"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-3 p-1">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-sm text-indigo-600 dark:text-indigo-300 uppercase">
              {adminName ? adminName.substring(0, 2) : "AD"}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                {adminName || "Administrator"}
              </h4>
              <p className="text-[10px] text-emerald-500 font-semibold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Live Session
              </p>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-gray-400 hover:text-rose-500 cursor-pointer transition-all"
              title="Logout Session"
              id="sidebar_logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
