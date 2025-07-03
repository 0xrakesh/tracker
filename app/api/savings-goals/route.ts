import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { addSavingsGoal, getSavingsGoals } from "@/lib/savings-goals"
import type { SavingsGoal } from "@/lib/models/savings-goal"
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

    const savingsGoals = await getSavingsGoals(session.userId)
    return NextResponse.json(savingsGoals)
  } catch (error) {
    console.error("Error fetching savings goals:", error)
    return NextResponse.json({ error: "Failed to fetch savings goals" }, { status: 500 })
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

    if (!data.goalName || !data.bankAccountId || data.targetAmount === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const targetAmount = Number.parseFloat(data.targetAmount)
    if (isNaN(targetAmount) || targetAmount <= 0) {
      return NextResponse.json({ error: "Target amount must be a positive number" }, { status: 400 })
    }

    const savingsGoal: Omit<SavingsGoal, "_id" | "createdAt"> = {
      userId: session.userId,
      bankAccountId: new ObjectId(data.bankAccountId),
      goalName: data.goalName,
      targetAmount: targetAmount,
      targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
    }

    const result = await addSavingsGoal(savingsGoal)
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error adding savings goal:", error)
    return NextResponse.json({ error: "Failed to add savings goal" }, { status: 500 })
  }
}
