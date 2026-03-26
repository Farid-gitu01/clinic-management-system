"use client"

import { useEffect, useState } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from "recharts"
import { 
  TrendingUp, Users, Clock, CreditCard, 
  ArrowLeft, Download, Filter, Calendar, Activity
} from "lucide-react"
import Link from "next/link"

export default function DoctorReportsPage() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<any[]>([])
  const [statsForPie, setStatsForPie] = useState<any[]>([])
  const [summary, setSummary] = useState({
    avgConsultationTime: "14m",
    revenueGrowth: "+12%",
    patientRetention: "88%",
    totalRevenue: 0
  })

  useEffect(() => {
    if (!profile?.clinicId) return

    const appointmentsRef = ref(database, `clinics/${profile.clinicId}/appointments`)
    
    const unsubscribe = onValue(appointmentsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const appointments = Object.values(data) as any[]
        
        // 1. Weekly Volume (7-day span)
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - i)
          return d.toISOString().split('T')[0]
        }).reverse()

        const volumeChart = last7Days.map(date => ({
          name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          patients: appointments.filter(a => a.date === date).length,
          revenue: appointments.filter(a => a.date === date && a.status === "completed").length * (Number(profile?.consultationFee) || 500)
        }))

        // 2. Status Distribution (Red/Black/White Palette)
        const statusData = [
          { name: 'Completed', value: appointments.filter(a => a.status === 'completed').length, color: '#dc2626' }, // Red
          { name: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: '#0f172a' },  // Black
          { name: 'Scheduled', value: appointments.filter(a => a.status === 'scheduled').length, color: '#94a3b8' },  // Gray
        ]

        setReportData(volumeChart)
        setStatsForPie(statusData)
        
        const totalRev = appointments.filter(a => a.status === "completed").length * (Number(profile?.consultationFee) || 500)
        setSummary(prev => ({ ...prev, totalRevenue: totalRev }))
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [profile?.clinicId, profile?.consultationFee])

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <Link href="/dashboard/doctor" className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Return to Command</span>
            </Link>
            <h1 className="text-3xl font-black tracking-tighter text-slate-950 uppercase">Clinical Analytics</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Performance Data & Metric Intelligence</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white border-2 border-slate-200 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:border-red-600 transition-all">
              <Download className="w-4 h-4 text-red-600" /> Export CSV
            </button>
            <button className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-red-600 transition-all shadow-xl shadow-slate-200">
              <Calendar className="w-4 h-4 text-red-500" /> Filter Range
            </button>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SummaryCard title="Gross Revenue" value={`₹${summary.totalRevenue}`} icon={CreditCard} trend="+12.5%" theme="red" />
          <SummaryCard title="Avg. Visit Time" value={summary.avgConsultationTime} icon={Clock} trend="-2m" theme="black" />
          <SummaryCard title="Patient Retention" value={summary.patientRetention} icon={Users} trend="+4%" theme="black" />
          <SummaryCard title="Volume Trend" value="Steady" icon={TrendingUp} trend="High" theme="red" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Main Volume Chart */}
          <Card className="bg-white border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Activity Frequency</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] w-full pt-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                  />
                  <Line type="step" dataKey="patients" stroke="#dc2626" strokeWidth={4} dot={{ r: 4, fill: '#dc2626', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="bg-slate-950 border-none rounded-[2.5rem] overflow-hidden text-white shadow-2xl shadow-slate-900/20">
            <CardHeader>
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Case Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsForPie}
                    innerRadius={85}
                    outerRadius={115}
                    paddingAngle={10}
                    dataKey="value"
                  >
                    {statsForPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip cursor={{fill: 'transparent'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <Activity className="text-red-600 mb-1" size={24} />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Efficiency</span>
                <span className="text-3xl font-black">RATIO</span>
              </div>
            </CardContent>
            <div className="p-8 pt-0 flex flex-wrap justify-center gap-6">
              {statsForPie.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="h-1.5 w-6 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.name}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Daily Revenue Bar Chart */}
          <Card className="bg-white border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] lg:col-span-2 overflow-hidden">
             <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Financial Telemetry</CardTitle>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                <span className="text-slate-950 text-[10px] font-black tracking-widest">LIVE FEED</span>
              </div>
            </CardHeader>
            <CardContent className="h-[300px] w-full pt-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', fontWeight: 'bold' }} />
                  <Bar dataKey="revenue" fill="#0f172a" radius={[10, 10, 0, 0]}>
                    {reportData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === reportData.length - 1 ? '#dc2626' : '#0f172a'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}

function SummaryCard({ title, value, icon: Icon, trend, theme }: any) {
  const isRed = theme === 'red'
  return (
    <Card className={`${isRed ? 'bg-red-600 text-white' : 'bg-white text-slate-950'} border-none rounded-[2rem] p-6 relative overflow-hidden group shadow-xl transition-transform hover:scale-[1.02]`}>
      <div className={`absolute -top-2 -right-2 p-4 opacity-10 group-hover:scale-125 transition-transform ${isRed ? 'text-white' : 'text-red-600'}`}>
        <Icon size={80} strokeWidth={3} />
      </div>
      <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${isRed ? 'text-red-100' : 'text-slate-400'}`}>{title}</p>
      <div className="flex items-end justify-between relative z-10">
        <h3 className="text-3xl font-black tracking-tighter">{value}</h3>
        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${isRed ? 'bg-red-700 text-red-100' : 'bg-slate-100 text-red-600'}`}>
          {trend}
        </span>
      </div>
    </Card>
  )
}