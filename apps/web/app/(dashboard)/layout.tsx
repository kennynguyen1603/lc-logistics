"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { AuthGuard } from "@/components/layout/AuthGuard"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-muted/20">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
