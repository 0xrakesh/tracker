import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-server"
import { getExpensesByBankAccountId } from "@/lib/expenses"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: bankAccountId } = params
    const expenses = await getExpensesByBankAccountId(user._id, bankAccountId)
    return NextResponse.json(expenses)
  } catch (error) {
    console.error("Error fetching bank account transactions:", error)
    return NextResponse.json({ error: "Failed to fetch bank account transactions" }, { status: 500 })
  }
}
