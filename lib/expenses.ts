import { ObjectId } from "mongodb"
import clientPromise from "./mongodb"
import type { Expense } from "./models/expense"

export async function getExpenses(userId: string) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const expenses = await db.collection("expenses").find({ userId }).sort({ date: -1 }).toArray()

  return JSON.parse(JSON.stringify(expenses))
}

export async function addExpense(expense: Omit<Expense, "_id" | "createdAt">) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const result = await db.collection("expenses").insertOne({
    ...expense,
    createdAt: new Date(),
  })

  return result
}

export async function deleteExpense(id: string) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const result = await db.collection("expenses").deleteOne({
    _id: new ObjectId(id),
  })

  return result
}

export async function getExpenseStats(userId: string) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  // Get total expenses
  const total = await db
    .collection("expenses")
    .aggregate([{ $match: { userId } }, { $group: { _id: null, total: { $sum: "$amount" } } }])
    .toArray()

  // Get expenses by category
  const byCategory = await db
    .collection("expenses")
    .aggregate([
      { $match: { userId } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ])
    .toArray()

  return {
    total: total.length > 0 ? total[0].total : 0,
    byCategory: byCategory.map((item) => ({
      category: item._id,
      total: item.total,
    })),
  }
}
