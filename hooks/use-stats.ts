"use client"

import { useState, useEffect } from "react"

interface CategoryStat {
  category: string
  total: number
}

interface MonthStat {
  year: number
  month: number
  total: number
}

interface ExpenseStats {
  total: number
  byCategory: CategoryStat[]
  byMonth: MonthStat[]
}

export function useExpenseStats(startDate?: Date, endDate?: Date) {
  const [stats, setStats] = useState<ExpenseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)

    try {
      let url = "/api/stats"
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
  }, [startDate, endDate])

  return {
    stats,
    loading,
    error,
    fetchStats,
  }
}
