"use client"

import { useQuery } from "@tanstack/react-query"
import * as dashboardApi from "@/lib/api/dashboard.api"

export function useDashboardSummary(period: "today" | "week" | "month" = "week") {
  return useQuery({
    queryKey: ["dashboard", "summary", period],
    queryFn: () => dashboardApi.getSummary(period),
    refetchInterval: 30_000,
  })
}

export function useOrdersByStatus() {
  return useQuery({
    queryKey: ["dashboard", "orders-by-status"],
    queryFn: () => dashboardApi.getOrdersByStatus(),
    refetchInterval: 30_000,
  })
}

export function useOrdersByDay(days = 7) {
  return useQuery({
    queryKey: ["dashboard", "orders-by-day", days],
    queryFn: () => dashboardApi.getOrdersByDay(days),
    refetchInterval: 30_000,
  })
}

export function useDashboardLowStock() {
  return useQuery({
    queryKey: ["dashboard", "low-stock"],
    queryFn: () => dashboardApi.getLowStockAlerts(),
    refetchInterval: 60_000,
  })
}

export function useRecentOrders(limit = 10) {
  return useQuery({
    queryKey: ["dashboard", "recent-orders", limit],
    queryFn: () => dashboardApi.getRecentOrders(limit),
    refetchInterval: 30_000,
  })
}
