import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { addLoan, getLoans, calculateMonthlyPayment } from "@/lib/loans"
import type { Loan } from "@/lib/models/loan"
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

    const loans = await getLoans(session.userId)
    return NextResponse.json(loans)
  } catch (error) {
    console.error("Error fetching loans:", error)
    return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 })
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

    if (!data.loanName || !data.principalAmount || !data.interestRate || !data.loanTermMonths || !data.startDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const principalAmount = Number.parseFloat(data.principalAmount)
    const interestRate = Number.parseFloat(data.interestRate) / 100 // Convert percentage to decimal
    const loanTermMonths = Number.parseInt(data.loanTermMonths)

    if (
      isNaN(principalAmount) ||
      principalAmount <= 0 ||
      isNaN(interestRate) ||
      isNaN(loanTermMonths) ||
      loanTermMonths <= 0
    ) {
      return NextResponse.json({ error: "Invalid loan amount, interest rate, or term" }, { status: 400 })
    }

    const monthlyPayment = calculateMonthlyPayment(principalAmount, interestRate, loanTermMonths)

    const loan: Omit<Loan, "_id" | "createdAt"> = {
      userId: session.userId,
      loanName: data.loanName,
      principalAmount,
      interestRate: interestRate * 100, // Store as percentage
      loanTermMonths,
      startDate: new Date(data.startDate),
      monthlyPayment: Number.parseFloat(monthlyPayment.toFixed(2)),
    }

    const result = await addLoan(loan)
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error adding loan:", error)
    return NextResponse.json({ error: "Failed to add loan" }, { status: 500 })
  }
}
