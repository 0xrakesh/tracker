"use client"

import { ExpenseStats } from "@/components/expense-stats"
import { ExpenseList } from "@/components/expense-list"
import { BudgetOverview } from "@/components/budget-overview"
import { LoanList } from "@/components/loan-list"
import { BankAccountList } from "@/components/bank-account-list"
import { SavingsGoalOverview } from "@/components/savings-goal-overview"
import { DateRangePicker } from "@/components/date-range-picker"
import { ExportButton } from "@/components/export-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your financial data</p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
          <ExportButton startDate={dateRange.from} endDate={dateRange.to} />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ExpenseStats startDate={dateRange.from} endDate={dateRange.to} />
          <div className="grid gap-6 lg:grid-cols-2">
            <BudgetOverview />
            <SavingsGoalOverview />
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <ExpenseStats startDate={dateRange.from} endDate={dateRange.to} />
          <ExpenseList startDate={dateRange.from} endDate={dateRange.to} />
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <BudgetOverview />
        </TabsContent>

        <TabsContent value="loans" className="space-y-6">
          <LoanList />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bank Accounts</CardTitle>
              <CardDescription>Manage your bank accounts and view transaction history</CardDescription>
            </CardHeader>
            <CardContent>
              <BankAccountList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="savings" className="space-y-6">
          <SavingsGoalOverview />
        </TabsContent>
      </Tabs>
    </div>
  )
}
