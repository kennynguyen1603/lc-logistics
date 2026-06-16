"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Package, Truck, BarChart3, ArrowRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"

const FEATURES = [
  {
    icon: Search,
    title: "Tra cứu đơn hàng",
    desc: "Nhập mã vận đơn để theo dõi hành trình hàng hóa theo thời gian thực.",
  },
  {
    icon: Package,
    title: "Quản lý tồn kho",
    desc: "Kiểm soát tồn kho tại nhiều kho trên toàn quốc, cảnh báo hàng sắp hết.",
  },
  {
    icon: BarChart3,
    title: "Dashboard báo cáo",
    desc: "Thống kê KPI vận hành: số đơn, doanh thu, tỷ lệ giao thành công.",
  },
]

export default function LandingPage() {
  const router = useRouter()
  const [trackingNo, setTrackingNo] = useState("")

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (trackingNo.trim()) {
      router.push(`/track/${trackingNo.trim()}`)
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Truck className="h-4 w-4" />
            Hệ thống quản lý vận tải hàng hóa
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Theo dõi hàng hóa <br />
            <span className="text-primary">nhanh chóng & chính xác</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-10">
            Nhập mã vận đơn để tra cứu trạng thái hàng hóa, vị trí và lịch sử vận chuyển.
          </p>

          <form onSubmit={handleTrack} className="flex gap-2 max-w-lg mx-auto">
            <Input
              placeholder="Nhập mã vận đơn VD: VN20260616001"
              value={trackingNo}
              onChange={(e) => setTrackingNo(e.target.value)}
              className="flex-1 h-11"
            />
            <Button type="submit" size="lg" className="shrink-0">
              <Search className="h-4 w-4 mr-2" />
              Tra cứu
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-3">
            Demo: thử <code className="bg-muted px-1 rounded">VN20260616001</code>
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-10">Tính năng nổi bật</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="border-border/50">
                <CardHeader className="pb-2">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-primary/5">
        <div className="container mx-auto max-w-xl text-center">
          <h3 className="text-xl font-semibold mb-2">Bạn là nhân viên hoặc quản lý?</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Đăng nhập để quản lý đơn hàng, cập nhật trạng thái giao hàng và xem dashboard.
          </p>
          <Button asChild>
            <a href="/login">
              Đăng nhập hệ thống <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>
      </section>
    </div>
  )
}
