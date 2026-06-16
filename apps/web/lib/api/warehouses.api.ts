import { api } from "@/lib/api"
import type { IApiSuccess, IWarehouse } from "@/types"

export async function getWarehouses(): Promise<IWarehouse[]> {
  const res = await api.get<IApiSuccess<IWarehouse[]>>("/warehouses")
  return res.data.data
}
