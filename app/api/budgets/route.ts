import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { addBudget, getBudgets } from "@/lib/budgets"
import type { Budget } from "@/lib/models/budget"
import clientPromise from "@/lib/mongodb"

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

    const budgets = await getBudgets(session.userId)
    return NextResponse.json(budgets)
  } catch (error) {
    console.error("Error fetching budgets:", error)
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 })
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

    if (!data.category || !data.amount || !data.period || !data.startDate || !data.endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const budget: Omit<Budget, "_id" | "createdAt"> = {
      userId: session.userId,
      category: data.category,
      amount: Number.parseFloat(data.amount),
      period: data.period,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    }

    const result = await addBudget(budget)
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error adding budget:", error)
    return NextResponse.json({ error: "Failed to add budget" }, { status: 500 })
  }
}
