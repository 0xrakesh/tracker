"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { LoanForm } from "@/components/loan-form"
import { useLoans } from "@/hooks/use-loans"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AddLoanPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { addLoan } = useLoans() // Get addLoan from hook
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

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
          <h1 className="text-3xl font-bold tracking-tight">Add New Loan</h1>
          <p className="text-muted-foreground">Record your loan details to track your debt obligations.</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
            <CardDescription>Enter the details of your loan below.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoanForm onSubmit={addLoan} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
