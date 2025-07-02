import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-server"
import { processDueRecurringTransactions } from "@/lib/recurring-transactions"

export async function POST(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { processedCount, processedTransactions } = await processDueRecurringTransactions(user._id.toString())
    return NextResponse.json({
      message: `Processed ${processedCount} recurring transactions.`,
      processedCount,
      processedTransactions,
    })
  } catch (error) {
    console.error("Error processing recurring transactions:", error)
    return NextResponse.json({ error: "Failed to process recurring transactions" }, { status: 500 })
  }
}
