"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  UploadCloud,
  Table2,
  DollarSign,
  Activity,
  ChevronRight,
  Users,
  LogOut,
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "KPI & Executive Summary",
  },
  {
    href: "/tracking-r3",
    label: "Tracking R3",
    icon: Table2,
    description: "Master Data Radar",
  },
  {
    href: "/data-import",
    label: "Data Import",
    icon: UploadCloud,
    description: "Sinkronisasi Sistem",
  },
  {
    href: "/pricing",
    label: "Pricing Matrix",
    icon: DollarSign,
    description: "Labour & Part Costs",
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const items = [...navItems]
  if (session?.user?.role === "SERVICE_MANAGER") {
    items.push({
      href: "/users",
      label: "User Management",
      icon: Users,
      description: "Manage system access",
    })
  }

  return (
    <aside className="w-full h-full flex flex-col bg-[#020617] border-r border-white/[0.05] shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-50">
      {/* Logo Area */}
      <div className="p-6 border-b border-white/[0.05] flex items-center gap-4 shrink-0">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <Activity className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-[#020617] shadow-[0_0_10px_rgba(59,130,246,1)] animate-pulse" />
        </div>
        <div>
          <div className="text-xl font-extrabold font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-400 tracking-tight">
            TCare R3
          </div>
          <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mt-0.5">
            Wira Toyota
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-6 pt-6 pb-2 shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Navigation
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-1">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? "bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]" 
                    : "hover:bg-white/[0.03] border border-transparent"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-nav-indicator"
                    className="absolute left-0 top-[15%] h-[70%] w-[3px] rounded-r-full bg-gradient-to-b from-cyan-400 to-purple-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                  />
                )}
                
                <div className={`p-2 rounded-lg ${isActive ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-white/[0.05] text-slate-400 border border-white/[0.05]"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold truncate ${isActive ? "text-cyan-50" : "text-slate-300"}`}>
                    {item.label}
                  </div>
                  <div className={`text-[10px] font-medium truncate mt-0.5 ${isActive ? "text-cyan-400/80" : "text-slate-500"}`}>
                    {item.description}
                  </div>
                </div>

                {isActive && (
                  <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0" />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Footer / User info */}
      <div className="p-4 border-t border-white/[0.05] shrink-0 bg-[#020617]">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-cyan-400">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-slate-200 truncate">
                {session?.user?.name || "User"}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">
                  {session?.user?.role || "Role"}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => signOut()}
            title="Sign out"
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
