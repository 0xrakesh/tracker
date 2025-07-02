import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getExpensesByBankAccountId } from "@/lib/expenses"
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

    const transactions = await getExpensesByBankAccountId(params.id, new ObjectId(session.userId))
    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching bank account transactions:", error)
    return NextResponse.json({ error: "Failed to fetch bank account transactions" }, { status: 500 })
  }
}
