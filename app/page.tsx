"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"

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
      <div className="min-h-screen bg-retro-bg flex items-center justify-center">
        <div className="text-xl text-retro-text font-bold border-4 border-retro-border p-8 bg-retro-card shadow-retro">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-retro-bg flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 text-retro-text tracking-wide font-retro">FINANCE TRACKER</h1>
          <p className="text-xl mb-8 text-retro-text">
            A simple way to track your daily expenses and manage your finances with a retro style.
          </p>

          <div className="border-4 border-retro-border bg-retro-card p-8 rounded shadow-retro mb-12">
            <h2 className="text-2xl font-bold mb-4 text-retro-text">Track Your Expenses</h2>
            <p className="mb-6 text-retro-text">
              Sign up now to start tracking your expenses, categorize your spending, and gain insights into your
              financial habits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-retro-button hover:bg-retro-button-hover text-retro-button-text px-6 py-3 rounded shadow-retro font-bold text-lg"
              >
                SIGN UP NOW
              </Link>
              <Link
                href="/login"
                className="border-2 border-retro-border bg-retro-bg hover:bg-retro-bg/70 text-retro-text px-6 py-3 rounded shadow-retro font-bold text-lg"
              >
                LOGIN
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-4 border-retro-border bg-retro-card p-6 rounded shadow-retro">
              <h3 className="text-xl font-bold mb-2 text-retro-text">Easy to Use</h3>
              <p className="text-retro-text">Simple interface to add and track your daily expenses.</p>
            </div>
            <div className="border-4 border-retro-border bg-retro-card p-6 rounded shadow-retro">
              <h3 className="text-xl font-bold mb-2 text-retro-text">Categorize</h3>
              <p className="text-retro-text">Organize expenses by categories to understand your spending habits.</p>
            </div>
            <div className="border-4 border-retro-border bg-retro-card p-6 rounded shadow-retro">
              <h3 className="text-xl font-bold mb-2 text-retro-text">Insights</h3>
              <p className="text-retro-text">Get statistics and insights about your spending patterns.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-retro-header text-retro-header-text p-4 border-t-4 border-retro-border mt-12">
        <div className="container mx-auto text-center">
          <p>&copy; 2023 Finance Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
