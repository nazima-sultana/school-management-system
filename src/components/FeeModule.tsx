import React, { useState, useEffect } from "react";
import {
  CircleDollarSign,
  Search,
  Edit2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Calendar,
  Layers,
  X
} from "lucide-react";

interface FeeModuleProps {
  token: string;
}

interface FeeJoinedItem {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  classVal: string;
  feeStatus: "Paid" | "Pending" | "Partially Paid";
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  paymentDate?: string;
}

export default function FeeModule({ token }: FeeModuleProps) {
  const [feeLedger, setFeeLedger] = useState<FeeJoinedItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FeeJoinedItem | null>(null);
  const [editTotal, setEditTotal] = useState("");
  const [editPaid, setEditPaid] = useState("");
  const [editDate, setEditDate] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchFeeLedger = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/fees", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Could not acquire fee ledgers.");
      const data = await response.json();
      setFeeLedger(data);
    } catch (err: any) {
      setError(err.message || "Failed to load fee ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeLedger();
  }, [token]);

  const handleEditClick = (record: FeeJoinedItem) => {
    setSelectedRecord(record);
    setEditTotal(String(record.totalFee));
    setEditPaid(String(record.paidAmount));
    setEditDate(record.paymentDate || new Date().toISOString().split("T")[0]);
    setIsEditOpen(true);
  };

  const handleUpdateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/fees/${selectedRecord.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          totalFee: Number(editTotal),
          paidAmount: Number(editPaid),
          paymentDate: editDate
        })
      });

      if (!response.ok) throw new Error("Could not update fee parameters.");
      setIsEditOpen(false);
      fetchFeeLedger();
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  // Filter local ledger entries by search query
  const filteredLedger = feeLedger.filter(item =>
    item.studentName.toLowerCase().includes(search.toLowerCase()) ||
    item.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
    item.classVal.toLowerCase().includes(search.toLowerCase())
  );

  // Status badges
  const getStatusBadge = (status: "Paid" | "Pending" | "Partially Paid") => {
    switch (status) {
      case "Paid":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-450 border border-emerald-150 rounded-full text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Fully Paid</span>
          </span>
        );
      case "Partially Paid":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-95/30 text-amber-700 dark:text-amber-500 border border-amber-150 rounded-full text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Partially Paid</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-95/30 text-rose-700 dark:text-rose-450 border border-rose-150 rounded-full text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            <span>Outstanding</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-fade-in overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Module Title controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Institutional Billing Ledger
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Audit tuition dues, log paid transactions, and update student billing accounts.
          </p>
        </div>
      </div>

      {/* Filtering Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            id="billing_search_input"
            type="text"
            placeholder="Search ledgers by Student Name or Roll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-55 dark:bg-gray-955 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-505/20 text-xs"
          />
        </div>
        <div className="text-[11px] font-semibold text-gray-450 dark:text-gray-500 ml-auto select-none">
          Showing {filteredLedger.length} invoice sheets
        </div>
      </div>

      {/* Main ledger database results */}
      {loading ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[250px]">
          <Loader2 className="w-7 h-7 text-indigo-500 animate-spin mb-3.5" />
          <p className="text-xs text-gray-400 dark:text-gray-500">Querying financial databases...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-450">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : filteredLedger.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No invoice accounts found under current tags.</p>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-805 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-55 dark:bg-gray-955/10 border-b border-gray-100 dark:border-gray-800 text-[10px] font-semibold text-gray-450 dark:text-gray-500 uppercase tracking-widest">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Fee Status</th>
                  <th className="px-6 py-4">Invoiced Size</th>
                  <th className="px-6 py-4">Paid Credits</th>
                  <th className="px-6 py-4">Dues Outstanding</th>
                  <th className="px-6 py-4">Payment Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-805 font-medium text-xs">
                {filteredLedger.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/10">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white capitalize">{item.studentName}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-mono">Roll: {item.rollNumber} • {item.classVal}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.feeStatus)}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-750 dark:text-gray-300 font-mono">
                      ${Number(item.totalFee).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      ${Number(item.paidAmount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-rose-500 dark:text-rose-400 font-mono">
                      ${Number(item.pendingAmount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono font-medium">
                      {item.paymentDate || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="px-3.5 py-1.5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-650 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-300 hover:border-indigo-150 dark:hover:border-indigo-900 rounded-xl cursor-pointer font-bold transition-all flex items-center gap-1.5 ml-auto text-[10px]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Manage Account</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT MODAL DIALOG */}
      {isEditOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-xl relative overflow-hidden flex flex-col p-6 animate-scale-up">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-850 cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-650 dark:text-indigo-400">
                <CircleDollarSign className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white leading-tight">
                  Log Dues: {selectedRecord.studentName}
                </h3>
                <p className="text-[10px] text-gray-400 tracking-wider font-mono mt-0.5">
                  Roll: {selectedRecord.rollNumber} • {selectedRecord.classVal}
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateFee} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                  Total Term Fee ($)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 font-bold">$</span>
                  <input
                    id="edit_total_fee_input"
                    type="number"
                    min={0}
                    required
                    value={editTotal}
                    onChange={(e) => setEditTotal(e.target.value)}
                    className="w-full pl-7 pr-3.5 py-2 bg-gray-55 dark:bg-gray-955 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-805 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-505/20 text-medium font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                  Amount Paid ($)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 font-bold">$</span>
                  <input
                    id="edit_paid_fee_input"
                    type="number"
                    min={0}
                    max={Number(editTotal)}
                    required
                    value={editPaid}
                    onChange={(e) => setEditPaid(e.target.value)}
                    className="w-full pl-7 pr-3.5 py-2 bg-gray-55 dark:bg-gray-955 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-805 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-505/20 text-medium font-mono"
                  />
                </div>
                {Number(editPaid) > Number(editTotal) && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-1">Paid amount cannot exceed total terms fee.</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                  Outstanding Balance (Auto-Calculated)
                </label>
                <div className="w-full bg-gray-50 dark:bg-gray-950 p-2.5 rounded-xl border border-gray-200/55 dark:border-gray-805 font-mono text-xs font-bold text-rose-500">
                  ${Math.max(0, Number(editTotal) - Number(editPaid))} dues remaining
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                  Payment Transaction Date
                </label>
                <input
                  id="edit_payment_date_input"
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-55 dark:bg-gray-955 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-855 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-501/20 font-mono"
                />
              </div>

              <div className="pt-3.5 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-650 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-855 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || Number(editPaid) > Number(editTotal)}
                  className="px-4.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer transition-colors border-none"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Ledger Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
