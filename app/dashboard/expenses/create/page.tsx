"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { ExpenseForm } from "@/components/expense-form"
import { useExpenses } from "@/hooks/use-expenses"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AddExpensePage() {
  const { user, isLoading: authLoading } = useAuth()
  const { addExpense } = useExpenses() // Get addExpense from hook
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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Add New Expense</h1>
          <p className="text-muted-foreground">Record your spending to keep track of your finances.</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Expense Details</CardTitle>
            <CardDescription>Fill in the details of your expense below.</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseForm onSubmit={addExpense} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
