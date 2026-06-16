"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { mockProducts } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

interface OrderItem {
  productId: string
  quantity: number
  unitPrice: number
}

export default function NewOrderPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    deliveryAddress: "",
    city: "",
    note: "",
  })
  const [items, setItems] = useState<OrderItem[]>([
    { productId: "", quantity: 1, unitPrice: 0 },
  ])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleItemChange = (idx: number, field: keyof OrderItem, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev]
      const current = updated[idx]!
      if (field === "productId") {
        updated[idx] = { ...current, productId: value as string, unitPrice: 3000000 }
      } else {
        updated[idx] = { ...current, [field]: Number(value) }
      }
      return updated
    })
  }

  const addItem = () => setItems((prev) => [...prev, { productId: "", quantity: 1, unitPrice: 0 }])
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx))

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.some((i) => !i.productId)) {
      toast.error("Vui lòng chọn sản phẩm cho tất cả dòng hàng")
      return
    }
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    toast.success("Tạo đơn hàng thành công!")
    setIsLoading(false)
    router.push("/admin/orders")
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" />Quay lại
        </Button>
        <h1 className="text-xl font-semibold">Tạo đơn hàng mới</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer info */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Thông tin khách hàng</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="customerName">Họ và tên *</Label>
              <Input id="customerName" name="customerName" value={form.customerName} onChange={handleFormChange} placeholder="Nguyễn Văn A" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerPhone">Số điện thoại *</Label>
              <Input id="customerPhone" name="customerPhone" value={form.customerPhone} onChange={handleFormChange} placeholder="09xxxxxxxx" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerEmail">Email</Label>
              <Input id="customerEmail" name="customerEmail" type="email" value={form.customerEmail} onChange={handleFormChange} placeholder="email@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">Thành phố *</Label>
              <Input id="city" name="city" value={form.city} onChange={handleFormChange} placeholder="TP.HCM" required />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="deliveryAddress">Địa chỉ giao hàng *</Label>
              <Input id="deliveryAddress" name="deliveryAddress" value={form.deliveryAddress} onChange={handleFormChange} placeholder="123 Nguyễn Huệ, P. Bến Nghé" required />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea id="note" name="note" value={form.note} onChange={handleFormChange} placeholder="Giao trong giờ hành chính..." rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Hàng hóa</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" />Thêm dòng
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, idx) => {
              const product = mockProducts.find((p) => p.id === item.productId)
              return (
                <div key={idx} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    {idx === 0 && <Label className="text-xs">Sản phẩm</Label>}
                    <Select value={item.productId} onValueChange={(v) => handleItemChange(idx, "productId", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn sản phẩm" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockProducts.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
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
                    <p className="text-sm font-medium py-2">{formatCurrency(item.quantity * item.unitPrice)}</p>
                  </div>
                  {items.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeItem(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )
            })}

            <Separator />
            <div className="flex justify-between text-sm font-semibold">
              <span>Tổng giá trị đơn hàng</span>
              <span className="text-primary">{formatCurrency(totalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>Hủy</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang tạo..." : "Tạo đơn hàng"}
          </Button>
        </div>
      </form>
    </div>
  )
}
