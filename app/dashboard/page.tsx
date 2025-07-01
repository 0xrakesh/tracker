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
import { DateRangePicker } from "@/components/date-range-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import { useBudgets } from "@/hooks/use-budgets"
import Link from "next/link"
import { BarChart3 } from "lucide-react"

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Personal Finance Tracker</h1>
            <p className="text-muted-foreground">Manage your expenses and budgets effectively</p>
          </div>
          <Link href="/insights">
            <Button className="w-full sm:w-auto">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Insights
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
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
          <div className="lg:col-span-4 space-y-6 min-w-0">
            {/* Stats */}
            <div className="w-full">
              <ExpenseStats />
            </div>

            {/* Budget Management */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg">Budget Management</CardTitle>
                <CardDescription className="text-sm">Set and track your spending limits</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview" className="text-xs">
                      Budgets
                    </TabsTrigger>
                    <TabsTrigger value="create" className="text-xs">
                      Create
                    </TabsTrigger>
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
