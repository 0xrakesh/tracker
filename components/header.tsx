"use client"

import {
  User,
  LogOut,
  BarChart3,
  Eye,
  EyeOff,
  Menu,
  PlusCircle,
  Wallet,
  PiggyBank,
  ReceiptText,
  Landmark,
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useVisibility } from "@/lib/visibility-context"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Header() {
  const { user, logout } = useAuth()
  const { showAmounts, toggleAmountsVisibility } = useVisibility()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={user ? "/dashboard" : "/"} className="text-xl sm:text-2xl font-bold tracking-wider">
          FINANCE TRACKER
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {user && (
            <>
              {/* Mobile Navigation (Hamburger Menu) */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Menu className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[250px] sm:w-[300px] p-4 pt-10">
                    <nav className="flex flex-col gap-2">
                      <Link href="/dashboard">
                        <Button
                          variant={pathname === "/dashboard" ? "default" : "ghost"}
                          className="w-full justify-start"
                        >
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/insights">
                        <Button
                          variant={pathname === "/insights" ? "default" : "ghost"}
                          className="w-full justify-start"
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Insights
                        </Button>
                      </Link>
                      <div className="border-t my-2" />
                      <span className="text-sm font-semibold text-muted-foreground px-3 py-1">Add New</span>
                      <Link href="/dashboard/expenses/create">
                        <Button variant="ghost" className="w-full justify-start">
                          <ReceiptText className="h-4 w-4 mr-2" />
                          Add Expense
                        </Button>
                      </Link>
                      <Link href="/dashboard/budgets/create">
                        <Button variant="ghost" className="w-full justify-start">
                          <PiggyBank className="h-4 w-4 mr-2" />
                          Add Budget
                        </Button>
                      </Link>
                      <Link href="/dashboard/loans/create">
                        <Button variant="ghost" className="w-full justify-start">
                          <Wallet className="h-4 w-4 mr-2" />
                          Add Loan
                        </Button>
                      </Link>
                      <Link href="/dashboard/bank-accounts/create">
                        <Button variant="ghost" className="w-full justify-start">
                          <Landmark className="h-4 w-4 mr-2" />
                          Add Bank Account
                        </Button>
                      </Link>
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop Navigation (Direct Links + Dropdown for Add) */}
              <nav className="hidden md:flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant={pathname === "/dashboard" ? "default" : "ghost"} size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/insights">
                  <Button variant={pathname === "/insights" ? "default" : "ghost"} size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Insights
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add New
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/expenses/create">
                        <ReceiptText className="h-4 w-4 mr-2" />
                        Add Expense
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/budgets/create">
                        <PiggyBank className="h-4 w-4 mr-2" />
                        Add Budget
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/loans/create">
                        <Wallet className="h-4 w-4 mr-2" />
                        Add Loan
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/bank-accounts/create">
                        <Landmark className="h-4 w-4 mr-2" />
                        Add Bank Account
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </nav>
            </>
          )}

          {/* Amount Visibility Toggle */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleAmountsVisibility}
              className="h-9 w-9"
              title={showAmounts ? "Hide amounts" : "Show amounts"}
            >
              {showAmounts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="sr-only">{showAmounts ? "Hide amounts" : "Show amounts"}</span>
            </Button>
          )}

          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-primary px-3 py-1 rounded text-primary-foreground">
                <User className="h-4 w-4" />
                <span className="font-medium hidden sm:inline">{user.username}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="default">Login</Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
