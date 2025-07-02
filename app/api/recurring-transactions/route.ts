import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getRecurringTransactions, addRecurringTransaction } from "@/lib/recurring-transactions"
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

    const transactions = await getRecurringTransactions(session.userId)
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

    const result = await addRecurringTransaction(session.userId, data)
    return NextResponse.json({ success: true, id: result._id })
  } catch (error) {
    console.error("Error adding recurring transaction:", error)
    return NextResponse.json({ error: "Failed to add recurring transaction" }, { status: 500 })
  }
}
