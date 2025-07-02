"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { useBankAccounts } from "@/hooks/use-bank-accounts"
import { useSavingsGoals } from "@/hooks/use-savings-goals"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const formSchema = z.object({
  goalName: z.string().min(1, "Goal name is required"),
  bankAccountId: z.string().min(1, "Bank account is required"),
  targetAmount: z
    .string()
    .min(1, "Target amount is required")
    .refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0, {
      message: "Target amount must be a positive number",
    }),
  targetDate: z.date().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function AddSavingsGoalPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { addSavingsGoal } = useSavingsGoals()
  const { bankAccounts, loading: accountsLoading, error: accountsError } = useBankAccounts()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goalName: "",
      bankAccountId: "",
      targetAmount: "",
      targetDate: undefined,
    },
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      const success = await addSavingsGoal({
        goalName: values.goalName,
        bankAccountId: values.bankAccountId,
        targetAmount: Number.parseFloat(values.targetAmount),
        targetDate: values.targetDate,
      })
      if (success) {
        form.reset()
        toast({
          title: "Savings Goal Added",
          description: "Your savings goal has been added successfully.",
        })
        router.push("/dashboard") // Redirect to dashboard after adding
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="text-center">
            <div className="text-xl font-bold">Loading...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6 px-4 space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Create New Savings Goal</h1>
          <p className="text-muted-foreground">Set a target for your savings in a specific bank account.</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Goal Details</CardTitle>
            <CardDescription>Define your savings goal and link it to a bank account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="goalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Emergency Fund, New Car" {...field} />
                      </FormControl>
                      <FormDescription>A descriptive name for your savings goal.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Account</FormLabel>
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
                      <FormDescription>Select the bank account for this savings goal.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Amount (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100000" {...field} />
                      </FormControl>
                      <FormDescription>The amount you want to save.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Target Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a target date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>The date by which you want to achieve this goal.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Creating Goal..." : "Create Goal"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
