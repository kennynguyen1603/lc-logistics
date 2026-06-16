import type { OrderStatus } from "@/types"

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PACKED: "Đã đóng gói",
  IN_TRANSIT: "Đang vận chuyển",
  OUT_FOR_DELIVERY: "Đang giao",
  DELIVERED: "Đã giao",
  RETURNED: "Hoàn trả",
  CANCELLED: "Đã hủy",
}

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "bg-gray-100 text-gray-700 border-gray-200",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
  PACKED: "bg-indigo-100 text-indigo-700 border-indigo-200",
  IN_TRANSIT: "bg-yellow-100 text-yellow-700 border-yellow-200",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700 border-orange-200",
  DELIVERED: "bg-green-100 text-green-700 border-green-200",
  RETURNED: "bg-red-100 text-red-700 border-red-200",
  CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
}

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
]

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(date))
}
