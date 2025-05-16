"use client"

import { useState, useEffect } from "react"
import type { Expense } from "@/lib/models/expense"

export function useExpenses(startDate?: Date, endDate?: Date) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = async () => {
    setLoading(true)
    setError(null)

    try {
      let url = "/api/expenses"
      const params = new URLSearchParams()

      if (startDate) {
        params.append("startDate", startDate.toISOString())
      }

      if (endDate) {
        params.append("endDate", endDate.toISOString())
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch expenses")
      }

      const data = await response.json()
      setExpenses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const addExpense = async (expense: Omit<Expense, "_id" | "userId" | "createdAt">) => {
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expense),
      })

      if (!response.ok) {
        throw new Error("Failed to add expense")
      }

      await fetchExpenses()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete expense")
      }

      await fetchExpenses()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [startDate, endDate])

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    addExpense,
    deleteExpense,
  }
}
