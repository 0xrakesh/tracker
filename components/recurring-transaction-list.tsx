"use client"

import { useState } from "react"
import { Trash2, Repeat, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRecurringTransactions } from "@/hooks/use-recurring-transactions"
import { useVisibility } from "@/lib/visibility-context"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { DataTable } from "./data-table"
import type { ColumnDef } from "@tanstack/react-table"
import type { RecurringTransaction } from "@/lib/models/recurring-transaction"

interface RecurringTransactionWithAccount extends RecurringTransaction {
  bankAccountName?: string
}

export function RecurringTransactionList() {
  const { recurringTransactions, loading, error, deleteRecurringTransaction, processRecurringTransactionsManually } =
    useRecurringTransactions()
  const { showAmounts } = useVisibility()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDelete = async (id: string) => {
    const success = await deleteRecurringTransaction(id)
    if (success) {
      toast({
        title: "Recurring Transaction Deleted",
        description: "The recurring transaction has been successfully deleted.",
      })
    } else {
      toast({
        title: "Failed to Delete",
        description: "There was an error deleting the recurring transaction.",
        variant: "destructive",
      })
    }
  }

  const handleProcessTransactions = async () => {
    setIsProcessing(true)
    const success = await processRecurringTransactionsManually()
    if (success) {
      toast({
        title: "Transactions Processed",
        description: "Due recurring transactions have been generated.",
      })
    } else {
      toast({
        title: "Processing Failed",
        description: "There was an error processing recurring transactions.",
        variant: "destructive",
      })
    }
    setIsProcessing(false)
  }

  const formatAmount = (amount: number) => {
    return showAmounts ? `₹${amount.toFixed(2)}` : "₹****.**"
  }

  const columns: ColumnDef<RecurringTransactionWithAccount>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("amount"))
        return <div className="text-right font-medium">{formatAmount(amount)}</div>
      },
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "frequency",
      header: "Frequency",
      cell: ({ row }) => <div className="capitalize">{row.getValue("frequency")}</div>,
    },
    {
      accessorKey: "nextOccurrenceDate",
      header: "Next Due",
      cell: ({ row }) => {
        const date = new Date(row.getValue("nextOccurrenceDate"))
        return (
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {format(date, "MMM d, yyyy")}
          </div>
        )
      },
    },
    {
      accessorKey: "bankAccountName",
      header: "Bank Account",
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const transaction = row.original

        return (
          <div className="flex justify-end gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Delete Recurring Transaction">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete transaction</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this recurring transaction.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(transaction._id?.toString() || "")}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
    },
  ]

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Recurring Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading recurring transactions...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Recurring Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive text-sm">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">Recurring Transactions</CardTitle>
          <CardDescription className="text-sm">Manage your automated expenses.</CardDescription>
        </div>
        <Button onClick={handleProcessTransactions} disabled={isProcessing} size="sm">
          <Repeat className="h-4 w-4 mr-2" />
          {isProcessing ? "Processing..." : "Process Now"}
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        {recurringTransactions.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>No recurring transactions set up yet.</p>
            <p className="text-sm mt-1">Add one to automate your expense tracking.</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={recurringTransactions}
            filterColumnId="name"
            filterPlaceholder="Filter by name..."
          />
        )}
      </CardContent>
    </Card>
  )
}
