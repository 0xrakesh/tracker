import mongoose, { Schema, type Document, type Model } from "mongoose"
import type { Types } from "mongoose"

export interface BankAccount extends Document {
  userId: Types.ObjectId
  bankName: string
  accountName: string
  initialBalance: number
  currentBalance: number
  createdAt: Date
}

const BankAccountSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  bankName: { type: String, required: true },
  accountName: { type: String, required: true },
  initialBalance: { type: Number, required: true },
  currentBalance: { type: Number, required: true }, // This will be updated as expenses are added/deleted
  createdAt: { type: Date, default: Date.now },
})

const BankAccountModel: Model<BankAccount> =
  mongoose.models.BankAccount || mongoose.model<BankAccount>("BankAccount", BankAccountSchema)

export default BankAccountModel
