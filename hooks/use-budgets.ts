"use client"

import { useState, useEffect } from "react"
import type { Budget, BudgetStatus } from "@/lib/models/budget"

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBudgets = async () => {
    setLoading(true)
    setError(null)

    try {
      const [budgetsResponse, statusResponse] = await Promise.all([fetch("/api/budgets"), fetch("/api/budgets/status")])

      if (!budgetsResponse.ok || !statusResponse.ok) {
        throw new Error("Failed to fetch budgets")
      }

      const budgetsData = await budgetsResponse.json()
      const statusData = await statusResponse.json()

      setBudgets(budgetsData)
      setBudgetStatus(statusData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const addBudget = async (budget: Omit<Budget, "_id" | "userId" | "createdAt">) => {
    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(budget),
      })

      if (!response.ok) {
        throw new Error("Failed to add budget")
      }

      await fetchBudgets()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    }
  }

  const deleteBudget = async (id: string) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete budget")
      }

      await fetchBudgets()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [])

  return {
    budgets,
    budgetStatus,
    loading,
    error,
    fetchBudgets,
    addBudget,
    deleteBudget,
  }
}
