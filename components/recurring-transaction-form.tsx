"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBankAccounts } from "@/hooks/use-bank-accounts"
import type { RecurringTransaction } from "@/lib/models/recurring-transaction"

const formSchema = z.object({
  name: z.string().min(1, "Transaction name is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  category: z.string().min(1, "Category is required"),
  frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"], {
    required_error: "Frequency is required",
  }),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  bankAccountId: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface RecurringTransactionFormProps {
  onSubmit: (
    transaction: Omit<RecurringTransaction, "_id" | "userId" | "createdAt" | "type" | "nextOccurrenceDate"> & {
      type: "expense"
      nextOccurrenceDate: Date
    },
  ) => Promise<boolean>
  defaultValues?: Partial<FormValues>
}

export function RecurringTransactionForm({ onSubmit, defaultValues }: RecurringTransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { bankAccounts, loading: accountsLoading, error: accountsError } = useBankAccounts()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      amount: defaultValues?.amount?.toString() || "",
      category: defaultValues?.category || "",
      frequency: defaultValues?.frequency || "monthly",
      startDate: defaultValues?.startDate || new Date(),
      bankAccountId: defaultValues?.bankAccountId?.toString() || "",
      notes: defaultValues?.notes || "",
    },
  })

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      // Calculate nextOccurrenceDate based on startDate and frequency
      const nextOccurrenceDate = values.startDate
      // For simplicity, we'll just set it to the start date initially.
      // The server-side processing function will handle advancing it.

      const success = await onSubmit({
        name: values.name,
        amount: Number.parseFloat(values.amount),
        category: values.category,
        frequency: values.frequency,
        startDate: values.startDate,
        nextOccurrenceDate: nextOccurrenceDate, // Initial next occurrence
        bankAccountId: values.bankAccountId || undefined,
        notes: values.notes || undefined,
        type: "expense", // Assuming it's always an expense for now
      })

      if (success) {
        form.reset()
        toast({
          title: "Recurring Transaction Added",
          description: "Your recurring transaction has been set up successfully.",
        })
      } else {
        toast({
          title: "Failed to Add Recurring Transaction",
          description: "There was an error adding your recurring transaction. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting recurring transaction:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Rent, Salary, Subscription" {...field} />
              </FormControl>
              <FormDescription>A descriptive name for this recurring transaction.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (₹)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="5000.00" {...field} />
              </FormControl>
              <FormDescription>The amount of the transaction.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Housing, Utilities, Food" {...field} />
              </FormControl>
              <FormDescription>The category of this transaction.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>How often this transaction occurs.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>The date from which this recurring transaction starts.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bankAccountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Account (Optional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bank account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accountsLoading ? (
                    <SelectItem value="" disabled>
                      Loading accounts...
                    </SelectItem>
                  ) : accountsError ? (
                    <SelectItem value="" disabled>
                      Error loading accounts
                    </SelectItem>
                  ) : bankAccounts.length === 0 ? (
                    <SelectItem value="" disabled>
                      No accounts found. Add one first!
                    </SelectItem>
                  ) : (
                    bankAccounts.map((account) => (
                      <SelectItem key={account._id?.toString()} value={account._id?.toString() || ""}>
                        {account.bankName} ({account.accountName})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>Link this transaction to a specific bank account.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Any additional notes" {...field} />
              </FormControl>
              <FormDescription>Add any relevant notes for this transaction.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Adding Transaction..." : "Add Recurring Transaction"}
        </Button>
      </form>
    </Form>
  )
}
