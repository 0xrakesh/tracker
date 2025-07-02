"use client"

import { RecurringTransactionForm } from "@/components/recurring-transaction-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreateRecurringTransactionPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Recurring Transaction</CardTitle>
          <CardDescription>Set up an expense that occurs regularly.</CardDescription>
        </CardHeader>
        <CardContent>
          <RecurringTransactionForm />
        </CardContent>
      </Card>
    </div>
  )
}
