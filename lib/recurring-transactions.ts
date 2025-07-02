import clientPromise from "./mongodb"
import type { RecurringTransaction } from "./models/recurring-transaction"
import { ObjectId } from "mongodb"

export async function getRecurringTransactions(userId: string): Promise<RecurringTransaction[]> {
  try {
    const client = await clientPromise
    const db = client.db("finance-tracker")

    const transactions = await db
      .collection("recurring-transactions")
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray()

    return transactions as RecurringTransaction[]
  } catch (error) {
    console.error("Error fetching recurring transactions:", error)
    throw error
  }
}

export async function addRecurringTransaction(
  userId: string,
  transaction: Omit<RecurringTransaction, "_id" | "userId" | "createdAt" | "updatedAt">,
): Promise<RecurringTransaction> {
  try {
    const client = await clientPromise
    const db = client.db("finance-tracker")

    const newTransaction = {
      ...transaction,
      userId: new ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("recurring-transactions").insertOne(newTransaction)

    return {
      ...newTransaction,
      _id: result.insertedId,
    } as RecurringTransaction
  } catch (error) {
    console.error("Error adding recurring transaction:", error)
    throw error
  }
}

export async function deleteRecurringTransaction(id: string, userId: string): Promise<boolean> {
  try {
    const client = await clientPromise
    const db = client.db("finance-tracker")

    const result = await db.collection("recurring-transactions").deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    })

    return result.deletedCount > 0
  } catch (error) {
    console.error("Error deleting recurring transaction:", error)
    throw error
  }
}

export async function processRecurringTransactions(userId: string): Promise<number> {
  try {
    const client = await clientPromise
    const db = client.db("finance-tracker")

    // Find due transactions
    const dueTransactions = await db
      .collection("recurring-transactions")
      .find({
        userId: new ObjectId(userId),
        isActive: true,
        nextOccurrenceDate: { $lte: new Date() },
      })
      .toArray()

    let processedCount = 0

    for (const transaction of dueTransactions) {
      // Create expense
      const expense = {
        userId: new ObjectId(userId),
        amount: transaction.amount,
        category: transaction.category,
        description: `${transaction.description} (Recurring)`,
        date: new Date(),
        bankAccountId: transaction.bankAccountId ? new ObjectId(transaction.bankAccountId) : undefined,
        createdAt: new Date(),
      }

      await db.collection("expenses").insertOne(expense)

      // Update bank account balance if linked
      if (transaction.bankAccountId) {
        await db
          .collection("bank-accounts")
          .updateOne(
            { _id: new ObjectId(transaction.bankAccountId) },
            { $inc: { currentBalance: -transaction.amount } },
          )
      }

      // Calculate next occurrence date
      const nextDate = calculateNextOccurrence(transaction.nextOccurrenceDate, transaction.frequency)

      // Update recurring transaction
      await db.collection("recurring-transactions").updateOne(
        { _id: transaction._id },
        {
          $set: {
            nextOccurrenceDate: nextDate,
            updatedAt: new Date(),
          },
        },
      )

      processedCount++
    }

    return processedCount
  } catch (error) {
    console.error("Error processing recurring transactions:", error)
    throw error
  }
}

function calculateNextOccurrence(currentDate: Date, frequency: string): Date {
  const nextDate = new Date(currentDate)

  switch (frequency) {
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

  return nextDate
}
