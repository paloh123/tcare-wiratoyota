"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import {
  UploadCloud, FileSpreadsheet, CheckCircle2,
  XCircle, AlertCircle, ChevronRight, Trash2, Loader2
} from "lucide-react"

interface ImportResult {
  total: number
  created: number
  updated: number
  errors: string[]
}

interface PreviewData {
  headers: string[]
  rows: Record<string, string>[]
  filename: string
  fileType: "sales" | "history"
}

function parseFile(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop()?.toLowerCase()

    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data as Record<string, string>[]),
        error: reject,
      })
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array", cellDates: true })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
          defval: "",
          raw: false,
          dateNF: "yyyy-mm-dd",
        })
        resolve(json)
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    } else {
      reject(new Error("Format file tidak didukung. Gunakan CSV atau Excel."))
    }
  })
}

// Column mappings
const SALES_COLUMNS = [
  { key: "vin", label: "VIN*", required: true },
  { key: "no_polisi", label: "No. Polisi" },
  { key: "customer", label: "Customer" },
  { key: "type", label: "Tipe Kendaraan" },
  { key: "tanggal_delivery", label: "Tanggal Delivery*", required: true },
  { key: "outlet_sales", label: "Outlet Sales" },
  { key: "salesman", label: "Salesman" },
  { key: "no_hp", label: "No. HP" },
  { key: "alamat_kota", label: "Kota" },
  { key: "keterangan", label: "Keterangan" },
]

const HISTORY_COLUMNS = [
  { key: "vin", label: "VIN*", required: true },
  { key: "tanggal_service", label: "Tanggal Service*", required: true },
  { key: "interval", label: "Interval (1st-7th)*", required: true },
  { key: "dealer_service", label: "Dealer Service" },
  { key: "status_dealer", label: "Status (WIRA/DEALER_LAIN)*", required: true },
  { key: "labour", label: "Labour (Rp)" },
  { key: "part", label: "Part (Rp)" },
  { key: "revenue", label: "Revenue (Rp)" },
  { key: "sa_outlet", label: "SA Outlet" },
  { key: "keterangan", label: "Keterangan" },
  { key: "type", label: "Tipe" },
]

interface DropZoneProps {
  fileType: "sales" | "history"
  title: string
  description: string
  onFileAccepted: (data: PreviewData) => void
}

function DropZoneArea({ fileType, title, description, onFileAccepted }: DropZoneProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const file = accepted[0]
      if (!file) return
      setError(null)
      setLoading(true)
      try {
        const rows = await parseFile(file)
        const headers = rows.length > 0 ? Object.keys(rows[0]) : []
        onFileAccepted({ headers, rows, filename: file.name, fileType })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal membaca file")
      } finally {
        setLoading(false)
      }
    },
    [fileType, onFileAccepted]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
  })

  return (
    <div
      {...getRootProps()}
      className={`drop-zone group ${isDragActive ? "active scale-[1.02] border-[#f4d58a] bg-[#f4d58a]/10" : "border-white/10 hover:border-[#2563eb]/40 hover:bg-white/[0.04]"}`}
    >
      <input {...getInputProps()} />
      {loading ? (
        <>
          <div
            className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "rgba(232,237,243,0.12)", borderTopColor: "#d6a84f", boxShadow: "0 0 32px rgba(214,168,79,0.16)" }}
          />
          <p className="text-sm font-bold uppercase tracking-widest text-[#d8dee8]">Memproses file...</p>
        </>
      ) : (
        <>
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center transition-transform duration-700 group-hover:-translate-y-1"
            style={{
              background: "linear-gradient(135deg, rgba(244,213,138,0.18), rgba(37,99,235,0.10), rgba(3,4,6,0.88))",
              border: "1px solid rgba(244,213,138,0.24)",
              boxShadow: "0 10px 25px rgba(214,168,79,0.10)"
            }}
          >
            <UploadCloud className="w-8 h-8 text-[#f4d58a]" />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-white tracking-wide">{title}</p>
            <p className="text-xs font-medium mt-1 text-[#8f9aac]">
              {description}
            </p>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-[#2563eb]/10 text-[#7da2ff] border border-[#2563eb]/20">
            Drag & drop atau klik untuk upload · CSV / Excel
          </p>
          {error && (
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 mt-2 bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20">
              <XCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </>
      )}
    </div>
  )
}

