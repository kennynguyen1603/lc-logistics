import type {
  IDashboardSummary,
  ILowStockAlert,
  IOrder,
  IOrdersByDay,
  IOrdersByStatus,
  OrderStatus,
} from "@workspace/shared"
import { prisma } from "../utils/prisma"

type Period = "today" | "week" | "month"

function getPeriodRange(period: Period): { gte: Date; lte: Date } {
  const now = new Date()
  const lte = new Date(now)
  const gte = new Date(now)

  if (period === "today") {
    gte.setHours(0, 0, 0, 0)
    lte.setHours(23, 59, 59, 999)
  } else if (period === "week") {
    gte.setDate(now.getDate() - 6)
    gte.setHours(0, 0, 0, 0)
  } else {
    gte.setDate(now.getDate() - 29)
    gte.setHours(0, 0, 0, 0)
  }
  return { gte, lte }
}

export async function getSummary(period: Period): Promise<IDashboardSummary> {
  const range = getPeriodRange(period)

  const [totalOrders, inTransit, delivered, revenueResult] =
    await prisma.$transaction([
      prisma.order.count({ where: { createdAt: range } }),
      prisma.order.count({
        where: { status: { in: ["IN_TRANSIT", "OUT_FOR_DELIVERY"] } },
      }),
      prisma.order.count({ where: { status: "DELIVERED", updatedAt: range } }),
      prisma.order.aggregate({
        where: { status: "DELIVERED", updatedAt: range },
        _sum: { totalAmount: true },
      }),
    ])

  return {
    totalOrders,
    inTransit,
    delivered,
    totalRevenue: revenueResult._sum.totalAmount ?? 0,
    period,
  }
}

export async function getOrdersByStatus(): Promise<IOrdersByStatus[]> {
  const groups = await prisma.order.groupBy({
    by: ["status"],
    _count: { id: true },
  })
  const total = groups.reduce((s, g) => s + g._count.id, 0)

  const ORDER: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "PACKED",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "RETURNED",
    "CANCELLED",
  ]
  return ORDER.map((status) => {
    const found = groups.find((g) => g.status === status)
    const count = found?._count.id ?? 0
    return {
      status,
      count,
      percentage: total ? Math.round((count / total) * 1000) / 10 : 0,
    }
  })
}

export async function getOrdersByDay(days: number): Promise<IOrdersByDay[]> {
  const result: IOrdersByDay[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const gte = new Date(date)
    gte.setHours(0, 0, 0, 0)
    const lte = new Date(date)
    lte.setHours(23, 59, 59, 999)

    const agg = await prisma.order.aggregate({
      where: { createdAt: { gte, lte } },
      _count: { id: true },
      _sum: { totalAmount: true },
    })

    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, "0")
    const dd = String(date.getDate()).padStart(2, "0")
    result.push({
      date: `${yyyy}-${mm}-${dd}`,
      count: agg._count.id,
      revenue: agg._sum.totalAmount ?? 0,
    })
  }

  return result
}

export async function getLowStockAlerts(): Promise<ILowStockAlert[]> {
  const records = await prisma.inventory.findMany({
    include: { product: true, warehouse: true },
    take: 500,
  })
  return records
    .filter((r) => r.stock <= r.lowThreshold)
    .sort((a, b) => a.stock / a.lowThreshold - b.stock / b.lowThreshold)
    .slice(0, 20)
    .map((r) => ({
      productId: r.productId,
      productName: r.product.name,
      sku: r.product.sku,
      warehouseId: r.warehouseId,
      warehouseName: r.warehouse.name,
      currentStock: r.stock,
      threshold: r.lowThreshold,
    }))
}

export async function getRecentOrders(
  limit: number
): Promise<Partial<IOrder>[]> {
  const orders = await prisma.order.findMany({
    take: Math.min(limit, 50),
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
  })

  return orders.map((o) => ({
    id: o.id,
    trackingNo: o.trackingNo,
    status: o.status,
    customer: {
      id: o.customer.id,
      fullName: o.customer.fullName,
      phone: o.customer.phone,
      email: o.customer.email,
    },
    totalAmount: o.totalAmount,
    currency: o.currency,
    shippingAddress: o.shippingAddress,
    items: o.items.map((i) => ({
      id: i.id,
      orderId: i.orderId,
      productId: i.productId,
      product: {
        id: i.product.id,
        sku: i.product.sku,
        name: i.product.name,
        unit: i.product.unit,
      },
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      subtotal: i.subtotal,
    })),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  }))
}
