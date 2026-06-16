import type { IUser } from "./domain.types.js"
import type { OrderStatus, Role } from "./enums.js"

export interface IPaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface IApiSuccess<T> {
  success: true
  data: T
  meta?: IPaginationMeta
}

export interface IApiError {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export type ApiResponse<T> = IApiSuccess<T> | IApiError

// ============ AUTH ============

export interface ILoginDTO {
  email: string
  password: string
}

export interface IRegisterDTO {
  email: string
  password: string
  fullName: string
  phone?: string
}

export interface ILoginResponse {
  user: IUser
  expiresAt: string
}

export interface IJwtPayload {
  sub: string
  email: string
  role: Role
  iat: number
  exp: number
}

// ============ FILTER & PAGINATION ============

export interface IPaginationQuery {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface IOrderFilterQuery extends IPaginationQuery {
  status?: OrderStatus
  customerId?: string
  fromDate?: string
  toDate?: string
  search?: string
}

export interface IInventoryFilterQuery extends IPaginationQuery {
  warehouseId?: string
  categoryId?: string
  lowStockOnly?: boolean
}

// ============ DTOs ============

export interface IOrderCreateDTO {
  customerId: string
  shippingAddress: string
  notes?: string
  items: {
    productId: string
    quantity: number
    unitPrice: number
  }[]
}

export interface IOrderUpdateDTO {
  shippingAddress?: string
  notes?: string
}

export interface IDeliveryUpdateDTO {
  status: OrderStatus
  location?: string
  note?: string
}

export interface IStockAdjustDTO {
  quantity: number
  reason: string
  referenceNo?: string
}

export interface IBulkAdjustItem {
  productId: string
  warehouseId: string
  quantity: number
  reason: string
  referenceNo?: string
}

export interface IBulkAdjustDTO {
  adjustments: IBulkAdjustItem[]
}

export interface IBulkAdjustResult {
  succeeded: number
  failed: number
  errors: { index: number; message: string }[]
}

export interface IBulkDeliveryUpdateItem {
  orderId: string
  status: OrderStatus
  location?: string
  note?: string
}

export interface IBulkDeliveryUpdateDTO {
  updates: IBulkDeliveryUpdateItem[]
}

export interface IBulkDeliveryUpdateResult {
  succeeded: number
  failed: number
  errors: { orderId: string; message: string }[]
}

// ============ DASHBOARD ============

export interface IDashboardSummary {
  totalOrders: number
  inTransit: number
  delivered: number
  totalRevenue: number
  period: string
}

export interface IOrdersByStatus {
  status: OrderStatus
  count: number
  percentage: number
}

export interface IOrdersByDay {
  date: string
  count: number
  revenue: number
}

export interface ILowStockAlert {
  productId: string
  productName: string
  sku: string
  warehouseId: string
  warehouseName: string
  currentStock: number
  threshold: number
}
