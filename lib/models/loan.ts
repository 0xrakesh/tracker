import type { ObjectId } from "mongodb"

export interface Loan {
  _id?: ObjectId
  userId: string
  loanName: string
  principalAmount: number
  interestRate: number // Annual interest rate as a decimal (e.g., 0.05 for 5%)
  loanTermMonths: number // Loan term in months
  startDate: Date
  monthlyPayment: number
  createdAt: Date
}

export interface LoanPayment {
  _id?: ObjectId
  loanId: ObjectId
  userId: string
  amount: number
  paymentDate: Date
  createdAt: Date
}
