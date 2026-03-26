"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { database } from "@/lib/firebase"
import { ref, push, set, onValue } from "firebase/database"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Calendar, Stethoscope, Clock, Loader2, ArrowLeft, ChevronRight, User } from "lucide-react"
import Link from "next/link"

export default function QuickBookPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [doctors, setDoctors] = useState<any[]>([])

  const [formData, setFormData] = useState({
    patientName: "",
    patientPhone: "",
    patientAge: "",
    patientGender: "male",
    doctorId: "",
    doctorName: "",
    date: new Date().toISOString().split('T')[0],
    time: "",
    reason: ""
  })

  useEffect(() => {
    if (!profile?.clinicId) return
    const doctorsRef = ref(database, `clinics/${profile.clinicId}/doctors`)
    
    return onValue(doctorsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const doctorsList = Object.entries(data).map(([id, details]: [string, any]) => ({
          uid: id,
          ...details
        }))
        setDoctors(doctorsList)
      }
    })
  }, [profile?.clinicId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.clinicId) return
    setLoading(true)

    try {
      const clinicPath = `clinics/${profile.clinicId}`
      const patientId = formData.patientPhone.replace(/\s+/g, '')
      
      await set(ref(database, `${clinicPath}/patients/${patientId}`), {
        fullName: formData.patientName,
        phone: formData.patientPhone,
        age: formData.patientAge,
        gender: formData.patientGender,
        lastVisited: Date.now()
      })

      const apptRef = push(ref(database, `${clinicPath}/appointments`))
      await set(apptRef, {
        uid: apptRef.key,
        patientId: patientId,
        patientName: formData.patientName,
        doctorId: formData.doctorId,
        doctorName: formData.doctorName,
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
        status: "scheduled",
        paymentStatus: "pending",
        createdAt: Date.now()
      })

      router.push("/dashboard/receptionist")
    } catch (error) {
      console.error(error)
      alert("Error booking appointment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-8 flex items-center gap-2">
            <Link href="/dashboard/receptionist" className="text-slate-400 hover:text-blue-600 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Quick Booking</span>
        </div>

        <Card className="bg-white border-none rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
          <CardHeader className="p-8 md:p-12 bg-white border-b border-slate-50 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-20 -mt-20 z-0 opacity-50" />
            
            <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-200">
                <Calendar className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none mb-2">
                  Quick <span className="text-blue-600">Entry</span>
                </CardTitle>
                <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest italic">
                  Instant Patient Onboarding & Scheduling
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                
                {/* SECTION 1: PATIENT */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <User className="w-5 h-5 text-blue-600" />
                    <h3 className="text-slate-900 text-xs font-black uppercase tracking-[0.2em]">Patient Records</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] text-slate-400 font-black uppercase ml-1">Full Name</Label>
                      <Input required className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:border-blue-500 transition-all text-slate-900" 
                        placeholder="John Smith" 
                        onChange={e => setFormData({...formData, patientName: e.target.value})} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[10px] text-slate-400 font-black uppercase ml-1">Primary Phone</Label>
                      <Input required className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:border-blue-500 transition-all text-slate-900" 
                        placeholder="+91 00000 00000" 
                        onChange={e => setFormData({...formData, patientPhone: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] text-slate-400 font-black uppercase ml-1">Age</Label>
                        <Input required type="number" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:border-blue-500 transition-all text-slate-900" 
                          placeholder="24"
                          onChange={e => setFormData({...formData, patientAge: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] text-slate-400 font-black uppercase ml-1">Gender</Label>
                        <select className="w-full h-14 bg-slate-50/50 border border-slate-100 rounded-2xl px-4 text-sm font-medium focus:border-blue-500 outline-none transition-all appearance-none text-slate-900"
                          onChange={e => setFormData({...formData, patientGender: e.target.value})}>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: APPOINTMENT */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                    <h3 className="text-slate-900 text-xs font-black uppercase tracking-[0.2em]">Assignment</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] text-slate-400 font-black uppercase ml-1">Select Physician</Label>
                      <select required className="w-full h-14 bg-slate-50/50 border border-slate-100 rounded-2xl px-4 text-sm font-medium focus:border-blue-500 outline-none transition-all text-slate-900"
                        value={formData.doctorId}
                        onChange={e => {
                          const doc = doctors.find(d => d.uid === e.target.value)
                          const selectedName = doc?.fullName || doc?.name || ""
                          setFormData({...formData, doctorId: e.target.value, doctorName: selectedName})
                        }}>
                        <option value="">Choose available doctor</option>
                        {doctors.map(doc => (
                          <option key={doc.uid} value={doc.uid}>
                            Dr. {doc.fullName || doc.name || "Specialist"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] text-slate-400 font-black uppercase ml-1 flex items-center gap-1">
                            <Clock size={10}/> Slot Time
                        </Label>
                        <Input required type="time" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:border-blue-500 transition-all text-slate-900" 
                          onChange={e => setFormData({...formData, time: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] text-slate-400 font-black uppercase ml-1 flex items-center gap-1">
                            <Calendar size={10}/> Visit Date
                        </Label>
                        <Input required type="date" value={formData.date} className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:border-blue-500 transition-all text-slate-900" 
                          onChange={e => setFormData({...formData, date: e.target.value})} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] text-slate-400 font-black uppercase ml-1">Reason / Symptoms</Label>
                      <Input className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:border-blue-500 transition-all text-slate-900" 
                        placeholder="e.g. Health checkup, Vaccination" 
                        onChange={e => setFormData({...formData, reason: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest max-w-xs text-center md:text-left leading-relaxed">
                  Submitting this form will automatically generate a new patient ID and link the visit record.
                </p>
                <Button 
                  disabled={loading || !formData.doctorId}
                  className="w-full md:w-[300px] h-16 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-100 transition-all text-sm tracking-[0.2em] disabled:bg-slate-200"
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : "AUTHORIZE BOOKING"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.5em]">SmartClinics v2.0 Platform</p>
        </div>
      </div>
    </div>
  )
}