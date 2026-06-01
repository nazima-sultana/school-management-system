import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Plus,
  Trash2,
  Printer,
  FileCheck2,
  Loader2,
  AlertCircle,
  PlusCircle,
  Search,
  Check,
  User,
  Sparkles
} from "lucide-react";
import { Student, Marks } from "../types";

interface MarksModuleProps {
  token: string;
}

export default function MarksModule({ token }: MarksModuleProps) {
  // Roster variables
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [search, setSearch] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Marks variables
  const [marks, setMarks] = useState<Marks[]>([]);
  const [loadingMarks, setLoadingMarks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline forms
  const [newSubject, setNewSubject] = useState("");
  const [newScore, setNewScore] = useState("");
  const [newMaxScore, setNewMaxScore] = useState("100");
  const [savingMark, setSavingMark] = useState(false);

  // Edit states
  const [editingMarkId, setEditingMarkId] = useState<string | null>(null);
  const [editingScore, setEditingScore] = useState("");

  const fetchStudentsList = async () => {
    try {
      const response = await fetch(`/api/students?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Could not download student list.");
      const data = await response.json();
      setStudents(data.students);
      if (data.students.length > 0 && !selectedStudent) {
        setSelectedStudent(data.students[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load students list.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchStudentMarks = async (studentId: string) => {
    setLoadingMarks(true);
    setError(null);
    try {
      const response = await fetch(`/api/marks/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Could not acquire score entries.");
      const data = await response.json();
      setMarks(data);
    } catch (err: any) {
      setError(err.message || "Failed to load student scores.");
    } finally {
      setLoadingMarks(false);
    }
  };

  useEffect(() => {
    fetchStudentsList();
  }, [token]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentMarks(selectedStudent.id);
    }
  }, [selectedStudent]);

  // Insert or Update Mark logic
  const handleAddMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !newSubject.trim() || !newScore) return;

    setSavingMark(true);
    try {
      const response = await fetch("/api/marks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          subject: newSubject.trim(),
          score: Number(newScore),
          maxScore: Number(newMaxScore)
        })
      });

      if (!response.ok) throw new Error("Could not save score record.");
      fetchStudentMarks(selectedStudent.id);
      setNewSubject("");
      setNewScore("");
    } catch (err: any) {
      alert(err.message || "Error adding subject score.");
    } finally {
      setSavingMark(false);
    }
  };

  // Delete specific subject mark
  const handleDeleteMark = async (id: string) => {
    if (!window.confirm("Delete this subject mark row?")) return;
    try {
      const response = await fetch(`/api/marks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Delete failed.");
      setMarks(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    }
  };

  // Inline edit confirmation
  const handleStartEdit = (mId: string, currentVal: number) => {
    setEditingMarkId(mId);
    setEditingScore(String(currentVal));
  };

  const handleSaveEdit = async (mId: string, item: Marks) => {
    if (!editingScore || isNaN(Number(editingScore))) return;
    try {
      const response = await fetch(`/api/marks/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ score: Number(editingScore), maxScore: item.maxScore })
      });
      if (!response.ok) throw new Error("Failed to edit score.");
      setEditingMarkId(null);
      fetchStudentMarks(selectedStudent!.id);
    } catch (err: any) {
      alert(err.message || "Failed to update record.");
    }
  };

  // Calculate Cumulative Metrics
  const totalScore = marks.reduce((sum, m) => sum + Number(m.score || 0), 0);
  const totalMaxScore = marks.reduce((sum, m) => sum + Number(m.maxScore || 100), 0);
  const overallPercentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

  // Grade classification
  const getLetterGradeAndStatus = (percent: number) => {
    if (percent >= 90) return { grade: "A+", label: "Outstanding", color: "text-emerald-500", pass: true };
    if (percent >= 80) return { grade: "A", label: "Very Good", color: "text-emerald-500", pass: true };
    if (percent >= 70) return { grade: "B", label: "Good", color: "text-indigo-500", pass: true };
    if (percent >= 60) return { grade: "C", label: "Satisfactory", color: "text-amber-500", pass: true };
    if (percent >= 50) return { grade: "D", label: "Pass", color: "text-amber-500", pass: true };
    return { grade: "F", label: "Fail", color: "text-rose-500", pass: false };
  };

  const gradeInfo = getLetterGradeAndStatus(overallPercentage);

  // Trigger browser print workflow
  const handlePrintReportCard = () => {
    window.print();
  };

  // Filter roster names dynamically
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.classVal.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-fade-in overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Hide controls on Print layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-5 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Acadamics & Report Card Station
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Log subject-specific marks, edit student assessments, and execute printing for official Report Cards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Left: Students Navigation column */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-4 no-print lg:col-span-1">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">
            Student Roster Navigator
          </p>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search students list..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-gray-955 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-505/20 text-xs"
            />
          </div>

          {loadingStudents ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-6 h-6 text-indigo-550 animate-spin" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No matching student names.</p>
          ) : (
            <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
              {filteredStudents.map((std) => (
                <button
                  key={std.id}
                  onClick={() => setSelectedStudent(std)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer border ${
                    selectedStudent?.id === std.id
                      ? "bg-indigo-50 border-indigo-150 dark:bg-indigo-950/40 dark:border-indigo-900 text-indigo-700 dark:text-indigo-350"
                      : "bg-white border-transparent hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-850 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-850 flex items-center justify-center font-bold text-indigo-650 dark:text-indigo-400 shrink-0 capitalize">
                    {std.name.substring(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate">{std.name}</p>
                    <p className="text-[10px] text-gray-400 tracking-wider font-mono font-medium mt-0.5">
                      Roll: {std.rollNumber} • {std.classVal}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Scores Editor & Beautiful Transcript Certificate (Printable!) */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8 w-full">
          {selectedStudent ? (
            <>
              {/* Score entry controller form */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 sm:p-6 space-y-5 no-print">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800/80 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Enter Subject Performance for {selectedStudent.name}
                    </h3>
                    <p className="text-[11px] text-gray-400 tracking-wide mt-0.5">
                      Log subject scores, alter existing records, and instantly review GPA averages.
                    </p>
                  </div>
                </div>

                {/* Score entry grid */}
                <form onSubmit={handleAddMark} className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 items-end bg-gray-55 dark:bg-gray-955 p-3.5 rounded-xl border border-gray-200/50 dark:border-gray-805">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                      Subject Title
                    </label>
                    <input
                      id="form_subject_name"
                      type="text"
                      required
                      placeholder="e.g. Mathematics, History"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 col-span-1">
                      Marks Scored
                    </label>
                    <input
                      id="form_subject_score"
                      type="number"
                      min={0}
                      max={100}
                      required
                      placeholder="e.g. 85"
                      value={newScore}
                      onChange={(e) => setNewScore(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingMark}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 h-9 transition-colors border-none shrink-0"
                  >
                    {savingMark ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                    <span>Add Score</span>
                  </button>
                </form>

                {/* Score listing list */}
                {loadingMarks ? (
                  <div className="py-6 flex justify-center">
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                  </div>
                ) : marks.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4 bg-gray-50/50 dark:bg-gray-955 p-4 rounded-xl">No academic marks recorded for this student. Use the form above to add scored subjects!</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800/80 uppercase font-bold text-gray-400 tracking-wider">
                          <th className="py-2.5">Subject</th>
                          <th className="py-2.5">Academic Score</th>
                          <th className="py-2.5">Maximum Reference</th>
                          <th className="py-2.5 text-right">Settings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-medium">
                        {marks.map((item) => {
                          const isEditing = editingMarkId === item.id;
                          return (
                            <tr key={item.id} className="hover:bg-gray-50/20 dark:hover:bg-gray-850/10">
                              <td className="py-3 font-semibold text-gray-850 dark:text-gray-200">{item.subject}</td>
                              <td className="py-3">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={editingScore}
                                    onChange={(e) => setEditingScore(e.target.value)}
                                    className="w-16 px-1 py-0.5 bg-gray-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded font-bold text-xs"
                                  />
                                ) : (
                                  <span className="font-bold text-gray-900 dark:text-white">{item.score}</span>
                                )}
                              </td>
                              <td className="py-3 text-gray-500 font-mono">{item.maxScore}</td>
                              <td className="py-3 text-right">
                                <div className="flex items-center justify-end gap-2.5">
                                  {isEditing ? (
                                    <button
                                      onClick={() => handleSaveEdit(item.id, item)}
                                      className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-750 dark:bg-indigo-950/45 dark:border-indigo-900 dark:text-indigo-400 font-bold rounded hover:bg-indigo-100 transition-colors cursor-pointer"
                                    >
                                      Save
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleStartEdit(item.id, item.score)}
                                      className="text-[11px] text-gray-400 hover:text-indigo-500 transition-colors cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteMark(item.id)}
                                    className="text-gray-400 hover:text-rose-500 transition-all cursor-pointer"
                                    title="Delete mark entry"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* REPORT CARD TEMPLATE CERTIFICATE (Printable!) */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl overflow-hidden print-container print-only relative">
                {/* Visual side ribbon decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full blur-xl no-print" />

                {/* Print button container - Hidden elements under printing layout */}
                <div className="p-4 bg-gray-50 dark:bg-gray-950/50 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between no-print">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
                    <span>Report Card generated successfully</span>
                  </span>
                  <button
                    onClick={handlePrintReportCard}
                    className="px-4.5 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-650/15"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Report Card</span>
                  </button>
                </div>

                {/* Formally formatted Report Card Grid inside transcript sheet */}
                <div className="p-6 sm:p-10 space-y-8 print:p-2">
                  <div className="text-center space-y-1 bg-gray-50/25 dark:bg-gray-955/20 border border-gray-150 dark:border-gray-850 p-5 rounded-2xl relative">
                    <h1 className="text-2xl font-black font-sans tracking-tight text-gray-900 dark:text-white uppercase">
                      Lyceum Acadamic Institution
                    </h1>
                    <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 font-mono">
                      Official Transcripts & Progress Evaluation
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">Status: Certified Academic Roster • Term: {new Date().getFullYear()}</p>
                  </div>

                  {/* Student Credentials Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-55 dark:bg-gray-955 p-4 rounded-xl border border-gray-150/40 dark:border-gray-850 font-sans">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block leading-tight">Student Name</span>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1 block">{selectedStudent.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block leading-tight">Roll Number</span>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1 block font-mono">{selectedStudent.rollNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block leading-tight">Admission ID</span>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1 block font-mono">{selectedStudent.admissionNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block leading-tight">Class Placement</span>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1 block leading-tight">{selectedStudent.classVal} ({selectedStudent.section})</span>
                    </div>
                  </div>

                  {/* Transcripts List Table */}
                  <div className="border border-gray-150 dark:border-gray-805 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-150 dark:border-gray-805 text-gray-400 font-bold uppercase tracking-wider">
                          <th className="px-5 py-3">Subject</th>
                          <th className="px-5 py-3">Reference Weight</th>
                          <th className="px-5 py-3 text-right">Academic Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150 dark:divide-gray-805 font-medium">
                        {marks.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-5 py-8 text-center text-gray-400 italic">No evaluated subject data.</td>
                          </tr>
                        ) : (
                          marks.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/10">
                              <td className="px-5 py-3 font-semibold text-gray-800 dark:text-gray-200">{item.subject}</td>
                              <td className="px-5 py-3 text-gray-400 font-mono">100 Max</td>
                              <td className="px-5 py-3 text-right font-bold text-gray-950 dark:text-white font-mono">{item.score} / {item.maxScore}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Calculations & Letter Grade Snapshot */}
                  {marks.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center border-t border-gray-155 dark:border-gray-805 pt-6 font-sans">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
                          <span>Total Scored Points:</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200 font-mono">{totalScore} / {totalMaxScore}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium pb-2 border-b border-gray-100 dark:border-gray-850">
                          <span>Overall Marks Rate:</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200 font-mono">{overallPercentage}%</span>
                        </div>
                      </div>

                      <div className="bg-gray-55 dark:bg-gray-955 p-4 rounded-xl border border-gray-150/50 dark:border-gray-850 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Academic Assessment</p>
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className={`text-2xl font-black ${gradeInfo.color}`}>{gradeInfo.grade}</span>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{gradeInfo.label}</span>
                          </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-xs ${
                          gradeInfo.pass
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-150"
                            : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 border border-rose-150"
                        }`}>
                          {gradeInfo.pass ? "Promotion Granted" : "Review Recommended"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Registrar signatures */}
                  <div className="grid grid-cols-2 gap-12 pt-12 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-100 dark:border-gray-850 font-mono">
                    <div className="border-t border-dashed border-gray-300 dark:border-gray-700 pt-3">
                      Academic Registrar
                    </div>
                    <div className="border-t border-dashed border-gray-300 dark:border-gray-700 pt-3">
                      Principal’s Seal
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-105 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-400 font-sans">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-3.5" />
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Select a student on the left menu to manage their grades.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
