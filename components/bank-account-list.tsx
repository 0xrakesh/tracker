"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Eye, Trash2 } from "lucide-react"
import { useBankAccounts } from "@/hooks/use-bank-accounts"
import { useVisibility } from "@/lib/visibility-context"
import { BankAccountTransactionsList } from "./bank-account-transactions-list"

export function BankAccountList() {
  const { bankAccounts, loading, deleteBankAccount } = useBankAccounts()
  const { showAmounts } = useVisibility()
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this bank account?")) {
      await deleteBankAccount(id)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading bank accounts...</div>
  }

  if (bankAccounts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No bank accounts found. Add your first bank account to get started.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {bankAccounts.map((account) => (
        <Card key={account._id?.toString()}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{account.bankName}</CardTitle>
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAccountId(account._id?.toString() || "")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>
                        {account.bankName} - {account.accountName} Transactions
                      </DialogTitle>
                      <DialogDescription>View all transactions for this bank account</DialogDescription>
                    </DialogHeader>
                    {selectedAccountId && <BankAccountTransactionsList bankAccountId={selectedAccountId} />}
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(account._id?.toString() || "")}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>{account.accountName}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Balance</span>
                <Badge variant={account.currentBalance >= 0 ? "default" : "destructive"}>
                  {showAmounts ? `₹${account.currentBalance.toFixed(2)}` : "••••••"}
                </Badge>
              </div>
              {account.accountNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account Number</span>
                  <span className="text-sm font-mono">{showAmounts ? account.accountNumber : "••••••••"}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
