import type { Document, Model } from "mongoose"
import { Schema, Types, model, models } from "mongoose"

export interface BankAccount extends Document {
  userId: Types.ObjectId
  bankName: string
  accountName: string
  initialBalance: number
  currentBalance: number
  createdAt: Date
}

const BankAccountSchema = new Schema<BankAccount>(
  {
    userId: { type: Types.ObjectId, required: true, ref: "User" },
    bankName: { type: String, required: true },
    accountName: { type: String, required: true },
    initialBalance: { type: Number, required: true },
    currentBalance: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
)

const BankAccountModel: Model<BankAccount> =
  (models.BankAccount as Model<BankAccount>) || model<BankAccount>("BankAccount", BankAccountSchema)

export default BankAccountModel
