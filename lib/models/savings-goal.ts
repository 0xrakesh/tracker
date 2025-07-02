import type { ObjectId } from "mongodb"

export interface SavingsGoal {
  _id?: ObjectId
  userId: string
  bankAccountId: ObjectId // Link to a specific bank account
  goalName: string // e.g., "Emergency Fund", "New Car Down Payment"
  targetAmount: number
  targetDate?: Date // Optional target date
  createdAt: Date
}
