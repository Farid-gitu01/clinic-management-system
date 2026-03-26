"use client"

import { useEffect, useState } from "react"
import { database } from "@/lib/firebase"
import { ref, update, onValue } from "firebase/database"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/lib/protected-route"
import { 
  CreditCard, 
  CheckCircle2, 
  User, 
  History,
  ArrowRight,
  X,
  Wallet,
  Globe,
  IndianRupee,
  TrendingUp,
  Clock,
  Zap,
  ShieldCheck
} from "lucide-react"
import { toast } from "sonner"

interface BillingRecord {
  id: string
  patientName: string
  date: string
  time: string
  status: string
  amount?: number
  paymentMethod?: string
}

export default function DoctorBilling() {
  const { profile } = useAuth()
  const [pendingBills, setPendingBills] = useState<BillingRecord[]>([])
  const [completedPayments, setCompletedPayments] = useState<BillingRecord[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedPatient, setSelectedPatient] = useState<BillingRecord | null>(null)
  const [paymentData, setPaymentData] = useState({
    amount: "",
    method: "cash",
    cashAmount: "",
    onlineAmount: ""
  })

  useEffect(() => {
    if (!profile?.clinicId) return
    const appointmentsRef = ref(database, `clinics/${profile.clinicId}/appointments`)
    const unsubscribe = onValue(appointmentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const allRecords = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        }))
        setPendingBills(allRecords.filter(apt => apt.status === "in-consultation"))
        setCompletedPayments(
          allRecords.filter(apt => apt.status === "completed")
            .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
        )
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [profile?.clinicId])

  const totalRevenue = completedPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0)

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient || !paymentData.amount) return

    try {
      const finalAmount = Number(paymentData.amount)
      const updates: any = {}
      updates[`clinics/${profile?.clinicId}/appointments/${selectedPatient.id}/status`] = "completed"
      updates[`clinics/${profile?.clinicId}/appointments/${selectedPatient.id}/amount`] = finalAmount
      updates[`clinics/${profile?.clinicId}/appointments/${selectedPatient.id}/paymentMethod`] = paymentData.method
      
      if (paymentData.method === "mixed") {
        updates[`clinics/${profile?.clinicId}/appointments/${selectedPatient.id}/splitDetails`] = {
          cash: Number(paymentData.cashAmount),
          online: Number(paymentData.onlineAmount)
        }
      }

      updates[`clinics/${profile?.clinicId}/appointments/${selectedPatient.id}/paymentDate`] = Date.now()
      updates[`clinics/${profile?.clinicId}/appointments/${selectedPatient.id}/updatedAt`] = Date.now()

      await update(ref(database), updates)
      toast.success(`Payment processed for ${selectedPatient.patientName}`)
      setSelectedPatient(null)
      setPaymentData({ amount: "", method: "cash", cashAmount: "", onlineAmount: "" })
    } catch (error) {
      toast.error("Failed to process payment")
    }
  }

  return (
    <ProtectedRoute requiredRole="doctor">
      <div className="w-full min-h-screen bg-[#f1f5f9] dark:bg-[#020617] p-4 md:p-8 transition-colors duration-500">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <DashboardHeader 
              title="Finance Hub" 
              description="Monitor clinic revenue and finalize patient settlements." 
            />
            {/* Quick Stats Banner */}
            <div className="flex gap-4 mb-2">
                <div className="bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Gross Volume</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: SETTLEMENT AREA */}
            <div className="lg:col-span-8 space-y-6">
              
              {selectedPatient ? (
                <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Zap className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black tracking-tight">Checkout Terminal</h3>
                            <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Patient: {selectedPatient.patientName}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white" onClick={() => setSelectedPatient(null)}>
                      <X className="h-6 w-6" />
                    </Button>
                  </div>

                  <CardContent className="p-10">
                    <form onSubmit={handleFinalSubmit} className="space-y-10">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                <IndianRupee className="h-3 w-3" /> Set Consultation Fee
                            </label>
                            <div className="relative group">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-300 group-focus-within:text-emerald-500 transition-colors">₹</span>
                                <input 
                                    type="number" required
                                    className="w-full pl-14 pr-6 py-8 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white dark:focus:bg-slate-800 text-4xl font-black outline-none transition-all"
                                    placeholder="0"
                                    value={paymentData.amount}
                                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Select Mode</label>
                            <div className="grid grid-cols-1 gap-3">
                            {[
                                { id: 'cash', label: 'Physical Cash', icon: Wallet, desc: 'Direct Handover' },
                                { id: 'online', label: 'Online Transfer', icon: Globe, desc: 'UPI / Card / Net' },
                                { id: 'mixed', label: 'Mixed Payment', icon: CreditCard, desc: 'Split Settlement' }
                            ].map((m) => (
                                <button
                                    key={m.id} type="button"
                                    onClick={() => setPaymentData({...paymentData, method: m.id})}
                                    className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${paymentData.method === m.id ? 'border-emerald-500 bg-emerald-500/5 shadow-inner' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'}`}
                                >
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${paymentData.method === m.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                        <m.icon className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase tracking-widest">{m.label}</p>
                                        <p className="text-[9px] text-slate-400 font-bold">{m.desc}</p>
                                    </div>
                                </button>
                            ))}
                            </div>
                        </div>
                      </div>

                      {paymentData.method === 'mixed' && (
                        <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] animate-in zoom-in-95 duration-300">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash Portion</label>
                            <input type="number" className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none font-black text-emerald-600" placeholder="₹0" value={paymentData.cashAmount} onChange={(e) => setPaymentData({...paymentData, cashAmount: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Online Portion</label>
                            <input type="number" className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none font-black text-blue-600" placeholder="₹0" value={paymentData.onlineAmount} onChange={(e) => setPaymentData({...paymentData, onlineAmount: e.target.value})} />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                        <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">Updating this record will finalize the visit and move the appointment to the completed archive. Ensure the amount is verified with the patient.</p>
                      </div>

                      <Button className="w-full h-20 rounded-[1.5rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.3em] shadow-2xl shadow-emerald-500/30 text-xs active:scale-[0.98] transition-all">
                        Finalize & Close Session
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Ready for Settlement
                    </h3>
                    <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">{pendingBills.length}</span>
                  </div>

                  {pendingBills.length === 0 ? (
                    <div className="h-[400px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center bg-white/30 backdrop-blur-sm">
                      <div className="h-20 w-20 rounded-[2rem] bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-10 w-10 text-slate-200" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">All caught up</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingBills.map((bill) => (
                        <Card key={bill.id} className="group border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex flex-col gap-6">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-black text-xl">
                                    {bill.patientName.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{bill.patientName}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                        </span>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Active Consultation</p>
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase">{bill.time}</span>
                              </div>
                              
                              <Button onClick={() => setSelectedPatient(bill)} className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] h-12 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                Process Bill <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT: REVENUE LOGS */}
            <div className="lg:col-span-4 space-y-6">
              <div className="px-2 flex justify-between items-center">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <History className="h-4 w-4" /> Activity Log
                </h3>
              </div>
              <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-0">
                  <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                    {completedPayments.length === 0 ? (
                      <div className="p-12 text-center text-[10px] text-slate-400 font-black uppercase italic tracking-widest">No Recent Transactions</div>
                    ) : (
                      completedPayments.map((pay) => (
                        <div key={pay.id} className="p-5 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <p className="font-black text-sm text-slate-900 dark:text-white">{pay.patientName}</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${pay.paymentMethod === 'online' ? 'bg-blue-500/10 text-blue-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                    {pay.paymentMethod}
                                </span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{pay.date}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-slate-900 dark:text-white">₹{pay.amount}</p>
                              <p className="text-[8px] font-bold text-emerald-500 uppercase">Paid</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">End of History</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}