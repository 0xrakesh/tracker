import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-server"
import { deleteRecurringTransaction } from "@/lib/recurring-transactions"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const success = await deleteRecurringTransaction(user._id.toString(), id)

    if (!success) {
      return NextResponse.json({ error: "Recurring transaction not found or not authorized" }, { status: 404 })
    }

    return NextResponse.json({ message: "Recurring transaction deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting recurring transaction:", error)
    return NextResponse.json({ error: "Failed to delete recurring transaction" }, { status: 500 })
  }
}
