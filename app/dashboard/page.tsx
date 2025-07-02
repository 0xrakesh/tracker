"use client"

import { useEffect, useState } from "react"
import { ExpenseList } from "@/components/expense-list"
import { ExpenseStats } from "@/components/expense-stats"
import { BudgetOverview } from "@/components/budget-overview"
import { LoanList } from "@/components/loan-list"
import { BankAccountList } from "@/components/bank-account-list"
import { DateRangePicker } from "@/components/date-range-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.username}!</p>
        </div>
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      <div className="grid gap-6">
        <ExpenseStats dateRange={dateRange} />

        <Tabs defaultValue="expenses" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
            <TabsTrigger value="accounts">Bank Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-4">
            <ExpenseList dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="budgets" className="space-y-4">
            <BudgetOverview />
          </TabsContent>

          <TabsContent value="loans" className="space-y-4">
            <LoanList />
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            <BankAccountList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
