"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { startOfMonth, endOfMonth } from "date-fns"
import { useAuth } from "@/lib/auth-context"
import { useExpenses } from "@/hooks/use-expenses"
import { Header } from "@/components/header"
import { ExpenseList } from "@/components/expense-list"
import { ExpenseStats } from "@/components/expense-stats"
import { DateRangePicker } from "@/components/date-range-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import { useLoans } from "@/hooks/use-loans"
import { LoanList } from "@/components/loan-list"
import Link from "next/link"
import { BarChart3 } from "lucide-react"
import { BudgetOverview } from "@/components/budget-overview" // Re-add BudgetOverview for viewing

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const [startDate, setStartDate] = useState(startOfMonth(new Date()))
  const [endDate, setEndDate] = useState(endOfMonth(new Date()))
  const { expenses, loading, error, deleteExpense } = useExpenses(startDate, endDate) // Removed addExpense
  const { loans, loading: loansLoading, error: loansError, deleteLoan, addLoanPayment } = useLoans() // Removed addLoan
  const router = useRouter()

  const handleDateChange = (newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
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
            <h1 className="text-3xl font-bold tracking-tight">Personal Finance Overview</h1>
            <p className="text-muted-foreground">Your current financial snapshot</p>
          </div>
          <Link href="/insights">
            <Button className="w-full sm:w-auto">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Insights
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content - Expenses and Loans */}
          <div className="lg:col-span-8 space-y-6">
            {/* Expenses List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Your latest spending records</CardDescription>
              </CardHeader>
              <CardContent>
                <DateRangePicker startDate={startDate} endDate={endDate} onDateChange={handleDateChange} />
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading expenses...</div>
                ) : error ? (
                  <div className="text-center py-8 text-destructive">{error}</div>
                ) : (
                  <ExpenseList expenses={expenses} onDelete={deleteExpense} startDate={startDate} endDate={endDate} />
                )}
              </CardContent>
            </Card>

            {/* Loan List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Loans</CardTitle>
                <CardDescription>Overview of your active loans and payments</CardDescription>
              </CardHeader>
              <CardContent>
                {loansLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading loans...</div>
                ) : loansError ? (
                  <div className="text-center py-8 text-destructive">{loansError}</div>
                ) : (
                  <LoanList loans={loans} onDelete={deleteLoan} onAddPayment={addLoanPayment} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Stats and Budgets */}
          <div className="lg:col-span-4 space-y-6 min-w-0">
            {/* Stats */}
            <div className="w-full">
              <ExpenseStats />
            </div>

            {/* Budget Overview */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg">Budget Overview</CardTitle>
                <CardDescription className="text-sm">Set and track your spending limits</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <BudgetOverview /> {/* Now directly showing the overview */}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  )
}
