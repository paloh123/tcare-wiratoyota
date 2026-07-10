import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

/**
 * Parse tanggal dari berbagai format:
 *  - "DDMMYY"   → e.g. "310724" → 31 Jul 2024
 *  - "DDMMYYYY" → e.g. "31072024" → 31 Jul 2024
 *  - Format lain yang bisa diparse oleh Date constructor
 */
function parseTanggal(raw: unknown): Date {
  const str = String(raw ?? "").trim()

  // Format DDMMYY (6 digit) atau DDMMYYYY (8 digit)
  const match6 = str.match(/^(\d{2})(\d{2})(\d{2})$/)
  const match8 = str.match(/^(\d{2})(\d{2})(\d{4})$/)

  if (match6) {
    const [, dd, mm, yy] = match6
    const year = 2000 + parseInt(yy, 10)
    return new Date(year, parseInt(mm, 10) - 1, parseInt(dd, 10))
  }

  if (match8) {
    const [, dd, mm, yyyy] = match8
    return new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10))
  }

  // Fallback ke Date constructor standar
  const d = new Date(str)
  return d
}

const INTERVAL_MAP: Record<string, string> = {
  "1": "FIRST",
  "1st": "FIRST",
  "FIRST": "FIRST",
  "2": "SECOND",
  "2nd": "SECOND",
  "SECOND": "SECOND",
  "3": "THIRD",
  "3rd": "THIRD",
  "THIRD": "THIRD",
  "4": "FOURTH",
  "4th": "FOURTH",
  "FOURTH": "FOURTH",
  "5": "FIFTH",
  "5th": "FIFTH",
  "FIFTH": "FIFTH",
  "6": "SIXTH",
  "6th": "SIXTH",
  "SIXTH": "SIXTH",
  "7": "SEVENTH",
  "7th": "SEVENTH",
  "SEVENTH": "SEVENTH",
}

