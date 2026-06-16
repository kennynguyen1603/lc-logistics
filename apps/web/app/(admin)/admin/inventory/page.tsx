"use client"

import { useState } from "react"
import { AlertTriangle, Plus, Minus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@workspace/ui/components/dialog"
import { cn } from "@workspace/ui/lib/utils"
import { mockInventory, mockProducts, mockWarehouses } from "@/lib/mock-data"
import { toast } from "sonner"

interface AdjustTarget {
  productId: string
  warehouseId: string
  productName: string
  warehouseName: string
  currentStock: number
}

export default function InventoryPage() {
  const [adjustTarget, setAdjustTarget] = useState<AdjustTarget | null>(null)
  const [adjustQty, setAdjustQty] = useState("")
  const [adjustReason, setAdjustReason] = useState("")
  const [adjustType, setAdjustType] = useState<"IN" | "OUT">("IN")
  const [isLoading, setIsLoading] = useState(false)

  // Build matrix
  const products = mockProducts
  const warehouses = mockWarehouses

  const cellMap = new Map(
    mockInventory.map((inv) => [`${inv.productId}-${inv.warehouseId}`, inv])
  )

  const handleCellClick = (productId: string, warehouseId: string) => {
    const product = products.find((p) => p.id === productId)!
    const warehouse = warehouses.find((w) => w.id === warehouseId)!
    const inv = cellMap.get(`${productId}-${warehouseId}`)
    setAdjustTarget({
      productId,
      warehouseId,
      productName: product.name,
      warehouseName: warehouse.name,
      currentStock: inv?.stock ?? 0,
    })
    setAdjustQty("")
    setAdjustReason("")
    setAdjustType("IN")
  }

  const handleAdjust = async () => {
    if (!adjustQty || !adjustReason) return
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    toast.success(`Đã ${adjustType === "IN" ? "nhập" : "xuất"} ${adjustQty} tấn ${adjustTarget?.productName}`)
    setIsLoading(false)
    setAdjustTarget(null)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tồn kho theo kho hàng</h1>
        <p className="text-xs text-muted-foreground">Click vào ô để điều chỉnh tồn kho</p>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground sticky left-0 bg-muted/50 min-w-[160px]">
                  Sản phẩm
                </th>
                {warehouses.map((wh) => (
                  <th key={wh.id} className="text-center px-4 py-3 font-medium text-muted-foreground whitespace-nowrap min-w-[100px]">
                    {wh.code}
                    <span className="block text-xs font-normal">{wh.city}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 sticky left-0 bg-background">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                  </td>
                  {warehouses.map((wh) => {
                    const inv = cellMap.get(`${product.id}-${wh.id}`)
                    const isLow = inv ? inv.stock < inv.lowThreshold : false
                    return (
                      <td key={wh.id} className="text-center px-2 py-2">
                        {inv ? (
                          <button
                            onClick={() => handleCellClick(product.id, wh.id)}
                            className={cn(
                              "w-full min-w-[80px] rounded-md px-3 py-2 text-sm font-medium transition-colors hover:opacity-80",
                              isLow
                                ? "bg-red-100 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300"
                                : "bg-muted/50 hover:bg-muted"
                            )}
                          >
                            {isLow && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                            {inv.stock}
                            <span className="text-xs font-normal ml-1">{product.unit}</span>
                          </button>
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-red-100 border border-red-200 inline-block" />
          Tồn kho thấp (cần nhập thêm)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-muted inline-block" />
          Bình thường
        </span>
        <span>— = Không có kho này</span>
      </div>

      {/* Adjust Dialog */}
      <Dialog open={!!adjustTarget} onOpenChange={() => setAdjustTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Điều chỉnh tồn kho</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {adjustTarget?.productName} · {adjustTarget?.warehouseName}
            </p>
            <p className="text-sm">
              Tồn kho hiện tại: <span className="font-semibold">{adjustTarget?.currentStock} tấn</span>
            </p>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={adjustType === "IN" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setAdjustType("IN")}
              >
                <Plus className="h-4 w-4 mr-1" />Nhập kho
              </Button>
              <Button
                type="button"
                variant={adjustType === "OUT" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setAdjustType("OUT")}
              >
                <Minus className="h-4 w-4 mr-1" />Xuất kho
              </Button>
            </div>
            <div className="space-y-1.5">
              <Label>Số lượng (tấn)</Label>
              <Input
                type="number"
                min={1}
                placeholder="Nhập số lượng"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Lý do</Label>
              <Textarea
                placeholder="VD: Nhập hàng từ nhà cung cấp, xuất đơn..."
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustTarget(null)}>Hủy</Button>
            <Button onClick={handleAdjust} disabled={!adjustQty || !adjustReason || isLoading}>
              {isLoading ? "Đang lưu..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
