import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { deleteRecurringTransaction } from "@/lib/recurring-transactions"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    const result = await deleteRecurringTransaction(params.id, new ObjectId(session.userId))

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Recurring transaction not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting recurring transaction:", error)
    return NextResponse.json({ error: "Failed to delete recurring transaction" }, { status: 500 })
  }
}
