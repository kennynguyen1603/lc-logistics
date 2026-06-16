import { api } from "@/lib/api"
import type {
  IApiSuccess,
  IDashboardSummary,
  ILowStockAlert,
  IOrder,
  IOrdersByDay,
  IOrdersByStatus,
} from "@/types"

export async function getSummary(
  period: "today" | "week" | "month" = "week"
): Promise<IDashboardSummary> {
  const res = await api.get<IApiSuccess<IDashboardSummary>>("/dashboard/summary", {
    params: { period },
  })
  return res.data.data
}

export async function getOrdersByStatus(): Promise<IOrdersByStatus[]> {
  const res = await api.get<IApiSuccess<IOrdersByStatus[]>>("/dashboard/orders-by-status")
  return res.data.data
}

export async function getOrdersByDay(days = 7): Promise<IOrdersByDay[]> {
  const res = await api.get<IApiSuccess<IOrdersByDay[]>>("/dashboard/orders-by-day", {
    params: { days },
  })
  return res.data.data
}

export async function getLowStockAlerts(): Promise<ILowStockAlert[]> {
  const res = await api.get<IApiSuccess<ILowStockAlert[]>>("/dashboard/low-stock")
  return res.data.data
}

export async function getRecentOrders(limit = 10): Promise<IOrder[]> {
  const res = await api.get<IApiSuccess<IOrder[]>>("/dashboard/recent-orders", {
    params: { limit },
  })
  return res.data.data
}
