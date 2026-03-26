"use client"

import { useEffect, useState } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { useAuth } from "@/lib/auth-context" 
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Users, 
  UserRound, 
  CalendarCheck, 
  IndianRupee, 
  LayoutGrid,
  ArrowUpRight,
  PlusCircle,
  Printer,
  ShieldCheck,
  BarChart3,
  Stethoscope,
  BriefcaseMedical,
  History,
  Newspaper // Added for Blog icon
} from "lucide-react"

export default function AdminDashboard() {
  const { profile, clinicData } = useAuth() 
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    appointments: 0,
    revenue: 0,
    blogs: 0, // New stat for blogs
  })
  const [loading, setLoading] = useState(true)
  const [completedAppointments, setCompletedAppointments] = useState<any[]>([])

  useEffect(() => {
    if (!profile?.clinicId) return;

    const clinicPath = `clinics/${profile.clinicId}`;
    const blogsPath = `blogs`; // Global blogs path

    // Listen to Clinic Data
    const unsubscribeClinic = onValue(ref(database, clinicPath), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const allUsers = data.users || {};
        const doctors = Object.values(allUsers).filter((u: any) => u.role === "doctor").length;
        const patients = Object.values(allUsers).filter((u: any) => u.role === "patient").length;
        const appointments = data.appointments ? Object.keys(data.appointments).length : 0;

        let revenue = 0;
        const completedApts: any[] = [];
        if (data.payments) {
          Object.values(data.payments).forEach((payment: any) => {
            if (payment.status === "completed") {
              revenue += payment.finalAmount || 0;
              completedApts.push({ ...payment, createdAt: payment.createdAt || Date.now() });
            }
          });
        }

        setStats(prev => ({ ...prev, doctors, patients, appointments, revenue }));
        setCompletedAppointments(completedApts.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5));
      }
    });

    // Listen to Blog count
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Synchronizing Core...</p>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-slate-900 pb-10">
      <DashboardHeader 
        title="Admin Command Center" 
        description={`Full system access for ${clinicData?.clinicName || 'Clinic'}`}
      />

      <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
        
        {/* TOP LEVEL METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard label="Net Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={<IndianRupee />} color="blue" />
          <MetricCard label="Total Patients" value={stats.patients} icon={<Users />} color="indigo" />
          <MetricCard label="Active Doctors" value={stats.doctors} icon={<Stethoscope />} color="violet" />
          <MetricCard label="Live Blog Posts" value={stats.blogs} icon={<Newspaper />} color="emerald" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: MODULE SHORTCUTS */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <LayoutGrid size={14} /> System Modules
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              <ModuleLink 
                title="Receptionist Mgmt" 
                desc="Live Bookings & Patient Flow" 
                icon={<BriefcaseMedical />} 
                href="/dashboard/admin/receptionist" 
                color="blue"
              />
              <ModuleLink 
                title="Doctor Registry" 
                desc="Staff Profiles & Schedules" 
                icon={<UserRound />} 
                href="/dashboard/admin/doctors" 
                color="violet"
              />
              {/* NEW BLOG MODULE LINK */}
              <ModuleLink 
                title="Medical Insights Blog" 
                desc="Manage & Publish Articles" 
                icon={<Newspaper />} 
                href="/dashboard/admin/blogs" 
                color="red"
              />
              <ModuleLink 
                title="Financial Analytics" 
                desc="Revenue Logs & Extraction" 
                icon={<BarChart3 />} 
                href="/dashboard/admin/analytics" 
                color="emerald"
              />
            </div>

            {/* QUICK ACTIONS CARD */}
            <Card className="bg-slate-900 text-white border-none rounded-[2rem] overflow-hidden shadow-xl">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="text-blue-400" /> Admin Fast-Track
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <QuickActionButton icon={<PlusCircle size={16} />} label="Add Staff" href="/dashboard/admin/doctors" />
                <QuickActionButton icon={<Newspaper size={16} />} label="Post Blog" href="/dashboard/admin/blogs" />
                <QuickActionButton icon={<History size={16} />} label="Logs" href="/dashboard/admin/analytics" />
                <QuickActionButton icon={<ArrowUpRight size={16} />} label="Reports" href="/dashboard/admin/analytics" />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: REVENUE & TRANSACTIONS */}
          <div className="lg:col-span-8">
            <Card className="bg-white border-slate-200/60 shadow-sm rounded-[2rem] h-full">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-6 px-8">
                <div>
                  <CardTitle className="text-slate-900 font-black">Recent Revenue Logs</CardTitle>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Completed Transactions Only</p>
                </div>
                <Button variant="ghost" className="text-blue-600 font-bold text-xs">View All</Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-transparent border-none">
                      <TableHead className="px-8 text-[10px] font-black uppercase text-slate-400">Patient</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-slate-400">Treatment</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-slate-400 text-right px-8">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedAppointments.map((apt, i) => (
                      <TableRow key={i} className="hover:bg-slate-50/80 transition-colors border-slate-50">
                        <TableCell className="px-8 font-bold text-slate-700">{apt.patientName}</TableCell>
                        <TableCell>
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase">
                            {apt.diseaseType || "General"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right px-8 font-black text-slate-900">₹{apt.finalAmount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}

// Helper Components
function MetricCard({ label, value, icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-600 shadow-blue-200 text-white",
    indigo: "bg-indigo-600 shadow-indigo-200 text-white",
    violet: "bg-violet-600 shadow-violet-200 text-white",
    emerald: "bg-emerald-600 shadow-emerald-200 text-white"
  }
  return (
    <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden group hover:scale-[1.02] transition-all">
      <CardContent className="p-6 flex items-center gap-5">
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
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
    red: "text-red-600 bg-red-50" // Added red theme for blog
  }
  return (
    <a href={href} className="group block p-5 bg-white border border-slate-200/60 rounded-[1.5rem] hover:border-blue-200 hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${colorMap[color]}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-black text-slate-900">{title}</h4>
          <p className="text-[11px] text-slate-400 font-medium">{desc}</p>
        </div>
        <ArrowUpRight className="text-slate-300 group-hover:text-blue-600 transition-colors" size={18} />
      </div>
    </a>
  )
}

function QuickActionButton({ icon, label, href }: any) {
  return (
    <a href={href} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all gap-2 group">
      <div className="text-blue-400 group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </a>
  )
}