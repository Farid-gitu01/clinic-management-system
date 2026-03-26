"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { database } from "@/lib/firebase"
import { ref, onValue, update } from "firebase/database"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  Clock, 
  LayoutDashboard,
  Printer,
  CalendarCheck,
  MoreHorizontal,
  Activity,
  Palette,
  MapPin,
  Search,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

export default function ReceptionistDashboard() {
  const { profile } = useAuth()
  const router = useRouter()
  
  // --- State Management ---
  const [allAppointments, setAllAppointments] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [theme, setTheme] = useState<"blue" | "orange">("blue")
  const [clinicData, setClinicData] = useState<any>(null)
  const [stats, setStats] = useState({
    waiting: 0,
    inConsultation: 0,
    completed: 0,
    readyToPrint: 0 
  })

  const themeConfig = {
    blue: {
      bg: "bg-slate-50",
      card: "bg-white",
      text: "text-slate-900",
      subtext: "text-slate-500",
      primary: "bg-blue-600",
      primaryHover: "hover:bg-blue-700",
      accent: "text-blue-600",
      border: "border-slate-200",
      tableHead: "bg-slate-100",
      buttonShadow: "shadow-blue-200"
    },
    orange: {
      bg: "bg-orange-50/30",
      card: "bg-white",
      text: "text-slate-900",
      subtext: "text-slate-500",
      primary: "bg-orange-500",
      primaryHover: "hover:bg-orange-600",
      accent: "text-orange-600",
      border: "border-orange-100",
      tableHead: "bg-orange-50",
      buttonShadow: "shadow-orange-200"
    }
  }

  const active = themeConfig[theme]

  // --- Real-time Data Fetching ---
  useEffect(() => {
    if (!profile?.clinicId) return

    // Fetch Branding
    const settingsRef = ref(database, `clinics/${profile.clinicId}/clinicInfo`)
    onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) setClinicData(snapshot.val())
    })

    // Fetch ALL Appointments (Real-time)
    const apptsRef = ref(database, `clinics/${profile.clinicId}/appointments`)
    
    return onValue(apptsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        }))
        setAllAppointments(list)
      } else {
        setAllAppointments([])
      }
    })
  }, [profile?.clinicId])

  // --- Filtering Logic ---
  const filteredAppointments = allAppointments.filter(appt => {
    const matchesDate = appt.date === selectedDate
    const matchesSearch = appt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         appt.doctorName?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDate && matchesSearch
  }).sort((a, b) => a.time.localeCompare(b.time))

  // Update Stats based on filtered list or global today list
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

  return (
    <div className={`min-h-screen ${active.bg} ${active.text} p-4 md:p-8 transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className={`${active.primary} p-3 rounded-2xl shadow-lg ${active.buttonShadow}`}>
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight leading-none">
                {clinicData?.clinicName || "CENTRAL RECEPTION"}
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                <MapPin size={12} className={active.accent} /> {clinicData?.address || "Ready for patients"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             <div className="bg-white border rounded-2xl p-1.5 flex gap-1 shadow-sm">
                <button onClick={() => setTheme("blue")} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${theme === 'blue' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>BLUE</button>
                <button onClick={() => setTheme("orange")} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${theme === 'orange' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>ORANGE</button>
             </div>
             <button onClick={() => router.push('/dashboard/receptionist/appointments')} className={`${active.primary} text-white px-6 py-4 rounded-2xl font-black text-xs tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-lg ${active.buttonShadow}`}>
                <CalendarCheck size={18} /> BOOK NEW VISIT
             </button>
          </div>
        </div>

        {/* Search & Date Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Search patient name or doctor..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-12 rounded-2xl border-none shadow-sm bg-white font-medium"
            />
          </div>
          <div className="relative">
            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-14 pl-12 rounded-2xl border-none shadow-sm bg-white font-black uppercase text-xs"
            />
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Selected Date" value={filteredAppointments.length} color="text-blue-500" icon={Clock} theme={theme} />
          <StatCard label="In Lobby" value={stats.waiting} color="text-amber-500" icon={Users} theme={theme} />
          <StatCard label="In Cabin" value={stats.inConsultation} color="text-indigo-500" icon={Activity} theme={theme} />
          <StatCard label="Print Rx" value={stats.readyToPrint} color="text-emerald-500" icon={Printer} theme={theme} />
        </div>

        {/* Queue Table */}
        <Card className="border-none rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
          <div className={`p-6 md:p-8 border-b flex flex-col md:flex-row justify-between items-center gap-4 ${active.tableHead}`}>
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() - 1);
                    setSelectedDate(d.toISOString().split('T')[0]);
                  }}
                  className="p-2 hover:bg-white rounded-full transition-colors"><ChevronLeft size={20}/></button>
                <h2 className="font-black text-xl uppercase tracking-tight">
                  Schedule: {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </h2>
                <button 
                  onClick={() => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() + 1);
                    setSelectedDate(d.toISOString().split('T')[0]);
                  }}
                  className="p-2 hover:bg-white rounded-full transition-colors"><ChevronRight size={20}/></button>
             </div>
             <span className="text-[10px] font-black bg-white px-4 py-2 rounded-full border shadow-sm">
               {filteredAppointments.length} TOTAL SESSIONS
             </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 border-b">
                  <th className="p-6">Time Slot</th>
                  <th className="p-6">Patient Identity</th>
                  <th className="p-6">Medical Officer</th>
                  <th className="p-6 text-center">Status</th>
                  <th className="p-6 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="group hover:bg-slate-50/80 transition-all">
                    <td className="p-6 font-mono font-black text-lg text-slate-900">{appt.time}</td>
                    <td className="p-6">
                      <p className="font-black text-sm uppercase tracking-tight text-slate-900">{appt.patientName}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Contact: {appt.patientPhone || 'N/A'}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${active.primary}`} />
                        <span className="text-xs font-bold text-slate-600 uppercase">Dr. {appt.doctorName}</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(appt.status)}`}>
                        {appt.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        {appt.status === "scheduled" && (
                          <button onClick={() => handleCheckIn(appt.id)} className={`${active.primary} text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg ${active.buttonShadow}`}>
                            CHECK-IN
                          </button>
                        )}
                        {appt.hasPrescription && (
                          <button 
                            onClick={() => router.push(`/dashboard/receptionist/print/${appt.id}`)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 shadow-lg shadow-emerald-100"
                          >
                            <Printer size={14} /> PRINT RX
                          </button>
                        )}
                        <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><MoreHorizontal size={20} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAppointments.length === 0 && (
              <div className="p-20 text-center">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                   <CalendarIcon className="text-slate-300" />
                </div>
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">No records found for this date.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, icon: Icon, theme }: any) {
  return (
    <Card className="bg-white border-none p-6 flex items-center justify-between group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-sm rounded-3xl">
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <p className="text-4xl font-black text-slate-900 mt-1 tracking-tighter">{value}</p>
      </div>
      <div className={`p-4 rounded-2xl bg-slate-50 ${color} transition-transform border border-slate-50`}>
        <Icon size={24} />
      </div>
    </Card>
  )
}

function getStatusStyle(status: string) {
  switch (status) {
    case "scheduled": return "bg-slate-50 text-slate-400 border-slate-200"
    case "checked-in": return "bg-amber-50 text-amber-600 border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
    case "in-progress": return "bg-blue-50 text-blue-600 border-blue-200 shadow-[0_0_15px_rgba(37,99,235,0.1)]"
    case "completed": return "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
    default: return "bg-slate-50 text-slate-400 border-slate-100"
  }
}