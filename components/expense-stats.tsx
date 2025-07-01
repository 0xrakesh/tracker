"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useExpenseStats } from "@/hooks/use-stats"
import { DateRangePicker } from "./date-range-picker"

export function ExpenseStats() {
  const [startDate, setStartDate] = useState(startOfMonth(new Date()))
  const [endDate, setEndDate] = useState(endOfMonth(new Date()))
  const { stats, loading, error } = useExpenseStats(startDate, endDate)

  const handleDateChange = (newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
  }

  const getMonthName = (month: number) => {
    return new Date(0, month - 1).toLocaleString("default", { month: "long" })
  }

  if (loading) {
    return (
      <Card>
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
      <Card>
        <CardHeader>
          <CardTitle>STATISTICS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
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
    <Card>
      <CardHeader>
        <CardTitle>STATISTICS</CardTitle>
        <CardDescription>Overview of your expenses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <DateRangePicker startDate={startDate} endDate={endDate} onDateChange={handleDateChange} />

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="text-lg font-bold mb-2">TOTAL EXPENSES</h3>
            <p className="text-3xl font-bold text-primary">₹{stats.total.toFixed(2)}</p>
            <div className="text-sm text-muted-foreground mt-1 break-words">
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="whitespace-nowrap">{format(startDate, "MMM d, yyyy")}</span>
                <span className="hidden sm:inline">-</span>
                <span className="whitespace-nowrap">{format(endDate, "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>

          {stats.byMonth && stats.byMonth.length > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-bold mb-4">MONTHLY BREAKDOWN</h3>
              <div className="space-y-3">
                {stats.byMonth.map((item) => (
                  <div key={`${item.year}-${item.month}`} className="flex justify-between items-center">
                    <span className="font-medium text-sm sm:text-base truncate pr-2">
                      {getMonthName(item.month)} {item.year}
                    </span>
                    <span className="font-bold text-primary whitespace-nowrap">₹{item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 bg-muted rounded-lg">
            <h3 className="text-lg font-bold mb-4">EXPENSES BY CATEGORY</h3>
            {stats.byCategory.length === 0 ? (
              <p className="text-muted-foreground">No category data available</p>
            ) : (
              <div className="space-y-3">
                {stats.byCategory.map((item) => (
                  <div key={item.category} className="flex justify-between items-center">
                    <span className="font-medium text-sm sm:text-base truncate pr-2">{item.category}</span>
                    <span className="font-bold text-primary whitespace-nowrap">₹{item.total.toFixed(2)}</span>
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
