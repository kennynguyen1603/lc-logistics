import Link from "next/link"
import { Truck } from "lucide-react"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Truck className="h-5 w-5 text-primary" />
            LC Logistics
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/track" className="text-muted-foreground hover:text-foreground transition-colors">
              Tra cứu đơn
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Đăng nhập
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © 2026 LC Logistics · UTH · Kenny Chau
      </footer>
    </div>
  )
}
