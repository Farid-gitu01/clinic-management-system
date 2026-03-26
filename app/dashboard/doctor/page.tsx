"use client"

import { useEffect, useState } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Users, 
  CalendarCheck, 
  CalendarClock, 
  UserCircle, 
  Activity,
  CreditCard,
  FileText,
  Palette,
  ArrowUpRight,
  Filter,
  Phone,
  ShieldCheck,
  Stethoscope,
  MapPin,
  Fingerprint
} from "lucide-react"

interface DoctorProfile {
  fullName?: string;
  clinicId?: string;
  clinicName?: string;
  specialization?: string;
  photoURL?: string;
  phone?: string;
  phoneNumber?: string;
  licenseNo?: string;
  registrationNo?: string;
  address?: string;
}

export default function DoctorDashboard() {
  const { profile: baseProfile } = useAuth()
  const profile = baseProfile as DoctorProfile
  
  const [loading, setLoading] = useState(true)
  const [doctorTheme, setDoctorTheme] = useState<"white" | "blue">("white")
  const [stats, setStats] = useState({
    totalPatients: 0,
    waitingInQueue: 0,
    completedToday: 0,
    pendingBilling: 0,
  })

  const themes = {
    white: {
      bg: "bg-[#f8fafc]",
      card: "bg-white border-slate-200 shadow-sm",
      text: "text-slate-900",
      subtext: "text-slate-500",
      accent: "text-blue-600",
      btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
      statIcon: "bg-blue-50 text-blue-600",
      profileBg: "bg-slate-50",
      border: "border-slate-200"
    },
    blue: {
      bg: "bg-[#0f172a]",
      card: "bg-[#1e293b] border-slate-700 shadow-2xl shadow-blue-900/20",
      text: "text-white",
      subtext: "text-blue-200",
      accent: "text-blue-400",
      btn: "bg-blue-500 hover:bg-blue-400 shadow-blue-500/20",
      statIcon: "bg-blue-500/10 text-blue-400",
      profileBg: "bg-slate-800/50",
      border: "border-slate-700"
    }
  }

  const active = themes[doctorTheme]

  useEffect(() => {
    if (!profile?.clinicId) return

    const appointmentsRef = ref(database, `clinics/${profile.clinicId}/appointments`)
    
    const unsubscribe = onValue(appointmentsRef, (snapshot) => {
      setLoading(true)
      const data = snapshot.val()
      if (data) {
        const appointments = Object.values(data) as any[]
        const today = new Date().toISOString().split('T')[0]
        const todayAppts = appointments.filter(a => a.date === today)

        setStats({
          totalPatients: appointments.length,
          waitingInQueue: todayAppts.filter(a => a.status === "checked-in").length,
          completedToday: todayAppts.filter(a => a.status === "completed").length,
          pendingBilling: todayAppts.filter(a => a.status === "in-consultation").length,
        })
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [profile?.clinicId])

  return (
    <div className={`w-full min-h-screen transition-all duration-500 ${active.bg} p-4 md:p-8`}>
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-10">
          <DashboardHeader 
            title="Medical Command Center" 
            description={`Terminal Active | Unit: ${profile?.clinicName || 'Private Practice'}`} 
            className={active.text}
          />
          
          <div className={`flex items-center gap-2 p-1.5 rounded-2xl border ${active.card}`}>
            <button onClick={() => setDoctorTheme("white")} className={`p-2 rounded-xl transition-all ${doctorTheme === 'white' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
              <Palette className="w-4 h-4" />
            </button>
            <button onClick={() => setDoctorTheme("blue")} className={`p-2 rounded-xl transition-all ${doctorTheme === 'blue' ? 'bg-blue-400 text-white shadow-lg' : 'text-slate-400'}`}>
              <Palette className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className={`h-12 w-12 animate-spin rounded-full border-4 border-t-transparent ${active.accent.replace('text', 'border')}`}></div>
            <p className={`mt-4 font-black uppercase tracking-widest text-[10px] ${active.text}`}>Syncing Clinical Data...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatItem title="Registry" value={stats.totalPatients} icon={Users} theme={active} />
              <StatItem title="Queue" value={stats.waitingInQueue} icon={CalendarClock} theme={active} />
              <StatItem title="Billing" value={stats.pendingBilling} icon={CreditCard} theme={active} />
              <StatItem title="Done" value={stats.completedToday} icon={CalendarCheck} theme={active} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <Card className={`border ${active.card} rounded-[3rem] overflow-hidden`}>
                <div className={`h-32 w-full ${active.statIcon} opacity-40 relative overflow-hidden`}>
                  <Fingerprint className="absolute -right-4 -top-4 h-24 w-24 opacity-10 rotate-12" />
                  <div className="absolute bottom-4 left-6">
                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${active.text} opacity-70`}>Authenticated MD</span>
                  </div>
                </div>

                <CardContent className="relative -mt-16 px-6 pb-8 space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="relative group">
                      <div className={`h-32 w-32 rounded-[2.5rem] p-1.5 border-4 ${active.card} shadow-2xl overflow-hidden transition-transform group-hover:scale-105 duration-500`}>
                        <img 
                          src={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.fullName || "Doctor"}&background=2563EB&color=fff`} 
                          alt="Doctor" 
                          className="h-full w-full object-cover rounded-[2rem]"
                        />
                      </div>
                      <div className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-2xl border-4 border-white shadow-xl">
                        <ShieldCheck className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    <div className="text-center mt-6">
                      <h4 className={`text-2xl font-black tracking-tight ${active.text}`}>
                        Dr. {profile?.fullName || "Practitioner"}
                      </h4>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full ${active.statIcon} border border-blue-200/50`}>
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase font-black tracking-widest">
                          {profile?.specialization || "General Medicine"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`space-y-1 p-5 rounded-[2rem] ${active.profileBg} border border-blue-100/10`}>
                    <DetailRow icon={Phone} label="Contact" value={profile?.phone || profile?.phoneNumber || "N/A"} theme={active} />
                    <DetailRow icon={Activity} label="Status" value="On-Call" theme={active} color="text-blue-500" />
                    <DetailRow icon={FileText} label="License" value={profile?.licenseNo || "CERT-MD-880"} theme={active} />
                    <DetailRow icon={MapPin} label="Branch" value={profile?.clinicName?.split(' ')[0] || "Main HQ"} theme={active} />
                  </div>

                  <a 
                    href="/dashboard/doctor/profile" 
                    className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all hover:brightness-110 active:scale-95 shadow-lg ${active.btn}`}
                  >
                    Medical Profile
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </CardContent>
              </Card>

              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5 h-fit">
                <ModuleCard title="Appointments" desc="Current Patient List" icon={CalendarClock} href="/dashboard/doctor/appointments" count={stats.waitingInQueue} theme={active} />
                <ModuleCard title="Finance" desc="Billing & Revenue" icon={CreditCard} href="/dashboard/doctor/billing" count={stats.pendingBilling} theme={active} />
                <ModuleCard title="E-Prescribe" desc="RX Terminal" icon={FileText} href="/dashboard/doctor/prescriptions" theme={active} />
                <ModuleCard title="Analytics" desc="Growth Reports" icon={Activity} href="/dashboard/doctor/reports" theme={active} />
                
                <div className={`sm:col-span-2 p-8 rounded-[2.5rem] border-2 border-dashed ${active.border} flex flex-col items-center justify-center text-center opacity-70`}>
                   <div className={`h-12 w-12 rounded-full ${active.statIcon} flex items-center justify-center mb-4`}>
                      <Filter className="w-6 h-6" />
                   </div>
                   <h5 className={`text-xs font-black uppercase tracking-[0.2em] ${active.text}`}>Medical Feed</h5>
                   <p className={`text-[10px] font-medium mt-1 ${active.subtext}`}>Monitoring incoming health records and lab diagnostics...</p>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DetailRow({ icon: Icon, label, value, theme, color }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-200/10 last:border-0">
      <div className="flex items-center gap-3">
        <Icon className={`w-3.5 h-3.5 ${theme.subtext}`} />
        <span className={`${theme.subtext} text-[9px] font-black uppercase tracking-tighter`}>{label}</span>
      </div>
      <span className={`${color || theme.text} text-[10px] font-bold tracking-tight`}>{value}</span>
    </div>
  )
}

function StatItem({ title, value, icon: Icon, theme }: any) {
  return (
    <Card className={`border ${theme.card} relative overflow-hidden group rounded-[2rem]`}>
      <CardContent className="p-7">
        <div className={`h-12 w-12 rounded-2xl ${theme.statIcon} flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}>
          <Icon className="h-6 w-6" />
        </div>
        <p className={`text-[10px] font-black ${theme.subtext} uppercase tracking-widest`}>{title}</p>
        <h3 className={`text-4xl font-black mt-1 tracking-tighter ${theme.text}`}>{value}</h3>
      </CardContent>
    </Card>
  )
}

function ModuleCard({ title, desc, icon: Icon, href, count, theme }: any) {
  return (
    <a href={href} className={`p-6 rounded-[2.5rem] border ${theme.card} transition-all group relative hover:translate-y-[-4px]`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`h-12 w-12 rounded-2xl ${theme.statIcon} flex items-center justify-center`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className={`h-4 w-4 ${theme.accent}`} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <h4 className={`font-black text-lg tracking-tight ${theme.text}`}>{title}</h4>
        {count !== undefined && count > 0 && (
          <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-lg font-black animate-pulse shadow-lg shadow-red-500/20">{count}</span>
        )}
      </div>
      <p className={`text-[11px] ${theme.subtext} font-bold uppercase tracking-wider mt-1`}>{desc}</p>
    </a>
  )
}