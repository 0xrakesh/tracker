import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-server"
import { getExpensesByBankAccountId } from "@/lib/expenses"
import { ObjectId } from "mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: bankAccountId } = params

    // Validate bankAccountId as ObjectId
    if (!ObjectId.isValid(bankAccountId)) {
      return NextResponse.json({ error: "Invalid Bank Account ID" }, { status: 400 })
    }

    const expenses = await getExpensesByBankAccountId(user._id.toString(), bankAccountId)
    return NextResponse.json(expenses)
  } catch (error) {
    console.error("Error fetching bank account transactions:", error)
    return NextResponse.json({ error: "Failed to fetch bank account transactions" }, { status: 500 })
  }
}
