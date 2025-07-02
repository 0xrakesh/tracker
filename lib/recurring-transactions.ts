import { ObjectId } from "mongodb"
import clientPromise from "./mongodb"
import type { RecurringTransaction } from "./models/recurring-transaction"
import { addExpense } from "./expenses" // Import addExpense to create actual expenses
import { addMonths, addWeeks, addYears, addDays } from "date-fns"

export async function getRecurringTransactions(userId: string) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const recurringTransactions = await db
    .collection("recurringTransactions")
    .find({ userId })
    .sort({ nextOccurrenceDate: 1 })
    .toArray()

  return JSON.parse(JSON.stringify(recurringTransactions))
}

export async function addRecurringTransaction(transaction: Omit<RecurringTransaction, "_id" | "createdAt">) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const result = await db.collection("recurringTransactions").insertOne({
    ...transaction,
    createdAt: new Date(),
  })

  return result
}

export async function deleteRecurringTransaction(id: string) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const result = await db.collection("recurringTransactions").deleteOne({
    _id: new ObjectId(id),
  })

  return result
}

// Function to process recurring transactions
export async function processRecurringTransactions(userId: string) {
  const client = await clientPromise
  const db = client.db("finance-tracker")

  const now = new Date()
  let processedCount = 0 // Changed from const to let

  // Find recurring transactions that are due
  const dueTransactions = await db
    .collection("recurringTransactions")
    .find({
      userId,
      nextOccurrenceDate: { $lte: now },
    })
    .toArray()

  for (const transaction of dueTransactions) {
    // Create an actual expense entry
    if (transaction.type === "expense") {
      await addExpense({
        userId: transaction.userId,
        amount: transaction.amount,
        category: transaction.category,
        description: `Recurring: ${transaction.description}`,
        date: transaction.nextOccurrenceDate, // Use the scheduled date
        bankAccountId: transaction.bankAccountId,
      })
    }
    // TODO: Add income handling if 'type' is extended

    // Calculate next occurrence date
    let newNextOccurrenceDate = new Date(transaction.nextOccurrenceDate)
    switch (transaction.frequency) {
      case "daily":
        newNextOccurrenceDate = addDays(newNextOccurrenceDate, 1)
        break
      case "weekly":
        newNextOccurrenceDate = addWeeks(newNextOccurrenceDate, 1)
        break
      case "monthly":
        newNextOccurrenceDate = addMonths(newNextOccurrenceDate, 1)
        break
      case "yearly":
        newNextOccurrenceDate = addYears(newNextOccurrenceDate, 1)
        break
    }

    // Update the recurring transaction with the new next occurrence date
    await db
      .collection("recurringTransactions")
      .updateOne({ _id: transaction._id }, { $set: { nextOccurrenceDate: newNextOccurrenceDate } })
    processedCount++
  }

  return { processedCount }
}
