"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "./data-table"
import { useBankAccountTransactions } from "@/hooks/use-bank-account-transactions"
import type { Expense } from "@/lib/models/expense"

interface BankAccountTransactionsListProps {
  bankAccountId: string
}

export function BankAccountTransactionsList({ bankAccountId }: BankAccountTransactionsListProps) {
  const { transactions, loading, error } = useBankAccountTransactions(bankAccountId)

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"))
        return <div>{date.toLocaleDateString()}</div>
      },
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        return <Badge variant="secondary">{row.getValue("category")}</Badge>
      },
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
        return <div className="font-medium text-red-600">-₹{formatted.slice(1)}</div>
      },
    },
  ]

  if (loading) {
    return <div className="text-center py-4">Loading transactions...</div>
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">Error: {error}</div>
  }

  return <DataTable columns={columns} data={transactions} searchKey="description" />
}
