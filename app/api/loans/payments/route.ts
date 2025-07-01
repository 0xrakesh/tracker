import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { addLoanPayment, getLoanPayments } from "@/lib/loans"
import type { LoanPayment } from "@/lib/models/loan"
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
    const loanId = searchParams.get("loanId")

    if (!loanId) {
      return NextResponse.json({ error: "Loan ID is required" }, { status: 400 })
    }

    const payments = await getLoanPayments(loanId, session.userId)
    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error fetching loan payments:", error)
    return NextResponse.json({ error: "Failed to fetch loan payments" }, { status: 500 })
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

    if (!data.loanId || !data.amount || !data.paymentDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const amount = Number.parseFloat(data.amount)
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
    }

    const payment: Omit<LoanPayment, "_id" | "createdAt"> = {
      loanId: new ObjectId(data.loanId),
      userId: session.userId,
      amount,
      paymentDate: new Date(data.paymentDate),
    }

    const result = await addLoanPayment(payment)
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error adding loan payment:", error)
    return NextResponse.json({ error: "Failed to add loan payment" }, { status: 500 })
  }
}
