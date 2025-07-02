"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { categories } from "@/lib/models/expense"
import { useBankAccounts } from "@/hooks/use-bank-accounts"

const formSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  bankAccountId: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface RecurringTransactionFormProps {
  onSubmit: (
    values: Omit<FormValues, "amount" | "startDate" | "bankAccountId"> & {
      amount: number
      startDate: Date
      nextOccurrenceDate: Date
      bankAccountId?: string
      type: "expense"
    },
  ) => Promise<boolean>
}

export function RecurringTransactionForm({ onSubmit }: RecurringTransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { bankAccounts, loading: accountsLoading, error: accountsError } = useBankAccounts()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      category: "",
      description: "",
      frequency: "monthly",
      startDate: new Date(),
      bankAccountId: "none",
    },
  })

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      // Calculate initial nextOccurrenceDate (same as startDate for first entry)
      const nextOccurrenceDate = values.startDate

      const success = await onSubmit({
        ...values,
        amount: Number.parseFloat(values.amount),
        startDate: values.startDate,
        nextOccurrenceDate: nextOccurrenceDate,
        bankAccountId: values.bankAccountId === "none" ? undefined : values.bankAccountId,
        type: "expense", // Hardcoded for now
      })
      if (success) {
        form.reset({
          amount: "",
          category: "",
          description: "",
          frequency: "monthly",
          startDate: new Date(),
          bankAccountId: "none",
        })
        toast({
          title: "Recurring transaction added",
          description: "Your recurring transaction has been set up successfully.",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input placeholder="0.00" {...field} />
              </FormControl>
              <FormDescription>Enter the amount for this recurring transaction</FormDescription>
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Select the category for this recurring expense</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe this recurring transaction" {...field} />
              </FormControl>
              <FormDescription>e.g., Monthly Rent, Netflix Subscription</FormDescription>
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>How often this transaction occurs</FormDescription>
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
                      {field.value ? format(field.value, "PPP") : <span>Pick a start date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
              <FormDescription>The date this recurring transaction begins</FormDescription>
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
                    <>
                      <SelectItem value="none">None</SelectItem>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account._id?.toString()} value={account._id?.toString() || ""}>
                          {account.bankName} ({account.accountName}) - ₹{account.currentBalance.toFixed(2)}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>Select the bank account this recurring expense will be deducted from.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Adding..." : "Add Recurring Transaction"}
        </Button>
      </form>
    </Form>
  )
}
