"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Play } from "lucide-react"
import { DataTable } from "./data-table"
import { useRecurringTransactions } from "@/hooks/use-recurring-transactions"
import type { RecurringTransaction } from "@/lib/models/recurring-transaction"

export function RecurringTransactionList() {
  const { transactions, loading, deleteTransaction, processTransactions } = useRecurringTransactions()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this recurring transaction?")) {
      await deleteTransaction(id)
    }
  }

  const handleProcessAll = async () => {
    setProcessingId("all")
    try {
      const message = await processTransactions()
      if (message) {
        alert(message)
      }
    } finally {
      setProcessingId(null)
    }
  }

  const columns: ColumnDef<RecurringTransaction>[] = [
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("amount"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount)
        return <div className="font-medium">₹{formatted.slice(1)}</div>
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        return <Badge variant="secondary">{row.getValue("category")}</Badge>
      },
    },
    {
      accessorKey: "frequency",
      header: "Frequency",
      cell: ({ row }) => {
        const frequency = row.getValue("frequency") as string
        return <Badge variant="outline">{frequency.charAt(0).toUpperCase() + frequency.slice(1)}</Badge>
      },
    },
    {
      accessorKey: "nextOccurrenceDate",
      header: "Next Due",
      cell: ({ row }) => {
        const date = new Date(row.getValue("nextOccurrenceDate"))
        return <div>{date.toLocaleDateString()}</div>
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive")
        return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const transaction = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(transaction._id?.toString() || "")}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  if (loading) {
    return <div className="text-center py-8">Loading recurring transactions...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recurring Transactions</CardTitle>
            <CardDescription>Manage your recurring expenses and income</CardDescription>
          </div>
          <Button onClick={handleProcessAll} disabled={processingId === "all"}>
            <Play className="h-4 w-4 mr-2" />
            {processingId === "all" ? "Processing..." : "Process Due"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={transactions} searchKey="description" />
      </CardContent>
    </Card>
  )
}
