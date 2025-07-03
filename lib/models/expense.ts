import mongoose from "mongoose"
import type { ObjectId } from "mongodb"

export interface Expense {
  _id?: ObjectId
  userId: ObjectId
  amount: number
  category: string
  description: string
  date: Date
  createdAt?: Date
}

export const categories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Groceries",
  "Personal Care",
  "Home & Garden",
  "Gifts & Donations",
  "Business",
  "Other",
]

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: categories,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

const ExpenseModel = mongoose.models?.Expense || mongoose.model("Expense", expenseSchema)

export default ExpenseModel
