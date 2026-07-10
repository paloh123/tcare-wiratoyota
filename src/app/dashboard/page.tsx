"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp,
  Target,
  Car,
  MapPin,
  Building2,
  BarChart4,
  ChevronRight,
  RefreshCw,
  Award,
  Activity,
  Zap,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  Wallet,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  CalendarClock,
  Banknote
} from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"
import type { DashboardKPI } from "@/lib/r3-engine"

export default function DashboardPage() {
  const [kpi, setKpi] = useState<DashboardKPI | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  const fetchKPI = async (sync = false) => {
    if (sync) setIsSyncing(true)
    else setLoading(true)
    
    try {
      const res = await fetch("/api/dashboard")
      if (res.ok) {
        const data = await res.json()
        setKpi(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    fetchKPI()
  }, [])

  if (loading || !kpi) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative flex h-32 w-32 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-4 rounded-full border-r-2 border-purple-500 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
            <Activity className="h-10 w-10 text-cyan-400 animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h3 className="font-display text-xl font-bold text-white tracking-[0.2em] uppercase">Initializing Radar</h3>
            <p className="text-sm text-slate-500 font-mono">Decrypting telemetrics...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen pb-12">
      {/* Dynamic Cyberpunk Background meshes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
      </div>

      <header className="sticky top-0 z-40 -mx-4 mb-8 border-b border-white/[.04] bg-[#020617]/80 px-4 py-4 backdrop-blur-3xl sm:-mx-8 sm:px-8 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
              <Zap className="h-7 w-7 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1.5">
                <span>TCare R3 Engine</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-cyan-400 flex items-center gap-1.5 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]" />
                  Live Sync
                </span>
              </div>
              <h1 className="font-display text-2xl font-extrabold text-white sm:text-[28px] tracking-tight">
                Retention Recovery Radar <span className="text-white/30 font-medium ml-1">BJM</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={() => fetchKPI(true)} 
                disabled={isSyncing}
                className="sync-btn group flex items-center gap-2"
             >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-cyan-400' : 'group-hover:rotate-180 text-cyan-400 transition-transform duration-500'}`} />
                {isSyncing ? 'Syncing...' : 'Sync Data'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto relative z-10 px-0 sm:px-2 space-y-8">
        
        {/* KPI EKSEKUTIF */}
        <section>
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-cyan-400 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.1)]">
              <Activity className="h-4 w-4" />
              Executive Metrics
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7 gap-4"
          >
            <KPICard
              title="Total Tracking"
              value={formatNumber(kpi.totalVin)}
              subtitle="WO Aktif"
              icon={ClipboardList}
              iconColor="text-slate-300"
              iconBg="bg-slate-500/20 border-slate-500/30"
              trendPercent={100}
              trendDir="up"
            />
            <KPICard
              title="Income Wira"
              value={formatNumber(kpi.unitIncomeWira)}
              subtitle="Total WO"
              icon={Wallet}
              iconColor="text-emerald-400"
              iconBg="bg-emerald-500/20 border-emerald-500/30"
              glow="rgba(52,211,153,0.12)"
              trendPercent={100}
              trendDir="up"
            />
            <KPICard
              title="Lost Dealer"
              value={formatNumber(kpi.unitLostDealerLain)}
              subtitle="WO"
              icon={XCircle}
              iconColor="text-red-400"
              iconBg="bg-red-500/20 border-red-500/30"
              glow="rgba(248,113,113,0.12)"
              trendPercent={0}
              trendDir="neutral"
            />
            <KPICard
              title="Retention Rate"
              value={`${kpi.retentionRate.toFixed(1)}%`}
              subtitle="Kinerja Retensi"
              icon={ShieldCheck}
              iconColor="text-cyan-400"
              iconBg="bg-cyan-500/20 border-cyan-500/30"
              glow="rgba(34,211,238,0.12)"
              trendPercent={100}
              trendDir="up"
            />
            <KPICard
              title="Overdue (P1)"
              value={formatNumber(kpi.overdueItem)}
              subtitle="WO"
              icon={AlertTriangle}
              iconColor="text-red-400"
              iconBg="bg-red-500/20 border-red-500/30"
              glow="rgba(248,113,113,0.12)"
              trendPercent={100}
              trendDir="up"
            />
            <KPICard
              title="Due ≤30 (P2)"
              value={formatNumber(kpi.dueWithin30)}
              subtitle="WO"
              icon={CalendarClock}
              iconColor="text-amber-400"
              iconBg="bg-amber-500/20 border-amber-500/30"
              glow="rgba(245,158,11,0.12)"
              trendPercent={0}
              trendDir="neutral"
            />
            <KPICard
              title="Rev. Pipeline"
              value={formatCurrency(kpi.potensiRevenue)}
              subtitle="Total Potensi"
              icon={Banknote}
              iconColor="text-purple-400"
              iconBg="bg-purple-500/20 border-purple-500/30"
              glow="rgba(168,85,247,0.12)"
              trendPercent={100}
              trendDir="up"
              isCurrency
            />
          </motion.div>
        </section>

        {/* METRICS & BREAKDOWNS */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* REVENUE RECOVERY */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="enterprise-card p-6 sm:p-8 group"
          >
             <div className="absolute top-0 right-0 p-40 bg-gradient-to-bl from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl pointer-events-none" />
             <div className="mb-8 flex items-center gap-4 border-b border-white/[0.05] pb-5 relative z-10">
                <div className="rounded-xl bg-gradient-to-br from-cyan-500/20 to-transparent p-2.5 border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <TrendingUp className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-white tracking-wide">Revenue Recovery</h2>
                  <p className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mt-1">Financial Metrics Analysis</p>
                </div>
             </div>
             <div className="space-y-2 relative z-10">
                <Row label="Revenue Income WIRA (Aktual)" value={formatCurrency(kpi.revenueIncomeWira)} />
                <Row label="Revenue Lost ke Dealer Lain" value={formatCurrency(kpi.revenueLostDealerLain)} />
                
                <div className="my-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">Total Revenue Tertangkap</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">{formatCurrency(kpi.totalRevenueTertangkap)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Potensi Rev. Pipeline</span>
                    <span className="text-lg font-mono font-bold text-cyan-400">{formatCurrency(kpi.potensiRevenue)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <ProgressRow label="Market Share Wira" percent={kpi.marketShareWira} color="bg-emerald-400" shadowColor="rgba(52,211,153,0.5)" />
                  <ProgressRow label="Revenue Leakage" percent={kpi.revenueLeakage} color="bg-red-400" shadowColor="rgba(248,113,113,0.5)" />
                </div>
             </div>
          </motion.div>

          {/* PRIORITY BREAKDOWN */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="enterprise-card p-6 sm:p-8 group"
          >
             <div className="absolute top-0 right-0 p-40 bg-gradient-to-bl from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl pointer-events-none" />
             <div className="mb-8 flex items-center gap-4 border-b border-white/[0.05] pb-5 relative z-10">
                <div className="rounded-xl bg-gradient-to-br from-amber-500/20 to-transparent p-2.5 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <Target className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-white tracking-wide">Priority Breakdown</h2>
                  <p className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mt-1">Unit Allocation by Status</p>
                </div>
             </div>
             
             <div className="space-y-3 relative z-10">
                <PriorityCard level="P1 Recovery" count={kpi.priorityBreakdown.p1} badgeClass="badge-p1" plan="Call customer + offer TMS/booking rec" />
                <PriorityCard level="P2 Reminder" count={kpi.priorityBreakdown.p2} badgeClass="badge-p2" plan="Reminder H-30 dan buat appointment" />
                <PriorityCard level="P3 Booking Plan" count={kpi.priorityBreakdown.p3} badgeClass="badge-p3" plan="Masukkan ke booking plan MRA" />
                <PriorityCard level="Monitoring" count={kpi.priorityBreakdown.monitoring} badgeClass="badge-monitoring" plan="Monitor lifecycle" />
             </div>
          </motion.div>
        </section>

        {/* RANKINGS GRID */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* TOP SALESMAN RECOVERY */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="enterprise-card p-6 sm:p-8 group"
          >
             <div className="absolute top-0 left-0 p-40 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl pointer-events-none" />
             <div className="mb-6 flex items-center gap-4 border-b border-white/[0.05] pb-5 relative z-10">
                <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-transparent p-2.5 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                  <Award className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-white tracking-wide">Top Salesman Recovery</h2>
                  <p className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mt-1">Kontribusi Unit & Revenue Wira</p>
                </div>
             </div>
             <div className="overflow-x-auto relative z-10 -mx-6 px-6 sm:mx-0 sm:px-0">
               <table className="premium-table">
                 <thead>
                   <tr>
                     <th className="w-12 text-center">Rank</th>
                     <th>Salesman</th>
                     <th className="text-right">Unit Cover</th>
                     <th className="text-right">Total Revenue</th>
                   </tr>
                 </thead>
                 <tbody>
                   {kpi.topSalesman.length === 0 ? (
                     <tr><td colSpan={4} className="py-8 text-center text-xs font-medium text-slate-500 uppercase tracking-widest">Awaiting telemetrics</td></tr>
                   ) : (
                     kpi.topSalesman.map((s, idx) => (
                       <tr key={s.name}>
                         <td className="text-center">
                            {idx < 3 ? (
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${idx === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : idx === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/30' : 'bg-orange-600/20 text-orange-500 border border-orange-500/30'}`}>
                                {idx + 1}
                              </span>
                            ) : (
                              <span className="text-[13px] font-bold text-slate-500">{idx + 1}</span>
                            )}
                         </td>
                         <td className="font-bold text-white/90 truncate max-w-[120px]">{s.name}</td>
                         <td className="text-right font-mono text-[14px] font-bold text-purple-400">{formatNumber(s.count)}</td>
                         <td className="text-right font-mono text-[14px] font-medium text-emerald-400">{formatCurrency(s.revenue)}</td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
          </motion.div>

          {/* TOP 10 MODEL */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="enterprise-card p-6 sm:p-8 group"
          >
             <div className="absolute top-0 right-0 p-40 bg-gradient-to-bl from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl pointer-events-none" />
             <div className="mb-6 flex items-center gap-4 border-b border-white/[0.05] pb-5 relative z-10">
                <div className="rounded-xl bg-gradient-to-br from-cyan-500/20 to-transparent p-2.5 border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <Car className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-white tracking-wide">Top Models</h2>
                  <p className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mt-1">Vehicle Type Distribution</p>
                </div>
             </div>
             <div className="overflow-x-auto relative z-10 -mx-6 px-6 sm:mx-0 sm:px-0">
               <table className="premium-table">
                 <thead>
                   <tr>
                     <th>Model Variant</th>
                     <th className="text-right">Total Units</th>
                     <th className="pl-6 w-1/3">Volume Ratio</th>
                   </tr>
                 </thead>
                 <tbody>
                    {kpi.top10Models.length === 0 ? (
                      <tr><td colSpan={3} className="py-8 text-center text-xs font-medium text-slate-500 uppercase tracking-widest">Awaiting telemetrics</td></tr>
                    ) : (
                      kpi.top10Models.map(m => (
                        <ListRowWithBar key={m.name} label={m.name} value={m.count} max={kpi.top10Models[0].count} color="bg-cyan-400" shadowColor="rgba(34,211,238,0.5)" />
                      ))
                    )}
                 </tbody>
               </table>
             </div>
          </motion.div>

          {/* TOP 10 KOTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="enterprise-card p-6 sm:p-8 group"
          >
             <div className="absolute top-0 right-0 p-40 bg-gradient-to-bl from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl pointer-events-none" />
             <div className="mb-6 flex items-center gap-4 border-b border-white/[0.05] pb-5 relative z-10">
                <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-transparent p-2.5 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <MapPin className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-white tracking-wide">Top Demographics</h2>
                  <p className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mt-1">Customer City Origin</p>
                </div>
             </div>
             <div className="overflow-x-auto relative z-10 -mx-6 px-6 sm:mx-0 sm:px-0">
               <table className="premium-table">
                 <thead>
                   <tr>
                     <th>City / Regency</th>
                     <th className="text-right">Total Customers</th>
                     <th className="pl-6 w-1/3">Density</th>
                   </tr>
                 </thead>
                 <tbody>
                    {kpi.top10Cities.length === 0 ? (
                      <tr><td colSpan={3} className="py-8 text-center text-xs font-medium text-slate-500 uppercase tracking-widest">Awaiting telemetrics</td></tr>
                    ) : (
                      kpi.top10Cities.map(c => (
                        <ListRowWithBar key={c.name} label={c.name} value={c.count} max={kpi.top10Cities[0].count} color="bg-emerald-400" shadowColor="rgba(52,211,153,0.5)" />
                      ))
                    )}
                 </tbody>
               </table>
             </div>
          </motion.div>

          {/* TOP 10 KOMPETITOR */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="enterprise-card p-6 sm:p-8 group"
          >
             <div className="absolute top-0 right-0 p-40 bg-gradient-to-bl from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl pointer-events-none" />
             <div className="mb-6 flex items-center gap-4 border-b border-white/[0.05] pb-5 relative z-10">
                <div className="rounded-xl bg-gradient-to-br from-red-500/20 to-transparent p-2.5 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                  <ShieldAlert className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-white tracking-wide">Top Competitors</h2>
                  <p className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mt-1">Dealer Threat Analysis</p>
                </div>
             </div>
             <div className="overflow-x-auto relative z-10 -mx-6 px-6 sm:mx-0 sm:px-0">
               <table className="premium-table">
                 <thead>
                   <tr>
                     <th>Competitor Outlet</th>
                     <th className="text-right">Service Leaked</th>
                     <th className="pl-6 w-1/3">Threat Level</th>
                   </tr>
                 </thead>
                 <tbody>
                    {kpi.top10Competitors.length === 0 ? (
                      <tr><td colSpan={3} className="py-8 text-center text-xs font-medium text-slate-500 uppercase tracking-widest">Awaiting telemetrics</td></tr>
                    ) : (
                      kpi.top10Competitors.map(c => (
                        <ListRowWithBar key={c.name} label={c.name} value={c.count} max={kpi.top10Competitors[0].count} color="bg-red-400" shadowColor="rgba(248,113,113,0.5)" valueColor="text-red-400" />
                      ))
                    )}
                 </tbody>
               </table>
             </div>
          </motion.div>
        </section>

      </main>
    </div>
  )
}

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  glow,
  trendPercent,
  trendDir,
  isCurrency
}: {
  title: string
  value: string
  subtitle?: string
  icon?: React.ElementType
  iconColor?: string
  iconBg?: string
  glow?: string
  trendPercent?: number
  trendDir?: 'up' | 'down' | 'neutral'
  isCurrency?: boolean
}) {
  const trendColor =
    trendDir === 'up' ? 'text-emerald-400' :
    trendDir === 'down' ? 'text-red-400' :
    'text-amber-400'

  const trendBg =
    trendDir === 'up' ? 'bg-emerald-500/10 border-emerald-500/20' :
    trendDir === 'down' ? 'bg-red-500/10 border-red-500/20' :
    'bg-amber-500/10 border-amber-500/20'

  const TrendIcon = trendDir === 'up' ? ArrowUpRight : trendDir === 'down' ? ArrowDownRight : null

  return (
    <motion.div
      whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.12)', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}
      className="relative overflow-hidden rounded-2xl bg-[#0d1117] border border-white/[0.07] p-5 flex flex-col gap-3 min-h-[160px] cursor-default"
      style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.5)' }}
    >
      {/* Glow blob */}
      {glow && (
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-40 pointer-events-none"
          style={{ backgroundColor: glow }}
        />
      )}

      {/* Top row: icon + title */}
      <div className="flex items-center gap-3 relative z-10">
        {Icon && (
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl border ${iconBg || 'bg-slate-500/20 border-slate-500/30'} shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor || 'text-slate-300'}`} />
          </div>
        )}
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 leading-snug">{title}</span>
      </div>

      {/* Value */}
      <div className={`font-display font-extrabold tracking-tight leading-none relative z-10 ${isCurrency ? 'text-[18px]' : 'text-[34px]'} text-white`}>
        {value}
      </div>

      {/* Bottom: subtitle + trend */}
      <div className="flex items-center justify-between relative z-10 mt-auto gap-2 flex-wrap">
        {subtitle && (
          <span className="text-[12px] text-slate-500 font-semibold">{subtitle}</span>
        )}
        {trendPercent !== undefined && (
          <div className={`flex items-center gap-1 rounded-full border px-2.5 py-1 ${trendBg}`}>
            {TrendIcon && <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />}
            <span className={`text-[11px] font-bold ${trendColor}`}>{trendPercent}%</span>
            <span className="text-[10px] text-slate-500 font-medium">vs kemarin</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function Row({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between py-3.5 px-1 border-b border-white/[0.02] last:border-0">
      <span className="text-[13px] font-medium text-slate-400">{label}</span>
      <span className="text-[14px] font-mono font-medium text-white/90">{value}</span>
    </div>
  )
}

function ProgressRow({ label, percent, color, shadowColor }: { label: string, percent: number, color: string, shadowColor: string }) {
  return (
    <div className="py-3 px-1">
      <div className="flex justify-between text-[13px] mb-2">
        <span className="font-semibold text-white/90">{label}</span>
        <span className="font-mono font-bold text-white">{percent.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${color} rounded-full`} 
          style={{ boxShadow: `0 0 10px ${shadowColor}` }}
        />
      </div>
    </div>
  )
}

function PriorityCard({ level, count, badgeClass, plan }: { level: string, count: number, badgeClass: string, plan: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.03)' }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[16px] bg-white/[0.015] border border-white/[0.05] transition-colors"
    >
      <div className="flex items-center justify-between sm:justify-start gap-4 sm:w-1/2">
        <span className={badgeClass}>{level}</span>
        <span className="font-mono text-[16px] font-bold text-white">{formatNumber(count)}</span>
      </div>
      <div className="sm:w-1/2 flex sm:justify-end">
        <span className="inline-flex items-center rounded-lg bg-white/[0.03] px-3 py-1.5 text-[12px] font-medium text-slate-400 border border-white/[0.05]">
          {plan}
        </span>
      </div>
    </motion.div>
  )
}

function ListRowWithBar({ label, value, max, color, shadowColor, valueColor }: { label: string, value: number, max: number, color: string, shadowColor: string, valueColor?: string }) {
  const percent = Math.max(2, (value / max) * 100)
  return (
    <tr>
      <td>
        <span className="text-[12px] font-bold uppercase tracking-wider text-white/80">{label}</span>
      </td>
      <td className="text-right">
        <span className={`font-mono text-[14px] font-bold ${valueColor || 'text-white'}`}>{formatNumber(value)}</span>
      </td>
      <td className="pl-6 w-1/3">
        <div className="flex items-center h-full">
          <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${color} rounded-full`} 
              style={{ boxShadow: `0 0 8px ${shadowColor}` }}
            />
          </div>
        </div>
      </td>
    </tr>
  )
}
