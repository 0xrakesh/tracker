import { RecurringTransactionList } from "@/components/recurring-transaction-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function RecurringTransactionsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recurring Transactions</h1>
          <p className="text-muted-foreground">Manage your recurring expenses and income</p>
        </div>
        <Link href="/dashboard/recurring-transactions/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Recurring Transaction
          </Button>
        </Link>
      </div>
      <RecurringTransactionList />
    </div>
  )
}
