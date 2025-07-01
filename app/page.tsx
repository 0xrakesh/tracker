"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TrendingUp, PieChart, Target, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl font-bold border p-8 bg-card shadow-lg rounded-lg animate-fade-in">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight animate-fade-in">
              Take Control of Your
              <span className="text-primary"> Finances</span>
            </h1>
            <p className="text-base sm:text-xl mb-8 text-muted-foreground animate-fade-in">
              Track expenses, set budgets, and gain insights into your spending habits with our comprehensive finance
              tracker.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Everything you need to manage your money</h2>
              <p className="text-xl text-muted-foreground">
                Powerful features to help you understand and control your spending
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="animate-fade-in">
                <CardHeader>
                  <TrendingUp className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Expense Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Easily track and categorize your daily expenses with our intuitive interface.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="animate-fade-in">
                <CardHeader>
                  <Target className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Budget Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Set budgets for different categories and track your progress in real-time.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="animate-fade-in">
                <CardHeader>
                  <PieChart className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Visual Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get detailed charts and analytics to understand your spending patterns.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="animate-fade-in">
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Secure & Private</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Your financial data is encrypted and secure with user authentication.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">Ready to take control?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of users who have already improved their financial habits.
            </p>
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Start Your Journey
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 Finance Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
