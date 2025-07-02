import mongoose from "mongoose"
import type { ObjectId } from "mongodb"

export interface BankAccount {
  _id?: ObjectId
  userId: ObjectId
  bankName: string
  accountName: string
  initialBalance: number
  currentBalance: number
  createdAt?: Date
}

const bankAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    accountName: {
      type: String,
      required: true,
      trim: true,
    },
    initialBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    currentBalance: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

const BankAccountModel = mongoose.models?.BankAccount || mongoose.model("BankAccount", bankAccountSchema)

export default BankAccountModel
