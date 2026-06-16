import { api } from "@/lib/api"
import type {
  IApiSuccess,
  IBulkDeliveryUpdateDTO,
  IBulkDeliveryUpdateResult,
  IDelivery,
  IDeliveryUpdateDTO,
  IOrder,
} from "@/types"

export async function getDeliveryHistory(orderId: string): Promise<IDelivery[]> {
  const res = await api.get<IApiSuccess<IDelivery[]>>(`/delivery/${orderId}/history`)
  return res.data.data
}

export async function updateDeliveryStatus(
  orderId: string,
  dto: IDeliveryUpdateDTO
): Promise<IDelivery> {
  const res = await api.post<IApiSuccess<IDelivery>>(`/delivery/${orderId}`, dto)
  return res.data.data
}

export async function bulkUpdateDelivery(
  dto: IBulkDeliveryUpdateDTO
): Promise<IBulkDeliveryUpdateResult> {
  const res = await api.post<IApiSuccess<IBulkDeliveryUpdateResult>>(
    "/delivery/bulk-update",
    dto
  )
  return res.data.data
}

export async function getInTransit(): Promise<IOrder[]> {
  const res = await api.get<IApiSuccess<IOrder[]>>("/delivery/in-transit")
  return res.data.data
}
