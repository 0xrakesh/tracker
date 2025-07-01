"use client"

import { useState } from "react"
import { Trash2, Wallet, CheckCircle, AlertTriangle, CalendarDays } from "lucide-react" // Add CalendarDays
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { LoanPaymentDialog } from "./loan-payment-dialog"
import type { Loan } from "@/lib/models/loan"
import type { ObjectId } from "mongodb"
import { format, isPast, isToday } from "date-fns" // Import format, isPast, isToday
import { useVisibility } from "@/lib/visibility-context" // Import useVisibility

interface LoanWithPayments extends Loan {
  payments: any[] // Simplified for display, actual type is LoanPayment[]
  totalPaid: number
  currentPrincipalBalance: number // Actual remaining principal
  totalInterestPaidActual: number // Actual interest paid based on recorded payments
  nextDueDate: Date | null
  nextPaymentAmount: number | null
  nextPaymentPrincipal: number | null
  nextPaymentInterest: number | null
}

interface LoanListProps {
  loans: LoanWithPayments[]
  onDelete: (id: string) => Promise<boolean>
  onAddPayment: (loanId: string, amount: number, paymentDate: Date) => Promise<boolean>
}

export function LoanList({ loans, onDelete, onAddPayment }: LoanListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<{ id: string; name: string } | null>(null)
  const { showAmounts } = useVisibility() // Use the visibility hook

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      await onDelete(id)
    } finally {
      setIsDeleting(null)
    }
  }

  const handleOpenPaymentDialog = (loanId: ObjectId | undefined, loanName: string) => {
    if (loanId) {
      setSelectedLoanForPayment({ id: loanId.toString(), name: loanName })
      setIsPaymentDialogOpen(true)
    }
  }

  const handleClosePaymentDialog = () => {
    setIsPaymentDialogOpen(false)
    setSelectedLoanForPayment(null)
  }

  const formatAmount = (amount: number) => {
    return showAmounts ? `₹${amount.toFixed(2)}` : "₹****.**"
  }

  if (loans.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border rounded-lg bg-card">
        No loans added yet. Add your first loan to get started!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Loan Name</TableHead>
                <TableHead className="min-w-[100px] text-right">Principal</TableHead>
                <TableHead className="min-w-[100px] text-right">Paid</TableHead>
                <TableHead className="min-w-[100px] text-right">Remaining</TableHead>
                <TableHead className="min-w-[120px]">Progress</TableHead>
                <TableHead className="min-w-[100px] text-right">Monthly EMI</TableHead>
                <TableHead className="min-w-[120px]">Next Due Date</TableHead>
                <TableHead className="min-w-[150px]">Next Payment (P/I)</TableHead>
                <TableHead className="min-w-[120px] text-right">Total Interest Paid</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan) => {
                const progressPercentage = (loan.totalPaid / loan.principalAmount) * 100
                const isCompleted = loan.currentPrincipalBalance <= 0.01 // Account for floating point
                const isOverdue =
                  loan.nextDueDate && isPast(loan.nextDueDate) && !isToday(loan.nextDueDate) && !isCompleted

                return (
                  <TableRow key={loan._id?.toString()}>
                    <TableCell className="font-medium whitespace-nowrap">{loan.loanName}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{formatAmount(loan.principalAmount)}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{formatAmount(loan.totalPaid)}</TableCell>
                    <TableCell className="text-right font-bold whitespace-nowrap">
                      {formatAmount(loan.currentPrincipalBalance)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={progressPercentage} className="h-2" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {progressPercentage.toFixed(1)}%
                        </span>
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-success" title="Loan Paid Off" />
                        ) : (
                          loan.totalPaid > loan.principalAmount && (
                            <AlertTriangle className="h-4 w-4 text-warning" title="Overpaid" />
                          )
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">{formatAmount(loan.monthlyPayment)}</TableCell>
                    <TableCell className={isOverdue ? "text-destructive font-medium" : "text-foreground"}>
                      {isCompleted ? (
                        <span className="text-success">Paid Off</span>
                      ) : loan.nextDueDate ? (
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {format(loan.nextDueDate, "MMM d, yyyy")}
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {isCompleted ? (
                        <span className="text-success">N/A</span>
                      ) : loan.nextPaymentAmount !== null ? (
                        <div className="flex flex-col text-xs">
                          <span className="font-medium">{formatAmount(loan.nextPaymentAmount)}</span>
                          <span className="text-muted-foreground">
                            (P: {formatAmount(loan.nextPaymentPrincipal || 0)} / I:{" "}
                            {formatAmount(loan.nextPaymentInterest || 0)})
                          </span>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {formatAmount(loan.totalInterestPaidActual)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenPaymentDialog(loan._id, loan.loanName)}
                          disabled={isCompleted}
                          className="hover:bg-primary/10 hover:text-primary"
                          title="Record Payment"
                        >
                          <Wallet className="h-4 w-4" />
                          <span className="sr-only">Record Payment</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(loan._id?.toString() || "")}
                          disabled={isDeleting === loan._id?.toString()}
                          className="hover:bg-destructive hover:text-destructive-foreground"
                          title="Delete Loan"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 border-t bg-muted/50">
          <div className="text-sm text-muted-foreground">Showing {loans.length} loans</div>
        </div>
      </div>

      {selectedLoanForPayment && (
        <LoanPaymentDialog
          isOpen={isPaymentDialogOpen}
          onClose={handleClosePaymentDialog}
          loanId={selectedLoanForPayment.id}
          loanName={selectedLoanForPayment.name}
          onAddPayment={onAddPayment}
        />
      )}
    </div>
  )
}
