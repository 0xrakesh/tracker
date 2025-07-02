"use client"

import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useVisibility } from "@/lib/visibility-context"
import { useBankAccountTransactions } from "@/hooks/use-bank-account-transactions"

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

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">{error}</div>
  }

  if (transactions.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No transactions found for this account.</div>
  }

  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[100px]">Date</TableHead>
              <TableHead className="min-w-[150px]">Description</TableHead>
              <TableHead className="min-w-[100px]">Category</TableHead>
              <TableHead className="text-right min-w-[100px]">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction._id?.toString()}>
                <TableCell className="font-medium whitespace-nowrap">
                  {format(new Date(transaction.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={transaction.description}>
                  {transaction.description}
                </TableCell>
                <TableCell className="whitespace-nowrap">{transaction.category}</TableCell>
                <TableCell className="text-right font-bold whitespace-nowrap">
                  {formatAmount(transaction.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="p-4 border-t bg-muted/50">
        <div className="text-sm text-muted-foreground">Showing {transactions.length} transactions</div>
      </div>
    </div>
  )
}
