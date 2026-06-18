import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Download,
  Upload,
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  Layers,
  GraduationCap,
  Loader2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { Student } from "../types";

interface StudentModuleProps {
  token: string;
}

export default function StudentModule({ token }: StudentModuleProps) {
  // State variables for students list, pagination, and search query
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal display states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form input states
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    rollNumber: "",
    admissionNumber: "",
    classVal: "Grade 10",
    section: "A",
    dob: "",
    gender: "Male" as "Male" | "Female" | "Other",
    parentName: "",
    parentPhone: "",
    address: "",
    admissionDate: new Date().toISOString().split("T")[0],
    photoUrl: ""
  });

  const [uploadLoading, setUploadLoading] = useState(false);

  // Fetch student records from the backend API
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/students?search=${encodeURIComponent(search)}&page=${page}&limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Could not acquire student roster.");
      const data = await response.json();
      setStudents(data.students);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, page]);

  // Handle delete action
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove student "${name}"? This action is irreversible and deletes attendance/grades.`)) {
      return;
    }
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Could not remove student file.");
      fetchStudents();
    } catch (err: any) {
      alert(err.message || "Could not delete student.");
    }
  };

  // Prepare form state for Adding a Student
  const handleAddClick = () => {
    setFormData({
      id: "",
      name: "",
      rollNumber: "",
      admissionNumber: "",
      classVal: "Grade 10",
      section: "A",
      dob: "2010-01-01",
      gender: "Male",
      parentName: "",
      parentPhone: "",
      address: "",
      admissionDate: new Date().toISOString().split("T")[0],
      photoUrl: ""
    });
    setIsFormOpen(true);
  };

  // Prepare form state for Editing a Student
  const handleEditClick = (student: Student) => {
    setFormData({
      id: student.id,
      name: student.name,
      rollNumber: student.rollNumber,
      admissionNumber: student.admissionNumber,
      classVal: student.classVal,
      section: student.section,
      dob: student.dob,
      gender: student.gender,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      address: student.address,
      admissionDate: student.admissionDate,
      photoUrl: student.photoUrl
    });
    setIsFormOpen(true);
  };

  // Handle local photo Upload conversion to Base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB.");
      return;
    }

    setUploadLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      setUploadLoading(false);
    };
    reader.onerror = () => {
      alert("Error reading file.");
      setUploadLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarSelect = (seed: string) => {
    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
    setFormData(prev => ({ ...prev, photoUrl: url }));
  };

  // Save student (Insert or Update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const isEditing = !!formData.id;
    const url = isEditing ? `/api/students/${formData.id}` : "/api/students";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to commit student profile.");
      }

      setIsFormOpen(false);
      fetchStudents();
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    }
  };

  // Profile modal trigger
  const handleProfileClick = (student: Student) => {
    setSelectedStudent(student);
    setIsProfileOpen(true);
  };

  // Export Student roster to Excel-compatible CSV format
  const handleExportRoster = () => {
    if (students.length === 0) {
      alert("No students currently loaded to export.");
      return;
    }

    // Header row
    const headers = [
      "Student ID",
      "Full Name",
      "Roll Number",
      "Admission ID",
      "Grade / Class",
      "Section",
      "Date of Birth",
      "Gender",
      "Parent Name",
      "Parent Contact",
      "Address",
      "Admission Date"
    ];

    // Map roster values
    const rows = students.map(s => [
      `"${s.id}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.rollNumber}"`,
      `"${s.admissionNumber}"`,
      `"${s.classVal}"`,
      `"${s.section}"`,
      `"${s.dob}"`,
      `"${s.gender}"`,
      `"${s.parentName.replace(/"/g, '""')}"`,
      `"${s.parentPhone}"`,
      `"${s.address.replace(/"/g, '""')}"`,
      `"${s.admissionDate}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const mimeType = "text/csv;charset=utf-8;";
    const blob = new Blob([csvContent], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Lyceum_Students_Roster_Page_${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-fade-in overflow-y-auto w-full max-w-7xl mx-auto">
      {/* Module Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Student Administration Roster
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Add, update, search, and audit student profile profiles in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleExportRoster}
            className="px-3.5 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-indigo-950 transition-all font-medium text-xs flex items-center gap-2 cursor-pointer"
            title="Export this page as CSV (Excel compatible)"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export To CSV</span>
          </button>

          <button
            onClick={handleAddClick}
            className="flex-1 sm:flex-initial px-4 py-2 bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/15 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Roster Controls: Search bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            id="student_search_input"
            type="text"
            placeholder="Search students by Name, Roll, or Admission ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset page on query change
            }}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans text-xs"
          />
        </div>
        <div className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 ml-auto select-none">
          Filters matched: {students.length} record(s) on this view
        </div>
      </div>

      {/* Main Student list Table / Roster */}
      {loading ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3.5" />
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Updating classroom databases...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-500 dark:text-gray-400">
          <User className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-sm font-semibold mb-1">No Students Found</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {search ? "No records matched your search filters." : "Start registering students using the Roster Student button."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-55 dark:bg-gray-950/10 border-b border-gray-100 dark:border-gray-800/80 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  <th className="px-6 py-4">Avatar / Name</th>
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4">Admission ID</th>
                  <th className="px-6 py-4">Class Level</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-sm">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.photoUrl}
                          alt={student.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 dark:border-gray-800 object-cover shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.name)}`;
                          }}
                        />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{student.name}</p>
                          <p className="text-[11px] font-mono font-medium text-gray-400 dark:text-gray-500">Parent: {student.parentName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 py-1 px-2 rounded-lg">
                        {student.rollNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400 font-bold">
                        {student.admissionNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
                      {student.classVal} - <span className="text-gray-400">{student.section}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleProfileClick(student)}
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-900/60 dark:hover:text-indigo-300 text-gray-400 bg-white dark:bg-gray-950 cursor-pointer transition-all"
                          title="View Complete Report & Profile File"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(student)}
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:text-amber-500 hover:border-amber-250 dark:hover:border-amber-900/40 dark:hover:text-amber-400 text-gray-400 bg-white dark:bg-gray-950 cursor-pointer transition-all"
                          title="Edit Student Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id, student.name)}
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:text-rose-600 hover:border-rose-200 dark:hover:border-rose-95/40 dark:hover:text-rose-400 text-gray-400 bg-white dark:bg-gray-950 cursor-pointer transition-all"
                          title="Delete File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Simple table footer with Pagination controls */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium pl-1">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-2 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-950 text-gray-600 dark:text-gray-300 disabled:opacity-30 cursor-pointer transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-2 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-950 text-gray-600 dark:text-gray-300 disabled:opacity-30 cursor-pointer transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE DETAIL MODAL */}
      {isProfileOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <button
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-850 cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile banner */}
            <div className="h-28 bg-gradient-to-r from-indigo-500 to-indigo-700 relative shrink-0" />

            {/* Student metadata breakdown */}
            <div className="px-6 pb-6 relative overflow-y-auto flex-1">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-10 mb-6 shrink-0">
                <img
                  src={selectedStudent.photoUrl}
                  alt={selectedStudent.name}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-2xl bg-white border-4 border-white dark:border-gray-900 shadow-md object-cover relative z-10"
                />
                <div className="text-center sm:text-left mb-1 flex-1">
                  <h3 className="text-xl font-bold font-sans text-gray-900 dark:text-white tracking-tight">{selectedStudent.name}</h3>
                  <p className="text-xs text-indigo-500 dark:text-indigo-400 font-bold font-mono tracking-wider mt-0.5 uppercase">
                    {selectedStudent.classVal} - Section {selectedStudent.section}
                  </p>
                </div>
                <div className="text-center sm:text-right text-[11px] font-mono font-bold text-gray-400 pt-2 shrink-0">
                  ID: {selectedStudent.id}
                </div>
              </div>

              {/* Data specs grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800/80 pt-5">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-4.5 h-4.5 text-indigo-500" />
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">Roll Number</p>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{selectedStudent.rollNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Layers className="w-4.5 h-4.5 text-indigo-500" />
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">Admission ID</p>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{selectedStudent.admissionNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4.5 h-4.5 text-indigo-500" />
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">Date of Birth</p>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{selectedStudent.dob}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-4.5 h-4.5 text-indigo-500" />
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">Admission Date</p>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{selectedStudent.admissionDate}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    <UserIconWrapper gender={selectedStudent.gender} />
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">Gender</p>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{selectedStudent.gender}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="w-4.5 h-4.5 text-emerald-500" />
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">Guardian / Parent Name</p>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{selectedStudent.parentName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-4.5 h-4.5 text-emerald-500" />
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">Parent Contact</p>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 font-mono">{selectedStudent.parentPhone || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-4.5 h-4.5 text-indigo-500" />
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">Residential Address</p>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-300 leading-tight">{selectedStudent.address || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-950 px-6 py-4 flex justify-end">
              <button
                onClick={() => setIsProfileOpen(false)}
                className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Close Profile Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORM MODAL (Add / Edit Student) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800/80 flex justify-between items-center shrink-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {formData.id ? "Modify Student Profile" : "Register New Student"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-850 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Photo Upload and Avatar Chooser section */}
              <div className="bg-gray-55 dark:bg-gray-950 p-4 rounded-xl border border-gray-200/50 dark:border-gray-800/50">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3.5">
                  Student Presentation Media
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative group shrink-0">
                    <img
                      src={formData.photoUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder"}
                      alt="Student Preview"
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-xl object-cover bg-white border border-gray-200 dark:border-gray-800"
                    />
                    {uploadLoading && (
                      <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center text-white">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2.5 w-full">
                    {/* Manual Click to select uploaded file */}
                    <div className="flex items-center gap-3">
                      <label className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-95/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 rounded-xl cursor-pointer text-xs font-semibold flex items-center gap-1.5 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Select Photo</span>
                        <input
                          id="avatar_file_input"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleAvatarSelect(formData.name || `seed-${Date.now()}`)}
                        className="px-3.5 py-2 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-850 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-medium cursor-pointer transition-colors"
                      >
                        Pick Smart Avatar
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">
                      Support JPEG, PNG, or SVG. Maximum file transfer limit 2MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Attributes input group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="form_student_name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-850 rounded-xl focus:ring-1 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none text-xs text-medium"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                    Roll Number
                  </label>
                  <input
                    id="form_student_roll"
                    type="text"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData(p => ({ ...p, rollNumber: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-850 rounded-xl focus:ring-1 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none text-xs text-medium"
                    placeholder="Auto-generated if left blank"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                    Admission Number
                  </label>
                  <input
                    id="form_student_adm"
                    type="text"
                    value={formData.admissionNumber}
                    onChange={(e) => setFormData(p => ({ ...p, admissionNumber: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-850 rounded-xl focus:ring-1 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none text-xs text-medium"
                    placeholder="Auto-generated if left blank"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                    Grade / Class
                  </label>
                  <select
                    id="form_student_class"
                    value={formData.classVal}
                    onChange={(e) => setFormData(p => ({ ...p, classVal: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-955 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-850 rounded-xl focus:ring-1 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none text-xs text-medium"
                  >
                    <option value="Nursery">Nursery</option>
                    <option value="LKG">LKG</option>
                    <option value="UKG">UKG</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                    Section
                  </label>
                  <select
                    id="form_student_section"
                    value={formData.section}
                    onChange={(e) => setFormData(p => ({ ...p, section: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-955 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-850 rounded-xl focus:ring-1 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none text-xs text-medium"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    id="form_student_dob"
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData(p => ({ ...p, dob: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-850 rounded-xl focus:ring-1 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none text-xs text-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                    Gender
                  </label>
                  <div className="flex gap-4 pt-1">
                    {["Male", "Female", "Other"].map(g => (
                      <label key={g} className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="form_gender_select"
                          value={g}
                          checked={formData.gender === g}
                          onChange={() => setFormData(p => ({ ...p, gender: g as any }))}
                          className="text-indigo-600 focus:ring-indigo-500/20"
                        />
                        <span>{g}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                    Admission Date
                  </label>
                  <input
                    id="form_student_add_date"
                    type="date"
                    required
                    value={formData.admissionDate}
                    onChange={(e) => setFormData(p => ({ ...p, admissionDate: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-955 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-850 rounded-xl focus:ring-1 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none text-xs text-medium"
                  />
                </div>
              </div>

              {/* Parents details inputs */}
              <div className="border-t border-gray-100 dark:border-gray-800/80 pt-5 space-y-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Parent / Guardian Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                      Guardian’s Name
                    </label>
                    <input
                      id="form_student_parent_name"
                      type="text"
                      required
                      value={formData.parentName}
                      onChange={(e) => setFormData(p => ({ ...p, parentName: e.target.value }))}
                      className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-855 rounded-xl focus:ring-1 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none text-xs text-medium"
                      placeholder="e.g. Martha Rodriguez"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                      Parent Contact Phone
                    </label>
                    <input
                      id="form_student_parent_phone"
                      type="text"
                      required
                      value={formData.parentPhone}
                      onChange={(e) => setFormData(p => ({ ...p, parentPhone: e.target.value }))}
                      className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-855 rounded-xl focus:ring-1 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none text-xs text-medium font-mono"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                    Billing / Residential Address
                  </label>
                  <textarea
                    id="form_student_address"
                    required
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-855 rounded-xl focus:ring-1 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none text-xs text-medium leading-tight"
                    placeholder="Enter complete residential address"
                  />
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="border-t border-gray-100 dark:border-gray-800/80 pt-4 flex justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-855 text-xs text-gray-650 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white border-none rounded-xl text-xs font-semibold cursor-pointer active:scale-98 transition-all shadow-lg shadow-indigo-600/10"
                >
                  {formData.id ? "Apply Changes" : "Create Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple Helper function to wrap custom gender colors
function UserIconWrapper({ gender }: { gender: string }) {
  if (gender === "Female") {
    return <User className="w-4.5 h-4.5 text-pink-500 animate-pulse" />;
  }
  return <User className="w-4.5 h-4.5 text-blue-500" />;
}
```
