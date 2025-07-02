import { connectToDatabase } from "@/lib/mongodb"
import RecurringTransactionModel, { type RecurringTransaction } from "@/lib/models/recurring-transaction"
import ExpenseModel from "@/lib/models/expense" // Assuming ExpenseModel exists
import BankAccountModel from "@/lib/models/bank-account" // Assuming BankAccountModel exists
import { ObjectId } from "mongodb"
import { addDays, addWeeks, addMonths, addQuarters, addYears, isPast } from "date-fns"

export async function getRecurringTransactions(userId: string) {
  await connectToDatabase()
  return RecurringTransactionModel.find({ userId: new ObjectId(userId) })
    .sort({ nextOccurrenceDate: 1 })
    .lean()
}

export async function addRecurringTransaction(
  userId: string,
  transaction: Omit<RecurringTransaction, "_id" | "userId" | "createdAt">,
) {
  await connectToDatabase()
  const newTransaction = new RecurringTransactionModel({
    ...transaction,
    userId: new ObjectId(userId),
  })
  await newTransaction.save()
  return newTransaction.toObject()
}

export async function deleteRecurringTransaction(userId: string, transactionId: string) {
  await connectToDatabase()
  const result = await RecurringTransactionModel.deleteOne({
    _id: new ObjectId(transactionId),
    userId: new ObjectId(userId),
  })
  return result.deletedCount > 0
}

// Helper to calculate next occurrence date
function calculateNextOccurrence(currentDate: Date, frequency: RecurringTransaction["frequency"]): Date {
  switch (frequency) {
    case "daily":
      return addDays(currentDate, 1)
    case "weekly":
      return addWeeks(currentDate, 1)
    case "monthly":
      return addMonths(currentDate, 1)
    case "quarterly":
      return addQuarters(currentDate, 1)
    case "yearly":
      return addYears(currentDate, 1)
    default:
      return currentDate // Should not happen
  }
}

export async function processDueRecurringTransactions(userId: string) {
  await connectToDatabase()
  const now = new Date()
  const processedTransactions: ExpenseModel[] = []
  let processedCount = 0

  const dueTransactions = await RecurringTransactionModel.find({
    userId: new ObjectId(userId),
    nextOccurrenceDate: { $lte: now },
  })

  for (const transaction of dueTransactions) {
    // Create a new expense entry
    const newExpense = new ExpenseModel({
      userId: transaction.userId,
      amount: transaction.amount,
      category: transaction.category,
      description: `Recurring: ${transaction.name}`,
      date: transaction.nextOccurrenceDate, // Use the scheduled occurrence date
      bankAccountId: transaction.bankAccountId,
      isRecurring: true, // Mark as recurring
      recurringTransactionId: transaction._id, // Link to the recurring transaction
    })

    try {
      await newExpense.save()
      processedTransactions.push(newExpense)
      processedCount++

      // Deduct from bank account if linked
      if (transaction.bankAccountId) {
        await BankAccountModel.findByIdAndUpdate(
          transaction.bankAccountId,
          { $inc: { currentBalance: -transaction.amount } },
          { new: true },
        )
      }

      // Update next occurrence date for the recurring transaction
      let nextDate = calculateNextOccurrence(transaction.nextOccurrenceDate, transaction.frequency)
      // If the next calculated date is still in the past (e.g., server was down for a while),
      // advance it until it's in the future.
      while (isPast(nextDate)) {
        nextDate = calculateNextOccurrence(nextDate, transaction.frequency)
      }

      transaction.nextOccurrenceDate = nextDate
      await transaction.save()
    } catch (error) {
      console.error(`Error processing recurring transaction ${transaction._id}:`, error)
      // Optionally, handle errors more gracefully, e.g., log to a separate error collection
    }
  }
  return { processedCount, processedTransactions }
}
