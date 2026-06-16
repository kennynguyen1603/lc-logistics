"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Package,
  Truck,
  Warehouse,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  History,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { useAuthStore } from "@/stores/auth.store"
import { Button } from "@workspace/ui/components/button"

const STAFF_NAV = [
  { href: "/admin/orders", label: "Đơn hàng", icon: Package },
  { href: "/admin/delivery", label: "Giao hàng", icon: Truck },
  { href: "/admin/inventory", label: "Tồn kho", icon: Warehouse },
  { href: "/admin/inventory/movements", label: "Lịch sử kho", icon: History },
]

const ADMIN_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ...STAFF_NAV,
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const handleLogout = () => { void logout() }
  const nav = user?.role === "ADMIN" ? ADMIN_NAV : STAFF_NAV

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Truck className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm">LC Logistics</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/admin/inventory" && pathname.startsWith(href + "/"))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {isActive && <ChevronRight className="ml-auto h-3 w-3" />}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-3">
        <div className="mb-2 px-1">
          <p className="text-xs font-medium truncate">{user?.fullName}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </Button>
      </div>
    </aside>
  )
}
