"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Plus, Search, Filter } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge"
import { mockOrders } from "@/lib/mock-data"
import { ORDER_STATUS_LABEL, formatCurrency, formatDateTime } from "@/lib/utils"
import type { OrderStatus } from "@/types"

const PAGE_SIZE = 10

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return mockOrders.filter((o) => {
      const matchSearch =
        !search ||
        o.trackingNo.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.customerPhone.includes(search)
      const matchStatus = statusFilter === "ALL" || o.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [search, statusFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="p-6 space-y-4">
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
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{ORDER_STATUS_LABEL[s]}</SelectItem>
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
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    Không có đơn hàng nào phù hợp
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs font-medium">{order.trackingNo}</TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{order.city}</TableCell>
                    <TableCell><OrderStatusBadge status={order.status} /></TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</TableCell>
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {filtered.length} đơn · Trang {page}/{totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
              Trước
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
