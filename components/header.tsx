"use client"

import { User, LogOut } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-retro-deep text-white p-4 border-b-4 border-retro-dark">
      <div className="container mx-auto flex justify-between items-center">
        <Link href={user ? "/dashboard" : "/"} className="text-2xl font-bold tracking-wider font-retro">
          FINANCE TRACKER
        </Link>
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-retro-medium px-3 py-1 rounded">
              <User className="h-5 w-5" />
              <span className="font-medium">{user.username}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-white hover:bg-retro-medium rounded">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="bg-retro-medium hover:bg-retro-dark text-white px-4 py-2 rounded shadow-retro"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-retro-medium hover:bg-retro-dark text-white px-4 py-2 rounded shadow-retro"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
