"use client"

import { useState } from "react"
import { Trash2, Banknote, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useBankAccounts } from "@/hooks/use-bank-accounts"
import { useVisibility } from "@/lib/visibility-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { BankAccountTransactionsList } from "./bank-account-transactions-list"

export function BankAccountList() {
  const { bankAccounts, loading, error, deleteBankAccount } = useBankAccounts()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const { showAmounts } = useVisibility()
  const [isTransactionsDialogOpen, setIsTransactionsDialogOpen] = useState(false)
  const [selectedAccountForTransactions, setSelectedAccountForTransactions] = useState<{
    id: string
    name: string
  } | null>(null)

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      await deleteBankAccount(id)
    } finally {
      setIsDeleting(null)
    }
  }

  const handleOpenTransactionsDialog = (accountId: string | undefined, accountName: string) => {
    if (accountId) {
      setSelectedAccountForTransactions({ id: accountId, name: accountName })
      setIsTransactionsDialogOpen(true)
    }
  }

  const handleCloseTransactionsDialog = () => {
    setIsTransactionsDialogOpen(false)
    setSelectedAccountForTransactions(null)
  }

  const formatAmount = (amount: number) => {
    return showAmounts ? `₹${amount.toFixed(2)}` : "₹****.**"
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Bank Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading bank accounts...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Bank Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive text-sm">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Bank Accounts</CardTitle>
        <CardDescription className="text-sm">Your linked bank accounts and their balances.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {bankAccounts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>No bank accounts added yet.</p>
            <p className="text-sm mt-1">Add an account to track your funds.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bankAccounts.map((account) => (
              <div
                key={account._id?.toString()}
                className="flex items-center justify-between border rounded-lg p-3 bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Banknote className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">{account.bankName}</h4>
                    <p className="text-sm text-muted-foreground">{account.accountName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleOpenTransactionsDialog(
                        account._id?.toString(),
                        `${account.bankName} (${account.accountName})`,
                      )
                    }
                    className="h-8 w-8 text-muted-foreground hover:text-primary shrink-0"
                    title="View Transactions"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View Transactions</span>
                  </Button>
                  <span className="font-bold text-lg text-primary whitespace-nowrap">
                    {formatAmount(account.currentBalance)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(account._id?.toString() || "")}
                    disabled={isDeleting === account._id?.toString()}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete account</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {selectedAccountForTransactions && (
        <Dialog open={isTransactionsDialogOpen} onOpenChange={handleCloseTransactionsDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Transactions for {selectedAccountForTransactions.name}</DialogTitle>
              <DialogDescription>All recorded expenses linked to this account.</DialogDescription>
            </DialogHeader>
            <BankAccountTransactionsList
              bankAccountId={selectedAccountForTransactions.id}
              bankAccountName={selectedAccountForTransactions.name}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}
