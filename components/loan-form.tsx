"use client"

import { useState, useEffect } from "react"
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
import { toast } from "@/components/ui/use-toast"
import { calculateMonthlyPayment } from "@/lib/loan-calculations" // Updated import path

const formSchema = z.object({
  loanName: z.string().min(1, "Loan name is required"),
  principalAmount: z
    .string()
    .min(1, "Principal amount is required")
    .refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  interestRate: z
    .string()
    .min(1, "Interest rate is required")
    .refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) >= 0, {
      message: "Interest rate must be a non-negative number",
    }),
  loanTermMonths: z
    .string()
    .min(1, "Loan term is required")
    .refine((val) => !isNaN(Number.parseInt(val)) && Number.parseInt(val) > 0, {
      message: "Loan term must be a positive integer",
    }),
  startDate: z.date({
    required_error: "Start date is required",
  }),
})

type FormValues = z.infer<typeof formSchema>

interface LoanFormProps {
  onSubmit: (
    values: Omit<FormValues, "principalAmount" | "interestRate" | "loanTermMonths"> & {
      principalAmount: number
      interestRate: number
      loanTermMonths: number
      monthlyPayment: number
    },
  ) => Promise<boolean>
}

export function LoanForm({ onSubmit }: LoanFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanName: "",
      principalAmount: "",
      interestRate: "",
      loanTermMonths: "",
      startDate: new Date(),
    },
  })

  const { watch, setValue } = form

  const principal = watch("principalAmount")
  const rate = watch("interestRate")
  const term = watch("loanTermMonths")

  useEffect(() => {
    const numPrincipal = Number.parseFloat(principal)
    const numRate = Number.parseFloat(rate)
    const numTerm = Number.parseInt(term)

    if (!isNaN(numPrincipal) && numPrincipal > 0 && !isNaN(numRate) && !isNaN(numTerm) && numTerm > 0) {
      const calculatedPayment = calculateMonthlyPayment(numPrincipal, numRate / 100, numTerm)
      setMonthlyPayment(calculatedPayment)
    } else {
      setMonthlyPayment(null)
    }
  }, [principal, rate, term])

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      const principalAmount = Number.parseFloat(values.principalAmount)
      const interestRate = Number.parseFloat(values.interestRate)
      const loanTermMonths = Number.parseInt(values.loanTermMonths)

      const calculatedMonthlyPayment = calculateMonthlyPayment(principalAmount, interestRate / 100, loanTermMonths)

      const success = await onSubmit({
        ...values,
        principalAmount,
        interestRate,
        loanTermMonths,
        monthlyPayment: Number.parseFloat(calculatedMonthlyPayment.toFixed(2)),
      })
      if (success) {
        form.reset()
        setMonthlyPayment(null)
        toast({
          title: "Loan added",
          description: "Your loan has been added successfully.",
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
          name="loanName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loan Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Home Loan, Car Loan" {...field} />
              </FormControl>
              <FormDescription>A descriptive name for your loan</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="principalAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Principal Amount (₹)</FormLabel>
              <FormControl>
                <Input placeholder="1000000" {...field} />
              </FormControl>
              <FormDescription>The initial amount borrowed</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="interestRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Interest Rate (%)</FormLabel>
              <FormControl>
                <Input placeholder="5.0" {...field} />
              </FormControl>
              <FormDescription>The annual interest rate (e.g., 5 for 5%)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="loanTermMonths"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loan Term (Months)</FormLabel>
              <FormControl>
                <Input placeholder="120" {...field} />
              </FormControl>
              <FormDescription>The total duration of the loan in months</FormDescription>
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
              <FormDescription>The date the loan started</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {monthlyPayment !== null && (
          <div className="p-4 bg-muted rounded-md text-sm">
            <p className="font-medium">Estimated Monthly Payment:</p>
            <p className="text-lg font-bold text-primary">₹{monthlyPayment.toFixed(2)}</p>
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Adding Loan..." : "Add Loan"}
        </Button>
      </form>
    </Form>
  )
}
