"use client"

import { TrendingUp, Package, Truck, DollarSign, AlertTriangle } from "lucide-react"
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge"
import {
  mockDashboardSummary,
  mockOrdersByStatus,
  mockOrdersByDay,
  mockLowStockAlerts,
  mockOrders,
} from "@/lib/mock-data"
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

const KPI_CARDS = [
  { title: "Tổng đơn hàng", value: mockDashboardSummary.totalOrders, icon: Package, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
  { title: "Đang vận chuyển", value: mockDashboardSummary.inTransit, icon: Truck, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950" },
  { title: "Đã giao thành công", value: mockDashboardSummary.delivered, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950" },
  { title: "Doanh thu", value: formatCurrency(mockDashboardSummary.totalRevenue), icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
]

const recentOrders = mockOrders.slice(0, 5)

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ title, value, icon: Icon, color, bg }) => (
          <Card key={title}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{title}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
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
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Đơn theo trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={mockOrdersByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }) => percent ? `${Math.round(percent * 100)}%` : ""}
                  labelLine={false}
                >
                  {mockOrdersByStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#ccc"} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, ORDER_STATUS_LABEL[name as OrderStatus] ?? name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Đơn hàng 7 ngày qua</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={mockOrdersByDay} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="Số đơn" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low stock alerts */}
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
                {mockLowStockAlerts.map((alert, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-sm">{alert.product.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{alert.warehouse.name}</TableCell>
                    <TableCell className="text-right text-sm font-semibold text-orange-600">{alert.stock}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{alert.lowThreshold}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent orders */}
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
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.trackingNo}</TableCell>
                    <TableCell className="text-sm">{order.customerName}</TableCell>
                    <TableCell><OrderStatusBadge status={order.status} /></TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatCurrency(order.totalAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
