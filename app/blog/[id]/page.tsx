"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { database } from "@/lib/firebase"
import { ref, get } from "firebase/database"
import { ArrowLeft, Calendar, Tag, Share2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ArticlePage() {
  const { id } = useParams()
  const router = useRouter()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      const snapshot = await get(ref(database, `blogs/${id}`))
      if (snapshot.exists()) {
        setPost(snapshot.val())
      }
      setLoading(false)
    }
    fetchPost()
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-red-600" size={32} />
    </div>
  )

  if (!post) return <div className="p-20 text-center">Article not found.</div>

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Button variant="ghost" onClick={() => router.back()} className="mb-12 hover:text-red-600 font-bold">
          <ArrowLeft size={18} className="mr-2" /> Back
        </Button>

        <div className="flex items-center gap-4 mb-8">
          <span className="px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-100">
            {post.category}
          </span>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
            <Calendar size={14} /> {post.date}
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-10 leading-[1.1]">
          {post.title}
        </h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-xl text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
            {post.description}
          </p>
        </div>

        <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-xs">SC</div>
            <div>
              <p className="text-xs font-black text-slate-900 uppercase">SmartClinics Editorial</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Verified Clinical Source</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-full border-slate-200 hover:border-red-600 hover:text-red-600">
            <Share2 size={16} className="mr-2" /> Share Insight
          </Button>
        </div>
      </div>
    </div>
  )
}