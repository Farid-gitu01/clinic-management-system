"use client"

import { useEffect, useState } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue, update, remove } from "firebase/database"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Stethoscope, TrendingUp, Users, Plus, 
  Trash2, Edit3, Loader2, ShieldCheck, Mail, Hash
} from "lucide-react"
import { toast } from "sonner"

export default function DoctorManagement() {
  const { profile } = useAuth()
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    id: "", 
    name: "",
    email: "",
    phone: "",
    specialization: "",
    registrationNo: "",
    experience: "",
  })

  useEffect(() => {
    // FIX: Only proceed if profile and clinicId exist
    if (!profile?.clinicId) return

    const clinicRef = ref(database, `clinics/${profile.clinicId}`)
    const unsubscribe = onValue(clinicRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const users = data.users || {}
        const payments = data.payments || {}

        const doctorList = Object.entries(users)
          .filter(([_, user]: any) => user.role === "doctor")
          .map(([id, user]: any) => {
            const drPayments = Object.values(payments).filter((p: any) => p.doctorId === id && p.status === "completed")
            const totalRevenue = drPayments.reduce((acc: number, p: any) => acc + (p.finalAmount || 0), 0)
            
            return {
              id,
              ...user,
              totalPatients: drPayments.length,
              revenue: totalRevenue,
            }
          })
        setDoctors(doctorList)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [profile?.clinicId])

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    // FIX: Error 18047 - Explicit null check for profile
    if (!profile || !profile.clinicId) {
        toast.error("Unauthorized: Clinic ID not found")
        return
    }

    setIsSubmitting(true)

    try {
      const doctorId = formData.id || `dr_${Date.now()}`
      const newDoctorData = {
        ...formData,
        id: doctorId,
        role: "doctor",
        updatedAt: Date.now(),
        clinicId: profile.clinicId
      }

      const updates: any = {}
      updates[`clinics/${profile.clinicId}/users/${doctorId}`] = newDoctorData
      
      await update(ref(database), updates)
      toast.success(formData.id ? "Credentials Updated" : "Practitioner Registered")
      setIsAddModalOpen(false)
      resetForm()
    } catch (error) {
      toast.error("Database Sync Failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (doctorId: string) => {
    if (!profile?.clinicId) return
    if (!confirm("Are you sure? This will remove the doctor from clinical records.")) return
    
    try {
      await remove(ref(database, `clinics/${profile.clinicId}/users/${doctorId}`))
      toast.success("Record Deleted")
    } catch (error) {
      toast.error("Operation Failed")
    }
  }

  const resetForm = () => {
    setFormData({ id: "", name: "", email: "", phone: "", specialization: "", registrationNo: "", experience: "" })
  }

  if (loading) {
      return (
          <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
              <Loader2 className="w-10 h-10 text-slate-300 animate-spin" />
          </div>
      )
  }

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] pb-24">
      <DashboardHeader 
        title="Staff Management" 
        description="Monitor performance and manage medical practitioner registries" 
      />
      
      <div className="px-6 md:px-10 max-w-[1440px] mx-auto space-y-8 mt-6">
        
        {/* STATS & ACTION ROW */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto flex-1">
                <StatsMiniCard label="Active Doctors" value={doctors.length} icon={<Users size={18}/>} color="blue" />
                <StatsMiniCard label="Total Revenue" value={`₹${doctors.reduce((a,b)=> a+b.revenue, 0).toLocaleString()}`} icon={<TrendingUp size={18}/>} color="emerald" />
                <StatsMiniCard label="Patient Load" value={doctors.reduce((a,b)=> a+b.totalPatients, 0)} icon={<Stethoscope size={18}/>} color="orange" />
            </div>

            <Dialog open={isAddModalOpen} onOpenChange={(open) => { setIsAddModalOpen(open); if(!open) resetForm(); }}>
                <DialogTrigger asChild>
                    <Button className="w-full lg:w-auto bg-slate-900 text-white rounded-2xl h-14 px-8 font-bold gap-3 hover:shadow-lg hover:shadow-slate-200 transition-all">
                        <Plus size={20} /> Add New Doctor
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px] rounded-[2rem] border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">
                            {formData.id ? "Edit Practitioner" : "Register Practitioner"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveDoctor} className="space-y-6 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</Label>
                                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none" placeholder="e.g. Dr. Robert Fox" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</Label>
                                <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Number</Label>
                                <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Specialization</Label>
                                <Input required value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reg. Number</Label>
                                <Input value={formData.registrationNo} onChange={e => setFormData({...formData, registrationNo: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none" />
                            </div>
                        </div>
                        <Button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-12 transition-all">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : "Sync with Registry"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

        {/* DATA TABLE */}
        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-50 px-8 py-6">
            <CardTitle className="text-lg font-black flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg"><ShieldCheck className="text-blue-600 w-5 h-5" /></div>
                Medical Practitioner List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
                <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="px-8 h-12 font-bold text-[10px] uppercase text-slate-400">Practitioner</TableHead>
                    <TableHead className="h-12 font-bold text-[10px] uppercase text-slate-400">Field</TableHead>
                    <TableHead className="h-12 font-bold text-[10px] uppercase text-slate-400">Activity</TableHead>
                    <TableHead className="h-12 font-bold text-[10px] uppercase text-slate-400 text-right">Revenue</TableHead>
                    <TableHead className="h-12 font-bold text-[10px] uppercase text-slate-400 text-center px-8">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {doctors.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-40 text-center text-slate-400 font-medium">No doctors registered in this clinic.</TableCell>
                        </TableRow>
                    ) : (
                        doctors.map((dr) => (
                        <TableRow key={dr.id} className="hover:bg-slate-50/50 border-slate-50 group">
                            <TableCell className="px-8 py-5">
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-900 leading-none mb-1">Dr. {dr.name}</span>
                                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1"><Mail size={10}/> {dr.email}</span>
                            </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="rounded-md bg-white text-slate-600 border-slate-200 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5">
                                    {dr.specialization || "General"}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700">{dr.totalPatients} Appointments</span>
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1"><Hash size={10}/> {dr.registrationNo || 'N/A'}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-black text-slate-900">₹{dr.revenue.toLocaleString()}</TableCell>
                            <TableCell className="px-8">
                                <div className="flex items-center justify-center gap-1">
                                    <Button 
                                        onClick={() => { setFormData(dr); setIsAddModalOpen(true); }}
                                        variant="ghost" className="h-9 w-9 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                    >
                                        <Edit3 size={16} />
                                    </Button>
                                    <Button 
                                        onClick={() => handleDelete(dr.id)}
                                        variant="ghost" className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                        ))
                    )}
                </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatsMiniCard({ label, value, icon, color }: any) {
    const theme: any = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        orange: "bg-orange-50 text-orange-600"
    }
    return (
        <div className="bg-white p-5 rounded-[1.5rem] shadow-sm flex items-center gap-4 border border-slate-100 flex-1 min-w-[200px]">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${theme[color]}`}>{icon}</div>
            <div className="overflow-hidden">
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider truncate">{label}</p>
                <p className="text-xl font-black text-slate-900 truncate">{value}</p>
            </div>
        </div>
    )
}