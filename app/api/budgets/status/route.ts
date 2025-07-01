import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getBudgetStatus } from "@/lib/budgets"
import clientPromise from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  try {
    const sessionId = cookies().get("session")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("finance-tracker")

    const session = await db.collection("sessions").findOne({
      sessionId,
      expiresAt: { $gt: new Date() },
    })

    if (!session) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 })
    }

    const budgetStatus = await getBudgetStatus(session.userId)
    return NextResponse.json(budgetStatus)
  } catch (error) {
    console.error("Error fetching budget status:", error)
    return NextResponse.json({ error: "Failed to fetch budget status" }, { status: 500 })
  }
}
