import mongoose, { Schema, type Document, models } from "mongoose"

export interface RecurringTransaction extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  amount: number
  category: string
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  startDate: Date
  nextOccurrenceDate: Date
  bankAccountId?: mongoose.Types.ObjectId // Optional: Link to a bank account
  notes?: string
  createdAt: Date
}

const RecurringTransactionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  frequency: {
    type: String,
    enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
    required: true,
  },
  startDate: { type: Date, required: true },
  nextOccurrenceDate: { type: Date, required: true },
  bankAccountId: { type: Schema.Types.ObjectId, ref: "BankAccount" },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
})

const RecurringTransactionModel =
  models.RecurringTransaction ||
  mongoose.model<RecurringTransaction>("RecurringTransaction", RecurringTransactionSchema)

export default RecurringTransactionModel
