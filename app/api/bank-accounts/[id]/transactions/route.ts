import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getExpensesByBankAccountId } from "@/lib/expenses"
import { getAuthUser } from "@/lib/auth-server"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = cookies().get("session")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getAuthUser(sessionId)
    if (!user) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 })
    }

    const transactions = await getExpensesByBankAccountId(params.id, user._id)
    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching bank account transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
