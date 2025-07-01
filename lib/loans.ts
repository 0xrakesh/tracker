import { ObjectId } from "mongodb"
import clientPromise from "./mongodb"
import type { Loan, LoanPayment } from "./models/loan"

// Re-export pure calculation helpers so legacy imports keep working
export { calculateMonthlyPayment, getAmortizationSchedule } from "./loan-calculations"

export async function getLoans(userId: string) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const loans = await db.collection("loans").find({ userId }).sort({ startDate: -1 }).toArray()

  return JSON.parse(JSON.stringify(loans))
}

export async function addLoan(loan: Omit<Loan, "_id" | "createdAt">) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const result = await db.collection("loans").insertOne({
    ...loan,
    createdAt: new Date(),
  })

  return result
}

export async function deleteLoan(id: string) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const result = await db.collection("loans").deleteOne({
    _id: new ObjectId(id),
  })

  return result
}

export async function addLoanPayment(payment: Omit<LoanPayment, "_id" | "createdAt">) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const result = await db.collection("loanPayments").insertOne({
    ...payment,
    createdAt: new Date(),
  })

  return result
}

export async function getLoanPayments(loanId: string, userId: string) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const payments = await db
    .collection("loanPayments")
    .find({ loanId: new ObjectId(loanId), userId })
    .sort({ paymentDate: -1 })
    .toArray()

  return JSON.parse(JSON.stringify(payments))
}
