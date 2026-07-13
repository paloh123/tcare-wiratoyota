"use client"

import React, { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShieldAlert,
  AlertTriangle,
  CalendarClock,
  Activity,
  Target,
  RefreshCw,
  Search,
  ChevronRight,
  PhoneCall,
  Calendar,
  MessageSquare
} from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import type { TrackingRow, Priority } from "@/lib/r3-engine"

const PRIORITY_CONFIG = {
  P1_RECOVERY: {
    label: "P1 Recovery",
    description: "Missed service / Lost to competitor. High risk of losing customer.",
    color: "#ef4444", // red-500
    glow: "rgba(239, 68, 68, 0.4)",
    icon: ShieldAlert,
    action: "Call Customer",
    actionIcon: PhoneCall,
  },
  P2_REMINDER: {
    label: "P2 Reminder",
    description: "Service due within 30 days. Need to confirm appointment.",
    color: "#f59e0b", // amber-500
    glow: "rgba(245, 158, 11, 0.4)",
    icon: AlertTriangle,
    action: "Send Reminder",
    actionIcon: MessageSquare,
  },
  P3_BOOKING: {
    label: "P3 Booking Plan",
    description: "Service due between 31 - 90 days. Plan for future booking.",
    color: "#22c55e", // green-500
    glow: "rgba(34, 197, 94, 0.4)",
    icon: CalendarClock,
    action: "Plan Booking",
    actionIcon: Calendar,
  },
  MONITORING: {
    label: "Monitoring",
    description: "Service completed recently or due > 90 days. Track lifecycle.",
    color: "#94a3b8", // slate-400
    glow: "rgba(148, 163, 184, 0.4)",
    icon: Activity,
    action: "View Details",
    actionIcon: ChevronRight,
  }
}

type SerializableTrackingRow = Omit<TrackingRow, 'tanggalDelivery' | 'nextDueDate' | 'intervals'> & {
  tanggalDelivery: string
  nextDueDate: string | null
  intervals: Array<Omit<TrackingRow['intervals'][0], 'predDate' | 'actualDate'> & {
    predDate: string
    actualDate: string | null
  }>
}

