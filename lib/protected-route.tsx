"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useAuth, type UserRole } from "./auth-context"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, loading, hasRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    if (requiredRole && !hasRole(requiredRole)) {
      router.push("/dashboard")
      return
    }
  }, [isAuthenticated, loading, requiredRole, hasRole, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return null
  }

  return <>{children}</>
}
