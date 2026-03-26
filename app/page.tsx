"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { subscribeToBlogs, BlogPost } from "@/lib/blog-service"
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
  Microscope,
  Send,
  Loader2
} from "lucide-react"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  
  // New State for Dynamic Blogs
  const [dynamicBlogs, setDynamicBlogs] = useState<BlogPost[]>([])

  // Chatbot States
  const [messages, setMessages] = useState([
    { role: "model", text: "Hello! I am your SmartClinics assistant. How can I help you manage your clinic today?" }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Red & White Theme Constants
  const s = {
    bg: "bg-white",
    primary: "red-600",
    textPrimary: "text-red-600",
    btn: "bg-red-600 hover:bg-red-700",
    navBg: "bg-white/90",
  }

  // 1. Fetch Blogs from Firebase on Mount
  useEffect(() => {
    const unsubscribe = subscribeToBlogs((data) => {
      // We only show the latest 4 blogs on the homepage
      setDynamicBlogs(data.slice(0, 4));
    });
    return () => unsubscribe();
  }, []);

  // Auto-scroll chat to bottom
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
      } else {
        throw new Error(data.error || "No response")
      }
    } catch (error) {
      console.error("Chat Error:", error)
      setMessages((prev) => [...prev, { role: "model", text: "I'm having trouble connecting to my brain right now. Please try again!" }])
    } finally {
      setIsTyping(false)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${s.bg}`}>
        <div className="flex flex-col items-center gap-4">
          <div className={`h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent`}></div>
          <p className={`${s.textPrimary} animate-pulse font-bold tracking-widest uppercase text-xs`}>SmartCLINICS</p>
        </div>
      </div>
    )
  }

  const features = [
    { image: "/images/secure-auth-image.png", icon: <ShieldCheck className="w-5 h-5 text-red-600" />, title: "Secure Auth", description: "Biometric-grade security with advanced role-based permissions." },
    { image: "/images/smart-analytics.jpeg", icon: <BarChart3 className="w-5 h-5 text-red-600" />, title: "Smart Analytics", description: "Real-time data visualizations for clinical performance." },
    { image: "/images/fast-performance.png", icon: <Zap className="w-5 h-5 text-red-600" />, title: "Fast Performance", description: "Sub-second database queries and interactions." },
    { image: "/images/multiple-user-image.jpeg", icon: <Users className="w-5 h-5 text-red-600" />, title: "Multi-Role Portals", description: "Admin, Doctor, and Patient specialized interfaces." },
    { image: "/images/responsive-design-image.jpeg", icon: <Smartphone className="w-5 h-5 text-red-600" />, title: "Fully Responsive", description: "Access flawlessly across Desktop, Tablet, and Mobile." },
    { image: "/images/hipaa-image.jpeg", icon: <Lock className="w-5 h-5 text-red-600" />, title: "HIPAA Ready", description: "Enterprise encryption standards for data privacy." },
  ]

  return (
    <div className={`min-h-screen ${s.bg} text-slate-900 transition-colors duration-500 font-sans overflow-x-hidden`}>

      {/* HEADER & NAV */}
      <nav className={`fixed top-0 w-full z-50 border-b border-slate-100 ${s.navBg} backdrop-blur-xl`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl ${s.btn} flex items-center justify-center shadow-lg shadow-red-200`}>
              <Stethoscope className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tighter">
              Smart<span className={`${s.textPrimary} uppercase`}>Clinics</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <Link href="#features" className="text-sm font-bold text-slate-500 hover:text-red-600 transition-colors">Features</Link>
            <Link href="/blog" className="text-sm font-bold text-slate-500 hover:text-red-600 transition-colors">Blogs</Link>
            <div className="h-6 w-[1px] bg-slate-200 mx-2" />
            <Link href="/auth/login" className="text-sm font-bold text-slate-600 hover:text-red-600 transition-colors">Sign In</Link>
            <Button asChild className={`rounded-full px-8 ${s.btn} text-white border-none shadow-lg shadow-red-200`}>
              <Link href="/get-started">Get Started</Link>
            </Button>
          </div>

          <button className="lg:hidden p-2 text-red-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative pt-32 pb-16 md:pt-52 md:pb-32 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-red-50 opacity-50 blur-3xl rounded-full -z-10" />
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-10">
            <Plus className="w-3 h-3" /> System V2.0 Now Live
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.9] text-slate-900">
            HEALTHCARE <br />
            <span className="text-red-600">REDEFINED.</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            The intelligent operating system for your clinic. Secure patient data with our high-performance clinical cloud interface.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className={`rounded-full h-16 px-12 text-lg ${s.btn} transition-all shadow-xl shadow-red-200`} asChild>
              <Link href="/auth/signup">Deploy System <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* DYNAMIC BLOG SECTION */}
      <section id="blog" className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-red-600 font-black text-xs uppercase tracking-widest">Medical & Tech Insights</span>
            <h2 className="text-4xl font-black text-slate-900 mt-2">Latest from the techies and medicals</h2>
          </div>
          <Button asChild variant="link" className="text-red-600 font-bold p-0">
            <Link href="/blog">View All Articles <ArrowRight size={16} className="ml-2"/></Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {dynamicBlogs.length > 0 ? (
            dynamicBlogs.map((post) => (
              <Link 
                href={`/blog/${post.id}`} 
                key={post.id} 
                className="group p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-red-200 hover:shadow-xl transition-all cursor-pointer block"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-red-50 text-red-600">
                    {post.category === "Tech" ? <Zap size={14}/> : <Microscope size={14}/>}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{post.type}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-red-600 transition-colors">{post.title}</h3>
                <p className="mt-4 text-slate-500 font-medium">{post.date} • {post.category}</p>
                <div className="mt-4 text-red-600 text-xs font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Read Full Article <ArrowRight size={12}/>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
              <p className="text-slate-400 italic">Fetching daily insights from the database...</p>
            </div>
          )}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="group bg-white border border-slate-100 rounded-[2.5rem] p-4 transition-all hover:border-red-200 hover:shadow-2xl">
              <div className="relative h-60 w-full overflow-hidden rounded-[2rem] mb-8">
                <Image src={feature.image} alt={feature.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
              </div>
              <div className="px-6 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-red-50 text-red-600">{feature.icon}</div>
                  <h3 className="text-xl font-black text-slate-900">{feature.title}</h3>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-50 border-t border-slate-200 py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-red-600 rounded-lg text-white"><Stethoscope size={24}/></div>
              <span className="text-2xl font-black italic uppercase">SmartClinics</span>
            </div>
            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-sm">
              The premium gold standard for medical management. Clean, efficient, and ready for your clinic's expansion.
            </p>
          </div>
          <div>
            <h5 className="font-black uppercase text-xs text-red-600 mb-8 tracking-widest">Resources</h5>
            <div className="flex flex-col gap-4 text-sm font-bold text-slate-400">
              <Link href="#" className="hover:text-red-600">API Access</Link>
              <Link href="#" className="hover:text-red-600">Privacy Policy</Link>
              <Link href="#" className="hover:text-red-600">Contact Support</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* CHATBOT UI */}
      <div className="fixed bottom-8 right-8 z-[100]">
        {isChatOpen && (
          <div className="absolute bottom-20 right-0 w-[350px] h-[500px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
            <div className="p-6 bg-red-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center"><Zap size={16}/></div>
                <div>
                  <span className="font-black text-xs uppercase block tracking-tighter">SmartAI Assistant</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-red-100 italic">Online Now</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/10 p-1 rounded-full"><X size={18}/></button>
            </div>

            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
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
                  <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-red-600" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex items-center bg-slate-100 rounded-full px-4 py-1 ring-1 ring-inset ring-slate-200 focus-within:ring-2 focus-within:ring-red-600 transition-all">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..." 
                  className="bg-transparent text-xs w-full outline-none py-3 text-slate-700 px-2" 
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isTyping || !input.trim()}
                  className="bg-red-600 text-white p-2 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:grayscale"
                >
                  <Send size={14}/>
                </button>
              </div>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="h-16 w-16 bg-red-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all shadow-red-200 group"
        >
          {isChatOpen ? <X size={28}/> : (
            <div className="relative">
              <MessageSquare size={28}/>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
          )}
        </button>
      </div>
    </div>
  )
}