"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import { useVisibility } from "@/lib/visibility-context"
import {
  Menu,
  Home,
  PlusCircle,
  CreditCard,
  Repeat,
  BarChart3,
  LogOut,
  Eye,
  EyeOff,
  Wallet,
  Target,
} from "lucide-react"

export function Header() {
  const { user, logout } = useAuth()
  const { showAmounts, toggleVisibility } = useVisibility()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const closeSheet = () => setIsOpen(false)

  const navigationItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/insights", label: "Insights", icon: BarChart3 },
    { href: "/dashboard/recurring-transactions", label: "Recurring", icon: Repeat },
    { href: "/dashboard/expenses/create", label: "Add Expense", icon: PlusCircle },
    { href: "/dashboard/bank-accounts/create", label: "Add Account", icon: Wallet },
    { href: "/dashboard/budgets/create", label: "Add Budget", icon: Target },
    { href: "/dashboard/loans/create", label: "Add Loan", icon: CreditCard },
  ]

  if (!user) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">FT</span>
              </div>
              <span className="font-bold text-lg hidden sm:inline-block">Finance Tracker</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navigationItems.slice(0, 3).map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}

            {/* Add buttons */}
            <div className="flex items-center space-x-1 ml-4 pl-4 border-l">
              {navigationItems.slice(3).map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
                    <item.icon className="h-4 w-4" />
                    <span className="hidden xl:inline">{item.label.replace("Add ", "")}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-2">
            {/* Visibility toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVisibility}
              className="hidden sm:flex"
              title={showAmounts ? "Hide amounts" : "Show amounts"}
            >
              {showAmounts ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* User info and logout - Desktop */}
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Welcome, {user.username}</span>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-6">
                  {/* User info */}
                  <div className="flex items-center space-x-2 pb-4 border-b">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium">{user.username}</span>
                  </div>

                  {/* Navigation items */}
                  <nav className="flex flex-col space-y-2">
                    {navigationItems.map((item) => (
                      <Link key={item.href} href={item.href} onClick={closeSheet}>
                        <Button variant="ghost" className="w-full justify-start space-x-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Button>
                      </Link>
                    ))}
                  </nav>

                  {/* Controls */}
                  <div className="flex flex-col space-y-2 pt-4 border-t">
                    <Button variant="ghost" onClick={toggleVisibility} className="justify-start space-x-2">
                      {showAmounts ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      <span>{showAmounts ? "Hide amounts" : "Show amounts"}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="justify-start space-x-2 text-destructive hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
