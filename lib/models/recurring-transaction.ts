import mongoose, { Schema, type Document, type Model } from "mongoose"
import type { Types } from "mongoose"

export interface RecurringTransaction extends Document {
  userId: Types.ObjectId
  amount: number
  category: string
  description: string
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  nextOccurrenceDate: Date
  bankAccountId?: Types.ObjectId
  isActive: boolean
  createdAt: Date
}

const RecurringTransactionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  frequency: {
    type: String,
    required: true,
    enum: ["daily", "weekly", "monthly", "yearly"],
  },
  nextOccurrenceDate: { type: Date, required: true },
  bankAccountId: { type: Schema.Types.ObjectId, ref: "BankAccount" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

// Prevent re-compilation error in development
const RecurringTransactionModel: Model<RecurringTransaction> =
  mongoose.models?.RecurringTransaction ||
  mongoose.model<RecurringTransaction>("RecurringTransaction", RecurringTransactionSchema)

export default RecurringTransactionModel
