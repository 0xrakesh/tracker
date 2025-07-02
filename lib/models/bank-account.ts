import type { ObjectId } from "mongodb"

export interface BankAccount {
  _id?: ObjectId
  userId: string
  bankName: string
  accountName: string // e.g., "Savings", "Checking", "Credit Card"
  initialBalance: number // The balance when the account was first added to the tracker
  currentBalance: number // The current running balance
  createdAt: Date
}
