"use client"

import { useState } from "react"
import { AlertTriangle, Plus, Minus, Loader2, Layers, Search, Trash2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"
import { useInventory, useAdjustStock, useBulkAdjustStock } from "@/hooks/useInventory"
import { useProducts } from "@/hooks/useProducts"
import { useWarehouses } from "@/hooks/useWarehouses"
import { toast } from "sonner"
import type { IProduct, IWarehouse } from "@/types"

interface AdjustTarget {
  productId: string
  warehouseId: string
  productName: string
  warehouseName: string
  currentStock: number
  unit: string
}

interface BulkRow {
  productId: string
  warehouseId: string
  type: "IN" | "OUT"
  quantity: string
  reason: string
}

function emptyRow(): BulkRow {
  return { productId: "", warehouseId: "", type: "IN", quantity: "", reason: "" }
}

interface BulkAdjustDialogProps {
  open: boolean
  onClose: () => void
  products: IProduct[]
  warehouses: IWarehouse[]
}

function BulkAdjustDialog({ open, onClose, products, warehouses }: BulkAdjustDialogProps) {
  const [rows, setRows] = useState<BulkRow[]>([emptyRow()])
  const bulkAdjust = useBulkAdjustStock()

  const updateRow = (i: number, patch: Partial<BulkRow>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))

  const removeRow = (i: number) =>
    setRows((prev) => prev.filter((_, idx) => idx !== i))

  const validRows = rows.filter(
    (r) => r.productId && r.warehouseId && Number(r.quantity) > 0 && r.reason.trim().length >= 3
  )

  const handleSubmit = async () => {
    if (validRows.length === 0) return
    try {
      const result = await bulkAdjust.mutateAsync({
        adjustments: validRows.map((r) => ({
          productId: r.productId,
          warehouseId: r.warehouseId,
          quantity: r.type === "IN" ? Number(r.quantity) : -Number(r.quantity),
          reason: r.reason,
        })),
      })
      if (result.failed === 0) {
        toast.success(`Đã điều chỉnh ${result.succeeded} dòng thành công`)
      } else {
        toast.warning(
          `${result.succeeded} thành công, ${result.failed} lỗi: ${result.errors.map((e) => e.message).join(", ")}`
        )
      }
      setRows([emptyRow()])
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Điều chỉnh thất bại")
    }
  }

  const handleClose = () => {
    setRows([emptyRow()])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nhập / Xuất hàng loạt</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Thêm nhiều dòng điều chỉnh rồi xác nhận một lần
          </p>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-3 py-2">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto_1fr_auto] gap-2 items-end border rounded-lg p-3 bg-muted/30">
              <div className="space-y-1">
                <Label className="text-xs">Sản phẩm</Label>
                <Select value={row.productId} onValueChange={(v) => updateRow(i, { productId: v })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Chọn sản phẩm" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Kho</Label>
                <Select value={row.warehouseId} onValueChange={(v) => updateRow(i, { warehouseId: v })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Chọn kho" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id} className="text-xs">
                        {w.code} · {w.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Loại</Label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => updateRow(i, { type: "IN" })}
                    className={cn(
                      "h-8 px-2 rounded text-xs font-medium transition-colors",
                      row.type === "IN"
                        ? "bg-green-600 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateRow(i, { type: "OUT" })}
                    className={cn(
                      "h-8 px-2 rounded text-xs font-medium transition-colors",
                      row.type === "OUT"
                        ? "bg-red-600 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Số lượng</Label>
                <Input
                  type="number"
                  min={1}
                  className="h-8 text-xs w-24"
                  placeholder="0"
                  value={row.quantity}
                  onChange={(e) => updateRow(i, { quantity: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Lý do</Label>
                <Input
                  className="h-8 text-xs"
                  placeholder="Nhập lý do..."
                  value={row.reason}
                  onChange={(e) => updateRow(i, { reason: e.target.value })}
                />
              </div>

              <button
                type="button"
                onClick={() => removeRow(i)}
                disabled={rows.length === 1}
                className="h-8 w-8 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setRows((prev) => [...prev, emptyRow()])}
            disabled={rows.length >= 100}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Thêm dòng
          </Button>
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <p className="text-xs text-muted-foreground">
            {validRows.length}/{rows.length} dòng hợp lệ
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose}>Hủy</Button>
            <Button
              onClick={handleSubmit}
              disabled={validRows.length === 0 || bulkAdjust.isPending}
            >
              {bulkAdjust.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang lưu...</>
              ) : (
                `Xác nhận ${validRows.length} dòng`
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function InventoryPage() {
  const [adjustTarget, setAdjustTarget] = useState<AdjustTarget | null>(null)
  const [adjustQty, setAdjustQty] = useState("")
  const [adjustReason, setAdjustReason] = useState("")
  const [adjustType, setAdjustType] = useState<"IN" | "OUT">("IN")
  const [productSearch, setProductSearch] = useState("")
  const [bulkOpen, setBulkOpen] = useState(false)

  const { data: inventoryData, isLoading: invLoading } = useInventory({ limit: 500 })
  const { data: productsData, isLoading: prodLoading } = useProducts({ limit: 100 })
  const { data: warehouses = [], isLoading: whLoading } = useWarehouses()
  const adjustStock = useAdjustStock()

  const inventory = inventoryData?.data ?? []
  const allProducts = productsData?.data ?? []
  const isLoading = invLoading || prodLoading || whLoading

  const products = productSearch.trim()
    ? allProducts.filter((p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())
      )
    : allProducts

  const cellMap = new Map(
    inventory.map((inv) => [`${inv.productId}-${inv.warehouseId}`, inv])
  )

  const handleCellClick = (productId: string, warehouseId: string) => {
    const product = allProducts.find((p) => p.id === productId)
    const warehouse = warehouses.find((w) => w.id === warehouseId)
    const inv = cellMap.get(`${productId}-${warehouseId}`)
    if (!product || !warehouse) return
    setAdjustTarget({
      productId,
      warehouseId,
      productName: product.name,
      warehouseName: warehouse.name,
      currentStock: inv?.stock ?? 0,
      unit: product.unit,
    })
    setAdjustQty("")
    setAdjustReason("")
    setAdjustType("IN")
  }

  const handleAdjust = async () => {
    if (!adjustQty || !adjustReason || !adjustTarget) return
    const qty = Number(adjustQty)
    if (!qty) return
    try {
      await adjustStock.mutateAsync({
        productId: adjustTarget.productId,
        warehouseId: adjustTarget.warehouseId,
        dto: {
          quantity: adjustType === "IN" ? qty : -qty,
          reason: adjustReason,
        },
      })
      toast.success(
        `Đã ${adjustType === "IN" ? "nhập" : "xuất"} ${qty} ${adjustTarget.unit} ${adjustTarget.productName}`
      )
      setAdjustTarget(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Điều chỉnh thất bại")
    }
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold shrink-0">Tồn kho theo kho hàng</h1>
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Tìm sản phẩm..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
          <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)}>
            <Layers className="mr-1.5 h-3.5 w-3.5" />
            Hàng loạt
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="sticky left-0 min-w-40 bg-muted/50 px-4 py-3 text-left font-medium text-muted-foreground">
                    Sản phẩm
                    {productSearch && (
                      <span className="ml-2 text-xs font-normal text-primary">
                        ({products.length} kết quả)
                      </span>
                    )}
                  </th>
                  {warehouses.map((wh) => (
                    <th
                      key={wh.id}
                      className="min-w-25 px-4 py-3 text-center font-medium whitespace-nowrap text-muted-foreground"
                    >
                      {wh.code}
                      <span className="block text-xs font-normal">{wh.city}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={warehouses.length + 1}
                      className="text-center py-10 text-sm text-muted-foreground"
                    >
                      Không tìm thấy sản phẩm
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="sticky left-0 bg-background px-4 py-3">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                      </td>
                      {warehouses.map((wh) => {
                        const inv = cellMap.get(`${product.id}-${wh.id}`)
                        const isLow = inv ? inv.stock <= inv.lowThreshold : false
                        return (
                          <td key={wh.id} className="px-2 py-2 text-center">
                            {inv ? (
                              <button
                                onClick={() => handleCellClick(product.id, wh.id)}
                                className={cn(
                                  "w-full min-w-20 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:opacity-80",
                                  isLow
                                    ? "border border-red-200 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                    : "bg-muted/50 hover:bg-muted"
                                )}
                              >
                                {isLow && (
                                  <AlertTriangle className="mr-1 inline h-3 w-3" />
                                )}
                                {inv.stock}
                                <span className="ml-1 text-xs font-normal">
                                  {product.unit}
                                </span>
                              </button>
                            ) : (
                              <span className="text-muted-foreground/30">—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-red-200 bg-red-100" />
          Tồn kho thấp (cần nhập thêm)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-muted" />
          Bình thường
        </span>
        <span>— = Không có kho này</span>
      </div>

      {/* Single Adjust Dialog */}
      <Dialog open={!!adjustTarget} onOpenChange={() => setAdjustTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Điều chỉnh tồn kho</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {adjustTarget?.productName} · {adjustTarget?.warehouseName}
            </p>
            <p className="text-sm">
              Tồn kho hiện tại:{" "}
              <span className="font-semibold">
                {adjustTarget?.currentStock} {adjustTarget?.unit}
              </span>
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
                <Plus className="mr-1 h-4 w-4" />
                Nhập kho
              </Button>
              <Button
                type="button"
                variant={adjustType === "OUT" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setAdjustType("OUT")}
              >
                <Minus className="mr-1 h-4 w-4" />
                Xuất kho
              </Button>
            </div>
            <div className="space-y-1.5">
              <Label>Số lượng ({adjustTarget?.unit})</Label>
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
            <Button variant="outline" onClick={() => setAdjustTarget(null)}>
              Hủy
            </Button>
            <Button
              onClick={handleAdjust}
              disabled={!adjustQty || !adjustReason || adjustStock.isPending}
            >
              {adjustStock.isPending ? "Đang lưu..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Adjust Dialog */}
      <BulkAdjustDialog
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        products={allProducts}
        warehouses={warehouses}
      />
    </div>
  )
}
