"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { subMonths } from "date-fns"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { ExpenseInsights } from "@/components/expense-insights"
import { ExportButton } from "@/components/export-button"
import { exportStatisticsToPDF } from "@/lib/pdf-export"
import { useExpenseStats } from "@/hooks/use-stats"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function InsightsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Get last 6 months data for export
  const [startDate] = useState(() => subMonths(new Date(), 6))
  const [endDate] = useState(() => new Date())
  const { stats } = useExpenseStats(startDate, endDate)

  const handleExport = async (format: "pdf") => {
    if (format === "pdf" && user && stats) {
      exportStatisticsToPDF(stats, startDate, endDate, user.username)
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="text-center">
            <div className="text-xl font-bold">Loading...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Financial Insights</h1>
            <p className="text-muted-foreground">Detailed analysis of your spending patterns and trends</p>
          </div>
          <ExportButton onExport={handleExport} disabled={!stats || stats.total === 0} variant="default" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expense Analytics</CardTitle>
            <CardDescription>Visual overview of your spending patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseInsights />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
