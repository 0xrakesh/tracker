import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { addRecurringTransaction, getRecurringTransactions } from "@/lib/recurring-transactions"
import type { RecurringTransaction } from "@/lib/models/recurring-transaction"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

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

    const recurringTransactions = await getRecurringTransactions(session.userId)
    return NextResponse.json(recurringTransactions)
  } catch (error) {
    console.error("Error fetching recurring transactions:", error)
    return NextResponse.json({ error: "Failed to fetch recurring transactions" }, { status: 500 })
  }
}

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

    const data = await req.json()

    if (!data.amount || !data.category || !data.description || !data.frequency || !data.startDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const amount = Number.parseFloat(data.amount)
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
    }

    const recurringTransaction: Omit<RecurringTransaction, "_id" | "createdAt"> = {
      userId: session.userId,
      type: "expense", // Hardcoded for now
      amount: amount,
      category: data.category,
      description: data.description,
      frequency: data.frequency,
      startDate: new Date(data.startDate),
      nextOccurrenceDate: new Date(data.startDate), // Initially, next occurrence is the start date
      bankAccountId: data.bankAccountId ? new ObjectId(data.bankAccountId) : undefined,
    }

    const result = await addRecurringTransaction(recurringTransaction)
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error adding recurring transaction:", error)
    return NextResponse.json({ error: "Failed to add recurring transaction" }, { status: 500 })
  }
}
