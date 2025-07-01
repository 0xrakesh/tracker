"use client"

import { useState, useEffect, useCallback } from "react"
import type { Loan, LoanPayment } from "@/lib/models/loan"
import { addMonths } from "date-fns" // Import date-fns utilities

interface LoanWithPayments extends Loan {
  payments: LoanPayment[]
  totalPaid: number
  currentPrincipalBalance: number // Actual remaining principal
  totalInterestPaidActual: number // Actual interest paid based on recorded payments
  nextDueDate: Date | null
  nextPaymentAmount: number | null
  nextPaymentPrincipal: number | null
  nextPaymentInterest: number | null
}

export function useLoans() {
  const [loans, setLoans] = useState<LoanWithPayments[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLoans = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/loans")
      if (!response.ok) {
        throw new Error("Failed to fetch loans")
      }
      const loansData: Loan[] = await response.json()

      const loansWithDetails = await Promise.all(
        loansData.map(async (loan) => {
          const paymentsResponse = await fetch(`/api/loans/payments?loanId=${loan._id}`)
          if (!paymentsResponse.ok) {
            console.warn(`Failed to fetch payments for loan ${loan._id}. Skipping payments for this loan.`)
            return {
              ...loan,
              payments: [],
              totalPaid: 0,
              // Initialize currentPrincipalBalance from initialOutstandingAmount or principalAmount
              currentPrincipalBalance: loan.initialOutstandingAmount ?? loan.principalAmount,
              totalInterestPaidActual: 0,
              nextDueDate: addMonths(new Date(loan.startDate), 1), // First payment due date
              nextPaymentAmount: loan.monthlyPayment,
              nextPaymentPrincipal: null,
              nextPaymentInterest: null,
            }
          }
          const payments: LoanPayment[] = await paymentsResponse.json()

          const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)

          // Initialize currentPrincipalBalance based on initialOutstandingAmount or principalAmount
          let currentPrincipalBalance = loan.initialOutstandingAmount ?? loan.principalAmount
          let totalInterestPaidActual = 0
          let nextDueDate: Date | null = null
          let nextPaymentAmount: number | null = null
          let nextPaymentPrincipal: number | null = null
          let nextPaymentInterest: number | null = null

          // Sort payments by date to process them chronologically
          const sortedPayments = payments.sort(
            (a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime(),
          )

          // Simulate payments against the amortization schedule to find current state
          let paymentCount = 0 // Tracks how many payments have been effectively made
          for (const payment of sortedPayments) {
            if (currentPrincipalBalance <= 0.01) {
              // Loan is effectively paid off
              break
            }

            const monthlyRate = loan.interestRate / 100 / 12
            const interestPortion = currentPrincipalBalance * monthlyRate
            let principalPortion = payment.amount - interestPortion

            if (principalPortion < 0) {
              // Payment was less than interest due, or negative (treat as if no principal was paid)
              principalPortion = 0
              totalInterestPaidActual += payment.amount // All payment goes to interest if less than interest due
            } else {
              totalInterestPaidActual += interestPortion
              currentPrincipalBalance -= principalPortion
            }
            paymentCount++
          }

          // Determine next due date and payment details
          if (currentPrincipalBalance > 0.01) {
            // If loan is not fully paid
            // The next due date is based on the original start date + (number of payments made + 1) months
            nextDueDate = addMonths(new Date(loan.startDate), paymentCount + 1)

            // Calculate the next expected payment breakdown based on the current principal balance
            const monthlyRate = loan.interestRate / 100 / 12
            if (monthlyRate === 0) {
              // Handle 0% interest
              nextPaymentPrincipal = currentPrincipalBalance
              nextPaymentInterest = 0
              nextPaymentAmount = currentPrincipalBalance
            } else {
              nextPaymentInterest = currentPrincipalBalance * monthlyRate
              nextPaymentPrincipal = loan.monthlyPayment - nextPaymentInterest
              nextPaymentAmount = loan.monthlyPayment

              // Adjust if the remaining principal is less than the calculated principal portion
              if (nextPaymentPrincipal > currentPrincipalBalance) {
                nextPaymentPrincipal = currentPrincipalBalance
                nextPaymentInterest = 0 // No more interest if only principal remains
                nextPaymentAmount = currentPrincipalBalance
              }
            }
          } else {
            // Loan is paid off
            nextDueDate = null
            nextPaymentAmount = 0
            nextPaymentPrincipal = 0
            nextPaymentInterest = 0
          }

          return {
            ...loan,
            payments,
            totalPaid,
            currentPrincipalBalance: Math.max(0, currentPrincipalBalance), // Ensure non-negative
            totalInterestPaidActual,
            nextDueDate,
            nextPaymentAmount,
            nextPaymentPrincipal,
            nextPaymentInterest,
          }
        }),
      )

      setLoans(loansWithDetails)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  const addLoan = async (
    loan: Omit<Loan, "_id" | "userId" | "createdAt" | "monthlyPayment"> & { monthlyPayment: number },
  ) => {
    try {
      const response = await fetch("/api/loans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loan),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add loan")
      }

      await fetchLoans()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    }
  }

  const deleteLoan = async (id: string) => {
    try {
      const response = await fetch(`/api/loans/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete loan")
      }

      await fetchLoans()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    }
  }

  const addLoanPayment = async (loanId: string, amount: number, paymentDate: Date) => {
    try {
      const response = await fetch("/api/loans/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loanId, amount, paymentDate }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add loan payment")
      }

      await fetchLoans() // Re-fetch all loans to update payment status
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    }
  }

  useEffect(() => {
    fetchLoans()
  }, [fetchLoans])

  return {
    loans,
    loading,
    error,
    fetchLoans,
    addLoan,
    deleteLoan,
    addLoanPayment,
  }
}
