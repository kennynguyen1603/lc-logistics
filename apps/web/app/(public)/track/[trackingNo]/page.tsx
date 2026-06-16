"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Phone, Mail, Package, Calendar, Loader2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge"
import { OrderTimeline } from "@/components/orders/OrderTimeline"
import { useTrackOrder } from "@/hooks/useOrders"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function TrackDetailPage() {
  const { trackingNo } = useParams<{ trackingNo: string }>()
  const router = useRouter()

  const { data: order, isLoading, error } = useTrackOrder(trackingNo)

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-lg py-16 px-4 flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Đang tra cứu đơn hàng...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto max-w-lg py-16 px-4 text-center">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Không tìm thấy đơn hàng</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Mã vận đơn{" "}
          <code className="bg-muted px-1 rounded font-mono">{trackingNo}</code>{" "}
          không tồn tại trong hệ thống.
        </p>
        <Button variant="outline" onClick={() => router.push("/track")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Thử lại
        </Button>
      </div>
    )
  }

  const latestShipment = order.shipments?.[0]

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4 space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Quay lại
      </Button>

      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-1">MÃ VẬN ĐƠN</p>
              <h1 className="text-xl font-bold font-mono">{order.trackingNo}</h1>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-medium">{order.customer.fullName}</span>
              </div>
              {order.customer.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  {order.customer.phone}
                </div>
              )}
              {order.customer.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  {order.customer.email}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>{order.shippingAddress}</span>
              </div>
              {latestShipment?.etaDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  Dự kiến giao: {formatDate(latestShipment.etaDate)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lịch sử vận chuyển</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderTimeline
            deliveries={order.deliveries ?? []}
            currentStatus={order.status}
          />
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chi tiết hàng hóa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm py-2"
              >
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.product.sku} · {item.product.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p>SL: {item.quantity}</p>
                  <p className="text-muted-foreground">
                    {formatCurrency(item.unitPrice)}/{item.product.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between text-sm font-semibold">
            <span>Tổng giá trị</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
