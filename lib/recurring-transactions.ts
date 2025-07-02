import { connectToDatabase } from "@/lib/mongodb"
import RecurringTransactionModel, {
  type RecurringTransaction,
  type Frequency,
} from "@/lib/models/recurring-transaction"
import { addExpense } from "@/lib/expenses"
import { addDays, addWeeks, addMonths, addYears } from "date-fns"
import { Types } from "mongoose"

const toObjectId = (id: string) => new Types.ObjectId(id)

export async function getRecurringTransactions(userId: string) {
  await connectToDatabase()
  return RecurringTransactionModel.find({ userId: toObjectId(userId) })
    .sort({ nextOccurrenceDate: 1 })
    .lean()
}

export async function addRecurringTransaction(
  userId: string,
  transaction: Omit<RecurringTransaction, "_id" | "userId" | "createdAt" | "lastGeneratedDate">,
) {
  await connectToDatabase()
  const newTransaction = new RecurringTransactionModel({
    ...transaction,
    userId: toObjectId(userId),
    createdAt: new Date(),
  })
  await newTransaction.save()
  return newTransaction.toObject()
}

export async function deleteRecurringTransaction(userId: string, transactionId: string) {
  await connectToDatabase()
  const result = await RecurringTransactionModel.deleteOne({
    _id: toObjectId(transactionId),
    userId: toObjectId(userId),
  })
  return result.deletedCount > 0
}

// Helper to calculate next occurrence date
function calculateNextOccurrence(currentDate: Date, frequency: Frequency): Date {
  switch (frequency) {
    case "daily":
      return addDays(currentDate, 1)
    case "weekly":
      return addWeeks(currentDate, 1)
    case "monthly":
      return addMonths(currentDate, 1)
    case "quarterly":
      return addMonths(currentDate, 3)
    case "yearly":
      return addYears(currentDate, 1)
    default:
      return addMonths(currentDate, 1) // Default to monthly
  }
}

export async function processRecurringTransactions(userId: string) {
  await connectToDatabase()
  const now = new Date()
  const transactionsToProcess = await RecurringTransactionModel.find({
    userId: toObjectId(userId),
    nextOccurrenceDate: { $lte: now },
  }).lean()

  const processedExpenses = []

  for (const transaction of transactionsToProcess) {
    try {
      // Add the expense
      const newExpense = await addExpense(userId, {
        amount: transaction.amount,
        category: transaction.category,
        date: now, // Use current date for the generated expense
        description: `Recurring: ${transaction.name}`,
        bankAccountId: transaction.bankAccountId,
      })
      processedExpenses.push(newExpense)

      // Update the recurring transaction's next occurrence date and last generated date
      const nextOccurrence = calculateNextOccurrence(transaction.nextOccurrenceDate, transaction.frequency)
      await RecurringTransactionModel.findByIdAndUpdate(transaction._id, {
        nextOccurrenceDate: nextOccurrence,
        lastGeneratedDate: now,
      })
    } catch (error) {
      console.error(`Error processing recurring transaction ${transaction._id}:`, error)
      // Optionally, log this error or notify the user
    }
  }
  return processedExpenses
}
