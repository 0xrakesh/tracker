"use client"

import { useState, useEffect } from "react"
import type { Expense } from "@/lib/models/expense"

export function useBankAccountTransactions(bankAccountId: string | null) {
  const [transactions, setTransactions] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    if (!bankAccountId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/bank-accounts/${bankAccountId}/transactions`)

      if (!response.ok) {
        throw new Error("Failed to fetch transactions")
      }

      const data = await response.json()
      setTransactions(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [bankAccountId])

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
  }
}
