import clientPromise from "./mongodb"
import type { RecurringTransaction } from "./models/recurring-transaction"
import { ObjectId } from "mongodb"

export async function addRecurringTransaction(transaction: Omit<RecurringTransaction, "_id" | "createdAt">) {
  try {
    const client = await clientPromise
    const db = client.db("finance-tracker")

    const result = await db.collection("recurringTransactions").insertOne({
      ...transaction,
      createdAt: new Date(),
    })

    return result
  } catch (error) {
    console.error("Error adding recurring transaction:", error)
    throw error
  }
}

export async function getRecurringTransactions(userId: ObjectId) {
  try {
    const client = await clientPromise
    const db = client.db("finance-tracker")

    const transactions = await db
      .collection("recurringTransactions")
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray()

    return transactions
  } catch (error) {
    console.error("Error fetching recurring transactions:", error)
    throw error
  }
}

export async function deleteRecurringTransaction(transactionId: string, userId: ObjectId) {
  try {
    const client = await clientPromise
    const db = client.db("finance-tracker")

    const result = await db.collection("recurringTransactions").deleteOne({
      _id: new ObjectId(transactionId),
      userId: new ObjectId(userId),
    })

    return result
  } catch (error) {
    console.error("Error deleting recurring transaction:", error)
    throw error
  }
}

export async function processRecurringTransactions(userId: ObjectId) {
  try {
    const client = await clientPromise
    const db = client.db("finance-tracker")

    const dueTransactions = await db
      .collection("recurringTransactions")
      .find({
        userId: new ObjectId(userId),
        isActive: true,
        nextOccurrenceDate: { $lte: new Date() },
      })
      .toArray()

    for (const transaction of dueTransactions) {
      // Create expense
      await db.collection("expenses").insertOne({
        userId: transaction.userId,
        amount: transaction.amount,
        category: transaction.category,
        description: `${transaction.description} (Recurring)`,
        date: new Date(),
        bankAccountId: transaction.bankAccountId,
        createdAt: new Date(),
      })

      // Update bank account balance if specified
      if (transaction.bankAccountId) {
        await db
          .collection("bankAccounts")
          .updateOne(
            { _id: new ObjectId(transaction.bankAccountId), userId: transaction.userId },
            { $inc: { currentBalance: -transaction.amount } },
          )
      }

      // Update next occurrence date
      const nextDate = new Date(transaction.nextOccurrenceDate)
      switch (transaction.frequency) {
        case "daily":
          nextDate.setDate(nextDate.getDate() + 1)
          break
        case "weekly":
          nextDate.setDate(nextDate.getDate() + 7)
          break
        case "monthly":
          nextDate.setMonth(nextDate.getMonth() + 1)
          break
        case "yearly":
          nextDate.setFullYear(nextDate.getFullYear() + 1)
          break
      }

      await db
        .collection("recurringTransactions")
        .updateOne({ _id: transaction._id }, { $set: { nextOccurrenceDate: nextDate } })
    }

    return dueTransactions.length
  } catch (error) {
    console.error("Error processing recurring transactions:", error)
    throw error
  }
}
