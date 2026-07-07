import { prisma } from "@/lib/prisma"
import { addMonths, isAfter, isBefore, differenceInDays } from "date-fns"
import { INTERVAL_ORDER, INTERVAL_MONTHS, MONTH_FIELD_MAP } from "@/lib/utils"

export type Priority = "P1_RECOVERY" | "P2_REMINDER" | "P3_BOOKING" | "MONITORING"

export interface IntervalData {
  interval: string
  predDate: Date
  actualDate: Date | null
  statusDealer: string | null
  labour: number
  part: number
  revenue: number
  gapHari: number | null
  dealerService: string | null
}

export interface TrackingRow {
  vin: string
  noPolisi: string
  customer: string
  type: string
  tanggalDelivery: Date
  outletSales: string
  salesman: string
  noHp: string
  alamatKota: string
  intervals: IntervalData[]
  nextDueDate: Date | null
  nextInterval: string | null
  priority: Priority
  incomeWira: number
  lostDealerLain: number
  potensiRevenue: number
  overdueCount: number
}

export interface DashboardKPI {
  totalVin: number
  unitIncomeWira: number
  unitLostDealerLain: number
  revenueIncomeWira: number
  revenueLostDealerLain: number
  potensiRevenue: number
  overdueItem: number
  dueWithin30: number
  priorityChart: {
    name: string
    value: number
    color: string
  }[]
  retentionRate: number
  totalRevenueTertangkap: number
  marketShareWira: number
  revenueLeakage: number
  priorityBreakdown: {
    p1: number
    p2: number
    p3: number
    monitoring: number
  }
  top10Models: { name: string; count: number }[]
  top10Cities: { name: string; count: number }[]
  top10Competitors: { name: string; count: number }[]
  topSalesman: { name: string; count: number; revenue: number }[]
}

function getPredDate(deliveryDate: Date, interval: string): Date {
  const months = INTERVAL_MONTHS[interval] ?? 0
  return addMonths(new Date(deliveryDate), months)
}

function calculatePriority(
  intervals: IntervalData[],
  nextDueDate: Date | null
): Priority {
  const now = new Date()

  // P1: Has overdue interval (pred passed, no actual) OR lost to dealer lain
  const hasLost = intervals.some(
    (i) => i.statusDealer === "DEALER_LAIN"
  )
  const hasOverdue = intervals.some(
    (i) =>
      i.actualDate === null &&
      isAfter(now, i.predDate) &&
      INTERVAL_ORDER.indexOf(i.interval) <
        intervals.findIndex(
          (x) =>
            x.actualDate === null &&
            !isAfter(now, x.predDate)
        )
  )

  // More precise overdue: predicted date passed but no actual service
  const missedIntervals = intervals.filter(
    (i) => i.actualDate === null && isAfter(now, i.predDate)
  )

  if (hasLost || missedIntervals.length > 0) return "P1_RECOVERY"

  // P2: Next due within 30 days
  if (nextDueDate) {
    const daysUntilDue = differenceInDays(nextDueDate, now)
    if (daysUntilDue >= 0 && daysUntilDue <= 30) return "P2_REMINDER"
    // P3: Next due within 90 days
    if (daysUntilDue > 30 && daysUntilDue <= 90) return "P3_BOOKING"
  }

  return "MONITORING"
}

export async function computeTrackingData(): Promise<TrackingRow[]> {
  const [salesUnits, allPrices] = await Promise.all([
    prisma.salesUnit.findMany({
      include: { serviceHistory: true },
    }),
    prisma.price.findMany(),
  ])

  const rows: TrackingRow[] = salesUnits.map((unit) => {
    const deliveryDate = new Date(unit.tanggal_delivery)

    // Build interval data
    const intervals: IntervalData[] = INTERVAL_ORDER.map((intervalKey) => {
      const predDate = getPredDate(deliveryDate, intervalKey)
      const history = unit.serviceHistory.find(
        (h) => h.interval === intervalKey
      )

      return {
        interval: intervalKey,
        predDate,
        actualDate: history ? new Date(history.tanggal_service) : null,
        statusDealer: history?.status_dealer ?? null,
        labour: history?.labour ?? 0,
        part: history?.part ?? 0,
        revenue: history?.revenue ?? 0,
        gapHari: history
          ? differenceInDays(
              new Date(history.tanggal_service),
              predDate
            )
          : null,
        dealerService: history?.dealer_service ?? null,
      }
    })

    // Revenue calculations
    const incomeWira = intervals
      .filter((i) => i.statusDealer === "WIRA")
      .reduce((sum, i) => sum + i.revenue, 0)

    const lostDealerLain = intervals
      .filter((i) => i.statusDealer === "DEALER_LAIN")
      .reduce((sum, i) => sum + i.revenue, 0)

    // Potensi revenue: missing intervals that haven't been serviced
    const now = new Date()
    let potensiRevenue = 0
    const prices = allPrices.filter((p) => p.type === unit.type)

    intervals.forEach((i) => {
      if (i.actualDate === null && isBefore(now, i.predDate)) {
        const monthField = MONTH_FIELD_MAP[i.interval] as keyof typeof prices[0]
        const labourPrice = prices.find((p) => p.category === "LABOUR")
        const partPrice = prices.find((p) => p.category === "PART")

        if (labourPrice && monthField) {
          potensiRevenue += (labourPrice[monthField] as number) ?? 0
        }
        if (partPrice && monthField) {
          potensiRevenue += (partPrice[monthField] as number) ?? 0
        }
      }
    })

    // Next due date: first interval without actual data in the future
    const nextInterval = intervals.find(
      (i) => i.actualDate === null && isAfter(i.predDate, now)
    )
    const nextDueDate = nextInterval?.predDate ?? null

    // Priority
    const priority = calculatePriority(intervals, nextDueDate)

    return {
      vin: unit.vin,
      noPolisi: unit.no_polisi,
      customer: unit.customer,
      type: unit.type,
      tanggalDelivery: deliveryDate,
      outletSales: unit.outlet_sales,
      salesman: unit.salesman,
      noHp: unit.no_hp,
      alamatKota: unit.alamat_kota,
      intervals,
      nextDueDate,
      nextInterval: nextInterval?.interval ?? null,
      priority,
      incomeWira,
      lostDealerLain,
      potensiRevenue,
      overdueCount: intervals.filter(
        (i) => i.actualDate === null && isAfter(now, i.predDate)
      ).length,
    }
  })

  return rows
}

