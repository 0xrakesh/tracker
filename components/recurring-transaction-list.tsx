"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Trash2, Repeat } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { useRecurringTransactions } from "@/hooks/use-recurring-transactions"
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
import { Card, CardContent } from "@/components/ui/card"

interface RecurringTransactionWithAccount {
  _id: string
  name: string
  amount: number
  category: string
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  startDate: Date
  nextOccurrenceDate: Date
  bankAccountId?: string
  bankAccountName?: string
  notes?: string
  createdAt: Date
}

export function RecurringTransactionList() {
  const { recurringTransactions, loading, error, deleteRecurringTransaction, processDueTransactions } =
    useRecurringTransactions()
  const [isProcessing, setIsProcessing] = React.useState(false)

  const handleDelete = async (id: string) => {
    const success = await deleteRecurringTransaction(id)
    if (success) {
      toast({
        title: "Transaction Deleted",
        description: "Recurring transaction has been successfully deleted.",
      })
    } else {
      toast({
        title: "Failed to Delete",
        description: "There was an error deleting the recurring transaction.",
        variant: "destructive",
      })
    }
  }

  const handleProcessDue = async () => {
    setIsProcessing(true)
    try {
      const processedCount = await processDueTransactions()
      if (processedCount > 0) {
        toast({
          title: "Transactions Processed",
          description: `Successfully processed ${processedCount} due recurring transactions.`,
        })
      } else {
        toast({
          title: "No Due Transactions",
          description: "No recurring transactions were due for processing.",
        })
      }
    } catch (err) {
      toast({
        title: "Processing Failed",
        description: "An error occurred while processing recurring transactions.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
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
        const formatted = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(amount)
        return <div className="text-right font-medium">{formatted}</div>
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
        const date = row.getValue("nextOccurrenceDate") as Date
        return format(new Date(date), "PPP")
      },
    },
    {
      accessorKey: "bankAccountName",
      header: "Bank Account",
      cell: ({ row }) => <div>{row.getValue("bankAccountName") || "N/A"}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const transaction = row.original

        return (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete transaction</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your recurring transaction.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(transaction._id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )
      },
    },
  ]

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-xl font-bold">Loading recurring transactions...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-red-500">
          <div className="text-xl font-bold">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleProcessDue} disabled={isProcessing} className="w-full md:w-auto">
        <Repeat className="h-4 w-4 mr-2" />
        {isProcessing ? "Processing..." : "Process Due Transactions"}
      </Button>
      <DataTable
        columns={columns}
        data={recurringTransactions}
        filterColumnId="name"
        filterPlaceholder="Filter by name..."
      />
    </div>
  )
}
