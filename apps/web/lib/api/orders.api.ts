import { api } from "@/lib/api"
import type {
  IApiSuccess,
  IOrder,
  IOrderCreateDTO,
  IOrderFilterQuery,
  IOrderUpdateDTO,
  IPaginationMeta,
} from "@/types"

export async function getOrders(
  query?: Partial<IOrderFilterQuery>
): Promise<{ data: IOrder[]; meta: IPaginationMeta }> {
  const res = await api.get<IApiSuccess<IOrder[]>>("/orders", { params: query })
  return { data: res.data.data, meta: res.data.meta! }
}

export async function getOrderById(id: string): Promise<IOrder> {
  const res = await api.get<IApiSuccess<IOrder>>(`/orders/${id}`)
  return res.data.data
}

export async function trackOrder(trackingNo: string): Promise<IOrder> {
  const res = await api.get<IApiSuccess<IOrder>>(`/orders/track/${trackingNo}`)
  return res.data.data
}

export async function createOrder(dto: IOrderCreateDTO): Promise<IOrder> {
  const res = await api.post<IApiSuccess<IOrder>>("/orders", dto)
  return res.data.data
}

export async function updateOrder(
  id: string,
  dto: IOrderUpdateDTO
): Promise<IOrder> {
  const res = await api.patch<IApiSuccess<IOrder>>(`/orders/${id}`, dto)
  return res.data.data
}

export async function deleteOrder(id: string): Promise<void> {
  await api.delete(`/orders/${id}`)
}
