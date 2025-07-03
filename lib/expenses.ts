import { ObjectId } from "mongodb"
import clientPromise from "./mongodb"
import type { Expense } from "./models/expense"

export async function getExpenses(userId: string, startDate?: Date, endDate?: Date) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const query: any = { userId }

  // Add date filtering if provided
  if (startDate || endDate) {
    query.date = {}
    if (startDate) {
      query.date.$gte = startDate
    }
    if (endDate) {
      query.date.$lte = endDate
    }
  }

  const expenses = await db.collection("expenses").find(query).sort({ date: -1 }).toArray()

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

export async function getExpenseStats(userId: string, startDate?: Date, endDate?: Date) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const matchStage: any = { userId }

  // Add date filtering if provided
  if (startDate || endDate) {
    matchStage.date = {}
    if (startDate) {
      matchStage.date.$gte = startDate
    }
    if (endDate) {
      matchStage.date.$lte = endDate
    }
  }

  // Get total expenses
  const total = await db
    .collection("expenses")
    .aggregate([{ $match: matchStage }, { $group: { _id: null, total: { $sum: "$amount" } } }])
    .toArray()

  // Get expenses by category
  const byCategory = await db
    .collection("expenses")
    .aggregate([
      { $match: matchStage },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ])
    .toArray()

  // Get expenses by month (if date range spans multiple months)
  const byMonth = await db
    .collection("expenses")
    .aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ])
    .toArray()

  return {
    total: total.length > 0 ? total[0].total : 0,
    byCategory: byCategory.map((item) => ({
      category: item._id,
      total: item.total,
    })),
    byMonth: byMonth.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      total: item.total,
    })),
  }
}
