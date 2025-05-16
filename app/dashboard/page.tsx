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
import { DateRangePicker } from "@/components/date-range-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/toaster"

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const [startDate, setStartDate] = useState(startOfMonth(new Date()))
  const [endDate, setEndDate] = useState(endOfMonth(new Date()))
  const { expenses, loading, error, addExpense, deleteExpense } = useExpenses(startDate, endDate)
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
      <div className="min-h-screen bg-retro-light flex items-center justify-center">
        <div className="text-xl text-retro-dark font-bold border-4 border-retro-dark p-8 bg-white shadow-retro">
          Loading...
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-retro-light flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6 text-retro-dark tracking-wide text-center font-retro">
          PERSONAL FINANCE TRACKER
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="expenses" className="border-4 border-retro-dark rounded bg-white shadow-retro">
              <TabsList className="bg-retro-deep w-full grid grid-cols-2">
                <TabsTrigger
                  value="expenses"
                  className="data-[state=active]:bg-retro-medium data-[state=active]:text-white font-bold"
                >
                  EXPENSES
                </TabsTrigger>
                <TabsTrigger
                  value="add"
                  className="data-[state=active]:bg-retro-medium data-[state=active]:text-white font-bold"
                >
                  ADD EXPENSE
                </TabsTrigger>
              </TabsList>

              <div className="p-4">
                <TabsContent value="expenses">
                  <div className="mb-4">
                    <DateRangePicker startDate={startDate} endDate={endDate} onDateChange={handleDateChange} />
                  </div>
                  {loading ? (
                    <div className="text-center py-8 text-retro-dark">Loading expenses...</div>
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
