import { api } from "@/lib/api"
import type { IApiSuccess, IProduct, IPaginationMeta } from "@/types"

export async function getProducts(query?: {
  page?: number
  limit?: number
  search?: string
}): Promise<{ data: IProduct[]; meta: IPaginationMeta }> {
  const res = await api.get<IApiSuccess<IProduct[]>>("/products", { params: query })
  return { data: res.data.data, meta: res.data.meta! }
}
