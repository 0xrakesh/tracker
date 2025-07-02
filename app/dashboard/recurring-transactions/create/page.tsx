import { RecurringTransactionForm } from "@/components/recurring-transaction-form"

export default function CreateRecurringTransactionPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Add Recurring Transaction</h1>
        <p className="text-muted-foreground">Set up a transaction that repeats automatically</p>
      </div>
      <RecurringTransactionForm />
    </div>
  )
}
