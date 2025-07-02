"use client"

import { useState, useEffect } from "react"
import type { RecurringTransaction } from "@/lib/models/recurring-transaction"

export function useRecurringTransactions() {
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/recurring-transactions")

      if (!response.ok) {
        throw new Error("Failed to fetch recurring transactions")
      }

      const data = await response.json()
      setTransactions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const addTransaction = async (transaction: Omit<RecurringTransaction, "_id" | "userId" | "createdAt">) => {
    try {
      const response = await fetch("/api/recurring-transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      })

      if (!response.ok) {
        throw new Error("Failed to add recurring transaction")
      }

      await fetchTransactions()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/recurring-transactions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete recurring transaction")
      }

      await fetchTransactions()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    }
  }

  const processTransactions = async () => {
    try {
      const response = await fetch("/api/recurring-transactions/process", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to process recurring transactions")
      }

      const result = await response.json()
      await fetchTransactions()
      return result.message
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return null
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
    processTransactions,
  }
}
