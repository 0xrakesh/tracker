"use client"

import { useState, useEffect, useCallback } from "react"
import type { Expense } from "@/lib/models/expense"

export function useBankAccountTransactions(bankAccountId: string | null) {
  const [transactions, setTransactions] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (!bankAccountId) {
      setTransactions([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/bank-accounts/${bankAccountId}/transactions`)
      if (!response.ok) {
        throw new Error("Failed to fetch bank account transactions")
      }
      const data = await response.json()
      setTransactions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [bankAccountId])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
  }
}
