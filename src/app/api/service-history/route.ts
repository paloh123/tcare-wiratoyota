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
      const interval = INTERVAL_MAP[intervalRaw] ?? INTERVAL_MAP[intervalRaw.toUpperCase()]
      if (!interval) {
        errors.push(`Skipped: Interval tidak valid "${intervalRaw}" untuk VIN ${vin}`)
        continue
      }

      const statusRaw = String(record.status_dealer ?? "WIRA").trim().toUpperCase().replace(" ", "_")
      const status_dealer = statusRaw === "DEALER_LAIN" ? "DEALER_LAIN" : "WIRA"

      validRecords.push({
        vin,
        tanggal_service: parseTanggal(record.tanggal_service),
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

    // Kumpulkan semua composite key (vin + interval) yang perlu dicek
    const vinIntervalPairs = validRecords.map((r) => ({ vin: r.vin, interval: r.interval }))

    // Cek existing dalam 1 query menggunakan OR conditions
    const existing = await prisma.serviceHistory.findMany({
      where: {
        OR: vinIntervalPairs.map((p) => ({ vin: p.vin, interval: p.interval })),
      },
      select: { vin: true, interval: true },
    })

    const existingSet = new Set(existing.map((e) => `${e.vin}::${e.interval}`))

    const toCreate = validRecords.filter((r) => !existingSet.has(`${r.vin}::${r.interval}`))
    const toUpdate = validRecords.filter((r) => existingSet.has(`${r.vin}::${r.interval}`))

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
