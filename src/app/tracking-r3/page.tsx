"use client"

import { useEffect, useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
} from "@tanstack/react-table"
import {
  RefreshCw, Table2, ArrowUpDown, Download, Search,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from "lucide-react"
import { formatDate, formatCurrency, INTERVAL_LABELS, INTERVAL_ORDER } from "@/lib/utils"
import type { TrackingRow, Priority } from "@/lib/r3-engine"

const PRIORITY_LABELS: Record<Priority, string> = {
  P1_RECOVERY: "P1 Recovery",
  P2_REMINDER: "P2 Reminder",
  P3_BOOKING: "P3 Booking Plan",
  MONITORING: "Monitoring",
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const cls: Record<Priority, string> = {
    P1_RECOVERY: "badge-p1",
    P2_REMINDER: "badge-p2",
    P3_BOOKING: "badge-p3",
    MONITORING: "badge-monitoring",
  }
  const dot: Record<Priority, string> = {
    P1_RECOVERY: "#f87171",
    P2_REMINDER: "#fbbf24",
    P3_BOOKING: "#34d399",
    MONITORING: "#e2e8f0",
  }
  return (
    <span className={cls[priority]}>
      <span className="w-2 h-2 rounded-full inline-block shadow-[0_0_8px_currentColor]" style={{ background: dot[priority] }} />
      {PRIORITY_LABELS[priority]}
    </span>
  )
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-xs text-slate-600 font-medium">—</span>
  if (status === "WIRA") return <span className="badge-wira">Wira</span>
  return <span className="badge-dealer-lain">Dealer Lain</span>
}

function GapBadge({ gap }: { gap: number | null }) {
  if (gap === null) return <span className="text-xs text-slate-600 font-medium">—</span>
  const color = gap < -30 ? "#f87171" : gap < 0 ? "#fbbf24" : "#34d399"
  return (
    <span className="text-xs font-bold tracking-wide" style={{ color }}>
      {gap > 0 ? `+${gap}` : gap} hr
    </span>
  )
}

type SerializableTrackingRow = Omit<TrackingRow, 'tanggalDelivery' | 'nextDueDate' | 'intervals'> & {
  tanggalDelivery: string
  nextDueDate: string | null
  intervals: Array<Omit<TrackingRow['intervals'][0], 'predDate' | 'actualDate'> & {
    predDate: string
    actualDate: string | null
  }>
}

export default function TrackingR3Page() {
  const [data, setData] = useState<SerializableTrackingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  })

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

  useEffect(() => { fetchData() }, [])

  // Reset ke halaman 1 saat filter berubah
  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }, [priorityFilter, statusFilter, globalFilter])

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (priorityFilter !== "ALL" && row.priority !== priorityFilter) return false
      if (statusFilter !== "ALL") {
        const hasStatus = row.intervals.some((i) => i.statusDealer === statusFilter)
        if (!hasStatus) return false
      }
      if (globalFilter) {
        const q = globalFilter.toLowerCase()
        return (
          row.vin.toLowerCase().includes(q) ||
          row.customer.toLowerCase().includes(q) ||
          row.type.toLowerCase().includes(q) ||
          row.noPolisi.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [data, priorityFilter, statusFilter, globalFilter])

  const columns = useMemo<ColumnDef<SerializableTrackingRow>[]>(() => [
    {
      accessorKey: "vin",
      header: "VIN",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs font-bold tracking-wider text-teal-300">
          {getValue() as string}
        </span>
      ),
      size: 160,
    },
    {
      accessorKey: "noPolisi",
      header: "No. Polisi",
      cell: ({ getValue }) => <span className="text-xs font-bold tracking-wide text-slate-300">{(getValue() as string) || "—"}</span>,
      size: 100,
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ getValue }) => (
        <span className="font-bold text-white text-xs tracking-wide">{getValue() as string}</span>
      ),
      size: 150,
    },
    {
      accessorKey: "type",
      header: "Tipe",
      cell: ({ getValue }) => (
        <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
          {(getValue() as string) || "—"}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: "tanggalDelivery",
      header: "Delivery",
      cell: ({ getValue }) => (
        <span className="text-xs font-medium text-slate-300">{formatDate(getValue() as string)}</span>
      ),
      size: 110,
    },
    // Pred and Actual dates paired
    ...INTERVAL_ORDER.flatMap((interval, idx) => [
      {
        id: `pred_${interval}`,
        header: `Pred ${idx + 1}`,
        cell: ({ row }: { row: { original: SerializableTrackingRow } }) => {
          const iData = row.original.intervals[idx]
          if (!iData) return <span className="text-slate-600">—</span>
          return (
            <span className="text-xs font-medium text-slate-400">
              {formatDate(iData.predDate)}
            </span>
          )
        },
        size: 100,
      },
      {
        id: `actual_${interval}`,
        header: `Actual ${idx + 1}`,
        cell: ({ row }: { row: { original: SerializableTrackingRow } }) => {
          const iData = row.original.intervals[idx]
          if (!iData || !iData.actualDate) return <span className="text-slate-600">—</span>
          return (
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-white tracking-wide">{formatDate(iData.actualDate)}</div>
              <div className="flex items-center gap-2">
                <StatusBadge status={iData.statusDealer} />
                <GapBadge gap={iData.gapHari} />
              </div>
            </div>
          )
        },
        size: 130,
      }
    ]),
    {
      accessorKey: "nextDueDate",
      header: "Next Due",
      cell: ({ row }) => {
        const d = row.original.nextDueDate
        if (!d) return <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">Selesai</span>
        const daysLeft = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
        const color = daysLeft < 0 ? "#f87171" : daysLeft <= 30 ? "#fbbf24" : "#34d399"
        return (
          <div className="space-y-1">
            <div className="text-xs font-bold text-white tracking-wide">{formatDate(d)}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
              {daysLeft < 0 ? `${Math.abs(daysLeft)} hr lalu` : `${daysLeft} hr lagi`}
            </div>
          </div>
        )
      },
      size: 110,
    },
    {
      id: "nextInterval",
      header: "Next Interval",
      cell: ({ row }) => {
        const ni = row.original.nextInterval
        if (!ni) return <span className="text-slate-600">—</span>
        return <span className="text-xs font-semibold text-slate-300 tracking-wide">{INTERVAL_LABELS[ni]}</span>
      },
      size: 120,
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ getValue }) => <PriorityBadge priority={getValue() as Priority} />,
      size: 130,
    },
    {
      id: "incomeWira",
      header: "Income Wira",
      cell: ({ row }) => (
        <span className="text-xs font-bold tracking-wide text-emerald-400">
          {formatCurrency(row.original.incomeWira)}
        </span>
      ),
      size: 120,
    },
    {
      id: "lostDealerLain",
      header: "Lost",
      cell: ({ row }) => (
        <span className="text-xs font-bold tracking-wide text-rose-400">
          {row.original.lostDealerLain > 0 ? formatCurrency(row.original.lostDealerLain) : "—"}
        </span>
      ),
      size: 110,
    },
    {
      id: "potensiRevenue",
      header: "Potensi Rev",
      cell: ({ row }) => (
        <span className="text-xs font-bold tracking-wide text-amber-400">
          {row.original.potensiRevenue > 0 ? formatCurrency(row.original.potensiRevenue) : "—"}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: "salesman",
      header: "Salesman",
      cell: ({ getValue }) => (
        <span className="text-xs font-medium text-slate-400">{(getValue() as string) || "—"}</span>
      ),
      size: 120,
    },
    {
      accessorKey: "noHp",
      header: "No. HP",
      cell: ({ getValue }) => (
        <span className="text-xs font-mono font-medium text-slate-400 tracking-wide">{(getValue() as string) || "—"}</span>
      ),
      size: 120,
    },
  ], [])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  })

  const exportCSV = () => {
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = ["VIN", "No Polisi", "Customer", "No. HP", "Tipe", "Delivery", "Priority", "Next Due", "Income Wira", "Lost", "Potensi Rev"]
    const rows = filteredData.map((r) => [
      r.vin, r.noPolisi, r.customer, r.noHp || "", r.type,
      formatDate(r.tanggalDelivery),
      PRIORITY_LABELS[r.priority],
      r.nextDueDate ? formatDate(r.nextDueDate) : "—",
      r.incomeWira, r.lostDealerLain, r.potensiRevenue,
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tracking-r3-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const { pageIndex, pageSize } = table.getState().pagination
  const totalPages = table.getPageCount()

  // Hitung range nomor halaman yang ditampilkan
  const getPageNumbers = () => {
    const delta = 2
    const range: (number | "...")[] = []
    const left = Math.max(0, pageIndex - delta)
    const right = Math.min(totalPages - 1, pageIndex + delta)

    if (left > 0) {
      range.push(0)
      if (left > 1) range.push("...")
    }
    for (let i = left; i <= right; i++) range.push(i)
    if (right < totalPages - 1) {
      if (right < totalPages - 2) range.push("...")
      range.push(totalPages - 1)
    }
    return range
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="page-header mb-0">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-4 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(244,213,138,0.18), rgba(37,99,235,0.10), rgba(3,4,6,0.88))", border: "1px solid rgba(244,213,138,0.26)", boxShadow: "0 22px 42px rgba(0,0,0,0.42), 0 0 24px rgba(214,168,79,0.12), inset 0 1px 0 rgba(255,255,255,0.12)" }}>
              <Table2 className="w-6 h-6 text-[#f4d58a]" />
            </div>
            <h1 className="page-title mb-0">Tracking R3</h1>
          </div>
          <p className="page-subtitle">
            {filteredData.length} dari {data.length} unit di radar
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="btn-secondary group">
            <Download className="w-4 h-4 transition-transform group-hover:-translate-y-1" />
            Export CSV
          </button>
          <button onClick={fetchData} className="btn-primary group">
            <RefreshCw className="w-4 h-4 transition-transform duration-500 group-hover:rotate-180" />
            Sinkronisasi
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 mb-7 flex flex-wrap gap-4 items-center animate-slide-up relative overflow-hidden">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8f9aac]" />
          <input
            className="input-field pl-11"
            placeholder="Cari VIN, customer, atau tipe..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        <select
          className="input-field cursor-pointer font-semibold tracking-wide"
          style={{ width: "auto", minWidth: 180 }}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="ALL">Semua Prioritas</option>
          <option value="P1_RECOVERY">🔴 P1 Recovery</option>
          <option value="P2_REMINDER">🟡 P2 Reminder</option>
          <option value="P3_BOOKING">🟢 P3 Booking Plan</option>
          <option value="MONITORING">⚪ Monitoring</option>
        </select>
        <select
          className="input-field cursor-pointer font-semibold tracking-wide"
          style={{ width: "auto", minWidth: 160 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Semua Status</option>
          <option value="WIRA">Wira Toyota</option>
          <option value="DEALER_LAIN">Dealer Lain</option>
        </select>

        {/* Priority quick filter */}
        <div className="flex gap-2 ml-auto">
          {[
            { value: "P1_RECOVERY", label: "P1", color: "#f87171", bg: "rgba(248,113,113,0.1)" },
            { value: "P2_REMINDER", label: "P2", color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
            { value: "P3_BOOKING", label: "P3", color: "#34d399", bg: "rgba(52,211,153,0.1)" },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPriorityFilter(priorityFilter === p.value ? "ALL" : p.value)}
              className="text-xs px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-all duration-300"
              style={{
                background: priorityFilter === p.value ? p.bg : "rgba(15, 23, 42, 0.5)",
                color: priorityFilter === p.value ? p.color : "#94a3b8",
                border: `1px solid ${priorityFilter === p.value ? p.color + "50" : "rgba(255,255,255,0.05)"}`,
                boxShadow: priorityFilter === p.value ? `0 0 15px ${p.color}20` : "none"
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-72">
          <div className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "rgba(232,237,243,0.12)", borderTopColor: "#d6a84f", boxShadow: "0 0 38px rgba(214,168,79,0.18)" }} />
            <p className="text-sm font-bold tracking-[0.28em] text-[#d8dee8] uppercase">Menyusun Data Tracking...</p>
          </div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="glass-card p-16 flex flex-col items-center justify-center gap-5 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="p-5 rounded-3xl bg-[#080b12]/80 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <Table2 className="w-12 h-12 text-[#8f9aac]" />
          </div>
          <p className="text-base font-bold tracking-wide text-[#d8dee8]">
            {data.length === 0 ? "Radar Kosong. Import Sales Unit untuk memulai." : "Tidak ada unit yang sesuai dengan filter radar."}
          </p>
        </div>
      ) : (
        <div
          className="glass-card overflow-hidden animate-slide-up"
          style={{ animationDelay: "100ms" }}
        >
          <div className="overflow-x-auto" style={{ maxHeight: "calc(100vh - 380px)" }}>
            <table className="data-table">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        style={{ width: header.getSize(), minWidth: header.getSize() }}
                        onClick={header.column.getToggleSortingHandler()}
                        className={header.column.getCanSort() ? "cursor-pointer select-none hover:text-white transition-colors" : ""}
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <ArrowUpDown className="w-3 h-3 text-slate-500" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer: summary + pagination */}
          <div
            className="px-6 py-4 space-y-3"
            style={{ borderTop: "1px solid rgba(232,237,243,0.12)", background: "rgba(2, 6, 23, 0.6)" }}
          >
            {/* Revenue summary */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8f9aac]">
                Halaman {pageIndex + 1} dari {totalPages} &middot; {filteredData.length} unit
              </span>
              <div className="flex gap-6 text-sm font-semibold tracking-wide text-[#d8dee8] bg-black/25 px-5 py-2 rounded-2xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
                <span className="flex items-center gap-2">Income Wira: <strong className="text-[#25d39b] drop-shadow-sm">{formatCurrency(filteredData.reduce((s, r) => s + r.incomeWira, 0))}</strong></span>
                <div className="w-px h-4 bg-white/10" />
                <span className="flex items-center gap-2">Lost: <strong className="text-[#fb7185] drop-shadow-sm">{formatCurrency(filteredData.reduce((s, r) => s + r.lostDealerLain, 0))}</strong></span>
                <div className="w-px h-4 bg-white/10" />
                <span className="flex items-center gap-2">Potensi: <strong className="text-[#f4d58a] drop-shadow-sm">{formatCurrency(filteredData.reduce((s, r) => r.potensiRevenue + s, 0))}</strong></span>
              </div>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              {/* Rows per page */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#8f9aac]">Baris/halaman:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    table.setPageSize(Number(e.target.value))
                    table.setPageIndex(0)
                  }}
                  className="text-xs font-bold bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-[#d8dee8] cursor-pointer outline-none hover:border-white/20 transition-colors"
                >
                  {[25, 50, 100, 200].map((sz) => (
                    <option key={sz} value={sz}>{sz}</option>
                  ))}
                </select>
              </div>

              {/* Page buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="p-2 rounded-xl border border-white/10 text-[#8f9aac] hover:text-white hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                  title="Halaman Pertama"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="p-2 rounded-xl border border-white/10 text-[#8f9aac] hover:text-white hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {getPageNumbers().map((pg, i) =>
                  pg === "..." ? (
                    <span key={`ellipsis-${i}`} className="w-8 text-center text-[#8f9aac] text-xs font-bold">…</span>
                  ) : (
                    <button
                      key={pg}
                      onClick={() => table.setPageIndex(pg as number)}
                      className="w-8 h-8 rounded-xl text-xs font-bold tracking-wide transition-all duration-200"
                      style={
                        pg === pageIndex
                          ? {
                              background: "linear-gradient(135deg, rgba(244,213,138,0.25), rgba(214,168,79,0.12))",
                              border: "1px solid rgba(244,213,138,0.40)",
                              color: "#f4d58a",
                              boxShadow: "0 0 12px rgba(244,213,138,0.15)",
                            }
                          : {
                              background: "transparent",
                              border: "1px solid rgba(255,255,255,0.08)",
                              color: "#8f9aac",
                            }
                      }
                    >
                      {(pg as number) + 1}
                    </button>
                  )
                )}

                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-2 rounded-xl border border-white/10 text-[#8f9aac] hover:text-white hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                  title="Halaman Berikutnya"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => table.setPageIndex(totalPages - 1)}
                  disabled={!table.getCanNextPage()}
                  className="p-2 rounded-xl border border-white/10 text-[#8f9aac] hover:text-white hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                  title="Halaman Terakhir"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
