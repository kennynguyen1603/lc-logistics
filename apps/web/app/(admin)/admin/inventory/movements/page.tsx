"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp, ArrowLeftRight, Search, X } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"
import { useMovements } from "@/hooks/useInventory"
import { TableSkeleton } from "@/components/ui/TableSkeleton"
import { formatDateTime } from "@/lib/utils"
import { cn } from "@workspace/ui/lib/utils"
import type { MovementType } from "@/types"

const TYPE_CONFIG: Record<
  MovementType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  INBOUND: {
    label: "Nhập kho",
    icon: <ArrowDown className="h-3.5 w-3.5" />,
    color: "text-green-600 bg-green-50 border-green-200",
  },
  OUTBOUND: {
    label: "Xuất kho",
    icon: <ArrowUp className="h-3.5 w-3.5" />,
    color: "text-red-600 bg-red-50 border-red-200",
  },
  ADJUSTMENT: {
    label: "Điều chỉnh",
    icon: <ArrowLeftRight className="h-3.5 w-3.5" />,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  TRANSFER: {
    label: "Chuyển kho",
    icon: <ArrowLeftRight className="h-3.5 w-3.5" />,
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  RETURN: {
    label: "Trả hàng",
    icon: <ArrowDown className="h-3.5 w-3.5" />,
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
}

const PAGE_SIZE = 50

export default function MovementsPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [page, setPage] = useState(1)

  const { data, isLoading } = useMovements({ page, limit: PAGE_SIZE })
  const movements = data?.data ?? []
  const meta = data?.meta

  const filtered = movements.filter((m) => {
    const matchSearch =
      !search ||
      m.product.name.toLowerCase().includes(search.toLowerCase()) ||
      m.warehouse.name.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === "ALL" || m.type === typeFilter
    return matchSearch && matchType
  })

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-xl font-semibold">Lịch sử nhập/xuất kho</h1>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm sản phẩm, kho hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Loại giao dịch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="INBOUND">Nhập kho</SelectItem>
            <SelectItem value="OUTBOUND">Xuất kho</SelectItem>
            <SelectItem value="ADJUSTMENT">Điều chỉnh</SelectItem>
            <SelectItem value="TRANSFER">Chuyển kho</SelectItem>
            <SelectItem value="RETURN">Trả hàng</SelectItem>
          </SelectContent>
        </Select>
        {(search !== "" || typeFilter !== "ALL") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearch(""); setTypeFilter("ALL"); setPage(1) }}
            className="text-muted-foreground"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Xóa bộ lọc
          </Button>
        )}
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
              {isLoading ? (
                <TableSkeleton rows={8} cols={7} />
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((mv) => {
                  const config = TYPE_CONFIG[mv.type]
                  return (
                    <TableRow key={mv.id}>
                      <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                        {formatDateTime(mv.createdAt)}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{mv.product.name}</p>
                        <p className="text-xs text-muted-foreground">{mv.product.sku}</p>
                      </TableCell>
                      <TableCell className="text-sm">{mv.warehouse.name}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                            config.color
                          )}
                        >
                          {config.icon}
                          {config.label}
                        </span>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-medium",
                          mv.quantity < 0 ? "text-red-600" : "text-green-600"
                        )}
                      >
                        {mv.quantity > 0 ? "+" : ""}
                        {mv.quantity}
                      </TableCell>
                      <TableCell
                        className="max-w-50 truncate text-sm text-muted-foreground"
                        title={mv.reason}
                      >
                        {mv.reason}
                      </TableCell>
                      <TableCell className="text-sm">
                        {mv.performedBy?.fullName ?? "—"}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {meta.total} bản ghi · Trang {meta.page}/{meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === meta.totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
