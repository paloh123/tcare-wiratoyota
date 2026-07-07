import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const prices = await prisma.price.findMany({
      orderBy: [{ category: "asc" }, { type: "asc" }],
    })
    return NextResponse.json(prices)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { category, type, month_1, month_6, month_12, month_18, month_24, month_30, month_36 } = body

    const price = await prisma.price.create({
      data: {
        category,
        type,
        month_1: parseInt(month_1) || 0,
        month_6: parseInt(month_6) || 0,
        month_12: parseInt(month_12) || 0,
        month_18: parseInt(month_18) || 0,
        month_24: parseInt(month_24) || 0,
        month_30: parseInt(month_30) || 0,
        month_36: parseInt(month_36) || 0,
      },
    })
    return NextResponse.json(price)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create price" }, { status: 500 })
  }
}
