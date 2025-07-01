"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignupPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const success = await signup(username, password)
      if (success) {
        router.push("/dashboard")
      } else {
        setError("Failed to create account. Username may already exist.")
      }
    } catch (err) {
      setError("An error occurred during signup")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-retro-light p-4">
      <div className="w-full max-w-md">
        <Card className="border-4 border-retro-dark shadow-retro">
          <CardHeader className="bg-retro-deep text-white">
            <CardTitle className="text-center text-2xl font-bold">FINANCE TRACKER</CardTitle>
            <CardDescription className="text-center text-white opacity-80">Create a new account</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 bg-white">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-retro-dark">
                    Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="border-2 border-retro-dark bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-retro-dark">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Choose a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-2 border-retro-dark bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-retro-dark">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="border-2 border-retro-dark bg-white"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-retro-medium hover:bg-retro-deep text-white border-2 border-retro-dark"
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t-2 border-retro-dark pt-4 bg-white">
            <p className="text-sm text-retro-dark">
              Already have an account?{" "}
              <Link href="/login" className="text-retro-medium hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
