import { ObjectId } from "mongodb"
import clientPromise from "./mongodb"
import type { Budget, BudgetStatus } from "./models/budget"

export async function getBudgets(userId: string) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const budgets = await db.collection("budgets").find({ userId }).sort({ createdAt: -1 }).toArray()

  return JSON.parse(JSON.stringify(budgets))
}

export async function addBudget(budget: Omit<Budget, "_id" | "createdAt">) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const result = await db.collection("budgets").insertOne({
    ...budget,
    createdAt: new Date(),
  })

  return result
}

export async function deleteBudget(id: string) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const result = await db.collection("budgets").deleteOne({
    _id: new ObjectId(id),
  })

  return result
}

export async function getBudgetStatus(userId: string): Promise<BudgetStatus[]> {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const budgets = await getBudgets(userId)
  const budgetStatuses: BudgetStatus[] = []

  for (const budget of budgets) {
    // Calculate spent amount for this budget period and category
    const spent = await db
      .collection("expenses")
      .aggregate([
        {
          $match: {
            userId,
            category: budget.category,
            date: {
              $gte: new Date(budget.startDate),
              $lte: new Date(budget.endDate),
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ])
      .toArray()

    const spentAmount = spent.length > 0 ? spent[0].total : 0
    const remaining = budget.amount - spentAmount
    const percentage = (spentAmount / budget.amount) * 100

    budgetStatuses.push({
      budget,
      spent: spentAmount,
      remaining,
      percentage,
      isOverBudget: spentAmount > budget.amount,
    })
  }

  return budgetStatuses
}
