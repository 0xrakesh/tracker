import type { ObjectId } from "mongodb"

export interface RecurringTransaction {
  _id?: ObjectId
  userId: string
  type: "expense" // For now, only expense. Can be extended to "income" later.
  amount: number
  category: string // Relevant for expenses
  description: string
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  startDate: Date // The date the recurring transaction started
  nextOccurrenceDate: Date // The next date this transaction is due
  bankAccountId?: ObjectId // Optional: Link to a specific bank account
  createdAt: Date
}
