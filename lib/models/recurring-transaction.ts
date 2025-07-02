import mongoose from "mongoose"
import type { ObjectId } from "mongodb"

export interface RecurringTransaction {
  _id?: ObjectId
  userId: ObjectId
  amount: number
  category: string
  description: string
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  nextOccurrenceDate: Date
  bankAccountId?: ObjectId
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

const recurringTransactionSchema = new mongoose.Schema(
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
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    frequency: {
      type: String,
      required: true,
      enum: ["daily", "weekly", "monthly", "yearly"],
    },
    nextOccurrenceDate: {
      type: Date,
      required: true,
    },
    bankAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankAccount",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

const RecurringTransactionModel =
  mongoose.models?.RecurringTransaction || mongoose.model("RecurringTransaction", recurringTransactionSchema)

export default RecurringTransactionModel
