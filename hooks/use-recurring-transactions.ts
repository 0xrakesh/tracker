"use client"

import { useState, useEffect, useCallback } from "react"
import type { RecurringTransaction } from "@/lib/models/recurring-transaction"
import type { BankAccount } from "@/lib/models/bank-account"

interface RecurringTransactionWithAccount extends RecurringTransaction {
  bankAccountName?: string
}

export function useRecurringTransactions() {
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransactionWithAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecurringTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [transactionsResponse, accountsResponse] = await Promise.all([
        fetch("/api/recurring-transactions"),
        fetch("/api/bank-accounts"), // Fetch bank accounts to link names
      ])

      if (!transactionsResponse.ok || !accountsResponse.ok) {
        throw new Error("Failed to fetch recurring transactions or bank accounts")
      }

      const transactionsData = await transactionsResponse.json()
      const accountsData = await accountsResponse.json()

      const transactionsWithAccountNames = transactionsData.map((transaction: RecurringTransaction) => {
        const linkedAccount = transaction.bankAccountId
          ? accountsData.find((acc: BankAccount) => acc._id?.toString() === transaction.bankAccountId?.toString())
          : undefined
        return {
          ...transaction,
          bankAccountName: linkedAccount ? `${linkedAccount.bankName} (${linkedAccount.accountName})` : undefined,
        }
      })

      setRecurringTransactions(transactionsWithAccountNames)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  const addRecurringTransaction = async (
    transaction: Omit<RecurringTransaction, "_id" | "userId" | "createdAt" | "type" | "nextOccurrenceDate"> & {
      type: "expense"
      nextOccurrenceDate: Date
    },
  ) => {
    try {
      const response = await fetch("/api/recurring-transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add recurring transaction")
      }

      await fetchRecurringTransactions()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    }
  }

  const deleteRecurringTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/recurring-transactions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete recurring transaction")
      }

      await fetchRecurringTransactions()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    }
  }

  const processDueTransactions = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/recurring-transactions/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process recurring transactions")
      }
      const data = await response.json()
      return data.processedCount
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return 0
    } finally {
      setLoading(false)
      await fetchRecurringTransactions() // Re-fetch after processing
    }
  }

  useEffect(() => {
    fetchRecurringTransactions()
  }, [fetchRecurringTransactions])

  return {
    recurringTransactions,
    loading,
    error,
    fetchRecurringTransactions,
    addRecurringTransaction,
    deleteRecurringTransaction,
    processDueTransactions,
  }
}
