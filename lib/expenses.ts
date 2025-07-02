import clientPromise from "./mongodb"
import type { Expense } from "./models/expense"
import { ObjectId } from "mongodb"

export async function addExpense(expense: Omit<Expense, "_id" | "createdAt">) {
  try {
    const client = await clientPromise
    const db = client.db("finance-tracker")

    const result = await db.collection("expenses").insertOne({
      ...expense,
      createdAt: new Date(),
    })

    return result
  } catch (error) {
    console.error("Error adding expense:", error)
    throw error
  }
}

export async function getExpenses(userId: ObjectId, startDate?: Date, endDate?: Date) {
  try {
    const client = await clientPromise
    const db = client.db("finance-tracker")

    const query: any = { userId: new ObjectId(userId) }

    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = startDate
      if (endDate) query.date.$lte = endDate
    }

    const expenses = await db.collection("expenses").find(query).sort({ date: -1 }).toArray()

    return expenses
  } catch (error) {
    console.error("Error fetching expenses:", error)
    throw error
  }
}

export async function deleteExpense(expenseId: string, userId: ObjectId) {
  try {
    const client = await clientPromise
    const db = client.db("finance-tracker")

    const result = await db.collection("expenses").deleteOne({
      _id: new ObjectId(expenseId),
      userId: new ObjectId(userId),
    })

    return result
  } catch (error) {
    console.error("Error deleting expense:", error)
    throw error
  }
}

export async function getExpenseStats(userId: ObjectId, startDate?: Date, endDate?: Date) {
  try {
    const client = await clientPromise
    const db = client.db("finance-tracker")

    const matchQuery: any = { userId: new ObjectId(userId) }

    if (startDate || endDate) {
      matchQuery.date = {}
      if (startDate) matchQuery.date.$gte = startDate
      if (endDate) matchQuery.date.$lte = endDate
    }

    const pipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalCount: { $sum: 1 },
          avgAmount: { $avg: "$amount" },
        },
      },
    ]

    const categoryPipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: "$category",
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { amount: -1 } },
    ]

    const [totalStats, categoryStats] = await Promise.all([
      db.collection("expenses").aggregate(pipeline).toArray(),
      db.collection("expenses").aggregate(categoryPipeline).toArray(),
    ])

    return {
      total: totalStats[0]?.totalAmount || 0,
      count: totalStats[0]?.totalCount || 0,
      average: totalStats[0]?.avgAmount || 0,
      byCategory: categoryStats,
    }
  } catch (error) {
    console.error("Error fetching expense stats:", error)
    throw error
  }
}

export async function getExpensesByBankAccountId(bankAccountId: string, userId: ObjectId) {
  try {
    const client = await clientPromise
    const db = client.db("finance-tracker")

    const expenses = await db
      .collection("expenses")
      .find({
        bankAccountId: new ObjectId(bankAccountId),
        userId: new ObjectId(userId),
      })
      .sort({ date: -1 })
      .toArray()

    return expenses
  } catch (error) {
    console.error("Error fetching expenses by bank account:", error)
    throw error
  }
}
