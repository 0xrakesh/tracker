"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useExpenses } from "@/hooks/use-expenses"
import { Header } from "@/components/header"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseList } from "@/components/expense-list"
import { ExpenseStats } from "@/components/expense-stats"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/toaster"

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const { expenses, loading, error, addExpense, deleteExpense } = useExpenses()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-retro-bg flex items-center justify-center">
        <div className="text-xl text-retro-text font-bold border-4 border-retro-border p-8 bg-retro-card shadow-retro">
          Loading...
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-retro-bg flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6 text-retro-text tracking-wide text-center font-retro">
          PERSONAL FINANCE TRACKER
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="expenses" className="border-4 border-retro-border rounded bg-retro-card shadow-retro">
              <TabsList className="bg-retro-header w-full grid grid-cols-2">
                <TabsTrigger
                  value="expenses"
                  className="data-[state=active]:bg-retro-button data-[state=active]:text-retro-button-text font-bold"
                >
                  EXPENSES
                </TabsTrigger>
                <TabsTrigger
                  value="add"
                  className="data-[state=active]:bg-retro-button data-[state=active]:text-retro-button-text font-bold"
                >
                  ADD EXPENSE
                </TabsTrigger>
              </TabsList>

              <div className="p-4">
                <TabsContent value="expenses">
                  {loading ? (
                    <div className="text-center py-8 text-retro-text">Loading expenses...</div>
                  ) : error ? (
                    <div className="text-center py-8 text-red-500">{error}</div>
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

          <div>
            <ExpenseStats />
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  )
}
