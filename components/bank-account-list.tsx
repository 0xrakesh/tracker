"use client"
import type { ColumnDef } from "@tanstack/react-table"
import { Trash2, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { useBankAccounts } from "@/hooks/use-bank-accounts"
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
import type { BankAccount } from "@/lib/models/bank-account"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BankAccountTransactionsList } from "./bank-account-transactions-list"

export function BankAccountList() {
  const { bankAccounts, loading, error, deleteBankAccount } = useBankAccounts()

  const handleDelete = async (id: string) => {
    const success = await deleteBankAccount(id)
    if (success) {
      toast({
        title: "Bank Account Deleted",
        description: "Bank account has been successfully deleted.",
      })
    } else {
      toast({
        title: "Failed to Delete",
        description: "There was an error deleting the bank account.",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<BankAccount>[] = [
    {
      accessorKey: "bankName",
      header: "Bank Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("bankName")}</div>,
    },
    {
      accessorKey: "accountName",
      header: "Account Name",
    },
    {
      accessorKey: "currentBalance",
      header: () => <div className="text-right">Current Balance</div>,
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("currentBalance"))
        const formatted = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(amount)
        return <div className="text-right font-medium">{formatted}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const account = row.original

        return (
          <div className="flex justify-end gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="View Transactions">
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View Transactions</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    Transactions for {account.bankName} ({account.accountName})
                  </DialogTitle>
                  <DialogDescription>A list of all expenses associated with this bank account.</DialogDescription>
                </DialogHeader>
                <BankAccountTransactionsList
                  bankAccountId={account._id?.toString() || ""}
                  bankAccountName={`${account.bankName} (${account.accountName})`}
                />
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Delete Account">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete account</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your bank account and all associated
                    expenses will no longer be linked to it.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(account._id?.toString() || "")}>
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
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-xl font-bold">Loading bank accounts...</div>
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
    <DataTable
      columns={columns}
      data={bankAccounts}
      filterColumnId="bankName"
      filterPlaceholder="Filter by bank name..."
    />
  )
}
