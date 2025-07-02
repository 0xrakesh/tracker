import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getExpenseStats } from "@/lib/expenses"
import clientPromise from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  try {
    const sessionId = cookies().get("session")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("finance-tracker")

    // Find session
    const session = await db.collection("sessions").findOne({
      sessionId,
      expiresAt: { $gt: new Date() },
    })

    if (!session) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 })
    }

    // Get date range parameters from URL
    const searchParams = req.nextUrl.searchParams
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    let startDate: Date | undefined
    let endDate: Date | undefined

    if (startDateParam) {
      startDate = new Date(startDateParam)
      // Set to beginning of day
      startDate.setHours(0, 0, 0, 0)
    }

    if (endDateParam) {
      endDate = new Date(endDateParam)
      // Set to end of day
      endDate.setHours(23, 59, 59, 999)
    }

    const stats = await getExpenseStats(session.userId, startDate, endDate)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching expense stats:", error)
    return NextResponse.json({ error: "Failed to fetch expense stats" }, { status: 500 })
  }
}
