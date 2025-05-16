"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Trash2 } from "lucide-react"
import type { Expense } from "@/lib/models/expense"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { categories } from "@/lib/models/expense"

interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (id: string) => Promise<boolean>
}

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-2 border-retro-dark bg-white shadow-retro"
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="border-2 border-retro-dark bg-white shadow-retro">
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

      {filteredExpenses.length === 0 ? (
        <div className="text-center py-8 text-retro-dark border-2 border-retro-dark bg-white p-4 rounded shadow-retro">
          No expenses found.
        </div>
      ) : (
        <div className="border-2 border-retro-dark bg-white rounded shadow-retro overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-retro-deep text-white">
                <TableRow>
                  <TableHead className="text-white">DATE</TableHead>
                  <TableHead className="text-white">DESCRIPTION</TableHead>
                  <TableHead className="text-white">CATEGORY</TableHead>
                  <TableHead className="text-right text-white">AMOUNT</TableHead>
                  <TableHead className="w-[80px] text-white"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense._id?.toString()} className="hover:bg-retro-light/30">
                    <TableCell className="font-medium">{format(new Date(expense.date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="text-right font-bold text-retro-medium">
                      ${expense.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(expense._id?.toString() || "")}
                        disabled={isDeleting === expense._id?.toString()}
                        className="hover:bg-red-500 hover:text-white rounded"
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
          <div className="p-4 border-t-2 border-retro-dark bg-white">
            <div className="text-sm text-retro-dark">
              Showing {filteredExpenses.length} of {expenses.length} expenses
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
