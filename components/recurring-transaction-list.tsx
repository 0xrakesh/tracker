"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useRecurringTransactions } from "@/hooks/use-recurring-transactions"
import { useVisibility } from "@/lib/visibility-context"
import { format, isPast, isToday } from "date-fns"

export function RecurringTransactionList() {
  const { recurringTransactions, loading, error, deleteRecurringTransaction, processDueTransactions } =
    useRecurringTransactions()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { showAmounts } = useVisibility()

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      await deleteRecurringTransaction(id)
    } finally {
      setIsDeleting(null)
    }
  }

  const handleProcessDue = async () => {
    setIsProcessing(true)
    try {
      const processedCount = await processDueTransactions()
      if (processedCount > 0) {
        // Optionally show a toast or message about processed transactions
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const formatAmount = (amount: number) => {
    return showAmounts ? `₹${amount.toFixed(2)}` : "₹****.**"
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground border rounded-lg bg-card">
        Loading recurring transactions...
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-8 text-destructive border rounded-lg bg-card">{error}</div>
  }

  if (recurringTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border rounded-lg bg-card">
        No recurring transactions added yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleProcessDue} disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Process Due Transactions"}
        </Button>
      </div>
      <div className="border rounded-lg bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Description</TableHead>
                <TableHead className="min-w-[100px]">Category</TableHead>
                <TableHead className="text-right min-w-[100px]">Amount</TableHead>
                <TableHead className="min-w-[80px]">Frequency</TableHead>
                <TableHead className="min-w-[120px]">Next Due</TableHead>
                <TableHead className="min-w-[150px]">Bank Account</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recurringTransactions.map((transaction) => {
                const isDue = isPast(transaction.nextOccurrenceDate) || isToday(transaction.nextOccurrenceDate)
                return (
                  <TableRow key={transaction._id?.toString()}>
                    <TableCell className="font-medium max-w-[200px] truncate" title={transaction.description}>
                      {transaction.description}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{transaction.category}</TableCell>
                    <TableCell className="text-right font-bold whitespace-nowrap">
                      {formatAmount(transaction.amount)}
                    </TableCell>
                    <TableCell className="capitalize whitespace-nowrap">
                      <Badge variant="secondary">{transaction.frequency}</Badge>
                    </TableCell>
                    <TableCell className={isDue ? "text-destructive font-medium" : "text-foreground"}>
                      {format(new Date(transaction.nextOccurrenceDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {transaction.bankAccountName || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transaction._id?.toString() || "")}
                        disabled={isDeleting === transaction._id?.toString()}
                        className="hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 border-t bg-muted/50">
          <div className="text-sm text-muted-foreground">
            Showing {recurringTransactions.length} recurring transactions
          </div>
        </div>
      </div>
    </div>
  )
}