export async function GET() {
  try {
    const histories = await prisma.serviceHistory.findMany({
      orderBy: { tanggal_service: "desc" },
      include: { salesUnit: true },
    })
    return NextResponse.json(histories)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch service history" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { records } = body as { records: Record<string, unknown>[] }

    // Validasi & normalisasi semua records
    const validRecords: Array<Prisma.ServiceHistoryCreateManyInput> = []
    const errors: string[] = []

    for (const record of records) {
      const vin = String(record.vin ?? "").trim()
      if (!vin) {
        errors.push("Skipped: VIN kosong")
        continue
      }

      const intervalRaw = String(record.interval ?? "").trim()
      let interval = INTERVAL_MAP[intervalRaw] ?? INTERVAL_MAP[intervalRaw.toUpperCase()]

      if (!interval) {
        // Hapus semua spasi ekstra, titik, dan koma agar lebih gampang dibaca
        const cleanRaw = intervalRaw.toUpperCase().replace(/[\.\,\s]/g, "")

        if (cleanRaw.includes("60000") || cleanRaw.includes("60RB") || cleanRaw.includes("KE7")) interval = "SEVENTH"
        else if (cleanRaw.includes("50000") || cleanRaw.includes("50RB") || cleanRaw.includes("KE6")) interval = "SIXTH"
        else if (cleanRaw.includes("40000") || cleanRaw.includes("40RB") || cleanRaw.includes("KE5")) interval = "FIFTH"
        else if (cleanRaw.includes("30000") || cleanRaw.includes("30RB") || cleanRaw.includes("KE4")) interval = "FOURTH"
        else if (cleanRaw.includes("20000") || cleanRaw.includes("20RB") || cleanRaw.includes("KE3")) interval = "THIRD"
        else if (cleanRaw.includes("10000") || cleanRaw.includes("10RB") || cleanRaw.includes("KE2")) interval = "SECOND"
        else if (cleanRaw.includes("1000") || cleanRaw.includes("1RB") || cleanRaw.includes("KE1")) interval = "FIRST"
      }

      if (!interval) {
        errors.push(`Skipped: Interval tidak dikenali "${intervalRaw}" untuk VIN ${vin}`)
        continue
      }

      const tanggal_service = parseTanggal(record.tanggal_service)
      if (isNaN(tanggal_service.getTime())) {
        errors.push(`Skipped VIN ${vin}: Tanggal Service kosong atau format tidak valid`)
        continue
      }

      const statusRaw = String(record.status_dealer ?? "WIRA").trim().toUpperCase().replace(" ", "_")
      const status_dealer = statusRaw === "DEALER_LAIN" ? "DEALER_LAIN" : "WIRA"

      validRecords.push({
        vin,
        tanggal_service,
        interval,
        dealer_service: String(record.dealer_service ?? ""),
        status_dealer,
        labour: parseFloat(String(record.labour ?? "0")) || 0,
        part: parseFloat(String(record.part ?? "0")) || 0,
        revenue: parseFloat(String(record.revenue ?? "0")) || 0,
        sa_outlet: String(record.sa_outlet ?? ""),
        keterangan: String(record.keterangan ?? ""),
        type: String(record.type ?? ""),
      })
    }

    if (validRecords.length === 0) {
      return NextResponse.json({ created: 0, updated: 0, errors, total: records.length })
    }

    // Ambil daftar VIN unik dari validRecords
    const uniqueVins = Array.from(new Set(validRecords.map((r) => r.vin)))

    // Cek VIN mana saja yang benar-benar ada di tabel SalesUnit
    const existingSalesUnits = await prisma.salesUnit.findMany({
      where: { vin: { in: uniqueVins } },
      select: { vin: true }
    })
    const validSalesVins = new Set(existingSalesUnits.map((su) => su.vin))

    // Filter record yang VIN-nya ada di SalesUnit
    const filteredRecords = validRecords.filter((r) => validSalesVins.has(r.vin))

    // Simpan error untuk VIN yang di-skip karena tidak ada di SalesUnit (opsional, agar tidak terlalu banyak bisa dibatasi)
    const skippedCount = validRecords.length - filteredRecords.length
    if (skippedCount > 0) {
      errors.push(`Skipped ${skippedCount} data karena VIN belum terdaftar di Sales Unit`)
    }

    if (filteredRecords.length === 0) {
      return NextResponse.json({ created: 0, updated: 0, errors, total: records.length })
    }

    // Kumpulkan semua composite key (vin + interval) yang perlu dicek
    const vinIntervalPairs = filteredRecords.map((r) => ({ vin: r.vin, interval: r.interval }))

    // Cek existing dalam 1 query menggunakan OR conditions
    const existing = await prisma.serviceHistory.findMany({
      where: {
        OR: vinIntervalPairs.map((p) => ({ vin: p.vin, interval: p.interval })),
      },
      select: { vin: true, interval: true },
    })

    const existingSet = new Set(existing.map((e) => `${e.vin}::${e.interval}`))

    const toCreate = filteredRecords.filter((r) => !existingSet.has(`${r.vin}::${r.interval}`))
    const toUpdate = filteredRecords.filter((r) => existingSet.has(`${r.vin}::${r.interval}`))

    // Batch create semua data baru (1 query)
    if (toCreate.length > 0) {
      await prisma.serviceHistory.createMany({
        data: toCreate,
        skipDuplicates: true,
      })
    }

    // Parallel update untuk yang sudah ada
    if (toUpdate.length > 0) {
      await Promise.all(
        toUpdate.map((r) => {
          const { vin, interval, ...updateData } = r
          return prisma.serviceHistory.update({
            where: { vin_interval: { vin, interval } },
            data: updateData,
          })
        })
      )
    }

    return NextResponse.json({
      created: toCreate.length,
      updated: toUpdate.length,
      errors,
      total: records.length,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to import service history" }, { status: 500 })
  }
}
