import type { Document, Model } from "mongoose"
import { Schema, Types, model, models } from "mongoose"

export interface Expense extends Document {
  userId: Types.ObjectId
  amount: number
  category: string
  description: string
  date: Date
  bankAccountId?: Types.ObjectId
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
] as const

const ExpenseSchema = new Schema<Expense>(
  {
    userId: { type: Types.ObjectId, required: true, ref: "User" },
    amount: { type: Number, required: true },
    category: { type: String, required: true, enum: categories },
    description: { type: String, trim: true },
    date: { type: Date, required: true },
    bankAccountId: { type: Types.ObjectId, ref: "BankAccount" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
)

const ExpenseModel: Model<Expense> = (models.Expense as Model<Expense>) || model<Expense>("Expense", ExpenseSchema)

export default ExpenseModel
