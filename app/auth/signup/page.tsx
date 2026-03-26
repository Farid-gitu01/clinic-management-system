"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createUserWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth"
import { auth, database } from "@/lib/firebase"
import { ref, set, onValue } from "firebase/database"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Hash, Loader2, UserCircle, ShieldCheck, ArrowLeft } from "lucide-react"

// 1. Create a separate component for the form content
function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [clinics, setClinics] = useState<{ id: string; name: string }[]>([])

  const [formData, setFormData] = useState({
    fullName: "",
    email: searchParams.get("email") || "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "admin",
    clinicId: searchParams.get("clinicId") || "",
  })

  useEffect(() => {
    const clinicsRef = ref(database, "clinics")
    const unsubscribe = onValue(clinicsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const list = Object.keys(data).map((key) => ({
          id: key,
          name: data[key].systemSettings?.clinicName || data[key].clinicInfo?.clinicName || "Unnamed Clinic",
        }))
        setClinics(list)
      }
    })
    return () => unsubscribe()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!formData.clinicId) return setError("Please select your clinic environment")
    setLoading(true)

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match")
      }

      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const uid = userCredential.user.uid

      const userPath = ref(database, `clinics/${formData.clinicId}/users/${uid}`)
      const userData = {
        uid: uid,
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        role: formData.role,
        status: "active",
        createdAt: new Date().toISOString(),
        clinicId: formData.clinicId,
      }
      
      await set(userPath, userData)

      if (formData.role === "admin") {
        const doctorPath = ref(database, `clinics/${formData.clinicId}/doctors/${uid}`)
        await set(doctorPath, {
          uid: uid,
          name: formData.fullName,
          email: formData.email,
          specialization: "Clinic Owner",
          experience: "0",
          isOwner: true
        })
      }

      const lookupPath = ref(database, `userLookup/${uid}`)
      await set(lookupPath, {
        clinicId: formData.clinicId,
        role: formData.role,
      })

      await firebaseSignOut(auth)
      router.push("/auth/login?success=signup")
    } catch (err: any) {
      setError(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-xs py-4 px-4 rounded-2xl text-center font-bold animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-wider flex items-center gap-2">
          <Hash size={14} className="text-blue-600" /> Clinic Environment
        </Label>
        <select
          name="clinicId"
          value={formData.clinicId}
          onChange={handleChange}
          className="w-full h-14 px-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer font-medium appearance-none"
          required
        >
          <option value="">Select your registered clinic</option>
          {clinics.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-wider">Full Legal Name</Label>
        <Input
          name="fullName"
          required
          onChange={handleChange}
          className="bg-slate-50 border-slate-100 rounded-2xl h-14 text-slate-900 focus:ring-blue-500/20 transition-all px-5"
          placeholder="e.g. Dr. Alexander Pierce"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-wider">Professional Email</Label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          required
          onChange={handleChange}
          className="bg-slate-50 border-slate-100 rounded-2xl h-14 text-slate-900 focus:ring-blue-500/20 transition-all px-5"
          placeholder="name@clinic.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-wider flex items-center gap-2">
            <ShieldCheck size={14} className="text-blue-600" /> Assigned Role
          </Label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full h-14 px-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none font-medium transition-all"
          >
            <option value="admin">Administrator</option>
            <option value="doctor">Medical Doctor</option>
            <option value="receptionist">Front Desk / Staff</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-wider">Contact Number</Label>
          <Input
            name="phone"
            required
            placeholder="+1 (555) 000-0000"
            onChange={handleChange}
            className="bg-slate-50 border-slate-100 rounded-2xl h-14 text-slate-900 focus:ring-blue-500/20 transition-all px-5"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-wider">Access Passkey</Label>
          <Input
            type="password"
            name="password"
            required
            onChange={handleChange}
            className="bg-slate-50 border-slate-100 rounded-2xl h-14 text-slate-900 focus:ring-blue-500/20 px-5"
            placeholder="••••••••"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-wider">Confirm Passkey</Label>
          <Input
            type="password"
            name="confirmPassword"
            required
            onChange={handleChange}
            className="bg-slate-50 border-slate-100 rounded-2xl h-14 text-slate-900 focus:ring-blue-500/20 px-5"
            placeholder="••••••••"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl mt-6 transition-all shadow-xl shadow-blue-100 uppercase tracking-[0.2em]"
      >
        {loading ? <Loader2 className="animate-spin" /> : "Finalize Registration"}
      </Button>
    </form>
  )
}

// 2. Main Page component wraps the form in Suspense
export default function SignupPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      <Link 
        href="/auth/login" 
        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-bold uppercase tracking-widest"
      >
        <ArrowLeft size={16} /> Back to Login
      </Link>

      <div className="w-full max-w-xl">
        <Card className="bg-white border-none shadow-[0_20px_60px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden">
          <div className="h-2 bg-blue-600 w-full" />
          
          <CardHeader className="text-center pt-10 pb-6 px-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <UserCircle className="text-blue-600 w-9 h-9" />
            </div>
            <CardTitle className="text-3xl font-black text-slate-900 tracking-tight uppercase">
              User <span className="text-blue-600">Onboarding</span>
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium text-base">
              Set up your professional clinical credentials
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-12 px-6 md:px-12">
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Environment...</p>
              </div>
            }>
              <SignupForm />
            </Suspense>

            <div className="flex flex-col md:flex-row items-center justify-between mt-8 pt-8 border-t border-slate-50 gap-4">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Clinic not listed?{" "}
                <Link href="/register-clinic" className="text-blue-600 hover:underline ml-1">
                  Register Entity
                </Link>
              </p>
              <div className="flex gap-4 text-[10px] text-slate-300 font-bold uppercase tracking-tighter">
                 <span>256-Bit Encrypted</span>
                 <span>ISO Certified</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}