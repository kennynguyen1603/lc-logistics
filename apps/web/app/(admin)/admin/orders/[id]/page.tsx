"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Package, Loader2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge"
import { OrderTimeline } from "@/components/orders/OrderTimeline"
import { useOrder } from "@/hooks/useOrders"
import { formatCurrency, formatDateTime, formatDate } from "@/lib/utils"

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data: order, isLoading, error } = useOrder(id)

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-3 text-center">
        <Package className="h-10 w-10 text-muted-foreground" />
        <h2 className="font-semibold">Không tìm thấy đơn hàng</h2>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="-ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại
        </Button>
        <h1 className="text-xl font-semibold font-mono">{order.trackingNo}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Thông tin đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Khách hàng</p>
                  <p className="font-medium">{order.customer.fullName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Số điện thoại</p>
                  <p>{order.customer.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Email</p>
                  <p className="text-muted-foreground">{order.customer.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Tiền tệ</p>
                  <p>{order.currency}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs mb-0.5">Địa chỉ giao hàng</p>
                  <p>{order.shippingAddress}</p>
                </div>
                {order.notes && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs mb-0.5">Ghi chú</p>
                    <p className="italic">{order.notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Ngày tạo</p>
                  <p>{formatDateTime(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Cập nhật lần cuối</p>
                  <p>{formatDateTime(order.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Tạo bởi</p>
                  <p>{order.createdBy.fullName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Hàng hóa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.product.sku} · {item.quantity} {item.product.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.unitPrice)}/{item.product.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between text-sm font-semibold">
                <span>Tổng giá trị</span>
                <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipments */}
          {order.shipments && order.shipments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Lô hàng vận chuyển</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.shipments.map((s) => (
                  <div key={s.id} className="rounded-md border p-3 text-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-medium">{s.shipmentNo}</span>
                      <span className="text-xs text-muted-foreground">{s.mode}</span>
                    </div>
                    <p className="text-muted-foreground">
                      {s.origin} → {s.destination}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hãng: {s.carrier.name} · Mã: {s.carrier.code}
                    </p>
                    {s.etaDate && (
                      <p className="text-xs text-muted-foreground">
                        ETA: {formatDate(s.etaDate)}
                      </p>
                    )}
                    {s.legs.length > 0 && (
                      <div className="mt-2 space-y-1 border-t pt-2">
                        {s.legs.map((leg) => (
                          <div key={leg.id} className="text-xs text-muted-foreground">
                            {leg.sequence}. [{leg.mode}] {leg.fromPoint} → {leg.toPoint}
                            <span className="ml-2 text-primary">{leg.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column — Timeline */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-sm">Lịch sử vận chuyển</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTimeline
              deliveries={order.deliveries ?? []}
              currentStatus={order.status}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
