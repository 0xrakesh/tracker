import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

    const { id: bankAccountId } = params

    if (!ObjectId.isValid(bankAccountId)) {
      return NextResponse.json({ error: "Invalid bank account ID" }, { status: 400 })
    }

    // Fetch expenses linked to this bank account
    const expenses = await db
      .collection("expenses")
      .find({
        userId: session.userId,
        bankAccountId: new ObjectId(bankAccountId),
      })
      .sort({ date: -1 })
      .toArray()

    // TODO: If income tracking is added, fetch income linked to this account as well
    // and merge/sort with expenses to create a complete transaction history.

    return NextResponse.json(JSON.parse(JSON.stringify(expenses)))
  } catch (error) {
    console.error("Error fetching bank account transactions:", error)
    return NextResponse.json({ error: "Failed to fetch bank account transactions" }, { status: 500 })
  }
}
