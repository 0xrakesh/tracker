"use client"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { DataTable } from "@/components/data-table"
import { useBankAccountTransactions } from "@/hooks/use-bank-account-transactions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Expense } from "@/lib/models/expense"

interface BankAccountTransactionsListProps {
  bankAccountId: string
  bankAccountName: string
}

export function BankAccountTransactionsList({ bankAccountId, bankAccountName }: BankAccountTransactionsListProps) {
  const { transactions, loading, error } = useBankAccountTransactions(bankAccountId)

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("date") as Date
        return format(new Date(date), "PPP")
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div className="font-medium">{row.getValue("description")}</div>,
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
        const formatted = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(amount)
        return <div className="text-right font-medium">{formatted}</div>
      },
    },
  ]

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-xl font-bold">Loading transactions...</div>
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
      <CardHeader>
        <CardTitle>Transactions for {bankAccountName}</CardTitle>
        <CardDescription>All expenses linked to this bank account.</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={transactions}
          filterColumnId="description"
          filterPlaceholder="Filter by description..."
        />
      </CardContent>
    </div>
  )
}
