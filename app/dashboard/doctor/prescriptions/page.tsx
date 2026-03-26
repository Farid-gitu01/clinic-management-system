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
  FileText, 
  Printer, 
  Trash2, 
  ClipboardList,
  CheckCircle,
  X,
  Loader2,
  Activity,
  Stethoscope,
  User,
  Plus,
  CalendarDays,
  Microscope,
  Pill,
  Sparkles
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
  
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", dosage: "", duration: "", instructions: "" }
  ])
  const [clinicalNotes, setClinicalNotes] = useState("")

  useEffect(() => {
    if (!profile?.clinicId) return
    
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
    } else {
      setMedications([{ name: "", dosage: "", duration: "", instructions: "" }])
    }
  }

  const handleSavePrescription = async () => {
    if (!selectedPatient || !profile?.clinicId) {
      toast.error("Missing patient or clinic information")
      return
    }

    const validMeds = medications.filter(m => m.name.trim() !== "")
    if (validMeds.length === 0 && clinicalNotes.trim() === "") {
      toast.error("Please provide either clinical notes or medications.")
      return
    }

    setIsSaving(true)
    try {
      const rxData = {
        medications: validMeds,
        clinicalNotes: clinicalNotes.trim(),
        prescribedAt: Date.now(),
        doctorName: profile?.fullName || "Doctor",
        doctorSpecialization: profile?.specialization || "Physician"
      }

      const updates: any = {}
      updates[`clinics/${profile.clinicId}/appointments/${selectedPatient.id}/prescription`] = rxData
      updates[`clinics/${profile.clinicId}/appointments/${selectedPatient.id}/hasPrescription`] = true
      updates[`clinics/${profile.clinicId}/appointments/${selectedPatient.id}/updatedAt`] = Date.now()

      await update(ref(database), updates)
      toast.success(`Rx saved for ${selectedPatient.patientName}`)
    } catch (error: any) {
      toast.error("Database save failed.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProtectedRoute requiredRole="doctor">
      <div className="w-full min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-4 md:p-8 transition-colors duration-500">
        <div className="max-w-7xl mx-auto space-y-8">
          <DashboardHeader 
            title="Digital Prescription" 
            description="Next-gen clinical workstation for modern healthcare" 
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* 1. PATIENT SIDEBAR - Glassmorphism style */}
            <div className="lg:col-span-3 space-y-4 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex items-center justify-between px-2 mb-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Queue</h3>
                <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black tracking-widest">{patients.length}</span>
              </div>
              
              {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-500" /></div>
              ) : patients.length === 0 ? (
                <div className="p-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] bg-white/50">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Queue Empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patients.map((p) => (
                    <div 
                      key={p.id} 
                      onClick={() => {
                        setSelectedPatient(p)
                        if (p.prescription) {
                          setMedications(p.prescription.medications || [])
                          setClinicalNotes(p.prescription.clinicalNotes || "")
                        } else {
                          setMedications([{ name: "", dosage: "", duration: "", instructions: "" }])
                          setClinicalNotes("")
                        }
                      }}
                      className={`group cursor-pointer p-4 rounded-[2rem] border transition-all duration-500 relative overflow-hidden ${
                        selectedPatient?.id === p.id 
                        ? 'bg-indigo-600 border-indigo-600 shadow-2xl shadow-indigo-500/40 translate-x-2' 
                        : 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex items-start gap-3 relative z-10">
                        <div className={`mt-1 h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                          selectedPatient?.id === p.id 
                          ? 'bg-white/20 text-white' 
                          : p.hasPrescription ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800'
                        }`}>
                          {p.hasPrescription ? <CheckCircle className="h-5 w-5" /> : <User className="h-5 w-5" />}
                        </div>
                        <div className="overflow-hidden">
                          <p className={`font-black text-sm transition-colors ${selectedPatient?.id === p.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{p.patientName}</p>
                          <p className={`text-[10px] font-bold uppercase mt-1 truncate ${selectedPatient?.id === p.id ? 'text-indigo-100' : 'text-indigo-500'}`}>
                            {p.reason || p.disease || "Routine Visit"}
                          </p>
                        </div>
                      </div>
                      {/* Decorative background element for active state */}
                      {selectedPatient?.id === p.id && (
                        <div className="absolute top-0 right-0 p-2 opacity-20">
                          <Sparkles className="h-12 w-12 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. MAIN WORKSPACE */}
            <div className="lg:col-span-9">
              {selectedPatient ? (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  
                  {/* LEFT: CLINICAL SUMMARY (Bento Card) */}
                  <div className="xl:col-span-4 space-y-6">
                    <Card className="border-none shadow-2xl bg-slate-900 text-white rounded-[3rem] overflow-hidden">
                      <CardContent className="p-8 space-y-8">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">Patient Profile</p>
                            <h2 className="text-2xl font-black tracking-tighter leading-none">{selectedPatient.patientName}</h2>
                          </div>
                          <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                            <Activity className="h-6 w-6 text-rose-400" />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                            <span className="text-[9px] font-black uppercase text-slate-500 block mb-2">Current Diagnosis</span>
                            <p className="text-sm font-bold text-slate-200">
                              {selectedPatient.reason || selectedPatient.diagnosis || "Observation pending."}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-[1.5rem] border border-white/5">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Vitality</p>
                              <p className="text-xs font-bold">{selectedPatient.vitals || "No Record"}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-[1.5rem] border border-white/5">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Demographics</p>
                              <p className="text-xs font-bold">{selectedPatient.age}Y • {selectedPatient.gender}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <div className="flex items-center gap-3 text-slate-400 group cursor-help">
                                <Microscope className="h-4 w-4 text-indigo-400" />
                                <p className="text-[10px] font-bold uppercase tracking-wider group-hover:text-white transition-colors">Lab reports available in history</p>
                            </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] text-white shadow-xl shadow-indigo-500/20">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                            <Stethoscope className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Clinician Note</p>
                            <p className="text-xs font-bold">Ensure pharmacy verification is enabled.</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* RIGHT: RX COMPOSER */}
                  <Card className="xl:col-span-8 border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[3.5rem] overflow-hidden">
                    <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                          <Pill className="h-7 w-7" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-xl">Digital Rx</h4>
                          <p className="text-[10px] font-black text-indigo-500/70 uppercase tracking-[0.2em]">Session ID: {selectedPatient.id.slice(-6)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all" onClick={() => setSelectedPatient(null)}>
                        <X className="h-6 w-6" />
                      </Button>
                    </div>

                    <CardContent className="p-8 space-y-10">
                      {/* Section: Clinical Advice */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                           <FileText className="h-4 w-4 text-slate-400" />
                           <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">Clinical Advice & Instructions</label>
                        </div>
                        <textarea 
                          className="w-full p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white dark:focus:bg-slate-800 outline-none text-sm min-h-[140px] transition-all font-medium text-slate-700 dark:text-slate-200"
                          value={clinicalNotes}
                          onChange={(e) => setClinicalNotes(e.target.value)}
                          placeholder="Type lifestyle changes, diet advice, or follow-up dates..."
                        />
                      </div>

                      {/* Section: Medication Bento */}
                      <div className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                          <div className="flex items-center gap-2">
                             <Sparkles className="h-4 w-4 text-amber-500" />
                             <label className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">Drug Regimen</label>
                          </div>
                          <Button 
                            onClick={addMedication} 
                            size="sm" 
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-none rounded-xl font-black text-[10px] uppercase tracking-widest px-4 transition-all"
                          >
                             <Plus className="h-3 w-3 mr-2" /> Add
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {medications.map((med, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative group animate-in fade-in slide-in-from-top-2">
                              <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase text-slate-400 ml-1">Medication</span>
                                <input 
                                  placeholder="Drug Name" 
                                  className="w-full bg-white dark:bg-slate-900 rounded-xl p-2.5 text-xs font-black outline-none border border-slate-100 dark:border-slate-800 focus:border-indigo-500 transition-all"
                                  value={med.name}
                                  onChange={(e) => {
                                    const m = [...medications]; m[index].name = e.target.value; setMedications(m);
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase text-slate-400 ml-1">Frequency</span>
                                <input 
                                  placeholder="1-0-1" 
                                  className="w-full bg-white dark:bg-slate-900 rounded-xl p-2.5 text-xs font-bold outline-none border border-slate-100 dark:border-slate-800 focus:border-indigo-500 transition-all"
                                  value={med.dosage}
                                  onChange={(e) => {
                                    const m = [...medications]; m[index].dosage = e.target.value; setMedications(m);
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase text-slate-400 ml-1">Period</span>
                                <input 
                                  placeholder="7 Days" 
                                  className="w-full bg-white dark:bg-slate-900 rounded-xl p-2.5 text-xs font-bold outline-none border border-slate-100 dark:border-slate-800 focus:border-indigo-500 transition-all"
                                  value={med.duration}
                                  onChange={(e) => {
                                    const m = [...medications]; m[index].duration = e.target.value; setMedications(m);
                                  }}
                                />
                              </div>
                              <div className="space-y-1 relative">
                                <span className="text-[8px] font-black uppercase text-slate-400 ml-1">Remarks</span>
                                <div className="flex items-center gap-2">
                                    <input 
                                      placeholder="Before food..." 
                                      className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-2.5 text-xs font-medium italic outline-none border border-slate-100 dark:border-slate-800 focus:border-indigo-500 transition-all"
                                      value={med.instructions}
                                      onChange={(e) => {
                                        const m = [...medications]; m[index].instructions = e.target.value; setMedications(m);
                                      }}
                                    />
                                    <button onClick={() => removeMedication(index)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                       <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-10">
                        <Button 
                          onClick={handleSavePrescription} 
                          disabled={isSaving}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] text-[11px] h-16 rounded-[1.5rem] shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all"
                        >
                          {isSaving ? <Loader2 className="animate-spin mr-2" /> : <ClipboardList className="mr-2 h-5 w-5" />}
                          {selectedPatient.hasPrescription ? 'Update Digital Record' : 'Authorize & Sign Rx'}
                        </Button>
                        <Button variant="outline" className="h-16 px-8 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group" onClick={() => window.print()}>
                          <Printer className="h-5 w-5 text-slate-400 group-hover:text-indigo-600" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="h-full min-h-[600px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[4rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl relative overflow-hidden">
                  <div className="relative z-10 text-center">
                    <div className="h-28 w-28 rounded-[3rem] bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center mx-auto mb-8 transition-transform hover:scale-110 duration-500">
                      <Stethoscope className="h-12 w-12 text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">Initialize Session</h3>
                    <p className="text-xs font-bold text-slate-400 mt-3 uppercase tracking-wider max-w-xs mx-auto leading-relaxed">Select a completed appointment from the queue to generate a clinical prescription</p>
                  </div>
                  {/* Background decoration */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 bg-indigo-500/5 rounded-full blur-[100px]" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}