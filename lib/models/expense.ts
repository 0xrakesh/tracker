import type { ObjectId } from "mongodb"

export interface Expense {
  _id?: ObjectId
  userId: string
  amount: number
  category: string
  description: string
  date: Date
  createdAt: Date
}

export const categories = [
  "Food",
  "Transportation",
  "Housing",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Shopping",
  "Education",
  "Personal",
  "Other",
]
