export * from "./domain.types"

export interface IOrderFilterQuery {
  page?: number
  limit?: number
  status?: string
  search?: string
  fromDate?: string
  toDate?: string
}

export interface IDeliveryUpdateDTO {
  status: string
  location?: string
  note?: string
}

export interface IInventoryMatrixCell {
  productId: string
  warehouseId: string
  stock: number
  available: number
  isLowStock: boolean
}

export interface IInventoryMatrixData {
  products: import("./domain.types").IProduct[]
  warehouses: import("./domain.types").IWarehouse[]
  cells: Map<string, IInventoryMatrixCell>
}

export interface ITimelineItem {
  status: import("./domain.types").OrderStatus
  label: string
  timestamp?: Date
  location?: string
  note?: string
  isCompleted: boolean
  isCurrent: boolean
}

export interface IDashboardSummary {
  totalOrders: number
  inTransit: number
  delivered: number
  totalRevenue: number
}

export interface IOrdersByStatus {
  status: import("./domain.types").OrderStatus
  count: number
}

export interface IOrdersByDay {
  date: string
  count: number
}
