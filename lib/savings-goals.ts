import { ObjectId } from "mongodb"
import clientPromise from "./mongodb"
import type { SavingsGoal } from "./models/savings-goal"

export async function getSavingsGoals(userId: string) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const savingsGoals = await db.collection("savingsGoals").find({ userId }).sort({ createdAt: -1 }).toArray()

  return JSON.parse(JSON.stringify(savingsGoals))
}

export async function addSavingsGoal(goal: Omit<SavingsGoal, "_id" | "createdAt">) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const result = await db.collection("savingsGoals").insertOne({
    ...goal,
    createdAt: new Date(),
  })

  return result
}

export async function deleteSavingsGoal(id: string) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const result = await db.collection("savingsGoals").deleteOne({
    _id: new ObjectId(id),
  })

  return result
}
