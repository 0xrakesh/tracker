"use client"

import { format } from "date-fns"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table"
import { useBankAccountTransactions } from "@/hooks/use-bank-account-transactions"
import { useVisibility } from "@/lib/visibility-context"
import { Card, CardContent } from "@/components/ui/card"
import type { Expense } from "@/lib/models/expense"

interface BankAccountTransactionsListProps {
  bankAccountId: string
  bankAccountName: string
}

export function BankAccountTransactionsList({ bankAccountId, bankAccountName }: BankAccountTransactionsListProps) {
  const { transactions, loading, error } = useBankAccountTransactions(bankAccountId)
  const { showAmounts } = useVisibility()

  const formatAmount = (amount: number) => {
    return showAmounts ? `₹${amount.toFixed(2)}` : "₹****.**"
  }

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"))
        return format(date, "MMM d, yyyy")
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div className="font-medium">{row.getValue("description") || "N/A"}</div>,
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("amount"))
        return <div className="text-right font-medium">{formatAmount(amount)}</div>
      },
    },
  ]

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 text-center">
          <div className="text-xl font-bold">Loading transactions...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 text-center text-red-500">
          <div className="text-xl font-bold">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>No transactions found for this account.</p>
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={transactions}
      filterColumnId="description"
      filterPlaceholder="Filter by description..."
    />
  )
}
