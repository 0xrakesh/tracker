"use client"

import { useMemo } from "react"
import { format, subMonths, eachMonthOfInterval } from "date-fns"
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { useExpenseStats } from "@/hooks/use-stats"
import { useVisibility } from "@/lib/visibility-context" // Import useVisibility

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"]

export function ExpenseInsights() {
  // Use fixed date range to prevent infinite re-renders
  const sixMonthsAgo = useMemo(() => subMonths(new Date(), 6), [])
  const today = useMemo(() => new Date(), [])

  const { stats, loading, error } = useExpenseStats(sixMonthsAgo, today)
  const { showAmounts } = useVisibility() // Use the visibility hook

  const formatAmount = (amount: number) => {
    return showAmounts ? `₹${amount.toFixed(0)}` : "₹****"
  }

  const chartData = useMemo(() => {
    if (!stats?.byMonth) return []

    const months = eachMonthOfInterval({
      start: sixMonthsAgo,
      end: today,
    })

    return months.map((month) => {
      const monthData = stats.byMonth.find(
        (item) => item.year === month.getFullYear() && item.month === month.getMonth() + 1,
      )
      return {
        month: format(month, "MMM"),
        amount: monthData?.total || 0,
      }
    })
  }, [stats, sixMonthsAgo, today])

  const pieData = useMemo(() => {
    if (!stats?.byCategory) return []
    return stats.byCategory.slice(0, 4).map((item, index) => ({
      name: item.category,
      value: item.total,
      fill: COLORS[index % COLORS.length],
    }))
  }, [stats])

  const insights = useMemo(() => {
    if (!stats || chartData.length < 2) return null

    const currentMonth = chartData[chartData.length - 1]?.amount || 0
    const previousMonth = chartData[chartData.length - 2]?.amount || 0
    const trend = currentMonth - previousMonth
    const trendPercentage = previousMonth > 0 ? (trend / previousMonth) * 100 : 0

    const avgMonthly = chartData.reduce((sum, item) => sum + item.amount, 0) / chartData.length
    const topCategory = stats.byCategory[0]

    return {
      trend,
      trendPercentage,
      avgMonthly,
      topCategory,
      currentMonth,
    }
  }, [stats, chartData])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center py-8 text-muted-foreground">Loading insights...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Error loading insights: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">{formatAmount(insights.currentMonth)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Avg</p>
                  <p className="text-2xl font-bold">{formatAmount(insights.avgMonthly)}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Trend</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    {insights.trend >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-destructive" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-success" />
                    )}
                    {Math.abs(insights.trendPercentage).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Category</p>
                <p className="text-lg font-bold truncate">{insights.topCategory?.category || "N/A"}</p>
                <p className="text-sm text-muted-foreground">{formatAmount(insights.topCategory?.total || 0)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Spending Trend</CardTitle>
            <CardDescription>Last 6 months spending pattern</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {" "}
            {/* Added overflow-x-auto */}
            <ChartContainer
              config={{
                amount: {
                  label: "Amount",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => (showAmounts ? `₹${value}` : "₹")} /> {/* Shortened placeholder */}
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value) => [showAmounts ? `₹${value}` : "₹", "Amount"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--color-amount)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-amount)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Top spending categories</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {" "}
            {/* Added overflow-x-auto */}
            <ChartContainer
              config={{
                value: {
                  label: "Amount",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value) => [showAmounts ? `₹${value}` : "₹", "Amount"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
