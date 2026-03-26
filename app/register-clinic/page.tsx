"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { database } from "@/lib/firebase" 
import { ref, push, set } from "firebase/database"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Loader2, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  Clock, 
  FileBadge, 
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Star
} from "lucide-react"

export default function RegisterClinic() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    // Basic Info
    clinicName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    password: "",
    confirmPassword: "",
    // Clinic Details
    clinicType: "General Practice",
    openingTime: "09:00 AM",
    closingTime: "08:00 PM",
    emergencyPhone: "",
    logoUrl: "",
    // Legal
    taxId: "",
    medRegNumber: "",
    licenseNumber: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!")
      return
    }
    setLoading(true)

    try {
      const clinicsRef = ref(database, 'clinics')
      const newClinicRef = push(clinicsRef)
      const clinicId = newClinicRef.key

      const newClinicData = {
        clinicInfo: {
          clinicName: formData.clinicName,
          ownerName: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          clinicType: formData.clinicType,
          timings: `${formData.openingTime} - ${formData.closingTime}`,
          emergencyPhone: formData.emergencyPhone || "N/A",
          logoUrl: formData.logoUrl || "default_logo_url",
          legal: {
            taxId: formData.taxId || "Pending",
            medRegNumber: formData.medRegNumber || "Pending",
            licenseNumber: formData.licenseNumber || "Pending"
          },
          createdAt: new Date().toISOString(),
        },
        // Isolated buckets
        users: {}, 
        doctors: {}, 
        receptionists: {},
        appointments: {},
        payments: {}
      }

      await set(newClinicRef, newClinicData)
      setSuccess(true)

      setTimeout(() => {
        // Redirecting to signup with pre-filled clinic info and password
        router.push(`/auth/signup?clinicId=${clinicId}&email=${encodeURIComponent(formData.email)}&role=admin`)
      }, 2500)

    } catch (error) {
      console.error("Firebase Error:", error)
      alert("Failed to register. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
        <div className="animate-in fade-in zoom-in duration-500 max-w-sm">
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-amber-200">
            <CheckCircle2 className="w-12 h-12 text-amber-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3 uppercase tracking-tighter">Genesis Complete</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Your golden workspace is being provisioned. Redirecting to your administrative profile...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center justify-center font-sans">
      
      {/* Golden Progress Tracker */}
      <div className="flex items-center gap-3 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500 border-2 
              ${step >= i ? 'bg-amber-500 border-amber-600 text-white shadow-lg shadow-amber-200' : 'bg-white border-slate-200 text-slate-400'}`}>
              {i}
            </div>
            {i < 3 && <div className={`h-1 w-8 md:w-16 rounded-full ${step > i ? 'bg-amber-500' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <div className="max-w-3xl w-full bg-white p-6 md:p-12 rounded-[3rem] shadow-[0_20px_70px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden">
        {/* Decorative Golden Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16" />
        
        <div className="mb-10 relative">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
            {step === 1 && <Building2 className="text-amber-500" />}
            {step === 2 && <Star className="text-amber-500" />}
            {step === 3 && <ShieldCheck className="text-amber-500" />}
            {step === 1 ? "Basic Information" : step === 2 ? "Clinic Details" : "Legal Compliance"}
          </h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
            Step {step} of 3 — {step === 1 ? "Identity & Access" : step === 2 ? "Operating Modules" : "Official Verification"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* STEP 1: Basic Clinic Information */}
          {step === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase font-black text-slate-400 ml-1">Clinic Name *</Label>
                  <Input required className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:ring-amber-500/20" placeholder="Elite Wellness Center"
                    onChange={(e) => setFormData({...formData, clinicName: e.target.value})} value={formData.clinicName} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase font-black text-slate-400 ml-1">Owner Name *</Label>
                  <Input required className="h-14 rounded-2xl border-slate-100 bg-slate-50" placeholder="Dr. Julian Vane"
                    onChange={(e) => setFormData({...formData, ownerName: e.target.value})} value={formData.ownerName} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase font-black text-slate-400 ml-1">Official Email *</Label>
                  <Input required type="email" className="h-14 rounded-2xl border-slate-100 bg-slate-50" placeholder="admin@clinic.com"
                    onChange={(e) => setFormData({...formData, email: e.target.value})} value={formData.email} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase font-black text-slate-400 ml-1">Contact Number *</Label>
                  <Input required className="h-14 rounded-2xl border-slate-100 bg-slate-50" placeholder="+1 (555) 000-0000"
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} value={formData.phone} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-black text-slate-400 ml-1">Full Clinic Address *</Label>
                <Input required className="h-14 rounded-2xl border-slate-100 bg-slate-50" placeholder="123 Medical Plaza, Suite 400"
                  onChange={(e) => setFormData({...formData, address: e.target.value})} value={formData.address} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase font-black text-slate-400 ml-1">City *</Label>
                  <Input required className="h-14 rounded-2xl border-slate-100 bg-slate-50" onChange={(e) => setFormData({...formData, city: e.target.value})} value={formData.city} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase font-black text-slate-400 ml-1">State *</Label>
                  <Input required className="h-14 rounded-2xl border-slate-100 bg-slate-50" onChange={(e) => setFormData({...formData, state: e.target.value})} value={formData.state} />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label className="text-[11px] uppercase font-black text-slate-400 ml-1">Pincode *</Label>
                  <Input required className="h-14 rounded-2xl border-slate-100 bg-slate-50" onChange={(e) => setFormData({...formData, pincode: e.target.value})} value={formData.pincode} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase font-black text-slate-400 ml-1">Access Password *</Label>
                  <Input required type="password" placeholder="••••••••" className="h-14 rounded-2xl border-slate-100 bg-slate-50"
                    onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase font-black text-slate-400 ml-1">Confirm Password *</Label>
                  <Input required type="password" placeholder="••••••••" className="h-14 rounded-2xl border-slate-100 bg-slate-50"
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
                </div>
              </div>

              <Button type="button" onClick={() => setStep(2)} className="w-full h-16 bg-amber-500 hover:bg-amber-600 text-white rounded-[1.2rem] font-black uppercase tracking-widest shadow-xl shadow-amber-100 transition-all">
                Continue to Details <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          )}

          {/* STEP 2: Clinic Details */}
          {step === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase font-black text-slate-400 ml-1">Clinic Type</Label>
                  <Select onValueChange={(val) => setFormData({...formData, clinicType: val})} defaultValue={formData.clinicType}>
                    <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Practice">General Practice</SelectItem>
                      <SelectItem value="Dental">Dental Clinic</SelectItem>
                      <SelectItem value="Pediatric">Pediatric</SelectItem>
                      <SelectItem value="Diagnostic">Diagnostic Center</SelectItem>
                      <SelectItem value="Specialty Care">Specialty Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase font-black text-slate-400 ml-1">Emergency Contact (Optional)</Label>
                  <Input className="h-14 rounded-2xl border-slate-100 bg-slate-50" placeholder="24/7 Support No."
                    onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})} value={formData.emergencyPhone} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase font-black text-slate-400 ml-1 flex items-center gap-1"><Clock size={12}/> Opening</Label>
                  <Input type="time" className="h-14 rounded-2xl border-slate-100 bg-slate-50" onChange={(e) => setFormData({...formData, openingTime: e.target.value})} value={formData.openingTime} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase font-black text-slate-400 ml-1 flex items-center gap-1"><Clock size={12}/> Closing</Label>
                  <Input type="time" className="h-14 rounded-2xl border-slate-100 bg-slate-50" onChange={(e) => setFormData({...formData, closingTime: e.target.value})} value={formData.closingTime} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-black text-slate-400 ml-1">Clinic Logo URL (Optional)</Label>
                <Input className="h-14 rounded-2xl border-slate-100 bg-slate-50" placeholder="https://cloud.com/logo.png"
                  onChange={(e) => setFormData({...formData, logoUrl: e.target.value})} value={formData.logoUrl} />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-16 rounded-[1.2rem] border-slate-200 text-slate-500 font-bold uppercase tracking-widest hover:bg-slate-50">
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
                <Button type="button" onClick={() => setStep(3)} className="flex-[2] h-16 bg-amber-500 hover:bg-amber-600 text-white rounded-[1.2rem] font-black uppercase tracking-widest shadow-xl shadow-amber-100">
                  Final Step <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Legal / Compliance */}
          {step === 3 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-black text-slate-400 ml-1 flex items-center gap-2">
                  <FileBadge className="w-3 h-3 text-amber-500" /> Tax ID (GST/VAT) — Optional
                </Label>
                <Input className="h-14 rounded-2xl border-slate-100 bg-slate-50" placeholder="Registration Tax Number"
                  onChange={(e) => setFormData({...formData, taxId: e.target.value})} value={formData.taxId} />
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-black text-slate-400 ml-1 flex items-center gap-2">
                  <Star className="w-3 h-3 text-amber-500" /> Medical Registration Number — Optional
                </Label>
                <Input className="h-14 rounded-2xl border-slate-100 bg-slate-50" placeholder="State/National Med Council No."
                  onChange={(e) => setFormData({...formData, medRegNumber: e.target.value})} value={formData.medRegNumber} />
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-black text-slate-400 ml-1 flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-amber-500" /> Clinic License Number — Optional
                </Label>
                <Input className="h-14 rounded-2xl border-slate-100 bg-slate-50" placeholder="Local Health Authority License"
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} value={formData.licenseNumber} />
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <p className="text-[10px] text-amber-700 font-bold leading-tight uppercase tracking-tighter">
                  By clicking register, you agree to create an isolated clinical database. You will be redirected to complete your primary administrator profile.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1 h-16 rounded-[1.2rem] border-slate-200 text-slate-500 font-bold uppercase tracking-widest hover:bg-slate-50">
                   Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-[2] h-16 bg-slate-900 hover:bg-black text-white rounded-[1.2rem] font-black uppercase tracking-widest shadow-2xl transition-all">
                  {loading ? <Loader2 className="animate-spin" /> : "Authorize Registration"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
      
      <p className="mt-8 text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
        Premium Clinical Cloud Architecture
      </p>
    </div>
  )
}