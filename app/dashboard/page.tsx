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
        <div className="text-xl font-bold border p-8 bg-card shadow-lg rounded-lg animate-fade-in">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto py-6 px-4">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2 tracking-wide">Personal Finance Tracker</h1>
          <p className="text-muted-foreground">Manage your expenses, budgets, and financial insights</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Expense Insights */}
            <div className="animate-fade-in">
              <ExpenseInsights />
            </div>

            {/* Expenses Management */}
            <div className="animate-slide-in">
              <Tabs defaultValue="expenses" className="border rounded-lg bg-card shadow-sm">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="expenses">Expenses</TabsTrigger>
                  <TabsTrigger value="add">Add Expense</TabsTrigger>
                </TabsList>

                <div className="p-6">
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
                </div>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="animate-fade-in">
              <ExpenseStats />
            </div>

            {/* Budget Management */}
            <div className="animate-slide-in">
              <Tabs defaultValue="overview" className="border rounded-lg bg-card shadow-sm">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Budgets</TabsTrigger>
                  <TabsTrigger value="create">Create</TabsTrigger>
                </TabsList>

                <div className="p-4">
                  <TabsContent value="overview">
                    <BudgetOverview />
                  </TabsContent>

                  <TabsContent value="create">
                    <BudgetForm onSubmit={addBudget} />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  )
}
