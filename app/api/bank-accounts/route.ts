import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { addBankAccount, getBankAccounts } from "@/lib/bank-accounts"
import type { BankAccount } from "@/lib/models/bank-account"
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

    const bankAccounts = await getBankAccounts(session.userId)
    return NextResponse.json(bankAccounts)
  } catch (error) {
    console.error("Error fetching bank accounts:", error)
    return NextResponse.json({ error: "Failed to fetch bank accounts" }, { status: 500 })
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

    if (!data.bankName || !data.accountName || data.initialBalance === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const initialBalance = Number.parseFloat(data.initialBalance)
    if (isNaN(initialBalance)) {
      return NextResponse.json({ error: "Initial balance must be a number" }, { status: 400 })
    }

    const bankAccount: Omit<BankAccount, "_id" | "createdAt"> = {
      userId: session.userId,
      bankName: data.bankName,
      accountName: data.accountName,
      initialBalance: initialBalance,
      currentBalance: initialBalance, // Current balance starts as initial balance
    }

    const result = await addBankAccount(bankAccount)
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error adding bank account:", error)
    return NextResponse.json({ error: "Failed to add bank account" }, { status: 500 })
  }
}
