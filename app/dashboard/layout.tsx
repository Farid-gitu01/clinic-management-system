"use client"

import type React from "react"
import { ProtectedRoute } from "@/lib/protected-route"
import { SidebarNav } from "@/components/sidebar-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <SidebarNav />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
