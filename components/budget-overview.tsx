"use client"

import { format } from "date-fns"
import { Trash2, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useBudgets } from "@/hooks/use-budgets"

export function BudgetOverview() {
  const { budgetStatus, loading, error, deleteBudget } = useBudgets()

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Budget Overview</h3>
        <div className="text-center py-8 text-muted-foreground">Loading budgets...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Budget Overview</h3>
        <div className="text-center py-8 text-destructive">{error}</div>
      </div>
    )
  }

  if (budgetStatus.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Budget Overview</h3>
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
      <h3 className="text-lg font-semibold">Budget Overview</h3>
      <div className="space-y-4">
        {budgetStatus.map((status) => (
          <div key={status.budget._id?.toString()} className="border rounded-lg p-4 space-y-3 bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getBudgetStatusIcon(status)}
                <h4 className="font-semibold">{status.budget.category}</h4>
                <Badge variant={getBudgetStatusColor(status)} className="capitalize">
                  {status.budget.period}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteBudget(status.budget._id?.toString() || "")}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete budget</span>
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Spent: ${status.spent.toFixed(2)}</span>
                <span>Budget: ${status.budget.amount.toFixed(2)}</span>
              </div>
              <Progress value={Math.min(status.percentage, 100)} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{status.percentage.toFixed(1)}% used</span>
                <span>
                  {status.isOverBudget ? "Over by" : "Remaining"}: ${Math.abs(status.remaining).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              {format(new Date(status.budget.startDate), "MMM d")} -{" "}
              {format(new Date(status.budget.endDate), "MMM d, yyyy")}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
