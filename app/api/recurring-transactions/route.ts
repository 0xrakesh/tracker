import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { addRecurringTransaction, getRecurringTransactions } from "@/lib/recurring-transactions"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
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

    const transactions = await getRecurringTransactions(new ObjectId(session.userId))
    return NextResponse.json(transactions)
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

    if (!data.amount || !data.category || !data.description || !data.frequency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const transaction = {
      userId: new ObjectId(session.userId),
      amount: Number.parseFloat(data.amount),
      category: data.category,
      description: data.description,
      frequency: data.frequency,
      nextOccurrenceDate: new Date(data.nextOccurrenceDate || new Date()),
      bankAccountId: data.bankAccountId ? new ObjectId(data.bankAccountId) : undefined,
      isActive: true,
    }

    const result = await addRecurringTransaction(transaction)
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error adding recurring transaction:", error)
    return NextResponse.json({ error: "Failed to add recurring transaction" }, { status: 500 })
  }
}
