import React, { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  UserCheck,
  Search,
  Check,
  RefreshCw,
  AlertCircle,
  Clock,
  TrendingUp
} from "lucide-react";

interface AttendanceModuleProps {
  token: string;
}

interface AttendanceRosterItem {
  studentId: string;
  name: string;
  rollNumber: string;
  classVal: string;
  section: string;
  date: string;
  status: "Present" | "Absent";
  attendanceId: string | null;
}

export default function AttendanceModule({ token }: AttendanceModuleProps) {
  // Configured target track date (default active June 1st, 2026)
  const [selectedDate, setSelectedDate] = useState("2026-06-01");
  const [roster, setRoster] = useState<AttendanceRosterItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Stats calculation
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    percentage: 100
  });

  const fetchAttendanceRoster = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/attendance?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Could not download attendance files.");
      const data: AttendanceRosterItem[] = await response.json();
      setRoster(data);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to load attendance roster." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceRoster();
  }, [selectedDate, token]);

  // Dynamically calculate attendance stats based on current local screen state
  useEffect(() => {
    if (roster.length === 0) {
      setStats({ total: 0, present: 0, absent: 0, percentage: 100 });
      return;
    }
    const total = roster.length;
    const present = roster.filter(r => r.status === "Present").length;
    const absent = total - present;
    const percentage = Math.round((present / total) * 100);
    setStats({ total, present, absent, percentage });
  }, [roster]);

  // Handle present/absent switch toggle
  const handleStatusToggle = (studentId: string, nextStatus: "Present" | "Absent") => {
    setRoster(prev => prev.map(item => {
      if (item.studentId === studentId) {
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  // Mark all students on the screen as Present / Absent
  const handleMarkAll = (status: "Present" | "Absent") => {
    setRoster(prev => prev.map(item => ({ ...item, status })));
  };

  // Submit bulk attendance to server
  const handleSaveAttendance = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const bodyPayload = {
        date: selectedDate,
        records: roster.map(r => ({ studentId: r.studentId, status: r.status }))
      };

      const response = await fetch("/api/attendance/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload)
      });

      if (!response.ok) throw new Error("Could not commit bulk attendance parameters.");
      const result = await response.json();
      setMessage({ type: "success", text: `Attendance saved correctly for ${roster.length} students.` });
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An unexpected error occurred." });
    } finally {
      setSaving(false);
    }
  };

  // Filter roster locally based on search bar query
  const filteredRoster = roster.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.classVal.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-fade-in overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Module Title controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Daily Attendance Monitor
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Select an academic session date, log student statuses, and evaluate active percentages.
          </p>
        </div>

        {/* Date picking box */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <Calendar className="w-4 h-4" />
            </span>
            <input
              type="date"
              id="attendance_date_picker"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-48 pl-9 pr-3.5 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-semibold"
            />
          </div>
          <button
            onClick={fetchAttendanceRoster}
            className="p-2 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-950 text-gray-500 dark:text-gray-400 cursor-pointer transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Roster statistical snapshots */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Total Class Roster</p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-1">{stats.total}</p>
          </div>
          <UserCheck className="w-8 h-8 text-indigo-500/20" />
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Present Today</p>
            <p className="text-xl font-black text-emerald-500 mt-1">{stats.present}</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500/20" />
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Absent Today</p>
            <p className="text-xl font-black text-rose-500 mt-1">{stats.absent}</p>
          </div>
          <XCircle className="w-8 h-8 text-rose-500/20" />
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Attendance Rate</p>
            <div className="flex items-baseline gap-1 mt-1">
              <p className="text-xl font-black text-indigo-650 dark:text-indigo-400">{stats.percentage}%</p>
              <p className="text-[10px] font-bold text-gray-400">rate</p>
            </div>
          </div>
          <TrendingUp className="w-8 h-8 text-indigo-500/20" />
        </div>
      </div>

      {/* Message banners for action outcomes */}
      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm animate-fade-in ${
          message.type === "success"
            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400"
            : "bg-rose-50 dark:bg-rose-950/20 border-rose-250 dark:border-rose-900/40 text-rose-700 dark:text-rose-400"
        }`}>
          {message.type === "success" ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Checklist Search and Bulk Toggles */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="relative w-full max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Filter list by Name or Grade Level..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 bg-gray-50 dark:bg-gray-955 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-805 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-505/20 text-xs"
          />
        </div>

        {/* Global toggles */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto font-sans">
          <button
            onClick={() => handleMarkAll("Present")}
            className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 border border-emerald-150 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Mark All Present
          </button>
          <button
            onClick={() => handleMarkAll("Absent")}
            className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-700 dark:text-rose-400 border border-rose-150 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Roster View Grid */}
      {loading ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[250px]">
          <Loader2 className="w-7 h-7 text-indigo-500 animate-spin mb-3.5" />
          <p className="text-xs text-gray-400 dark:text-gray-500">Retrieving schedule date registry...</p>
        </div>
      ) : filteredRoster.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-400">
          No students tracked under current filtering tags.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-800/80">
              {filteredRoster.map((item) => {
                const isPresent = item.status === "Present";
                return (
                  <div key={item.studentId} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 gap-4 hover:bg-gray-50/40 dark:hover:bg-gray-850/10 transition-colors">
                    {/* Left: Info card */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-xs select-none">
                        {item.name.substring(0, 1)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white capitalize">{item.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5 font-mono">
                          <span>Roll: {item.rollNumber}</span>
                          <span>•</span>
                          <span>{item.classVal} ({item.section})</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Modern Present/Absent Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleStatusToggle(item.studentId, "Present")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 transition-all outline-none cursor-pointer border ${
                          isPresent
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10"
                            : "bg-white border-gray-200 dark:bg-gray-950 dark:border-gray-805 text-gray-400 dark:text-gray-500 hover:text-emerald-500"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Present</span>
                      </button>

                      <button
                        onClick={() => handleStatusToggle(item.studentId, "Absent")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 transition-all outline-none cursor-pointer border ${
                          !isPresent
                            ? "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/15"
                            : "bg-white border-gray-200 dark:bg-gray-955 dark:border-gray-805 text-gray-400 dark:text-gray-500 hover:text-rose-500"
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Absent</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Master save actions block */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/15 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Commit and Save Attendance Sheet</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
