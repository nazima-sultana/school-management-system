import React, { useState } from "react";
import { Lock, User, AlertCircle, ShieldEllipsis, ArrowRight } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: (token: string, userData: { id: string; username: string; name: string }) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please fill out both fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (username === "admin" && password === "admin123") {
        onLoginSuccess("demo-token-123", {
          id: "admin-1",
          username: "admin",
          name: "Administrator"
        });
      } else {
        throw new Error("Invalid username or password.");
      }
    } catch (err: any) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 transition-colors duration-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -ml-16 -mb-16" />

        <div className="flex flex-col items-center mb-8 relative">
          <div className="w-14 h-14 bg-indigo-500 dark:bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 mb-4 transform hover:rotate-6 transition-transform duration-200">
            <ShieldEllipsis className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-sans text-gray-900 dark:text-white tracking-tight text-center">
            Lyceum Admin Panel
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
            School Management System Secure Login
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/30 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-300 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                <User className="w-5 h-5" />
              </span>
              <input
                id="login_username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans text-sm"
                placeholder="Name of account (e.g. admin)"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Password
              </label>
              <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
                Hint: admin123
              </span>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                <Lock className="w-5 h-5" />
              </span>
              <input
                id="login_password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans text-sm"
                placeholder="Your secret code"
                required
              />
            </div>
          </div>

          <button
            id="login_submit"
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:translate-y-[1px] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Access Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800/80 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            For demonstration authorization parameters are: <br />
            <code className="bg-gray-100 dark:bg-gray-950 px-1 py-0.5 rounded font-mono">admin</code> / <code className="bg-gray-100 dark:bg-gray-950 px-1 py-0.5 rounded font-mono">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
    }
