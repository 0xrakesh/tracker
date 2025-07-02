"use client"

import { RecurringTransactionList } from "@/components/recurring-transaction-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function RecurringTransactionsPage() {
  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Recurring Transactions</h1>
          <p className="text-muted-foreground">Automate your expense tracking for regular payments.</p>
        </div>
        <Link href="/dashboard/recurring-transactions/create">
          <Button className="w-full sm:w-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Recurring Transaction
          </Button>
        </Link>
      </div>

      <RecurringTransactionList />
    </div>
  )
}
