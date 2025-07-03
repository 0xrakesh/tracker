import { ObjectId } from "mongodb"
import clientPromise from "./mongodb"
import type { BankAccount } from "./models/bank-account"

export async function getBankAccounts(userId: string) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const bankAccounts = await db.collection("bankAccounts").find({ userId }).sort({ createdAt: -1 }).toArray()

  return JSON.parse(JSON.stringify(bankAccounts))
}

export async function addBankAccount(bankAccount: Omit<BankAccount, "_id" | "createdAt">) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const result = await db.collection("bankAccounts").insertOne({
    ...bankAccount,
    createdAt: new Date(),
  })

  return result
}

export async function updateBankAccountBalance(accountId: string, userId: string, amount: number) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const result = await db.collection("bankAccounts").updateOne(
    { _id: new ObjectId(accountId), userId },
    { $inc: { currentBalance: amount } }, // Use $inc to atomically update the balance
  )

  return result
}

export async function deleteBankAccount(id: string) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const result = await db.collection("bankAccounts").deleteOne({
    _id: new ObjectId(id),
  })

  return result
}
