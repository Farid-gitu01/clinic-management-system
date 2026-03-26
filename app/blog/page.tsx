"use client"
import { useEffect, useState } from "react"
import { subscribeToBlogs, BlogPost } from "@/lib/blog-service"
import { Stethoscope, ArrowLeft, Microscope, Zap, Loader2 } from "lucide-react"
import Link from "next/link"

export default function BlogListingPage() {
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
    <div className="min-h-screen bg-white pb-20">
      {/* Mini Nav */}
      <nav className="p-6 border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-slate-500 font-bold hover:text-red-600 transition-colors">
            <ArrowLeft size={18} /> Back Home
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <Stethoscope size={16} />
            </div>
            <span className="font-black tracking-tighter uppercase">Insights</span>
          </div>
        </div>
      </nav>

      <header className="py-20 px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-4">THE MEDICAL <span className="text-red-600">JOURNAL.</span></h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto italic">Exploring the intersection of modern clinical practice and cutting-edge technology.</p>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogs.map((post) => (
              <Link href={`/blog/${post.id}`} key={post.id} className="group p-8 rounded-[2.5rem] bg-slate-50 border border-transparent hover:bg-white hover:border-red-100 hover:shadow-2xl transition-all">
                 <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-white text-red-600 shadow-sm">
                    {post.category === "Tech" ? <Zap size={14}/> : <Microscope size={14}/>}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{post.type}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-red-600 transition-colors mb-4">{post.title}</h3>
                <p className="text-slate-500 line-clamp-3 text-sm leading-relaxed mb-6">{post.description}</p>
                <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase">{post.date}</span>
                  <span className="text-red-600 font-black text-[10px] uppercase group-hover:translate-x-1 transition-transform">Read Full →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}