"use client"

import { useState } from "react"
import { Truck, Search } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge"
import { OrderTimeline } from "@/components/orders/OrderTimeline"
import { useOrders } from "@/hooks/useOrders"
import { useUpdateDeliveryStatus } from "@/hooks/useDelivery"
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

const ACTIVE_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
]

export default function DeliveryPage() {
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null)
  const [newStatus, setNewStatus] = useState<string>("")
  const [location, setLocation] = useState("")
  const [note, setNote] = useState("")
  const [deliverySearch, setDeliverySearch] = useState("")

  const { data, isLoading } = useOrders({ limit: 200 })
  const updateStatus = useUpdateDeliveryStatus()

  const allActiveOrders = (data?.data ?? []).filter((o) =>
    ACTIVE_STATUSES.includes(o.status)
  )
  const activeOrders = deliverySearch
    ? allActiveOrders.filter(
        (o) =>
          o.trackingNo.toLowerCase().includes(deliverySearch.toLowerCase()) ||
          o.customer.fullName.toLowerCase().includes(deliverySearch.toLowerCase())
      )
    : allActiveOrders

  const handleSelect = (order: IOrder) => {
    setSelectedOrder(order)
    setNewStatus("")
    setLocation("")
    setNote("")
  }

  const availableStatuses = selectedOrder
    ? (NEXT_STATUSES[selectedOrder.status] ?? [])
    : []

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder || !newStatus) return
    try {
      await updateStatus.mutateAsync({
        orderId: selectedOrder.id,
        dto: {
          status: newStatus as OrderStatus,
          location: location || undefined,
          note: note || undefined,
        },
      })
      toast.success(
        `Cập nhật trạng thái → ${ORDER_STATUS_LABEL[newStatus as OrderStatus]} thành công`
      )
      setSelectedOrder((prev) =>
        prev ? { ...prev, status: newStatus as OrderStatus } : null
      )
      setNewStatus("")
      setLocation("")
      setNote("")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Cập nhật thất bại")
    }
  }

  return (
    <div className="p-6 flex flex-col gap-4 h-full">
      <h1 className="text-xl font-semibold shrink-0">Cập nhật giao hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Order list */}
        <Card className="lg:col-span-1 flex flex-col min-h-0">
          <CardHeader className="shrink-0 pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Đơn đang xử lý ({isLoading ? "..." : allActiveOrders.length})
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Tìm mã đơn, khách hàng..."
                value={deliverySearch}
                onChange={(e) => setDeliverySearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-0 overflow-hidden">
            {isLoading ? (
              <div className="divide-y">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="px-4 py-3 space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-4 w-16 mt-1" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full overflow-y-auto divide-y">
                {activeOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => handleSelect(order)}
                    className={cn(
                      "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors",
                      selectedOrder?.id === order.id &&
                        "bg-primary/5 border-l-2 border-l-primary"
                    )}
                  >
                    <p className="font-mono text-xs font-medium">{order.trackingNo}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer.fullName}
                    </p>
                    <div className="mt-1">
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </button>
                ))}
                {activeOrders.length === 0 && (
                  <p className="px-4 py-6 text-sm text-center text-muted-foreground">
                    {deliverySearch ? "Không tìm thấy đơn phù hợp" : "Không có đơn đang xử lý"}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right side */}
        <div className="lg:col-span-2 overflow-y-auto space-y-4 min-h-0">
          {selectedOrder ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Cập nhật trạng thái</CardTitle>
                  <p className="text-xs text-muted-foreground font-mono">
                    {selectedOrder.trackingNo} · {selectedOrder.customer.fullName}
                  </p>
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
                            <SelectItem value="_none" disabled>
                              Không có trạng thái tiếp theo
                            </SelectItem>
                          ) : (
                            availableStatuses.map((s) => (
                              <SelectItem key={s} value={s}>
                                {ORDER_STATUS_LABEL[s]}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="location">Vị trí hiện tại</Label>
                      <Input
                        id="location"
                        placeholder="VD: Kho Sóng Thần, Bình Dương"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="note">Ghi chú</Label>
                      <Textarea
                        id="note"
                        placeholder="Ghi chú về trạng thái giao hàng..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={!newStatus || updateStatus.isPending}
                      className="w-full"
                    >
                      {updateStatus.isPending ? "Đang cập nhật..." : "Cập nhật trạng thái"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Lịch sử vận chuyển</CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderTimeline
                    deliveries={selectedOrder.deliveries ?? []}
                    currentStatus={selectedOrder.status}
                  />
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
