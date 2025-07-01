import { ObjectId } from "mongodb"
import clientPromise from "./mongodb"
import type { Loan, LoanPayment } from "./models/loan"
import { addMonths } from "date-fns" // Import addMonths

// Helper function to calculate monthly payment (PMT formula)
export function calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
  if (annualRate === 0) {
    return principal / termMonths
  }
  const monthlyRate = annualRate / 12
  const monthlyPayment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) / (Math.pow(1 + monthlyRate, termMonths) - 1)
  return monthlyPayment
}

// Function to generate an amortization schedule
export function getAmortizationSchedule(
  principal: number,
  annualRate: number, // as decimal, e.g., 0.05
  termMonths: number,
  startDate: Date,
) {
  const monthlyRate = annualRate / 12
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths)

  let balance = principal
  const schedule = []
  let currentDueDate = new Date(startDate) // Start date is the first payment date

  for (let i = 1; i <= termMonths; i++) {
    const interestPayment = balance * monthlyRate
    const principalPayment = monthlyPayment - interestPayment
    balance -= principalPayment

    currentDueDate = addMonths(currentDueDate, 1) // Next due date

    schedule.push({
      paymentNumber: i,
      paymentDate: new Date(currentDueDate), // This is the due date for this payment
      monthlyPayment: monthlyPayment,
      principalPaid: principalPayment,
      interestPaid: interestPayment,
      remainingBalance: Math.max(0, balance), // Ensure non-negative
    })
  }
  return schedule
}

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
