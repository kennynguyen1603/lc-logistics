"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Package } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge"
import { OrderTimeline } from "@/components/orders/OrderTimeline"
import { mockOrders } from "@/lib/mock-data"
import { formatCurrency, formatDateTime } from "@/lib/utils"

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const order = mockOrders.find((o) => o.id === id)

  if (!order) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-3 text-center">
        <Package className="h-10 w-10 text-muted-foreground" />
        <h2 className="font-semibold">Không tìm thấy đơn hàng</h2>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />Quay lại
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" />Quay lại
        </Button>
        <h1 className="text-xl font-semibold font-mono">{order.trackingNo}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Info */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Thông tin đơn hàng</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Khách hàng</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Số điện thoại</p>
                  <p>{order.customerPhone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs mb-0.5">Địa chỉ giao hàng</p>
                  <p>{order.deliveryAddress}, {order.city}</p>
                </div>
                {order.note && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs mb-0.5">Ghi chú</p>
                    <p className="italic">{order.note}</p>
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
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Hàng hóa</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{item.product.sku} · {item.quantity} {item.product.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.quantity * item.unitPrice)}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(item.unitPrice)}/{item.product.unit}</p>
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
        </div>

        {/* Right column — Timeline */}
        <Card className="h-fit">
          <CardHeader><CardTitle className="text-sm">Lịch sử vận chuyển</CardTitle></CardHeader>
          <CardContent>
            <OrderTimeline deliveries={order.deliveries} currentStatus={order.status} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
