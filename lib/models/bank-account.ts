import mongoose, { Schema, type Document, type Model } from "mongoose"
import type { Types } from "mongoose"

export interface BankAccount extends Document {
  userId: Types.ObjectId
  bankName: string
  accountName: string
  currentBalance: number
  createdAt: Date
}

const BankAccountSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  bankName: { type: String, required: true },
  accountName: { type: String, required: true },
  currentBalance: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now },
})

// Prevent re-compilation error in development
const BankAccountModel: Model<BankAccount> =
  mongoose.models?.BankAccount || mongoose.model<BankAccount>("BankAccount", BankAccountSchema)

export default BankAccountModel
