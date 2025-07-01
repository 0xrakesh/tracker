"use client"

import { User, LogOut, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={user ? "/dashboard" : "/"} className="text-2xl font-bold tracking-wider">
          FINANCE TRACKER
        </Link>

        <div className="flex items-center gap-4">
          {user && (
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
            </nav>
          )}

          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-4">
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
