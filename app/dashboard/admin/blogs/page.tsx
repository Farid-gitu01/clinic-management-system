"use client"
import { useState } from "react";
import { addBlogPost } from "@/lib/blog-admin";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function AdminBlogPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", type: "", description: "", category: "Healthcare" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await addBlogPost(form as any);
    if (result.success) {
      alert("Blog Published!");
      setForm({ title: "", type: "", description: "", category: "Healthcare" });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-10 bg-white shadow-xl rounded-3xl mt-20 border border-slate-100">
      <h1 className="text-3xl font-black mb-6 text-slate-900">Post Daily Insight</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          placeholder="Blog Title (e.g. AI in Radiology)" 
          className="w-full p-4 bg-slate-50 rounded-xl outline-none border focus:border-red-600"
          value={form.title}
          onChange={e => setForm({...form, title: e.target.value})}
          required
        />
        <input 
          placeholder="Subtitle (e.g. Tech Spotlight)" 
          className="w-full p-4 bg-slate-50 rounded-xl outline-none border focus:border-red-600"
          value={form.type}
          onChange={e => setForm({...form, type: e.target.value})}
          required
        />
        <select 
          className="w-full p-4 bg-slate-50 rounded-xl outline-none border focus:border-red-600"
          value={form.category}
          onChange={e => setForm({...form, category: e.target.value})}
        >
          <option value="Healthcare">Healthcare</option>
          <option value="Tech">Tech</option>
          <option value="Clinical">Clinical</option>
        </select>
        <textarea 
          placeholder="Short description..." 
          className="w-full p-4 bg-slate-50 rounded-xl outline-none border focus:border-red-600 h-32"
          value={form.description}
          onChange={e => setForm({...form, description: e.target.value})}
          required
        />
        <Button className="w-full bg-red-600 hover:bg-red-700 h-14 rounded-xl font-bold" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : "Publish to Live Site"}
        </Button>
      </form>
    </div>
  );
}