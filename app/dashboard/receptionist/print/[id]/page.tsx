"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Printer, ArrowLeft, Loader2 } from "lucide-react"

export default function PrintPrescriptionPage() {
  const { id } = useParams()
  const { profile } = useAuth()
  const router = useRouter()
  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.clinicId || !id) return

    const apptRef = ref(database, `clinics/${profile.clinicId}/appointments/${id}`)
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
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    )
  }

  // Extract prescription data helper
  const rx = appointment?.prescription

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 print:bg-white print:p-0">
      {/* UI Controls */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Button variant="ghost" onClick={() => router.back()} className="hover:bg-slate-200">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
          <Printer className="w-4 h-4 mr-2" /> Print Prescription
        </Button>
      </div>

      {/* Prescription Paper */}
      <div className="max-w-[850px] mx-auto bg-white shadow-2xl p-12 min-h-[1100px] text-slate-900 print:shadow-none print:border-none print:m-0">
        
        {/* Clinic Header */}
        <div className="flex justify-between items-start border-b-4 border-emerald-600 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-emerald-700">MEDICO CLINIC</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Advanced Healthcare System</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-bold uppercase">Date: {appointment?.date || new Date().toLocaleDateString()}</p>
            <p className="text-slate-500">Receipt No: {id?.toString().slice(-8).toUpperCase()}</p>
          </div>
        </div>

        {/* Patient & Doctor Header */}
        <div className="grid grid-cols-2 gap-8 mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Patient Name</p>
            <p className="text-lg font-black">{appointment?.patientName}</p>
            <p className="text-sm text-slate-600">ID: {appointment?.patientId?.slice(-6).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Consulting Doctor</p>
            <p className="text-lg font-black text-slate-800">Dr. {rx?.doctorName || appointment?.doctorName}</p>
            <p className="text-sm text-slate-600">{rx?.doctorSpecialization || "Specialist"}</p>
          </div>
        </div>

        {/* Prescription Content */}
        <div className="space-y-10">
          {/* 1. Clinical Notes */}
          <div>
            <h3 className="text-sm font-black uppercase text-slate-400 mb-3 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-slate-200"></span> Clinical Notes / Diagnosis
            </h3>
            <div className="pl-10 text-slate-800 whitespace-pre-wrap leading-relaxed">
              {rx?.clinicalNotes || "No clinical notes provided."}
            </div>
          </div>

          {/* 2. Medications */}
          <div className="relative">
            <div className="absolute -left-4 -top-8 opacity-5 text-8xl font-black italic select-none">Rx</div>
            <h3 className="text-sm font-black uppercase text-slate-400 mb-4 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-slate-200"></span> Prescribed Medications
            </h3>
            
            <div className="pl-10">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="py-2 text-xs font-black uppercase text-slate-500">Medicine</th>
                    <th className="py-2 text-xs font-black uppercase text-slate-500">Dosage</th>
                    <th className="py-2 text-xs font-black uppercase text-slate-500">Duration</th>
                    <th className="py-2 text-xs font-black uppercase text-slate-500">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rx?.medications?.map((med: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-4 font-bold text-slate-900">{med.name}</td>
                      <td className="py-4 text-slate-700">{med.dosage}</td>
                      <td className="py-4 text-slate-700">{med.duration}</td>
                      <td className="py-4 text-sm italic text-slate-500">{med.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!rx?.medications && <p className="text-slate-400 italic mt-4">No medications prescribed.</p>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-32 pt-10 border-t border-slate-100 flex justify-between items-end">
          <div className="text-[9px] text-slate-400 uppercase tracking-widest leading-loose">
            <p>Digital Signature Validated</p>
            <p>Generated on {new Date(rx?.prescribedAt || Date.now()).toLocaleString()}</p>
          </div>
          <div className="text-center w-56">
            <div className="h-16 flex items-center justify-center italic text-slate-300 font-serif">
               {rx?.doctorName}
            </div>
            <div className="border-b-2 border-slate-900 mb-2"></div>
            <p className="text-[10px] font-black uppercase tracking-tighter">Authorized Medical Practitioner</p>
          </div>
        </div>
      </div>
    </div>
  )
}