export async function computeDashboardKPI(): Promise<DashboardKPI> {
  const rows = await computeTrackingData()

  const unitIncomeWira = rows.filter((r) => r.incomeWira > 0).length
  const unitLostDealerLain = rows.filter((r) => r.lostDealerLain > 0).length
  const revenueIncomeWira = rows.reduce((sum, r) => sum + r.incomeWira, 0)
  const revenueLostDealerLain = rows.reduce(
    (sum, r) => sum + r.lostDealerLain,
    0
  )
  const potensiRevenue = rows.reduce((sum, r) => sum + r.potensiRevenue, 0)
  const overdueItem = rows.filter((r) => r.priority === "P1_RECOVERY").length
  const dueWithin30 = rows.filter((r) => r.priority === "P2_REMINDER").length

  const p1 = rows.filter((r) => r.priority === "P1_RECOVERY").length
  const p2 = rows.filter((r) => r.priority === "P2_REMINDER").length
  const p3 = rows.filter((r) => r.priority === "P3_BOOKING").length
  const monitoring = rows.filter((r) => r.priority === "MONITORING").length

  const totalRevenueTertangkap = revenueIncomeWira + revenueLostDealerLain
  const retentionRate = rows.length > 0 ? (unitIncomeWira / rows.length) * 100 : 0
  const marketShareWira = totalRevenueTertangkap > 0 ? (revenueIncomeWira / totalRevenueTertangkap) * 100 : 0
  const revenueLeakage = totalRevenueTertangkap > 0 ? (revenueLostDealerLain / totalRevenueTertangkap) * 100 : 0

  // Aggregations
  const modelCounts: Record<string, number> = {}
  const cityCounts: Record<string, number> = {}
  const competitorCounts: Record<string, number> = {}
  const salesmanData: Record<string, { count: number; revenue: number }> = {}

  rows.forEach(r => {
    // Model (Type)
    if (r.type) {
      modelCounts[r.type] = (modelCounts[r.type] || 0) + 1
    }
    // City
    if (r.alamatKota) {
      cityCounts[r.alamatKota] = (cityCounts[r.alamatKota] || 0) + 1
    }
    // Salesman (only count if they have wira income, to make it interesting)
    if (r.salesman && r.incomeWira > 0) {
      if (!salesmanData[r.salesman]) salesmanData[r.salesman] = { count: 0, revenue: 0 }
      salesmanData[r.salesman].count += 1
      salesmanData[r.salesman].revenue += r.incomeWira
    }
    
    // Competitors from intervals
    r.intervals.forEach(i => {
      if (i.statusDealer === "DEALER_LAIN" && i.dealerService) {
        competitorCounts[i.dealerService] = (competitorCounts[i.dealerService] || 0) + 1
      }
    })
  })

  const top10Models = Object.entries(modelCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const top10Cities = Object.entries(cityCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const top10Competitors = Object.entries(competitorCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const topSalesman = Object.entries(salesmanData)
    .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  return {
    totalVin: rows.length,
    unitIncomeWira,
    unitLostDealerLain,
    revenueIncomeWira,
    revenueLostDealerLain,
    potensiRevenue,
    overdueItem,
    dueWithin30,
    priorityChart: [
      { name: "P1 Recovery", value: p1, color: "#ef4444" },
      { name: "P2 Reminder", value: p2, color: "#f59e0b" },
      { name: "P3 Booking Plan", value: p3, color: "#22c55e" },
      { name: "Monitoring", value: monitoring, color: "#94a3b8" },
    ],
    retentionRate,
    totalRevenueTertangkap,
    marketShareWira,
    revenueLeakage,
    priorityBreakdown: { p1, p2, p3, monitoring },
    top10Models,
    top10Cities,
    top10Competitors,
    topSalesman
  }
}
