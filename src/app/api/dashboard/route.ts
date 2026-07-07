import { NextResponse } from "next/server"
import { computeDashboardKPI } from "@/lib/r3-engine"

export async function GET() {
  try {
    const kpi = await computeDashboardKPI()
    return NextResponse.json(kpi)
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ error: "Failed to compute KPI" }, { status: 500 })
  }
}
