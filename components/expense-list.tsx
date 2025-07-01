"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Trash2 } from "lucide-react"
import type { Expense } from "@/lib/models/expense"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ExportButton } from "./export-button"
import { exportExpensesToPDF } from "@/lib/pdf-export"
import { useAuth } from "@/lib/auth-context"
import { categories } from "@/lib/models/expense"
import { useVisibility } from "@/lib/visibility-context" // Import useVisibility

interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (id: string) => Promise<boolean>
  startDate?: Date
  endDate?: Date
}

export function ExpenseList({ expenses, onDelete, startDate, endDate }: ExpenseListProps) {
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const { user } = useAuth()
  const { showAmounts } = useVisibility() // Use the visibility hook

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      await onDelete(id)
    } finally {
      setIsDeleting(null)
    }
  }

  const filteredExpenses = expenses.filter((expense) => {
    const matchesCategory = filter === "all" || expense.category === filter
    const matchesSearch = expense.description.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleExport = async (format: "pdf") => {
    if (format === "pdf" && user && startDate && endDate) {
      exportExpensesToPDF(filteredExpenses, startDate, endDate, user.username)
    }
  }

  const formatAmount = (amount: number) => {
    return showAmounts ? `₹${amount.toFixed(2)}` : "₹****.**"
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="flex-1">
            <Input
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ExportButton onExport={handleExport} disabled={filteredExpenses.length === 0} />
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg bg-card">No expenses found.</div>
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Date</TableHead>
                  <TableHead className="min-w-[150px]">Description</TableHead>
                  <TableHead className="min-w-[100px]">Category</TableHead>
                  <TableHead className="text-right min-w-[100px]">Amount</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense._id?.toString()}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {format(new Date(expense.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={expense.description}>
                      {expense.description}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{expense.category}</TableCell>
                    <TableCell className="text-right font-bold whitespace-nowrap">
                      {formatAmount(expense.amount)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(expense._id?.toString() || "")}
                        disabled={isDeleting === expense._id?.toString()}
                        className="hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="p-4 border-t bg-muted/50">
            <div className="text-sm text-muted-foreground">
              Showing {filteredExpenses.length} of {expenses.length} expenses
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
