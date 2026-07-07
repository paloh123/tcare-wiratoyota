"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Cpu, ChevronRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("System Access Denied. Invalid credentials.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("System Error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#020617]">
      {/* Background Tech Elements */}
      <div className="absolute inset-0 z-0 bg-grid-pattern opacity-40"></div>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-electric-cyan/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-electric-blue/10 rounded-full blur-[150px] pointer-events-none"></div>
      
      <div className="max-w-md w-full space-y-8 glass-card p-10 z-10 animate-fade-in-scale border-t border-l border-white/10 shadow-[0_0_80px_rgba(34,211,238,0.15)] relative overflow-hidden group">
        
        {/* Shine effect on card */}
        <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-5 group-hover:animate-[material-sheen_2s_ease-in-out]"></div>

        <div className="text-center relative z-10">
          <div className="mx-auto h-20 w-20 rounded-2xl flex items-center justify-center mb-6 relative animate-float">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl opacity-20 blur-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0f172a] to-[#1e293b] border border-cyan-500/30 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.2)]"></div>
            <Cpu className="h-10 w-10 text-cyan-400 relative z-10 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </div>
          <h2 className="mt-2 text-3xl font-extrabold font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400 drop-shadow-sm">
            T-CARE SYSTEM
          </h2>
          <p className="mt-3 text-sm font-medium text-cyan-500/70 tracking-widest uppercase">
            Wira Toyota Network
          </p>
        </div>
        
        <form className="mt-10 space-y-6 relative z-10" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm text-center font-medium animate-fade-in shadow-[0_0_15px_rgba(255,0,51,0.2)] flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            <div className="relative group/input">
              <label htmlFor="username" className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Operator ID
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none block w-full px-5 py-4 bg-slate-900/50 border border-slate-700/50 text-white rounded-xl focus:outline-none focus:ring-0 focus:border-cyan-400/50 sm:text-sm transition-all duration-300 shadow-inner group-hover/input:border-slate-600"
                  placeholder="Enter your ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <div className="absolute inset-0 rounded-xl pointer-events-none border border-transparent peer-focus:border-cyan-400/30 peer-focus:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-300"></div>
              </div>
            </div>
            
            <div className="relative group/input">
              <label htmlFor="password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Access Code
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-5 py-4 bg-slate-900/50 border border-slate-700/50 text-white rounded-xl focus:outline-none focus:ring-0 focus:border-cyan-400/50 sm:text-sm transition-all duration-300 shadow-inner group-hover/input:border-slate-600"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-0 rounded-xl pointer-events-none border border-transparent peer-focus:border-cyan-400/30 peer-focus:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-300"></div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <span className="relative z-10 flex items-center gap-2">
                {loading ? "INITIALIZING..." : "INITIALIZE LOGIN"}
                {!loading && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
