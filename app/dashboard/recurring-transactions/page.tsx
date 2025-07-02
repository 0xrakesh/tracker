"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecurringTransactionForm } from "@/components/recurring-transaction-form"
import { RecurringTransactionList } from "@/components/recurring-transaction-list"
import { useRecurringTransactions } from "@/hooks/use-recurring-transactions"

export default function RecurringTransactionsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { addRecurringTransaction } = useRecurringTransactions()
  const router = useRouter()

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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Recurring Transactions</h1>
          <p className="text-muted-foreground">Manage your regular income and expenses.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Add New Recurring Transaction</CardTitle>
              <CardDescription>Set up an expense that occurs regularly.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecurringTransactionForm onSubmit={addRecurringTransaction} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Your Recurring Transactions</CardTitle>
              <CardDescription>Overview of all your scheduled transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecurringTransactionList />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
