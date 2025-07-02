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

const formSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountName: z.string().min(1, "Account name is required"),
  initialBalance: z
    .string()
    .min(1, "Initial balance is required")
    .refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) >= 0, {
      message: "Balance must be a non-negative number",
    }),
})

type FormValues = z.infer<typeof formSchema>

export default function AddBankAccountPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { addBankAccount } = useBankAccounts()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bankName: "",
      accountName: "",
      initialBalance: "",
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
      const success = await addBankAccount({
        bankName: values.bankName,
        accountName: values.accountName,
        initialBalance: Number.parseFloat(values.initialBalance),
      })
      if (success) {
        form.reset()
        toast({
          title: "Bank Account Added",
          description: "Your bank account has been added successfully.",
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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Add New Bank Account</h1>
          <p className="text-muted-foreground">Add your bank accounts to track your available balances.</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Enter the details for your new bank account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Indian Bank" {...field} />
                      </FormControl>
                      <FormDescription>The name of your bank.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Savings, Checking, Credit Card" {...field} />
                      </FormControl>
                      <FormDescription>A descriptive name for this account.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="initialBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Balance (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormDescription>The starting balance of this account.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Adding Account..." : "Add Account"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
