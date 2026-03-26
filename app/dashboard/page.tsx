"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"
import { Loader2, Activity } from "lucide-react"

export default function DashboardRoot() {
  const router = useRouter()
  const { profile, loading, user } = useAuth()

  useEffect(() => {
    // 1. Wait for Auth to finish loading
    if (loading) return

    // 2. If no user or profile is found, redirect to Landing Page (/)
    if (!user || !profile) {
      router.push("/") 
      return
    }

    // 3. Role-based redirection
    const timeout = setTimeout(() => {
      switch (profile.role) {
        case "admin":
          router.push("/dashboard/admin")
          break
        case "doctor":
          router.push("/dashboard/doctor")
          break
        case "patient":
          router.push("/dashboard/patient")
          break
        default:
          router.push("/") // Fallback to landing page
      }
    }, 500) // Slight delay for a smoother visual transition

    return () => clearTimeout(timeout)
  }, [profile, loading, user, router])

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#f8fafc] dark:bg-[#020617]">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
      
      <div className="relative z-10 text-center space-y-6">
        <div className="relative inline-flex items-center justify-center">
          <div className="h-20 w-20 rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center animate-in zoom-in duration-500">
            <Activity className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <Loader2 className="absolute -bottom-2 -right-2 h-8 w-8 text-primary/40 animate-spin" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Preparing Workspace
          </h2>
          <p className="text-sm text-muted-foreground font-medium animate-pulse">
            Securely routing your session...
          </p>
        </div>
      </div>
    </div>
  )
}