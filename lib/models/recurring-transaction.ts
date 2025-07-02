import mongoose, { Schema, type Document, type Model } from "mongoose"
import type { Types } from "mongoose"

export type Frequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly"

export interface RecurringTransaction extends Document {
  userId: Types.ObjectId
  name: string
  amount: number
  category: string
  bankAccountId?: Types.ObjectId // Optional: Link to a bank account
  frequency: Frequency
  startDate: Date
  nextOccurrenceDate: Date // Date when the next expense should be generated
  lastGeneratedDate?: Date // Date when the last expense was generated
  description?: string
  createdAt: Date
}

const RecurringTransactionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  bankAccountId: { type: Schema.Types.ObjectId, ref: "BankAccount" },
  frequency: { type: String, enum: ["daily", "weekly", "monthly", "quarterly", "yearly"], required: true },
  startDate: { type: Date, required: true },
  nextOccurrenceDate: { type: Date, required: true },
  lastGeneratedDate: { type: Date },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
})

const RecurringTransactionModel: Model<RecurringTransaction> =
  mongoose.models.RecurringTransaction ||
  mongoose.model<RecurringTransaction>("RecurringTransaction", RecurringTransactionSchema)

export default RecurringTransactionModel
