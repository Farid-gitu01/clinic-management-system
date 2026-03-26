"use client"

import Link from "next/link"
import { Building2, UserPlus, ArrowRight, Stethoscope, ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function GetStartedSelection() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 font-sans text-slate-900 overflow-x-hidden">
      
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#004e64]/5 to-transparent -z-10" />

      {/* Header Section */}
      <div className="mb-10 md:mb-16 text-center max-w-2xl">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-[#004e64] flex items-center justify-center shadow-xl shadow-[#004e64]/20 mb-6 mx-auto animate-in fade-in zoom-in duration-700">
          <Stethoscope className="w-8 h-8 md:w-10 md:h-10 text-white" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 text-slate-900 uppercase">
          Initialize <span className="text-[#004e64]">Deployment</span>
        </h1>
        <p className="text-slate-500 text-sm md:text-lg font-medium tracking-tight">
          Select your entry point to the SmartClinics clinical ecosystem.
        </p>
      </div>

      {/* Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl w-full">
        
        {/* Option 1: New Clinic (Peacock Blue Focus) */}
        <Link href="/register-clinic" className="group h-full">
          <Card className="bg-white border-2 border-slate-100 group-hover:border-[#004e64] transition-all duration-300 h-full p-6 md:p-10 rounded-[2.5rem] shadow-sm group-hover:shadow-2xl group-hover:shadow-[#004e64]/10 relative overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#004e64]/10 flex items-center justify-center mb-6 text-[#004e64] group-hover:bg-[#004e64] group-hover:text-white transition-all duration-500">
                <Building2 className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-black mb-4 text-slate-900 group-hover:text-[#004e64] transition-colors">
                Clinic Registration
              </h3>
              
              <p className="text-slate-500 text-sm md:text-base mb-8 leading-relaxed font-medium">
                Establish a new digital workspace for your practice. Ideal for clinic owners, hospital admins, and private practitioners.
              </p>
              
              <div className="mt-auto flex items-center gap-3 text-[#004e64] font-black text-xs md:text-sm uppercase tracking-widest">
                Configure Environment <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Option 2: Individual Login (Subtle Slate/Peacock) */}
        <Link href="/auth/signup" className="group h-full">
          <Card className="bg-slate-50 border-2 border-transparent group-hover:border-slate-200 transition-all duration-300 h-full p-6 md:p-10 rounded-[2.5rem] shadow-sm group-hover:shadow-xl relative overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white flex items-center justify-center mb-6 text-slate-400 group-hover:text-[#004e64] shadow-sm transition-all duration-500">
                <UserPlus className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-black mb-4 text-slate-900">
                Member Access
              </h3>
              
              <p className="text-slate-500 text-sm md:text-base mb-8 leading-relaxed font-medium">
                Onboard as an authorized doctor, specialist, or receptionist within an existing clinical organization.
              </p>
              
              <div className="mt-auto flex items-center gap-3 text-slate-400 group-hover:text-slate-900 font-black text-xs md:text-sm uppercase tracking-widest transition-colors">
                Access Workspace <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Footer Navigation */}
      <div className="mt-12 md:mt-16 flex flex-col items-center gap-4">
        <Link href="/">
            <Button variant="ghost" className="text-slate-400 hover:text-[#004e64] font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                <ArrowLeft size={14} /> Back to Main Site
            </Button>
        </Link>
        <div className="flex gap-6 text-[10px] text-slate-300 font-black uppercase tracking-widest mt-4">
            <span>HIPAA Secure</span>
            <span>Clinical Cloud v2.0</span>
            <span>SSL Certified</span>
        </div>
      </div>
    </div>
  )
}