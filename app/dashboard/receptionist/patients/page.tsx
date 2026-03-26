"use client"

import { useEffect, useState } from "react"
// Firebase imports
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
// Context & UI imports
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Users, 
  Clock, 
  UserCheck, 
  AlertCircle, 
  Plus, 
  Search,
  LayoutDashboard,
  MoreVertical,
  Calendar,
  Building2,
  LogOut
} from "lucide-react"

// Types to prevent TS errors
interface Appointment {
  time: string;
  patientName: string;
  doctorName: string;
  status: 'checked-in' | 'in-progress' | 'completed' | 'scheduled';
  paymentStatus: 'pending' | 'paid';
  date: string;
}

export default function ReceptionistDashboard() {
  const { profile, signOut } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    waiting: 0,
    inConsultation: 0,
    completedToday: 0,
    pendingPayments: 0
  })

  useEffect(() => {
    if (!profile?.clinicId) return

    const today = new Date().toISOString().split('T')[0]
    const apptsRef = ref(database, `clinics/${profile.clinicId}/appointments`)
    
    const unsubscribe = onValue(apptsRef, (snapshot) => {
      setLoading(true)
      const data = snapshot.val()
      if (data) {
        const list = Object.values(data) as Appointment[]
        const todayAppts = list.filter((a) => a.date === today)
        setAppointments(todayAppts)

        setStats({
          waiting: todayAppts.filter((a) => a.status === "checked-in").length,
          inConsultation: todayAppts.filter((a) => a.status === "in-progress").length,
          completedToday: todayAppts.filter((a) => a.status === "completed").length,
          pendingPayments: todayAppts.filter((a) => a.paymentStatus === "pending").length
        })
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [profile?.clinicId])

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP COMMAND BAR */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
              <Building2 className="text-emerald-500 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
                Receptionist <span className="text-emerald-500">Terminal</span>
              </h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                {profile?.clinicName || "Global Health Center"} • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search Patient ID..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Patient
            </button>
          </div>
        </div>

        {/* OPERATION ANALYTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="In Lobby" value={stats.waiting} color="text-amber-500" icon={Clock} />
          <StatCard label="In Consultation" value={stats.inConsultation} color="text-blue-500" icon={UserCheck} />
          <StatCard label="Discharged" value={stats.completedToday} color="text-emerald-500" icon={Users} />
          <StatCard label="Pending Payments" value={stats.pendingPayments} color="text-red-500" icon={AlertCircle} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* QUEUE TABLE */}
          <div className="lg:col-span-3">
            <Card className="bg-[#0a0f1e] border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
                <div className="flex items-center gap-3">
                  <Calendar className="text-emerald-500 w-5 h-5" />
                  <h2 className="font-black text-sm uppercase tracking-widest">Active Patient Queue</h2>
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Live Sync</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-800">
                      <th className="p-6">Time Slot</th>
                      <th className="p-6">Patient Identity</th>
                      <th className="p-6">Clinical Staff</th>
                      <th className="p-6">Live Status</th>
                      <th className="p-6 text-right">Ops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {loading ? (
                      <tr><td colSpan={5} className="p-20 text-center animate-pulse text-slate-500 uppercase text-xs font-black tracking-widest">Loading Data...</td></tr>
                    ) : appointments.length > 0 ? (
                      appointments.map((appt, i) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
                          <td className="p-6">
                            <span className="font-mono text-emerald-500 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10 text-xs">{appt.time}</span>
                          </td>
                          <td className="p-6">
                            <p className="font-black text-white text-sm">{appt.patientName}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">PID-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500" />
                              <span className="text-xs font-bold text-slate-400">Dr. {appt.doctorName}</span>
                            </div>
                          </td>
                          <td className="p-6">
                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(appt.status)}`}>
                              {appt.status}
                            </span>
                          </td>
                          <td className="p-6 text-right">
                            <button className="bg-slate-800 p-2 rounded-lg hover:bg-slate-700 transition-all text-slate-400 hover:text-white">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-20 text-center">
                          <Users className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                          <p className="text-slate-600 font-bold uppercase text-xs tracking-[0.3em]">No Patient Activity Detected</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* SIDEBAR: RECEPTIONIST INFO */}
          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-800 rounded-[2rem] p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-24 w-24 rounded-3xl bg-emerald-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-emerald-600/20 border-4 border-slate-800">
                  {profile?.fullName?.charAt(0) || 'R'}
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">{profile?.fullName || "Staff Member"}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mt-1">Front Desk Head</p>
                </div>
                <div className="w-full pt-4 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-bold uppercase">Role</span>
                    <span className="text-white font-black">{profile?.role || "Receptionist"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-bold uppercase">Shift</span>
                    <span className="text-white font-black">Morning (09:00 - 17:00)</span>
                  </div>
                </div>
                <button 
                  onClick={() => signOut?.()}
                  className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all mt-4"
                >
                  <LogOut className="w-4 h-4" /> End Shift
                </button>
              </div>
            </Card>

            <Card className="bg-emerald-600 rounded-[2rem] p-8 text-white relative overflow-hidden group cursor-pointer">
               <Plus className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:rotate-12 transition-transform" />
               <h4 className="text-xl font-black leading-tight">Fast<br/>Check-in</h4>
               <p className="text-[10px] font-bold uppercase opacity-80 mt-2">Scan Patient QR Code</p>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, icon: Icon }: any) {
  return (
    <Card className="bg-[#0a0f1e] border-slate-800 p-6 flex items-center justify-between group hover:border-slate-600 transition-all cursor-default rounded-[1.5rem] shadow-lg">
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-4xl font-black text-white mt-2 tracking-tighter">{value}</p>
      </div>
      <div className={`p-4 rounded-2xl bg-slate-900 ${color} group-hover:scale-110 transition-transform shadow-inner`}>
        <Icon className="w-6 h-6" />
      </div>
    </Card>
  )
}

function getStatusStyle(status: string) {
  switch (status) {
    case "checked-in": return "bg-amber-500/10 text-amber-500 border-amber-500/20"
    case "in-progress": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    case "completed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    default: return "bg-slate-800 text-slate-400 border-slate-700"
  }
}