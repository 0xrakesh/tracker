"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { startOfMonth, endOfMonth } from "date-fns"
import { useAuth } from "@/lib/auth-context"
import { useExpenses } from "@/hooks/use-expenses"
import { Header } from "@/components/header"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseList } from "@/components/expense-list"
import { ExpenseStats } from "@/components/expense-stats"
import { BudgetForm } from "@/components/budget-form"
import { BudgetOverview } from "@/components/budget-overview"
import { ExpenseInsights } from "@/components/expense-insights"
import { DateRangePicker } from "@/components/date-range-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"
import { useBudgets } from "@/hooks/use-budgets"

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const [startDate, setStartDate] = useState(startOfMonth(new Date()))
  const [endDate, setEndDate] = useState(endOfMonth(new Date()))
  const { expenses, loading, error, addExpense, deleteExpense } = useExpenses(startDate, endDate)
  const { addBudget } = useBudgets()
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
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Personal Finance Tracker</h1>
          <p className="text-muted-foreground">Manage your expenses, budgets, and financial insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Expense Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Insights</CardTitle>
                <CardDescription>Visual overview of your spending patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseInsights />
              </CardContent>
            </Card>

            {/* Expenses Management */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Management</CardTitle>
                <CardDescription>Track and manage your daily expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="expenses" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="expenses">View Expenses</TabsTrigger>
                    <TabsTrigger value="add">Add Expense</TabsTrigger>
                  </TabsList>

                  <TabsContent value="expenses" className="space-y-4">
                    <DateRangePicker startDate={startDate} endDate={endDate} onDateChange={handleDateChange} />
                    {loading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading expenses...</div>
                    ) : error ? (
                      <div className="text-center py-8 text-destructive">{error}</div>
                    ) : (
                      <ExpenseList expenses={expenses} onDelete={deleteExpense} />
                    )}
                  </TabsContent>

                  <TabsContent value="add">
                    <ExpenseForm onSubmit={addExpense} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <ExpenseStats />

            {/* Budget Management */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Management</CardTitle>
                <CardDescription>Set and track your spending limits</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Budgets</TabsTrigger>
                    <TabsTrigger value="create">Create</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <BudgetOverview />
                  </TabsContent>

                  <TabsContent value="create">
                    <BudgetForm onSubmit={addBudget} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  )
}
