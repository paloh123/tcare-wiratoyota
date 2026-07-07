import { NextResponse } from "next/server"
import { computeTrackingData } from "@/lib/r3-engine"

export async function GET() {
  try {
    const rows = await computeTrackingData()
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Tracking R3 API error:", error)
    return NextResponse.json({ error: "Failed to compute tracking data" }, { status: 500 })
  }
}
