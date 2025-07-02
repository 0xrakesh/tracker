import mongoose from "mongoose"
import type { ObjectId } from "mongodb"

export interface BankAccount {
  _id?: ObjectId
  userId: ObjectId
  bankName: string
  accountName: string
  balance: number
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
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Prevent re-compilation error
const BankAccountModel = mongoose.models?.BankAccount || mongoose.model("BankAccount", bankAccountSchema)

export default BankAccountModel
