"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Truck, Eye, EyeOff } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { useAuthStore } from "@/stores/auth.store"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await login(email, password)
      router.replace("/admin/orders")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-primary/5 to-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <Truck className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold">LC Logistics</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Đăng nhập</CardTitle>
            <CardDescription>
              Nhập thông tin tài khoản để truy cập hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@logistics.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            <div className="mt-4 space-y-1 rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Tài khoản demo:
              </p>
              <p className="font-mono text-xs">
                admin@lclogistics.vn / Admin@123
              </p>
              <p className="font-mono text-xs">
                staff@lclogistics.vn / Staff@123
              </p>
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              <Link
                href="/"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                ← Trang chủ
              </Link>
              {" · "}
              <Link
                href="/register"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                Đăng ký tài khoản
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
