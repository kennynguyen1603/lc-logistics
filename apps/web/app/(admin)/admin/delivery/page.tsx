"use client"

import { useState } from "react"
import { Truck } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge"
import { OrderTimeline } from "@/components/orders/OrderTimeline"
import { mockOrders } from "@/lib/mock-data"
import { ORDER_STATUS_LABEL } from "@/lib/utils"
import type { OrderStatus, IOrder } from "@/types"
import { toast } from "sonner"
import { cn } from "@workspace/ui/lib/utils"

const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PACKED", "CANCELLED"],
  PACKED: ["IN_TRANSIT"],
  IN_TRANSIT: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED", "RETURNED"],
}

const inTransitOrders = mockOrders.filter((o) =>
  ["PENDING", "CONFIRMED", "PACKED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(o.status)
)

export default function DeliveryPage() {
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null)
  const [newStatus, setNewStatus] = useState<string>("")
  const [location, setLocation] = useState("")
  const [note, setNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSelect = (order: IOrder) => {
    setSelectedOrder(order)
    setNewStatus("")
    setLocation("")
    setNote("")
  }

  const availableStatuses = selectedOrder ? NEXT_STATUSES[selectedOrder.status] ?? [] : []

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder || !newStatus) return
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    toast.success(`Cập nhật trạng thái → ${ORDER_STATUS_LABEL[newStatus as OrderStatus]} thành công`)
    setIsLoading(false)
    setNewStatus("")
    setLocation("")
    setNote("")
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Cập nhật giao hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order list */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Đơn đang xử lý ({inTransitOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {inTransitOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => handleSelect(order)}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors",
                    selectedOrder?.id === order.id && "bg-primary/5 border-l-2 border-l-primary"
                  )}
                >
                  <p className="font-mono text-xs font-medium">{order.trackingNo}</p>
                  <p className="text-sm text-muted-foreground">{order.customerName}</p>
                  <div className="mt-1">
                    <OrderStatusBadge status={order.status} />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right side */}
        <div className="lg:col-span-2 space-y-4">
          {selectedOrder ? (
            <>
              {/* Update form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Cập nhật trạng thái</CardTitle>
                  <p className="text-xs text-muted-foreground font-mono">{selectedOrder.trackingNo} · {selectedOrder.customerName}</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Trạng thái mới</Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái tiếp theo" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStatuses.length === 0 ? (
                            <SelectItem value="_none" disabled>Không có trạng thái tiếp theo</SelectItem>
                          ) : (
                            availableStatuses.map((s) => (
                              <SelectItem key={s} value={s}>{ORDER_STATUS_LABEL[s]}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="location">Vị trí hiện tại</Label>
                      <Input id="location" placeholder="VD: Kho Sóng Thần, Bình Dương" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="note">Ghi chú</Label>
                      <Textarea id="note" placeholder="Ghi chú về trạng thái giao hàng..." value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
                    </div>
                    <Button type="submit" disabled={!newStatus || isLoading} className="w-full">
                      {isLoading ? "Đang cập nhật..." : "Cập nhật trạng thái"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Lịch sử vận chuyển</CardTitle></CardHeader>
                <CardContent>
                  <OrderTimeline deliveries={selectedOrder.deliveries} currentStatus={selectedOrder.status} />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="flex items-center justify-center h-48">
              <CardContent className="text-center text-muted-foreground">
                <Truck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Chọn một đơn hàng từ danh sách để cập nhật</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
