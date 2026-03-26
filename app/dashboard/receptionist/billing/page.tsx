"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Receipt, 
  ChevronLeft, 
  Printer, 
  Search, 
  Filter,
  CheckCircle2,
  User,
  ArrowRight,
  MapPin,
  Phone,
  Pill,
  FileText
} from "lucide-react"

export default function BillingDesk() {
  // Casting to any to bypass the 'Property does not exist' TS error
  const { profile }: any = useAuth()
  const router = useRouter()
  
  const [readyToBillList, setReadyToBillList] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterDoctor, setFilterDoctor] = useState("")
  const [printData, setPrintData] = useState<any | null>(null)

  useEffect(() => {
    if (!profile?.clinicId) return
    const apptsRef = ref(database, `clinics/${profile.clinicId}/appointments`)
    
    return onValue(apptsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const list = Object.entries(data)
          .map(([id, val]: any) => ({ id, ...val }))
          .filter(appt => appt.status === "ready_for_billing")
          .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
        setReadyToBillList(list)
      } else {
        setReadyToBillList([])
      }
    })
  }, [profile?.clinicId])

  const filteredData = readyToBillList.filter(appt => {
    const matchesSearch = appt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          appt.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDoctor = filterDoctor === "" || appt.doctorName === filterDoctor
    return matchesSearch && matchesDoctor
  })

  const handlePrintInvoice = (appt: any) => {
    setPrintData(appt)
    setTimeout(() => {
      window.print()
    }, 200)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      
      {/* 1. BLUE & WHITE MEDICAL PRESCRIPTION TEMPLATE */}
      {printData && (
        <div id="invoice-print-area" className="hidden print:block p-8 bg-white text-slate-900">
          {/* Header Section */}
          <div className="flex justify-between items-start border-b-4 border-blue-600 pb-6 mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-blue-700 uppercase tracking-tighter">
                {profile?.clinicName || "Medical Center"}
              </h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                <MapPin size={12} className="text-blue-600" /> 
                {profile?.address || "Clinic Address"}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                <Phone size={12} className="text-blue-600" /> 
                {profile?.phone || "Contact Number"}
              </div>
            </div>
            <div className="text-right">
              <div className="bg-blue-600 text-white px-6 py-1 text-xl font-black uppercase mb-2 italic">Rx</div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Medical Prescription</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">ID: {printData.id.slice(-6).toUpperCase()}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Patient & Doctor Info */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div className="bg-blue-50 p-5 border-l-4 border-blue-600 rounded-r-xl">
              <p className="text-[10px] font-black text-blue-700 uppercase mb-1 tracking-widest">Patient</p>
              <h3 className="text-xl font-black uppercase text-slate-800">{printData.patientName}</h3>
              <p className="text-xs font-bold text-slate-600 uppercase">Age: {printData.age} • Gender: {printData.gender}</p>
            </div>
            <div className="bg-slate-50 p-5 border-l-4 border-slate-400 text-right rounded-r-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">Prescribed By</p>
              <h3 className="text-xl font-black uppercase text-blue-700">Dr. {printData.doctorName}</h3>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-tight">
                {printData.prescription?.doctorSpecialization || "General Physician"}
              </p>
            </div>
          </div>

          {/* Clinical Notes */}
          {printData.prescription?.clinicalNotes && (
            <div className="mb-10">
              <div className="flex items-center gap-2 border-b border-blue-100 pb-2 mb-4">
                <FileText size={18} className="text-blue-600" />
                <h4 className="text-xs font-black uppercase text-blue-700 tracking-wider">Clinical Advice & Diagnosis</h4>
              </div>
              <p className="text-[13px] text-slate-700 leading-relaxed font-semibold bg-slate-50 p-5 rounded-2xl border border-slate-100">
                {printData.prescription.clinicalNotes}
              </p>
            </div>
          )}

          {/* Medication Table */}
          <div className="mb-12">
            <div className="flex items-center gap-2 border-b border-blue-100 pb-2 mb-4">
              <Pill size={18} className="text-blue-600" />
              <h4 className="text-xs font-black uppercase text-blue-700 tracking-wider">Drug Regimen</h4>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest">
                  <th className="p-4 rounded-tl-xl">Medicine Name</th>
                  <th className="p-4">Dosage</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4 rounded-tr-xl">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {printData.prescription?.medications?.map((med: any, i: number) => (
                  <tr key={i} className="text-[12px] font-bold text-slate-800 bg-white">
                    <td className="p-4 uppercase text-blue-800">{med.name}</td>
                    <td className="p-4">{med.dosage}</td>
                    <td className="p-4">{med.duration}</td>
                    <td className="p-4 text-slate-500 font-medium italic">{med.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signature Footer */}
          <div className="mt-20 grid grid-cols-2 items-end pt-10 border-t border-slate-100">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">This is a digitally authorized medical record.</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Generated via {profile?.clinicName} Portal</p>
            </div>
            <div className="text-center ml-auto w-56">
              <div className="h-16 border-b-2 border-blue-600 mb-2 relative">
                <span className="absolute bottom-1 right-0 text-[10px] text-blue-200 uppercase font-black opacity-20 italic">Verified Digitally</span>
              </div>
              <p className="text-[11px] font-black uppercase text-blue-800 tracking-widest">Dr. {printData.doctorName}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase italic">Authorized Signature & Stamp</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. DASHBOARD VIEW */}
      <div className="max-w-7xl mx-auto space-y-6 print:hidden no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
             <button onClick={() => router.back()} className="p-3 bg-white rounded-2xl shadow-sm hover:bg-slate-50 transition-all">
                <ChevronLeft size={20} />
             </button>
             <div>
                <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2 text-slate-800">
                  <Receipt className="text-blue-600" /> Billing Desk
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage Prescriptions & Invoicing</p>
             </div>
          </div>
          <div className="bg-white px-6 py-2 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase">Awaiting Action</p>
              <p className="text-xl font-black text-blue-600">{filteredData.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Search patient name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-12 rounded-2xl border-none shadow-sm bg-white font-medium focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              className="w-full h-14 pl-12 pr-4 rounded-2xl border-none shadow-sm bg-white font-black uppercase text-xs appearance-none cursor-pointer"
              onChange={(e) => setFilterDoctor(e.target.value)}
            >
              <option value="">All Doctors</option>
              {[...new Set(readyToBillList.map(a => a.doctorName))].map(doc => (
                <option key={doc} value={doc}>Dr. {doc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* List Table */}
        <Card className="border-none rounded-[2rem] shadow-xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">
                  <th className="p-6">Patient</th>
                  <th className="p-6">Physician</th>
                  <th className="p-6 text-center">Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.map((appt) => (
                  <tr key={appt.id} className="group hover:bg-blue-50/30 transition-all">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase text-slate-900">{appt.patientName}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">ID: {appt.id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-xs font-bold text-slate-600 uppercase">Dr. {appt.doctorName}</p>
                    </td>
                    <td className="p-6 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase">
                        <CheckCircle2 size={12} /> Authorized Rx
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                         <button 
                            onClick={() => handlePrintInvoice(appt)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                          >
                            <Printer size={14} /> PRINT PRESCRIPTION
                         </button>
                         <button 
                           onClick={() => router.push(`/dashboard/receptionist/billing/checkout?id=${appt.id}`)}
                           className="p-2.5 bg-slate-100 text-slate-400 hover:text-blue-600 rounded-xl transition-colors"
                         >
                           <ArrowRight size={18} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .no-print, .print\\:hidden { display: none !important; }
          #invoice-print-area, #invoice-print-area * { visibility: visible; }
          #invoice-print-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 40px;
          }
          @page { size: portrait; margin: 0; }
        }
      `}</style>
    </div>
  )
}