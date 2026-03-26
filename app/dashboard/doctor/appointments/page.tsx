"use client"

import { useEffect, useState } from "react"
import { database } from "@/lib/firebase"
import { ref, update, onValue, remove } from "firebase/database"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/lib/protected-route"
import { 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  Search,
  Trash2,
  Stethoscope,
  Activity,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"

interface Appointment {
  id: string
  patientName: string
  date: string
  time: string
  reason: string // This usually contains the "Disease" or "Chief Complaint"
  disease?: string // Support for a specific disease field if available
  status: "checked-in" | "in-consultation" | "completed" | "cancelled"
  patientId: string
  vitals?: string
}

export default function DoctorAppointments() {
  const { profile } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!profile?.clinicId) return

    const appointmentsRef = ref(database, `clinics/${profile.clinicId}/appointments`)
    
    const unsubscribe = onValue(appointmentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const list = Object.entries(data)
          .map(([key, value]: [string, any]) => ({
            id: key,
            ...value,
          }))
          .filter((apt) => apt.status === "checked-in")
          .sort((a, b) => a.time.localeCompare(b.time))

        setAppointments(list)
      } else {
        setAppointments([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [profile?.clinicId])

  const handleAttend = async (appointment: Appointment) => {
    try {
      const updates: any = {}
      updates[`clinics/${profile?.clinicId}/appointments/${appointment.id}/status`] = "in-consultation"
      updates[`clinics/${profile?.clinicId}/appointments/${appointment.id}/attendedAt`] = Date.now()
      
      await update(ref(database), updates)
      toast.success(`${appointment.patientName} moved to consultation`)
    } catch (error) {
      toast.error("Failed to start consultation")
    }
  }

  const handleCancel = async (appointment: Appointment) => {
    try {
      await update(ref(database, `clinics/${profile?.clinicId}/appointments/${appointment.id}`), {
        status: "cancelled"
      })
      toast.error("Appointment marked as cancelled")
    } catch (error) {
      toast.error("Update failed")
    }
  }

  const handleDelete = async (appointmentId: string) => {
    if(confirm("Permanently delete this record?")) {
      try {
        await remove(ref(database, `clinics/${profile?.clinicId}/appointments/${appointmentId}`))
        toast.success("Record deleted")
      } catch (error) {
        toast.error("Delete failed")
      }
    }
  }

  const filtered = appointments.filter(apt => 
    apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (apt.reason || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <ProtectedRoute requiredRole="doctor">
      <div className="w-full min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <DashboardHeader 
              title="Live Patient Queue" 
              description="Review patient ailments and manage the waiting lobby" 
            />
            
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search name or disease..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Synchronizing Lobby...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] bg-white/50 dark:bg-slate-900/50">
              <User className="h-12 w-12 text-slate-300 mx-auto mb-4 opacity-20" />
              <h3 className="font-black text-slate-500 uppercase tracking-tighter text-xl">Lobby is Clear</h3>
              <p className="text-xs text-slate-400 font-bold">No patients are currently checked in.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((apt) => (
                <Card key={apt.id} className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden group hover:scale-[1.01] transition-all duration-300 rounded-3xl">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      {/* Left Sidebar Accent */}
                      <div className="w-2 bg-emerald-500 hidden md:block" />
                      
                      {/* Patient Info Section */}
                      <div className="p-6 flex-1 flex flex-col md:flex-row md:items-center gap-6">
                        {/* Time Slot Badge */}
                        <div className="flex flex-col items-center justify-center h-16 w-16 min-w-[64px] rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-700">
                          <span className="text-xs font-black uppercase opacity-50">Slot</span>
                          <span className="text-lg font-black leading-none">{apt.time}</span>
                        </div>

                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-950 dark:text-white text-xl tracking-tight">{apt.patientName}</h4>
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-emerald-500/20">
                              Checked In
                            </span>
                          </div>

                          {/* Disease/Reason Section - HIGHLIGHTED */}
                          <div className="flex flex-wrap gap-3 items-center">
                            <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-xl border border-rose-100 dark:border-rose-900/30">
                              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                              <span className="text-xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                                {apt.reason || apt.disease || "No complaint specified"}
                              </span>
                            </div>
                            
                            {apt.vitals && (
                              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-slate-500">
                                <Activity className="h-3.5 w-3.5" />
                                <span className="text-[11px] font-bold">{apt.vitals}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions Section */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <Button 
                          onClick={() => handleAttend(apt)}
                          className="flex-1 md:flex-none px-6 bg-slate-950 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 transition-all shadow-lg hover:shadow-emerald-500/20 group"
                        >
                          <Stethoscope className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                          Start Consult
                        </Button>
                        
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCancel(apt)}
                            className="h-12 w-12 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            title="Cancel Appointment"
                          >
                            <XCircle className="h-5 w-5" />
                          </Button>
                          <Button 
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(apt.id)}
                            className="h-12 w-12 rounded-2xl text-slate-300 hover:text-rose-600"
                            title="Delete Permanently"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}