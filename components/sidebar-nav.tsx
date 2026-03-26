"use client"

import { useAuth } from "@/lib/auth-context"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { 
  LayoutDashboard, 
  UserRound, 
  Users, 
  CalendarDays, 
  CreditCard, 
  Settings, 
  LogOut,
  ShieldCheck,
  Activity,
  FileText,
  ClipboardList,
  UserCircle,
  ReceiptIndianRupee,
  Menu,
  X,
  Newspaper, // Import Newspaper to match Admin Dashboard
  BarChart3   // Import BarChart3 for Financial Analytics consistency
} from "lucide-react"

export function SidebarNav() {
  const { profile, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  
  const [clinicName, setClinicName] = useState<string>("SYSTEM LOADING")
  const [activeTheme, setActiveTheme] = useState<'white' | 'blue'>('white')
  const [isOpen, setIsOpen] = useState(false)

  // Listen for Clinic Settings (Name & Theme)
  useEffect(() => {
    if (!profile?.clinicId) return

    const settingsRef = ref(database, `clinics/${profile.clinicId}/systemSettings`)
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        setClinicName(data.clinicName?.toUpperCase() || "CLINIC WORKSPACE")
        setActiveTheme(data.activeTheme === 'blue' ? 'blue' : 'white')
      }
    })

    return () => unsubscribe()
  }, [profile?.clinicId])

  // Auto-close mobile sidebar on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const navItems = {
    // UPDATED: Aligned with Admin Command Center UI
    admin: [
      { href: "/dashboard/admin", label: "Command Center", icon: <LayoutDashboard size={18} /> },
      { href: "/dashboard/admin/doctors", label: "Staff Registry", icon: <UserRound size={18} /> },
      { href: "/dashboard/admin/patients", label: "Patient Hub", icon: <Users size={18} /> },
      { href: "/dashboard/admin/blogs", label: "Medical Insights", icon: <Newspaper size={18} /> },
      { href: "/dashboard/admin/appointments", label: "Schedules", icon: <CalendarDays size={18} /> },
      { href: "/dashboard/admin/analytics", label: "Financial Analytics", icon: <BarChart3 size={18} /> },
      { href: "/dashboard/admin/settings", label: "System Config", icon: <Settings size={18} /> },
    ],
    doctor: [
      { href: "/dashboard/doctor", label: "Medical Feed", icon: <LayoutDashboard size={18} /> },
      { href: "/dashboard/doctor/appointments", label: "Appointments", icon: <CalendarDays size={18} /> },
      { href: "/dashboard/doctor/billing", label: "Billing Desk", icon: <ReceiptIndianRupee size={18} /> },
      { href: "/dashboard/doctor/prescriptions", label: "Prescriptions", icon: <FileText size={18} /> },
      { href: "/dashboard/doctor/reports", label: "Clinical Reports", icon: <Activity size={18} /> },
      { href: "/dashboard/doctor/profile", label: "My Profile", icon: <UserCircle size={18} /> },
    ],
    receptionist: [
      { href: "/dashboard/receptionist", label: "Reception Desk", icon: <LayoutDashboard size={18} /> },
      { href: "/dashboard/receptionist/appointments", label: "Bookings", icon: <CalendarDays size={18} /> },
      { href: "/dashboard/receptionist/patients", label: "Patient Records", icon: <Users size={18} /> },
      { href: "/dashboard/receptionist/billing", label: "Billing Desk", icon: <CreditCard size={18} /> },
    ],
    patient: [
      { href: "/dashboard/patient", label: "Health Hub", icon: <LayoutDashboard size={18} /> },
      { href: "/dashboard/patient/appointments", label: "My Visits", icon: <CalendarDays size={18} /> },
      { href: "/dashboard/patient/records", label: "Medical History", icon: <ClipboardList size={18} /> },
    ]
  }

  const currentNav = navItems[profile?.role as keyof typeof navItems] || []

  const themeStyles = {
    white: {
      nav: "bg-white border-slate-200 shadow-sm",
      iconBox: "bg-blue-600 shadow-blue-100",
      activeItem: "bg-blue-50 text-blue-600 border-blue-100 shadow-sm",
      inactiveItem: "text-slate-500 hover:bg-slate-50 hover:text-blue-600",
      footer: "border-slate-100 bg-slate-50/50",
      profileBox: "bg-white border-slate-200",
      textPrimary: "text-slate-900",
      textSecondary: "text-slate-500",
      mobileBtn: "bg-white text-slate-900 border-slate-200"
    },
    blue: {
      nav: "bg-blue-700 border-blue-800 shadow-xl",
      iconBox: "bg-white shadow-blue-900/20",
      activeItem: "bg-white/10 text-white border-white/20 shadow-md",
      inactiveItem: "text-blue-100 hover:bg-white/5 hover:text-white",
      footer: "border-blue-800 bg-blue-800/50",
      profileBox: "bg-blue-900/40 border-blue-700",
      textPrimary: "text-white",
      textSecondary: "text-blue-200",
      mobileBtn: "bg-blue-700 text-white border-blue-600"
    }
  }

  const style = themeStyles[activeTheme]

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }

  return (
    <>
      {/* --- MOBILE TRIGGER --- */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          size="icon"
          className={`rounded-xl h-11 w-11 shadow-xl border ${style.mobileBtn}`}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* --- MOBILE OVERLAY --- */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[50] animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <nav className={`
        fixed lg:sticky top-0 left-0 h-screen z-[55] flex flex-col transition-all duration-500 border-r overflow-hidden
        ${isOpen ? "translate-x-0 w-72" : "-translate-x-full w-72 lg:translate-x-0 lg:w-72"}
        ${style.nav}
      `}>
        
        {/* Brand */}
        <div className="p-8 mt-14 lg:mt-0">
          <div className="flex items-center gap-3">
            <div className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center transition-all duration-500 ${style.iconBox}`}>
              <Activity className={`${activeTheme === 'white' ? 'text-white' : 'text-blue-600'} h-6 w-6`} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <h1 className={`text-sm font-black tracking-tighter leading-none mb-1 truncate ${style.textPrimary}`}>
                {clinicName}
              </h1>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${style.textSecondary}`}>
                {profile?.role} Portal
              </span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex-1 px-4 space-y-1.5 overflow-y-auto scrollbar-hide">
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 mb-4 opacity-60 ${style.textSecondary}`}>
            Management
          </p>
          
          {currentNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="block">
                <button className={`w-full group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300
                  ${isActive ? style.activeItem : style.inactiveItem}`}>
                  <div className="flex items-center gap-3">
                    <span className={`${isActive ? "scale-110" : "group-hover:scale-110"} transition-transform`}>
                      {item.icon}
                    </span>
                    <span className="text-[13px] font-bold tracking-tight">{item.label}</span>
                  </div>
                </button>
              </Link>
            )
          })}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t transition-colors duration-500 ${style.footer}`}>
            <div className={`flex items-center gap-3 mb-4 p-4 rounded-2xl border transition-colors ${style.profileBox}`}>
              <div className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-500`}>
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className={`text-xs font-black uppercase truncate ${style.textPrimary}`}>
                  {profile?.fullName || "Loading..."}
                </span>
                <span className={`text-[9px] font-bold ${style.textSecondary}`}>
                  ID: {profile?.clinicId?.slice(-6).toUpperCase() || "------"}
                </span>
              </div>
            </div>
            
            <Button 
              onClick={handleSignOut} 
              variant="ghost" 
              className="w-full text-red-500 hover:bg-red-500/10 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all h-12 flex items-center justify-center"
            >
              <LogOut size={16} className="mr-3" /> Sign Out
            </Button>
        </div>
      </nav>
    </>
  )
}