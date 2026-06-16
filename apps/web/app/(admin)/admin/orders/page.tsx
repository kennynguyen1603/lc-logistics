"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, Filter, Loader2, X, CheckSquare } from "lucide-react"
// Loader2 used in bulk update pending state
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Card, CardContent } from "@workspace/ui/components/card"
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge"
import { TableSkeleton } from "@/components/ui/TableSkeleton"
import { useOrders } from "@/hooks/useOrders"
import { useBulkUpdateDelivery } from "@/hooks/useDelivery"
import { ORDER_STATUS_LABEL, formatCurrency, formatDateTime } from "@/lib/utils"
import { toast } from "sonner"
import type { OrderStatus } from "@/types"

const PAGE_SIZE = 20

// Transitions that make sense to bulk-apply
const BULK_TRANSITIONS: { from: OrderStatus[]; to: OrderStatus; label: string }[] = [
  { from: ["PENDING"], to: "CONFIRMED", label: "Xác nhận đơn" },
  { from: ["CONFIRMED"], to: "PACKED", label: "Đóng gói xong" },
  { from: ["PACKED"], to: "IN_TRANSIT", label: "Xuất kho / Vận chuyển" },
  { from: ["IN_TRANSIT"], to: "OUT_FOR_DELIVERY", label: "Giao cuối chặng" },
  { from: ["OUT_FOR_DELIVERY"], to: "DELIVERED", label: "Giao thành công" },
]

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState<OrderStatus | "">("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { data, isLoading } = useOrders({
    page,
    limit: PAGE_SIZE,
    status: statusFilter === "ALL" ? undefined : (statusFilter as OrderStatus),
    search: debouncedSearch || undefined,
  })
  const bulkUpdate = useBulkUpdateDelivery()

  const orders = data?.data ?? []
  const meta = data?.meta

  const handleSearch = (value: string) => {
    setSearch(value)
    clearTimeout((window as Window & { _searchTimer?: ReturnType<typeof setTimeout> })._searchTimer)
    ;(window as Window & { _searchTimer?: ReturnType<typeof setTimeout> })._searchTimer = setTimeout(() => {
      setDebouncedSearch(value)
      setPage(1)
    }, 400)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)))
    }
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
    setBulkStatus("")
  }

  // Determine which transitions are valid for ALL selected orders
  const selectedOrders = orders.filter((o) => selectedIds.has(o.id))
  const selectedStatuses = new Set(selectedOrders.map((o) => o.status))
  const availableTransitions = BULK_TRANSITIONS.filter((t) =>
    [...selectedStatuses].every((s) => t.from.includes(s))
  )

  const handleBulkConfirm = async () => {
    if (!bulkStatus || selectedIds.size === 0) return
    try {
      const result = await bulkUpdate.mutateAsync({
        updates: [...selectedIds].map((orderId) => ({ orderId, status: bulkStatus as OrderStatus })),
      })
      if (result.failed === 0) {
        toast.success(`Đã cập nhật ${result.succeeded} đơn hàng`)
      } else {
        toast.warning(`${result.succeeded} thành công, ${result.failed} thất bại`)
      }
      clearSelection()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Cập nhật thất bại")
    } finally {
      setConfirmOpen(false)
    }
  }

  const isAllSelected = orders.length > 0 && selectedIds.size === orders.length
  const isPartialSelected = selectedIds.size > 0 && selectedIds.size < orders.length

  return (
    <div className="p-6 space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Danh sách đơn hàng</h1>
        <Button asChild size="sm">
          <Link href="/admin/orders/new">
            <Plus className="h-4 w-4 mr-2" />
            Tạo đơn mới
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm mã vận đơn, tên khách, SĐT..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v)
                setPage(1)
                clearSelection()
              }}
            >
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {ORDER_STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 pl-4">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) (el as HTMLInputElement).indeterminate = isPartialSelected
                    }}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Chọn tất cả"
                  />
                </TableHead>
                <TableHead>Mã vận đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Địa chỉ giao</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Giá trị</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton rows={8} cols={8} />
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    Không có đơn hàng nào phù hợp
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className={selectedIds.has(order.id) ? "bg-primary/5" : undefined}
                  >
                    <TableCell className="pl-4">
                      <Checkbox
                        checked={selectedIds.has(order.id)}
                        onCheckedChange={() => toggleSelect(order.id)}
                        aria-label={`Chọn đơn ${order.trackingNo}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium">
                      {order.trackingNo}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{order.customer.fullName}</p>
                      <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-40 truncate">
                      {order.shippingAddress}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/orders/${order.id}`}>Xem</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {meta.total} đơn · Trang {meta.page}/{meta.totalPages}
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

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border bg-background shadow-lg px-4 py-3">
          <CheckSquare className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium whitespace-nowrap">
            Đã chọn {selectedIds.size} đơn
          </span>
          <Select
            value={bulkStatus}
            onValueChange={(v) => setBulkStatus(v as OrderStatus)}
          >
            <SelectTrigger className="h-8 w-52 text-xs">
              <SelectValue placeholder="Chọn trạng thái mới..." />
            </SelectTrigger>
            <SelectContent>
              {availableTransitions.length === 0 ? (
                <SelectItem value="__none__" disabled>
                  Không có transition hợp lệ
                </SelectItem>
              ) : (
                availableTransitions.map((t) => (
                  <SelectItem key={t.to} value={t.to} className="text-xs">
                    → {t.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            disabled={!bulkStatus || bulkUpdate.isPending}
            onClick={() => setConfirmOpen(true)}
          >
            {bulkUpdate.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Cập nhật"
            )}
          </Button>
          <button
            onClick={clearSelection}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Bỏ chọn"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Confirm dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận cập nhật hàng loạt</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn đổi{" "}
              <span className="font-semibold">{selectedIds.size} đơn hàng</span> sang trạng thái{" "}
              <span className="font-semibold">
                {bulkStatus ? ORDER_STATUS_LABEL[bulkStatus as OrderStatus] : ""}
              </span>
              ? Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkConfirm}>
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
