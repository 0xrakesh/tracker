import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getExpenses } from "@/lib/expenses"
import type { Expense } from "@/lib/models/expense"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

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

    const searchParams = req.nextUrl.searchParams
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    let startDate: Date | undefined
    let endDate: Date | undefined

    if (startDateParam) {
      startDate = new Date(startDateParam)
      startDate.setHours(0, 0, 0, 0)
    }

    if (endDateParam) {
      endDate = new Date(endDateParam)
      endDate.setHours(23, 59, 59, 999)
    }

    const expenses = await getExpenses(new ObjectId(session.userId), startDate, endDate)
    return NextResponse.json(expenses)
  } catch (error) {
    console.error("Error fetching expenses:", error)
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
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

    if (!data.amount || !data.category || !data.description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const expenseAmount = Number.parseFloat(data.amount)
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
    }

    // Check bank account balance if specified
    if (data.bankAccountId && data.bankAccountId !== "none") {
      const bankAccount = await db.collection("bankAccounts").findOne({
        _id: new ObjectId(data.bankAccountId),
        userId: session.userId,
      })

      if (!bankAccount) {
        return NextResponse.json({ error: "Bank account not found" }, { status: 404 })
      }

      if (bankAccount.currentBalance < expenseAmount) {
        return NextResponse.json({ error: "Insufficient balance in bank account" }, { status: 400 })
      }
    }

    const expense: Omit<Expense, "_id" | "createdAt"> = {
      userId: new ObjectId(session.userId),
      amount: expenseAmount,
      category: data.category,
      description: data.description,
      date: new Date(data.date || new Date()),
      bankAccountId: data.bankAccountId && data.bankAccountId !== "none" ? new ObjectId(data.bankAccountId) : undefined,
    }

    const mongoSession = client.startSession()

    try {
      await mongoSession.withTransaction(async () => {
        const result = await db.collection("expenses").insertOne(
          {
            ...expense,
            createdAt: new Date(),
          },
          { session: mongoSession },
        )

        // Deduct from bank account if specified
        if (expense.bankAccountId) {
          await db
            .collection("bankAccounts")
            .updateOne(
              { _id: expense.bankAccountId, userId: session.userId },
              { $inc: { currentBalance: -expenseAmount } },
              { session: mongoSession },
            )
        }

        return result
      })

      return NextResponse.json({ success: true })
    } finally {
      await mongoSession.endSession()
    }
  } catch (error) {
    console.error("Error adding expense:", error)
    return NextResponse.json({ error: "Failed to add expense" }, { status: 500 })
  }
}
