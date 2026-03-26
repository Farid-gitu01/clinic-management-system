"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  ShieldCheck,
  BarChart3,
  Zap,
  Users,
  Smartphone,
  Lock,
  ArrowRight,
  Stethoscope,
  Plus,
  Menu,
  X,
  MessageSquare,
  Send,
  Loader2,
  Mail,
  MapPin,
  CheckCircle2,
  ArrowUpRight
} from "lucide-react"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  // Chatbot States
  const [messages, setMessages] = useState([
    { role: "model", text: "Hello! I am your SmartClinics assistant. How can I help you manage your clinic today?" }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const s = {
    bg: "bg-white",
    primary: "red-600",
    textPrimary: "text-red-600",
    btn: "bg-red-600 hover:bg-red-700 hover:shadow-lg hover:shadow-red-200 transition-all duration-300",
  }

  // Handle Scroll styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, loading, router])

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return
    const userMsg = { role: "user", text: input }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput("")
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: updatedMessages.slice(1, -1).map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          }))
        })
      })
      const data = await response.json()
      if (data.text) {
        setMessages((prev) => [...prev, { role: "model", text: data.text }])
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "model", text: "Connection error. Please try again!" }])
    } finally {
      setIsTyping(false)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${s.bg}`}>
        <div className="flex flex-col items-center gap-4">
          <div className={`h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent shadow-xl`}></div>
          <p className={`${s.textPrimary} animate-pulse font-black tracking-[0.3em] uppercase text-xs`}>SmartCLINICS</p>
        </div>
      </div>
    )
  }

  const features = [
    { image: "/images/secure-auth-image.png", icon: <ShieldCheck />, title: "Secure Auth", description: "Biometric-grade security with advanced role-based permissions." },
    { image: "/images/smart-analytics.jpeg", icon: <BarChart3 />, title: "Smart Analytics", description: "Real-time data visualizations for clinical performance." },
    { image: "/images/fast-performance.png", icon: <Zap />, title: "Fast Performance", description: "Sub-second database queries and interactions." },
    { image: "/images/multiple-user-image.jpeg", icon: <Users />, title: "Multi-Role Portals", description: "Admin, Doctor, and Patient specialized interfaces." },
    { image: "/images/responsive-design-image.jpeg", icon: <Smartphone />, title: "Fully Responsive", description: "Access flawlessly across Desktop, Tablet, and Mobile." },
    { image: "/images/hipaa-image.jpeg", icon: <Lock />, title: "HIPAA Ready", description: "Enterprise encryption standards for data privacy." },
  ]

  return (
    <div className={`min-h-screen ${s.bg} text-slate-900 font-sans selection:bg-red-50 selection:text-red-600 overflow-x-hidden scroll-smooth`}>

      {/* HEADER & NAV */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${scrolled || isMenuOpen ? "bg-white/95 backdrop-blur-md py-4 border-b border-slate-100" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group relative z-[110]">
            <div className={`w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-200 transition-transform group-hover:scale-110`}>
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter">
              Smart<span className={`${s.textPrimary} uppercase`}>Clinics</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            {["Home", "About", "Features", "Blogs", "Contact"].map((item) => (
              <Link key={item} href={item === "Home" ? "#" : item === "Blogs" ? "/blog" : `#${item.toLowerCase()}`} className="text-sm font-bold text-slate-600 hover:text-red-600 transition-colors">
                {item}
              </Link>
            ))}
            <div className="h-5 w-[1px] bg-slate-200" />
            <Link href="/auth/login" className="text-sm font-bold text-slate-600 hover:text-red-600">Sign In</Link>
            <Button asChild className={`rounded-full px-8 bg-red-600 text-white shadow-xl shadow-red-100 border-none`}>
              <Link href="/get-started">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Toggle Button */}
          <button 
            className="lg:hidden p-2 text-red-600 relative z-[110] hover:bg-red-50 rounded-lg transition-colors" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <div className={`fixed inset-0 bg-white z-[90] flex flex-col items-center justify-center gap-8 transition-all duration-500 ease-in-out lg:hidden ${isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"}`}>
        <div className="flex flex-col items-center gap-6 w-full px-6">
          {["Home", "About", "Features", "Blogs", "Contact"].map((item) => (
            <Link 
              key={item} 
              onClick={() => setIsMenuOpen(false)} 
              href={item === "Home" ? "#" : item === "Blogs" ? "/blog" : `#${item.toLowerCase()}`} 
              className="text-4xl font-black text-slate-900 hover:text-red-600 transition-colors py-2"
            >
              {item}
            </Link>
          ))}
          <div className="w-full h-[1px] bg-slate-100 my-4" />
          <Link onClick={() => setIsMenuOpen(false)} href="/auth/login" className="text-xl font-bold text-slate-600">Sign In</Link>
          <Button asChild onClick={() => setIsMenuOpen(false)} className={`rounded-full h-16 w-full max-w-xs text-lg bg-red-600 text-white shadow-2xl shadow-red-200`}>
            <Link href="/auth/signup">Get Started</Link>
          </Button>
        </div>
      </div>

      {/* HERO SECTION */}
      <header className="relative pt-40 pb-20 md:pt-60 md:pb-40 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-red-50/50 blur-[120px] rounded-full -z-10" />
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm text-red-600 text-[11px] font-black uppercase tracking-[0.2em] mb-10">
            <Plus className="w-3 h-3 animate-pulse" /> System V2.0 Enterprise Ready
          </div>
          <h1 className="text-6xl md:text-[110px] font-black tracking-tighter mb-8 leading-[0.85] text-slate-900">
            CLINICAL CARE <br />
            <span className="text-red-600">EVOLVED.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
            Automate your medical workflow with the most advanced clinical operating system. Secure, fast, and built for modern healthcare.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Button size="lg" className="rounded-full h-16 px-10 text-lg bg-red-600 hover:bg-red-700 shadow-2xl shadow-red-200 transition-all hover:-translate-y-1" asChild>
              <Link href="/auth/signup">Deploy System <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full h-16 px-10 text-lg border-slate-200 hover:bg-slate-50 text-slate-600" asChild>
              <Link href="#about">Learn More</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ABOUT SECTION */}
      <section id="about" className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7 bg-white p-10 md:p-16 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col justify-center">
              <span className="text-red-600 font-black text-xs uppercase tracking-[0.2em] mb-6 block">Our Mission</span>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 leading-tight">Focus on Patients, <br/>We'll handle the <span className="text-red-600">Rest.</span></h2>
              <p className="text-slate-500 text-lg font-medium leading-relaxed mb-10">
                SmartClinics was founded to bridge the gap between complex medical data and seamless patient care. We provide a robust ecosystem where administrative tasks are automated, allowing medical professionals to focus on saving lives.
              </p>
              <div className="flex flex-wrap gap-4">
                {["Cloud-Native", "HIPAA Compliant", "Real-time"].map(tag => (
                  <div key={tag} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-50 border border-slate-100 text-sm font-bold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-red-600" /> {tag}
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5 flex flex-col gap-8">
              <div className="flex-1 bg-red-600 rounded-[3rem] p-10 text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <h4 className="text-5xl font-black mb-2 italic">99.9%</h4>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">Uptime Guaranteed</p>
                </div>
                <Zap className="absolute -bottom-4 -right-4 w-40 h-40 text-white/10 group-hover:rotate-12 transition-transform duration-700" />
              </div>
              <div className="flex-1 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <h4 className="text-5xl font-black mb-2 italic">10k+</h4>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">Clinics Empowered</p>
                </div>
                <Users className="absolute -bottom-4 -right-4 w-40 h-40 text-white/10 group-hover:-rotate-12 transition-transform duration-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <span className="text-red-600 font-black text-xs uppercase tracking-[0.2em] mb-4 block">Core Infrastructure</span>
            <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tight">Built for modern medicine</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="group bg-white border border-slate-100 rounded-[3rem] p-4 transition-all hover:border-red-100 hover:shadow-2xl hover:-translate-y-2">
                <div className="relative h-64 w-full overflow-hidden rounded-[2.5rem] mb-8">
                  <Image 
                    src={feature.image} 
                    alt={feature.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
                </div>
                <div className="px-6 pb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center transition-colors group-hover:bg-red-600 group-hover:text-white">
                      <feature.icon.type className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">{feature.title}</h3>
                  </div>
                  <p className="text-slate-500 font-medium leading-relaxed mb-6">{feature.description}</p>
                  <div className="flex items-center text-red-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ArrowUpRight className="ml-1 w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-[4rem] p-8 md:p-20 relative overflow-hidden flex flex-col lg:flex-row gap-20">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/10 blur-[150px] rounded-full" />
          
          <div className="flex-1 relative z-10">
            <span className="text-red-500 font-black text-xs uppercase tracking-[0.3em] mb-6 block">Ready to start?</span>
            <h2 className="text-5xl md:text-8xl font-black text-white mb-8 leading-tight">Get in touch <br/>with the <span className="text-red-600">Team.</span></h2>
            <div className="space-y-8 mt-12">
              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all"><Mail size={24}/></div>
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Email Us</p>
                  <p className="text-xl font-bold text-white">support@smartclinics.ai</p>
                </div>
              </div>
              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all"><MapPin size={24}/></div>
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Visit Us</p>
                  <p className="text-xl font-bold text-white">Medical Plaza, Tech City, NY</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-[3rem] p-10 relative z-10 shadow-2xl">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</label>
                  <input type="text" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 outline-none focus:ring-2 focus:ring-red-600 transition-all text-sm" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Clinic Email</label>
                  <input type="email" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 outline-none focus:ring-2 focus:ring-red-600 transition-all text-sm" placeholder="john@clinic.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Message</label>
                <textarea rows={4} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 outline-none focus:ring-2 focus:ring-red-600 transition-all text-sm resize-none" placeholder="How can we help you?" />
              </div>
              <Button className="w-full h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-lg font-black shadow-lg shadow-red-100">Send Message</Button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 px-6 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-600 rounded-lg text-white"><Stethoscope size={20}/></div>
              <span className="text-2xl font-black tracking-tighter uppercase">SmartClinics</span>
            </div>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">Redefining clinical excellence through intelligent automation and secure data management.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-24">
            <div className="space-y-4">
              <p className="text-xs font-black uppercase text-slate-900 tracking-widest">Platform</p>
              <div className="flex flex-col gap-2 text-sm font-bold text-slate-400">
                <Link href="#" className="hover:text-red-600">Privacy Policy</Link>
                <Link href="#" className="hover:text-red-600">Terms of Service</Link>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-xs font-black uppercase text-slate-900 tracking-widest">Company</p>
              <div className="flex flex-col gap-2 text-sm font-bold text-slate-400">
                <Link href="#" className="hover:text-red-600">Twitter</Link>
                <Link href="#" className="hover:text-red-600">LinkedIn</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">© 2026 SmartClinics Inc. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Systems Operational</span>
          </div>
        </div>
      </footer>

      {/* CHATBOT UI */}
      <div className="fixed bottom-10 right-10 z-[120]">
        {isChatOpen && (
          <div className="absolute bottom-24 right-0 w-[380px] h-[580px] bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
            <div className="p-8 bg-red-600 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="h-10 w-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md"><Zap size={20}/></div>
                <div>
                  <span className="font-black text-xs uppercase block tracking-[0.1em]">SmartAI Assistant</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-red-100 font-bold uppercase">Online Now</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-colors relative z-10"><X size={20}/></button>
            </div>

            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/30">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-red-600 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                    <Loader2 size={16} className="animate-spin text-red-600" />
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
              <div className="flex items-center bg-slate-100/50 rounded-2xl px-4 py-1.5 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-red-600 transition-all">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask a question..." 
                  className="bg-transparent text-sm w-full outline-none py-3 text-slate-700 px-2" 
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isTyping || !input.trim()}
                  className="bg-red-600 text-white p-2.5 rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:grayscale"
                >
                  <Send size={18}/>
                </button>
              </div>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="h-20 w-20 bg-red-600 rounded-[2.5rem] shadow-[0_20px_40px_rgba(220,38,38,0.3)] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all group relative"
        >
          {isChatOpen ? <X size={32}/> : (
            <>
              <MessageSquare size={32}/>
              <div className="absolute top-5 right-5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}