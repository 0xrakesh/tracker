"use client"

import { User, LogOut } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-retro-header text-retro-header-text p-4 border-b-4 border-retro-border">
      <div className="container mx-auto flex justify-between items-center">
        <Link href={user ? "/dashboard" : "/"} className="text-2xl font-bold tracking-wider font-retro">
          FINANCE TRACKER
        </Link>
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-retro-button px-3 py-1 rounded">
              <User className="h-5 w-5" />
              <span className="font-medium">{user.username}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-retro-header-text hover:bg-retro-button rounded"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="bg-retro-button hover:bg-retro-button-hover text-retro-button-text px-4 py-2 rounded shadow-retro"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-retro-button hover:bg-retro-button-hover text-retro-button-text px-4 py-2 rounded shadow-retro"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
