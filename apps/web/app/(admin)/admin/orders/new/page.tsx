"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { useCreateOrder } from "@/hooks/useOrders"
import { useProducts } from "@/hooks/useProducts"
import { useCustomers } from "@/hooks/useCustomers"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

interface OrderItemRow {
  productId: string
  quantity: number
  unitPrice: number
}

export default function NewOrderPage() {
  const router = useRouter()
  const [customerId, setCustomerId] = useState("")
  const [shippingAddress, setShippingAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<OrderItemRow[]>([
    { productId: "", quantity: 1, unitPrice: 0 },
  ])

  const { data: customersData } = useCustomers({ limit: 50 })
  const { data: productsData } = useProducts({ limit: 100 })
  const createOrder = useCreateOrder()

  const customers = customersData?.data ?? []
  const products = productsData?.data ?? []

  const handleItemChange = (
    idx: number,
    field: keyof OrderItemRow,
    value: string | number
  ) => {
    setItems((prev) => {
      const updated = [...prev]
      const current = updated[idx]!
      if (field === "productId") {
        const product = products.find((p) => p.id === value)
        updated[idx] = {
          ...current,
          productId: value as string,
          unitPrice: product?.unitPrice ?? 0,
        }
      } else {
        updated[idx] = { ...current, [field]: Number(value) }
      }
      return updated
    })
  }

  const addItem = () =>
    setItems((prev) => [...prev, { productId: "", quantity: 1, unitPrice: 0 }])

  const removeItem = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx))

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerId) {
      toast.error("Vui lòng chọn khách hàng")
      return
    }
    if (items.some((i) => !i.productId)) {
      toast.error("Vui lòng chọn sản phẩm cho tất cả dòng hàng")
      return
    }
    try {
      await createOrder.mutateAsync({
        customerId,
        shippingAddress,
        notes: notes || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      })
      toast.success("Tạo đơn hàng thành công!")
      router.push("/admin/orders")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Tạo đơn hàng thất bại")
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="-ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại
        </Button>
        <h1 className="text-xl font-semibold">Tạo đơn hàng mới</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Khách hàng *</Label>
              <Select value={customerId} onValueChange={setCustomerId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khách hàng..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.fullName}{" "}
                      <span className="text-muted-foreground">({c.phone})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shippingAddress">Địa chỉ giao hàng *</Label>
              <Input
                id="shippingAddress"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="123 Nguyễn Huệ, P. Bến Nghé, Q.1, TP.HCM"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Giao trong giờ hành chính..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Hàng hóa</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" />
              Thêm dòng
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  {idx === 0 && <Label className="text-xs">Sản phẩm</Label>}
                  <Select
                    value={item.productId}
                    onValueChange={(v) => handleItemChange(idx, "productId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn sản phẩm" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}{" "}
                          <span className="text-muted-foreground">({p.sku})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24 space-y-1">
                  {idx === 0 && <Label className="text-xs">Số lượng</Label>}
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                  />
                </div>
                <div className="w-36 space-y-1">
                  {idx === 0 && <Label className="text-xs">Đơn giá (VNĐ)</Label>}
                  <Input
                    type="number"
                    min={0}
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                  />
                </div>
                <div className="w-32 space-y-1">
                  {idx === 0 && <Label className="text-xs">Thành tiền</Label>}
                  <p className="text-sm font-medium py-2">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </p>
                </div>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeItem(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <Separator />
            <div className="flex justify-between text-sm font-semibold">
              <span>Tổng giá trị đơn hàng</span>
              <span className="text-primary">{formatCurrency(totalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
          <Button type="submit" disabled={createOrder.isPending}>
            {createOrder.isPending ? "Đang tạo..." : "Tạo đơn hàng"}
          </Button>
        </div>
      </form>
    </div>
  )
}
