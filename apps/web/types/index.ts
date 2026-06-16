export * from "./domain.types"

export type {
  IApiSuccess,
  IApiError,
  ApiResponse,
  IPaginationMeta,
  ILoginDTO,
  IRegisterDTO,
  ILoginResponse,
  IJwtPayload,
  IPaginationQuery,
  IOrderFilterQuery,
  IInventoryFilterQuery,
  IOrderCreateDTO,
  IOrderUpdateDTO,
  IDeliveryUpdateDTO,
  IStockAdjustDTO,
  IBulkAdjustItem,
  IBulkAdjustDTO,
  IBulkAdjustResult,
  IBulkDeliveryUpdateItem,
  IBulkDeliveryUpdateDTO,
  IBulkDeliveryUpdateResult,
  IDashboardSummary,
  IOrdersByStatus,
  IOrdersByDay,
  ILowStockAlert,
} from "@workspace/shared"

// FE-only helper types (not in shared)
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
  status: import("@workspace/shared").OrderStatus
  label: string
  timestamp?: Date
  location?: string
  note?: string
  isCompleted: boolean
  isCurrent: boolean
}
