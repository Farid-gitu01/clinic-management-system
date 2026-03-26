"use client"

import { useEffect, useState } from "react"
import { database, auth } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { signOut } from "firebase/auth"
import { useAuth } from "@/lib/auth-context" 
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Users, 
  UserRound, 
  IndianRupee, 
  LayoutGrid,
  ArrowUpRight,
  PlusCircle,
  ShieldCheck,
  BarChart3,
  Stethoscope,
  BriefcaseMedical,
  Activity,
  ArrowRight,
  LogOut,
  Newspaper,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const { profile } = useAuth() 
  const router = useRouter()
  
  // Local state for clinic metadata to solve the "clinicData" error
  const [clinicDisplayName, setClinicDisplayName] = useState("Clinic")
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    appointments: 0,
    revenue: 0,
    blogs: 0,
  })
  const [loading, setLoading] = useState(true)
  const [completedAppointments, setCompletedAppointments] = useState<any[]>([])

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  useEffect(() => {
    if (!profile?.clinicId) return;

    const clinicPath = `clinics/${profile.clinicId}`;
    const blogsPath = `blogs`;

    const unsubscribeClinic = onValue(ref(database, clinicPath), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Update Clinic Name from DB
        setClinicDisplayName(data.clinicName || "Clinic");

        const allUsers = data.users || {};
        const doctorCount = Object.values(allUsers).filter((u: any) => u.role === "doctor").length;
        const patientCount = Object.values(allUsers).filter((u: any) => u.role === "patient").length;
        
        let revenue = 0;
        const completedApts: any[] = [];
        
        if (data.payments) {
          Object.values(data.payments).forEach((payment: any) => {
            if (payment.status === "completed") {
              revenue += payment.finalAmount || 0;
              completedApts.push({ 
                ...payment, 
                createdAt: payment.createdAt || Date.now() 
              });
            }
          });
        }

        setStats(prev => ({ ...prev, doctors: doctorCount, patients: patientCount, revenue }));
        setCompletedAppointments(completedApts.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5));
      }
    });

    const unsubscribeBlogs = onValue(ref(database, blogsPath), (snapshot) => {
      const blogCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
      setStats(prev => ({ ...prev, blogs: blogCount }));
      setLoading(false);
    });

    return () => {
      unsubscribeClinic();
      unsubscribeBlogs();
    };
  }, [profile?.clinicId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
        <Loader2 className="h-12 w-12 text-red-600 animate-spin mb-4" />
        <p className="text-slate-500 font-black animate-pulse uppercase tracking-[0.3em] text-[10px]">Accessing Secure Core...</p>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      <DashboardHeader 
        title="Admin Command Center" 
        description={`Full system management for ${clinicDisplayName}`}
      />

      <div className="p-4 md:p-10 max-w-[1600px] mx-auto space-y-10">
        
        {/* TOP LEVEL METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard label="Net Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={<IndianRupee size={24}/>} color="blue" />
          <MetricCard label="Total Patients" value={stats.patients} icon={<Users size={24}/>} color="indigo" />
          <MetricCard label="Active Doctors" value={stats.doctors} icon={<Stethoscope size={24}/>} color="violet" />
          <MetricCard label="Live Blog Posts" value={stats.blogs} icon={<Newspaper size={24}/>} color="emerald" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* NAVIGATION SHORTCUTS */}
          <div className="xl:col-span-4 space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <LayoutGrid size={14} className="text-red-600" /> Control Modules
                </h2>
                <Activity size={16} className="text-slate-300 animate-pulse" />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <ModuleLink 
                title="Receptionist Panel" 
                desc="Appointment Tracking & Check-ins" 
                icon={<BriefcaseMedical size={22}/>} 
                href="/dashboard/admin/receptionist" 
                color="blue"
              />
              <ModuleLink 
                title="Doctor Management" 
                desc="Profiles, Schedules & Performance" 
                icon={<UserRound size={22}/>} 
                href="/dashboard/admin/doctors" 
                color="violet"
              />
              <ModuleLink 
                title="Financial Suite" 
                desc="Detailed Revenue & Payout Logs" 
                icon={<BarChart3 size={22}/>} 
                href="/dashboard/admin/analytics" 
                color="emerald"
              />
            </div>

            {/* QUICK ACTIONS CARD */}
            <Card className="bg-slate-900 text-white border-none rounded-[2.5rem] shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-blue-400">
                  <ShieldCheck size={16} /> Instant Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <QuickActionButton icon={<PlusCircle size={18} />} label="Add Staff" href="/dashboard/admin/doctors" />
                <QuickActionButton icon={<Newspaper size={18} />} label="Post Blog" href="/dashboard/admin/blogs" />
                <QuickActionButton icon={<ArrowUpRight size={18} />} label="Reports" href="/dashboard/admin/analytics" />
                <button 
                  onClick={handleSignOut}
                  className="flex flex-col items-center justify-center p-5 rounded-[1.5rem] bg-red-500/10 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all duration-300 gap-3 group"
                >
                  <LogOut size={18} className="text-red-500 group-hover:text-white transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                </button>
              </CardContent>
            </Card>
          </div>

          {/* MAIN DATA FEED */}
          <div className="xl:col-span-8">
            <Card className="bg-white border-slate-200/60 shadow-sm rounded-[2.5rem] overflow-hidden flex flex-col h-full">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-50 py-8 px-10 gap-4">
                <div>
                  <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Financial Monitor</CardTitle>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Real-time Transaction Stream</p>
                </div>
                <Button variant="outline" className="rounded-full border-slate-200 text-slate-600 font-bold text-xs px-6" asChild>
                    <Link href="/dashboard/admin/analytics">View Analytics</Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-transparent border-none">
                        <TableHead className="px-10 py-5 text-[10px] font-black uppercase text-slate-400">Patient</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-slate-400">Type</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-slate-400 text-right px-10">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {completedAppointments.length > 0 ? (
                            completedAppointments.map((apt, i) => (
                            <TableRow key={i} className="hover:bg-slate-50/80 transition-colors border-slate-50 group">
                                <TableCell className="px-10 py-5 font-bold text-slate-700">
                                    <div className="flex flex-col">
                                        <span>{apt.patientName}</span>
                                        <span className="text-[9px] font-medium text-slate-400 uppercase">ID: {apt.id?.slice(-6)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase">
                                    {apt.diseaseType || "General"}
                                </span>
                                </TableCell>
                                <TableCell className="text-right px-10 font-black text-slate-900 text-lg">
                                    ₹{apt.finalAmount.toLocaleString()}
                                </TableCell>
                            </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-60 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                    No transaction data available
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </div>
              </CardContent>
              <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex justify-center">
                  <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-red-600 transition-colors flex items-center gap-2">
                      Export Financial Data <ArrowRight size={12}/>
                  </button>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}

/** * HELPER COMPONENTS
 */

function MetricCard({ label, value, icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-600 shadow-blue-100 text-white",
    indigo: "bg-indigo-600 shadow-indigo-100 text-white",
    violet: "bg-violet-600 shadow-violet-100 text-white",
    emerald: "bg-emerald-600 shadow-emerald-100 text-white"
  }
  return (
    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <CardContent className="p-8 flex items-center gap-6">
        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
        </div>
      </CardContent>
    </Card>
  )
}

function ModuleLink({ title, desc, icon, href, color }: any) {
  const colorMap: any = {
    blue: "text-blue-600 bg-blue-50",
    violet: "text-violet-600 bg-violet-50",
    emerald: "text-emerald-600 bg-emerald-50",
    red: "text-red-600 bg-red-50" 
  }
  return (
    <Link href={href} className="group block p-6 bg-white border border-slate-200/60 rounded-[2rem] hover:border-red-200 hover:shadow-xl hover:shadow-red-50 transition-all duration-300">
      <div className="flex items-center gap-5">
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:rounded-full ${colorMap[color]}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-base font-black text-slate-900 tracking-tight">{title}</h4>
          <p className="text-xs text-slate-400 font-medium">{desc}</p>
        </div>
        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-50 group-hover:bg-red-600 group-hover:text-white transition-all">
            <ArrowUpRight size={20} />
        </div>
      </div>
    </Link>
  )
}

function QuickActionButton({ icon, label, href }: any) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center p-5 rounded-[1.5rem] bg-white/5 border border-white/10 hover:bg-white hover:text-slate-900 transition-all duration-300 gap-3 group text-center">
      <div className="text-blue-400 group-hover:text-red-600 group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </Link>
  )
}