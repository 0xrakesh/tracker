"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { BudgetForm } from "@/components/budget-form"
import { useBudgets } from "@/hooks/use-budgets"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreateBudgetPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { addBudget } = useBudgets() // Get addBudget from hook
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create New Budget</h1>
          <p className="text-muted-foreground">Set spending limits for different categories to manage your finances.</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Budget Details</CardTitle>
            <CardDescription>Define your budget amount, category, and period.</CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetForm onSubmit={addBudget} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