interface ColumnMappingProps {
  preview: PreviewData
  onCancel: () => void
  onImport: (mappedRecords: Record<string, string>[], fileType: "sales" | "history") => void
}

function ColumnMapping({ preview, onCancel, onImport }: ColumnMappingProps) {
  const columns = preview.fileType === "sales" ? SALES_COLUMNS : HISTORY_COLUMNS
  const [mapping, setMapping] = useState<Record<string, string>>(() => {
    // Auto-map: try to match column names case-insensitively
    const m: Record<string, string> = {}
    columns.forEach((col) => {
      const match = preview.headers.find(
        (h) => h.toLowerCase().replace(/[\s_]/g, "") === col.key.replace(/_/g, "")
      )
      if (match) m[col.key] = match
    })
    return m
  })

  const handleImport = () => {
    const mapped = preview.rows.slice(0, 2000).map((row) => {
      const record: Record<string, string> = {}
      columns.forEach((col) => {
        const srcCol = mapping[col.key]
        record[col.key] = srcCol ? (row[srcCol] ?? "") : ""
      })
      return record
    })
    onImport(mapped, preview.fileType)
  }

  return (
    <div className="glass-card p-8 animate-slide-up">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl shadow-[0_0_20px_rgba(20,184,166,0.1)]" style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.15), rgba(20,184,166,0.02))", border: "1px solid rgba(20,184,166,0.2)" }}>
          <FileSpreadsheet className="w-6 h-6 text-[#f4d58a]" />
        </div>
        <div>
          <h3 className="text-xl font-bold font-display tracking-wide text-white">{preview.filename}</h3>
          <p className="text-sm font-medium text-[#9ea9b8] mt-0.5">
            {preview.rows.length} baris ditemukan — Petakan kolom file ke field sistem
          </p>
        </div>
      </div>

      <div className="overflow-x-auto mb-8 bg-black/25 p-4 rounded-[1.5rem] border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left pb-4 pr-6 pl-4 text-[11px] font-bold uppercase tracking-widest text-[#8f9aac]">
                Field Sistem
              </th>
              <th className="text-left pb-4 pl-4 text-[11px] font-bold uppercase tracking-widest text-[#8f9aac]">
                Kolom di File Anda
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {columns.map((col) => (
              <tr key={col.key} className="hover:bg-white/[0.03] transition-colors">
                <td className="py-3 pr-6 pl-4">
                  <span className="text-[#d8dee8] font-semibold tracking-wide">{col.label}</span>
                </td>
                <td className="py-3 pl-4">
                  <select
                    className="input-field py-2 px-4 shadow-none font-medium"
                    style={{ maxWidth: 300 }}
                    value={mapping[col.key] ?? ""}
                    onChange={(e) => setMapping({ ...mapping, [col.key]: e.target.value })}
                  >
                    <option value="">— Pilih kolom —</option>
                    {preview.headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Preview rows */}
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-4 text-[#8f9aac]">
          Preview 3 baris pertama
        </p>
        <div className="overflow-x-auto rounded-[1.5rem] border border-white/10">
          <table className="data-table">
            <thead>
              <tr>
                {preview.headers.slice(0, 8).map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.rows.slice(0, 3).map((row, i) => (
                <tr key={i}>
                  {preview.headers.slice(0, 8).map((h) => (
                    <td key={h}>{String(row[h] ?? "").slice(0, 30)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={onCancel} className="btn-secondary">
          <Trash2 className="w-4 h-4" />
          Batalkan
        </button>
        <button onClick={handleImport} className="btn-primary flex-1 justify-center shadow-[0_0_20px_rgba(20,184,166,0.3)]">
          <ChevronRight className="w-5 h-5" />
          Mulai Import {preview.rows.length} Data
        </button>
      </div>
    </div>
  )
}

function ResultCard({ result, type }: { result: ImportResult; type: "sales" | "history" }) {
  const success = result.errors.length === 0
  return (
    <div
      className="p-6 rounded-3xl animate-slide-up"
      style={{
        background: success ? "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.02))" : "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.02))",
        border: `1px solid ${success ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
        boxShadow: `0 10px 40px ${success ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)"}`
      }}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 rounded-2xl ${success ? 'bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]'}`}>
          {success ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          ) : (
            <AlertCircle className="w-6 h-6 text-amber-400" />
          )}
        </div>
        <h4 className="text-lg font-bold font-display tracking-wide text-white">
          {type === "sales" ? "Sales Unit" : "Service History"} — Import Selesai
        </h4>
      </div>
          <div className="grid grid-cols-3 gap-6 mb-4 bg-black/25 p-5 rounded-[1.5rem] border border-white/10">
        <div>
          <div className="text-3xl font-bold text-white font-display">{result.total}</div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#8f9aac] mt-1">Total Diproses</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-[#25d39b] font-display">{result.created}</div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#8f9aac] mt-1">Data Baru</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-indigo-400 font-display">{result.updated}</div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#8f9aac] mt-1">Diperbarui</div>
        </div>
      </div>
      {result.errors.length > 0 && (
        <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#f4d58a] mb-2">
            {result.errors.length} Isu Ditemukan:
          </p>
          <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
            {result.errors.slice(0, 10).map((err, i) => (
              <p key={i} className="text-xs font-medium text-slate-300">• {err}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const CHUNK_SIZE = 500

export default function DataImportPage() {
  const [salesPreview, setSalesPreview] = useState<PreviewData | null>(null)
  const [historyPreview, setHistoryPreview] = useState<PreviewData | null>(null)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState<{ current: number; total: number; chunks: number; currentChunk: number } | null>(null)
  const [salesResult, setSalesResult] = useState<ImportResult | null>(null)
  const [historyResult, setHistoryResult] = useState<ImportResult | null>(null)

  const handleImport = async (records: Record<string, string>[], fileType: "sales" | "history") => {
    setImporting(true)
    const endpoint = fileType === "sales" ? "/api/sales-unit" : "/api/service-history"

    // Bagi records menjadi chunk-chunk
    const chunks: Record<string, string>[][] = []
    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
      chunks.push(records.slice(i, i + CHUNK_SIZE))
    }

    const accumulated: ImportResult = { total: 0, created: 0, updated: 0, errors: [] }

    try {
      for (let ci = 0; ci < chunks.length; ci++) {
        const chunk = chunks[ci]
        setImportProgress({
          current: ci * CHUNK_SIZE + chunk.length,
          total: records.length,
          chunks: chunks.length,
          currentChunk: ci + 1,
        })

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ records: chunk }),
        })

        if (!res.ok) {
          accumulated.errors.push(`Chunk ${ci + 1}: Server error ${res.status}`)
          continue
        }

        const result: ImportResult = await res.json()
        accumulated.total += result.total
        accumulated.created += result.created
        accumulated.updated += result.updated
        accumulated.errors.push(...result.errors)
      }

      if (fileType === "sales") {
        setSalesResult(accumulated)
        setSalesPreview(null)
      } else {
        setHistoryResult(accumulated)
        setHistoryPreview(null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setImporting(false)
      setImportProgress(null)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 rounded-2xl shadow-[0_0_30px_rgba(20,184,166,0.15)]" style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.2), rgba(20,184,166,0.05))", border: "1px solid rgba(20,184,166,0.3)" }}>
            <UploadCloud className="w-6 h-6 text-[#f4d58a]" />
          </div>
          <h1 className="page-title mb-0">Import Data Center</h1>
        </div>
        <p className="page-subtitle">Pusat sinkronisasi data Sales Unit dan Service History (Format didukung: CSV / Excel)</p>
      </div>

      {importing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md">
          <div className="glass-card p-10 flex flex-col items-center gap-6 animate-slide-up" style={{ minWidth: 360 }}>
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "rgba(232,237,243,0.12)", borderTopColor: "#d6a84f", boxShadow: "0 0 32px rgba(214,168,79,0.16)" }} />
              <Loader2 className="w-6 h-6 text-[#f4d58a] absolute inset-0 m-auto opacity-60" />
            </div>
            {importProgress ? (
              <div className="w-full text-center space-y-4">
                <p className="text-sm font-bold uppercase tracking-widest text-[#d8dee8]">
                  Chunk {importProgress.currentChunk} / {importProgress.chunks}
                </p>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round((importProgress.current / importProgress.total) * 100)}%`,
                      background: "linear-gradient(90deg, #d6a84f, #f4d58a)",
                      boxShadow: "0 0 10px rgba(244,213,138,0.4)",
                    }}
                  />
                </div>
                <p className="text-xs font-semibold text-[#8f9aac]">
                  {importProgress.current.toLocaleString()} / {importProgress.total.toLocaleString()} baris
                  &nbsp;·&nbsp;
                  {Math.round((importProgress.current / importProgress.total) * 100)}%
                </p>
              </div>
            ) : (
              <p className="text-sm font-bold uppercase tracking-widest text-[#d8dee8] animate-pulse">Menyiapkan data...</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Zone 1: Sales Unit */}
        <div className="space-y-6">
          <div className="glass-card p-8 min-h-[400px] flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-[#f4d58a] text-black shadow-[0_0_15px_rgba(244,213,138,0.35)]">1</div>
              <h2 className="text-xl font-bold font-display tracking-wide text-white">Sales Unit</h2>
            </div>
            <p className="text-sm font-medium mb-6 text-[#9ea9b8]">
              Import basis data kendaraan terjual untuk menginisiasi radar follow-up.
            </p>

            <div className="flex-1 flex flex-col justify-center">
              {!salesPreview && !salesResult && (
                <DropZoneArea
                  fileType="sales"
                  title="Upload Database Sales"
                  description="Memerlukan kolom minimum: VIN, Tanggal Delivery"
                  onFileAccepted={setSalesPreview}
                />
              )}

              {salesPreview && (
                <ColumnMapping
                  preview={salesPreview}
                  onCancel={() => setSalesPreview(null)}
                  onImport={handleImport}
                />
              )}

              {salesResult && (
                <div className="space-y-5 animate-slide-up">
                  <ResultCard result={salesResult} type="sales" />
                  <button onClick={() => setSalesResult(null)} className="btn-secondary w-full justify-center py-4">
                    Sinkronisasi File Tambahan
                  </button>
                </div>
              )}
            </div>

            {/* Format hint */}
            {!salesPreview && !salesResult && (
              <div className="mt-6 p-5 rounded-[1.5rem] bg-black/25 border border-white/10">
                <p className="text-[11px] font-bold uppercase tracking-widest mb-3 text-[#f4d58a]">Struktur Kolom yang Disarankan:</p>
                <div className="flex flex-wrap gap-2">
                  {SALES_COLUMNS.map((c) => (
                    <span key={c.key} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#0d1118] text-[#d8dee8] border border-white/10">
                      {c.key}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Zone 2: Service History */}
        <div className="space-y-6">
          <div className="glass-card p-8 min-h-[400px] flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-[#7da2ff] text-black shadow-[0_0_15px_rgba(125,162,255,0.35)]">2</div>
              <h2 className="text-xl font-bold font-display tracking-wide text-white">Service History</h2>
            </div>
            <p className="text-sm font-medium mb-6 text-[#9ea9b8]">
              Import riwayat kedatangan servis untuk mengkalkulasi revenue dan interval selanjutnya.
            </p>

            <div className="flex-1 flex flex-col justify-center">
              {!historyPreview && !historyResult && (
                <DropZoneArea
                  fileType="history"
                  title="Upload Database Service"
                  description="Memerlukan kolom minimum: VIN, Interval, Tanggal Service, Status"
                  onFileAccepted={setHistoryPreview}
                />
              )}

              {historyPreview && (
                <ColumnMapping
                  preview={historyPreview}
                  onCancel={() => setHistoryPreview(null)}
                  onImport={handleImport}
                />
              )}

              {historyResult && (
                <div className="space-y-5 animate-slide-up">
                  <ResultCard result={historyResult} type="history" />
                  <button onClick={() => setHistoryResult(null)} className="btn-secondary w-full justify-center py-4">
                    Sinkronisasi File Tambahan
                  </button>
                </div>
              )}
            </div>

            {/* Format hint */}
            {!historyPreview && !historyResult && (
              <div className="mt-6 p-5 rounded-[1.5rem] bg-black/25 border border-white/10">
                <p className="text-[11px] font-bold uppercase tracking-widest mb-3 text-[#f4d58a]">Struktur Kolom yang Disarankan:</p>
                <div className="flex flex-wrap gap-2">
                  {HISTORY_COLUMNS.map((c) => (
                    <span key={c.key} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#0d1118] text-[#d8dee8] border border-white/10">
                      {c.key}
                    </span>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  <p className="text-xs font-medium text-[#9ea9b8] flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" /> Interval Value: 1st, 2nd, 3rd, 4th, 5th, 6th, 7th</p>
                  <p className="text-xs font-medium text-[#9ea9b8] flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#f4d58a]" /> Status Value: WIRA atau DEALER_LAIN</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
