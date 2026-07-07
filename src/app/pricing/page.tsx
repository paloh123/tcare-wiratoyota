"use client"

import React, { useEffect, useState } from "react"
import { DollarSign, Plus, Pencil, Trash2, Check, X, RefreshCw } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Price {
  id: number
  category: "LABOUR" | "PART"
  type: string
  month_1: number
  month_6: number
  month_12: number
  month_18: number
  month_24: number
  month_30: number
  month_36: number
}

const MONTH_FIELDS: { key: keyof Price; label: string }[] = [
  { key: "month_1", label: "1 Bln" },
  { key: "month_6", label: "6 Bln" },
  { key: "month_12", label: "12 Bln" },
  { key: "month_18", label: "18 Bln" },
  { key: "month_24", label: "24 Bln" },
  { key: "month_30", label: "30 Bln" },
  { key: "month_36", label: "36 Bln" },
]

const emptyForm = (): Omit<Price, "id"> => ({
  category: "LABOUR",
  type: "",
  month_1: 0,
  month_6: 0,
  month_12: 0,
  month_18: 0,
  month_24: 0,
  month_30: 0,
  month_36: 0,
})

function PriceRow({
  price,
  onEdit,
  onDelete,
}: {
  price: Price
  onEdit: (p: Price) => void
  onDelete: (id: number) => void
}) {
  return (
    <tr className="hover:bg-white/[0.03] transition-colors">
      <td>
        <span
          className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold shadow-sm"
          style={{
            background: price.category === "LABOUR" ? "rgba(59,130,246,0.1)" : "rgba(168,85,247,0.1)",
            color: price.category === "LABOUR" ? "#93c5fd" : "#d8b4fe",
            border: `1px solid ${price.category === "LABOUR" ? "rgba(59,130,246,0.2)" : "rgba(168,85,247,0.2)"}`,
          }}
        >
          {price.category}
        </span>
      </td>
      <td>
        <span className="font-bold text-white text-sm tracking-wide">{price.type}</span>
      </td>
      {MONTH_FIELDS.map((f) => (
        <td key={f.key} className="text-right">
          <span className="text-xs font-medium text-[#d8dee8]">
            {(price[f.key] as number) > 0 ? formatCurrency(price[f.key] as number) : "—"}
          </span>
        </td>
      ))}
      <td>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(price)}
            className="p-2 rounded-xl transition-all hover:bg-[#2563eb]/18 hover:scale-110"
            style={{ background: "rgba(37,99,235,0.12)", color: "#7da2ff", border: "1px solid rgba(37,99,235,0.22)" }}
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(price.id)}
            className="p-2 rounded-xl transition-all hover:bg-[#fb7185]/18 hover:scale-110"
            style={{ background: "rgba(251,113,133,0.12)", color: "#fb7185", border: "1px solid rgba(251,113,133,0.22)" }}
            title="Hapus"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

function PriceForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: Omit<Price, "id"> & { id?: number }
  onSave: (data: Omit<Price, "id"> & { id?: number }) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState(initial)

  const set = (key: keyof typeof form, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <div className="p-8 rounded-[1.75rem] mb-6 bg-black/25 border border-white/10 shadow-[0_24px_54px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.08)] animate-slide-up">
      <h3 className="text-lg font-bold text-white mb-6 font-display tracking-wide flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#f4d58a] shadow-[0_0_10px_rgba(244,213,138,0.7)]" />
        {form.id ? "Edit Master Harga" : "Tambah Konfigurasi Harga Baru"}
      </h3>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block text-[#9ea9b8]">
            Kategori Komponen
          </label>
          <select
            className="input-field"
            value={form.category}
            onChange={(e) => set("category", e.target.value as "LABOUR" | "PART")}
          >
            <option value="LABOUR">LABOUR (Jasa)</option>
            <option value="PART">PART (Suku Cadang)</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block text-[#9ea9b8]">
            Tipe Kendaraan
          </label>
          <input
            className="input-field font-semibold text-white"
            placeholder="contoh: Avanza, Innova Zenix..."
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-4 mb-8">
        {MONTH_FIELDS.map((f) => (
          <div key={f.key}>
            <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block text-[#9ea9b8] text-center">
              {f.label}
            </label>
            <input
              type="number"
              className="input-field text-right font-mono"
              placeholder="0"
              value={form[f.key] as number}
              onChange={(e) => set(f.key, parseInt(e.target.value) || 0)}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        <button onClick={onCancel} className="btn-secondary w-32 justify-center">
          <X className="w-4 h-4" />
          Batal
        </button>
        <button
          onClick={() => onSave(form)}
          className="btn-primary flex-1 justify-center shadow-[0_0_20px_rgba(20,184,166,0.3)]"
          disabled={saving || !form.type}
        >
          <Check className="w-5 h-5" />
          {saving ? "Menyimpan Konfigurasi..." : "Simpan Konfigurasi Harga"}
        </button>
      </div>
    </div>
  )
}

export default function PricingPage() {
  const [prices, setPrices] = useState<Price[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "LABOUR" | "PART">("ALL")

  const fetchPrices = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/pricing")
      if (res.ok) setPrices(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPrices() }, [])

  const handleSave = async (data: Omit<Price, "id"> & { id?: number }) => {
    setSaving(true)
    try {
      if (data.id) {
        await fetch(`/api/pricing/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        setEditingId(null)
      } else {
        await fetch("/api/pricing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        setAdding(false)
      }
      await fetchPrices()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus harga ini?")) return
    await fetch(`/api/pricing/${id}`, { method: "DELETE" })
    await fetchPrices()
  }

  const filtered = prices.filter(
    (p) => categoryFilter === "ALL" || p.category === categoryFilter
  )

  const totalLabour = prices.filter((p) => p.category === "LABOUR").length
  const totalPart = prices.filter((p) => p.category === "PART").length

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="page-header mb-0">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-4 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(244,213,138,0.20), rgba(37,99,235,0.10), rgba(3,4,6,0.88))", border: "1px solid rgba(244,213,138,0.28)", boxShadow: "0 22px 42px rgba(0,0,0,0.42), 0 0 24px rgba(214,168,79,0.12)" }}>
              <DollarSign className="w-6 h-6 text-[#f4d58a]" />
            </div>
            <h1 className="page-title mb-0">Pricing Matrix</h1>
          </div>
          <p className="page-subtitle">
            Konfigurasi master harga Labour dan Part untuk kalkulasi Potensi Revenue
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchPrices} className="btn-secondary group" title="Refresh Data">
            <RefreshCw className="w-4 h-4 transition-transform duration-500 group-hover:rotate-180" />
          </button>
          <button onClick={() => { setAdding(true); setEditingId(null) }} className="btn-primary group">
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            Tambah Konfigurasi
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-7 mb-10">
        {[
          { label: "Total Varian Tipe", value: new Set(prices.map((p) => p.type)).size, color: "#f4d58a", bg: "rgba(244,213,138,0.05)", border: "rgba(244,213,138,0.20)" },
          { label: "Master Labour", value: totalLabour, color: "#7da2ff", bg: "rgba(37,99,235,0.06)", border: "rgba(37,99,235,0.22)" },
          { label: "Master Part", value: totalPart, color: "#25d39b", bg: "rgba(37,211,155,0.05)", border: "rgba(37,211,155,0.20)" },
        ].map((s, i) => (
          <div key={i} className="p-7 rounded-[1.75rem] animate-slide-up hover:-translate-y-1 transition-all duration-700" style={{ background: `linear-gradient(120deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 9px), linear-gradient(145deg, ${s.bg}, rgba(3,4,6,0.88))`, border: `1px solid ${s.border}`, boxShadow: "0 30px 64px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.10)", animationDelay: `${i * 100}ms` }}>
            <div className="text-4xl font-extrabold font-display tracking-tight mb-2" style={{ color: s.color, textShadow: `0 0 22px ${s.color}25` }}>{s.value}</div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-[#d8dee8]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {adding && (
        <PriceForm
          initial={emptyForm()}
          onSave={handleSave}
          onCancel={() => setAdding(false)}
          saving={saving}
        />
      )}

      {/* Filter */}
      <div className="glass-card p-6 mb-7 flex gap-3 items-center animate-slide-up">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#8f9aac] mr-2">Filter Kategori:</span>
        {(["ALL", "LABOUR", "PART"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className="text-xs px-5 py-2.5 rounded-xl font-bold tracking-wide transition-all duration-300"
            style={{
              background: categoryFilter === cat ? "rgba(244,213,138,0.14)" : "rgba(15,23,42,0.5)",
              color: categoryFilter === cat ? "#f4d58a" : "#8f9aac",
              border: `1px solid ${categoryFilter === cat ? "rgba(244,213,138,0.36)" : "rgba(255,255,255,0.06)"}`,
              boxShadow: categoryFilter === cat ? "0 0 18px rgba(244,213,138,0.1)" : "none"
            }}
          >
            {cat === "ALL" ? "SEMUA MASTER" : cat}
          </button>
        ))}
        <span className="ml-auto text-[11px] font-bold uppercase tracking-widest text-[#8f9aac]">
          Total {filtered.length} Entri
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-56">
          <div className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "rgba(232,237,243,0.12)", borderTopColor: "#d6a84f", boxShadow: "0 0 30px rgba(214,168,79,0.14)" }} />
        </div>
      ) : (
        <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th>Tipe Kendaraan</th>
                  {MONTH_FIELDS.map((f) => (
                    <th key={f.key} className="text-right">{f.label}</th>
                  ))}
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <DollarSign className="w-10 h-10 text-[#8f9aac] mb-2" />
                        <p className="text-sm font-bold tracking-wide text-[#d8dee8]">Database Harga Kosong</p>
                        <p className="text-xs text-[#8f9aac]">Klik "Tambah Konfigurasi" untuk mulai mengisi master data.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((price) =>
                    editingId === price.id ? (
                      <tr key={price.id}>
                        <td colSpan={10} className="py-2 px-4 bg-black/25">
                          <PriceForm
                            initial={price}
                            onSave={handleSave}
                            onCancel={() => setEditingId(null)}
                            saving={saving}
                          />
                        </td>
                      </tr>
                    ) : (
                      <PriceRow
                        key={price.id}
                        price={price}
                        onEdit={(p) => { setEditingId(p.id); setAdding(false) }}
                        onDelete={handleDelete}
                      />
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info */}
      <div
        className="mt-8 p-6 rounded-[1.75rem] animate-slide-up"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(232,237,243,0.12)", animationDelay: "300ms" }}
      >
        <p className="text-sm font-bold tracking-wide mb-3 flex items-center gap-2 text-[#f4d58a]">
          <span className="w-2 h-2 rounded-full bg-[#f4d58a] shadow-[0_0_10px_rgba(244,213,138,0.7)]" />
          Informasi Konfigurasi Sistem
        </p>
        <ul className="space-y-2">
          <li className="text-xs font-medium text-[#8f9aac] flex items-center gap-3">
            <div className="w-1 h-1 rounded-full bg-white/30" /> Buat satu entri <span className="text-[#7da2ff] font-bold">LABOUR</span> dan satu entri <span className="text-[#f4d58a] font-bold">PART</span> untuk setiap tipe kendaraan.
          </li>
          <li className="text-xs font-medium text-[#8f9aac] flex items-center gap-3">
            <div className="w-1 h-1 rounded-full bg-white/30" /> Isi besaran harga standar untuk setiap titik interval servis (1 bulan hingga 36 bulan).
          </li>
          <li className="text-xs font-medium text-[#8f9aac] flex items-center gap-3">
            <div className="w-1 h-1 rounded-full bg-[#f4d58a]" /> Data ini terintegrasi langsung dengan Engine R3 untuk menghitung Potensi Revenue secara real-time.
          </li>
        </ul>
      </div>
    </div>
  )
}
