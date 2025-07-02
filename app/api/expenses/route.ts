import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { addExpense, getExpenses } from "@/lib/expenses"
import type { Expense } from "@/lib/models/expense"
import clientPromise from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  try {
    const sessionId = cookies().get("session")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("finance-tracker")

    // Find session
    const session = await db.collection("sessions").findOne({
      sessionId,
      expiresAt: { $gt: new Date() },
    })

    if (!session) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 })
    }

    // Get date range parameters from URL
    const searchParams = req.nextUrl.searchParams
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    let startDate: Date | undefined
    let endDate: Date | undefined

    if (startDateParam) {
      startDate = new Date(startDateParam)
      // Set to beginning of day
      startDate.setHours(0, 0, 0, 0)
    }

    if (endDateParam) {
      endDate = new Date(endDateParam)
      // Set to end of day
      endDate.setHours(23, 59, 59, 999)
    }

    const expenses = await getExpenses(session.userId, startDate, endDate)
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

    // Find session
    const session = await db.collection("sessions").findOne({
      sessionId,
      expiresAt: { $gt: new Date() },
    })

    if (!session) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 })
    }

    const data = await req.json()

    // Validate the data
    if (!data.amount || !data.category || !data.description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const expense: Omit<Expense, "_id" | "createdAt"> = {
      userId: session.userId,
      amount: Number.parseFloat(data.amount),
      category: data.category,
      description: data.description,
      date: new Date(data.date || new Date()),
    }

    const result = await addExpense(expense)
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error adding expense:", error)
    return NextResponse.json({ error: "Failed to add expense" }, { status: 500 })
  }
}
