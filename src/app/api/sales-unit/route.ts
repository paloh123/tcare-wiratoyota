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

  return new Date(str)
}

export async function GET() {
  try {
    const units = await prisma.salesUnit.findMany({
      orderBy: { tanggal_delivery: "desc" },
    })
    return NextResponse.json(units)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch sales units" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { records } = body as { records: Record<string, unknown>[] }

    // Validasi & normalisasi semua records
    const validRecords: Array<Prisma.SalesUnitCreateManyInput> = []
    const errors: string[] = []

    for (const record of records) {
      const vin = String(record.vin ?? "").trim()
      if (!vin) {
        errors.push("Skipped: VIN kosong")
        continue
      }

      const tanggal_delivery = parseTanggal(record.tanggal_delivery)
      if (isNaN(tanggal_delivery.getTime())) {
        errors.push(`Skipped VIN ${vin}: Tanggal Delivery kosong atau format tidak valid`)
        continue
      }

      validRecords.push({
        vin,
        no_polisi: String(record.no_polisi ?? ""),
        customer: String(record.customer ?? ""),
        type: String(record.type ?? ""),
        tanggal_delivery,
        outlet_sales: String(record.outlet_sales ?? ""),
        salesman: String(record.salesman ?? ""),
        no_hp: String(record.no_hp ?? ""),
        alamat_kota: String(record.alamat_kota ?? ""),
        keterangan: String(record.keterangan ?? ""),
      })
    }

    if (validRecords.length === 0) {
      return NextResponse.json({ created: 0, updated: 0, errors, total: records.length })
    }

    // Cek semua VIN yang sudah ada dalam 1 query
    const allVins = validRecords.map((r) => r.vin)
    const existing = await prisma.salesUnit.findMany({
      where: { vin: { in: allVins } },
      select: { vin: true },
    })
    const existingVinSet = new Set(existing.map((e) => e.vin))

    const toCreate = validRecords.filter((r) => !existingVinSet.has(r.vin))
    const toUpdate = validRecords.filter((r) => existingVinSet.has(r.vin))

    // Batch create semua data baru (1 query)
    if (toCreate.length > 0) {
      await prisma.salesUnit.createMany({
        data: toCreate,
        skipDuplicates: true,
      })
    }

    // Parallel update untuk yang sudah ada
    if (toUpdate.length > 0) {
      await Promise.all(
        toUpdate.map((r) => {
          const { vin, ...updateData } = r
          return prisma.salesUnit.update({
            where: { vin },
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
    return NextResponse.json({ error: "Failed to import sales units" }, { status: 500 })
  }
}
