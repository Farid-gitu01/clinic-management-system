"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { database } from "@/lib/firebase"
import { ref, onValue, update } from "firebase/database"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Clock, 
  Printer, 
  CalendarCheck, 
  Activity, 
  Search, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2
} from "lucide-react"

export default function AdminReceptionistModule() {
  const { profile } = useAuth()
  const router = useRouter()
  
  const [allAppointments, setAllAppointments] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  // Stats Logic
  const [stats, setStats] = useState({
    waiting: 0,
    inConsultation: 0,
    completed: 0,
    readyToPrint: 0 
  })

  useEffect(() => {
    if (!profile?.clinicId) return
    const apptsRef = ref(database, `clinics/${profile.clinicId}/appointments`)
    
    return onValue(apptsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        }))
        setAllAppointments(list)
      }
      setLoading(false)
    })
  }, [profile?.clinicId])

  const filteredAppointments = allAppointments.filter(appt => {
    const matchesDate = appt.date === selectedDate
    const matchesSearch = appt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          appt.doctorName?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDate && matchesSearch
  }).sort((a, b) => a.time.localeCompare(b.time))

  useEffect(() => {
    const todayList = allAppointments.filter(a => a.date === selectedDate)
    setStats({
      waiting: todayList.filter((a: any) => a.status === "checked-in").length,
      inConsultation: todayList.filter((a: any) => a.status === "in-progress").length,
      completed: todayList.filter((a: any) => a.status === "completed").length,
      readyToPrint: todayList.filter((a: any) => a.hasPrescription === true).length
    })
  }, [allAppointments, selectedDate])

  const handleCheckIn = async (appointmentId: string) => {
    if (!profile?.clinicId) return
    const apptRef = ref(database, `clinics/${profile.clinicId}/appointments/${appointmentId}`)
    await update(apptRef, { status: "checked-in", updatedAt: Date.now() })
  }

  if (loading) return <div className="p-10 text-center font-bold animate-pulse text-blue-600">LOADING HUB...</div>

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      
      {/* MODULE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">RECEPTION OVERVIEW</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Admin Control • Real-time Patient Flow</p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/admin/receptionist/new-appointment')}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 h-12 font-bold shadow-lg shadow-blue-100"
        >
          <CalendarCheck className="mr-2 h-4 w-4" /> BOOK APPOINTMENT
        </Button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search Patient or Doctor..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 pl-12 rounded-2xl border-none shadow-sm bg-white font-medium focus-visible:ring-blue-500"
          />
        </div>
        <div className="relative">
          <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-14 pl-12 rounded-2xl border-none shadow-sm bg-white font-bold text-xs"
          />
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="h-14 w-full rounded-2xl border-slate-200 bg-white font-bold text-slate-600">
                <Filter className="mr-2 h-4 w-4" /> FILTERS
            </Button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat label="In Lobby" value={stats.waiting} icon={<Users size={20}/>} color="text-amber-500" bg="bg-amber-50" />
        <MiniStat label="Consulting" value={stats.inConsultation} icon={<Activity size={20}/>} color="text-blue-500" bg="bg-blue-50" />
        <MiniStat label="Completed" value={stats.completed} icon={<CheckCircle2 size={20}/>} color="text-emerald-500" bg="bg-emerald-50" />
        <MiniStat label="Pending Print" value={stats.readyToPrint} icon={<Printer size={20}/>} color="text-indigo-500" bg="bg-indigo-50" />
      </div>

      {/* LIVE QUEUE TABLE */}
      <Card className="border-none rounded-[2rem] shadow-sm overflow-hidden bg-white">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => {
                const d = new Date(selectedDate); d.setDate(d.getDate()-1); setSelectedDate(d.toISOString().split('T')[0])
            }}><ChevronLeft/></Button>
            <span className="font-black text-sm uppercase tracking-tighter">
                {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </span>
            <Button variant="ghost" size="icon" onClick={() => {
                const d = new Date(selectedDate); d.setDate(d.getDate()+1); setSelectedDate(d.toISOString().split('T')[0])
            }}><ChevronRight/></Button>
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-50">
                <th className="p-6">Time</th>
                <th className="p-6">Patient</th>
                <th className="p-6">Doctor</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAppointments.map((appt) => (
                <tr key={appt.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-6 font-mono font-bold text-slate-900">{appt.time}</td>
                  <td className="p-6">
                    <p className="font-bold text-slate-800 text-sm">{appt.patientName}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{appt.patientPhone}</p>
                  </td>
                  <td className="p-6 text-sm font-semibold text-slate-600">Dr. {appt.doctorName}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight border ${getStatusColor(appt.status)}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                        {appt.status === "scheduled" && (
                            <Button size="sm" onClick={() => handleCheckIn(appt.id)} className="h-8 rounded-lg bg-blue-600 text-[10px] font-bold">CHECK IN</Button>
                        )}
                        {appt.hasPrescription && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => router.push(`/dashboard/admin/receptionist/print/${appt.id}`)}
                                className="h-8 rounded-lg border-emerald-200 text-emerald-600 hover:bg-emerald-50 text-[10px] font-bold"
                            >
                                <Printer size={12} className="mr-1"/> PRINT RX
                            </Button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAppointments.length === 0 && (
            <div className="p-20 text-center text-slate-300 font-bold uppercase text-xs tracking-widest">
                No sessions found for this date
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

function MiniStat({ label, value, icon, color, bg }: any) {
  return (
    <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`${bg} ${color} p-3 rounded-xl`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
        <p className="text-xl font-black text-slate-900 leading-none mt-1">{value}</p>
      </div>
    </div>
  )
}

function getStatusColor(status: string) {
  switch (status) {
    case "scheduled": return "bg-slate-50 text-slate-400 border-slate-100"
    case "checked-in": return "bg-amber-50 text-amber-600 border-amber-200"
    case "in-progress": return "bg-blue-50 text-blue-600 border-blue-200"
    case "completed": return "bg-emerald-50 text-emerald-600 border-emerald-200"
    default: return "bg-slate-50 text-slate-400"
  }
}