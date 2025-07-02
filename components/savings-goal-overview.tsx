"use client"

import { useState } from "react"
import { Trash2, CheckCircle, AlertTriangle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useSavingsGoals } from "@/hooks/use-savings-goals"
import { useVisibility } from "@/lib/visibility-context"
import { format } from "date-fns"

export function SavingsGoalOverview() {
  const { savingsGoals, loading, error, deleteSavingsGoal } = useSavingsGoals()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const { showAmounts } = useVisibility()

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      await deleteSavingsGoal(id)
    } finally {
      setIsDeleting(null)
    }
  }

  const formatAmount = (amount: number) => {
    return showAmounts ? `₹${amount.toFixed(2)}` : "₹****.**"
  }

  const getGoalStatusIcon = (goal: (typeof savingsGoals)[0]) => {
    if (goal.isAchieved) {
      return <CheckCircle className="h-4 w-4 text-success" />
    }
    if (goal.isNearTarget) {
      return <AlertTriangle className="h-4 w-4 text-warning" />
    }
    return <Clock className="h-4 w-4 text-muted-foreground" />
  }

  const getGoalStatusText = (goal: (typeof savingsGoals)[0]) => {
    if (goal.isAchieved) {
      return "Achieved!"
    }
    if (goal.isNearTarget) {
      return "Nearing Target"
    }
    return "On Track"
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Savings Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading savings goals...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Savings Goals</CardTitle>
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
        <CardTitle className="text-lg">Savings Goals</CardTitle>
        <CardDescription className="text-sm">Track your progress towards your financial targets.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {savingsGoals.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>No savings goals created yet.</p>
            <p className="text-sm mt-1">Set a goal to start saving!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {savingsGoals.map((goal) => (
              <div key={goal._id?.toString()} className="border rounded-lg p-4 space-y-3 bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getGoalStatusIcon(goal)}
                    <h4 className="font-semibold truncate">{goal.goalName}</h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(goal._id?.toString() || "")}
                    disabled={isDeleting === goal._id?.toString()}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete goal</span>
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Account:</span> {goal.bankAccountName}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="whitespace-nowrap">Current: {formatAmount(goal.bankAccountCurrentBalance)}</span>
                    <span className="whitespace-nowrap">Target: {formatAmount(goal.targetAmount)}</span>
                  </div>
                  <Progress value={Math.min(goal.progressPercentage, 100)} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{goal.progressPercentage.toFixed(1)}% achieved</span>
                    <span className="whitespace-nowrap">
                      {goal.isAchieved ? "Achieved!" : `Needed: ${formatAmount(goal.amountNeeded)}`}
                    </span>
                  </div>
                </div>

                {goal.targetDate && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Target Date:</span> {format(new Date(goal.targetDate), "MMM d, yyyy")}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
