"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Printer, ArrowLeft, Loader2, ShieldCheck, Mail, Phone, MapPin } from "lucide-react"

export default function AdminPrintPrescription() {
  const { id } = useParams()
  const { profile } = useAuth()
  const router = useRouter()
  const [appointment, setAppointment] = useState<any>(null)
  const [clinicInfo, setClinicInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.clinicId || !id) return

    // Fetch Appointment & Prescription
    const apptRef = ref(database, `clinics/${profile.clinicId}/appointments/${id}`)
    const clinicRef = ref(database, `clinics/${profile.clinicId}/clinicInfo`)

    onValue(clinicRef, (snap) => setClinicInfo(snap.val()))
    
    const unsubscribe = onValue(apptRef, (snapshot) => {
      setAppointment(snapshot.val())
      setLoading(false)
    })

    return () => unsubscribe()
  }, [profile?.clinicId, id])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    )
  }

  const rx = appointment?.prescription

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 print:bg-white print:p-0">
      
      {/* ADMIN UI CONTROLS - Hidden on Print */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()} className="rounded-xl border-slate-200">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="hidden md:block">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Admin View</p>
            <p className="text-sm font-bold">Prescription Review</p>
          </div>
        </div>
        
        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 px-8">
          <Printer className="w-4 h-4 mr-2" /> PRINT PRESCRIPTION
        </Button>
      </div>

      {/* PRESCRIPTION SHEET */}
      <div className="max-w-[850px] mx-auto bg-white shadow-xl p-10 md:p-16 min-h-[1100px] text-slate-900 print:shadow-none print:border-none print:m-0 print:p-8">
        
        {/* CLINIC LETTERHEAD */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-900 pb-8 mb-8 gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-blue-600">
              {clinicInfo?.clinicName || "MEDICAL CENTER"}
            </h1>
            <div className="flex flex-col gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
              <span className="flex items-center gap-2"><MapPin size={12}/> {clinicInfo?.address || "Clinic Address Not Set"}</span>
              <span className="flex items-center gap-2"><Phone size={12}/> {clinicInfo?.phone || "Contact Info"}</span>
              <span className="flex items-center gap-2"><Mail size={12}/> {clinicInfo?.email || "Email Address"}</span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
             <div className="bg-slate-900 text-white px-4 py-2 rounded-lg mb-2">
                <p className="text-[10px] font-black uppercase tracking-widest">Appointment ID</p>
                <p className="text-sm font-mono">{id?.toString().slice(-10).toUpperCase()}</p>
             </div>
             <p className="text-xs font-bold text-slate-400">DATE: {appointment?.date}</p>
          </div>
        </div>

        {/* PATIENT INFO BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 border-b border-slate-100 pb-8">
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Patient</p>
            <p className="text-md font-black uppercase leading-tight">{appointment?.patientName}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Age / Sex</p>
            <p className="text-md font-bold text-slate-700">{appointment?.patientAge || "N/A"}Y / {appointment?.patientGender || "N/A"}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Consultant</p>
            <p className="text-md font-bold text-slate-700">Dr. {appointment?.doctorName}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Weight</p>
            <p className="text-md font-bold text-slate-700">{rx?.vitals?.weight || "--"} kg</p>
          </div>
        </div>

        {/* MEDICAL CONTENT */}
        <div className="space-y-12">
          
          {/* Vitals / Findings */}
          <div className="flex flex-wrap gap-8 text-sm">
             <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-[10px] font-black text-slate-400 uppercase">Blood Pressure</p>
                <p className="font-bold">{rx?.vitals?.bp || "N/A"}</p>
             </div>
             <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-[10px] font-black text-slate-400 uppercase">Pulse Rate</p>
                <p className="font-bold">{rx?.vitals?.pulse || "N/A"} bpm</p>
             </div>
          </div>

          {/* Diagnosis Section */}
          <div>
            <h3 className="text-sm font-black uppercase text-slate-900 mb-4 flex items-center gap-2">
              <span className="p-1 bg-slate-100 rounded-md">1.0</span> DIAGNOSIS & COMPLAINTS
            </h3>
            <div className="pl-10 text-slate-800 whitespace-pre-wrap leading-relaxed border-l-2 border-slate-50 italic">
              {rx?.clinicalNotes || "Routine checkup and general consultation."}
            </div>
          </div>

          {/* Rx Section */}
          <div className="relative">
            <div className="absolute -left-2 -top-10 opacity-5 text-9xl font-black italic select-none">Rx</div>
            <h3 className="text-sm font-black uppercase text-slate-900 mb-4 flex items-center gap-2">
              <span className="p-1 bg-slate-100 rounded-md">2.0</span> MEDICATION PLAN
            </h3>
            
            <div className="pl-6 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-slate-900">
                    <th className="py-3 text-[11px] font-black uppercase">Medicine Name</th>
                    <th className="py-3 text-[11px] font-black uppercase">Dosage</th>
                    <th className="py-3 text-[11px] font-black uppercase">Duration</th>
                    <th className="py-3 text-[11px] font-black uppercase">Timing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rx?.medications?.map((med: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-5 font-black text-slate-900">
                        {med.name}
                        <p className="text-[10px] text-slate-400 font-normal normal-case italic">{med.instructions}</p>
                      </td>
                      <td className="py-5 font-bold text-slate-700">{med.dosage}</td>
                      <td className="py-5 text-slate-700 font-medium">{med.duration}</td>
                      <td className="py-5 text-[11px] font-black text-blue-600 uppercase tracking-tighter">{med.timing || "After Meal"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!rx?.medications && <p className="text-slate-400 italic mt-6 text-center">No medications listed in this prescription.</p>}
            </div>
          </div>
        </div>

        {/* FOOTER & SIGNATURE */}
        <div className="mt-32 pt-10 border-t-2 border-slate-100 flex justify-between items-end">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-widest border border-emerald-100 bg-emerald-50 px-3 py-1 rounded-full w-fit">
               <ShieldCheck size={14} /> Verified Digital Record
            </div>
            <div className="text-[9px] text-slate-400 uppercase tracking-widest leading-loose">
              <p>Clinic Reg No: {clinicInfo?.regNo || "MED-8829-X"}</p>
              <p>Prescribed At: {new Date(rx?.prescribedAt || Date.now()).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="h-16 flex items-center justify-center font-serif text-2xl italic text-slate-800 mb-2">
               {appointment?.doctorName}
            </div>
            <div className="w-64 border-b-2 border-slate-900 mx-auto"></div>
            <p className="mt-2 text-[10px] font-black uppercase tracking-widest">Medical Officer Signature</p>
          </div>
        </div>
      </div>

      {/* PRINT STYLES */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .print\:hidden { display: none !important; }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </div>
  )
}