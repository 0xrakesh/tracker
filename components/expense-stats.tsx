"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useExpenseStats } from "@/hooks/use-stats"
import { DateRangePicker } from "./date-range-picker"
import { ExportButton } from "./export-button"
import { exportStatisticsToPDF } from "@/lib/pdf-export"
import { useAuth } from "@/lib/auth-context"
import { useVisibility } from "@/lib/visibility-context" // Import useVisibility

export function ExpenseStats() {
  const [startDate, setStartDate] = useState(startOfMonth(new Date()))
  const [endDate, setEndDate] = useState(endOfMonth(new Date()))
  const { stats, loading, error } = useExpenseStats(startDate, endDate)
  const { user } = useAuth()
  const { showAmounts } = useVisibility() // Use the visibility hook

  const handleDateChange = (newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
  }

  const handleExport = async (format: "pdf") => {
    if (format === "pdf" && user && stats) {
      exportStatisticsToPDF(stats, startDate, endDate, user.username)
    }
  }

  const getMonthName = (month: number) => {
    return new Date(0, month - 1).toLocaleString("default", { month: "short" })
  }

  const formatAmount = (amount: number) => {
    return showAmounts ? `₹${amount.toFixed(2)}` : "₹****.**"
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>STATISTICS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading statistics...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>STATISTICS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive text-sm">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>STATISTICS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">No statistics available</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">STATISTICS</CardTitle>
            <CardDescription className="text-sm">Overview of your expenses</CardDescription>
          </div>
          <ExportButton onExport={handleExport} disabled={!stats || stats.total === 0} size="sm" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div className="w-full overflow-hidden">
          <DateRangePicker startDate={startDate} endDate={endDate} onDateChange={handleDateChange} />
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <h3 className="text-sm font-bold mb-2">TOTAL EXPENSES</h3>
            <p className="text-2xl font-bold text-primary">{formatAmount(stats.total)}</p>
            <div className="text-xs text-muted-foreground mt-1">
              <div className="truncate">
                {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
              </div>
            </div>
          </div>

          {stats.byMonth && stats.byMonth.length > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <h3 className="text-sm font-bold mb-3">MONTHLY BREAKDOWN</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {stats.byMonth.map((item) => (
                  <div key={`${item.year}-${item.month}`} className="flex justify-between items-center text-sm">
                    <span className="font-medium truncate pr-2 min-w-0">
                      {getMonthName(item.month)} {item.year}
                    </span>
                    <span className="font-bold text-primary whitespace-nowrap text-xs">{formatAmount(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-muted rounded-lg">
            <h3 className="text-sm font-bold mb-3">BY CATEGORY</h3>
            {stats.byCategory.length === 0 ? (
              <p className="text-muted-foreground text-xs">No category data available</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {stats.byCategory.map((item) => (
                  <div key={item.category} className="flex justify-between items-center text-sm">
                    <span className="font-medium truncate pr-2 min-w-0">{item.category}</span>
                    <span className="font-bold text-primary whitespace-nowrap text-xs">{formatAmount(item.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
