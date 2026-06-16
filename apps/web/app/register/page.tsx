"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Truck } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" })
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError("Mật khẩu xác nhận không khớp")
      return
    }
    setIsLoading(true)
    setError("")
    // Mock: simulate registration
    await new Promise((r) => setTimeout(r, 800))
    setIsLoading(false)
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Truck className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold">LC Logistics</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Đăng ký tài khoản</CardTitle>
            <CardDescription>Tạo tài khoản mới để sử dụng hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Họ và tên</Label>
                <Input id="name" name="name" placeholder="Nguyễn Văn A" value={form.name} onChange={handleChange} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="email@example.com" value={form.email} onChange={handleChange} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" name="phone" type="tel" placeholder="09xxxxxxxx" value={form.phone} onChange={handleChange} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input id="password" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required minLength={6} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Xác nhận mật khẩu</Label>
                <Input id="confirm" name="confirm" type="password" placeholder="••••••••" value={form.confirm} onChange={handleChange} required />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-primary hover:underline underline-offset-4">
                Đăng nhập
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
