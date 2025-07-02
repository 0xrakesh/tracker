import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-server"
import { addRecurringTransaction, getRecurringTransactions } from "@/lib/recurring-transactions"

export async function GET(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const transactions = await getRecurringTransactions(user._id.toString())
    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching recurring transactions:", error)
    return NextResponse.json({ error: "Failed to fetch recurring transactions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const newTransaction = await addRecurringTransaction(user._id.toString(), body)
    return NextResponse.json(newTransaction, { status: 201 })
  } catch (error) {
    console.error("Error adding recurring transaction:", error)
    return NextResponse.json({ error: "Failed to add recurring transaction" }, { status: 500 })
  }
}
