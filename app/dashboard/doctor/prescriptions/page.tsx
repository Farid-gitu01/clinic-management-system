"use client"

import { useEffect, useState } from "react"
import { database } from "@/lib/firebase"
import { ref, update, onValue } from "firebase/database"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/lib/protected-route"
import { 
  Printer, 
  Trash2, 
  CheckCircle,
  X,
  Loader2,
  User,
  Plus,
  Stethoscope,
  Edit3,
  MapPin,
  Phone,
  Pill,
  FileText
} from "lucide-react"
import { toast } from "sonner"

interface Medication {
  name: string
  dosage: string
  duration: string
  instructions: string
}

export default function PrescriptionModule() {
  const { profile } = useAuth()
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", dosage: "", duration: "", instructions: "" }
  ])
  const [clinicalNotes, setClinicalNotes] = useState("")

  useEffect(() => {
    if (!profile?.clinicId) return
    
    // Listen for "completed" appointments (vitals done, but no Rx authorized yet)
    const appointmentsRef = ref(database, `clinics/${profile.clinicId}/appointments`)
    const unsubscribe = onValue(appointmentsRef, (snapshot) => {
      setLoading(true)
      if (snapshot.exists()) {
        const data = snapshot.val()
        const completed = Object.entries(data)
          .map(([key, value]: [string, any]) => ({ id: key, ...value }))
          .filter(apt => apt.status === "completed") 
          .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
        setPatients(completed)
      } else {
        setPatients([])
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [profile?.clinicId])

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", duration: "", instructions: "" }])
  }

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index))
    }
  }

  const handleSavePrescription = async () => {
    if (!selectedPatient || !profile?.clinicId) return

    const validMeds = medications.filter(m => m.name.trim() !== "")
    if (validMeds.length === 0 && clinicalNotes.trim() === "") {
      toast.error("Please add medications or notes.")
      return
    }

    setIsSaving(true)
    try {
      const rxData = {
        medications: validMeds,
        clinicalNotes: clinicalNotes.trim(),
        prescribedAt: Date.now(),
        doctorName: profile?.fullName || "Doctor",
        doctorSpecialization: profile?.specialization || "General Physician",
        clinicName: profile?.clinicName || "Healthcare Center"
      }

      const updates: any = {}
      updates[`clinics/${profile.clinicId}/appointments/${selectedPatient.id}/prescription`] = rxData
      updates[`clinics/${profile.clinicId}/appointments/${selectedPatient.id}/hasPrescription`] = true
      updates[`clinics/${profile.clinicId}/appointments/${selectedPatient.id}/updatedAt`] = Date.now()
      
      // CRITICAL: Change status so it moves to Receptionist Billing Desk
      updates[`clinics/${profile.clinicId}/appointments/${selectedPatient.id}/status`] = "ready_for_billing"

      await update(ref(database), updates)
      toast.success("Clinical Record Authorized & Sent to Billing")
      
      // Clear selection so the UI resets
      setSelectedPatient(null)
      setIsEditing(false)
    } catch (error) {
      toast.error("Database error.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProtectedRoute requiredRole="doctor">
      <div className="w-full min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-4 md:p-8">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            .no-print, button, nav, .sidebar-queue { display: none !important; }
            body { background: white !important; margin: 0; padding: 0; }
            #printable-rx {
              position: absolute; top: 0; left: 0; width: 100% !important;
              margin: 0 !important; padding: 0 !important; border: none !important;
              box-shadow: none !important; visibility: visible !important;
            }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        `}} />

        <div className="max-w-7xl mx-auto space-y-8 no-print">
          <DashboardHeader title="Doctor Console" description="Authorize Medical Records" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-3 space-y-4 max-h-[80vh] overflow-y-auto pr-2 sidebar-queue">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Patient Queue</h3>
              {loading ? <div className="p-4"><Loader2 className="animate-spin text-indigo-500" /></div> : 
                patients.map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => {
                    setSelectedPatient(p)
                    setIsEditing(false)
                    setMedications(p.prescription?.medications || [{ name: "", dosage: "", duration: "", instructions: "" }])
                    setClinicalNotes(p.prescription?.clinicalNotes || "")
                  }}
                  className={`cursor-pointer p-4 rounded-3xl border transition-all ${
                    selectedPatient?.id === p.id 
                    ? 'bg-indigo-600 border-indigo-600 shadow-lg text-white' 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-300'
                  }`}
                >
                  <p className="font-bold text-sm truncate">{p.patientName}</p>
                  <p className={`text-[9px] font-bold uppercase mt-1 ${selectedPatient?.id === p.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {p.id.slice(-6)} • {p.disease || "Consultation"}
                  </p>
                </div>
              ))}
            </div>

            <div className="lg:col-span-9">
              {selectedPatient ? (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900 text-white p-6 rounded-[2.5rem]">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center"><User /></div>
                        <div>
                            <h2 className="text-xl font-black uppercase">{selectedPatient.patientName}</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Age: {selectedPatient.age} • {selectedPatient.gender}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)} className="text-slate-500 hover:text-white"><X /></Button>
                  </div>

                  <Card className="border-none shadow-2xl rounded-[3rem] bg-white dark:bg-slate-900">
                      <CardContent className="p-8 space-y-8">
                          <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Advice & Diagnosis</label>
                              <textarea 
                                  className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[120px]"
                                  value={clinicalNotes}
                                  onChange={(e) => setClinicalNotes(e.target.value)}
                                  placeholder="Enter clinical notes..."
                              />
                          </div>

                          <div className="space-y-4">
                              <div className="flex justify-between items-center px-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Drug Regimen</label>
                                  <Button size="sm" variant="ghost" onClick={addMedication} className="text-indigo-600 font-black uppercase text-[10px]"><Plus className="h-3 w-3 mr-1" /> Add Medicine</Button>
                              </div>
                              {medications.map((med, index) => (
                                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                      <input placeholder="Drug Name" className="bg-white dark:bg-slate-900 p-2.5 rounded-xl text-xs font-bold outline-none border border-slate-100" value={med.name} onChange={(e) => { const m = [...medications]; m[index].name = e.target.value; setMedications(m); }} />
                                      <input placeholder="Dosage" className="bg-white dark:bg-slate-900 p-2.5 rounded-xl text-xs font-bold outline-none border border-slate-100" value={med.dosage} onChange={(e) => { const m = [...medications]; m[index].dosage = e.target.value; setMedications(m); }} />
                                      <input placeholder="Duration" className="bg-white dark:bg-slate-900 p-2.5 rounded-xl text-xs font-bold outline-none border border-slate-100" value={med.duration} onChange={(e) => { const m = [...medications]; m[index].duration = e.target.value; setMedications(m); }} />
                                      <div className="flex gap-2">
                                          <input placeholder="Instructions" className="flex-1 bg-white dark:bg-slate-900 p-2.5 rounded-xl text-xs outline-none border border-slate-100" value={med.instructions} onChange={(e) => { const m = [...medications]; m[index].instructions = e.target.value; setMedications(m); }} />
                                          <button onClick={() => removeMedication(index)} className="text-rose-500"><Trash2 className="h-4 w-4" /></button>
                                      </div>
                                  </div>
                              ))}
                          </div>

                          <Button onClick={handleSavePrescription} disabled={isSaving} className="w-full bg-indigo-600 h-16 rounded-2xl font-black uppercase tracking-widest text-[11px]">
                              {isSaving ? <Loader2 className="animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                              Authorize Clinical Record
                          </Button>
                      </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[4rem] text-center p-12 bg-white/50">
                    <div className="h-24 w-24 bg-white shadow-xl rounded-[2.5rem] flex items-center justify-center mb-6 text-indigo-500"><Stethoscope size={40}/></div>
                    <h3 className="text-lg font-black uppercase text-slate-800">No Patient Selected</h3>
                    <p className="text-xs text-slate-400 mt-2 uppercase">Select a patient from the queue to start the prescription.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}