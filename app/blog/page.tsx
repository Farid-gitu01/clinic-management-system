"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { subscribeToBlogs, BlogPost } from "@/lib/blog-service"
import { Stethoscope, ArrowRight, Zap, Microscope, Loader2, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToBlogs((data) => {
      setBlogs(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Header */}
      <nav className="border-b border-slate-100 bg-white/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm uppercase tracking-widest">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
             </div>
             <span className="font-black text-xl tracking-tighter uppercase">SmartClinics <span className="text-red-600">Blog</span></span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <header className="mb-20">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">INSIGHTS & <span className="text-red-600">ARTICLES.</span></h1>
          <p className="text-xl text-slate-500 max-w-2xl font-medium">Explore the intersection of high-end technology and modern healthcare management.</p>
        </header>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-red-600 mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((post) => (
              <Link 
                href={`/blog/${post.id}`} 
                key={post.id} 
                className="group p-8 rounded-[2.5rem] bg-slate-50 border border-transparent hover:border-red-200 hover:bg-white hover:shadow-2xl transition-all block"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 rounded-lg bg-white text-red-600 shadow-sm">
                    {post.category === "Tech" ? <Zap size={16}/> : <Microscope size={16}/>}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{post.category}</span>
                </div>
                <h3 className="text-2xl font-black leading-tight group-hover:text-red-600 transition-colors mb-4">{post.title}</h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-3">{post.excerpt || "Click to read the full detailed analysis of this healthcare trend..."}</p>
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-200">
                   <span className="text-[10px] font-bold text-slate-400 uppercase">{post.date}</span>
                   <ArrowRight size={16} className="text-red-600 transform group-hover:translate-x-2 transition-transform"/>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}