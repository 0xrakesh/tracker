import mongoose, { Schema, type Document, type Model } from "mongoose"
import type { Types } from "mongoose"

export interface Expense extends Document {
  userId: Types.ObjectId
  amount: number
  category: string
  date: Date
  description?: string
  bankAccountId?: Types.ObjectId
  createdAt: Date
}

// Export the categories as a named export
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

const ExpenseSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true, enum: categories },
  date: { type: Date, required: true },
  description: { type: String },
  bankAccountId: { type: Schema.Types.ObjectId, ref: "BankAccount" },
  createdAt: { type: Date, default: Date.now },
})

// Prevent re-compilation error in development
const ExpenseModel: Model<Expense> = mongoose.models?.Expense || mongoose.model<Expense>("Expense", ExpenseSchema)

export default ExpenseModel
