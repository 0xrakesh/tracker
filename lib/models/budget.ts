import type { ObjectId } from "mongodb"

export interface Budget {
  _id?: ObjectId
  userId: string
  category: string
  amount: number
  period: "monthly" | "weekly" | "yearly"
  startDate: Date
  endDate: Date
  createdAt: Date
}

export interface BudgetStatus {
  budget: Budget
  spent: number
  remaining: number
  percentage: number
  isOverBudget: boolean
}
