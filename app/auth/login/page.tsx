"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ShieldCheck, ArrowLeft, Lock } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, loading, profile } = useAuth()
  
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({ email: "", password: "" })

  // Automatic redirect if user is already logged in
  useEffect(() => {
    if (!loading && isAuthenticated && profile?.role) {
      const redirectMap: Record<string, string> = {
        admin: "/dashboard/admin",
        doctor: "/dashboard/doctor",
        receptionist: "/dashboard/receptionist",
        patient: "/dashboard/patient"
      }
      const destination = redirectMap[profile.role as string] || "/dashboard"
      router.push(destination)
    }
  }, [isAuthenticated, loading, profile, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSigningIn(true)

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password)
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("The email or password you entered is incorrect.")
      } else {
        setError("Network error. Please verify your clinic's connection.")
      }
      setSigningIn(false)
    }
  }

  // Initial Loading State (Securing Session)
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          <ShieldCheck className="absolute text-emerald-600 w-6 h-6" />
        </div>
        <p className="mt-6 text-emerald-900 font-bold tracking-[0.2em] text-xs uppercase animate-pulse">
          Securing Session
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-6 font-sans">
      {/* Back to Home Link */}
      <Link 
        href="/" 
        className="mb-8 flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-sm font-bold uppercase tracking-wider"
      >
        <ArrowLeft size={16} /> Back to website
      </Link>

      <div className="w-full max-w-[450px]">
        <Card className="bg-white border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden">
          {/* Top Decorative Bar */}
          <div className="h-2 w-full bg-emerald-600" />
          
          <CardHeader className="text-center pt-12 pb-8 px-8">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Lock className="text-emerald-600 w-8 h-8" />
            </div>
            <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">
              Clinic <span className="text-emerald-600 uppercase">Portal</span>
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium text-base mt-2">
              Enterprise clinical access
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-12 px-8 md:px-12">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Success Message from Signup */}
              {searchParams.get("success") === "signup" && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] py-4 px-4 rounded-2xl text-center font-bold animate-in fade-in zoom-in duration-300 uppercase tracking-tight">
                  ✓ Registration successful! Please log in.
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] py-4 px-4 rounded-2xl text-center font-bold animate-shake uppercase tracking-tight">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-[0.1em]">
                  Medical ID / Email
                </Label>
                <Input
                  type="email"
                  placeholder="doctor@smartclinics.com"
                  className="bg-slate-50 border-slate-100 rounded-2xl h-14 text-slate-900 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all pl-4"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={signingIn}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.1em]">
                    Passkey
                  </Label>
                  <Link href="#" className="text-[11px] font-black text-emerald-600 hover:text-emerald-700 uppercase transition-colors">
                    Reset?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  className="bg-slate-50 border-slate-100 rounded-2xl h-14 text-slate-900 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all pl-4"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={signingIn}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={signingIn}
                className="w-full h-15 py-7 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl mt-4 transition-all shadow-xl shadow-emerald-100 uppercase tracking-widest group"
              >
                {signingIn ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <span className="flex items-center gap-2">
                    Enter Dashboard <ArrowLeft className="rotate-180 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>

              {/* Redirect to Signup/Registration */}
              <div className="text-center mt-10 pt-8 border-t border-slate-50">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  New Clinic or Patient?{" "}
                  <Link 
                    href="/auth/signup" 
                    className="text-emerald-600 hover:text-emerald-700 ml-1 border-b-2 border-emerald-100 hover:border-emerald-600 transition-all"
                  >
                    Apply for Access
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Compliance & Security Footer */}
        <div className="mt-8 flex justify-center gap-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-500"/> HIPAA Secure</span>
          <span className="flex items-center gap-1.5"><Lock size={12} className="text-emerald-500"/> 256-Bit SSL</span>
        </div>
      </div>
    </div>
  )
}