"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, set, onValue, update } from "firebase/database"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProtectedRoute } from "@/lib/protected-route"
import { 
  BadgeIndianRupee, 
  Stethoscope, 
  Database, 
  Save, 
  RotateCcw,
  Terminal,
  ShieldAlert,
  Zap,
  Monitor,
  PlusCircle,
  Trash2,
  Clock
} from "lucide-react"

interface SystemSettings {
  clinicName: string;
  address: string;
  contactInfo: string;
  workingHours: string;
  defaultAppointmentDuration: number;
  defaultConsultationFee: number;
  taxPercentage: number;
  discountLimit: number;
  diseaseList: string[];
  diseasesPricing: Record<string, number>;
  backupEnabled: boolean;
  activeTheme: 'system' | 'black-citrus';
}

export default function AdminSettings() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newDiseaseName, setNewDiseaseName] = useState("")

  const [settings, setSettings] = useState<SystemSettings>({
    clinicName: "",
    address: "",
    contactInfo: "",
    workingHours: "09:00 AM - 06:00 PM",
    defaultAppointmentDuration: 30,
    defaultConsultationFee: 500,
    taxPercentage: 5,
    discountLimit: 20,
    diseaseList: [],
    diseasesPricing: {},
    backupEnabled: true,
    activeTheme: 'system'
  })

  // 1. Fetch Existing Data & Pre-fill
  useEffect(() => {
    if (!profile?.clinicId) return
    const settingsRef = ref(database, `clinics/${profile.clinicId}/systemSettings`)
    
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        setSettings(data)
        applyTheme(data.activeTheme) // Apply theme to entire DOM
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [profile?.clinicId])

  // 2. Global Theme Switcher
  const applyTheme = (theme: 'system' | 'black-citrus') => {
    const root = document.documentElement;
    if (theme === 'black-citrus') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'black-citrus');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'system');
    }
  }

  const handleThemeChange = (newTheme: 'system' | 'black-citrus') => {
    setSettings(prev => ({ ...prev, activeTheme: newTheme }))
    applyTheme(newTheme)
  }

  // 3. Save Functionality
  const handleSaveSettings = async () => {
    if (!profile?.clinicId) return
    setSaving(true)
    try {
      const settingsRef = ref(database, `clinics/${profile.clinicId}/systemSettings`)
      await set(settingsRef, settings)
      // Feedback for Admin
      alert("Clinic Configuration Synchronized Successfully.")
    } catch (error) {
      console.error(error)
      alert("Security Breach or Network Error: Deployment failed.")
    } finally {
      setSaving(false)
    }
  }

  const addNewDisease = () => {
    if (!newDiseaseName.trim()) return
    const name = newDiseaseName.trim()
    setSettings(prev => ({
      ...prev,
      diseaseList: [...(prev.diseaseList || []), name],
      diseasesPricing: { ...prev.diseasesPricing, [name]: prev.defaultConsultationFee }
    }))
    setNewDiseaseName("")
  }

  const removeDisease = (name: string) => {
    setSettings(prev => {
      const newList = prev.diseaseList.filter(d => d !== name)
      const newPricing = { ...prev.diseasesPricing }
      delete newPricing[name]
      return { ...prev, diseaseList: newList, diseasesPricing: newPricing }
    })
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 space-y-4">
      <div className="h-12 w-12 border-4 border-orange-500 border-t-transparent animate-spin rounded-full" />
      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-orange-500 animate-pulse">Initializing Data Stream...</p>
    </div>
  )

  return (
    <ProtectedRoute requiredRole="admin">
      <div className={`w-full min-h-screen pb-20 transition-all duration-700 ${settings.activeTheme === 'black-citrus' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <DashboardHeader 
          title="System Architecture" 
          description={`MANAGE_CLINIC_NODE • ${profile?.clinicId?.toUpperCase()}`} 
        />

        <div className="p-4 md:p-10 max-w-[1440px] mx-auto space-y-10">
          
          {/* Action Header - Fixed Control Bar */}
          <div className={`flex flex-col md:flex-row justify-between items-center gap-6 p-6 rounded-[2rem] border transition-all ${settings.activeTheme === 'black-citrus' ? 'bg-slate-900/80 border-slate-800 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-xl'}`}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20 text-orange-500 shadow-inner">
                <Terminal className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-widest uppercase">Admin Controller</h2>
                <p className="text-[10px] text-orange-500/60 font-bold uppercase">Ready for Modification</p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl px-6 border-slate-700 hover:bg-slate-800 transition-colors">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset
              </Button>
              <Button onClick={handleSaveSettings} disabled={saving} className="bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest rounded-xl px-8 shadow-lg shadow-orange-900/30 transition-all active:scale-95">
                <Save className="h-4 w-4 mr-2" /> {saving ? "Syncing..." : "Update Clinic Data"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Core Identity & Finance */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* CLINIC IDENTITY SECTION (PRE-FILLED) */}
              <Card className={`border-none rounded-[2.5rem] overflow-hidden shadow-2xl transition-all ${settings.activeTheme === 'black-citrus' ? 'bg-slate-900/40' : 'bg-white'}`}>
                <CardHeader className="border-b border-slate-800/20 px-8 py-6">
                  <div className="flex items-center gap-3">
                    <Stethoscope className="h-5 w-5 text-orange-500" />
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Clinic Identity Hub</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Legal Clinic Name</Label>
                      <Input 
                        value={settings.clinicName} 
                        onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })} 
                        className="bg-slate-500/5 border-slate-700/50 h-14 rounded-2xl text-sm font-bold focus:ring-2 ring-orange-500 transition-all" 
                        placeholder="Enter Clinic Name"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Public Contact Info</Label>
                      <Input 
                        value={settings.contactInfo} 
                        onChange={(e) => setSettings({ ...settings, contactInfo: e.target.value })} 
                        className="bg-slate-500/5 border-slate-700/50 h-14 rounded-2xl text-sm font-bold focus:ring-2 ring-orange-500" 
                        placeholder="+91 XXXX-XXXXXX"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <Label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Working Hours</Label>
                        <Input 
                          value={settings.workingHours} 
                          onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })} 
                          className="bg-slate-500/5 border-slate-700/50 h-14 rounded-2xl text-sm font-bold focus:ring-2 ring-orange-500" 
                        />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Physical Address</Label>
                      <Input 
                        value={settings.address} 
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })} 
                        className="bg-slate-500/5 border-slate-700/50 h-14 rounded-2xl text-sm font-bold focus:ring-2 ring-orange-500" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FINANCIAL PROTOCOLS */}
              <Card className={`border-none rounded-[2.5rem] overflow-hidden shadow-2xl transition-all ${settings.activeTheme === 'black-citrus' ? 'bg-slate-900/40' : 'bg-white'}`}>
                <CardHeader className="border-b border-slate-800/20 px-8 py-6">
                  <div className="flex items-center gap-3">
                    <BadgeIndianRupee className="h-5 w-5 text-orange-500" />
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Revenue & Billing Logic</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                  <div className="grid md:grid-cols-3 gap-8">
                    <StatInput label="Base Consultation (₹)" value={settings.defaultConsultationFee} onChange={(v: any) => setSettings({ ...settings, defaultConsultationFee: v })} />
                    <StatInput label="Standard Tax (%)" value={settings.taxPercentage} onChange={(v: any) => setSettings({ ...settings, taxPercentage: v })} />
                    <StatInput label="Max Discount (%)" value={settings.discountLimit} onChange={(v: any) => setSettings({ ...settings, discountLimit: v })} />
                  </div>

                  <div className="pt-8 border-t border-slate-800/20">
                    <div className="flex justify-between items-center mb-6">
                       <Label className="text-[9px] font-black text-orange-500 uppercase tracking-[0.3em]">Specialized Disease Pricing</Label>
                       <div className="flex gap-2">
                         <Input 
                            placeholder="Add New Disease" 
                            value={newDiseaseName}
                            onChange={(e) => setNewDiseaseName(e.target.value)}
                            className="h-10 w-48 text-[11px] bg-slate-500/5 border-slate-700 rounded-xl"
                         />
                         <Button onClick={addNewDisease} size="sm" className="h-10 w-10 bg-orange-600 hover:bg-orange-500 rounded-xl">
                            <PlusCircle className="h-5 w-5" />
                         </Button>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {settings.diseaseList?.map((disease) => (
                        <div key={disease} className={`p-4 rounded-2xl border transition-all flex justify-between items-center group ${settings.activeTheme === 'black-citrus' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                          <div>
                            <Label className="text-[9px] font-black uppercase text-slate-500 block mb-1">{disease}</Label>
                            <div className="flex items-center text-orange-500 font-black">
                              <span className="text-xs mr-2">₹</span>
                              <input 
                                type="number" 
                                value={settings.diseasesPricing[disease] || 0} 
                                onChange={(e) => setSettings({...settings, diseasesPricing: {...settings.diseasesPricing, [disease]: Number(e.target.value)}})}
                                className="bg-transparent border-none text-sm w-24 focus:outline-none focus:text-orange-400 transition-colors"
                              />
                            </div>
                          </div>
                          <button onClick={() => removeDisease(disease)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Theme & Security */}
            <div className="lg:col-span-4 space-y-10">
              
              {/* THEME SELECTOR */}
              <Card className={`border-none rounded-[2.5rem] overflow-hidden shadow-2xl transition-all ${settings.activeTheme === 'black-citrus' ? 'bg-slate-900/40' : 'bg-white'}`}>
                <CardHeader className="px-8 py-6 border-b border-slate-800/20">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-orange-500" />
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Interface Theme</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <ThemeToggle 
                    active={settings.activeTheme === "system"} 
                    label="Light Protocol" 
                    icon={<Monitor size={16}/>} 
                    onClick={() => handleThemeChange("system")} 
                  />
                  <ThemeToggle 
                    active={settings.activeTheme === "black-citrus"} 
                    label="Obsidian Citrus" 
                    icon={<Zap size={16}/>} 
                    onClick={() => handleThemeChange("black-citrus")} 
                    isOrange 
                  />
                </CardContent>
              </Card>

              {/* SECURITY & BACKUP */}
              <Card className="border border-orange-500/10 bg-orange-500/5 rounded-[2.5rem] overflow-hidden shadow-lg">
                <CardHeader className="px-8 py-6 border-b border-orange-500/10">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Storage & Vault</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${settings.activeTheme === 'black-citrus' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Automatic Backups</p>
                      <p className="text-[8px] text-orange-600/50 font-bold uppercase mt-1">Daily Cloud Sync</p>
                    </div>
                    <div 
                      onClick={() => setSettings({...settings, backupEnabled: !settings.backupEnabled})}
                      className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-all ${settings.backupEnabled ? 'bg-orange-600 shadow-lg shadow-orange-900/20' : 'bg-slate-700'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${settings.backupEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                    </div>
                  </div>
                  <div className="mt-8 flex items-start gap-4 p-5 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                    <ShieldAlert className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-orange-600/70 font-bold leading-relaxed uppercase">
                      Warning: Settings propagate to all active staff terminals immediately upon update. 
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

// Sub-components for cleaner UI
function StatInput({ label, value, onChange }: any) {
  return (
    <div className="space-y-3">
      <Label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</Label>
      <Input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))} 
        className="bg-slate-500/5 border-slate-700/50 h-14 rounded-2xl text-base font-black text-orange-500 focus:ring-2 ring-orange-500 text-center" 
      />
    </div>
  )
}

function ThemeToggle({ active, label, icon, onClick, isOrange }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 ${
        active 
          ? (isOrange ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-900/10 scale-[1.02]" : "border-slate-400 bg-slate-400/10 scale-[1.02]") 
          : "border-transparent bg-slate-500/5 hover:bg-slate-500/10"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg transition-colors ${active ? "text-orange-500 bg-orange-500/10" : "text-slate-500"}`}>
          {icon}
        </div>
        <span className={`text-[11px] font-black uppercase tracking-widest ${active ? "text-orange-500" : "text-slate-500"}`}>{label}</span>
      </div>
      {active && <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />}
    </button>
  )
}