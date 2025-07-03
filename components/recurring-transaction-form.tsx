"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRecurringTransactions } from "@/hooks/use-recurring-transactions"
import { useBankAccounts } from "@/hooks/use-bank-accounts"
import { categories } from "@/lib/models/expense"

export function RecurringTransactionForm() {
  const router = useRouter()
  const { addTransaction } = useRecurringTransactions()
  const { bankAccounts } = useBankAccounts()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    amount: "",
    category: "defaultCategory", // Updated default value
    description: "",
    frequency: "daily", // Updated default value
    nextOccurrenceDate: "",
    bankAccountId: "", // Updated default value
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const success = await addTransaction({
        amount: Number.parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        frequency: formData.frequency as "daily" | "weekly" | "monthly" | "yearly",
        nextOccurrenceDate: new Date(formData.nextOccurrenceDate),
        bankAccountId: formData.bankAccountId || undefined,
        isActive: true,
      })

      if (success) {
        router.push("/dashboard/recurring-transactions")
      }
    } catch (error) {
      console.error("Error adding recurring transaction:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Recurring Transaction</CardTitle>
        <CardDescription>Set up a transaction that repeats automatically</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextOccurrenceDate">Next Occurrence Date</Label>
              <Input
                id="nextOccurrenceDate"
                type="date"
                value={formData.nextOccurrenceDate}
                onChange={(e) => setFormData({ ...formData, nextOccurrenceDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankAccount">Bank Account (Optional)</Label>
            <Select
              value={formData.bankAccountId}
              onValueChange={(value) => setFormData({ ...formData, bankAccountId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bank account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No bank account</SelectItem> {/* Updated value prop */}
                {bankAccounts.map((account) => (
                  <SelectItem key={account._id?.toString()} value={account._id?.toString() || "none"}>
                    {account.bankName} - {account.accountName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Recurring Transaction"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
