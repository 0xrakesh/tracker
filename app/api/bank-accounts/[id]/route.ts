import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { deleteBankAccount } from "@/lib/bank-accounts"
import clientPromise from "@/lib/mongodb"

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

    const { id } = params
    const result = await deleteBankAccount(id)

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Bank account not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting bank account:", error)
    return NextResponse.json({ error: "Failed to delete bank account" }, { status: 500 })
  }
}
