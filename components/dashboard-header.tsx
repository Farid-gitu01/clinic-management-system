"use client"

import { useAuth } from "@/lib/auth-context"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { useEffect, useState } from "react"

interface DashboardHeaderProps {
  title: string
  description?: string
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  const { profile } = useAuth()
  const [clinicName, setClinicName] = useState<string>("...")

  useEffect(() => {
    if (!profile?.clinicId) return
    
    // Fetch Clinic name dynamically for the header
    const nameRef = ref(database, `clinics/${profile.clinicId}/systemSettings/clinicName`)
    onValue(nameRef, (snapshot) => {
      setClinicName(snapshot.val() || "My Clinic")
    })
  }, [profile?.clinicId])

  return (
    <div className="bg-white border-b border-slate-200 p-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                {clinicName}
             </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{title}</h1>
          {description && <p className="text-slate-500 text-sm font-medium mt-1">{description}</p>}
        </div>
        
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Operator</p>
            <p className="text-sm font-bold text-slate-900">{profile?.fullName}</p>
          </div>
          <span className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-400">
            {profile?.role.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  )
}