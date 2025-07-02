import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { processRecurringTransactions } from "@/lib/recurring-transactions"
import clientPromise from "@/lib/mongodb"

export async function POST(req: NextRequest) {
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

    const processedCount = await processRecurringTransactions(session.userId)

    return NextResponse.json({
      success: true,
      processedCount,
      message: `Processed ${processedCount} recurring transactions`,
    })
  } catch (error) {
    console.error("Error processing recurring transactions:", error)
    return NextResponse.json({ error: "Failed to process recurring transactions" }, { status: 500 })
  }
}
