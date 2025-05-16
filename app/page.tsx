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
      <div className="min-h-screen bg-retro-light flex items-center justify-center">
        <div className="text-xl text-retro-dark font-bold border-4 border-retro-dark p-8 bg-white shadow-retro">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-retro-light flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 text-retro-dark tracking-wide font-retro">FINANCE TRACKER</h1>
          <p className="text-xl mb-8 text-retro-dark">
            A simple way to track your daily expenses and manage your finances.
          </p>

          <div className="border-4 border-retro-dark bg-white p-8 rounded shadow-retro mb-12">
            <h2 className="text-2xl font-bold mb-4 text-retro-dark">Track Your Expenses</h2>
            <p className="mb-6 text-retro-dark">
              Sign up now to start tracking your expenses, categorize your spending, and gain insights into your
              financial habits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-retro-medium hover:bg-retro-deep text-white px-6 py-3 rounded shadow-retro font-bold text-lg border-2 border-retro-dark"
              >
                SIGN UP NOW
              </Link>
              <Link
                href="/login"
                className="border-2 border-retro-dark bg-retro-light hover:bg-retro-light/70 text-retro-dark px-6 py-3 rounded shadow-retro font-bold text-lg"
              >
                LOGIN
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-4 border-retro-dark bg-white p-6 rounded shadow-retro">
              <h3 className="text-xl font-bold mb-2 text-retro-dark">Easy to Use</h3>
              <p className="text-retro-dark">Simple interface to add and track your daily expenses.</p>
            </div>
            <div className="border-4 border-retro-dark bg-white p-6 rounded shadow-retro">
              <h3 className="text-xl font-bold mb-2 text-retro-dark">Categorize</h3>
              <p className="text-retro-dark">Organize expenses by categories to understand your spending habits.</p>
            </div>
            <div className="border-4 border-retro-dark bg-white p-6 rounded shadow-retro">
              <h3 className="text-xl font-bold mb-2 text-retro-dark">Insights</h3>
              <p className="text-retro-dark">
                Get statistics and insights about your spending patterns by month or date range.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-retro-deep text-white p-4 border-t-4 border-retro-dark mt-12">
        <div className="container mx-auto text-center">
          <p>&copy; 2023 Finance Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
