"use client"

import { useState, useMemo } from "react"
import { ArrowDown, ArrowUp, ArrowLeftRight, Search } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { mockMovements } from "@/lib/mock-data"
import { formatDateTime } from "@/lib/utils"
import { cn } from "@workspace/ui/lib/utils"
import type { MovementType } from "@/types"

const TYPE_CONFIG: Record<MovementType, { label: string; icon: React.ReactNode; color: string }> = {
  IN: { label: "Nhập kho", icon: <ArrowDown className="h-3.5 w-3.5" />, color: "text-green-600 bg-green-50 border-green-200" },
  OUT: { label: "Xuất kho", icon: <ArrowUp className="h-3.5 w-3.5" />, color: "text-red-600 bg-red-50 border-red-200" },
  ADJUSTMENT: { label: "Điều chỉnh", icon: <ArrowLeftRight className="h-3.5 w-3.5" />, color: "text-blue-600 bg-blue-50 border-blue-200" },
}

export default function MovementsPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")

  const filtered = useMemo(() => {
    return mockMovements.filter((m) => {
      const matchSearch = !search ||
        m.product.name.toLowerCase().includes(search.toLowerCase()) ||
        m.warehouse.name.toLowerCase().includes(search.toLowerCase())
      const matchType = typeFilter === "ALL" || m.type === typeFilter
      return matchSearch && matchType
    })
  }, [search, typeFilter])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Lịch sử nhập/xuất kho</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm sản phẩm, kho hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Loại giao dịch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="IN">Nhập kho</SelectItem>
            <SelectItem value="OUT">Xuất kho</SelectItem>
            <SelectItem value="ADJUSTMENT">Điều chỉnh</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Kho hàng</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead>Thực hiện bởi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((mv) => {
                  const config = TYPE_CONFIG[mv.type]
                  return (
                    <TableRow key={mv.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(mv.createdAt)}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{mv.product.name}</p>
                        <p className="text-xs text-muted-foreground">{mv.product.sku}</p>
                      </TableCell>
                      <TableCell className="text-sm">{mv.warehouse.name}</TableCell>
                      <TableCell>
                        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", config.color)}>
                          {config.icon}
                          {config.label}
                        </span>
                      </TableCell>
                      <TableCell className={cn("text-right font-medium", mv.quantity < 0 ? "text-red-600" : "text-green-600")}>
                        {mv.quantity > 0 ? "+" : ""}{mv.quantity} {mv.product.unit}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{mv.reason}</TableCell>
                      <TableCell className="text-sm">{mv.performedByUser?.name ?? mv.performedBy}</TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
