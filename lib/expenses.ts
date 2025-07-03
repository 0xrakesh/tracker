import clientPromise from "./mongodb"
import type { Expense } from "./models/expense"
import { ObjectId } from "mongodb"

export async function getExpenses(userId: ObjectId, startDate?: Date, endDate?: Date): Promise<Expense[]> {
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

    return expenses as Expense[]
  } catch (error) {
    console.error("Error fetching expenses:", error)
    throw error
  }
}

export async function addExpense(expense: Omit<Expense, "_id" | "createdAt">): Promise<any> {
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

export async function deleteExpense(id: string, userId: ObjectId): Promise<boolean> {
  try {
    const client = await clientPromise
    const db = client.db("finance-tracker")

    const result = await db.collection("expenses").deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    })

    return result.deletedCount > 0
  } catch (error) {
    console.error("Error deleting expense:", error)
    throw error
  }
}

export async function getExpenseStats(userId: ObjectId, startDate?: Date, endDate?: Date) {
  try {
    const client = await clientPromise
    const db = client.db("finance-tracker")

    const query: any = { userId: new ObjectId(userId) }

    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = startDate
      if (endDate) query.date.$lte = endDate
    }

    const expenses = await db.collection("expenses").find(query).toArray()

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalCount = expenses.length

    const categoryStats = expenses.reduce(
      (acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalAmount,
      totalCount,
      categoryStats,
    }
  } catch (error) {
    console.error("Error getting expense stats:", error)
    throw error
  }
}

/**
 * Fallback stub – bank-account features were removed in v27.
 * This exists only so legacy imports compile during the transition.
 * If it’s ever called, it will simply return an empty array.
 */
export async function getExpensesByBankAccountId(): Promise<never[]> {
  return []
}
