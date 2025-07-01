"use client"

import { format } from "date-fns"
import { Trash2, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ExportButton } from "./export-button"
import { exportBudgetsToPDF } from "@/lib/pdf-export"
import { useAuth } from "@/lib/auth-context"
import { useBudgets } from "@/hooks/use-budgets"
import { useVisibility } from "@/lib/visibility-context" // Import useVisibility

export function BudgetOverview() {
  const { budgetStatus, loading, error, deleteBudget } = useBudgets()
  const { user } = useAuth()
  const { showAmounts } = useVisibility() // Use the visibility hook

  const handleExport = async (format: "pdf") => {
    if (format === "pdf" && user && budgetStatus.length > 0) {
      exportBudgetsToPDF(budgetStatus, user.username)
    }
  }

  const formatAmount = (amount: number) => {
    return showAmounts ? `₹${amount.toFixed(2)}` : "₹****.**"
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Budget Overview</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">Loading budgets...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Budget Overview</h3>
        </div>
        <div className="text-center py-8 text-destructive">{error}</div>
      </div>
    )
  }

  if (budgetStatus.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Budget Overview</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p>No budgets created yet</p>
          <p className="text-sm mt-2">Create your first budget to start tracking your spending limits.</p>
        </div>
      </div>
    )
  }

  const getBudgetStatusIcon = (status: (typeof budgetStatus)[0]) => {
    if (status.isOverBudget) {
      return <AlertTriangle className="h-4 w-4 text-destructive" />
    }
    if (status.percentage >= 80) {
      return <Clock className="h-4 w-4 text-warning" />
    }
    return <CheckCircle className="h-4 w-4 text-success" />
  }

  const getBudgetStatusColor = (status: (typeof budgetStatus)[0]) => {
    if (status.isOverBudget) return "destructive"
    if (status.percentage >= 80) return "secondary"
    return "default"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Budget Overview</h3>
        <ExportButton onExport={handleExport} disabled={budgetStatus.length === 0} size="sm" />
      </div>
      <div className="space-y-4">
        {budgetStatus.map((status) => (
          <div key={status.budget._id?.toString()} className="border rounded-lg p-4 space-y-3 bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {getBudgetStatusIcon(status)}
                <h4 className="font-semibold truncate">{status.budget.category}</h4>
                <Badge variant={getBudgetStatusColor(status)} className="capitalize shrink-0">
                  {status.budget.period}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteBudget(status.budget._id?.toString() || "")}
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete budget</span>
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="whitespace-nowrap">Spent: {formatAmount(status.spent)}</span>
                <span className="whitespace-nowrap">Budget: {formatAmount(status.budget.amount)}</span>
              </div>
              <Progress value={Math.min(status.percentage, 100)} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{status.percentage.toFixed(1)}% used</span>
                <span className="whitespace-nowrap">
                  {status.isOverBudget ? "Over by" : "Remaining"}: {formatAmount(Math.abs(status.remaining))}
                </span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground break-words">
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="whitespace-nowrap">{format(new Date(status.budget.startDate), "MMM d")}</span>
                <span className="hidden sm:inline">-</span>
                <span className="whitespace-nowrap">{format(new Date(status.budget.endDate), "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
