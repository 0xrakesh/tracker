import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-server"
import { processRecurringTransactions } from "@/lib/recurring-transactions"

export async function POST() {
  try {
    const user = getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const processedExpenses = await processRecurringTransactions(user._id)
    return NextResponse.json({ message: "Recurring transactions processed", processedExpenses }, { status: 200 })
  } catch (error) {
    console.error("Error processing recurring transactions:", error)
    return NextResponse.json({ error: "Failed to process recurring transactions" }, { status: 500 })
  }
}
