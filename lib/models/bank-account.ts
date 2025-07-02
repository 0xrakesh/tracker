import mongoose from "mongoose"
import type { ObjectId } from "mongodb"

export interface BankAccount {
  _id?: ObjectId
  userId: ObjectId
  bankName: string
  accountName: string
  accountNumber?: string
  currentBalance: number
  createdAt?: Date
  updatedAt?: Date
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
    accountNumber: {
      type: String,
      trim: true,
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
