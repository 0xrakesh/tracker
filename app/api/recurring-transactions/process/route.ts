import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { processRecurringTransactions } from "@/lib/recurring-transactions"
import { getAuthUser } from "@/lib/auth-server"

export async function POST(req: NextRequest) {
  try {
    const sessionId = cookies().get("session")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getAuthUser(sessionId)
    if (!user) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 })
    }

    const processedCount = await processRecurringTransactions(user._id)
    return NextResponse.json({ success: true, processedCount })
  } catch (error) {
    console.error("Error processing recurring transactions:", error)
    return NextResponse.json({ error: "Failed to process recurring transactions" }, { status: 500 })
  }
}
