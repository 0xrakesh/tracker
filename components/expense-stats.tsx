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
      <Card className="border-4 border-retro-dark shadow-retro">
        <CardHeader className="bg-retro-deep text-white">
          <CardTitle className="text-center">STATISTICS</CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white">
          <div className="text-center py-8 text-retro-dark">Loading statistics...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-4 border-retro-dark shadow-retro">
        <CardHeader className="bg-retro-deep text-white">
          <CardTitle className="text-center">STATISTICS</CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white">
          <div className="text-center py-8 text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card className="border-4 border-retro-dark shadow-retro">
        <CardHeader className="bg-retro-deep text-white">
          <CardTitle className="text-center">STATISTICS</CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white">
          <div className="text-center py-8 text-retro-dark">No statistics available</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-4 border-retro-dark shadow-retro">
      <CardHeader className="bg-retro-deep text-white">
        <CardTitle className="text-center">STATISTICS</CardTitle>
        <CardDescription className="text-center text-white opacity-80">Overview of your expenses</CardDescription>
      </CardHeader>
      <CardContent className="p-6 bg-white">
        <div className="mb-4">
          <DateRangePicker startDate={startDate} endDate={endDate} onDateChange={handleDateChange} />
        </div>

        <div className="space-y-6">
          <div className="border-2 border-retro-dark p-4 bg-retro-light rounded">
            <h3 className="text-lg font-bold text-retro-dark mb-2">TOTAL EXPENSES</h3>
            <p className="text-3xl font-bold text-retro-medium">${stats.total.toFixed(2)}</p>
            <p className="text-sm text-retro-dark mt-1">
              {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
            </p>
          </div>

          {stats.byMonth && stats.byMonth.length > 0 && (
            <div className="border-2 border-retro-dark p-4 bg-retro-light rounded">
              <h3 className="text-lg font-bold text-retro-dark mb-4">MONTHLY BREAKDOWN</h3>
              <div className="space-y-3">
                {stats.byMonth.map((item) => (
                  <div
                    key={`${item.year}-${item.month}`}
                    className="flex justify-between items-center border-b border-retro-dark pb-2"
                  >
                    <span className="font-medium text-retro-dark">
                      {getMonthName(item.month)} {item.year}
                    </span>
                    <span className="font-bold text-retro-medium">${item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-2 border-retro-dark p-4 bg-retro-light rounded">
            <h3 className="text-lg font-bold text-retro-dark mb-4">EXPENSES BY CATEGORY</h3>
            {stats.byCategory.length === 0 ? (
              <p className="text-retro-dark">No category data available</p>
            ) : (
              <div className="space-y-3">
                {stats.byCategory.map((item) => (
                  <div
                    key={item.category}
                    className="flex justify-between items-center border-b border-retro-dark pb-2"
                  >
                    <span className="font-medium text-retro-dark">{item.category}</span>
                    <span className="font-bold text-retro-medium">${item.total.toFixed(2)}</span>
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
