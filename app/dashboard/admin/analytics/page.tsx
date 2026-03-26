"use client"

import { useEffect, useState } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IndianRupee, ArrowDownCircle, Loader2, ReceiptIndianRupee } from "lucide-react"

export default function FinancialSuite() {
  const { profile } = useAuth()
  const [payments, setPayments] = useState<any[]>([])
  const [totals, setTotals] = useState({ gross: 0, pending: 0, count: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Safety check for clinicId
    if (!profile?.clinicId) {
        console.warn("No Clinic ID found in profile");
        return;
    }

    const paymentsRef = ref(database, `clinics/${profile.clinicId}/payments`)
    
    // 2. Real-time Listener
    const unsubscribe = onValue(paymentsRef, (snapshot) => {
      setLoading(true)
      if (snapshot.exists()) {
        const data = snapshot.val()
        
        // Convert Firebase object to Array and sort by date (Newest first)
        const list = Object.entries(data).map(([id, value]: [string, any]) => ({
            id,
            ...value
        })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        
        // 3. Calculate dynamic totals
        const gross = list
            .filter((p: any) => p.status === "completed")
            .reduce((acc, p: any) => acc + (Number(p.finalAmount) || 0), 0)
            
        const pending = list
            .filter((p: any) => p.status === "pending")
            .reduce((acc, p: any) => acc + (Number(p.finalAmount) || 0), 0)
        
        setPayments(list)
        setTotals({ gross, pending, count: list.length })
      } else {
        // Handle empty database case
        setPayments([])
        setTotals({ gross: 0, pending: 0, count: 0 })
      }
      setLoading(false)
    }, (error) => {
        console.error("Firebase Read Error:", error)
        setLoading(false)
    })

    return () => unsubscribe()
  }, [profile?.clinicId])

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] pb-20">
      <DashboardHeader 
        title="Financial Suite" 
        description="Real-time revenue tracking and payout reconciliation" 
      />
      
      <div className="p-4 md:p-10 max-w-[1400px] mx-auto space-y-8">
        
        {/* STATS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FinancialCard label="Total Gross Revenue" value={`₹${totals.gross.toLocaleString()}`} detail="All-time completed" color="emerald" />
            <FinancialCard label="Unpaid Invoices" value={`₹${totals.pending.toLocaleString()}`} detail="Awaiting patient payment" color="red" />
            <FinancialCard label="Total Transactions" value={totals.count} detail="Processed events" color="blue" />
        </div>

        {/* LEDGER TABLE */}
        <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
          <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-xl font-black tracking-tight text-slate-900">Transaction Ledger</CardTitle>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live Database Stream</p>
            </div>
            {loading ? <Loader2 className="animate-spin text-blue-600" /> : <ArrowDownCircle className="text-slate-300" />}
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
                <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-none">
                    <TableHead className="px-10 py-5 font-black text-[10px] uppercase text-slate-400">Date</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-slate-400">Patient</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-slate-400">Service/Specialty</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-slate-400">Status</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-right px-10 text-slate-400">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-60 text-center">
                                <div className="flex flex-col items-center gap-2 text-slate-400">
                                    <Loader2 className="animate-spin" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Fetching Ledger...</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : payments.length > 0 ? (
                        payments.map((p) => (
                        <TableRow key={p.id} className="hover:bg-slate-50/80 transition-all border-slate-50 group">
                            <TableCell className="px-10 font-bold text-slate-500 text-[11px]">
                                {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '---'}
                            </TableCell>
                            <TableCell className="font-black text-slate-900">
                                {p.patientName || "Walk-in Patient"}
                                <p className="text-[9px] text-slate-400 font-medium">REF: {p.id.slice(-8).toUpperCase()}</p>
                            </TableCell>
                            <TableCell className="text-xs font-bold text-slate-600">
                                {p.diseaseType || "General Consultation"}
                            </TableCell>
                            <TableCell>
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                                    p.status === 'completed' 
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                    : 'bg-orange-50 text-orange-600 border border-orange-100'
                                }`}>
                                    {p.status}
                                </span>
                            </TableCell>
                            <TableCell className="text-right px-10 font-black text-slate-900 text-lg">
                                ₹{(Number(p.finalAmount) || 0).toLocaleString()}
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-60 text-center">
                                <div className="flex flex-col items-center gap-3 text-slate-300">
                                    <ReceiptIndianRupee size={48} strokeWidth={1} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">No transactions found in this clinic</span>
                                </div>
                            </TableCell>
                        </TableRow>
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

function FinancialCard({ label, value, detail, color }: any) {
    const colorClasses: any = {
        emerald: "text-emerald-600 bg-emerald-50/50",
        red: "text-red-600 bg-red-50/50",
        blue: "text-blue-600 bg-blue-50/50"
    }

    return (
        <Card className="border-none shadow-sm rounded-[2rem] p-8 bg-white relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className={`absolute -top-4 -right-4 p-8 opacity-5 group-hover:scale-125 group-hover:opacity-10 transition-all duration-500 ${colorClasses[color]}`}>
                <IndianRupee size={120} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</p>
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">{value}</h2>
            <div className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${color === 'emerald' ? 'bg-emerald-500' : color === 'red' ? 'bg-red-500' : 'bg-blue-500'}`} />
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-tight">{detail}</p>
            </div>
        </Card>
    )
}