"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useExpenseStats } from "@/hooks/use-stats"

export function ExpenseStats() {
  const { stats, loading, error } = useExpenseStats()

  if (loading) {
    return (
      <Card className="border-4 border-retro-border shadow-retro">
        <CardHeader className="bg-retro-header text-retro-header-text">
          <CardTitle className="text-center">STATISTICS</CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-retro-card">
          <div className="text-center py-8 text-retro-text">Loading statistics...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-4 border-retro-border shadow-retro">
        <CardHeader className="bg-retro-header text-retro-header-text">
          <CardTitle className="text-center">STATISTICS</CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-retro-card">
          <div className="text-center py-8 text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card className="border-4 border-retro-border shadow-retro">
        <CardHeader className="bg-retro-header text-retro-header-text">
          <CardTitle className="text-center">STATISTICS</CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-retro-card">
          <div className="text-center py-8 text-retro-text">No statistics available</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-4 border-retro-border shadow-retro">
      <CardHeader className="bg-retro-header text-retro-header-text">
        <CardTitle className="text-center">STATISTICS</CardTitle>
        <CardDescription className="text-center text-retro-header-text opacity-80">
          Overview of your expenses
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 bg-retro-card">
        <div className="space-y-6">
          <div className="border-2 border-retro-border p-4 bg-retro-bg/30 rounded">
            <h3 className="text-lg font-bold text-retro-text mb-2">TOTAL EXPENSES</h3>
            <p className="text-3xl font-bold text-retro-button">${stats.total.toFixed(2)}</p>
          </div>

          <div className="border-2 border-retro-border p-4 bg-retro-bg/30 rounded">
            <h3 className="text-lg font-bold text-retro-text mb-4">EXPENSES BY CATEGORY</h3>
            {stats.byCategory.length === 0 ? (
              <p className="text-retro-text">No category data available</p>
            ) : (
              <div className="space-y-3">
                {stats.byCategory.map((item) => (
                  <div
                    key={item.category}
                    className="flex justify-between items-center border-b border-retro-border pb-2"
                  >
                    <span className="font-medium text-retro-text">{item.category}</span>
                    <span className="font-bold text-retro-button">${item.total.toFixed(2)}</span>
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
