"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import type { Role } from "@/types"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: Role[]
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold">Không có quyền truy cập</p>
        <p className="text-sm text-muted-foreground">Bạn không có quyền xem trang này.</p>
      </div>
    )
  }

  return <>{children}</>
}
