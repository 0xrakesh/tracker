"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface VisibilityContextType {
  showAmounts: boolean
  toggleAmountsVisibility: () => void
}

const VisibilityContext = createContext<VisibilityContextType | undefined>(undefined)

export function VisibilityProvider({ children }: { children: ReactNode }) {
  const [showAmounts, setShowAmounts] = useState(false) // Default to hidden

  useEffect(() => {
    // Load preference from localStorage on mount
    const savedPreference = localStorage.getItem("showAmounts")
    if (savedPreference !== null) {
      setShowAmounts(savedPreference === "true")
    }
  }, [])

  const toggleAmountsVisibility = () => {
    setShowAmounts((prev) => {
      const newState = !prev
      localStorage.setItem("showAmounts", String(newState)) // Save preference
      return newState
    })
  }

  return (
    <VisibilityContext.Provider value={{ showAmounts, toggleAmountsVisibility }}>{children}</VisibilityContext.Provider>
  )
}

export function useVisibility() {
  const context = useContext(VisibilityContext)
  if (context === undefined) {
    throw new Error("useVisibility must be used within a VisibilityProvider")
  }
  return context
}