export default function PriorityActionPage() {
  const [data, setData] = useState<SerializableTrackingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activePriority, setActivePriority] = useState<Priority>("P1_RECOVERY")
  const [search, setSearch] = useState("")

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/tracking-r3")
      if (res.ok) {
        const rows = await res.json()
        setData(rows)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const counts = useMemo(() => {
    return {
      P1_RECOVERY: data.filter(r => r.priority === "P1_RECOVERY").length,
      P2_REMINDER: data.filter(r => r.priority === "P2_REMINDER").length,
      P3_BOOKING: data.filter(r => r.priority === "P3_BOOKING").length,
      MONITORING: data.filter(r => r.priority === "MONITORING").length,
    }
  }, [data])

  const filteredData = useMemo(() => {
    return data.filter(row => {
      if (row.priority !== activePriority) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          row.vin.toLowerCase().includes(q) ||
          row.customer.toLowerCase().includes(q) ||
          row.noPolisi.toLowerCase().includes(q) ||
          row.type.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [data, activePriority, search])

  const activeConfig = PRIORITY_CONFIG[activePriority]

  return (
    <div className="animate-fade-in pb-12">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <motion.div 
          key={activePriority}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px]" 
          style={{ background: `radial-gradient(circle, ${activeConfig.color}20 0%, transparent 70%)` }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <Target className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">Action Plan</h1>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Strategic Follow-up Execution
                </p>
              </div>
            </div>
          </div>
          <button onClick={fetchData} className="btn-primary group w-fit">
            <RefreshCw className="w-4 h-4 transition-transform duration-500 group-hover:rotate-180" />
            Sync Data
          </button>
        </div>

        {/* Priority Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((key) => {
            const config = PRIORITY_CONFIG[key]
            const Icon = config.icon
            const isActive = activePriority === key
            const count = counts[key]

            return (
              <motion.button
                key={key}
                onClick={() => setActivePriority(key)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className={`relative text-left p-6 rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isActive 
                    ? "bg-[#0a0f1e] shadow-2xl"
                    : "bg-[#020617]/50 border-white/[0.05] hover:bg-white/[0.02]"
                }`}
                style={{
                  borderColor: isActive ? config.color : undefined,
                  boxShadow: isActive ? `0 10px 40px -10px ${config.glow}` : undefined,
                }}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-priority-bg"
                    className="absolute inset-0 opacity-10"
                    style={{ background: `linear-gradient(135deg, ${config.color}, transparent)` }}
                  />
                )}
                
                <div className="relative z-10 flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl border ${isActive ? "bg-black/40 border-white/10" : "bg-white/[0.03] border-transparent"}`}>
                    <Icon className="w-6 h-6" style={{ color: config.color }} />
                  </div>
                  <span className={`font-display text-3xl font-extrabold ${isActive ? "text-white" : "text-slate-500"}`}>
                    {loading ? "..." : count}
                  </span>
                </div>
                
                <div className="relative z-10">
                  <h3 className={`font-bold text-lg mb-1 ${isActive ? "text-white" : "text-slate-300"}`}>
                    {config.label}
                  </h3>
                  <p className={`text-xs font-medium line-clamp-2 ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                    {config.description}
                  </p>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeConfig.label} customers...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm font-bold text-white shrink-0">
            <span style={{ color: activeConfig.color }}>{filteredData.length}</span>
            <span className="text-slate-400">Unit{filteredData.length !== 1 ? 's' : ''} Found</span>
          </div>
        </div>

        {/* Data List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-white rounded-full animate-spin" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center border border-white/[0.05] rounded-3xl bg-black/20">
            <activeConfig.icon className="w-16 h-16 mb-4 opacity-20" style={{ color: activeConfig.color }} />
            <h3 className="text-xl font-bold text-white mb-2">No Units Found</h3>
            <p className="text-sm font-medium text-slate-500">
              There are no tracking units that match this priority or search filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredData.map((row, idx) => {
                const ActionIcon = activeConfig.actionIcon
                return (
                  <motion.div
                    key={row.vin}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                    className="group relative flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-[#0a0f1e]/80 border border-white/[0.05] hover:border-white/[0.1] hover:bg-[#0a0f1e] transition-all duration-300"
                  >
                    {/* Left: Customer Info */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/[0.05]">
                            {row.vin}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20">
                            {row.noPolisi || "NO POLISI"}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white tracking-wide">{row.customer}</h3>
                        <div className="text-xs font-semibold text-slate-400">{row.type} &middot; {row.alamatKota}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Potensi Rev</div>
                          <div className="text-sm font-mono font-bold text-emerald-400">
                            {row.potensiRevenue > 0 ? formatCurrency(row.potensiRevenue) : "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Next Due</div>
                          <div className="text-sm font-bold text-white">
                            {row.nextDueDate ? formatDate(row.nextDueDate) : "—"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex sm:flex-col justify-between sm:justify-end gap-3 shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-white/[0.05] sm:pl-5">
                      <div className="text-left sm:text-right">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Salesman</div>
                        <div className="text-xs font-bold text-slate-300">{row.salesman || "—"}</div>
                        <div className="text-xs font-mono text-slate-400">{row.noHp || "—"}</div>
                      </div>
                      <button 
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-300"
                        style={{
                          background: `${activeConfig.color}15`,
                          color: activeConfig.color,
                          border: `1px solid ${activeConfig.color}30`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `${activeConfig.color}25`;
                          e.currentTarget.style.boxShadow = `0 0 15px ${activeConfig.glow}`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = `${activeConfig.color}15`;
                          e.currentTarget.style.boxShadow = `none`;
                        }}
                      >
                        <ActionIcon className="w-4 h-4" />
                        {activeConfig.action}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
