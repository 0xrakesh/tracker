"use client"

import { useState, useEffect, useCallback } from "react"
import type { BankAccount } from "@/lib/models/bank-account"

export function useBankAccounts() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBankAccounts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/bank-accounts")
      if (!response.ok) {
        throw new Error("Failed to fetch bank accounts")
      }
      const data = await response.json()
      setBankAccounts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  const addBankAccount = async (
    bankAccount: Omit<BankAccount, "_id" | "userId" | "createdAt" | "currentBalance"> & { initialBalance: number },
  ) => {
    try {
      const response = await fetch("/api/bank-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bankAccount),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add bank account")
      }

      await fetchBankAccounts()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    }
  }

  const deleteBankAccount = async (id: string) => {
    try {
      const response = await fetch(`/api/bank-accounts/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete bank account")
      }

      await fetchBankAccounts()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    }
  }

  useEffect(() => {
    fetchBankAccounts()
  }, [fetchBankAccounts])

  return {
    bankAccounts,
    loading,
    error,
    fetchBankAccounts,
    addBankAccount,
    deleteBankAccount,
  }
}
