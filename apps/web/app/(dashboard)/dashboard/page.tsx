"use client"

import { useState } from "react"
import { TrendingUp, Package, Truck, DollarSign, AlertTriangle, Loader2 } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge"
import {
  useDashboardSummary,
  useOrdersByStatus,
  useOrdersByDay,
  useDashboardLowStock,
  useRecentOrders,
} from "@/hooks/useDashboard"
import { ORDER_STATUS_LABEL, formatCurrency, formatDate } from "@/lib/utils"
import type { OrderStatus } from "@/types"

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#9ca3af",
  CONFIRMED: "#3b82f6",
  PACKED: "#6366f1",
  IN_TRANSIT: "#eab308",
  OUT_FOR_DELIVERY: "#f97316",
  DELIVERED: "#22c55e",
  RETURNED: "#ef4444",
  CANCELLED: "#6b7280",
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<"today" | "week" | "month">("week")
  const [days, setDays] = useState(7)

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary(period)
  const { data: byStatus = [] } = useOrdersByStatus()
  const { data: byDay = [] } = useOrdersByDay(days)
  const { data: lowStock = [] } = useDashboardLowStock()
  const { data: recentOrders = [] } = useRecentOrders(10)

  const KPI_CARDS = [
    {
      title: "Tổng đơn hàng",
      value: summary?.totalOrders ?? "—",
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Đang vận chuyển",
      value: summary?.inTransit ?? "—",
      icon: Truck,
      color: "text-yellow-600",
      bg: "bg-yellow-50 dark:bg-yellow-950",
    },
    {
      title: "Đã giao thành công",
      value: summary?.delivered ?? "—",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Doanh thu",
      value: summary ? formatCurrency(summary.totalRevenue) : "—",
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hôm nay</SelectItem>
            <SelectItem value="week">Tuần này</SelectItem>
            <SelectItem value="month">Tháng này</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ title, value, icon: Icon, color, bg }) => (
          <Card key={title}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{title}</p>
                  {summaryLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mt-1" />
                  ) : (
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  )}
                </div>
                <div className={`p-2 rounded-lg ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Đơn theo trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={byStatus.filter((s) => s.count > 0)}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  labelLine={false}
                >
                  {byStatus
                    .filter((s) => s.count > 0)
                    .map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] ?? "#ccc"}
                      />
                    ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    ORDER_STATUS_LABEL[name as OrderStatus] ?? name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">
              {byStatus
                .filter((s) => s.count > 0)
                .map((entry) => (
                  <div key={entry.status} className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: STATUS_COLORS[entry.status] ?? "#ccc" }}
                    />
                    <span className="text-xs text-muted-foreground truncate">
                      {ORDER_STATUS_LABEL[entry.status as OrderStatus] ?? entry.status}
                    </span>
                    <span className="text-xs font-semibold ml-auto shrink-0">{entry.count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Đơn hàng theo ngày</CardTitle>
            <Select
              value={String(days)}
              onValueChange={(v) => setDays(Number(v))}
            >
              <SelectTrigger className="w-28 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 ngày</SelectItem>
                <SelectItem value="14">14 ngày</SelectItem>
                <SelectItem value="30">30 ngày</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="pb-2 pt-0">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart
                data={byDay}
                margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
                barCategoryGap="35%"
              >
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.85} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v: string) => v.slice(5)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.4, radius: 4 }}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 4px 12px rgba(0,0,0,.08)",
                  }}
                  formatter={(value, name) => [
                    value,
                    name === "count" ? "Số đơn" : "Doanh thu",
                  ]}
                  labelFormatter={(label) => formatDate(String(label))}
                />
                <Bar
                  dataKey="count"
                  fill="url(#barGrad)"
                  radius={[6, 6, 0, 0]}
                  name="count"
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Cảnh báo tồn kho thấp
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Kho</TableHead>
                  <TableHead className="text-right">Tồn kho</TableHead>
                  <TableHead className="text-right">Ngưỡng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStock.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-4 text-muted-foreground text-sm"
                    >
                      Không có cảnh báo
                    </TableCell>
                  </TableRow>
                ) : (
                  lowStock.map((alert, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-sm">
                        {alert.productName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {alert.warehouseName}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold text-orange-600">
                        {alert.currentStock}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {alert.threshold}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Đơn hàng gần đây</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã vận đơn</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Giá trị</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-4 text-muted-foreground text-sm"
                    >
                      Chưa có đơn hàng
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.trackingNo}</TableCell>
                      <TableCell className="text-sm">{order.customer.fullName}</TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
