import { Types } from "mongoose"
import { connectToDatabase } from "./mongodb"
import ExpenseModel, { type Expense } from "./models/expense"
import BankAccountModel from "./models/bank-account"

/* -------------------------- helpers & type guards ------------------------- */
const toObjectId = (id: string) => new Types.ObjectId(id)

/* -------------------------------- queries --------------------------------- */
export async function getExpenses(userId: string, start?: Date, end?: Date) {
  await connectToDatabase()

  const query: any = { userId: toObjectId(userId) }
  if (start || end) {
    query.date = {}
    if (start) query.date.$gte = start
    if (end) query.date.$lte = end
  }

  return ExpenseModel.find(query).sort({ date: -1 }).lean()
}

export async function addExpense(userId: string, expense: Omit<Expense, "_id" | "userId" | "createdAt">) {
  await connectToDatabase()

  const session = await ExpenseModel.startSession()
  session.startTransaction()

  try {
    const saved = await new ExpenseModel({
      ...expense,
      userId: toObjectId(userId),
      createdAt: new Date(),
    }).save({ session })

    if (expense.bankAccountId) {
      await BankAccountModel.findByIdAndUpdate(
        expense.bankAccountId,
        { $inc: { currentBalance: -expense.amount } },
        { session },
      )
    }

    await session.commitTransaction()
    return saved.toObject()
  } catch (e) {
    await session.abortTransaction()
    throw e
  } finally {
    session.endSession()
  }
}

export async function deleteExpense(userId: string, expenseId: string) {
  await connectToDatabase()

  const session = await ExpenseModel.startSession()
  session.startTransaction()

  try {
    const expense = await ExpenseModel.findOne({
      _id: toObjectId(expenseId),
      userId: toObjectId(userId),
    }).session(session)

    if (!expense) {
      await session.abortTransaction()
      return false
    }

    if (expense.bankAccountId) {
      await BankAccountModel.findByIdAndUpdate(
        expense.bankAccountId,
        { $inc: { currentBalance: expense.amount } },
        { session },
      )
    }

    await ExpenseModel.deleteOne({ _id: expense._id }).session(session)
    await session.commitTransaction()
    return true
  } catch (e) {
    await session.abortTransaction()
    throw e
  } finally {
    session.endSession()
  }
}

export async function getExpenseStats(userId: string, start?: Date, end?: Date) {
  await connectToDatabase()

  const match: any = { userId: toObjectId(userId) }
  if (start || end) {
    match.date = {}
    if (start) match.date.$gte = start
    if (end) match.date.$lte = end
  }

  const [totals] = await ExpenseModel.aggregate([
    { $match: match },
    {
      $facet: {
        total: [{ $group: { _id: null, total: { $sum: "$amount" } } }],
        byCategory: [{ $group: { _id: "$category", total: { $sum: "$amount" } } }, { $sort: { total: -1 } }],
        byMonth: [
          {
            $group: {
              _id: { year: { $year: "$date" }, month: { $month: "$date" } },
              total: { $sum: "$amount" },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ],
      },
    },
    {
      $project: {
        total: { $arrayElemAt: ["$total.total", 0] },
        byCategory: 1,
        byMonth: 1,
      },
    },
  ])

  return {
    total: totals?.total ?? 0,
    byCategory: totals?.byCategory ?? [],
    byMonth: totals?.byMonth ?? [],
  }
}

/* ---------- helper used by new Bank-Account detailed view feature ---------- */
export async function getExpensesByBankAccountId(userId: string, bankAccountId: string) {
  await connectToDatabase()
  return ExpenseModel.find({
    userId: toObjectId(userId),
    bankAccountId: toObjectId(bankAccountId),
  })
    .sort({ date: -1 })
    .lean()
}
