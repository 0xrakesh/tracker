import { Types } from "mongoose"
import { connectToDatabase } from "./mongodb"
import RecurringTransactionModel, { type RecurringTransaction } from "./models/recurring-transaction"
import ExpenseModel from "./models/expense"
import BankAccountModel from "./models/bank-account"

const toObjectId = (id: string) => new Types.ObjectId(id)

export async function getRecurringTransactions(userId: string) {
  await connectToDatabase()
  return RecurringTransactionModel.find({ userId: toObjectId(userId) })
    .sort({ createdAt: -1 })
    .lean()
}

export async function addRecurringTransaction(
  userId: string,
  transaction: Omit<RecurringTransaction, "_id" | "userId" | "createdAt">,
) {
  await connectToDatabase()

  const newTransaction = new RecurringTransactionModel({
    ...transaction,
    userId: toObjectId(userId),
    createdAt: new Date(),
  })

  return newTransaction.save()
}

export async function deleteRecurringTransaction(userId: string, transactionId: string) {
  await connectToDatabase()

  const result = await RecurringTransactionModel.deleteOne({
    _id: toObjectId(transactionId),
    userId: toObjectId(userId),
  })

  return result.deletedCount > 0
}

export async function processRecurringTransactions(userId: string) {
  await connectToDatabase()

  const now = new Date()
  const dueTransactions = await RecurringTransactionModel.find({
    userId: toObjectId(userId),
    isActive: true,
    nextOccurrenceDate: { $lte: now },
  })

  const session = await RecurringTransactionModel.startSession()
  session.startTransaction()

  try {
    for (const transaction of dueTransactions) {
      // Create expense
      const expense = new ExpenseModel({
        userId: transaction.userId,
        amount: transaction.amount,
        category: transaction.category,
        description: `${transaction.description} (Recurring)`,
        date: new Date(),
        bankAccountId: transaction.bankAccountId,
        createdAt: new Date(),
      })

      await expense.save({ session })

      // Update bank account balance if linked
      if (transaction.bankAccountId) {
        await BankAccountModel.findByIdAndUpdate(
          transaction.bankAccountId,
          { $inc: { currentBalance: -transaction.amount } },
          { session },
        )
      }

      // Calculate next occurrence date
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

      // Update next occurrence date
      await RecurringTransactionModel.findByIdAndUpdate(transaction._id, { nextOccurrenceDate: nextDate }, { session })
    }

    await session.commitTransaction()
    return dueTransactions.length
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}
