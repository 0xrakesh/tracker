"use client"

import { useState, useEffect } from "react"

interface CategoryStat {
  category: string
  total: number
}

interface ExpenseStats {
  total: number
  byCategory: CategoryStat[]
}

export function useExpenseStats() {
  const [stats, setStats] = useState<ExpenseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/stats")

      if (!response.ok) {
        throw new Error("Failed to fetch expense stats")
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    fetchStats,
  }
}
