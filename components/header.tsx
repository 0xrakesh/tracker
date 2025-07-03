"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, Plus, PieChart, CreditCard, Target, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth-context"
import { useVisibility } from "@/lib/visibility-context"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const { showAmounts, toggleVisibility } = useVisibility()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: PieChart },
    { name: "Insights", href: "/insights", icon: PieChart },
  ]

  const addActions = [
    { name: "Add Expense", href: "/dashboard/expenses/create", icon: Plus },
    { name: "Add Budget", href: "/dashboard/budgets/create", icon: Target },
    { name: "Add Loan", href: "/dashboard/loans/create", icon: CreditCard },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="mr-4 flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-lg">Finance Tracker</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <div className="flex items-center space-x-1 border-l pl-4 ml-4">
            {addActions.map((action) => (
              <Link key={action.name} href={action.href}>
                <Button variant="outline" size="sm" className="h-8 bg-transparent">
                  <action.icon className="h-4 w-4 mr-1" />
                  <span className="hidden lg:inline">{action.name}</span>
                  <span className="lg:hidden">{action.name.split(" ")[1]}</span>
                </Button>
              </Link>
            ))}
          </div>

          <Button variant="ghost" size="sm" onClick={toggleVisibility} className="h-8 w-8 p-0">
            {showAmounts ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>

          <ThemeToggle />

          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden ml-auto">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Menu</span>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Navigation</div>
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-2 text-sm py-2 px-2 rounded-md hover:bg-accent"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</div>
                  {addActions.map((action) => (
                    <Link
                      key={action.name}
                      href={action.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-2 text-sm py-2 px-2 rounded-md hover:bg-accent"
                    >
                      <action.icon className="h-4 w-4" />
                      <span>{action.name}</span>
                    </Link>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Button variant="ghost" size="sm" onClick={toggleVisibility} className="w-full justify-start">
                    {showAmounts ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                    {showAmounts ? "Hide Amounts" : "Show Amounts"}
                  </Button>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Theme</span>
                    <ThemeToggle />
                  </div>

                  <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start">
                    Logout
                  </Button>
                </div>

                {user && (
                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Signed in as <span className="font-medium">{user.username}</span>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
