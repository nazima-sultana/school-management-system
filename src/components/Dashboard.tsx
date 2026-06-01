import React, { useState, useEffect } from "react";
import {
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Coins,
  ArrowRight,
  AlertCircle,
  Plus,
  Loader2,
  Activity
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { DashboardStats } from "../types";

interface DashboardProps {
  token: string;
  onQuickNavStudents: () => void;
  onQuickNavFees: () => void;
}

export default function Dashboard({ token, onQuickNavStudents, onQuickNavFees }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats & { chartData: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to load dashboard parameters.");
        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || "An unexpected issue occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Assembling school statistics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex-1 p-6">
        <div className="p-4 bg-rose-50 dark:bg-rose-950/35 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error || "Database load error. Please refresh."}</span>
        </div>
      </div>
    );
  }

  // Calculate percentage of present students today
  const attendancePercentage = stats.totalStudents > 0
    ? Math.round((stats.presentToday / stats.totalStudents) * 100)
    : 100;

  // Nice colors for the enrollment chart
  const COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-fade-in overflow-y-auto max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Administrative Hub
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time insights and monitoring diagnostics for the current acadamic active term.
          </p>
        </div>
        <div className="text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 py-1.5 px-3.5 rounded-full border border-indigo-100/50 dark:border-indigo-900/30 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>Active Date: June 1, 2026</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Total Students */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-all ease-out cursor-pointer group" onClick={onQuickNavStudents}>
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/35 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              {stats.totalStudents}
            </span>
            <span className="text-xs font-semibold text-emerald-500 flex items-center">
              +100% active
            </span>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1">
            <span>Manage classroom distribution</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </p>
        </div>

        {/* Present Today */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-all ease-out">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Present Today
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              {stats.presentToday}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 py-0.5 px-1.5 rounded-md">
              {attendancePercentage}%
            </span>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
            Current session tracking
          </p>
        </div>

        {/* Absent Today */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-all ease-out">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Absent Today
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              {stats.absentToday}
            </span>
            <span className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/30 py-0.5 px-1.5 rounded-md">
              {stats.totalStudents > 0 ? Math.round((stats.absentToday / stats.totalStudents) * 100) : 0}%
            </span>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
            Action item lists compiled
          </p>
        </div>

        {/* Fees Collected */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-all ease-out cursor-pointer group" onClick={onQuickNavFees}>
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Fees Collected
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              ${stats.totalFeesCollected.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1">
            <span>Invoiced status report</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </p>
        </div>

        {/* Pending Fees */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-all ease-out cursor-pointer group" onClick={onQuickNavFees}>
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Fees Receivable
            </span>
            <div className="w-10 h-10 rounded-xl bg-orange-55/10 dark:bg-orange-950/30 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              ${stats.pendingFees.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1">
            <span>Action notices pending</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </p>
        </div>
      </div>

      {/* Grid: Chart & System Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Side: Chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 sm:p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Student Distributing Metrics
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Enrollment index sorted alphabetically by grade and learning level.
              </p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" className="dark:stroke-gray-800/60" />
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    backgroundColor: "rgba(17, 24, 39, 0.95)",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                  }}
                />
                <Bar dataKey="students" radius={[8, 8, 0, 0]}>
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Quick Action Menu & System Highlights */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
              School Administrative Tasks
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
              Diagnostic shortcuts for executing core tasks.
            </p>

            <div className="space-y-3.5">
              <button
                onClick={onQuickNavStudents}
                className="w-full flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-950 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl border border-gray-200/50 dark:border-gray-800 hover:border-indigo-200 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      Roster New Student
                    </h4>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      Reregister and record admission files
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={onQuickNavStudents}
                className="w-full flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-950 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl border border-gray-200/50 dark:border-gray-800 hover:border-emerald-200 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      Track Dynamic Attendance
                    </h4>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      Collect present indexes today
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={onQuickNavFees}
                className="w-full flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-950 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-xl border border-gray-200/50 dark:border-gray-800 hover:border-amber-200 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      Manage Fine Ledgers
                    </h4>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      Check tuition dues, pending & paid invoices
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800/80 flex items-center gap-2.5 text-indigo-650 dark:text-indigo-400">
            <span className="text-[10px] uppercase tracking-wider font-mono font-bold">
              Database Core Node Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
