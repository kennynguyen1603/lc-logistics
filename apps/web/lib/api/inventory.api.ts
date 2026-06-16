import { api } from "@/lib/api"
import type {
  IApiSuccess,
  IBulkAdjustDTO,
  IBulkAdjustResult,
  IInventory,
  IInventoryFilterQuery,
  ILowStockAlert,
  IPaginationMeta,
  IStockAdjustDTO,
  IStockMovement,
} from "@/types"

export async function getInventory(
  query?: Partial<IInventoryFilterQuery>
): Promise<{ data: IInventory[]; meta: IPaginationMeta }> {
  const res = await api.get<IApiSuccess<IInventory[]>>("/inventory", { params: query })
  return { data: res.data.data, meta: res.data.meta! }
}

export async function getInventoryByProduct(productId: string): Promise<IInventory[]> {
  const res = await api.get<IApiSuccess<IInventory[]>>(`/inventory/${productId}`)
  return res.data.data
}

export async function adjustStock(
  productId: string,
  warehouseId: string,
  dto: IStockAdjustDTO
): Promise<IInventory> {
  const res = await api.patch<IApiSuccess<IInventory>>(
    `/inventory/${productId}/warehouse/${warehouseId}`,
    dto
  )
  return res.data.data
}

export async function getLowStock(): Promise<ILowStockAlert[]> {
  const res = await api.get<IApiSuccess<ILowStockAlert[]>>("/inventory/low-stock")
  return res.data.data
}

export async function bulkAdjust(dto: IBulkAdjustDTO): Promise<IBulkAdjustResult> {
  const res = await api.post<IApiSuccess<IBulkAdjustResult>>("/inventory/bulk-adjust", dto)
  return res.data.data
}

export async function getMovements(query?: {
  page?: number
  limit?: number
  inventoryId?: string
}): Promise<{ data: IStockMovement[]; meta: IPaginationMeta }> {
  const res = await api.get<IApiSuccess<IStockMovement[]>>("/inventory/movements", {
    params: query,
  })
  return { data: res.data.data, meta: res.data.meta! }
}
