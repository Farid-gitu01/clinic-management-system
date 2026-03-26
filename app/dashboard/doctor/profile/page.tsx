"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { database } from "@/lib/firebase"
import { ref, update, onValue } from "firebase/database"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ProtectedRoute } from "@/lib/protected-route"
import { 
  User, Mail, Phone, Stethoscope, Award, CheckCircle, 
  Loader2, Camera, MapPin, GraduationCap, Scale, 
  DollarSign, Clock, MapPinned, Briefcase, Edit3, ArrowLeft,
  Calendar, Globe, ShieldCheck, HeartPulse
} from "lucide-react"
import { toast } from "sonner"

export default function DoctorProfile() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [isEditing, setIsEditing] = useState(false) // Toggle between Card and Form
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    fullName: "",
    photoURL: "",
    gender: "",
    dob: "",
    phone: "",
    email: "",
    address: "",
    specialization: "",
    qualification: "",
    registrationNo: "",
    experience: "",
    previousWork: "",
    bio: "",
    consultationFee: "",
    availableDays: [] as string[],
    startTime: "09:00",
    endTime: "17:00",
  })

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  useEffect(() => {
    if (!user) return
    const doctorRef = ref(database, `users/${user.uid}`)
    const unsubscribe = onValue(doctorRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setFormData(prev => ({ ...prev, ...data, fullName: data.fullName || data.name || "", availableDays: data.availableDays || [] }))
      }
      setFetching(false)
    })
    return () => unsubscribe()
  }, [user])

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays?.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...(prev.availableDays || []), day]
    }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoURL: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile?.clinicId) return
    setLoading(true)

    try {
      const updatedData = { 
        ...formData, 
        name: formData.fullName,
        uid: user.uid,
        updatedAt: Date.now() 
      }

      const updates: any = {
        [`users/${user.uid}`]: updatedData,
        [`clinics/${profile.clinicId}/doctors/${user.uid}`]: updatedData
      }

      await update(ref(database), updates)
      toast.success("Profile updated successfully")
      setIsEditing(false) // Switch back to Card View
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      toast.error("Failed to sync profile")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#f8fafc] dark:bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Credentials...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute requiredRole="doctor">
      <div className="w-full min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <DashboardHeader 
                title={isEditing ? "Modify Credentials" : "Professional Profile"} 
                description={isEditing ? "Update your clinical records and availability." : "Your digital identity within the clinic ecosystem."} 
            />
            
            <Button 
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
                className={isEditing 
                    ? "rounded-xl border-slate-200 dark:border-slate-800 font-bold gap-2" 
                    : "bg-orange-500 hover:bg-orange-600 text-white rounded-xl gap-2 font-bold px-6 shadow-lg shadow-orange-500/20"}
            >
                {isEditing ? (
                    <><ArrowLeft className="w-4 h-4" /> Cancel</>
                ) : (
                    <><Edit3 className="w-4 h-4" /> Edit Profile</>
                )}
            </Button>
          </div>

          {!isEditing ? (
            /* --- PROFILE CARD DISPLAY (Default) --- */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
              
              {/* Left Column: ID Card Style */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden border-t-[12px] border-orange-500">
                  <CardContent className="pt-12 pb-10 text-center">
                    <div className="relative inline-block mb-6">
                       <div className="h-44 w-44 rounded-[3.5rem] bg-slate-100 dark:bg-slate-800 border-8 border-white dark:border-slate-950 shadow-xl overflow-hidden mx-auto">
                        {formData.photoURL ? (
                          <img src={formData.photoURL} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-orange-50">
                            <User className="h-20 w-20 text-orange-200" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 right-4 bg-emerald-500 p-2 rounded-2xl border-4 border-white dark:border-slate-900 shadow-lg">
                        <ShieldCheck className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black dark:text-white tracking-tight">Dr. {formData.fullName || "Practitioner"}</h2>
                      <p className="text-orange-500 font-black text-[10px] uppercase tracking-[0.2em]">{formData.specialization || "Clinical Staff"}</p>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 space-y-4">
                       <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400 justify-center bg-slate-50 dark:bg-slate-800/50 py-3 rounded-2xl mx-4">
                        <Mail className="w-4 h-4 text-orange-500" /> {formData.email}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400 justify-center">
                        <Phone className="w-4 h-4 text-orange-500" /> {formData.phone || "No Phone Linked"}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none bg-slate-900 dark:bg-orange-600 p-6 rounded-[2.5rem] text-white shadow-xl">
                    <div className="flex items-center gap-3 opacity-60 mb-2">
                        <HeartPulse className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Medical Registration</span>
                    </div>
                    <p className="text-lg font-black">{formData.registrationNo || "Pending Verfication"}</p>
                </Card>
              </div>

              {/* Right Column: Details & Availability */}
              <div className="lg:col-span-8 space-y-6">
                <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-[3rem] p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <DetailBlock label="Academic Qualification" value={formData.qualification} icon={<GraduationCap className="text-blue-500" />} />
                    <DetailBlock label="Clinical Experience" value={formData.experience ? `${formData.experience} Years` : ""} icon={<Briefcase className="text-orange-500" />} />
                    <DetailBlock label="Consultation Fee" value={formData.consultationFee ? `₹${formData.consultationFee}` : ""} icon={<DollarSign className="text-emerald-500" />} />
                    <DetailBlock label="Gender Identity" value={formData.gender} icon={<User className="text-purple-500" />} />
                  </div>

                  <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Weekly Rota</h4>
                        <div className="flex items-center gap-2 text-xs font-black text-orange-500">
                            <Clock className="w-3 h-3" /> {formData.startTime} - {formData.endTime}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {daysOfWeek.map(day => (
                        <div key={day} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.availableDays.includes(day) 
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-40'}`}>
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Official Contact Address</h4>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] flex gap-4">
                      <MapPin className="w-5 h-5 text-orange-500 shrink-0" />
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                        {formData.address || "Address not updated in clinical records."}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            /* --- EDITABLE FORM VIEW --- */
            <form onSubmit={handleSubmit} className="animate-in fade-in zoom-in-95 duration-300 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
              {/* Form Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                  <CardContent className="pt-10 pb-8 text-center">
                    <div className="relative inline-block group">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="h-44 w-44 rounded-[3rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-8 border-white dark:border-slate-900 shadow-2xl overflow-hidden cursor-pointer group-hover:opacity-80 transition-all"
                      >
                        {formData.photoURL ? (
                          <img src={formData.photoURL} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-20 w-20 text-slate-400" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white w-8 h-8" />
                        </div>
                      </div>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    </div>
                    <h3 className="mt-6 font-black text-xl tracking-tight dark:text-white">Editing Profile</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">UID: {user?.uid.slice(0,8)}...</p>
                  </CardContent>
                </Card>

                <div className="p-6 bg-orange-500/10 rounded-[2rem] border border-orange-500/20">
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Note
                    </p>
                    <p className="text-xs text-orange-700/80 leading-relaxed font-medium">
                        Changes to your specialization or registration number may require clinic administrator approval in some regions.
                    </p>
                </div>
              </div>

              {/* Editable Form Fields */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-8">
                  <div className="space-y-10">
                    {/* Personal */}
                    <section>
                        <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-6">1. Identity & Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Full Name" value={formData.fullName} onChange={(val: string) => setFormData({...formData, fullName: val})} />
                            <Field label="Email (Linked)" value={formData.email} disabled icon={<Mail size={14}/>} />
                            <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Gender</Label>
                            <select 
                                className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 text-sm focus:ring-2 ring-orange-500/20 outline-none dark:text-white font-bold"
                                value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}
                            >
                                <option value="" className="dark:bg-slate-900">Select Gender</option>
                                <option value="Male" className="dark:bg-slate-900">Male</option>
                                <option value="Female" className="dark:bg-slate-900">Female</option>
                                <option value="Other" className="dark:bg-slate-900">Other</option>
                            </select>
                            </div>
                            <Field label="Date of Birth" type="date" value={formData.dob} onChange={(val: string) => setFormData({...formData, dob: val})} />
                            <Field label="Mobile Number" value={formData.phone} onChange={(val: string) => setFormData({...formData, phone: val})} icon={<Phone size={14}/>} />
                        </div>
                    </section>

                    {/* Professional */}
                    <section>
                        <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-6">2. Credentials</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Primary Specialization" placeholder="e.g. Cardiologist" value={formData.specialization} onChange={(val: string) => setFormData({...formData, specialization: val})} icon={<Stethoscope size={14}/>} />
                            <Field label="Academic Qualification" placeholder="e.g. MBBS, MD" value={formData.qualification} onChange={(val: string) => setFormData({...formData, qualification: val})} icon={<GraduationCap size={14}/>} />
                            <Field label="Registration Number" value={formData.registrationNo} onChange={(val: string) => setFormData({...formData, registrationNo: val})} icon={<Scale size={14}/>} />
                            <Field label="Years of Experience" type="number" value={formData.experience} onChange={(val: string) => setFormData({...formData, experience: val})} />
                        </div>
                    </section>

                    {/* Availability */}
                    <section>
                        <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-6">3. Operations</h3>
                        <div className="space-y-6">
                            <div className="w-full md:w-1/2">
                                <Field label="Consultation Fee (₹)" type="number" value={formData.consultationFee} onChange={(val: string) => setFormData({...formData, consultationFee: val})} icon={<DollarSign size={14}/>} />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Service Days</Label>
                                <div className="flex flex-wrap gap-2">
                                    {daysOfWeek.map(day => (
                                    <button
                                        key={day} type="button"
                                        onClick={() => handleDayToggle(day)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.availableDays?.includes(day) ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                                    >
                                        {day}
                                    </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <Field label="Opening Time" type="time" value={formData.startTime} onChange={(val: string) => setFormData({...formData, startTime: val})} />
                                <Field label="Closing Time" type="time" value={formData.endTime} onChange={(val: string) => setFormData({...formData, endTime: val})} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Clinical Address</Label>
                                <Textarea 
                                    className="rounded-[1.5rem] min-h-[100px] border-slate-200 dark:border-slate-800 bg-transparent text-sm font-medium p-4 focus:ring-2 ring-orange-500/20"
                                    value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    placeholder="Enter full clinic or residential address..."
                                />
                            </div>
                        </div>
                    </section>
                  </div>

                  <div className="mt-12 flex justify-end gap-4">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setIsEditing(false)}
                        className="rounded-2xl px-8 font-bold text-slate-400"
                    >
                        Discard
                    </Button>
                    <Button 
                        type="submit" disabled={loading} 
                        className="rounded-2xl bg-slate-900 dark:bg-orange-600 hover:scale-105 px-10 py-6 h-auto font-black shadow-xl text-white transition-all uppercase tracking-widest text-[10px]"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : "Save Changes"}
                    </Button>
                  </div>
                </Card>
              </div>
            </form>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

/* Helper Components */
function Field({ label, value, onChange, type = "text", placeholder, disabled = false, icon }: any) {
  return (
    <div className="space-y-2">
      <Label className="text-[10px] font-black uppercase opacity-60 tracking-widest">{label}</Label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500/50">{icon}</div>}
        <Input 
          type={type} placeholder={placeholder} disabled={disabled} value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`rounded-xl h-12 border-slate-200 dark:border-slate-800 bg-transparent ${icon ? 'pl-11' : ''} focus:ring-2 ring-orange-500/20 outline-none dark:text-white font-bold text-sm`}
        />
      </div>
    </div>
  )
}

function DetailBlock({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
        {icon} {label}
      </div>
      <p className="text-md font-black dark:text-white border-b-2 border-slate-50 dark:border-slate-800 pb-2">
        {value || <span className="text-slate-300 dark:text-slate-700 font-normal italic">Not Specified</span>}
      </p>
    </div>
  )
}