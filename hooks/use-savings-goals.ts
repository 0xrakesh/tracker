"use client"

import { useState, useEffect, useCallback } from "react"
import type { SavingsGoal } from "@/lib/models/savings-goal"
import type { BankAccount } from "@/lib/models/bank-account"

interface SavingsGoalWithStatus extends SavingsGoal {
  bankAccountName: string
  bankAccountCurrentBalance: number
  progressPercentage: number
  amountNeeded: number
  isNearTarget: boolean
  isAchieved: boolean
}

export function useSavingsGoals() {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoalWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSavingsGoals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [goalsResponse, accountsResponse] = await Promise.all([
        fetch("/api/savings-goals"),
        fetch("/api/bank-accounts"),
      ])

      if (!goalsResponse.ok || !accountsResponse.ok) {
        throw new Error("Failed to fetch savings goals or bank accounts")
      }

      const goalsData: SavingsGoal[] = await goalsResponse.json()
      const accountsData: BankAccount[] = await accountsResponse.json()

      const goalsWithStatus = goalsData.map((goal) => {
        const linkedAccount = accountsData.find((acc) => acc._id?.toString() === goal.bankAccountId.toString())

        const currentBalance = linkedAccount?.currentBalance || 0
        const progressPercentage = goal.targetAmount > 0 ? (currentBalance / goal.targetAmount) * 100 : 0
        const amountNeeded = Math.max(0, goal.targetAmount - currentBalance)
        const isAchieved = currentBalance >= goal.targetAmount
        const isNearTarget = !isAchieved && currentBalance >= goal.targetAmount * 0.9 // 90% threshold

        return {
          ...goal,
          bankAccountName: linkedAccount
            ? `${linkedAccount.bankName} (${linkedAccount.accountName})`
            : "Account Not Found",
          bankAccountCurrentBalance: currentBalance,
          progressPercentage,
          amountNeeded,
          isNearTarget,
          isAchieved,
        }
      })
      setSavingsGoals(goalsWithStatus)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  const addSavingsGoal = async (goal: Omit<SavingsGoal, "_id" | "userId" | "createdAt">) => {
    try {
      const response = await fetch("/api/savings-goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goal),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add savings goal")
      }

      await fetchSavingsGoals()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    }
  }

  const deleteSavingsGoal = async (id: string) => {
    try {
      const response = await fetch(`/api/savings-goals/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete savings goal")
      }

      await fetchSavingsGoals()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    }
  }

  useEffect(() => {
    fetchSavingsGoals()
  }, [fetchSavingsGoals])

  return {
    savingsGoals,
    loading,
    error,
    fetchSavingsGoals,
    addSavingsGoal,
    deleteSavingsGoal,
  }
}
